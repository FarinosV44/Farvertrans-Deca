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

export type TeamActivityRow = {
  id: string;
  action: string;
  actorEmail: string | null;
  targetEmail: string | null;
  targetType: string | null;
  createdAt: Date;
};

/**
 * Company-scoped team activity (PRODUCT #56 "Company dashboard improvements"
 * → "team activity"). Reuses the same `SecurityAuditLog` trail D-094 wired
 * `lib/team.ts` into — company-scoped here by first resolving the company's
 * own user ids (current members only; a removed member's past actions still
 * show, a departed member's identity still resolves since `removeMember`
 * detaches rather than deletes the user row).
 */
export async function listCompanyTeamActivity(
  companyId: string,
  take = 8,
): Promise<TeamActivityRow[]> {
  const members = await prisma.user.findMany({ where: { companyId }, select: { id: true } });
  const memberIds = members.map((m) => m.id);
  if (memberIds.length === 0) return [];

  // Every `team_*` event's actor is whoever performed the action from
  // within the company (owner invites/removes/promotes) — filtering by
  // actor alone (not target) covers every case, since target rows use
  // different `targetType` values per action (a role string, "company",
  // "company_invite", "user") rather than one consistent shape to match on.
  const rows = await prisma.securityAuditLog.findMany({
    where: { action: { startsWith: "team_" }, actorId: { in: memberIds } },
    orderBy: { createdAt: "desc" },
    take,
  });

  const userIds = [
    ...new Set(
      rows
        .flatMap((r) => [r.actorId, r.targetType === "user" ? r.targetId : null])
        .filter((id): id is string => !!id),
    ),
  ];
  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true },
      })
    : [];
  const emailById = new Map(users.map((u) => [u.id, u.email]));

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    actorEmail: r.actorId ? (emailById.get(r.actorId) ?? null) : null,
    targetEmail: r.targetType === "user" && r.targetId ? (emailById.get(r.targetId) ?? null) : null,
    targetType: r.targetType,
    createdAt: r.createdAt,
  }));
}
