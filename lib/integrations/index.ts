import "server-only";
import { prisma } from "@/lib/prisma";
import {
  NEEDS,
  NEED_LABEL,
  integrationRequestSchema,
  INTEGRATION_STATUSES,
  type Need,
} from "./constants";

export { NEEDS, NEED_LABEL, integrationRequestSchema, type Need } from "./constants";

/**
 * "Solicitar integración" (#74). Measures demand for a TMS/ERP connector before
 * any public API is built — no keys are issued, no availability date promised.
 * The interest is stored separately from any commercial consent (#45).
 */

export async function createIntegrationRequest(
  companyId: string,
  userId: string | null,
  input: unknown,
) {
  const d = integrationRequestSchema.parse(input);
  return prisma.integrationRequest.create({
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
