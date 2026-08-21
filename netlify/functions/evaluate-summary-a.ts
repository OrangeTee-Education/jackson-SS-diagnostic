import type { Config, Context } from "@netlify/functions";
import { getSupabaseClient, json } from "../lib/supabase";
import { getAccessCode, requireSessionOwner } from "../lib/auth";
import { callAnthropicTool } from "../lib/anthropic";
import { fetchGradedQuestions, formatGradedQuestions } from "../lib/gradedQuestions";
import { SYNTHESIS_PART_A_INSTRUCTIONS } from "../../shared/diagnostic";

const TOOL = {
  name: "submit_concept_map_and_domains",
  description: "Submit the concept map and domain-level interpretation.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["concept_map", "domain_interpretation"],
    properties: {
      concept_map: {
        type: "object",
        additionalProperties: false,
        required: ["secure", "partial", "misconceptions", "unknown", "insufficient_evidence"],
        properties: {
          secure: { type: "array", items: { type: "string" } },
          partial: { type: "array", items: { type: "string" } },
          misconceptions: { type: "array", items: { type: "string" } },
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

  const student = await requireSessionOwner(supabase, id, getAccessCode(req));
  if (!student) return json({ error: "Invalid access code." }, 403);

  try {
    const graded = await fetchGradedQuestions(supabase, id);
    const result = await callAnthropicTool({
      system: SYNTHESIS_PART_A_INSTRUCTIONS,
      userMessage: formatGradedQuestions(graded),
      tool: TOOL,
      maxTokens: 1800,
    });
    return json(result);
  } catch (err) {
    console.error("[evaluate-summary-a]", err);
    return json({ error: err instanceof Error ? err.message : "Evaluation failed." }, 502);
  }
};

export const config: Config = { path: "/api/sessions/:id/evaluate-summary-a" };
