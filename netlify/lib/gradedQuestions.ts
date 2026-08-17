import type { SupabaseClient } from "@supabase/supabase-js";

export interface GradedQuestionRow {
  question_number: number;
  classification: "S" | "P" | "M" | "U";
  summary: string;
  concepts_evidenced: string[];
  misconception_detail: string | null;
  follow_up_warranted: boolean;
}

export async function fetchGradedQuestions(
  supabase: SupabaseClient,
  sessionId: string
): Promise<GradedQuestionRow[]> {
  const { data, error } = await supabase
    .from("question_evaluations")
    .select("question_number, classification, summary, concepts_evidenced, misconception_detail, follow_up_warranted")
    .eq("session_id", sessionId)
    .order("question_number", { ascending: true });

  if (error) throw new Error(error.message);
  if (!data || data.length !== 24) {
    throw new Error("Not all 24 questions have been graded yet.");
  }
  return data as GradedQuestionRow[];
}

export function formatGradedQuestions(rows: GradedQuestionRow[]): string {
  return rows
    .map(
      (r) =>
        `Q${r.question_number}: ${r.classification} — ${r.summary} (concepts: ${(r.concepts_evidenced ?? []).join(
          ", "
        )}${r.misconception_detail ? `; misconception: ${r.misconception_detail}` : ""})`
    )
    .join("\n");
}
