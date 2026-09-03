-- GROWTH #28: company acquisition funnel (prospects + operator invite links).
CREATE TYPE "ProspectStatus" AS ENUM ('prospect', 'invited', 'registered', 'activated', 'active');

CREATE TABLE "prospect" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nif" TEXT,
    "contact_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "ref_code" TEXT NOT NULL,
    "source" TEXT,
    "status" "ProspectStatus" NOT NULL DEFAULT 'prospect',
    "company_id" TEXT,
    "invite_token_hash" TEXT,
    "invite_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invited_at" TIMESTAMP(3),
    "registered_at" TIMESTAMP(3),
    "first_deca_at" TIMESTAMP(3),
    "last_deca_at" TIMESTAMP(3),
    CONSTRAINT "prospect_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "prospect_company_id_key" ON "prospect"("company_id");
CREATE UNIQUE INDEX "prospect_invite_token_hash_key" ON "prospect"("invite_token_hash");
CREATE INDEX "prospect_ref_code_idx" ON "prospect"("ref_code");
CREATE INDEX "prospect_status_idx" ON "prospect"("status");
