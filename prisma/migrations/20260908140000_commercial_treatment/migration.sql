-- #84 — granular commercial-treatment consent.
--
-- The `commercial_consent.granted` boolean (DATA #45) is replaced by a `mode`
-- enum. Every company is RESET to `none`: the new legal text covers a
-- materially different processing (new recipient category, new data shared),
-- so a fresh explicit opt-in is required. This migration is applied to LOCAL
-- DEV ONLY until the legal review of the new privacy/terms text is signed off
-- (issue #84: "no mezclar en main ni desplegar sin autorización").

-- CreateEnum
CREATE TYPE "CommercialConsentMode" AS ENUM ('none', 'per_deca', 'all');

-- CreateEnum
CREATE TYPE "CommercialContactChannel" AS ENUM ('email', 'phone', 'both');

-- AlterTable: commercial_consent — drop the boolean, add the granular columns.
ALTER TABLE "commercial_consent" DROP COLUMN "granted";
ALTER TABLE "commercial_consent" ADD COLUMN "mode" "CommercialConsentMode" NOT NULL DEFAULT 'none';
ALTER TABLE "commercial_consent" ADD COLUMN "channel" "CommercialContactChannel";
ALTER TABLE "commercial_consent" ADD COLUMN "contact_email" TEXT;
ALTER TABLE "commercial_consent" ADD COLUMN "contact_phone" TEXT;

-- Reset: any pre-existing consent does not carry over to the new text.
UPDATE "commercial_consent" SET "mode" = 'none', "granted_at" = NULL, "revoked_at" = NULL;

-- CreateTable
CREATE TABLE "commercial_consent_event" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "kind" TEXT NOT NULL,
    "deca_id" TEXT,
    "mode" "CommercialConsentMode",
    "channel" "CommercialContactChannel",
    "legal_version" TEXT NOT NULL,
    "detail" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commercial_consent_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deca_availability_share" (
    "id" TEXT NOT NULL,
    "deca_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "carrier_name" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "availability_date" TIMESTAMP(3) NOT NULL,
    "channel" "CommercialContactChannel" NOT NULL,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "legal_version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "prepared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawn_at" TIMESTAMP(3),

    CONSTRAINT "deca_availability_share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commercial_consent_event_company_id_created_at_idx" ON "commercial_consent_event"("company_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "deca_availability_share_deca_id_key" ON "deca_availability_share"("deca_id");

-- CreateIndex
CREATE INDEX "deca_availability_share_company_id_idx" ON "deca_availability_share"("company_id");

-- AddForeignKey
ALTER TABLE "commercial_consent_event" ADD CONSTRAINT "commercial_consent_event_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deca_availability_share" ADD CONSTRAINT "deca_availability_share_deca_id_fkey" FOREIGN KEY ("deca_id") REFERENCES "deca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deca_availability_share" ADD CONSTRAINT "deca_availability_share_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
