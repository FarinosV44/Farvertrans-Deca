-- CreateEnum
CREATE TYPE "CompanyProfile" AS ENUM ('carrier_goods', 'shipper', 'operator', 'carrier_passengers');

-- AlterTable
ALTER TABLE "company" ADD COLUMN     "contact_name" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profile" "CompanyProfile";

-- AlterTable
ALTER TABLE "deca" ADD COLUMN     "creator_email" TEXT,
ADD COLUMN     "creator_name" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "email_verified_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "email_verification_token" (
    "token_hash" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_token_pkey" PRIMARY KEY ("token_hash")
);

-- CreateTable
CREATE TABLE "terms_acceptance" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT,
    "version" TEXT NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terms_acceptance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_verification_token_user_id_idx" ON "email_verification_token"("user_id");

-- CreateIndex
CREATE INDEX "terms_acceptance_user_id_idx" ON "terms_acceptance"("user_id");
