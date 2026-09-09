import "server-only";
import { prisma } from "@/lib/prisma";
import { bumpSessionVersion } from "@/lib/auth";
import { recordAudit } from "@/lib/admin/audit";
import { joinCompany, type CompanyRoleValue } from "@/lib/team";

/**
 * Superadmin account-lifecycle transitions (#62). Every call is audited, and
 * a transition that removes access also kills the target's live sessions
 * immediately (a `sessionVersion` bump — belt-and-braces with the status
 * check in `getCurrentSession()`).
 *
 * `anonymized` is NOT set here — that is a separate, irreversible operation
 * (`lib/admin/anonymize.ts`) with its own confirmation.
 */

export type LifecycleStatus = "active" | "blocked" | "deactivated";

export class LifecycleError extends Error {
  constructor(
    public code: "not_found" | "invalid_transition",
    message: string,
  ) {
    super(message);
    this.name = "LifecycleError";
  }
}

const REMOVES_ACCESS = (s: LifecycleStatus) => s === "blocked" || s === "deactivated";

/** Change a single user's account status. */
export async function setUserStatus(opts: {
  actorId: string;
  userId: string;
  status: LifecycleStatus;
  reason?: string;
  headers?: Headers;
}): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: opts.userId } });
  if (!user) throw new LifecycleError("not_found", "Usuario no encontrado.");
  if (user.status === "anonymized")
    throw new LifecycleError(
      "invalid_transition",
      "La cuenta está anonimizada y no se puede reactivar.",
    );

  await prisma.user.update({
    where: { id: opts.userId },
    data: {
      status: opts.status,
      statusReason: opts.reason?.trim() || null,
      statusChangedAt: new Date(),
    },
  });
  if (REMOVES_ACCESS(opts.status)) await bumpSessionVersion(opts.userId, false);

  await recordAudit({
    actorId: opts.actorId,
    action: "user_status_changed",
    targetType: "user",
    targetId: opts.userId,
    result: "success",
    headers: opts.headers,
  });
}

/**
 * Change a company's account status. A non-`active` company already blocks
 * every member via `getCurrentSession()`, but we also bump each member's
 * session so the change is instant rather than "on next request".
 */
export async function setCompanyStatus(opts: {
  actorId: string;
  companyId: string;
  status: LifecycleStatus;
  reason?: string;
  headers?: Headers;
}): Promise<void> {
  const company = await prisma.company.findUnique({
    where: { id: opts.companyId },
    include: { users: { select: { id: true } } },
  });
  if (!company) throw new LifecycleError("not_found", "Empresa no encontrada.");
  if (company.status === "anonymized")
    throw new LifecycleError(
      "invalid_transition",
      "La empresa está anonimizada y no se puede reactivar.",
    );

  await prisma.company.update({
    where: { id: opts.companyId },
    data: {
      status: opts.status,
      statusReason: opts.reason?.trim() || null,
      statusChangedAt: new Date(),
    },
  });
  if (REMOVES_ACCESS(opts.status)) {
    await Promise.all(company.users.map((u) => bumpSessionVersion(u.id, false)));
  }

  await recordAudit({
    actorId: opts.actorId,
    action: "company_status_changed",
    targetType: "company",
    targetId: opts.companyId,
    result: "success",
    headers: opts.headers,
  });
}

/**
 * #102 recovery tool — "If automatic repair is not unambiguous, build a
 * Superadmin tool to reassociate an existing user to an existing company,
 * audited." Reassociating is exactly `joinCompany`: it creates the
 * membership if it does not already exist (never duplicates one) and makes
 * it the user's active company; it never touches any OTHER membership,
 * never creates a company, and never deletes/anonymizes anything. Used both
 * for the specific case reported in #102 and for any future one shaped
 * like it.
 */
export async function reassignUserToCompany(opts: {
  actorId: string;
  userId: string;
  companyId: string;
  role: CompanyRoleValue;
  reason: string;
  headers?: Headers;
}): Promise<void> {
  const [user, company] = await Promise.all([
    prisma.user.findUnique({ where: { id: opts.userId } }),
    prisma.company.findUnique({ where: { id: opts.companyId } }),
  ]);
  if (!user) throw new LifecycleError("not_found", "Usuario no encontrado.");
  if (!company) throw new LifecycleError("not_found", "Empresa no encontrada.");
  if (!opts.reason.trim())
    throw new LifecycleError("invalid_transition", "Indica un motivo para la reasignación.");

  await prisma.$transaction((tx) => joinCompany(tx, opts.userId, opts.companyId, opts.role));

  await recordAudit({
    actorId: opts.actorId,
    action: "user_reassigned_to_company",
    targetType: "user",
    targetId: opts.userId,
    result: "success",
    headers: opts.headers,
    detail: `→ ${company.name} (${opts.companyId}) as ${opts.role}. Reason: ${opts.reason.trim()}`,
  });
}

/**
 * #103 — "Marcar como prueba" toggle. Purely a visibility/metrics label:
 * never touches access, sessions, or any data. Reversible, audited. The
 * heavier lifecycle transitions (archive/deactivate/reactivate) already
 * exist as `setCompanyStatus` above (#62); #103 explicitly does NOT add a
 * hard-delete action to Superadmin.
 */
export async function setCompanyTest(opts: {
  actorId: string;
  companyId: string;
  isTest: boolean;
  headers?: Headers;
}): Promise<void> {
  const company = await prisma.company.findUnique({ where: { id: opts.companyId } });
  if (!company) throw new LifecycleError("not_found", "Empresa no encontrada.");

  await prisma.company.update({ where: { id: opts.companyId }, data: { isTest: opts.isTest } });

  await recordAudit({
    actorId: opts.actorId,
    action: opts.isTest ? "company_marked_test" : "company_unmarked_test",
    targetType: "company",
    targetId: opts.companyId,
    result: "success",
    headers: opts.headers,
  });
}
