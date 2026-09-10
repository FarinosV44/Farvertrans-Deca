import "server-only";
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TRUSTED_DEVICE_COOKIE, isTrustedDevice } from "@/lib/auth/trusted-device";

/**
 * Internal-area authorization (ADMIN #33) + mandatory strong 2FA (SECURITY
 * #53, passkey follow-up). Every `/admin` page and every `/api/admin/*`
 * route calls one of these server-side — there is no security-by-hidden-
 * link, and a normal company user gets a 404 rather than a 403 so the
 * internal surface is not even discoverable. Password compromise ALONE
 * must never grant admin access: a passkey (primary) or TOTP (fallback) —
 * either satisfies "enrolled" identically, both set the same `tv` session
 * timestamp on success. `requireInternal()` demands a check no older than
 * `ADMIN_TOTP_MAX_AGE_S` (or a valid "trust this device" grant), redirecting
 * to enrollment (if neither method is set up) or the challenge screen
 * (if stale/absent and not a trusted device) instead of the gated content.
 */

export type InternalUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Admin sessions are shorter-lived at the 2FA layer than the base 30-day cookie. */
const ADMIN_TOTP_MAX_AGE_S = 12 * 60 * 60; // 12h
/** Step-up: a destructive/high-risk action needs a TOTP check from the last few minutes. */
const STEP_UP_MAX_AGE_S = 10 * 60; // 10 min

/** The signed-in internal user, or null. Never throws, never redirects. */
export async function getInternalUser(): Promise<InternalUser | null> {
  const user = await getCurrentUser();
  return user?.role === "internal" ? user : null;
}

/**
 * "Has 2FA enrolled" now means TOTP OR at least one passkey (SECURITY #53
 * passkey follow-up) — `totpEnabledAt` alone stopped being the whole
 * picture once a passkey-only admin became possible. A tiny extra query,
 * only ever run on the low-traffic admin gate, never the general session
 * check every request pays for.
 */
export async function hasEnrolledStrongAuth(
  userId: string,
  totpEnabledAt: Date | null,
): Promise<boolean> {
  if (totpEnabledAt) return true;
  const count = await prisma.webAuthnCredential.count({ where: { userId } });
  return count > 0;
}

/** The raw trusted-device cookie value for the current request, if any. */
async function trustedDeviceCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(TRUSTED_DEVICE_COOKIE)?.value;
}

/**
 * A deploy script has no session. `FVD_ADMIN_TOKEN` lets the readiness check run
 * from CI or a runbook step; when it is unset, header authentication is simply
 * unavailable (never "allowed").
 */
export function hasAdminToken(headers: Headers): boolean {
  const expected = process.env.FVD_ADMIN_TOKEN?.trim();
  if (!expected) return false;
  const given = headers.get("x-fvd-admin-token")?.trim();
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * True when the request may reach an internal API route. `FVD_ADMIN_TOKEN`
 * (CI/deploy scripts, no human session) is exempt from 2FA by design — a
 * SESSION-based caller must have a fresh admin TOTP check, same freshness
 * window as `requireInternal()`, so a compromised admin password alone can
 * never reach an admin API either (SECURITY #53 — this closed a real gap:
 * every existing `/api/admin/*` route previously stopped at the role check).
 */
export async function isInternalRequest(headers: Headers): Promise<boolean> {
  if (hasAdminToken(headers)) return true;
  const session = await getCurrentSession();
  if (!session || session.user.role !== "internal") return false;
  if (!(await hasEnrolledStrongAuth(session.user.id, session.user.totpEnabledAt))) return false;
  const tv = session.payload.tv;
  if (!!tv && Math.floor(Date.now() / 1000) - tv <= ADMIN_TOTP_MAX_AGE_S) return true;
  return isTrustedDevice(await trustedDeviceCookie(), session.user.id);
}

/**
 * True when THIS browser session has already passed a fresh admin strong-auth
 * check (TOTP/passkey within the 12h window, or a valid trusted-device grant).
 * Same test as the tail of `requireInternal()`, but it never redirects — the
 * `/admin/2fa/verify` and `/admin/2fa/setup` pages use it to bounce an
 * already-verified admin straight to their destination instead of rendering
 * the challenge again (#86 part 7 — a stale prefetch or a double navigation
 * landing back on the challenge screen was read by users as "it keeps asking
 * for the code").
 */
export async function isAdmin2faFresh(): Promise<boolean> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "internal") return false;
  if (!(await hasEnrolledStrongAuth(session.user.id, session.user.totpEnabledAt))) return false;
  const tv = session.payload.tv;
  if (tv && Math.floor(Date.now() / 1000) - tv <= ADMIN_TOTP_MAX_AGE_S) return true;
  return isTrustedDevice(await trustedDeviceCookie(), session.user.id);
}

/**
 * True when THIS session's last admin TOTP check is fresh enough for a
 * STEP-UP action — the 10-minute window, and (like `requireStepUp()`) never a
 * trusted-device grant. The non-throwing mirror of `requireStepUp()`'s freshness
 * test, used by `/admin/2fa/verify` to decide whether a `?stepup=1` visit may
 * skip the challenge.
 *
 * `isAdmin2faFresh()` (the 12h window) is the WRONG test there: an admin whose
 * TOTP check is 11 minutes old is "fresh" by that measure, so the verify page
 * would bounce them straight back — yet every step-up-gated route still answers
 * `step_up_required`, so the action can never complete. That was an unbreakable
 * redirect loop (D-194).
 */
export async function isAdminStepUpFresh(): Promise<boolean> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "internal") return false;
  if (!(await hasEnrolledStrongAuth(session.user.id, session.user.totpEnabledAt))) return false;
  const tv = session.payload.tv;
  return !!tv && Math.floor(Date.now() / 1000) - tv <= STEP_UP_MAX_AGE_S;
}

export class StepUpRequiredError extends Error {
  constructor() {
    super("Esta acción requiere verificar tu código de autenticación de nuevo.");
    this.name = "StepUpRequiredError";
  }
}

/**
 * Gate an `/admin` page or Server Action. Renders 404 for a non-internal
 * user (the area doesn't exist for them), redirects an internal user with
 * no TOTP enrolled to mandatory setup, and one with a stale/absent TOTP
 * check to the challenge screen. Only returns once 2FA is genuinely fresh.
 */
export async function requireInternal(): Promise<InternalUser> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "internal") notFound();
  if (!(await hasEnrolledStrongAuth(session.user.id, session.user.totpEnabledAt))) {
    redirect("/admin/2fa/setup");
  }
  const tv = session.payload.tv;
  if (tv && Math.floor(Date.now() / 1000) - tv <= ADMIN_TOTP_MAX_AGE_S) return session.user;
  if (await isTrustedDevice(await trustedDeviceCookie(), session.user.id)) return session.user;
  redirect("/admin/2fa/verify");
}

/**
 * Gate a destructive/high-risk admin Route Handler (SECURITY #53 step-up):
 * deleting/archiving a company or user, role/permission changes, disabling
 * another admin's 2FA, security/legal configuration changes, bulk exports,
 * document-access or destructive document operations. Throws
 * `StepUpRequiredError` (never redirects — this is an API route, not a
 * page) when the caller's last TOTP check is older than 10 minutes, even
 * if their admin session itself is still within the 12h admin window.
 */
export async function requireStepUp(): Promise<InternalUser> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "internal") throw new StepUpRequiredError();
  if (!(await hasEnrolledStrongAuth(session.user.id, session.user.totpEnabledAt))) {
    throw new StepUpRequiredError();
  }
  // Deliberately NEVER accepts a trusted-device cookie — a destructive/
  // high-risk action always needs a check from the last few minutes,
  // regardless of how routine access to /admin itself was granted.
  const tv = session.payload.tv;
  if (!tv || Math.floor(Date.now() / 1000) - tv > STEP_UP_MAX_AGE_S) {
    throw new StepUpRequiredError();
  }
  return session.user;
}
