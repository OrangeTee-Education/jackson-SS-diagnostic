import type { Config, Context } from "@netlify/functions";
import { getSupabaseClient, json } from "../lib/supabase";
import { RUBRIC_SYSTEM_PROMPT } from "../../shared/diagnostic";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5";

const REPORT_TOOL = {
  name: "submit_diagnostic_report",
  description:
    "Submit the completed evaluation of Jackson's 24 diagnostic answers: a per-question classification plus the five synthesized outputs.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "per_question",
      "concept_map",
      "domain_interpretation",
      "top_misconceptions",
      "followup_probes",
      "instructional_implications",
    ],
    properties: {
      per_question: {
        type: "array",
        minItems: 24,
        maxItems: 24,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "question_number",
            "classification",
            "summary",
            "concepts_evidenced",
            "misconception_detail",
            "follow_up_warranted",
          ],
          properties: {
            question_number: { type: "integer", minimum: 1, maximum: 24 },
            classification: { type: "string", enum: ["S", "P", "M", "U"] },
            summary: { type: "string", description: "What this answer tells us." },
            concepts_evidenced: { type: "array", items: { type: "string" } },
            misconception_detail: { type: ["string", "null"] },
            follow_up_warranted: { type: "boolean" },
          },
        },
      },
      concept_map: {
        type: "object",
        additionalProperties: false,
        required: ["secure", "partial", "misconceptions", "unknown", "insufficient_evidence"],
        properties: {
          secure: { type: "array", items: { type: "string" } },
          partial: { type: "array", items: { type: "string" } },
          misconceptions: {
            type: "array",
            items: { type: "string" },
            description: "Each entry must name the concept and specifically describe the incorrect model, e.g. 'Separation of powers — M: ...'.",
          },
          unknown: { type: "array", items: { type: "string" } },
          insufficient_evidence: { type: "array", items: { type: "string" } },
        },
      },
      domain_interpretation: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["domain", "summary"],
          properties: {
            domain: { type: "string" },
            summary: { type: "string" },
          },
        },
      },
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

async function callAnthropic(transcript: string): Promise<unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      system: RUBRIC_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:
            "Here are Jackson's answers to the 24 diagnostic questions, in order. Evaluate them and submit the report.\n\n" +
            transcript,
        },
      ],
      tools: [REPORT_TOOL],
      tool_choice: { type: "tool", name: REPORT_TOOL.name },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; input?: unknown }>;
  };
  const toolUse = data.content.find((block) => block.type === "tool_use");
  if (!toolUse) throw new Error("Model did not return a structured report.");
  return toolUse.input;
}

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

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("*")
    .eq("session_id", id)
    .order("question_number", { ascending: true });

  if (answersError) return json({ error: answersError.message }, 500);
  if (!answers || answers.length !== 24) {
    return json({ error: "This session does not have all 24 answers recorded yet." }, 400);
  }

  const transcript = answers
    .map(
      (a) =>
        `Question ${a.question_number} — ${a.question_title}\n${a.question_prompt}\n\nJackson's answer: ${
          a.answer_text?.trim() || "(no answer given)"
        }`
    )
    .join("\n\n---\n\n");

  let report: unknown;
  try {
    report = await callAnthropic(transcript);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Evaluation failed." }, 502);
  }

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const { data: savedReport, error: saveError } = await supabase
    .from("reports")
    .upsert({ session_id: id, model, report_json: report }, { onConflict: "session_id" })
    .select("*")
    .single();

  if (saveError) return json({ error: saveError.message }, 500);

  await supabase.from("sessions").update({ status: "evaluated" }).eq("id", id);

  return json({ report: savedReport });
};

export const config: Config = { path: "/api/sessions/:id/evaluate" };
