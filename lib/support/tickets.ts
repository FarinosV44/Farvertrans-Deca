import "server-only";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { BRAND } from "@/lib/brand";
import {
  SUPPORT_CATEGORY_LABEL,
  SUPPORT_STATUS_LABEL,
  type SupportCategory,
  type SupportStatus,
} from "./schema";

/**
 * Technical-support tickets (#86 part 5). A message from the panel's
 * "Asistencia técnica" becomes a tracked ticket that reaches the superadmin —
 * never just an email. Every reply is recorded and (best-effort) emailed to
 * the other party. Legal queries are handled entirely outside this module
 * (#86 part 6).
 */

const NOTIFY = () => process.env.FVD_SUPPORT_NOTIFY_EMAIL?.trim() || BRAND.supportEmail;

export type NewTicketInput = {
  userId: string;
  companyId: string | null;
  userEmail: string;
  userName: string | null;
  companyName: string | null;
  category: SupportCategory;
  subject: string;
  body: string;
};

export async function createSupportTicket(input: NewTicketInput) {
  const ticket = await prisma.supportTicket.create({
    data: {
      userId: input.userId,
      companyId: input.companyId,
      userEmail: input.userEmail,
      userName: input.userName,
      companyName: input.companyName,
      category: input.category,
      subject: input.subject,
      messages: { create: { authorType: "user", authorId: input.userId, body: input.body } },
    },
  });

  // Notify the superadmin that a new ticket landed — no ticket detail beyond
  // the reference and subject (the panel is where it is read and answered).
  void sendMail({
    to: NOTIFY(),
    subject: `[Soporte #${ticket.number}] ${ticket.subject}`,
    text: [
      `Nueva incidencia técnica #${ticket.number}.`,
      `Empresa: ${input.companyName ?? "—"}`,
      `Usuario: ${input.userName ?? "—"} <${input.userEmail}>`,
      `Categoría: ${SUPPORT_CATEGORY_LABEL[input.category]}`,
      ``,
      input.body,
      ``,
      `Responde desde el panel: /admin/soporte/${ticket.id}`,
    ].join("\n"),
  });

  return ticket;
}

/** A company member's own tickets (most recent first). */
export function listUserTickets(companyId: string) {
  return prisma.supportTicket.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      number: true,
      subject: true,
      category: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function getUserTicket(id: string, companyId: string) {
  return prisma.supportTicket.findFirst({
    where: { id, companyId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

/** A user reply on their own ticket. Reopens a ticket that was awaiting them. */
export async function addUserReply(ticketId: string, userId: string, body: string) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) return null;
  await prisma.supportTicketMessage.create({
    data: { ticketId, authorType: "user", authorId: userId, body },
  });
  const status: SupportStatus =
    ticket.status === "awaiting_user" || ticket.status === "resolved" || ticket.status === "closed"
      ? "in_review"
      : (ticket.status as SupportStatus);
  await prisma.supportTicket.update({ where: { id: ticketId }, data: { status } });
  void sendMail({
    to: NOTIFY(),
    subject: `[Soporte #${ticket.number}] Nueva respuesta del usuario`,
    text: `El usuario ha respondido en la incidencia #${ticket.number}.\n\n${body}\n\n/admin/soporte/${ticket.id}`,
  });
  return { ok: true };
}

// --- Admin side -----------------------------------------------------------

export type TicketFilters = {
  status?: SupportStatus;
  companyId?: string;
  from?: Date;
  to?: Date;
};

export function listSupportTickets(filters: TicketFilters = {}) {
  return prisma.supportTicket.findMany({
    where: {
      status: filters.status,
      companyId: filters.companyId,
      createdAt: filters.from || filters.to ? { gte: filters.from, lte: filters.to } : undefined,
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      id: true,
      number: true,
      subject: true,
      category: true,
      status: true,
      companyName: true,
      userEmail: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });
}

export function getSupportTicket(id: string) {
  return prisma.supportTicket.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } }, company: { select: { name: true } } },
  });
}

/** Admin reply and/or status change on a ticket. Emails the user on a reply. */
export async function updateSupportTicket(
  id: string,
  adminId: string,
  patch: { body?: string; status?: SupportStatus },
) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) return null;

  if (patch.body !== undefined) {
    await prisma.supportTicketMessage.create({
      data: { ticketId: id, authorType: "admin", authorId: adminId, body: patch.body },
    });
    void sendMail({
      to: ticket.userEmail,
      subject: `[Soporte #${ticket.number}] Respuesta a tu incidencia`,
      text: [
        `Hola,`,
        ``,
        `Hemos respondido a tu incidencia #${ticket.number} ("${ticket.subject}"):`,
        ``,
        patch.body,
        ``,
        `Puedes responder desde tu panel, en Ayuda.`,
        `— Equipo de ${BRAND.name}`,
      ].join("\n"),
    });
  }

  const status = patch.status ?? (patch.body !== undefined ? "awaiting_user" : ticket.status);
  await prisma.supportTicket.update({
    where: { id },
    data: { status: status as SupportStatus },
  });
  return { ok: true, status };
}

export { SUPPORT_STATUS_LABEL, SUPPORT_CATEGORY_LABEL };
