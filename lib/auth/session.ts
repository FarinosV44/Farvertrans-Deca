import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

/** `tv` = unix seconds of the last successful admin TOTP check this session (SECURITY #53). */
type Payload = { uid: string; iat: number; sv: number; tv?: number };

function secret(): string {
  return process.env.FVD_HASH_SECRET ?? "insecure-dev-secret";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/**
 * Sign a session token: `<payloadB64url>.<hmacB64url>`. `sv` (session version)
 * is `User.sessionVersion` at issue time — sessions are stateless (never
 * stored server-side), so this is the only revocation mechanism: bumping the
 * column invalidates every token issued before the bump (SECURITY #53).
 */
export function signSession(uid: string, sessionVersion: number, totpVerifiedAt?: number): string {
  const payload: Payload = {
    uid,
    iat: Math.floor(Date.now() / 1000),
    sv: sessionVersion,
    ...(totpVerifiedAt ? { tv: totpVerifiedAt } : {}),
  };
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(createHmac("sha256", secret()).update(body).digest());
  return `${body}.${sig}`;
}

/** Verify a session token's signature/expiry; returns its payload or null. */
export function verifySession(token: string | undefined): Payload | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = b64url(createHmac("sha256", secret()).update(body).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (!payload.uid || typeof payload.sv !== "number") return null;
    if (Math.floor(Date.now() / 1000) - payload.iat > MAX_AGE_S) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "fvd_session";
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_S,
};
