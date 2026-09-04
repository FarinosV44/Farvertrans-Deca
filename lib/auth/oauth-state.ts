import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Signed, short-lived CSRF state for the Google OAuth redirect round trip
 * (AUTH #30). Stateless — no server-side storage — the same pattern as
 * `session.ts`: a signed cookie carries the nonce (plus an optional pending
 * invite token) and the callback checks it against the `state` query param
 * Google echoes back.
 */

const MAX_AGE_S = 10 * 60; // 10 minutes — just long enough for a real consent flow

type StatePayload = { nonce: string; invite?: string; iat: number };

function secret(): string {
  return process.env.FVD_HASH_SECRET ?? "insecure-dev-secret";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/** Create a fresh signed state cookie value + the nonce to send as `?state=`. */
export function createOAuthState(invite?: string): { cookieValue: string; nonce: string } {
  const nonce = randomBytes(16).toString("base64url");
  const payload: StatePayload = { nonce, invite, iat: Math.floor(Date.now() / 1000) };
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(createHmac("sha256", secret()).update(body).digest());
  return { cookieValue: `${body}.${sig}`, nonce };
}

/**
 * Verify the state cookie against the `state` query param Google returned.
 * Returns the pending invite token (if any) on success, or null on any
 * mismatch, tampering, or expiry — never throws.
 */
export function verifyOAuthState(
  cookieValue: string | undefined,
  queryState: string | null,
): {
  ok: boolean;
  invite?: string;
} {
  if (!cookieValue || !queryState || !cookieValue.includes(".")) return { ok: false };
  const [body, sig] = cookieValue.split(".");
  const expected = b64url(createHmac("sha256", secret()).update(body).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false };
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as StatePayload;
    if (!payload.nonce || Math.floor(Date.now() / 1000) - payload.iat > MAX_AGE_S) {
      return { ok: false };
    }
    if (payload.nonce !== queryState) return { ok: false };
    return { ok: true, invite: payload.invite };
  } catch {
    return { ok: false };
  }
}

export const OAUTH_STATE_COOKIE = "fvd_oauth_state";
export const OAUTH_STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_S,
};
