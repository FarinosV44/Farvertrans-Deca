import { createHash, createHmac } from "node:crypto";

/**
 * Proof-of-work fallback for when hCaptcha is not configured.
 *
 * The server issues a signed `prefix` (HMAC over a 5-minute time bucket + scope,
 * so the client cannot forge or replay it for long). The client brute-forces a
 * `nonce` such that `sha256(prefix + ":" + nonce)` begins with N zero hex chars
 * — plain SHA-256, so the client needs no secret. The server re-checks both the
 * prefix signature and the PoW. Cheap for a human (~100-500 ms), costly at scale.
 */
export const POW_DIFFICULTY = 4; // hex leading zeros
const PREFIX_TTL_BUCKETS = 2; // accept the current bucket and the previous one

function secret(): string {
  return process.env.FVD_HASH_SECRET ?? "insecure-dev-secret";
}

function sign(scope: string, bucket: number): string {
  return createHmac("sha256", secret()).update(`${scope}:${bucket}`).digest("hex").slice(0, 24);
}

/** A fresh signed challenge prefix for `scope`. */
export function challengePrefix(scope: string): string {
  const bucket = Math.floor(Date.now() / (5 * 60 * 1000));
  return `${bucket}.${sign(scope, bucket)}`;
}

function prefixValid(scope: string, prefix: string): boolean {
  const [bucketStr, sig] = prefix.split(".");
  const bucket = Number(bucketStr);
  if (!Number.isInteger(bucket) || !sig) return false;
  const current = Math.floor(Date.now() / (5 * 60 * 1000));
  for (let b = current; b >= current - PREFIX_TTL_BUCKETS; b--) {
    if (b === bucket && sig === sign(scope, b)) return true;
  }
  return false;
}

/** Verify a solved PoW: a valid, unexpired prefix + a nonce meeting the difficulty. */
export function verifyPow(scope: string, prefix: string, nonce: string): boolean {
  if (typeof nonce !== "string" || nonce.length === 0 || nonce.length > 64) return false;
  if (!prefixValid(scope, prefix)) return false;
  const digest = createHash("sha256").update(`${prefix}:${nonce}`).digest("hex");
  return digest.startsWith("0".repeat(POW_DIFFICULTY));
}

/** Verify an hCaptcha token server-side. Null secret → hCaptcha not configured. */
export async function verifyHcaptcha(
  token: string | null | undefined,
): Promise<boolean | "unconfigured"> {
  const secretKey = process.env.HCAPTCHA_SECRET_KEY;
  if (!secretKey) return "unconfigured";
  if (!token) return false;
  try {
    const res = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: token }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
