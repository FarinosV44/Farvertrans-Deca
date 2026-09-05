-- CreateTable
CREATE TABLE "commercial_consent" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commercial_consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deca_route_intel" (
    "id" TEXT NOT NULL,
    "deca_id" TEXT NOT NULL,
    "deca_version_id" TEXT NOT NULL,
    "company_id" TEXT,
    "transport_type" TEXT NOT NULL DEFAULT 'goods',
    "carrier_name" TEXT,
    "load_company_name" TEXT,
    "load_city" TEXT,
    "load_province" TEXT,
    "load_country" TEXT,
    "load_postal_code" TEXT,
    "unload_company_name" TEXT,
    "unload_city" TEXT,
    "unload_province" TEXT,
    "unload_country" TEXT,
    "unload_postal_code" TEXT,
    "load_date" TIMESTAMP(3),
    "unload_date" TIMESTAMP(3),
    "tractor_plate" TEXT,
    "trailer_plate" TEXT,
    "route_key" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deca_route_intel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commercial_consent_company_id_key" ON "commercial_consent"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "deca_route_intel_deca_version_id_key" ON "deca_route_intel"("deca_version_id");

-- CreateIndex
CREATE INDEX "deca_route_intel_company_id_idx" ON "deca_route_intel"("company_id");

-- CreateIndex
CREATE INDEX "deca_route_intel_load_country_load_province_load_city_idx" ON "deca_route_intel"("load_country", "load_province", "load_city");

-- CreateIndex
CREATE INDEX "deca_route_intel_unload_country_unload_province_unload_city_idx" ON "deca_route_intel"("unload_country", "unload_province", "unload_city");

-- CreateIndex
CREATE INDEX "deca_route_intel_route_key_idx" ON "deca_route_intel"("route_key");

-- AddForeignKey
ALTER TABLE "commercial_consent" ADD CONSTRAINT "commercial_consent_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deca_route_intel" ADD CONSTRAINT "deca_route_intel_deca_id_fkey" FOREIGN KEY ("deca_id") REFERENCES "deca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deca_route_intel" ADD CONSTRAINT "deca_route_intel_deca_version_id_fkey" FOREIGN KEY ("deca_version_id") REFERENCES "deca_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
