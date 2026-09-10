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

-- 2' + 1'. Restore the Supabase default privileges + re-grant on everything
--          currently in `public`. Guarded: only where the Supabase roles exist.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN

    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES    TO "anon", "authenticated"';
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon", "authenticated"';
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon", "authenticated"';

    EXECUTE 'GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA "public" TO "anon", "authenticated"';
    EXECUTE 'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "public" TO "anon", "authenticated"';
    EXECUTE 'GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "public" TO "anon", "authenticated"';

  END IF;
END $$;
