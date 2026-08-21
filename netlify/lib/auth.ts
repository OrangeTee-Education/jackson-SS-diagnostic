import type { SupabaseClient } from "@supabase/supabase-js";

export interface AuthedStudent {
  id: string;
  name: string;
}

export function getAccessCode(req: Request): string | null {
  const header = req.headers.get("x-access-code");
  if (header && header.trim()) return header.trim().toUpperCase();
  const code = new URL(req.url).searchParams.get("code");
  return code && code.trim() ? code.trim().toUpperCase() : null;
}

export async function requireStudent(
  supabase: SupabaseClient,
  studentId: string,
  code: string | null
): Promise<AuthedStudent | null> {
  if (!code) return null;
  const { data } = await supabase
    .from("students")
    .select("id, name")
    .eq("id", studentId)
    .eq("access_code", code)
    .maybeSingle();
  return data ?? null;
}

export async function requireSessionOwner(
  supabase: SupabaseClient,
  sessionId: string,
  code: string | null
): Promise<AuthedStudent | null> {
  if (!code) return null;
  const { data: session } = await supabase
    .from("sessions")
    .select("student_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session?.student_id) return null;
  return requireStudent(supabase, session.student_id, code);
}
