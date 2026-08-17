import type { Config, Context } from "@netlify/functions";
import { getSupabaseClient, json } from "../lib/supabase";

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") return json({ error: "Method Not Allowed" }, 405);

  const id = context.params.id;
  if (!id) return json({ error: "Missing session id." }, 400);

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Server misconfiguration." }, 500);
  }

  const [sessionRes, answersRes, reportRes] = await Promise.all([
    supabase.from("sessions").select("*").eq("id", id).single(),
    supabase.from("answers").select("*").eq("session_id", id).order("question_number", { ascending: true }),
    supabase.from("reports").select("*").eq("session_id", id).maybeSingle(),
  ]);

  if (sessionRes.error) return json({ error: sessionRes.error.message }, 404);
  if (answersRes.error) return json({ error: answersRes.error.message }, 500);
  if (reportRes.error) return json({ error: reportRes.error.message }, 500);

  return json({ session: sessionRes.data, answers: answersRes.data, report: reportRes.data ?? null });
};

export const config: Config = { path: "/api/sessions/:id" };
