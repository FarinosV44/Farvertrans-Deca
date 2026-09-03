-- UX #25: reusable DeCA templates (recurring non-date data per lane).
CREATE TABLE "deca_template" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deca_template_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "deca_template_company_id_idx" ON "deca_template"("company_id");
