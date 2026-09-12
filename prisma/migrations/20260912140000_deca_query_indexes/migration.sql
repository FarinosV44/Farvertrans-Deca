-- #130 (audit finding): the `deca` table had zero secondary indexes despite
-- every hot-path query filtering/sorting on exactly these columns —
-- Historial (`lib/data/history.ts`, company_id + created_at desc, capped at
-- 500), the admin cross-tenant company list's per-company latest-DeCA
-- subquery (`lib/admin/records.ts`), and a per-company count run on EVERY
-- single DeCA generation to compute "is this the company's first document"
-- (`lib/deca/persist.ts`). As the table grows past a trivial size, each of
-- these degrades to a full sequential scan.
--
-- Hand-written, not `prisma migrate dev` generated: the local shadow database
-- cannot apply D-186's RLS-lockdown migration cleanly (documented pre-existing
-- issue, D-203 hit the same thing) — this follows that same precedent.
-- Purely additive (CREATE INDEX only); index names match Prisma's own default
-- convention for `@@index([...])` so a future `prisma db pull` stays in sync.
CREATE INDEX "deca_company_id_created_at_idx" ON "deca" ("company_id", "created_at");
CREATE INDEX "deca_created_by_user_id_idx" ON "deca" ("created_by_user_id");
