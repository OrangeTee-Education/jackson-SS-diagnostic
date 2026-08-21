import type { Config } from "@netlify/functions";
import { getSupabaseClient, json } from "../lib/supabase";

// Excludes 0/O/1/I/L to avoid ambiguous codes when read aloud or handwritten.
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateAccessCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export default async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const name = body.name?.trim();
  if (!name) return json({ error: "Student name is required." }, 400);

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Server misconfiguration." }, 500);
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const accessCode = generateAccessCode();
    const { data, error } = await supabase
      .from("students")
      .insert({ name, access_code: accessCode })
      .select("id, name, access_code")
      .single();

    if (!error) return json({ student: data });
    if (!error.message.includes("duplicate key")) return json({ error: error.message }, 500);
  }

  return json({ error: "Could not generate a unique access code. Please try again." }, 500);
};

export const config: Config = { path: "/api/students" };
