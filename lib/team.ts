import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { pickFallbackMembership, type CompanyRoleValue } from "@/lib/team-membership";

export { canWrite, type CompanyRoleValue } from "@/lib/team-membership";

/**
 * Company workspaces & invitations (TEAM #27, PRODUCT #56, rebuilt #102). A
 * user's membership in a company is a `Membership` row — the source of
 * truth — and is never the same operation as their ACTIVE company
 * (`User.companyId`/`companyRole`, a denormalized "current view" this module
 * keeps in sync). `owner` is the Company Admin role, `member` the Operator
 * role, `read_only` the Auditor role. All workspace data (DeCAs, saved
 * entities, templates) is shared by companyId — never per user.
 *
 * #102's bug existed because there was no `Membership` table: accepting a
 * second invite could only overwrite the single `companyId` FK, and removing
 * a member had nothing to delete except that same FK — so "leave company B"
 * and "lose company A" were literally the same write. Every function below
 * that changes membership goes through `joinCompany`/`leaveCompany`, the only
 * two places that touch both `Membership` and the active-company columns
 * together, so that invariant can never drift apart again.
 */

const INVITE_TTL_DAYS = 14;
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const normEmail = (e: string) => e.trim().toLowerCase();

export class TeamError extends Error {
  constructor(
    public code:
      | "forbidden"
      | "not_found"
      | "bad_input"
      | "already_member"
      | "invite_invalid"
      | "duplicate_company",
    message: string,
  ) {
    super(message);
    this.name = "TeamError";
  }
}

// ---------------------------------------------------------------------------
// The two membership primitives — everything else in this module, and every
// other write site in the app (signup, Google completion), goes through these.
// ---------------------------------------------------------------------------

/**
 * Give `userId` a membership in `companyId` (creating it if absent — never
 * duplicated, `@@unique([userId, companyId])` backs this), and switch their
 * active company to it. Never touches any OTHER membership the user holds.
 * `tx` is required so callers compose this inside their own transaction
 * (signup, invite acceptance) rather than this function opening its own.
 */
export async function joinCompany(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  userId: string,
  companyId: string,
  role: CompanyRoleValue,
): Promise<void> {
  await tx.membership.upsert({
    where: { userId_companyId: { userId, companyId } },
    // Re-joining (idempotent invite acceptance) never silently reassigns an
    // existing role — that is `changeRole`'s job, done explicitly, audited.
    update: {},
    create: { userId, companyId, role },
  });
  await tx.user.update({ where: { id: userId }, data: { companyId, companyRole: role } });
}

/**
 * Remove `userId`'s membership in `companyId`. If that was their ACTIVE
 * company, fall back to another membership they still hold
 * (`pickFallbackMembership`) rather than the pre-#102 bug's silent
 * `companyId: null` — that only happens now when truly no membership
 * remains, which is the one legitimate reading of "no company".
 */
async function leaveCompany(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  userId: string,
  companyId: string,
): Promise<void> {
  await tx.membership.delete({ where: { userId_companyId: { userId, companyId } } });

  const user = await tx.user.findUnique({ where: { id: userId }, select: { companyId: true } });
  if (user?.companyId !== companyId) return; // not their active company — nothing else to do

  const remaining = await tx.membership.findMany({ where: { userId } });
  const fallback = pickFallbackMembership(remaining);
  await tx.user.update({
    where: { id: userId },
    data: fallback
      ? { companyId: fallback.companyId, companyRole: fallback.role }
      : { companyId: null, companyRole: "owner" },
  });
}

// ---------------------------------------------------------------------------

export type Member = {
  id: string;
  email: string;
  companyRole: CompanyRoleValue;
  isInternal: boolean;
  /** When they joined THIS company — the membership's own date, not the account's. */
  createdAt: Date;
};

/** Everyone with a membership in this company — their role IN THIS COMPANY, not their global one. */
export async function listMembers(companyId: string): Promise<Member[]> {
  const memberships = await prisma.membership.findMany({
    where: { companyId },
    include: { user: { select: { id: true, email: true, role: true } } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
  return memberships.map((m) => ({
    id: m.user.id,
    email: m.user.email,
    companyRole: m.role,
    isInternal: m.user.role === "internal",
    createdAt: m.createdAt,
  }));
}

/** Every company this user belongs to, for a workspace switcher. */
export type UserMembership = { companyId: string; companyName: string; role: CompanyRoleValue };
export async function listUserMemberships(userId: string): Promise<UserMembership[]> {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return memberships.map((m) => ({
    companyId: m.companyId,
    companyName: m.company.name,
    role: m.role,
  }));
}

/** Switch this user's active company to one they already hold a membership in. */
export async function switchActiveCompany(userId: string, companyId: string): Promise<void> {
  const membership = await prisma.membership.findUnique({
    where: { userId_companyId: { userId, companyId } },
  });
  if (!membership) throw new TeamError("not_found", "No perteneces a esa empresa.");
  await prisma.user.update({
    where: { id: userId },
    data: { companyId, companyRole: membership.role },
  });
}

export async function listPendingInvites(companyId: string) {
  return prisma.companyInvite.findMany({
    where: { companyId, acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
  });
}

/**
 * Owner-only guard shared by every mutating team action. Checked against the
 * acting user's ACTIVE company/role — which `joinCompany`/`leaveCompany`/
 * `changeRole` keep permanently in sync with their membership in that
 * specific company, so this stays equivalent to (and cheaper than) a fresh
 * `Membership` lookup on every call.
 */
async function requireOwner(actingUserId: string, companyId: string) {
  const acting = await prisma.user.findUnique({ where: { id: actingUserId } });
  if (!acting || acting.companyId !== companyId || acting.companyRole !== "owner")
    throw new TeamError("forbidden", "Solo un administrador puede hacer esto.");
  return acting;
}

/** Admin creates an invite. Returns the raw token so the caller can build the link. */
export async function createInvite(
  companyId: string,
  invitedByUserId: string,
  emailRaw: string,
  role: CompanyRoleValue = "member",
): Promise<{ token: string; email: string }> {
  await requireOwner(invitedByUserId, companyId);

  const email = normEmail(emailRaw);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    throw new TeamError("bad_input", "Email no válido.");

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    const already = await prisma.membership.findUnique({
      where: { userId_companyId: { userId: existing.id, companyId } },
    });
    if (already) throw new TeamError("already_member", "Esta persona ya está en el equipo.");
  }

  // #102 follow-up: re-inviting (e.g. clicking "Reenviar") used to create a
  // SECOND, separate row with its own token — the old link kept working
  // silently, so an admin who resent twice ended up with two valid links to
  // the same person and no way to tell which one was current (the exact
  // shape of a live report: two invites 4 minutes apart, the pasted link
  // matching neither). Tokens are stored hashed and cannot be recovered to
  // "resend the same one" — the correct fix is to ROTATE the existing
  // pending invite's token in place, so there is at most one valid link per
  // (company, email) at any moment and a superseded link fails cleanly.
  const pending = await prisma.companyInvite.findFirst({
    where: { companyId, email, acceptedAt: null, expiresAt: { gt: new Date() } },
  });

  const token = randomBytes(32).toString("base64url");
  const invite = pending
    ? await prisma.companyInvite.update({
        where: { id: pending.id },
        data: {
          tokenHash: sha256(token),
          role,
          invitedByUserId,
          expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 864e5),
        },
      })
    : await prisma.companyInvite.create({
        data: {
          companyId,
          email,
          tokenHash: sha256(token),
          role,
          invitedByUserId,
          expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 864e5),
        },
      });

  const { recordAudit } = await import("@/lib/admin/audit");
  await recordAudit({
    actorId: invitedByUserId,
    action: pending ? "team_invite_resent" : "team_invite_created",
    targetType: "company_invite",
    targetId: invite.id,
    result: "success",
  });

  return { token, email };
}

export async function revokeInvite(companyId: string, actingUserId: string, inviteId: string) {
  await requireOwner(actingUserId, companyId);
  await prisma.companyInvite.deleteMany({ where: { id: inviteId, companyId } });
}

export type InvitePreview = { companyId: string; companyName: string; email: string } | null;

export async function getInvitePreview(token: string): Promise<InvitePreview> {
  const inv = await prisma.companyInvite.findUnique({
    where: { tokenHash: sha256(token) },
    include: { company: true },
  });
  if (!inv || inv.acceptedAt || inv.expiresAt.getTime() < Date.now()) return null;
  return { companyId: inv.companyId, companyName: inv.company.name, email: inv.email };
}

/**
 * An already-registered, logged-in user accepts an invite (#102 — this is
 * the exact function whose old body caused the reported bug: it used to
 * unconditionally overwrite `companyId`, discarding every OTHER membership
 * the user held). Now: creates the new membership via `joinCompany` — which
 * never touches any existing one — and switches the active company to the
 * one just joined, matching "Tras aceptar, se crea membership en Empresa A.
 * Entra directamente a Empresa A" from the issue. Accepting twice is
 * idempotent: `joinCompany`'s upsert never reassigns an existing role.
 */
export async function acceptInvite(token: string, userId: string): Promise<{ companyId: string }> {
  const inv = await prisma.companyInvite.findUnique({ where: { tokenHash: sha256(token) } });
  if (!inv || inv.acceptedAt || inv.expiresAt.getTime() < Date.now())
    throw new TeamError("invite_invalid", "Esta invitación no es válida o ha caducado.");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new TeamError("not_found", "Usuario no encontrado.");

  await prisma.$transaction(async (tx) => {
    await joinCompany(tx, userId, inv.companyId, inv.role as CompanyRoleValue);
    await tx.companyInvite.update({ where: { id: inv.id }, data: { acceptedAt: new Date() } });
  });

  const { recordAudit } = await import("@/lib/admin/audit");
  await recordAudit({
    actorId: userId,
    action: "team_invite_accepted",
    targetType: "company",
    targetId: inv.companyId,
    result: "success",
  });

  return { companyId: inv.companyId };
}

/** Consume an invite at signup — the new user joins the company, no new company row. */
export async function consumeInviteToken(token: string) {
  const inv = await prisma.companyInvite.findUnique({ where: { tokenHash: sha256(token) } });
  if (!inv || inv.acceptedAt || inv.expiresAt.getTime() < Date.now()) return null;
  return inv;
}

export async function markInviteAccepted(inviteId: string) {
  await prisma.companyInvite.update({ where: { id: inviteId }, data: { acceptedAt: new Date() } });
}

/**
 * Admin removes a member (#102: "Eliminar acceso", never "Quitar" — it never
 * deletes the account). Cannot remove the last owner; cannot remove yourself
 * here. Deletes ONLY the membership row for this company — the account, its
 * auth, its OTHER memberships, and every DeCA/document it ever touched are
 * completely untouched.
 */
export async function removeMember(companyId: string, actingUserId: string, targetUserId: string) {
  await requireOwner(actingUserId, companyId);
  if (actingUserId === targetUserId)
    throw new TeamError("bad_input", "No puedes quitarte a ti mismo.");

  const targetMembership = await prisma.membership.findUnique({
    where: { userId_companyId: { userId: targetUserId, companyId } },
  });
  if (!targetMembership) throw new TeamError("not_found", "Miembro no encontrado.");

  if (targetMembership.role === "owner") {
    const owners = await prisma.membership.count({ where: { companyId, role: "owner" } });
    if (owners <= 1)
      throw new TeamError("bad_input", "No puedes quitar al único administrador del equipo.");
  }

  await prisma.$transaction((tx) => leaveCompany(tx, targetUserId, companyId));

  const { recordAudit } = await import("@/lib/admin/audit");
  await recordAudit({
    actorId: actingUserId,
    action: "team_member_removed",
    targetType: "user",
    targetId: targetUserId,
    result: "success",
  });
}

/**
 * Admin changes a member's workspace role (TEAM #37). Owner-only; cannot change
 * your own role; the workspace must always keep at least one admin. Updates
 * the `Membership` row (the source of truth) and, only if this company is
 * also that member's currently active one, the denormalized column too.
 */
export async function changeRole(
  companyId: string,
  actingUserId: string,
  targetUserId: string,
  role: CompanyRoleValue,
) {
  await requireOwner(actingUserId, companyId);
  if (actingUserId === targetUserId)
    throw new TeamError("bad_input", "No puedes cambiar tu propio rol.");

  const targetMembership = await prisma.membership.findUnique({
    where: { userId_companyId: { userId: targetUserId, companyId } },
  });
  if (!targetMembership) throw new TeamError("not_found", "Miembro no encontrado.");
  if (targetMembership.role === role) return;

  if (targetMembership.role === "owner" && role !== "owner") {
    const owners = await prisma.membership.count({ where: { companyId, role: "owner" } });
    if (owners <= 1)
      throw new TeamError("bad_input", "El equipo debe tener al menos un administrador.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.membership.update({
      where: { userId_companyId: { userId: targetUserId, companyId } },
      data: { role },
    });
    const target = await tx.user.findUnique({
      where: { id: targetUserId },
      select: { companyId: true },
    });
    if (target?.companyId === companyId) {
      await tx.user.update({ where: { id: targetUserId }, data: { companyRole: role } });
    }
  });

  const { recordAudit } = await import("@/lib/admin/audit");
  await recordAudit({
    actorId: actingUserId,
    action: "team_role_changed",
    targetType: role,
    targetId: targetUserId,
    result: "success",
  });
}
