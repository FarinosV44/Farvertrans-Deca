import "server-only";
import { prisma } from "@/lib/prisma";
import {
  COMMERCIAL_CONSENT_VERSION,
  getCommercialTreatment,
  recordCommercialEvent,
} from "@/lib/consent";
import {
  isVehicleType,
  type CapacityMode,
  type CommercialContactChannel,
  type CommercialTreatmentState,
  type VehicleType,
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
  /** #119 ACLARACIÓN FINAL — internal/derived only (never a separate visible
   *  input alongside `availabilityPostalCode`, which is the canonical,
   *  user-facing value): the final shipment's own unload city, kept for
   *  legacy free-text matching and display fallback. */
  destination: string;
  /** ISO date (YYYY-MM-DD). */
  availabilityDate: string;
  channel: CommercialContactChannel;
  contactEmail?: string;
  contactPhone?: string;
  capacityMode: CapacityMode;
  /** Present only when capacityMode === "partial" — never a stale leftover. */
  linearMeters?: number;
  maxWeightKg?: number;
  vehicleType?: VehicleType;
  /** Free-text specify, present only when vehicleType === "otro" (2026
   *  correction to #119). */
  vehicleTypeOther?: string;
  /** 2026 correction to #119 — the canonical value for matching; the
   *  internal/derived destination stays for legacy display, pre-filled from
   *  the final shipment's own unload postal code when available. */
  availabilityPostalCode?: string;
  preferredDestinationPostalCode?: string;
  /** ACLARACIÓN FINAL — travels together with `preferredDestinationPostalCode`;
   *  defaults to "España". Never a bare city/locality — CP+país replace the
   *  earlier free-text "destino preferente" entirely. */
  preferredDestinationCountry?: string;
};

export type PerDecaOverride = {
  enabled: boolean;
  /** #119 ACLARACIÓN FINAL — no longer settable by the caller: `destination`
   *  is always derived from the final shipment's own unload city (see
   *  `buildAvailabilityPayload`), never a separate user-facing input. */
  availabilityDate?: string;
  channel?: CommercialContactChannel;
  capacityMode?: CapacityMode;
  linearMeters?: number;
  maxWeightKg?: number;
  vehicleType?: VehicleType;
  vehicleTypeOther?: string;
  availabilityPostalCode?: string;
  preferredDestinationPostalCode?: string;
  preferredDestinationCountry?: string;
  /** #119 — which shipment (0-based) of a multi-envío DeCA (#112) supplies the
   *  zona/fecha defaults; out-of-range or absent falls back to shipment 0. */
  finalShipmentIndex?: number;
};

type DecaFacts = {
  carrier?: { name?: string | null } | null;
  /** #119 — every shipment's resolved unload side, so a multi-envío DeCA can
   *  pick which one is the "descarga final" for availability purposes ONLY —
   *  this never alters the DeCA's own shipment numbering or legal order. */
  shipments: {
    unloadLocation?: { city?: string | null; postalCode?: string | null } | null;
    unloadDate?: string | null;
  }[];
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
  // ACLARACIÓN FINAL — always derived, never a caller-supplied field.
  const destination = shipment.unloadLocation?.city?.trim() || "";
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

  // 2026 correction to #119 — the postal code is the canonical matching
  // value; pre-filled from the final shipment's own unload postal code when
  // the operator didn't type one explicitly. Optional throughout: a missing
  // postal code (foreign destination, or an old-shaped caller) never blocks
  // the payload — matching just falls back to the free-text zone.
  const availabilityPostalCode =
    override?.availabilityPostalCode?.trim() || shipment.unloadLocation?.postalCode?.trim() || "";

  const payload: AvailabilityPayload = {
    carrierName,
    destination,
    availabilityDate,
    channel,
    capacityMode,
  };
  if (linearMeters !== undefined) payload.linearMeters = linearMeters;
  if (maxWeightKg !== undefined) payload.maxWeightKg = maxWeightKg;
  if (availabilityPostalCode) payload.availabilityPostalCode = availabilityPostalCode;
  if (override?.preferredDestinationPostalCode?.trim()) {
    payload.preferredDestinationPostalCode = override.preferredDestinationPostalCode.trim();
    // A country only means anything alongside a postal code; default to
    // España (the correction's own default) rather than leaving it unset.
    payload.preferredDestinationCountry = override.preferredDestinationCountry?.trim() || "España";
  }
  if (isVehicleType(override?.vehicleType)) {
    payload.vehicleType = override.vehicleType;
    if (override.vehicleType === "otro" && override.vehicleTypeOther?.trim()) {
      payload.vehicleTypeOther = override.vehicleTypeOther.trim();
    }
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
        capacityMode: payload.capacityMode,
        linearMeters: payload.linearMeters ?? null,
        maxWeightKg: payload.maxWeightKg ?? null,
        vehicleType: payload.vehicleType ?? null,
        vehicleTypeOther: payload.vehicleTypeOther ?? null,
        availabilityPostalCode: payload.availabilityPostalCode ?? null,
        preferredDestinationPostalCode: payload.preferredDestinationPostalCode ?? null,
        preferredDestinationCountry: payload.preferredDestinationCountry ?? null,
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
  capacityMode: CapacityMode;
  linearMeters: number | null;
  maxWeightKg: number | null;
  vehicleType: VehicleType | null;
  vehicleTypeOther: string | null;
  availabilityPostalCode: string | null;
  preferredDestinationPostalCode: string | null;
  preferredDestinationCountry: string | null;
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
      capacityMode: row.capacityMode === "partial" ? "partial" : "full",
      linearMeters: row.linearMeters,
      maxWeightKg: row.maxWeightKg,
      vehicleType: isVehicleType(row.vehicleType) ? row.vehicleType : null,
      vehicleTypeOther: row.vehicleTypeOther,
      availabilityPostalCode: row.availabilityPostalCode,
      preferredDestinationPostalCode: row.preferredDestinationPostalCode,
      preferredDestinationCountry: row.preferredDestinationCountry,
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
 *  consent settings, not a per-edit choice), never the DeCA itself, and (ACLARACIÓN
 *  FINAL) never `destination` — that field is internal/derived only and has
 *  no visible input to edit any more. */
export type AvailabilityEditInput = {
  availabilityDate: string;
  capacityMode: CapacityMode;
  linearMeters?: number;
  maxWeightKg?: number;
  vehicleType?: VehicleType;
  vehicleTypeOther?: string;
  availabilityPostalCode?: string;
  preferredDestinationPostalCode?: string;
  preferredDestinationCountry?: string;
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

  const availabilityDate = input.availabilityDate.trim();
  if (!availabilityDate) return false;

  const capacityMode: CapacityMode = input.capacityMode === "partial" ? "partial" : "full";
  let linearMeters: number | null = null;
  let maxWeightKg: number | null = null;
  if (capacityMode === "partial") {
    if (!(typeof input.linearMeters === "number" && input.linearMeters > 0)) return false;
    if (!(typeof input.maxWeightKg === "number" && input.maxWeightKg > 0)) return false;
    linearMeters = input.linearMeters;
    maxWeightKg = Math.round(input.maxWeightKg);
  }

  const vehicleType = isVehicleType(input.vehicleType) ? input.vehicleType : null;
  const vehicleTypeOther = vehicleType === "otro" ? input.vehicleTypeOther?.trim() || null : null;
  const preferredDestinationPostalCode = input.preferredDestinationPostalCode?.trim() || null;

  await prisma.decaAvailabilityShare.update({
    where: { decaId },
    data: {
      // `destination` deliberately untouched — internal/derived, no visible
      // input exists to edit it any more (ACLARACIÓN FINAL).
      availabilityDate: new Date(availabilityDate),
      capacityMode,
      linearMeters,
      maxWeightKg,
      vehicleType,
      vehicleTypeOther,
      availabilityPostalCode: input.availabilityPostalCode?.trim() || null,
      preferredDestinationPostalCode,
      preferredDestinationCountry: preferredDestinationPostalCode
        ? input.preferredDestinationCountry?.trim() || "España"
        : null,
    },
  });
  await recordCommercialEvent({
    companyId,
    actorUserId,
    kind: "availability_updated",
    decaId,
    detail: { availabilityDate, capacityMode, vehicleType },
  });
  return true;
}

/** #119 — an anonymised candidate for matching: never carrier name or
 *  contact details, only the fields relevant to compatibility. */
export type AvailabilityCandidate = {
  zone: string;
  /** 2026 correction to #119 — the canonical matching value; null for a
   *  record prepared before this correction, or a genuinely foreign/unknown
   *  postal code. Matching falls back to `zone`'s free text when absent on
   *  either side being compared. */
  zonePostalCode: string | null;
  preferredDestinationPostalCode: string | null;
  /** ACLARACIÓN FINAL — travels with `preferredDestinationPostalCode`; a
   *  match is only trusted when this is Spain (no real international postal
   *  geocoding exists in this project — never invent a match for a foreign
   *  postal code we can't actually validate). */
  preferredDestinationCountry: string | null;
  availabilityDate: Date;
  vehicleType: VehicleType | null;
  capacityMode: CapacityMode;
  linearMeters: number | null;
  maxWeightKg: number | null;
};

const DATE_WINDOW_DAYS = 3;

/** Loose, dependency-free place matching: same normalised string, or one
 *  contains the other (handles "Madrid" vs "Madrid capital"-style variants).
 *  The fallback for whichever side of a comparison has no postal code. */
function placesMatch(a: string, b: string): boolean {
  const na = a.trim().toLowerCase();
  const nb = b.trim().toLowerCase();
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

/**
 * 2026 correction to #119 — postal code is now the CANONICAL zone identifier
 * whenever both sides have one: an exact match, or (a coarse, real proximity
 * signal, not a substitute for actual geocoding/radius, which this project
 * doesn't have) the same first-2-digit Spanish province prefix. The model is
 * deliberately shaped so a future real radius calculation only has to
 * replace this one function — every caller already passes postal codes
 * through, unresolved, to here.
 */
function postalCodesMatch(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const pa = a.trim();
  const pb = b.trim();
  if (!pa || !pb) return false;
  if (pa === pb) return true;
  return pa.length >= 2 && pb.length >= 2 && pa.slice(0, 2) === pb.slice(0, 2);
}

/** Postal code when BOTH sides of this specific comparison have one, else
 *  the free-text place — never a partial/one-sided postal comparison. */
function zonesMatch(
  aText: string,
  aPostal: string | null,
  bText: string,
  bPostal: string | null,
): boolean {
  if (aPostal && bPostal) return postalCodesMatch(aPostal, bPostal);
  return placesMatch(aText, bText);
}

/**
 * ACLARACIÓN FINAL — "destino preferente" is now código postal + país only
 * (the free-text field is gone entirely, so there is no text fallback for
 * this comparison specifically). Only trusted when the preference's own
 * country is Spain — this project has no real international postal-code
 * geocoding, so a foreign preference is stored but never matched against,
 * per the correction's own "no inventar proximidades incorrectas".
 */
function preferredDestinationMatches(
  postal: string | null,
  country: string | null,
  otherPostal: string | null,
): boolean {
  if (!postal || !otherPostal) return false;
  if (country && country.trim().toLowerCase() !== "españa") return false;
  return postalCodesMatch(postal, otherPostal);
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
    const zoneToPreferred = preferredDestinationMatches(
      mine.preferredDestinationPostalCode,
      mine.preferredDestinationCountry,
      other.zonePostalCode,
    );
    const preferredToZone = preferredDestinationMatches(
      other.preferredDestinationPostalCode,
      other.preferredDestinationCountry,
      mine.zonePostalCode,
    );
    const zoneToZone = zonesMatch(mine.zone, mine.zonePostalCode, other.zone, other.zonePostalCode);
    return zoneToPreferred || preferredToZone || zoneToZone;
  });
}
