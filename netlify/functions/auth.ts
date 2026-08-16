import type { Config } from "@netlify/functions";
import { issueToken } from "../lib/auth";
import { json } from "../lib/supabase";

export default async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const secret = process.env.APP_SECRET;
  const passcode = process.env.APP_PASSCODE;
  if (!secret || !passcode) {
    return json({ error: "Server is not configured (missing APP_SECRET or APP_PASSCODE)." }, 500);
  }

  let body: { passcode?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  if (!body.passcode || body.passcode !== passcode) {
    return json({ error: "Incorrect passcode." }, 401);
  }

  return json({ token: issueToken(secret) });
};

export const config: Config = { path: "/api/auth" };
