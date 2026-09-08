import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Company activity timeline (#83) — a compact, human-readable line of the
 * milestones that matter for support / activation / product decisions. NOT a
 * click log: only events with operational value, capped and grouped.
 */

export type TimelineEvent = {
  at: Date;
  kind: "account" | "product" | "team" | "support";
  text: string;
};

export async function companyTimeline(companyId: string, limit = 40): Promise<TimelineEvent[]> {
  const [company, members, decas, invites, integ, failures, audit] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: { createdAt: true, dataCompletedAt: true },
    }),
    prisma.user.findMany({
      where: { companyId },
      select: { email: true, createdAt: true, emailVerifiedAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.deca.findMany({
      where: { companyId },
      select: {
        createdAt: true,
        versions: { select: { versionNo: true, createdAt: true, changeReason: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.companyInvite.findMany({
      where: { companyId },
      select: { email: true, createdAt: true, acceptedAt: true },
    }),
    prisma.integrationRequest.findMany({
      where: { companyId },
      select: { system: true, createdAt: true },
    }),
    prisma.generationFailure.findMany({
      where: { companyId },
      select: { stage: true, correlationId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.securityAuditLog.findMany({
      where: {
        targetType: "company",
        targetId: companyId,
        action: { in: ["company_status_changed", "company_anonymized"] },
      },
      select: { action: true, createdAt: true, result: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  if (!company) return [];

  const ev: TimelineEvent[] = [];
  ev.push({ at: company.createdAt, kind: "account", text: "Empresa registrada" });

  const firstVerified = members
    .map((m) => m.emailVerifiedAt)
    .filter(Boolean)
    .sort()[0];
  if (firstVerified) ev.push({ at: firstVerified, kind: "account", text: "Email verificado" });
  if (company.dataCompletedAt)
    ev.push({ at: company.dataCompletedAt, kind: "account", text: "Ficha de empresa completada" });

  decas.forEach((d, i) => {
    if (i === 0) ev.push({ at: d.createdAt, kind: "product", text: "Primer DeCA generado" });
    else if (i === 1) ev.push({ at: d.createdAt, kind: "product", text: "Segundo DeCA generado" });
    for (const v of d.versions) {
      if (v.versionNo > 1)
        ev.push({
          at: v.createdAt,
          kind: "product",
          text: `Corrección de un DeCA${v.changeReason ? ` — ${v.changeReason}` : ""}`,
        });
    }
  });

  for (const iv of invites) {
    ev.push({ at: iv.createdAt, kind: "team", text: `Usuario invitado (${iv.email})` });
    if (iv.acceptedAt)
      ev.push({ at: iv.acceptedAt, kind: "team", text: `Invitación aceptada (${iv.email})` });
  }
  for (const r of integ)
    ev.push({ at: r.createdAt, kind: "support", text: `Solicitud de integración con ${r.system}` });
  for (const f of failures)
    ev.push({
      at: f.createdAt,
      kind: "support",
      text: `Incidencia de generación (${f.stage}, ${f.correlationId})`,
    });
  for (const a of audit)
    ev.push({
      at: a.createdAt,
      kind: "support",
      text:
        a.action === "company_anonymized"
          ? "Cuenta anonimizada por la administración"
          : `Cambio de estado administrativo (${a.result})`,
    });

  return ev.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}
