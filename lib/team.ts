import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Company workspaces & invitations (TEAM #27). A company has one or more users;
 * `owner` is the admin role, `member` the operator role. All workspace data
 * (DeCAs, saved entities, templates) is shared by companyId — never per user.
 */

const INVITE_TTL_DAYS = 14;
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const normEmail = (e: string) => e.trim().toLowerCase();

export type Member = {
  id: string;
  email: string;
  companyRole: "owner" | "member";
  isInternal: boolean;
  createdAt: Date;
};

export async function listMembers(companyId: string): Promise<Member[]> {
  const users = await prisma.user.findMany({
    where: { companyId },
    orderBy: [{ companyRole: "asc" }, { createdAt: "asc" }],
  });
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    companyRole: u.companyRole,
    isInternal: u.role === "internal",
    createdAt: u.createdAt,
  }));
}

export async function listPendingInvites(companyId: string) {
  return prisma.companyInvite.findMany({
    where: { companyId, acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
  });
}

export class TeamError extends Error {
  constructor(
    public code: "forbidden" | "not_found" | "bad_input" | "already_member" | "invite_invalid",
    message: string,
  ) {
    super(message);
    this.name = "TeamError";
  }
}

/** Admin creates an invite. Returns the raw token so the caller can build the link. */
export async function createInvite(
  companyId: string,
  invitedByUserId: string,
  emailRaw: string,
  role: "owner" | "member" = "member",
): Promise<{ token: string; email: string }> {
  const inviter = await prisma.user.findUnique({ where: { id: invitedByUserId } });
  if (!inviter || inviter.companyId !== companyId || inviter.companyRole !== "owner")
    throw new TeamError("forbidden", "Solo un administrador puede invitar.");

  const email = normEmail(emailRaw);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    throw new TeamError("bad_input", "Email no válido.");

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing?.companyId === companyId)
    throw new TeamError("already_member", "Esta persona ya está en el equipo.");

  const token = randomBytes(32).toString("base64url");
  await prisma.companyInvite.create({
    data: {
      companyId,
      email,
      tokenHash: sha256(token),
      role,
      invitedByUserId,
      expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 864e5),
    },
  });
  return { token, email };
}

export async function revokeInvite(companyId: string, actingUserId: string, inviteId: string) {
  const acting = await prisma.user.findUnique({ where: { id: actingUserId } });
  if (!acting || acting.companyId !== companyId || acting.companyRole !== "owner")
    throw new TeamError("forbidden", "Solo un administrador puede revocar invitaciones.");
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
 * Attach an existing user to the invited company (used when an already-registered
 * user accepts). Never creates a company. Idempotent for the same company.
 */
export async function acceptInvite(token: string, userId: string): Promise<{ companyId: string }> {
  const inv = await prisma.companyInvite.findUnique({ where: { tokenHash: sha256(token) } });
  if (!inv || inv.acceptedAt || inv.expiresAt.getTime() < Date.now())
    throw new TeamError("invite_invalid", "Esta invitación no es válida o ha caducado.");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new TeamError("not_found", "Usuario no encontrado.");
  if (user.companyId === inv.companyId) {
    await prisma.companyInvite.update({ where: { id: inv.id }, data: { acceptedAt: new Date() } });
    return { companyId: inv.companyId };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { companyId: inv.companyId, companyRole: inv.role },
    }),
    prisma.companyInvite.update({ where: { id: inv.id }, data: { acceptedAt: new Date() } }),
  ]);
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

/** Admin removes a member. Cannot remove the last owner; cannot remove yourself here. */
export async function removeMember(companyId: string, actingUserId: string, targetUserId: string) {
  const acting = await prisma.user.findUnique({ where: { id: actingUserId } });
  if (!acting || acting.companyId !== companyId || acting.companyRole !== "owner")
    throw new TeamError("forbidden", "Solo un administrador puede quitar miembros.");
  if (actingUserId === targetUserId)
    throw new TeamError("bad_input", "No puedes quitarte a ti mismo.");

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target || target.companyId !== companyId)
    throw new TeamError("not_found", "Miembro no encontrado.");

  if (target.companyRole === "owner") {
    const owners = await prisma.user.count({ where: { companyId, companyRole: "owner" } });
    if (owners <= 1)
      throw new TeamError("bad_input", "No puedes quitar al único administrador del equipo.");
  }

  // Removing = detach from the workspace (their account survives, without a company).
  await prisma.user.update({
    where: { id: targetUserId },
    data: { companyId: null, companyRole: "owner" },
  });
}
