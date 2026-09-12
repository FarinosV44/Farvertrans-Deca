/**
 * Client-safe types + pure helpers for the commercial-treatment feature (#84).
 * No `server-only`, no Prisma — importable from client components (the
 * settings form, the wizard block) as well as the server modules.
 */

export type CommercialConsentMode = "none" | "per_deca" | "all";
export type CommercialContactChannel = "email" | "phone" | "both";

/** #119 — "full" (Camión completo) or "partial" (Grupaje). A bare string type
 *  (not a Prisma enum) so a future value never needs a migration. */
export type CapacityMode = "full" | "partial";
/** #119 — expanded per the user's 2026 correction: "lona"/"frigorifico" plus
 *  "megatrailer"/"jumbo"/"frigolona"/"otro". Deliberately still a bare string
 *  union (not a Prisma enum) — the correction's own "mantener el modelo
 *  extensible para añadir nuevos tipos sin una refactorización grande." A
 *  free-text specify field (`vehicleTypeOther`) accompanies "otro" only. */
export type VehicleType = "lona" | "frigorifico" | "megatrailer" | "jumbo" | "frigolona" | "otro";

export const VEHICLE_TYPES: readonly VehicleType[] = [
  "lona",
  "frigorifico",
  "megatrailer",
  "jumbo",
  "frigolona",
  "otro",
];

export function isVehicleType(v: unknown): v is VehicleType {
  return typeof v === "string" && (VEHICLE_TYPES as readonly string[]).includes(v);
}

export type CommercialTreatmentState = {
  mode: CommercialConsentMode;
  channel: CommercialContactChannel | null;
  contactEmail: string | null;
  contactPhone: string | null;
  version: string | null;
  grantedAt: Date | null;
  revokedAt: Date | null;
  updatedAt: Date | null;
};

/** The DeCA fields that a given channel selection would communicate (#84),
 *  plus the voluntary next-load preference fields added by #119 — these are
 *  never derived from the DeCA and are shared whenever the record exists
 *  (they aren't gated by the contact channel like email/phone are). */
export type SharedFieldKey =
  | "carrierName"
  | "destination"
  | "availabilityDate"
  | "contactEmail"
  | "contactPhone"
  | "preferredDestination"
  | "capacityMode"
  | "linearMeters"
  | "maxWeightKg"
  | "vehicleType"
  /** 2026 correction to #119 — postal code is now the canonical matching
   *  value; the free-text destination/preferredDestination stay for display. */
  | "availabilityPostalCode"
  | "preferredDestinationPostalCode"
  | "vehicleTypeOther";

export function sharedFieldKeys(channel: CommercialContactChannel | null): SharedFieldKey[] {
  const keys: SharedFieldKey[] = [
    "carrierName",
    "destination",
    "availabilityDate",
    "preferredDestination",
    "capacityMode",
    "linearMeters",
    "maxWeightKg",
    "vehicleType",
    "availabilityPostalCode",
    "preferredDestinationPostalCode",
    "vehicleTypeOther",
  ];
  if (channel === "email" || channel === "both") keys.push("contactEmail");
  if (channel === "phone" || channel === "both") keys.push("contactPhone");
  return keys;
}

/**
 * Spanish display labels for the authorised contact channel (#85). The admin
 * area is ES-only by convention (D-117); the user-facing settings form and the
 * wizard read their labels from the i18n dictionaries instead. The `phone`
 * value is shown as "WhatsApp" (#85) — the stored enum value is unchanged.
 */
const COMMERCIAL_CHANNEL_LABEL_ES: Record<CommercialContactChannel, string> = {
  email: "Correo electrónico",
  phone: "WhatsApp",
  both: "Correo y WhatsApp",
};

/** ES label for a stored channel value; echoes an unknown value unchanged. */
export function commercialChannelLabelEs(channel: string | null | undefined): string {
  if (!channel) return "—";
  return COMMERCIAL_CHANNEL_LABEL_ES[channel as CommercialContactChannel] ?? channel;
}
