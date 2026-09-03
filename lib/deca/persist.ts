import "server-only";
import { prisma } from "@/lib/prisma";
import { publicEnv } from "@/lib/env";
import { newClaimToken, newPublicToken } from "./token";
import { renderDecaPdf } from "@/lib/pdf/render";
import { getPdfStore, pdfKey, pdfSha256 } from "@/lib/storage";
import type { ValidatedDeca } from "./validate";

const CLAIM_TTL_DAYS = 30;

export type CreatedDeca = {
  decaId: string;
  versionId: string;
  token: string;
  pdfSha256: string;
  claimToken: string;
  claimExpiresAt: Date;
};

function publicUrlFor(token: string): string {
  return `${publicEnv.baseUrl.replace(/\/$/, "")}/d/${token}`;
}

/** Human-friendly reference derived from the DeCA id (first 8 chars, upper). */
export function decaReference(id: string): string {
  return `DECA-${id.slice(0, 8).toUpperCase()}`;
}

/**
 * Full DeCA generation (F1–F3): render the compliant PDF, store it, then persist
 * the document + its first version atomically (R-11/R-13). Fails closed — if the
 * render or the store fails, nothing usable is persisted.
 */
export async function createDeca(
  validated: ValidatedDeca,
  opts: { idempotencyKey?: string; createdByUserId?: string; companyId?: string } = {},
): Promise<CreatedDeca> {
  if (opts.idempotencyKey) {
    const existing = await prisma.deca.findUnique({
      where: { idempotencyKey: opts.idempotencyKey },
      include: {
        versions: { orderBy: { versionNo: "asc" }, take: 1 },
        claimTokens: { take: 1 },
      },
    });
    if (existing?.versions[0]) {
      return {
        decaId: existing.id,
        versionId: existing.versions[0].id,
        token: existing.versions[0].token,
        pdfSha256: existing.versions[0].pdfSha256 ?? "",
        claimToken: existing.claimTokens[0]?.token ?? "",
        claimExpiresAt: existing.claimTokens[0]?.expiresAt ?? new Date(),
      };
    }
  }

  const token = newPublicToken();
  const claimToken = newClaimToken();
  const claimExpiresAt = new Date(Date.now() + CLAIM_TTL_DAYS * 24 * 60 * 60 * 1000);
  const createdAt = new Date();
  const key = pdfKey(token);

  // We need an id for the reference before the transaction; use a stable slice of the token.
  const reference = `DECA-${token.slice(0, 8).toUpperCase()}`;

  // 1. Render (fail closed) and 2. store BEFORE any DB write.
  const pdf = await renderDecaPdf({
    data: validated.data,
    publicUrl: publicUrlFor(token),
    reference,
    versionNo: 1,
    createdAt,
  });
  const sha256 = pdfSha256(pdf);
  await getPdfStore().put(key, pdf);

  // 3. Persist atomically.
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
        pdfPath: key,
        pdfSha256: sha256,
        dataJson: validated.data as unknown as object,
        createdByUserId: opts.createdByUserId,
        createdAt,
      },
    });
    await tx.deca.update({ where: { id: deca.id }, data: { currentVersionId: version.id } });
    if (!opts.createdByUserId) {
      await tx.claimToken.create({
        data: { token: claimToken, decaId: deca.id, expiresAt: claimExpiresAt },
      });
    }
    return { decaId: deca.id, versionId: version.id };
  });

  await maybeMarkFirstDeca(opts.companyId);

  return {
    ...result,
    token,
    pdfSha256: sha256,
    claimToken: opts.createdByUserId ? "" : claimToken,
    claimExpiresAt,
  };
}

async function maybeMarkFirstDeca(companyId?: string) {
  // First-DeCA milestone for the operator dashboard (F12) — best-effort.
  if (!companyId) return;
  try {
    const { markFirstDeca } = await import("@/lib/attribution/persist");
    await markFirstDeca(companyId);
  } catch {
    /* non-critical */
  }
}

export class DecaCorrectionError extends Error {
  constructor(
    public code: "not_found" | "forbidden" | "reason_required",
    message: string,
  ) {
    super(message);
    this.name = "DecaCorrectionError";
  }
}

/**
 * Correct a DeCA (F5 / R-13): append a NEW version with a new token/URL/QR/PDF,
 * keep every prior version intact, record the change reason + timestamp, and make
 * the new version current. Never overwrites.
 */
export async function correctDeca(
  decaId: string,
  companyId: string,
  validated: ValidatedDeca,
  changeReason: string,
  userId?: string,
): Promise<{
  decaId: string;
  versionId: string;
  versionNo: number;
  token: string;
  pdfSha256: string;
}> {
  const reason = changeReason.trim();
  if (reason.length < 3)
    throw new DecaCorrectionError("reason_required", "Indica el motivo de la corrección.");

  const deca = await prisma.deca.findFirst({
    where: { id: decaId, companyId },
    include: { versions: { orderBy: { versionNo: "desc" }, take: 1 } },
  });
  if (!deca) throw new DecaCorrectionError("not_found", "Documento no encontrado.");

  const versionNo = (deca.versions[0]?.versionNo ?? 0) + 1;
  const token = newPublicToken();
  const modifiedAt = new Date();
  const key = pdfKey(token);
  const reference = `DECA-${token.slice(0, 8).toUpperCase()}`;

  const pdf = await renderDecaPdf({
    data: validated.data,
    publicUrl: publicUrlFor(token),
    reference,
    versionNo,
    createdAt: deca.createdAt,
    modifiedAt,
  });
  const sha256 = pdfSha256(pdf);
  await getPdfStore().put(key, pdf);

  const version = await prisma.$transaction(async (tx) => {
    const v = await tx.decaVersion.create({
      data: {
        decaId,
        versionNo,
        token,
        pdfPath: key,
        pdfSha256: sha256,
        dataJson: validated.data as unknown as object,
        changeReason: reason,
        createdByUserId: userId,
        createdAt: modifiedAt,
      },
    });
    await tx.deca.update({
      where: { id: decaId },
      data: {
        currentVersionId: v.id,
        serviceStart: new Date(`${validated.data.transportDate}T00:00:00Z`),
      },
    });
    return v;
  });

  return { decaId, versionId: version.id, versionNo, token, pdfSha256: sha256 };
}
