-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CommercialOpportunityState" ADD VALUE 'not_interested';
ALTER TYPE "CommercialOpportunityState" ADD VALUE 'awaiting_load';
ALTER TYPE "CommercialOpportunityState" ADD VALUE 'first_load_offered';
ALTER TYPE "CommercialOpportunityState" ADD VALUE 'first_load_awarded';

-- AlterTable
ALTER TABLE "commercial_opportunity" ADD COLUMN     "converted_at" TIMESTAMP(3),
ADD COLUMN     "converted_by_user_id" TEXT,
ADD COLUMN     "first_porte_date" TIMESTAMP(3),
ADD COLUMN     "internal_ref" TEXT,
ADD COLUMN     "loads_generated" INTEGER,
ADD COLUMN     "margin_eur" INTEGER,
ADD COLUMN     "revenue_eur" INTEGER;

-- CreateTable
CREATE TABLE "commercial_activity_log" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "from_state" "CommercialOpportunityState",
    "to_state" "CommercialOpportunityState",
    "channel" TEXT NOT NULL DEFAULT 'none',
    "note" TEXT,
    "route_context" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commercial_activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commercial_alert" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "dedupe_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "route_context" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewed_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commercial_alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commercial_alert_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "priority_corridors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "priority_countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "min_movements" INTEGER NOT NULL DEFAULT 2,
    "window_days" INTEGER NOT NULL DEFAULT 30,
    "stale_follow_up_days" INTEGER NOT NULL DEFAULT 10,
    "reactivation_days" INTEGER NOT NULL DEFAULT 60,
    "updated_by_user_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commercial_alert_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commercial_activity_log_company_id_created_at_idx" ON "commercial_activity_log"("company_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "commercial_alert_dedupe_key_key" ON "commercial_alert"("dedupe_key");

-- CreateIndex
CREATE INDEX "commercial_alert_status_score_idx" ON "commercial_alert"("status", "score");

-- CreateIndex
CREATE INDEX "commercial_alert_company_id_idx" ON "commercial_alert"("company_id");

-- AddForeignKey
ALTER TABLE "commercial_activity_log" ADD CONSTRAINT "commercial_activity_log_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_alert" ADD CONSTRAINT "commercial_alert_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
