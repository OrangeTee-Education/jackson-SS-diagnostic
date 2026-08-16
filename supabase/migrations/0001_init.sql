-- Jackson Social Studies Diagnostic — schema
-- All access to these tables goes through Netlify Functions using the
-- Supabase service role key. RLS is enabled with no policies, so the
-- anon/public key (if ever exposed to the browser) cannot read or write
-- anything here.

create extension if not exists "pgcrypto";

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  student_name text not null default 'Jackson',
  status text not null default 'in_progress' check (status in ('in_progress', 'evaluated')),
  created_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  question_number int not null check (question_number between 1 and 24),
  question_title text not null,
  question_prompt text not null,
  answer_text text not null,
  created_at timestamptz not null default now(),
  unique (session_id, question_number)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.sessions(id) on delete cascade,
  model text not null,
  report_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists answers_session_id_idx on public.answers(session_id);

alter table public.sessions enable row level security;
alter table public.answers enable row level security;
alter table public.reports enable row level security;

-- No policies are created: only requests using the service role key
-- (server-side, inside Netlify Functions) can read or write these tables.
