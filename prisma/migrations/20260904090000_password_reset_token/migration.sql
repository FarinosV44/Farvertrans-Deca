-- ACCOUNT #23: one-time password-reset tokens (token stored hashed, short TTL, single use).
CREATE TABLE "password_reset_token" (
    "token_hash" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("token_hash")
);
CREATE INDEX "password_reset_token_user_id_idx" ON "password_reset_token"("user_id");
