import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Super Admin backup password (#91) — an offline recovery path for the
 * mandatory strong-auth (SECURITY #53) when the authenticator/passkey flow
 * cannot be completed. It replaces ONLY the additional Super Admin
 * verification step, never the application's normal login.
 *
 * The secret lives exclusively in `SUPERADMIN_BACKUP_PASSWORD`, read here on
 * the server and never sent to the client, an API response, a log line or the
 * bundle. Comparison is constant-time and length-blind (HMAC both sides).
 */

const secret = () => process.env.FVD_HASH_SECRET ?? "insecure-dev-secret";
const digest = (s: string) => createHmac("sha256", secret()).update(s).digest();
const keyFor = (userId: string) =>
  createHash("sha256").update(`admin_backup:${userId}`).digest("hex");

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function backupPasswordConfigured(): boolean {
  return !!process.env.SUPERADMIN_BACKUP_PASSWORD?.trim();
}

/** Constant-time, length-blind check of the configured backup password. */
export function checkBackupPassword(given: string): boolean {
  const expected = process.env.SUPERADMIN_BACKUP_PASSWORD?.trim();
  if (!expected || typeof given !== "string" || given.length === 0) return false;
  return timingSafeEqual(digest(given), digest(expected));
}

/** True when this admin has failed too many backup attempts recently (lockout). */
export async function backupAttemptsExceeded(userId: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const agg = await prisma.abuseCounter.aggregate({
    _sum: { count: true },
    where: { keyHash: keyFor(userId), windowStart: { gte: since } },
  });
  return (agg._sum.count ?? 0) >= MAX_ATTEMPTS;
}

export async function recordBackupFailure(userId: string): Promise<void> {
  const bucket = new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS);
  await prisma.abuseCounter.upsert({
    where: { keyHash_windowStart: { keyHash: keyFor(userId), windowStart: bucket } },
    create: { keyHash: keyFor(userId), windowStart: bucket, count: 1 },
    update: { count: { increment: 1 } },
  });
}

export async function clearBackupFailures(userId: string): Promise<void> {
  await prisma.abuseCounter.deleteMany({ where: { keyHash: keyFor(userId) } });
}
