/**
 * #102 — the pure decisions inside the membership model, kept out of
 * `lib/team.ts` (which is `server-only`/DB-bound) so they are unit-testable
 * and so `lib/team.ts` has exactly one place to go for each of them.
 */

export type CompanyRoleValue = "owner" | "member" | "read_only";

/** PRODUCT #56: a `read_only` member (Auditor) can view but never create/modify. */
export function canWrite(role: CompanyRoleValue): boolean {
  return role !== "read_only";
}

/**
 * When a user loses their ACTIVE membership (removed from that company, or
 * — in principle — any future path that retires one), which of their
 * REMAINING memberships becomes active. Returns `null` only when none
 * remain, which is the one legitimate "no company" state — anything else
 * falling through to `null` is the pre-#102 bug (an account with a real,
 * still-existing membership elsewhere getting orphaned).
 *
 * Picks the OLDEST remaining membership: the company they have belonged to
 * longest is the least surprising "where do I land now" default.
 */
export function pickFallbackMembership<T extends { createdAt: Date }>(
  remaining: readonly T[],
): T | null {
  if (remaining.length === 0) return null;
  return [...remaining].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
}
