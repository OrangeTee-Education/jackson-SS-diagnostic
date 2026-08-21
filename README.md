# OrangeTee Labs

The site root (`/`) is a landing page listing the diagnostic apps hosted
here; each app lives at its own path so the domain isn't monopolized by a
single diagnostic. Add future apps as additional routes in
[`src/App.tsx`](src/App.tsx) plus a card in
[`src/pages/Landing.tsx`](src/pages/Landing.tsx).

## Jackson Social Studies Diagnostic (`/social-studies`)

A small web app for administering the 24-question conceptual social studies
diagnostic and getting it evaluated automatically.

- **Frontend**: React + Vite, hosted on **Netlify**.
- **Backend**: Netlify Functions (serverless).
- **Database**: **Supabase** (Postgres) — stores sessions, raw answers, and
  evaluation reports.
- **Grading**: a Netlify Function calls the **Anthropic API** with the full
  rubric (`shared/diagnostic.ts`) and gets back a structured report.
- **Code hosting / CI**: **GitHub** — Netlify builds and deploys straight
  from the repo on every push.

The rubric — the exact scoring criteria for each question, and the
instructions for the five closing outputs — lives in
[`shared/diagnostic.ts`](shared/diagnostic.ts). Edit that file if you want to
change how grading works; nothing else needs to change.

One thing worth knowing up front: getting real S/P/M/U grading requires
calling an LLM, so this app also needs an **Anthropic API key**. Usage is
tiny (one call per evaluation run) — a few cents at most per diagnostic.

## Setup

### 1. Supabase (database)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   This creates `sessions`, `answers`, and `reports` tables with row-level
   security enabled and no public policies — only server-side requests using
   the service role key can touch them.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (not the `anon` key) → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Anthropic API key

1. Create a key at [console.anthropic.com](https://console.anthropic.com) →
   **API Keys**.
2. Copy it → `ANTHROPIC_API_KEY`.

### 3. GitHub (code hosting)

1. Create a new empty repository on GitHub (don't initialize it with a
   README).
2. From this folder:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

### 4. Netlify (hosting + functions)

1. In the Netlify dashboard: **Add new site → Import an existing project →**
   pick your GitHub repo.
2. Build settings should be auto-detected from `netlify.toml`
   (`npm run build`, publish directory `dist`). Confirm and deploy.
3. Go to **Site configuration → Environment variables** and add:
   | Key | Value |
   |---|---|
   | `SUPABASE_URL` | from step 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from step 1 |
   | `ANTHROPIC_API_KEY` | from step 2 |
   | `ANTHROPIC_MODEL` | `claude-sonnet-5` (optional, this is the default) |
4. Trigger a redeploy so the functions pick up the new environment variables
   (**Deploys → Trigger deploy**).
5. Open the site URL — there's no login. It lands on the OrangeTee Labs
   landing page; open the Social Studies Diagnostic from there.

## Local development

```bash
npm install
cp .env.example .env   # fill in real values
npm run dev             # runs `netlify dev`: Vite + functions together
```

This serves the frontend and functions together (with the same `/api/...`
routes as production) at `http://localhost:8888`.

## How it works

1. **Administer** (`/social-studies/new`) walks through the 24 questions and
   collects Jackson's answers verbatim.
2. On submit, the answers are saved to Supabase (`sessions` + `answers`
   tables), then the app calls the `evaluate` function.
3. `evaluate` pulls the 24 answers, sends them to the Anthropic API with the
   full rubric as the system prompt, and forces a structured JSON response
   (via tool use) matching the five required outputs plus a per-question
   breakdown. The result is saved to the `reports` table.
4. **Results** (`/social-studies/sessions/:id`) renders the five outputs
   (Concept Map, Domain-Level Interpretation, Most Important
   Misconceptions, Adaptive Follow-Up Probes, Instructional Implications)
   plus a per-question detail table and the raw transcript. You can re-run
   the evaluation at any time (e.g. after editing the rubric) with
   **Re-run evaluation**.
5. **App home** (`/social-studies`) lists all past sessions so you can
   revisit earlier runs — useful for tracking Jackson's progress over
   multiple diagnostics.

## Security notes

- **There is no login.** The site URL is unlisted but public — anyone with
  the link can view or add diagnostic sessions. This was a deliberate
  tradeoff for convenience over an earlier passcode gate; revisit if that
  stops being an acceptable tradeoff (e.g. add Netlify's built-in Password
  Protection, or reinstate an app-level passcode).
- The Supabase service role key and Anthropic API key are only ever used
  inside Netlify Functions (server-side); the browser never sees them.
- Supabase tables have RLS enabled with zero public policies, so even if the
  `anon`/publishable key ever leaked, it couldn't read or write anything.
