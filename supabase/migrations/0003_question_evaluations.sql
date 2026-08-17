-- Stores per-question grading results as they come in from evaluate-batch,
-- so the final evaluate-summary call can work from already-graded compact
-- data instead of re-deriving everything (and re-sending the full rubric)
-- in one huge call.

create table if not exists public.question_evaluations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  question_number int not null check (question_number between 1 and 24),
  classification text not null check (classification in ('S', 'P', 'M', 'U')),
  summary text not null,
  concepts_evidenced jsonb not null default '[]'::jsonb,
  misconception_detail text,
  follow_up_warranted boolean not null default false,
  created_at timestamptz not null default now(),
  unique (session_id, question_number)
);

create index if not exists question_evaluations_session_id_idx on public.question_evaluations(session_id);

alter table public.question_evaluations enable row level security;

grant all on public.question_evaluations to service_role;
