import "server-only";
import { prisma } from "@/lib/prisma";
import { newClaimToken, newPublicToken } from "./token";
import type { ValidatedDeca } from "./validate";

const CLAIM_TTL_DAYS = 30;

export type CreatedDeca = {
  decaId: string;
  versionId: string;
  token: string;
  claimToken: string;
  claimExpiresAt: Date;
};

/**
 * Persist a brand-new DeCA and its first version atomically (R-11 / R-13).
 * `data` is the already-validated payload. Ownership is optional: an anonymous
 * DeCA has no company/user and gets a 30-day claim token (D-016).
 *
 * PDF rendering + storage is layered on top by BUILD 08; this function owns the
 * database write only.
 */
export async function createDeca(
  validated: ValidatedDeca,
  opts: { idempotencyKey?: string; createdByUserId?: string; companyId?: string } = {},
): Promise<CreatedDeca> {
  if (opts.idempotencyKey) {
    const existing = await prisma.deca.findUnique({
      where: { idempotencyKey: opts.idempotencyKey },
      include: { versions: { orderBy: { versionNo: "asc" }, take: 1 }, claimTokens: { take: 1 } },
    });
    if (existing && existing.versions[0]) {
      return {
        decaId: existing.id,
        versionId: existing.versions[0].id,
        token: existing.versions[0].token,
        claimToken: existing.claimTokens[0]?.token ?? "",
        claimExpiresAt: existing.claimTokens[0]?.expiresAt ?? new Date(),
      };
    }
  }

  const token = newPublicToken();
  const claimToken = newClaimToken();
  const claimExpiresAt = new Date(Date.now() + CLAIM_TTL_DAYS * 24 * 60 * 60 * 1000);

  const result = await prisma.$transaction(async (tx) => {
    const deca = await tx.deca.create({
      data: {
        idempotencyKey: opts.idempotencyKey,
        createdByUserId: opts.createdByUserId,
        companyId: opts.companyId,
        serviceStart: new Date(`${validated.data.transportDate}T00:00:00Z`),
      },
    });
    const version = await tx.decaVersion.create({
      data: {
        decaId: deca.id,
        versionNo: 1,
        token,
        dataJson: validated.data as unknown as object,
      },
    });
    await tx.deca.update({
      where: { id: deca.id },
      data: { currentVersionId: version.id },
    });
    if (!opts.createdByUserId) {
      await tx.claimToken.create({
        data: { token: claimToken, decaId: deca.id, expiresAt: claimExpiresAt },
      });
    }
    return { decaId: deca.id, versionId: version.id };
  });

  return { ...result, token, claimToken: opts.createdByUserId ? "" : claimToken, claimExpiresAt };
}
