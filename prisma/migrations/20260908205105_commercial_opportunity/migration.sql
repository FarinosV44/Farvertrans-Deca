-- CreateEnum
CREATE TYPE "CommercialOpportunityState" AS ENUM ('review', 'contacted', 'interested', 'unavailable', 'discarded', 'converted');

-- CreateTable
CREATE TABLE "commercial_opportunity" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "state" "CommercialOpportunityState" NOT NULL DEFAULT 'review',
    "note" TEXT,
    "updated_by_user_id" TEXT,
    "contacted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commercial_opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commercial_opportunity_company_id_key" ON "commercial_opportunity"("company_id");

-- CreateIndex
CREATE INDEX "commercial_opportunity_state_idx" ON "commercial_opportunity"("state");

-- AddForeignKey
ALTER TABLE "commercial_opportunity" ADD CONSTRAINT "commercial_opportunity_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
