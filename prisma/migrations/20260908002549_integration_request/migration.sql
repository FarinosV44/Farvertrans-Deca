-- CreateTable
CREATE TABLE "integration_request" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT,
    "system" TEXT NOT NULL,
    "need" TEXT NOT NULL,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "volume_note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integration_request_company_id_idx" ON "integration_request"("company_id");

-- CreateIndex
CREATE INDEX "integration_request_status_idx" ON "integration_request"("status");

-- AddForeignKey
ALTER TABLE "integration_request" ADD CONSTRAINT "integration_request_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
