-- AlterTable
ALTER TABLE "deca_template" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "saved_company" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "saved_location" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "saved_vehicle" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "favorite_route" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "route_key" TEXT NOT NULL,
    "load_city" TEXT NOT NULL,
    "load_country" TEXT NOT NULL,
    "unload_city" TEXT NOT NULL,
    "unload_country" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_route_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorite_route_company_id_route_key_key" ON "favorite_route"("company_id", "route_key");

-- AddForeignKey
ALTER TABLE "favorite_route" ADD CONSTRAINT "favorite_route_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
