import "server-only";
import { prisma } from "@/lib/prisma";
import {
  COMMERCIAL_CONSENT_VERSION,
  getCommercialTreatment,
  recordCommercialEvent,
  type CommercialContactChannel,
  type CommercialTreatmentState,
} from "@/lib/consent";

/**
 * The "ficha de disponibilidad comercial" for a single DeCA (#84).
 *
 * `buildAvailabilityPayload` is the ONE place that decides what would be
 * communicated for a porte. Its return type lists every shareable field
 * exhaustively — carrier name, destination/zone, availability date, and the
 * authorised contact channel's value(s). There is deliberately no field for
 * origin, the cargador, the load address, the goods, weight, price, plates,
 * the driver, the public token or the document URL, so none of those can ever
 * leak through this path. The unit test asserts the key set directly.
 */
export type AvailabilityPayload = {
  carrierName: string;
  destination: string;
  /** ISO date (YYYY-MM-DD). */
  availabilityDate: string;
  channel: CommercialContactChannel;
  contactEmail?: string;
  contactPhone?: string;
};

export type PerDecaOverride = {
  enabled: boolean;
  destination?: string;
  availabilityDate?: string;
  channel?: CommercialContactChannel;
};

type DecaFacts = {
  carrier?: { name?: string | null } | null;
  unloadLocation?: { city?: string | null } | null;
  unloadDate?: string | null;
};

/**
 * Resolve what would be shared for this porte, or `null` when sharing is not
 * active (mode `none`, or `per_deca` with the control left off, or a required
 * value missing). Pure — no I/O.
 */
export function buildAvailabilityPayload(
  deca: DecaFacts,
  treatment: CommercialTreatmentState,
  override: PerDecaOverride | null | undefined,
): AvailabilityPayload | null {
  if (treatment.mode === "none") return null;
  const enabled = override?.enabled ?? treatment.mode === "all";
  if (!enabled) return null;

  const carrierName = deca.carrier?.name?.trim() || "";
  const destination = override?.destination?.trim() || deca.unloadLocation?.city?.trim() || "";
  const availabilityDate = override?.availabilityDate?.trim() || deca.unloadDate?.trim() || "";
  const channel = override?.channel ?? treatment.channel;
  if (!carrierName || !destination || !availabilityDate || !channel) return null;

  const payload: AvailabilityPayload = { carrierName, destination, availabilityDate, channel };
  if ((channel === "email" || channel === "both") && treatment.contactEmail) {
    payload.contactEmail = treatment.contactEmail;
  }
  if ((channel === "phone" || channel === "both") && treatment.contactPhone) {
    payload.contactPhone = treatment.contactPhone;
  }
  return payload;
}

/**
 * Prepare the availability record for a freshly generated DeCA. Best-effort and
 * called AFTER the document is persisted (like `recordRouteIntel`) — it never
 * blocks or fails generation. Re-reads the live preference so a global
 * revocation between choosing and generating is honoured (#84 "verificar que la
 * autorización continúa activa").
 */
export async function recordAvailabilityShare(
  decaId: string,
  companyId: string,
  deca: DecaFacts,
  override: PerDecaOverride | null | undefined,
): Promise<void> {
  try {
    const treatment = await getCommercialTreatment(companyId);
    const payload = buildAvailabilityPayload(deca, treatment, override);
    if (!payload) return;
    await prisma.decaAvailabilityShare.create({
      data: {
        decaId,
        companyId,
        carrierName: payload.carrierName,
        destination: payload.destination,
        availabilityDate: new Date(payload.availabilityDate),
        channel: payload.channel,
        contactEmail: payload.contactEmail ?? null,
        contactPhone: payload.contactPhone ?? null,
        legalVersion: treatment.version ?? COMMERCIAL_CONSENT_VERSION,
        status: "pending",
      },
    });
    await recordCommercialEvent({
      companyId,
      actorUserId: null,
      kind: "availability_prepared",
      decaId,
      channel: payload.channel,
      detail: payload,
    });
  } catch {
    // never block or fail generation over a commercial-share bookkeeping hiccup
  }
}

export type AvailabilityShareState = {
  status: "pending" | "withdrawn";
  destination: string;
  availabilityDate: Date;
  channel: CommercialContactChannel;
  preparedAt: Date;
  withdrawnAt: Date | null;
};

export async function getAvailabilityShare(
  decaId: string,
  companyId: string,
): Promise<AvailabilityShareState | null> {
  try {
    const row = await prisma.decaAvailabilityShare.findUnique({ where: { decaId } });
    if (!row || row.companyId !== companyId) return null;
    return {
      status: row.status === "withdrawn" ? "withdrawn" : "pending",
      destination: row.destination,
      availabilityDate: row.availabilityDate,
      channel: row.channel,
      preparedAt: row.preparedAt,
      withdrawnAt: row.withdrawnAt,
    };
  } catch {
    return null;
  }
}

/** Retire a still-pending availability record. Never deletes; never touches the DeCA. */
export async function withdrawAvailabilityShare(
  decaId: string,
  companyId: string,
  actorUserId: string | null,
): Promise<boolean> {
  const row = await prisma.decaAvailabilityShare.findUnique({ where: { decaId } });
  if (!row || row.companyId !== companyId || row.status === "withdrawn") return false;
  await prisma.decaAvailabilityShare.update({
    where: { decaId },
    data: { status: "withdrawn", withdrawnAt: new Date() },
  });
  await recordCommercialEvent({
    companyId,
    actorUserId,
    kind: "availability_withdrawn",
    decaId,
  });
  return true;
}
