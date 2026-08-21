import type { Config, Context } from "@netlify/functions";
import { getSupabaseClient, json } from "../lib/supabase";
import { getAccessCode, requireSessionOwner } from "../lib/auth";
import { callAnthropicTool } from "../lib/anthropic";
import { GENERAL_INSTRUCTIONS, QUESTION_RUBRICS } from "../../shared/diagnostic";

const BATCH_TOOL = {
  name: "submit_question_evaluations",
  description: "Submit S/P/M/U classifications for the given questions.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["evaluations"],
    properties: {
      evaluations: {
        type: "array",
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
            summary: { type: "string", description: "One sentence: what this answer tells us." },
            concepts_evidenced: { type: "array", items: { type: "string" } },
            misconception_detail: { type: ["string", "null"] },
            follow_up_warranted: { type: "boolean" },
          },
        },
      },
    },
  },
};

interface AnswerRow {
  question_number: number;
  question_title: string;
  answer_text: string;
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const id = context.params.id;
  if (!id) return json({ error: "Missing session id." }, 400);

  let body: { questionNumbers?: number[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  const questionNumbers = body.questionNumbers ?? [];
  if (questionNumbers.length === 0) return json({ error: "questionNumbers is required." }, 400);

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Server misconfiguration." }, 500);
  }

  const student = await requireSessionOwner(supabase, id, getAccessCode(req));
  if (!student) return json({ error: "Invalid access code." }, 403);

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("question_number, question_title, answer_text")
    .eq("session_id", id)
    .in("question_number", questionNumbers)
    .order("question_number", { ascending: true });

  if (answersError) return json({ error: answersError.message }, 500);
  if (!answers || answers.length !== questionNumbers.length) {
    return json({ error: "Could not find all requested answers for this session." }, 400);
  }

  const system = `${GENERAL_INSTRUCTIONS}\n\nScoring guidance for the question(s) below:\n\n${questionNumbers
    .map((n) => QUESTION_RUBRICS[n])
    .join("\n\n")}`;

  const userMessage = (answers as AnswerRow[])
    .map(
      (a) =>
        `Question ${a.question_number} — ${a.question_title}\n\nStudent's answer: ${
          a.answer_text?.trim() || "(no answer given)"
        }`
    )
    .join("\n\n---\n\n");

  let result: { evaluations: Array<Record<string, unknown>> };
  try {
    result = (await callAnthropicTool({
      system,
      userMessage,
      tool: BATCH_TOOL,
      maxTokens: 1200,
    })) as { evaluations: Array<Record<string, unknown>> };
  } catch (err) {
    console.error(`[evaluate-batch] questions ${questionNumbers.join(",")}`, err);
    return json({ error: err instanceof Error ? err.message : "Evaluation failed." }, 502);
  }

  const rows = result.evaluations.map((e) => ({
    session_id: id,
    question_number: e.question_number,
    classification: e.classification,
    summary: e.summary,
    concepts_evidenced: e.concepts_evidenced ?? [],
    misconception_detail: e.misconception_detail ?? null,
    follow_up_warranted: Boolean(e.follow_up_warranted),
  }));

  const { data: saved, error: saveError } = await supabase
    .from("question_evaluations")
    .upsert(rows, { onConflict: "session_id,question_number" })
    .select("*");

  if (saveError) return json({ error: saveError.message }, 500);

  return json({ evaluations: saved });
};

export const config: Config = { path: "/api/sessions/:id/evaluate-batch" };
