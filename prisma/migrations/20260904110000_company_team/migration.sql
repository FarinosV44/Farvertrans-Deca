-- TEAM #27: multi-user company workspaces + invitations.
CREATE TYPE "CompanyRole" AS ENUM ('owner', 'member');

ALTER TABLE "user" ADD COLUMN "company_role" "CompanyRole" NOT NULL DEFAULT 'owner';

CREATE TABLE "company_invite" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "role" "CompanyRole" NOT NULL DEFAULT 'member',
    "invited_by_user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "company_invite_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "company_invite_token_hash_key" ON "company_invite"("token_hash");
CREATE INDEX "company_invite_company_id_idx" ON "company_invite"("company_id");
CREATE INDEX "company_invite_email_idx" ON "company_invite"("email");
ALTER TABLE "company_invite" ADD CONSTRAINT "company_invite_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
