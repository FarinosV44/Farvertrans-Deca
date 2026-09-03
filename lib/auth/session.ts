import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

type Payload = { uid: string; iat: number };

function secret(): string {
  return process.env.FVD_HASH_SECRET ?? "insecure-dev-secret";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/** Sign a session token: `<payloadB64url>.<hmacB64url>`. */
export function signSession(uid: string): string {
  const payload: Payload = { uid, iat: Math.floor(Date.now() / 1000) };
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(createHmac("sha256", secret()).update(body).digest());
  return `${body}.${sig}`;
}

/** Verify a session token; returns the uid or null. */
export function verifySession(token: string | undefined): string | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = b64url(createHmac("sha256", secret()).update(body).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (!payload.uid || Math.floor(Date.now() / 1000) - payload.iat > MAX_AGE_S) return null;
    return payload.uid;
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
