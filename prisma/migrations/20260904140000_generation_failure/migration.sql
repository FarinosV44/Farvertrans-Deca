-- P0 FIX #29 — stage-aware generation failures, addressable by correlation code.
CREATE TABLE "generation_failure" (
    "id" TEXT NOT NULL,
    "correlation_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "error_class" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "route" TEXT,
    "authenticated" BOOLEAN NOT NULL DEFAULT false,
    "company_id" TEXT,
    "app_version" TEXT,
    "storage_driver" TEXT,
    "retried_ok" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_failure_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "generation_failure_correlation_id_key" ON "generation_failure"("correlation_id");
CREATE INDEX "generation_failure_stage_created_at_idx" ON "generation_failure"("stage", "created_at");
CREATE INDEX "generation_failure_created_at_idx" ON "generation_failure"("created_at");
