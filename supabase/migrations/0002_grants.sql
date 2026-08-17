-- service_role should already have full access to everything in `public`
-- by default in a Supabase project, but this project's setup skipped that
-- (surfaced as "permission denied for table sessions" from the Netlify
-- Functions, which authenticate as service_role). Grant explicitly, and
-- make sure any future tables get the same treatment automatically.

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
