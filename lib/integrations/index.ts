import "server-only";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { renderTransactionalHtml } from "@/lib/email-template";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import { NEED_LABEL, integrationRequestSchema, INTEGRATION_STATUSES, type Need } from "./constants";

export { NEEDS, NEED_LABEL, integrationRequestSchema, type Need } from "./constants";

/**
 * "Solicitar integración" (#74). Measures demand for a TMS/ERP connector before
 * any public API is built — no keys are issued, no availability date promised.
 * The interest is stored separately from any commercial consent (#45).
 *
 * #111: the request now also reaches a person by email (same address + best-
 * effort pattern as a support ticket) — before this it landed in the admin
 * panel only and nobody was alerted. A double-submit within 2 minutes is
 * de-duped so a retry never creates a second row or a second email.
 */

const NOTIFY = () => process.env.FVD_SUPPORT_NOTIFY_EMAIL?.trim() || BRAND.supportEmail;
const DEDUP_WINDOW_MS = 2 * 60_000;

export async function createIntegrationRequest(
  companyId: string,
  userId: string | null,
  input: unknown,
) {
  const d = integrationRequestSchema.parse(input);

  const recent = await prisma.integrationRequest.findFirst({
    where: {
      companyId,
      userId,
      system: d.system,
      need: d.need,
      createdAt: { gte: new Date(Date.now() - DEDUP_WINDOW_MS) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent) return recent;

  const row = await prisma.integrationRequest.create({
    data: {
      companyId,
      userId,
      system: d.system,
      need: d.need,
      contactName: d.contactName || null,
      contactEmail: d.contactEmail || null,
      volumeNote: d.volumeNote || null,
    },
  });

  const [company, user] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId }, select: { name: true, nif: true } }),
    userId
      ? prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
      : Promise.resolve(null),
  ]);

  const adminLink = `${publicEnv.baseUrl.replace(/\/$/, "")}/admin/integraciones`;
  const text = [
    `Nueva solicitud de integración.`,
    `Empresa: ${company?.name ?? "—"}${company?.nif ? ` · ${company.nif}` : ""} (${companyId})`,
    `Usuario: ${user?.email ?? "—"}${userId ? ` (${userId})` : ""}`,
    `Contacto: ${d.contactName || "—"} <${d.contactEmail || "—"}>`,
    `Sistema / TMS / ERP: ${d.system}`,
    `Necesidad: ${NEED_LABEL[d.need]}`,
    `Volumen aprox.: ${d.volumeNote || "—"}`,
    `Fecha: ${row.createdAt.toISOString()}`,
    ``,
    `Revisa las solicitudes en el panel: ${adminLink}`,
  ].join("\n");
  void sendMail({
    to: NOTIFY(),
    subject: `[Integración] ${company?.name ?? "Empresa"} · ${d.system}`,
    text,
    html: renderTransactionalHtml({ text, link: adminLink, ctaLabel: "Ver solicitudes" }),
  });

  return row;
}

export async function listIntegrationRequests() {
  const rows = await prisma.integrationRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: { select: { name: true, nif: true } } },
  });
  const d30 = new Date(Date.now() - 30 * 864e5);
  const counts = await prisma.deca.groupBy({
    by: ["companyId"],
    where: { companyId: { in: rows.map((r) => r.companyId) }, createdAt: { gte: d30 } },
    _count: { _all: true },
  });
  const by = new Map(counts.map((c) => [c.companyId, c._count._all]));
  return rows.map((r) => ({
    id: r.id,
    companyId: r.companyId,
    companyName: r.company.name,
    system: r.system,
    need: NEED_LABEL[r.need as Need] ?? r.need,
    contact: r.contactName ?? r.contactEmail ?? null,
    volumeNote: r.volumeNote,
    status: r.status,
    createdAt: r.createdAt,
    deca30d: by.get(r.companyId) ?? 0,
  }));
}

export async function setIntegrationRequestStatus(id: string, status: string): Promise<boolean> {
  if (!INTEGRATION_STATUSES.includes(status as (typeof INTEGRATION_STATUSES)[number])) return false;
  const res = await prisma.integrationRequest.updateMany({ where: { id }, data: { status } });
  return res.count > 0;
}
