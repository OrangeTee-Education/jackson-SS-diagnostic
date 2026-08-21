import type { Config } from "@netlify/functions";
import { getSupabaseClient, json } from "../lib/supabase";
import { getAccessCode, requireStudent } from "../lib/auth";

interface SubmittedAnswer {
  number: number;
  title: string;
  prompt: string;
  answerText: string;
}

export default async (req: Request) => {
  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Server misconfiguration." }, 500);
  }

  const code = getAccessCode(req);

  if (req.method === "GET") {
    const studentId = new URL(req.url).searchParams.get("studentId");
    if (!studentId) return json({ error: "Missing studentId." }, 400);

    const student = await requireStudent(supabase, studentId, code);
    if (!student) return json({ error: "Invalid access code." }, 403);

    const { data, error } = await supabase
      .from("sessions")
      .select("id, student_name, status, created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[sessions:GET]", error);
      return json({ error: error.message }, 500);
    }
    return json({ sessions: data });
  }

  if (req.method === "POST") {
    let body: { studentId?: string; answers?: SubmittedAnswer[] };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid request body." }, 400);
    }

    if (!body.studentId) return json({ error: "Missing studentId." }, 400);
    const student = await requireStudent(supabase, body.studentId, code);
    if (!student) return json({ error: "Invalid access code." }, 403);

    const answers = body.answers ?? [];
    if (answers.length !== 24) {
      return json({ error: "Expected 24 answers." }, 400);
    }

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({ student_id: student.id, student_name: student.name })
      .select("id")
      .single();

    if (sessionError || !session) {
      return json({ error: sessionError?.message ?? "Could not create session." }, 500);
    }

    const rows = answers.map((a) => ({
      session_id: session.id,
      question_number: a.number,
      question_title: a.title,
      question_prompt: a.prompt,
      answer_text: a.answerText ?? "",
    }));

    const { error: answersError } = await supabase.from("answers").insert(rows);
    if (answersError) {
      await supabase.from("sessions").delete().eq("id", session.id);
      return json({ error: answersError.message }, 500);
    }

    return json({ id: session.id });
  }

  return json({ error: "Method Not Allowed" }, 405);
};

export const config: Config = { path: "/api/sessions" };
