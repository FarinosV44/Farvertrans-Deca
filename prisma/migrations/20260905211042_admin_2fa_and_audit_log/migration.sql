-- AlterTable
ALTER TABLE "user" ADD COLUMN     "totp_enabled_at" TIMESTAMP(3),
ADD COLUMN     "totp_secret" TEXT;

-- CreateTable
CREATE TABLE "admin_recovery_code" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_recovery_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_audit_log" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "action" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" TEXT,
    "result" TEXT NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_recovery_code_user_id_idx" ON "admin_recovery_code"("user_id");

-- CreateIndex
CREATE INDEX "security_audit_log_actor_id_idx" ON "security_audit_log"("actor_id");

-- CreateIndex
CREATE INDEX "security_audit_log_action_idx" ON "security_audit_log"("action");

-- CreateIndex
CREATE INDEX "security_audit_log_created_at_idx" ON "security_audit_log"("created_at");

-- AddForeignKey
ALTER TABLE "admin_recovery_code" ADD CONSTRAINT "admin_recovery_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
