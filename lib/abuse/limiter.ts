/**
 * Sliding-window rate decision (F16). Pure — the caller supplies the recent
 * counter rows; this only decides allow / challenge / block.
 *
 * Three tiers per action:
 * - under `soft`  → allow silently (the normal case, incl. a first-time user);
 * - `soft`..`hard` → allow but require a challenge to be solved;
 * - at/above `hard` → block with a retry-after.
 */
export type RatePolicy = {
  windowMs: number;
  soft: number;
  hard: number;
};

export const POLICIES = {
  anon_create: { windowMs: 60 * 60 * 1000, soft: 3, hard: 12 },
  share: { windowMs: 60 * 60 * 1000, soft: 10, hard: 40 },
  auth: { windowMs: 15 * 60 * 1000, soft: 5, hard: 20 },
  d_404: { windowMs: 10 * 60 * 1000, soft: 20, hard: 60 },
} as const satisfies Record<string, RatePolicy>;

export type ActionKey = keyof typeof POLICIES;

export type RateDecision =
  | { verdict: "allow" }
  | { verdict: "challenge" }
  | { verdict: "block"; retryAfterMs: number };

/** `countInWindow` = number of prior events for this key inside the policy window. */
export function decide(policy: RatePolicy, countInWindow: number): RateDecision {
  if (countInWindow < policy.soft) return { verdict: "allow" };
  if (countInWindow < policy.hard) return { verdict: "challenge" };
  return { verdict: "block", retryAfterMs: Math.ceil(policy.windowMs / 4) };
}

/** The window start for "now", used to bucket counter rows. */
export function windowStart(policy: RatePolicy, now: Date = new Date()): Date {
  return new Date(now.getTime() - policy.windowMs);
}
