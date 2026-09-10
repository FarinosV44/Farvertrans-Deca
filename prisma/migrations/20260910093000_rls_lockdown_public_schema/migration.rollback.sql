-- ===========================================================================
-- ROLLBACK for 20260910093000_rls_lockdown_public_schema
--
-- Not executed by Prisma. Run manually (Supabase SQL Editor, as `postgres`)
-- ONLY if the lockdown must be reverted. Restores the Supabase defaults.
-- Non-destructive: no data is touched.
-- ===========================================================================

-- 3'. Disable RLS again on every base table in `public`.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.relname
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r','p')
  LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', r.relname);
  END LOOP;
END $$;

-- 2'. Restore the Supabase default privileges for role `postgres` in `public`.
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
  GRANT ALL ON TABLES    TO "anon", "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
  GRANT ALL ON SEQUENCES TO "anon", "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
  GRANT ALL ON FUNCTIONS TO "anon", "authenticated";

-- 1'. Re-grant on everything currently in `public`.
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA "public" TO "anon", "authenticated";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "public" TO "anon", "authenticated";
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "public" TO "anon", "authenticated";
