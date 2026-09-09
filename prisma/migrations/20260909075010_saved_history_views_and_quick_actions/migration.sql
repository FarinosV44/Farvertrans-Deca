-- AlterTable
ALTER TABLE "user" ADD COLUMN     "quick_actions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "saved_history_view" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "q" TEXT,
    "from" TEXT,
    "to" TEXT,
    "carrier" TEXT,
    "plate" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_history_view_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_history_view_user_id_idx" ON "saved_history_view"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_history_view_user_id_name_key" ON "saved_history_view"("user_id", "name");

-- AddForeignKey
ALTER TABLE "saved_history_view" ADD CONSTRAINT "saved_history_view_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
