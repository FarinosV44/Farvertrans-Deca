import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkPasswordStrength, hashPassword, verifyPassword } from "./password";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, signSession, verifySession } from "./session";
import { LEGAL_ENTITY } from "@/lib/legal-entity";

/**
 * v1 authentication (D-021): own email + password with an HMAC-signed httpOnly
 * session cookie. The `user.authUserId` column is kept so a later swap to
 * Supabase Auth is additive. Signup is deliberately minimal — email, password,
 * company name + NIF + address; never a lead-qualification field.
 */

export class AuthError extends Error {
  constructor(
    public code:
      | "email_taken"
      | "invalid_credentials"
      | "weak_password"
      | "bad_input"
      | "terms_required",
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

const normEmail = (e: string) => e.trim().toLowerCase();

export type SignupInput = {
  email: string;
  password: string;
  company: {
    name: string;
    nif: string;
    address: string;
    contactName?: string;
    phone?: string;
    profile?: "carrier_goods" | "shipper" | "operator" | "carrier_passengers";
  };
  /** When set, the user JOINS the invited company instead of creating one (TEAM #27). */
  inviteToken?: string;
  /** Explicit T&C + privacy acceptance (TRUST #42 §5) — never implied, never pre-checked. */
  acceptTerms: boolean;
};

export async function signup(input: SignupInput): Promise<{
  userId: string;
  companyId: string;
  joinedTeam: boolean;
  prospectId?: string;
  prospectRefCode?: string;
}> {
  const email = normEmail(input.email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    throw new AuthError("bad_input", "Email no válido.");
  const strength = checkPasswordStrength(input.password, {
    email,
    companyName: input.company.name,
  });
  if (!strength.ok) throw new AuthError("weak_password", strength.reason);

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) throw new AuthError("email_taken", "Ya existe una cuenta con este email.");

  // Team invite path — join an existing workspace, create no company.
  if (input.inviteToken) {
    const { consumeInviteToken, markInviteAccepted } = await import("@/lib/team");
    const inv = await consumeInviteToken(input.inviteToken);
    if (inv) {
      const user = await prisma.user.create({
        data: {
          authUserId: `local:${crypto.randomUUID()}`,
          email,
          companyId: inv.companyId,
          companyRole: inv.role,
          passwordHash: hashPassword(input.password),
        },
      });
      await markInviteAccepted(inv.id);
      // A team member joins an already-onboarded workspace — no separate T&C
      // checkbox is shown (matches the client, which hides it for this path).
      return { userId: user.id, companyId: inv.companyId, joinedTeam: true };
    }

    // Not a team invite — try a prospect onboarding link (GROWTH #28).
    const { resolveProspectInvite } = await import("@/lib/growth");
    const prospect = await resolveProspectInvite(input.inviteToken);
    if (!prospect) throw new AuthError("bad_input", "La invitación no es válida o ha caducado.");
    if (!input.acceptTerms)
      throw new AuthError(
        "terms_required",
        "Debes aceptar los Términos y Condiciones y la Política de Privacidad.",
      );

    const name = input.company.name.trim() || prospect.name;
    const nif = input.company.nif.trim() || prospect.nif || "";
    if (!name || !nif) throw new AuthError("bad_input", "Indica el nombre y el NIF de la empresa.");
    const r = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name, nif, address: input.company.address.trim() || null },
      });
      const user = await tx.user.create({
        data: {
          authUserId: `local:${crypto.randomUUID()}`,
          email,
          companyId: company.id,
          companyRole: "owner",
          passwordHash: hashPassword(input.password),
        },
      });
      return { userId: user.id, companyId: company.id };
    });
    await recordTermsAcceptance(r.userId, r.companyId);
    return {
      ...r,
      joinedTeam: false,
      prospectId: prospect.prospectId,
      prospectRefCode: prospect.refCode,
    };
  }

  if (!input.company.name.trim() || !input.company.nif.trim())
    throw new AuthError("bad_input", "Indica el nombre y el NIF de la empresa.");
  if (!input.acceptTerms)
    throw new AuthError(
      "terms_required",
      "Debes aceptar los Términos y Condiciones y la Política de Privacidad.",
    );

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: input.company.name.trim(),
        nif: input.company.nif.trim(),
        address: input.company.address.trim() || null,
        contactName: input.company.contactName?.trim() || null,
        phone: input.company.phone?.trim() || null,
        profile: input.company.profile,
      },
    });
    const user = await tx.user.create({
      data: {
        authUserId: `local:${crypto.randomUUID()}`,
        email,
        companyId: company.id,
        companyRole: "owner",
        passwordHash: hashPassword(input.password),
      },
    });
    return { userId: user.id, companyId: company.id, joinedTeam: false };
  });
  await recordTermsAcceptance(result.userId, result.companyId);
  return result;
}

export type GoogleProfile = { sub: string; email: string; name?: string };

/**
 * Find-or-create for Google sign-in (AUTH #30). Google already verified the
 * email, so a match/creation here is trusted without a password:
 *  - existing `googleId` → that account, unchanged.
 *  - an existing email/password account with the same email → LINK it (sets
 *    `googleId`; marks the email verified, since Google just proved it).
 *  - otherwise → a brand-new user with no password and no company yet — the
 *    caller sends them to `/registro/completar-empresa`.
 * Never throws on a normal path; returns which case it was so the route can
 * decide where to redirect.
 */
export async function findOrCreateGoogleUser(
  profile: GoogleProfile,
): Promise<{ userId: string; companyId: string | null; isNewAccount: boolean }> {
  const email = normEmail(profile.email);

  const byGoogleId = await prisma.user.findUnique({ where: { googleId: profile.sub } });
  if (byGoogleId)
    return { userId: byGoogleId.id, companyId: byGoogleId.companyId, isNewAccount: false };

  const byEmail = await prisma.user.findFirst({ where: { email } });
  if (byEmail) {
    const linked = await prisma.user.update({
      where: { id: byEmail.id },
      data: { googleId: profile.sub, emailVerifiedAt: byEmail.emailVerifiedAt ?? new Date() },
    });
    return { userId: linked.id, companyId: linked.companyId, isNewAccount: false };
  }

  const created = await prisma.user.create({
    data: {
      authUserId: `google:${profile.sub}`,
      email,
      googleId: profile.sub,
      passwordHash: null,
      emailVerifiedAt: new Date(),
    },
  });
  return { userId: created.id, companyId: null, isNewAccount: true };
}

export type CompleteCompanyInput = {
  company: {
    name: string;
    nif: string;
    address: string;
    contactName?: string;
    phone?: string;
    profile?: "carrier_goods" | "shipper" | "operator" | "carrier_passengers";
  };
  inviteToken?: string;
  acceptTerms: boolean;
};

/**
 * The second step of Google sign-up (AUTH #30): a user already exists (from
 * `findOrCreateGoogleUser`) but has no company yet. Mirrors `signup()`'s two
 * branches — join a team invite, or found a new company — starting from an
 * existing user instead of creating one.
 */
export async function completeCompanyForUser(
  userId: string,
  input: CompleteCompanyInput,
): Promise<{ companyId: string; joinedTeam: boolean }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AuthError("bad_input", "Sesión no válida.");
  if (user.companyId) throw new AuthError("bad_input", "Esta cuenta ya tiene una empresa.");

  if (input.inviteToken) {
    const { consumeInviteToken, markInviteAccepted } = await import("@/lib/team");
    const inv = await consumeInviteToken(input.inviteToken);
    if (inv) {
      await prisma.user.update({
        where: { id: userId },
        data: { companyId: inv.companyId, companyRole: inv.role },
      });
      await markInviteAccepted(inv.id);
      return { companyId: inv.companyId, joinedTeam: true };
    }
    throw new AuthError("bad_input", "La invitación no es válida o ha caducado.");
  }

  if (!input.company.name.trim() || !input.company.nif.trim())
    throw new AuthError("bad_input", "Indica el nombre y el NIF de la empresa.");
  if (!input.acceptTerms) {
    throw new AuthError(
      "terms_required",
      "Debes aceptar los Términos y Condiciones y la Política de Privacidad.",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: input.company.name.trim(),
        nif: input.company.nif.trim(),
        address: input.company.address.trim() || null,
        contactName: input.company.contactName?.trim() || null,
        phone: input.company.phone?.trim() || null,
        profile: input.company.profile,
      },
    });
    await tx.user.update({
      where: { id: userId },
      data: { companyId: company.id, companyRole: "owner" },
    });
    return { companyId: company.id, joinedTeam: false };
  });
  await recordTermsAcceptance(userId, result.companyId);
  return result;
}

export async function login(
  emailRaw: string,
  password: string,
): Promise<{ userId: string; preferredLocale: string }> {
  const email = normEmail(emailRaw);
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    throw new AuthError("invalid_credentials", "Email o contraseña incorrectos.");
  }
  return { userId: user.id, preferredLocale: user.preferredLocale };
}

export async function setSessionCookie(userId: string) {
  const store = await cookies();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sessionVersion: true },
  });
  store.set(SESSION_COOKIE, signSession(userId, user?.sessionVersion ?? 1), SESSION_COOKIE_OPTIONS);
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Bump this user's session version, invalidating every OTHER session token
 * (they carry the old version and are rejected by `getCurrentUser` from now
 * on) — used after a password change/reset and by "log out everywhere"
 * (SECURITY #53). Re-issues the CURRENT browser's cookie at the new version
 * so the caller isn't logged out of their own request.
 */
export async function bumpSessionVersion(userId: string, reissueCurrent = true): Promise<void> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
    select: { sessionVersion: true },
  });
  if (reissueCurrent) {
    const store = await cookies();
    store.set(SESSION_COOKIE, signSession(userId, user.sessionVersion), SESSION_COOKIE_OPTIONS);
  }
}

export async function getCurrentUser() {
  const store = await cookies();
  const payload = verifySession(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    include: { company: true },
  });
  if (!user || user.sessionVersion !== payload.sv) return null;
  return user;
}

// ---------------------------------------------------------------------------
// Password reset (ACCOUNT #23) — token delivered by email; stored hashed.
// ---------------------------------------------------------------------------

const RESET_TTL_MIN = 60;
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/**
 * Start a password reset. Always resolves the same way whether or not the email
 * exists (no account enumeration). Returns the raw token + email ONLY when a
 * user was found, so the caller can send the message.
 */
export async function requestPasswordReset(
  emailRaw: string,
): Promise<{ token: string; email: string; userId: string } | null> {
  const email = normEmail(emailRaw);
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return null;

  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    // A new request rotates the token — at most one active reset link per
    // user at a time (SECURITY #53), same pattern as email verification.
    prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: {
        tokenHash: sha256(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + RESET_TTL_MIN * 60 * 1000),
      },
    }),
  ]);
  return { token, email, userId: user.id };
}

export class ResetError extends Error {
  constructor(
    public code: "invalid" | "expired" | "used" | "weak_password",
    message: string,
  ) {
    super(message);
    this.name = "ResetError";
  }
}

/** Complete a password reset. Single-use, TTL-checked. Invalidates other reset tokens. */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ userId: string }> {
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!row) throw new ResetError("invalid", "Este enlace de recuperación no es válido.");
  if (row.usedAt) throw new ResetError("used", "Este enlace de recuperación ya se ha utilizado.");
  if (row.expiresAt.getTime() < Date.now())
    throw new ResetError("expired", "El enlace de recuperación ha caducado. Pide otro.");

  const user = await prisma.user.findUnique({
    where: { id: row.userId },
    include: { company: { select: { name: true } } },
  });
  const strength = checkPasswordStrength(newPassword, {
    email: user?.email,
    companyName: user?.company?.name,
  });
  if (!strength.ok) throw new ResetError("weak_password", strength.reason);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash: hashPassword(newPassword), sessionVersion: { increment: 1 } },
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId: row.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);
  return { userId: row.userId };
}

// ---------------------------------------------------------------------------
// Terms & Conditions acceptance (TRUST #42 §5) — versioned, auditable, append-only.
// ---------------------------------------------------------------------------

async function recordTermsAcceptance(userId: string, companyId: string | null) {
  await prisma.termsAcceptance.create({
    data: { userId, companyId, version: LEGAL_ENTITY.termsVersion },
  });
}

// ---------------------------------------------------------------------------
// Email verification (GROWTH #46, hardened by the D-053 product-hardening
// directive): the account and session exist as soon as signup completes —
// login, browsing the workspace, saving master data are never blocked — but
// FINAL DeCA generation is a hard, server-enforced gate on `emailVerifiedAt`
// (`POST /api/deca`, `lib/auth.isEmailVerified`). "Ya he confirmado mi
// cuenta" re-checks this column fresh from the database; it never sets it
// itself — only a verified token click (`verifyEmailToken`) does.
// ---------------------------------------------------------------------------

const VERIFY_TTL_HOURS = 24;

/**
 * Start (or restart) email verification. Returns the raw token to email.
 * Invalidates any still-unused token for this user first, so at most one
 * verification token is ever active at a time — a resend rotates the token,
 * it never accumulates unlimited live ones.
 */
export async function createEmailVerification(
  userId: string,
  email: string,
): Promise<{ token: string }> {
  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.emailVerificationToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.emailVerificationToken.create({
      data: {
        tokenHash: sha256(token),
        userId,
        email: normEmail(email),
        expiresAt: new Date(Date.now() + VERIFY_TTL_HOURS * 60 * 60 * 1000),
      },
    }),
  ]);
  return { token };
}

/** Fresh, uncached read of whether this user's email is verified right now. */
export async function isEmailVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerifiedAt: true },
  });
  return !!user?.emailVerifiedAt;
}

export class EmailVerificationError extends Error {
  constructor(
    public code: "invalid" | "expired" | "used",
    message: string,
  ) {
    super(message);
    this.name = "EmailVerificationError";
  }
}

/** Complete email verification. Single-use, TTL-checked. */
export async function verifyEmailToken(token: string): Promise<{ userId: string }> {
  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: sha256(token) },
  });
  if (!row)
    throw new EmailVerificationError("invalid", "Este enlace de confirmación no es válido.");
  if (row.usedAt)
    throw new EmailVerificationError("used", "Este enlace de confirmación ya se ha utilizado.");
  if (row.expiresAt.getTime() < Date.now())
    throw new EmailVerificationError("expired", "El enlace de confirmación ha caducado.");

  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailVerificationToken.updateMany({
      where: { userId: row.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);
  return { userId: row.userId };
}
