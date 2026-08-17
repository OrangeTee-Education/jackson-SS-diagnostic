import type { Config, Context } from "@netlify/functions";
import { getSupabaseClient, json } from "../lib/supabase";
import { callAnthropicTool } from "../lib/anthropic";
import { fetchGradedQuestions, formatGradedQuestions } from "../lib/gradedQuestions";
import { SYNTHESIS_PART_B_INSTRUCTIONS } from "../../shared/diagnostic";

const TOOL = {
  name: "submit_misconceptions_and_plan",
  description: "Submit ranked misconceptions, follow-up probes, and instructional implications.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["top_misconceptions", "followup_probes", "instructional_implications"],
    properties: {
      top_misconceptions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["rank", "concept", "description", "why_important"],
          properties: {
            rank: { type: "integer", minimum: 1 },
            concept: { type: "string" },
            description: { type: "string" },
            why_important: { type: "string" },
          },
        },
      },
      followup_probes: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["domain", "question", "purpose"],
          properties: {
            domain: { type: "string" },
            question: { type: "string" },
            purpose: { type: "string" },
          },
        },
      },
      instructional_implications: {
        type: "object",
        additionalProperties: false,
        required: [
          "prerequisites_first",
          "little_or_no_instruction_needed",
          "misconceptions_to_reconstruct",
          "needs_further_probing_before_deciding",
        ],
        properties: {
          prerequisites_first: { type: "array", items: { type: "string" } },
          little_or_no_instruction_needed: { type: "array", items: { type: "string" } },
          misconceptions_to_reconstruct: { type: "array", items: { type: "string" } },
          needs_further_probing_before_deciding: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const id = context.params.id;
  if (!id) return json({ error: "Missing session id." }, 400);

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Server misconfiguration." }, 500);
  }

  try {
    const graded = await fetchGradedQuestions(supabase, id);
    const result = await callAnthropicTool({
      system: SYNTHESIS_PART_B_INSTRUCTIONS,
      userMessage: formatGradedQuestions(graded),
      tool: TOOL,
      maxTokens: 1800,
    });
    return json(result);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Evaluation failed." }, 502);
  }
};

export const config: Config = { path: "/api/sessions/:id/evaluate-summary-b" };
