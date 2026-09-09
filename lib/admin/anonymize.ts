import "server-only";
import { prisma } from "@/lib/prisma";
import { bumpSessionVersion } from "@/lib/auth";
import { recordAudit } from "@/lib/admin/audit";

export { ANONYMIZED_USER_FIELDS, ANONYMIZED_COMPANY_FIELDS } from "@/lib/admin/anonymize-fields";

/**
 * Irreversible superadmin anonymisation (#62, RGPD erasure vs the 1-year
 * retention obligation). PII is overwritten IN PLACE — the row is kept, and
 * NOTHING touches `Deca` / `DecaVersion` / `SecurityAuditLog` (D-067: the
 * legal document trail and the audit trail are never destroyed). A DeCA
 * already issued stays verifiable at `/d/[token]`.
 *
 * Fields cleared:
 *   User    → email (→ a unique dead address), passwordHash, googleId, status
 *   Company → name, nif, address, postalCode, city, contactName, phone, email,
 *             logoDataUri, status
 * The historical `creatorName` / `creatorEmail` snapshots ON a `Deca` row and
 * the `dataJson` inside a `DecaVersion` are deliberately left — they are part
 * of the immutable legal record, not the account.
 */

const TOMB = "[anonimizado]";

export class AnonymizeError extends Error {
  constructor(
    public code: "not_found" | "already_anonymized",
    message: string,
  ) {
    super(message);
    this.name = "AnonymizeError";
  }
}

export async function anonymizeUser(opts: {
  actorId: string;
  userId: string;
  headers?: Headers;
}): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: opts.userId } });
  if (!user) throw new AnonymizeError("not_found", "Usuario no encontrado.");
  if (user.status === "anonymized")
    throw new AnonymizeError("already_anonymized", "La cuenta ya está anonimizada.");

  await prisma.user.update({
    where: { id: opts.userId },
    data: {
      email: `anon+${user.id}@anonymized.invalid`,
      passwordHash: null,
      googleId: null,
      status: "anonymized",
      anonymizedAt: new Date(),
      statusChangedAt: new Date(),
    },
  });
  await bumpSessionVersion(opts.userId, false);
  await recordAudit({
    actorId: opts.actorId,
    action: "user_anonymized",
    targetType: "user",
    targetId: opts.userId,
    result: "success",
    headers: opts.headers,
  });
}

/**
 * #103 follow-up (D-170): NOT wired to any web endpoint or Superadmin button
 * — anonymizing a company is now deliberately unreachable from the normal
 * web UI/API, so a compromised session, a human mistake, or a permissions
 * bug can never trigger it. The function itself is kept, on purpose, as the
 * building block for the "controlled, exceptional technical procedure"
 * the issue asks for if this is ever genuinely needed — a CLI/script
 * invoked outside Superadmin, never rebuilt as a web button. No such
 * script exists yet (not requested; the original #103 spec said not to
 * build one unless strictly necessary).
 */
export async function anonymizeCompany(opts: {
  actorId: string;
  companyId: string;
  headers?: Headers;
}): Promise<void> {
  const company = await prisma.company.findUnique({
    where: { id: opts.companyId },
    include: { users: { select: { id: true } } },
  });
  if (!company) throw new AnonymizeError("not_found", "Empresa no encontrada.");
  if (company.status === "anonymized")
    throw new AnonymizeError("already_anonymized", "La empresa ya está anonimizada.");

  await prisma.$transaction([
    prisma.company.update({
      where: { id: opts.companyId },
      data: {
        name: TOMB,
        nif: null,
        address: null,
        postalCode: null,
        city: null,
        contactName: null,
        phone: null,
        email: null,
        logoDataUri: null,
        status: "anonymized",
        anonymizedAt: new Date(),
        statusChangedAt: new Date(),
      },
    }),
    // Members lose their PII too — a company is anonymised as a whole.
    ...company.users.map((u) =>
      prisma.user.update({
        where: { id: u.id },
        data: {
          email: `anon+${u.id}@anonymized.invalid`,
          passwordHash: null,
          googleId: null,
          status: "anonymized",
          anonymizedAt: new Date(),
          statusChangedAt: new Date(),
        },
      }),
    ),
  ]);
  await Promise.all(company.users.map((u) => bumpSessionVersion(u.id, false)));
  await recordAudit({
    actorId: opts.actorId,
    action: "company_anonymized",
    targetType: "company",
    targetId: opts.companyId,
    result: "success",
    headers: opts.headers,
  });
}
