import "server-only";
import { timingSafeEqual } from "node:crypto";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession, getCurrentUser } from "@/lib/auth";

/**
 * Internal-area authorization (ADMIN #33) + mandatory TOTP 2FA (SECURITY
 * #53). Every `/admin` page and every `/api/admin/*` route calls one of
 * these server-side — there is no security-by-hidden-link, and a normal
 * company user gets a 404 rather than a 403 so the internal surface is not
 * even discoverable. Password compromise ALONE must never grant admin
 * access: `requireInternal()` additionally demands a TOTP check no older
 * than `ADMIN_TOTP_MAX_AGE_S`, redirecting to enrollment (if never set up)
 * or the challenge screen (if stale/absent) instead of the 2FA-gated content.
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
  if (!session || session.user.role !== "internal" || !session.user.totpEnabledAt) return false;
  const tv = session.payload.tv;
  return !!tv && Math.floor(Date.now() / 1000) - tv <= ADMIN_TOTP_MAX_AGE_S;
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
  if (!session.user.totpEnabledAt) redirect("/admin/2fa/setup");
  const tv = session.payload.tv;
  if (!tv || Math.floor(Date.now() / 1000) - tv > ADMIN_TOTP_MAX_AGE_S) {
    redirect("/admin/2fa/verify");
  }
  return session.user;
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
  if (!session || session.user.role !== "internal" || !session.user.totpEnabledAt) {
    throw new StepUpRequiredError();
  }
  const tv = session.payload.tv;
  if (!tv || Math.floor(Date.now() / 1000) - tv > STEP_UP_MAX_AGE_S) {
    throw new StepUpRequiredError();
  }
  return session.user;
}
