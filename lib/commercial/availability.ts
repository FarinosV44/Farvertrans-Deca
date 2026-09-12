import "server-only";
import { prisma } from "@/lib/prisma";
import {
  COMMERCIAL_CONSENT_VERSION,
  getCommercialTreatment,
  recordCommercialEvent,
} from "@/lib/consent";
import type {
  CapacityMode,
  CommercialContactChannel,
  CommercialTreatmentState,
  VehicleType,
} from "@/lib/commercial/types";

/**
 * The "ficha de disponibilidad comercial" for a single DeCA (#84, expanded #119).
 *
 * `buildAvailabilityPayload` is the ONE place that decides what would be
 * communicated for a porte. Its return type lists every shareable field
 * exhaustively — carrier name, zona de disponibilidad, availability date, the
 * authorised contact channel's value(s), and the #119 voluntary next-load
 * preferences (destino preferente, capacidad, tipo de vehículo). There is
 * deliberately no field for origin, the cargador, the load address, the
 * goods, weight, price, plates, the driver, the public token or the document
 * URL, so none of those can ever leak through this path. The unit test
 * asserts the key set directly.
 */
export type AvailabilityPayload = {
  carrierName: string;
  /** "Zona de disponibilidad" — where the vehicle will be free. */
  destination: string;
  /** ISO date (YYYY-MM-DD). */
  availabilityDate: string;
  channel: CommercialContactChannel;
  contactEmail?: string;
  contactPhone?: string;
  /** #119 — voluntary, independent of the DeCA's own cargo. */
  preferredDestination?: string;
  capacityMode: CapacityMode;
  /** Present only when capacityMode === "partial" — never a stale leftover. */
  linearMeters?: number;
  maxWeightKg?: number;
  vehicleType?: VehicleType;
};

export type PerDecaOverride = {
  enabled: boolean;
  destination?: string;
  availabilityDate?: string;
  channel?: CommercialContactChannel;
  /** #119 */
  preferredDestination?: string;
  capacityMode?: CapacityMode;
  linearMeters?: number;
  maxWeightKg?: number;
  vehicleType?: VehicleType;
  /** #119 — which shipment (0-based) of a multi-envío DeCA (#112) supplies the
   *  zona/fecha defaults; out-of-range or absent falls back to shipment 0. */
  finalShipmentIndex?: number;
};

type DecaFacts = {
  carrier?: { name?: string | null } | null;
  /** #119 — every shipment's resolved unload side, so a multi-envío DeCA can
   *  pick which one is the "descarga final" for availability purposes ONLY —
   *  this never alters the DeCA's own shipment numbering or legal order. */
  shipments: { unloadLocation?: { city?: string | null } | null; unloadDate?: string | null }[];
};

function finalShipment(deca: DecaFacts, index: number | undefined) {
  const i = index !== undefined && index >= 0 && index < deca.shipments.length ? index : 0;
  return deca.shipments[i] ?? {};
}

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

  const shipment = finalShipment(deca, override?.finalShipmentIndex);
  const carrierName = deca.carrier?.name?.trim() || "";
  const destination = override?.destination?.trim() || shipment.unloadLocation?.city?.trim() || "";
  const availabilityDate = override?.availabilityDate?.trim() || shipment.unloadDate?.trim() || "";
  // No explicit channel yet (opted in but never opened the settings) → email,
  // the least intrusive option and the wizard's default selection.
  const channel = override?.channel ?? treatment.channel ?? "email";
  if (!carrierName || !destination || !availabilityDate) return null;

  // #119 — "partial" (Grupaje) REQUIRES both capacity fields, positive; "full"
  // (Camión completo, also the default) never carries either — never a stale
  // value left over from a mode switch made and then reverted in the form.
  const capacityMode: CapacityMode = override?.capacityMode === "partial" ? "partial" : "full";
  let linearMeters: number | undefined;
  let maxWeightKg: number | undefined;
  if (capacityMode === "partial") {
    const lm = override?.linearMeters;
    const kg = override?.maxWeightKg;
    if (!(typeof lm === "number" && lm > 0) || !(typeof kg === "number" && kg > 0)) return null;
    linearMeters = lm;
    maxWeightKg = Math.round(kg);
  }

  const payload: AvailabilityPayload = {
    carrierName,
    destination,
    availabilityDate,
    channel,
    capacityMode,
  };
  if (linearMeters !== undefined) payload.linearMeters = linearMeters;
  if (maxWeightKg !== undefined) payload.maxWeightKg = maxWeightKg;
  if (override?.preferredDestination?.trim()) {
    payload.preferredDestination = override.preferredDestination.trim();
  }
  if (override?.vehicleType === "lona" || override?.vehicleType === "frigorifico") {
    payload.vehicleType = override.vehicleType;
  }
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
        preferredDestination: payload.preferredDestination ?? null,
        capacityMode: payload.capacityMode,
        linearMeters: payload.linearMeters ?? null,
        maxWeightKg: payload.maxWeightKg ?? null,
        vehicleType: payload.vehicleType ?? null,
        finalShipmentIndex: override?.finalShipmentIndex ?? null,
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
  status: "pending" | "withdrawn" | "expired";
  destination: string;
  availabilityDate: Date;
  channel: CommercialContactChannel;
  preparedAt: Date;
  withdrawnAt: Date | null;
  preferredDestination: string | null;
  capacityMode: CapacityMode;
  linearMeters: number | null;
  maxWeightKg: number | null;
  vehicleType: VehicleType | null;
};

/** #119 — "expired" is NEVER stored: computed at read time from the
 *  availability date, so no scheduled job was invented for a requirement
 *  this issue doesn't ask for. A `withdrawn` record stays `withdrawn`
 *  regardless of its date — withdrawal is a stronger, explicit signal. */
export function expiryStatus(row: {
  status: string;
  availabilityDate: Date;
}): "pending" | "withdrawn" | "expired" {
  if (row.status === "withdrawn") return "withdrawn";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return row.availabilityDate < today ? "expired" : "pending";
}

export async function getAvailabilityShare(
  decaId: string,
  companyId: string,
): Promise<AvailabilityShareState | null> {
  try {
    const row = await prisma.decaAvailabilityShare.findUnique({ where: { decaId } });
    if (!row || row.companyId !== companyId) return null;
    return {
      status: expiryStatus(row),
      destination: row.destination,
      availabilityDate: row.availabilityDate,
      channel: row.channel,
      preparedAt: row.preparedAt,
      withdrawnAt: row.withdrawnAt,
      preferredDestination: row.preferredDestination,
      capacityMode: row.capacityMode === "partial" ? "partial" : "full",
      linearMeters: row.linearMeters,
      maxWeightKg: row.maxWeightKg,
      vehicleType:
        row.vehicleType === "lona" || row.vehicleType === "frigorifico" ? row.vehicleType : null,
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

/** #119 — edit inputs for an already-prepared availability record. Never
 *  touches carrierName/channel/contact (those follow the company's own
 *  consent settings, not a per-edit choice) and never the DeCA itself. */
export type AvailabilityEditInput = {
  destination: string;
  availabilityDate: string;
  preferredDestination?: string;
  capacityMode: CapacityMode;
  linearMeters?: number;
  maxWeightKg?: number;
  vehicleType?: VehicleType;
};

/**
 * Edit an already-prepared, still-pending availability record (#119 — before
 * this issue, only "retirar" existed). Validates the same way creation does
 * (capacity fields required together, positive) and re-checks that the
 * company's live consent hasn't been globally revoked in the meantime.
 * Returns `false` on any validation/authorisation failure without partially
 * applying the edit.
 */
export async function updateAvailabilityShare(
  decaId: string,
  companyId: string,
  actorUserId: string | null,
  input: AvailabilityEditInput,
): Promise<boolean> {
  const row = await prisma.decaAvailabilityShare.findUnique({ where: { decaId } });
  if (!row || row.companyId !== companyId || row.status === "withdrawn") return false;

  const treatment = await getCommercialTreatment(companyId);
  if (treatment.mode === "none") return false;

  const destination = input.destination.trim();
  const availabilityDate = input.availabilityDate.trim();
  if (!destination || !availabilityDate) return false;

  const capacityMode: CapacityMode = input.capacityMode === "partial" ? "partial" : "full";
  let linearMeters: number | null = null;
  let maxWeightKg: number | null = null;
  if (capacityMode === "partial") {
    if (!(typeof input.linearMeters === "number" && input.linearMeters > 0)) return false;
    if (!(typeof input.maxWeightKg === "number" && input.maxWeightKg > 0)) return false;
    linearMeters = input.linearMeters;
    maxWeightKg = Math.round(input.maxWeightKg);
  }

  await prisma.decaAvailabilityShare.update({
    where: { decaId },
    data: {
      destination,
      availabilityDate: new Date(availabilityDate),
      preferredDestination: input.preferredDestination?.trim() || null,
      capacityMode,
      linearMeters,
      maxWeightKg,
      vehicleType: input.vehicleType ?? null,
    },
  });
  await recordCommercialEvent({
    companyId,
    actorUserId,
    kind: "availability_updated",
    decaId,
    detail: { destination, availabilityDate, capacityMode, vehicleType: input.vehicleType ?? null },
  });
  return true;
}

/** #119 — an anonymised candidate for matching: never carrier name or
 *  contact details, only the fields relevant to compatibility. */
export type AvailabilityCandidate = {
  zone: string;
  preferredDestination: string | null;
  availabilityDate: Date;
  vehicleType: VehicleType | null;
  capacityMode: CapacityMode;
  linearMeters: number | null;
  maxWeightKg: number | null;
};

const DATE_WINDOW_DAYS = 3;

/** Loose, dependency-free place matching: same normalised string, or one
 *  contains the other (handles "Madrid" vs "Madrid capital"-style variants).
 *  No geocoding/radius — explicitly out of scope for this v1 (see #119's
 *  own pre-implementation comment). */
function placesMatch(a: string, b: string): boolean {
  const na = a.trim().toLowerCase();
  const nb = b.trim().toLowerCase();
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / 86_400_000;
}

function vehicleTypeCompatible(a: VehicleType | null, b: VehicleType | null): boolean {
  return !a || !b || a === b;
}

/** #119 — a "partial ↔ partial" pairing only makes sense when what each side
 *  DECLARES it has fits inside what the other declares (a real, named
 *  limitation: neither side states an explicit REQUIRED capacity in this v1,
 *  since there is no separate cargo-demand model yet — see the issue's own
 *  pre-implementation comment, point 4). "full" is always compatible either
 *  way. */
function capacityCompatible(
  a: Pick<AvailabilityCandidate, "capacityMode" | "linearMeters" | "maxWeightKg">,
  b: Pick<AvailabilityCandidate, "capacityMode" | "linearMeters" | "maxWeightKg">,
): boolean {
  if (a.capacityMode === "full" || b.capacityMode === "full") return true;
  return (
    (a.linearMeters ?? 0) > 0 &&
    (b.linearMeters ?? 0) > 0 &&
    (a.maxWeightKg ?? 0) > 0 &&
    (b.maxWeightKg ?? 0) > 0
  );
}

/**
 * #119 — v1 matching proposal: cross `mine`'s zona/destino preferente against
 * every candidate in `pool` in BOTH directions, plus a date window, vehicle
 * type, and capacity check. Pure — no I/O, no company/contact identity ever
 * enters or leaves this function. `pool` is expected to already be filtered
 * to OTHER companies' `pending` (non-`withdrawn`, non-expired) records.
 */
export function findCompatibleAvailabilities(
  mine: AvailabilityCandidate,
  pool: AvailabilityCandidate[],
): AvailabilityCandidate[] {
  return pool.filter((other) => {
    if (daysBetween(mine.availabilityDate, other.availabilityDate) > DATE_WINDOW_DAYS) return false;
    if (!vehicleTypeCompatible(mine.vehicleType, other.vehicleType)) return false;
    if (!capacityCompatible(mine, other)) return false;
    const zoneToPreferred =
      !!mine.preferredDestination && placesMatch(mine.preferredDestination, other.zone);
    const preferredToZone =
      !!other.preferredDestination && placesMatch(mine.zone, other.preferredDestination);
    const zoneToZone = placesMatch(mine.zone, other.zone);
    return zoneToPreferred || preferredToZone || zoneToZone;
  });
}
