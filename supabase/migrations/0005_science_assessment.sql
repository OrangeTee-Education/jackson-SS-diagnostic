-- Fold the (empty) Science Assessment project's schema into this project,
-- so both diagnostics share one Supabase project instead of each consuming
-- a separate active-project slot on the free tier. Schema copied verbatim
-- from the standalone Science Assessment project (no data to migrate — it
-- had zero rows in both tables). Same access model as the rest of this
-- project: RLS enabled, no policies, service_role only (already granted
-- project-wide via 0002_grants.sql's `alter default privileges`).

create table if not exists public.diagnostic_sessions (
  id uuid primary key default gen_random_uuid(),
  student text not null default 'Jackson',
  date_administered date,
  evaluator text,
  responses jsonb not null default '{}'::jsonb,
  review jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  diagnostic_id text not null default 'diagnostic-1'
);

create table if not exists public.lesson_feedback (
  id uuid primary key default gen_random_uuid(),
  curriculum text not null,
  lesson_code text not null,
  comment text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.diagnostic_sessions enable row level security;
alter table public.lesson_feedback enable row level security;
