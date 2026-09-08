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
