/*
  #113 Phase 1 — "Ruta/envío habitual": a reusable single leg (place + place,
  optional goods/weight/recipient) that can fill one ENVÍO N block in the
  multi-shipment wizard (#112). References two existing `saved_location` rows
  by id rather than duplicating address text (issue §12).

  Purely additive: new table only, no existing table is touched, no data is
  read or modified.

  Deleting a `saved_location` still referenced by a `saved_shipment` is
  RESTRICTed (not cascaded) — a silent cascade would quietly destroy a saved
  route the user is relying on; the app surfaces a clear error instead.

  RLS: this project's posture since `20260910093000_rls_lockdown_public_schema`
  is RLS-on + zero-policies on every table in `public` (deny-all for any role
  that doesn't bypass RLS; Prisma connects as `postgres`, which does). A new
  table must be enrolled in that posture at creation time, not left as a gap.
*/

-- CreateTable
CREATE TABLE "saved_shipment" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT,
    "load_location_id" TEXT NOT NULL,
    "unload_location_id" TEXT NOT NULL,
    "goods" TEXT,
    "weight" TEXT,
    "recipient" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_shipment_company_id_idx" ON "saved_shipment"("company_id");

-- AddForeignKey
ALTER TABLE "saved_shipment" ADD CONSTRAINT "saved_shipment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_shipment" ADD CONSTRAINT "saved_shipment_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_shipment" ADD CONSTRAINT "saved_shipment_load_location_id_fkey" FOREIGN KEY ("load_location_id") REFERENCES "saved_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_shipment" ADD CONSTRAINT "saved_shipment_unload_location_id_fkey" FOREIGN KEY ("unload_location_id") REFERENCES "saved_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enroll in the project's RLS-on + zero-policy posture (deny-all for any
-- non-BYPASSRLS role; Prisma/`postgres` is unaffected).
ALTER TABLE "saved_shipment" ENABLE ROW LEVEL SECURITY;
