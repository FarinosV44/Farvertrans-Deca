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
  // Province/region is OPTIONAL (#75). Many non-Spanish addresses have no
  // equivalent, and forcing the field pushed operators to type junk into it
  // ("Soltero" was seen on a real PDF). Empty/whitespace → omitted from the
  // document entirely; never inferred, never substituted.
  province: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined),
    z.string().min(2, "Indica una provincia válida").max(120).optional(),
  ),
  country: trimmed(2, 80, "Indica el país"),
});

export type TransportLocation = z.infer<typeof locationSchema>;

/** Compact one-line form for tables, filters and CSV export. */
export function formatLocationShort(loc?: Partial<TransportLocation> | null): string {
  if (!loc) return "";
  return [loc.name, loc.city].filter(Boolean).join(" — ");
}

/**
 * Full postal-address form for the review screen and the PDF. Built ONLY from
 * the address fields actually present — a missing province leaves no gap, no
 * stray separator, and nothing is invented in its place (#75).
 */
export function formatLocationFull(loc?: Partial<TransportLocation> | null): string {
  if (!loc) return "";
  const line2 = [loc.postalCode, loc.city].filter(Boolean).join(" ");
  const line3 = [loc.province, loc.country].filter(Boolean).join(", ");
  return [loc.name, loc.address, line2, line3].filter(Boolean).join(", ");
}

/**
 * The "postal code · city — province, country" line as shown in the PDF route
 * card. Kept here (not inline in the renderer) so the compose rules — drop any
 * absent part, never emit a dangling "— " or ", " — are unit-tested (#75).
 */
export function formatLocationCityLine(loc?: Partial<TransportLocation> | null): string {
  if (!loc) return "";
  const left = [loc.postalCode, loc.city].filter(Boolean).join(" ");
  const right = [loc.province, loc.country].filter(Boolean).join(", ");
  return [left, right].filter(Boolean).join(" — ");
}
