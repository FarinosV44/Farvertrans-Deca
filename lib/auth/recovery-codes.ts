import "server-only";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

const CODE_COUNT = 10;
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** `XXXX-XXXX` (8 random uppercase alphanumerics, Crockford-ish — no 0/O/1/I ambiguity). */
function randomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let s = "";
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

/**
 * Generate a fresh set of recovery codes, replacing (invalidating) any
 * existing ones — SECURITY #53: "invalidate old codes when regenerated".
 * Returns the RAW codes exactly once; only their hashes are ever stored.
 */
export async function generateRecoveryCodes(userId: string): Promise<string[]> {
  const codes = Array.from({ length: CODE_COUNT }, randomCode);
  await prisma.$transaction([
    prisma.adminRecoveryCode.deleteMany({ where: { userId } }),
    prisma.adminRecoveryCode.createMany({
      data: codes.map((c) => ({ userId, codeHash: sha256(c) })),
    }),
  ]);
  return codes;
}

/** Consume a recovery code — single use, constant-time compare against stored hashes. */
export async function consumeRecoveryCode(userId: string, code: string): Promise<boolean> {
  const normalized = code.trim().toUpperCase();
  const hash = sha256(normalized);
  const rows = await prisma.adminRecoveryCode.findMany({
    where: { userId, usedAt: null },
    select: { id: true, codeHash: true },
  });
  const hashBuf = Buffer.from(hash);
  const match = rows.find((r) => {
    const stored = Buffer.from(r.codeHash);
    return stored.length === hashBuf.length && timingSafeEqual(stored, hashBuf);
  });
  if (!match) return false;
  await prisma.adminRecoveryCode.update({ where: { id: match.id }, data: { usedAt: new Date() } });
  return true;
}

export async function countUnusedRecoveryCodes(userId: string): Promise<number> {
  return prisma.adminRecoveryCode.count({ where: { userId, usedAt: null } });
}
