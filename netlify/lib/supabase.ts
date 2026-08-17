import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }

  console.log(
    `[supabase] url length=${url.length} startsHttps=${url.startsWith("https://")} value="${url}"`
  );
  console.log(`[supabase] key length=${key.length} prefix="${key.slice(0, 10)}"`);

  try {
    new URL(url);
  } catch {
    throw new Error(`SUPABASE_URL is not a valid URL: "${url}"`);
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
