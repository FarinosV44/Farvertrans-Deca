-- FIX #18: store the SHA-256 of the generated PDF per version (integrity / repository of record).
-- FIX #19: record who initiated a version (correction author; null for anonymous first generation).
ALTER TABLE "deca_version" ADD COLUMN "pdf_sha256" TEXT;
ALTER TABLE "deca_version" ADD COLUMN "created_by_user_id" TEXT;
