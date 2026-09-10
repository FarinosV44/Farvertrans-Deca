-- ===========================================================================
-- RLS lockdown of the `public` schema
-- Remediates Supabase Security Advisor: rls_disabled_in_public
--                                       sensitive_columns_exposed
--
-- CONTEXT
--   This application accesses the database ONLY through Prisma, connecting as
--   the `postgres` role, which has rolbypassrls = true on BOTH the runtime
--   pooler (:6543) and the migration pooler (:5432) — verified 2026-09-10.
--   The Supabase JS client is used ONLY for Storage (the private PDF bucket,
--   service_role). No code path uses PostgREST (`anon` / `authenticated`) for
--   any application table.
--
--   Therefore the correct posture for `public` is: PostgREST cannot touch it.
--   This migration REVOKES the PostgREST role grants and ENABLES row level
--   security with NO policies (RLS-on + zero-policy = deny-all for every role
--   that does not bypass RLS). Prisma (`postgres`, BYPASSRLS) is unaffected.
--
-- PORTABILITY
--   The `anon` / `authenticated` roles only exist on a Supabase cluster. The
--   REVOKE / ALTER DEFAULT PRIVILEGES statements are guarded so this migration
--   also applies cleanly on a plain PostgreSQL (CI, local `db:up`), where there
--   is simply nothing to revoke. RLS is enabled unconditionally (harmless and
--   desirable everywhere; a no-op if already enabled).
--
-- SAFETY
--   Non-destructive. Only privilege / RLS-flag / default-privilege metadata
--   changes. No DDL that creates, drops, renames or alters a table's columns.
--   No DML. No data is read, modified or deleted.
--   `service_role` grants are deliberately LEFT INTACT (phase 2 hardening).
--   `USAGE ON SCHEMA public` is deliberately NOT revoked (phase 2 hardening).
--
-- ROLLBACK
--   See migration.rollback.sql in this folder (not executed by Prisma).
-- ===========================================================================

-- 1 + 2. Revoke PostgREST-role privileges + fix the Supabase default that
--        auto-grants every future `postgres`-created object. Guarded: only runs
--        where the Supabase roles exist.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN

    EXECUTE 'REVOKE ALL PRIVILEGES ON ALL TABLES    IN SCHEMA "public" FROM "anon", "authenticated"';
    EXECUTE 'REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "public" FROM "anon", "authenticated"';
    EXECUTE 'REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "public" FROM "anon", "authenticated"';

    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES    FROM "anon", "authenticated"';
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "anon", "authenticated"';
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "anon", "authenticated"';

  END IF;
END $$;

-- 3. Enable row level security on every base table in `public`. No policies
--    are created, so no non-BYPASSRLS role can read or write any row.
--    (ENABLE ROW LEVEL SECURITY on an already-enabled table is a harmless no-op,
--     so this migration is safe to re-run.)
ALTER TABLE "public"."_prisma_migrations"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."abuse_counter"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."acquisition"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."admin_recovery_code"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."claim_token"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."commercial_activity_log"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."commercial_alert"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."commercial_alert_config"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."commercial_consent"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."commercial_consent_event"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."commercial_opportunity"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."company"                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."company_invite"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."content_item"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."deca"                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."deca_access_log"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."deca_availability_share"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."deca_draft"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."deca_route_intel"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."deca_template"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."deca_version"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."email_verification_token"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."event"                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."favorite_route"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."generation_failure"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."integration_request"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."membership"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."operator"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."password_reset_token"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."prospect"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."saved_company"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."saved_history_view"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."saved_location"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."saved_vehicle"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."security_audit_log"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."support_ticket"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."support_ticket_message"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."terms_acceptance"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."trusted_device"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user"                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."webauthn_credential"       ENABLE ROW LEVEL SECURITY;
