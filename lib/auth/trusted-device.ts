import "server-only";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * "Trust this device" for ~30 days after a successful passkey/TOTP check
 * (SECURITY #53 passkey follow-up, brief item 4). Same hashed-token-in-DB
 * shape as password-reset/email-verification tokens — only the hash is
 * stored, the raw token lives solely in an HttpOnly cookie on the admin's
 * own device. Reusable until expiry or explicit revocation (unlike those
 * single-use tokens), so this has `revokedAt` rather than `usedAt`.
 */

const TRUST_DAYS = 30;
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export const TRUSTED_DEVICE_COOKIE = "fvd_trusted_device";
export const TRUSTED_DEVICE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TRUST_DAYS * 24 * 60 * 60,
};

/** Issue a fresh trusted-device token for this user. Returns the RAW token for the cookie. */
export async function createTrustedDevice(userId: string, label?: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await prisma.trustedDevice.create({
    data: {
      tokenHash: sha256(token),
      userId,
      label: label?.slice(0, 200),
      expiresAt: new Date(Date.now() + TRUST_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  return token;
}

/**
 * True when the given raw token is a live, non-revoked, non-expired trust
 * grant for exactly this user. Best-effort bumps `lastSeenAt` — never
 * blocks or fails the caller if that write has a problem.
 */
export async function isTrustedDevice(token: string | undefined, userId: string): Promise<boolean> {
  if (!token) return false;
  const row = await prisma.trustedDevice.findUnique({ where: { tokenHash: sha256(token) } });
  if (!row || row.revokedAt || row.expiresAt.getTime() < Date.now()) return false;
  const a = Buffer.from(row.userId);
  const b = Buffer.from(userId);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    await prisma.trustedDevice.update({
      where: { tokenHash: row.tokenHash },
      data: { lastSeenAt: new Date() },
    });
  } catch {
    // freshness bookkeeping only — never affects the trust decision itself
  }
  return true;
}

export type TrustedDeviceRow = {
  id: string;
  label: string | null;
  createdAt: Date;
  expiresAt: Date;
  lastSeenAt: Date | null;
};

export async function listTrustedDevices(userId: string): Promise<TrustedDeviceRow[]> {
  const rows = await prisma.trustedDevice.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { tokenHash: true, label: true, createdAt: true, expiresAt: true, lastSeenAt: true },
  });
  // `id` here is the (already-hashed) tokenHash, safe to expose — it's not
  // usable to authenticate as the device, only to name a row for revocation.
  return rows.map((r) => ({
    id: r.tokenHash,
    label: r.label,
    createdAt: r.createdAt,
    expiresAt: r.expiresAt,
    lastSeenAt: r.lastSeenAt,
  }));
}

/** Revoke one trusted device by its id (== tokenHash), scoped to this user. */
export async function revokeTrustedDevice(userId: string, id: string): Promise<void> {
  await prisma.trustedDevice.updateMany({
    where: { tokenHash: id, userId },
    data: { revokedAt: new Date() },
  });
}

/**
 * Revoke EVERY trusted device for a user — called alongside
 * `bumpSessionVersion()` (password change/reset, "log out everywhere") so a
 * compromised password can never leave a standing 2FA bypass behind.
 */
export async function revokeAllTrustedDevices(userId: string): Promise<void> {
  await prisma.trustedDevice.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
