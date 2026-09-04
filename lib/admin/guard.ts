import "server-only";
import { timingSafeEqual } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";

/**
 * Internal-area authorization (ADMIN #33). Every `/admin` page and every
 * `/api/admin/*` route calls one of these server-side — there is no
 * security-by-hidden-link, and a normal company user gets a 404 rather than a
 * 403 so the internal surface is not even discoverable.
 */

export type InternalUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** The signed-in internal user, or null. Never throws. */
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

/** True when the request may read internal operational data. */
export async function isInternalRequest(headers: Headers): Promise<boolean> {
  if (hasAdminToken(headers)) return true;
  return !!(await getInternalUser());
}
