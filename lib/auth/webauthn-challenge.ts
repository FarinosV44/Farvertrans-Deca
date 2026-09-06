import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed, short-lived, stateless carrier for a WebAuthn ceremony's
 * `challenge` — same pattern as `oauth-state.ts`'s Google OAuth CSRF state.
 * A registration/authentication challenge only needs to survive the round
 * trip to the authenticator and back (seconds, not minutes of user
 * interaction at most); a signed cookie avoids a throwaway DB table for
 * something this short-lived.
 */

const MAX_AGE_S = 5 * 60; // 5 minutes — generous for Face ID/Touch ID prompts

type ChallengePayload = { challenge: string; userId: string; iat: number };

function secret(): string {
  return process.env.FVD_HASH_SECRET ?? "insecure-dev-secret";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/** Sign a fresh challenge cookie value for this user's in-progress ceremony. */
export function createWebAuthnChallenge(challenge: string, userId: string): string {
  const payload: ChallengePayload = { challenge, userId, iat: Math.floor(Date.now() / 1000) };
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(createHmac("sha256", secret()).update(body).digest());
  return `${body}.${sig}`;
}

/**
 * Verify the challenge cookie belongs to this exact user and hasn't expired
 * or been tampered with. Returns the challenge string to compare against
 * what the authenticator signed, or null on any failure.
 */
export function verifyWebAuthnChallenge(
  cookieValue: string | undefined,
  userId: string,
): string | null {
  if (!cookieValue || !cookieValue.includes(".")) return null;
  const [body, sig] = cookieValue.split(".");
  const expected = b64url(createHmac("sha256", secret()).update(body).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as ChallengePayload;
    if (!payload.challenge || payload.userId !== userId) return null;
    if (Math.floor(Date.now() / 1000) - payload.iat > MAX_AGE_S) return null;
    return payload.challenge;
  } catch {
    return null;
  }
}

export const WEBAUTHN_CHALLENGE_COOKIE = "fvd_webauthn_challenge";
export const WEBAUTHN_CHALLENGE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_S,
};
