-- AlterTable
ALTER TABLE "company" ADD COLUMN     "is_test" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "membership" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "role" "CompanyRole" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "membership_user_id_idx" ON "membership"("user_id");

-- CreateIndex
CREATE INDEX "membership_company_id_idx" ON "membership"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "membership_user_id_company_id_key" ON "membership"("user_id", "company_id");

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- #102 data backfill: one Membership row for every user that already has a
-- company. This changes NOTHING about who currently has access to what — it
-- only creates the table that makes correct multi-membership possible going
-- forward. `User.company_id`/`company_role` are left exactly as they are
-- (they become the "active company" denormalization, kept in sync by
-- lib/team.ts from here on, never written directly anywhere else).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO "membership" ("id", "user_id", "company_id", "role", "created_at")
SELECT gen_random_uuid()::text, "id", "company_id", "company_role", "created_at"
FROM "user"
WHERE "company_id" IS NOT NULL;
