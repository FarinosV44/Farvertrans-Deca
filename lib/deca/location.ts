import { z } from "zod";

/**
 * Structured loading/unloading location (PRODUCT #41 §2). Replaces the v1
 * loose `origin`/`destination` strings — both a company/establishment name
 * and a complete address are legally required for a goods DeCA.
 */

const trimmed = (min: number, max: number, msg: string) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(min, msg).max(max));

export const locationSchema = z.object({
  name: trimmed(2, 200, "Indica el nombre del establecimiento o empresa"),
  address: trimmed(4, 300, "Indica la dirección completa"),
  postalCode: trimmed(3, 12, "Indica el código postal"),
  city: trimmed(2, 120, "Indica la localidad"),
  province: trimmed(2, 120, "Indica la provincia"),
  country: trimmed(2, 80, "Indica el país"),
});

export type TransportLocation = z.infer<typeof locationSchema>;

/** Compact one-line form for tables, filters and CSV export. */
export function formatLocationShort(loc?: Partial<TransportLocation> | null): string {
  if (!loc) return "";
  return [loc.name, loc.city].filter(Boolean).join(" — ");
}

/** Full postal-address form for the review screen and the PDF. */
export function formatLocationFull(loc?: Partial<TransportLocation> | null): string {
  if (!loc) return "";
  const line2 = [loc.postalCode, loc.city].filter(Boolean).join(" ");
  const line3 = [loc.province, loc.country].filter(Boolean).join(", ");
  return [loc.name, loc.address, line2, line3].filter(Boolean).join(", ");
}
