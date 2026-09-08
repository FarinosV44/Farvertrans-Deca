/**
 * Client-safe types + pure helpers for the commercial-treatment feature (#84).
 * No `server-only`, no Prisma — importable from client components (the
 * settings form, the wizard block) as well as the server modules.
 */

export type CommercialConsentMode = "none" | "per_deca" | "all";
export type CommercialContactChannel = "email" | "phone" | "both";

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

/** The DeCA fields that a given channel selection would communicate (#84). */
export type SharedFieldKey =
  | "carrierName"
  | "destination"
  | "availabilityDate"
  | "contactEmail"
  | "contactPhone";

export function sharedFieldKeys(channel: CommercialContactChannel | null): SharedFieldKey[] {
  const keys: SharedFieldKey[] = ["carrierName", "destination", "availabilityDate"];
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
