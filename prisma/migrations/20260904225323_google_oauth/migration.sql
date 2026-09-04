-- AlterTable
ALTER TABLE "user" ADD COLUMN     "google_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_google_id_key" ON "user"("google_id");
