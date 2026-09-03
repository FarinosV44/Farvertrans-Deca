import { randomBytes } from "node:crypto";

/**
 * Public document token: 32 random bytes (256 bits) base64url-encoded — far above
 * the ≥128-bit requirement, and non-enumerable. One per DeCA version.
 */
export function newPublicToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Claim token for attaching an anonymous DeCA to an account (D-016). Same strength. */
export function newClaimToken(): string {
  return randomBytes(32).toString("base64url");
}
