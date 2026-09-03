-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'internal');

-- CreateTable
CREATE TABLE "operator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ref_code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nif" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "auth_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company_id" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acquisition" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "company_id" TEXT,
    "first_ref_code" TEXT,
    "last_ref_code" TEXT,
    "first_landing_url" TEXT,
    "first_utm_source" TEXT,
    "first_utm_medium" TEXT,
    "first_utm_campaign" TEXT,
    "first_utm_content" TEXT,
    "first_utm_term" TEXT,
    "last_utm_source" TEXT,
    "last_utm_medium" TEXT,
    "last_utm_campaign" TEXT,
    "last_utm_content" TEXT,
    "last_utm_term" TEXT,
    "first_seen_at" TIMESTAMP(3),
    "signup_at" TIMESTAMP(3),
    "first_deca_at" TIMESTAMP(3),

    CONSTRAINT "acquisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deca" (
    "id" TEXT NOT NULL,
    "company_id" TEXT,
    "created_by_user_id" TEXT,
    "current_version_id" TEXT,
    "service_start" TIMESTAMP(3),
    "service_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deca_version" (
    "id" TEXT NOT NULL,
    "deca_id" TEXT NOT NULL,
    "version_no" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "pdf_path" TEXT,
    "data_json" JSONB NOT NULL,
    "change_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deca_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_token" (
    "token" TEXT NOT NULL,
    "deca_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_token_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "saved_company" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nif" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_vehicle" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tractor_plate" TEXT NOT NULL,
    "trailer_plate" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_address" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "ref_snapshot" JSONB,
    "app_version" TEXT,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deca_access_log" (
    "id" TEXT NOT NULL,
    "deca_version_id" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deca_access_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abuse_counter" (
    "key_hash" TEXT NOT NULL,
    "window_start" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "abuse_counter_pkey" PRIMARY KEY ("key_hash","window_start")
);

-- CreateIndex
CREATE UNIQUE INDEX "operator_ref_code_key" ON "operator"("ref_code");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_user_id_key" ON "user"("auth_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "acquisition_user_id_key" ON "acquisition"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "acquisition_company_id_key" ON "acquisition"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "deca_current_version_id_key" ON "deca"("current_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "deca_version_token_key" ON "deca_version"("token");

-- CreateIndex
CREATE INDEX "deca_version_deca_id_idx" ON "deca_version"("deca_id");

-- CreateIndex
CREATE UNIQUE INDEX "deca_version_deca_id_version_no_key" ON "deca_version"("deca_id", "version_no");

-- CreateIndex
CREATE INDEX "claim_token_deca_id_idx" ON "claim_token"("deca_id");

-- CreateIndex
CREATE INDEX "saved_company_user_id_idx" ON "saved_company"("user_id");

-- CreateIndex
CREATE INDEX "saved_vehicle_user_id_idx" ON "saved_vehicle"("user_id");

-- CreateIndex
CREATE INDEX "saved_address_user_id_idx" ON "saved_address"("user_id");

-- CreateIndex
CREATE INDEX "event_name_ts_idx" ON "event"("name", "ts");

-- CreateIndex
CREATE INDEX "deca_access_log_deca_version_id_idx" ON "deca_access_log"("deca_version_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acquisition" ADD CONSTRAINT "acquisition_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acquisition" ADD CONSTRAINT "acquisition_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deca" ADD CONSTRAINT "deca_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deca" ADD CONSTRAINT "deca_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deca" ADD CONSTRAINT "deca_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "deca_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deca_version" ADD CONSTRAINT "deca_version_deca_id_fkey" FOREIGN KEY ("deca_id") REFERENCES "deca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_token" ADD CONSTRAINT "claim_token_deca_id_fkey" FOREIGN KEY ("deca_id") REFERENCES "deca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_company" ADD CONSTRAINT "saved_company_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_vehicle" ADD CONSTRAINT "saved_vehicle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_address" ADD CONSTRAINT "saved_address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deca_access_log" ADD CONSTRAINT "deca_access_log_deca_version_id_fkey" FOREIGN KEY ("deca_version_id") REFERENCES "deca_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
