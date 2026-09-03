ALTER TABLE "deca" ADD COLUMN "idempotency_key" TEXT;

CREATE UNIQUE INDEX "deca_idempotency_key_key" ON "deca"("idempotency_key");
