import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Read side of the security/audit trail (SECURITY #53, PRODUCT #56 "all
 * sensitive access and role changes are auditable"). `lib/admin/audit.ts` is
 * the only writer; this module only reads `SecurityAuditLog`, never mutates
 * it — the log itself is append-only by construction.
 */

export type AuditLogRow = {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  result: string;
  createdAt: Date;
};

export async function listAuditLog(
  filter: { action?: string; result?: string; since?: Date } = {},
  take = 200,
): Promise<AuditLogRow[]> {
  const where: Record<string, unknown> = {};
  if (filter.action) where.action = filter.action;
  if (filter.result) where.result = filter.result;
  if (filter.since) where.createdAt = { gte: filter.since };

  const rows = await prisma.securityAuditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
  });

  const actorIds = [...new Set(rows.map((r) => r.actorId).filter((id): id is string => !!id))];
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, email: true },
      })
    : [];
  const emailById = new Map(actors.map((a) => [a.id, a.email]));

  return rows.map((r) => ({
    id: r.id,
    actorId: r.actorId,
    actorEmail: r.actorId ? (emailById.get(r.actorId) ?? null) : null,
    action: r.action,
    targetType: r.targetType,
    targetId: r.targetId,
    result: r.result,
    createdAt: r.createdAt,
  }));
}

/** Distinct action names seen so far, for the filter row — cheap, small cardinality. */
export async function distinctAuditActions(): Promise<string[]> {
  const rows = await prisma.securityAuditLog.findMany({
    distinct: ["action"],
    select: { action: true },
    orderBy: { action: "asc" },
  });
  return rows.map((r) => r.action);
}
