-- Per-student access codes. Each student gets a short code; only someone
-- with that code can see or add to that student's sessions. This replaces
-- the previous "anyone with the site URL sees every student's data" model.

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  access_code text not null unique,
  created_at timestamptz not null default now()
);

alter table public.sessions add column if not exists student_id uuid references public.students(id);

-- Backfill: one student row per distinct existing student_name, with a
-- freshly generated code, then link existing sessions to it.
insert into public.students (name, access_code)
select distinct student_name, upper(encode(gen_random_bytes(4), 'hex'))
from public.sessions
where student_name is not null
on conflict do nothing;

update public.sessions s
set student_id = st.id
from public.students st
where st.name = s.student_name and s.student_id is null;

alter table public.sessions alter column student_id set not null;

create index if not exists sessions_student_id_idx on public.sessions(student_id);

alter table public.students enable row level security;

grant all on public.students to service_role;
