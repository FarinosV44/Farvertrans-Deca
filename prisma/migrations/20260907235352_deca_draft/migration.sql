-- CreateTable
CREATE TABLE "deca_draft" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "data_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deca_draft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deca_draft_user_id_key" ON "deca_draft"("user_id");

-- CreateIndex
CREATE INDEX "deca_draft_company_id_idx" ON "deca_draft"("company_id");

-- AddForeignKey
ALTER TABLE "deca_draft" ADD CONSTRAINT "deca_draft_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deca_draft" ADD CONSTRAINT "deca_draft_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
