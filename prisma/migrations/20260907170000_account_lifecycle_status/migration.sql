-- #62: account lifecycle for a user and a company.
-- active = normal; blocked = access suspended, sessions killed, data kept;
-- deactivated = stable "given up" state, no access, reversible;
-- anonymized = PII overwritten in place (row + every DeCA / audit row kept).

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'blocked', 'deactivated', 'anonymized');

-- AlterTable
ALTER TABLE "user" ADD COLUMN "status" "AccountStatus" NOT NULL DEFAULT 'active';
ALTER TABLE "user" ADD COLUMN "status_reason" TEXT;
ALTER TABLE "user" ADD COLUMN "status_changed_at" TIMESTAMP(3);
ALTER TABLE "user" ADD COLUMN "anonymized_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "company" ADD COLUMN "status" "AccountStatus" NOT NULL DEFAULT 'active';
ALTER TABLE "company" ADD COLUMN "status_reason" TEXT;
ALTER TABLE "company" ADD COLUMN "status_changed_at" TIMESTAMP(3);
ALTER TABLE "company" ADD COLUMN "anonymized_at" TIMESTAMP(3);
