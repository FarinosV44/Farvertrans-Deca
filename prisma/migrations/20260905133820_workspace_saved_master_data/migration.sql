/*
  WORKSPACE #24 — saved master data becomes a shared, company-scoped
  operational resource (was per-user) and gains the fields a real transport
  company needs (role, contact info, structured location, alias, last used).

  Data-preserving: existing `saved_company`/`saved_vehicle` rows are
  backfilled with their owner's `company_id`; existing `saved_address` rows
  are copied into the new `saved_location` shape before the old table is
  dropped. A saved row whose creator has no company (never possible through
  the product today — `/panel/datos` and the saved-data write API both
  require an authenticated company) is deleted rather than left orphaned,
  since the new model has no way to represent a companyless saved record.
*/
-- CreateEnum
CREATE TYPE "SavedPartyRole" AS ENUM ('shipper', 'carrier', 'both');

-- CreateEnum
CREATE TYPE "SavedLocationType" AS ENUM ('load', 'unload', 'both');

-- DropIndex
DROP INDEX "saved_company_user_id_idx";

-- DropIndex
DROP INDEX "saved_vehicle_user_id_idx";

-- AlterTable: add company_id NULLABLE first (backfilled below, then locked NOT NULL)
ALTER TABLE "saved_company" ADD COLUMN     "company_id" TEXT,
ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_name" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "last_used_at" TIMESTAMP(3),
ADD COLUMN     "role" "SavedPartyRole" NOT NULL DEFAULT 'both';

-- AlterTable
ALTER TABLE "saved_vehicle" ADD COLUMN     "alias" TEXT,
ADD COLUMN     "company_id" TEXT,
ADD COLUMN     "last_used_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "saved_location" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postal_code" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT NOT NULL DEFAULT 'España',
    "type" "SavedLocationType" NOT NULL DEFAULT 'both',
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_location_pkey" PRIMARY KEY ("id")
);

-- Backfill: copy every legacy flat "label + address" row into the new
-- structured shape (the old model had no postal code / city / province).
INSERT INTO "saved_location" ("id", "user_id", "company_id", "name", "address", "country", "type", "created_at")
SELECT "id", "user_id", (SELECT "company_id" FROM "user" WHERE "user"."id" = "saved_address"."user_id"),
       "label", "address", 'España', 'both', "created_at"
FROM "saved_address";

-- DropForeignKey
ALTER TABLE "saved_address" DROP CONSTRAINT "saved_address_user_id_fkey";

-- DropTable
DROP TABLE "saved_address";

-- Backfill company_id on the pre-existing tables from each row's creator.
UPDATE "saved_company" SET "company_id" = (SELECT "company_id" FROM "user" WHERE "user"."id" = "saved_company"."user_id");
UPDATE "saved_vehicle" SET "company_id" = (SELECT "company_id" FROM "user" WHERE "user"."id" = "saved_vehicle"."user_id");

-- A row whose creator has no company cannot be represented by the new
-- company-scoped model — delete it (never reachable through the product).
DELETE FROM "saved_company" WHERE "company_id" IS NULL;
DELETE FROM "saved_vehicle" WHERE "company_id" IS NULL;
DELETE FROM "saved_location" WHERE "company_id" IS NULL;

-- Lock the columns down now that every remaining row has a value.
ALTER TABLE "saved_company" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "saved_vehicle" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "saved_location" ALTER COLUMN "company_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "saved_location_company_id_idx" ON "saved_location"("company_id");

-- CreateIndex
CREATE INDEX "saved_company_company_id_idx" ON "saved_company"("company_id");

-- CreateIndex
CREATE INDEX "saved_vehicle_company_id_idx" ON "saved_vehicle"("company_id");

-- AddForeignKey
ALTER TABLE "saved_company" ADD CONSTRAINT "saved_company_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_vehicle" ADD CONSTRAINT "saved_vehicle_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_location" ADD CONSTRAINT "saved_location_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_location" ADD CONSTRAINT "saved_location_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
