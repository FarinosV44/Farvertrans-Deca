-- Data backfill: brand rename "DeCA Fácil" -> "DeCA Profesional" (D-081).
-- The source seed (prisma/content-seed.ts) was fixed to stop writing the
-- stale name, but seedContent() is idempotent and skips existing slugs, so
-- rows already created in any environment before this fix keep the old
-- byline until backfilled here.
UPDATE "content_item"
SET "author_name" = 'Equipo DeCA Profesional'
WHERE "author_name" = 'Equipo DeCA Fácil';
