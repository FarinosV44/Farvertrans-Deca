import "server-only";
import { prisma } from "@/lib/prisma";
import { publicEnv } from "@/lib/env";
import { newClaimToken, newPublicToken } from "./token";
import { renderDecaPdf } from "@/lib/pdf/render";
import { getPdfStore, pdfKey, pdfSha256 } from "@/lib/storage";
import { GenerationError, newCorrelationId } from "./generation";
import type { ValidatedDeca } from "./validate";
import { recordRouteIntel } from "./route-intel";

const CLAIM_TTL_DAYS = 30;

export type CreatedDeca = {
  decaId: string;
  versionId: string;
  token: string;
  pdfSha256: string;
  firstForCompany: boolean;
  claimToken: string;
  claimExpiresAt: Date;
};

/**
 * Run one generation stage, tagging whatever it throws with that stage and the
 * call's correlation code (P0 FIX #29). A stage that already failed keeps its
 * own classification.
 */
async function stage<T>(
  name: "pdf_render" | "pdf_storage" | "database",
  correlationId: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof GenerationError) throw e;
    throw new GenerationError(name, e, correlationId);
  }
}

/**
 * Run the DB write that follows a successful object upload. If it fails, delete
 * the stored object best-effort so unreachable PDFs never accumulate (#29 §6),
 * then rethrow the failure classified as `database`.
 */
async function withOrphanCleanup<T>(
  key: string,
  correlationId: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    try {
      await getPdfStore().del(key);
    } catch {
      // The object stays orphaned; the correlation code in the log identifies it.
    }
    if (e instanceof GenerationError) throw e;
    throw new GenerationError("database", e, correlationId);
  }
}

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
  opts: {
    idempotencyKey?: string;
    createdByUserId?: string;
    companyId?: string;
    /** Lightweight identity captured before an anonymous first DeCA (TRUST #42 §3). */
    creatorName?: string;
    creatorEmail?: string;
  } = {},
): Promise<CreatedDeca> {
  const correlationId = newCorrelationId();
  if (opts.idempotencyKey) {
    const existing = await stage("database", correlationId, () =>
      prisma.deca.findUnique({
        where: { idempotencyKey: opts.idempotencyKey },
        include: {
          versions: { orderBy: { versionNo: "asc" }, take: 1 },
          claimTokens: { take: 1 },
        },
      }),
    );
    if (existing?.versions[0]) {
      return {
        decaId: existing.id,
        versionId: existing.versions[0].id,
        token: existing.versions[0].token,
        pdfSha256: existing.versions[0].pdfSha256 ?? "",
        firstForCompany: false, // a repeat of an existing create is never "the first"
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

  // The company's CURRENT logo, baked into this render only (PRODUCT #39) —
  // a later upload/removal never touches this stored PDF's bytes.
  const customerLogoDataUri = opts.companyId
    ? (
        await stage("database", correlationId, () =>
          prisma.company.findUnique({
            where: { id: opts.companyId },
            select: { logoDataUri: true },
          }),
        )
      )?.logoDataUri
    : null;

  // 1. Render (fail closed) and 2. store BEFORE any DB write.
  const pdf = await stage("pdf_render", correlationId, () =>
    renderDecaPdf({
      data: validated.data,
      publicUrl: publicUrlFor(token),
      reference,
      versionNo: 1,
      createdAt,
      customerLogoDataUri,
    }),
  );
  const sha256 = pdfSha256(pdf);
  await stage("pdf_storage", correlationId, () => getPdfStore().put(key, pdf));

  // 3. Persist atomically. If this fails the object is already stored, so clean
  //    it up best-effort — an unreachable PDF must never accumulate (#29 §6).
  const result = await withOrphanCleanup(key, correlationId, () =>
    prisma.$transaction(async (tx) => {
      const deca = await tx.deca.create({
        data: {
          idempotencyKey: opts.idempotencyKey,
          createdByUserId: opts.createdByUserId,
          companyId: opts.companyId,
          creatorName: opts.creatorName,
          creatorEmail: opts.creatorEmail,
          serviceStart: new Date(`${validated.data.loadDate}T00:00:00Z`),
          serviceEnd: new Date(`${validated.data.unloadDate}T00:00:00Z`),
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
    }),
  );

  await maybeMarkFirstDeca(opts.companyId);
  await maybeRecordRouteIntel(result.decaId, result.versionId, opts.companyId, validated.data);

  // First DeCA for this company by an authenticated user (ACCOUNT #23 milestone).
  let firstForCompany = false;
  if (opts.companyId) {
    firstForCompany = (await prisma.deca.count({ where: { companyId: opts.companyId } })) === 1;
  }

  return {
    ...result,
    token,
    pdfSha256: sha256,
    firstForCompany,
    claimToken: opts.createdByUserId ? "" : claimToken,
    claimExpiresAt,
  };
}

async function maybeMarkFirstDeca(companyId?: string) {
  // First-DeCA milestone for the operator dashboard (F12) + the acquisition
  // funnel (GROWTH #28) — best-effort, never blocks generation.
  if (!companyId) return;
  try {
    const { markFirstDeca } = await import("@/lib/attribution/persist");
    await markFirstDeca(companyId);
  } catch {
    /* non-critical */
  }
  try {
    const { touchProspectActivity } = await import("@/lib/growth");
    await touchProspectActivity(companyId);
  } catch {
    /* non-critical */
  }
}

/**
 * Derived route intelligence (DATA #45) — best-effort, never blocks
 * generation/correction. A failure here means one row is missing from a
 * disposable analytics layer, never a lost or invalid legal document.
 */
async function maybeRecordRouteIntel(
  decaId: string,
  versionId: string,
  companyId: string | undefined,
  data: ValidatedDeca["data"],
) {
  try {
    await recordRouteIntel(decaId, versionId, companyId, data);
  } catch {
    /* non-critical — recomputable from dataJson if ever needed */
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

  const correlationId = newCorrelationId();
  // The company's CURRENT logo, baked into this correction's render only
  // (PRODUCT #39) — earlier versions' stored bytes are never touched.
  const customerLogoDataUri = (
    await stage("database", correlationId, () =>
      prisma.company.findUnique({ where: { id: companyId }, select: { logoDataUri: true } }),
    )
  )?.logoDataUri;
  const pdf = await stage("pdf_render", correlationId, () =>
    renderDecaPdf({
      data: validated.data,
      publicUrl: publicUrlFor(token),
      reference,
      versionNo,
      createdAt: deca.createdAt,
      modifiedAt,
      customerLogoDataUri,
    }),
  );
  const sha256 = pdfSha256(pdf);
  await stage("pdf_storage", correlationId, () => getPdfStore().put(key, pdf));

  const version = await withOrphanCleanup(key, correlationId, () =>
    prisma.$transaction(async (tx) => {
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
          serviceStart: new Date(`${validated.data.loadDate}T00:00:00Z`),
          serviceEnd: new Date(`${validated.data.unloadDate}T00:00:00Z`),
        },
      });
      return v;
    }),
  );

  await maybeRecordRouteIntel(decaId, version.id, companyId, validated.data);

  return { decaId, versionId: version.id, versionNo, token, pdfSha256: sha256 };
}
