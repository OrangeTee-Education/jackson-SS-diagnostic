const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// Hardcoded rather than reading ANTHROPIC_MODEL: Netlify's free-plan
// functions hard-timeout at 10 seconds, and every call in this pipeline is
// sized (batch counts, max_tokens) around Haiku's throughput to reliably
// finish in time. Swapping in a slower model here would silently
// reintroduce the 504s this whole batching design exists to avoid.
const MODEL = "claude-haiku-4-5-20251001";

interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export async function callAnthropicTool(params: {
  system: string;
  userMessage: string;
  tool: ToolDefinition;
  maxTokens?: number;
}): Promise<unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY environment variable.");

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: params.maxTokens ?? 1500,
      system: params.system,
      messages: [{ role: "user", content: params.userMessage }],
      tools: [params.tool],
      tool_choice: { type: "tool", name: params.tool.name },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { content: Array<{ type: string; input?: unknown }> };
  const toolUse = data.content.find((block) => block.type === "tool_use");
  if (!toolUse) throw new Error("Model did not return a structured result.");
  return toolUse.input;
}
