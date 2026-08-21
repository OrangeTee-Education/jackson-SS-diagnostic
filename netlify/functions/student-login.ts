import type { Config } from "@netlify/functions";
import { getSupabaseClient, json } from "../lib/supabase";

export default async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const code = body.code?.trim().toUpperCase();
  if (!code) return json({ error: "Access code is required." }, 400);

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Server misconfiguration." }, 500);
  }

  const { data, error } = await supabase.from("students").select("id, name").eq("access_code", code).maybeSingle();

  if (error) return json({ error: error.message }, 500);
  if (!data) return json({ error: "That access code wasn't found." }, 404);

  return json({ student: data, code });
};

export const config: Config = { path: "/api/student-login" };
