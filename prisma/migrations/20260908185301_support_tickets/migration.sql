-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('new', 'in_review', 'awaiting_user', 'resolved', 'closed');

-- CreateTable
CREATE TABLE "support_ticket" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "company_id" TEXT,
    "user_id" TEXT,
    "user_email" TEXT NOT NULL,
    "user_name" TEXT,
    "company_name" TEXT,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_ticket_message" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "author_type" TEXT NOT NULL,
    "author_id" TEXT,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_ticket_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "support_ticket_number_key" ON "support_ticket"("number");

-- CreateIndex
CREATE INDEX "support_ticket_status_idx" ON "support_ticket"("status");

-- CreateIndex
CREATE INDEX "support_ticket_company_id_idx" ON "support_ticket"("company_id");

-- CreateIndex
CREATE INDEX "support_ticket_created_at_idx" ON "support_ticket"("created_at");

-- CreateIndex
CREATE INDEX "support_ticket_message_ticket_id_idx" ON "support_ticket_message"("ticket_id");

-- AddForeignKey
ALTER TABLE "support_ticket" ADD CONSTRAINT "support_ticket_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket" ADD CONSTRAINT "support_ticket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_message" ADD CONSTRAINT "support_ticket_message_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
