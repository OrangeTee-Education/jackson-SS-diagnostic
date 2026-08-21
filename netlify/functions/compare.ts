import type { Config } from "@netlify/functions";
import { getSupabaseClient, json } from "../lib/supabase";
import { getAccessCode, requireStudent } from "../lib/auth";
import { QUESTIONS } from "../../shared/diagnostic";

interface ComparisonSession {
  id: string;
  created_at: string;
  status: string;
}

interface ComparisonCell {
  session_id: string;
  classification: "S" | "P" | "M" | "U";
  summary: string;
}

interface ComparisonRow {
  question_number: number;
  question_title: string;
  cells: Array<ComparisonCell | null>;
}

export default async (req: Request) => {
  if (req.method !== "GET") return json({ error: "Method Not Allowed" }, 405);

  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId")?.trim();
  if (!studentId) return json({ error: "Missing studentId query parameter." }, 400);

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Server misconfiguration." }, 500);
  }

  const student = await requireStudent(supabase, studentId, getAccessCode(req));
  if (!student) return json({ error: "Invalid access code." }, 403);

  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("id, created_at, status")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });

  if (sessionsError) return json({ error: sessionsError.message }, 500);

  const sessionList = (sessions ?? []) as ComparisonSession[];
  if (sessionList.length === 0) {
    return json({ student: student.name, sessions: [], rows: [] });
  }

  const sessionIds = sessionList.map((s) => s.id);
  const { data: evaluations, error: evaluationsError } = await supabase
    .from("question_evaluations")
    .select("session_id, question_number, classification, summary")
    .in("session_id", sessionIds);

  if (evaluationsError) return json({ error: evaluationsError.message }, 500);

  const bySessionAndQuestion = new Map<string, ComparisonCell>();
  for (const e of evaluations ?? []) {
    bySessionAndQuestion.set(`${e.session_id}:${e.question_number}`, {
      session_id: e.session_id,
      classification: e.classification,
      summary: e.summary,
    });
  }

  const rows: ComparisonRow[] = QUESTIONS.map((q) => ({
    question_number: q.number,
    question_title: q.title,
    cells: sessionList.map((s) => bySessionAndQuestion.get(`${s.id}:${q.number}`) ?? null),
  }));

  return json({ student: student.name, sessions: sessionList, rows });
};

export const config: Config = { path: "/api/compare" };
