-- #59: full, queryable company ficha. Postal code and town become their own
-- fields instead of living inside the free-text address line; `data_completed_at`
-- marks when a company first satisfied the full mandatory-data check (drives the
-- soft gate for companies registered before #59). All columns nullable — the
-- requirement is enforced in the application, not by the database, so existing
-- rows are never broken.

-- AlterTable
ALTER TABLE "company" ADD COLUMN "postal_code" TEXT;
ALTER TABLE "company" ADD COLUMN "city" TEXT;
ALTER TABLE "company" ADD COLUMN "data_completed_at" TIMESTAMP(3);
