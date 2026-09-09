import { z } from "zod";
import { normalizePlate } from "./plate";
import { locationSchema } from "./location";
import { DECA_ROLES } from "./roles";

/**
 * DeCA data model (R-2 / Art. 6 Orden FOM/2861/2012). Strings are trimmed; the
 * three steps of the wizard map to step1/step2/step3 below and are validated
 * incrementally, then the whole payload is validated once more before generation.
 */

const trimmed = (min: number, max: number, msg: string) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(min, msg).max(max));

/**
 * Postal code / town of a party's domicilio. OPTIONAL, for the same reason
 * province is optional on a location (#75): forcing it produced junk input, and
 * many non-Spanish domiciles carry the locality inside the free `address` line.
 * When present it is shown on the PDF as its own "CP · población" line under the
 * street address (user request 2026-09-08 — "debería salir … población y cp").
 */
const optionalTown = (max: number, msg: string) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined),
    z.string().min(2, msg).max(max).optional(),
  );

export const partySchema = z.object({
  name: trimmed(2, 200, "Indica el nombre o razón social"),
  nif: trimmed(3, 20, "Indica el NIF"),
  postalCode: optionalTown(12, "Indica un código postal válido"),
  city: optionalTown(120, "Indica una población válida"),
});

export const shipperSchema = partySchema.extend({
  address: trimmed(4, 300, `Indica el domicilio del ${DECA_ROLES.shipper.inline}`),
});

// Art. 6.1.a) Orden FOM/2861/2012 requires the domicilio of BOTH parties.
export const carrierSchema = partySchema.extend({
  address: trimmed(4, 300, `Indica el domicilio del ${DECA_ROLES.carrier.inline}`),
});

/** Party domicilio as display lines: street, then "CP población", each dropped
 *  when absent (same compose discipline as `formatLocationCityLine`, #75). */
export function formatPartyAddressLines(
  p?: { address?: string | null; postalCode?: string | null; city?: string | null } | null,
): string[] {
  if (!p) return [];
  const town = [p.postalCode, p.city].filter(Boolean).join(" ").trim();
  return [p.address ?? "", town].map((s) => s.trim()).filter((s) => s !== "");
}

export const step1Schema = z.object({
  shipper: shipperSchema,
  carrier: carrierSchema,
});

/**
 * Structured loading/unloading model (PRODUCT #41 §2–3). `unloadDate` cannot
 * precede `loadDate`; same-day loading/unloading is allowed (>=, not >).
 */
const step2RawSchema = z.object({
  loadLocation: locationSchema,
  unloadLocation: locationSchema,
  loadDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de carga (AAAA-MM-DD)"),
  unloadDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de descarga (AAAA-MM-DD)"),
});

const DATE_ORDER_MESSAGE = "La fecha de descarga no puede ser anterior a la de carga";

function unloadNotBeforeLoad(d: { loadDate: string; unloadDate: string }): boolean {
  // Only compare once both dates are well-formed; a malformed date is already
  // flagged by its own regex issue.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.loadDate) || !/^\d{4}-\d{2}-\d{2}$/.test(d.unloadDate))
    return true;
  return d.unloadDate >= d.loadDate;
}

export const step2Schema = step2RawSchema.refine(unloadNotBeforeLoad, {
  message: DATE_ORDER_MESSAGE,
  path: ["unloadDate"],
});

/**
 * Weight / legally-appropriate measure (Art. 6.1.b). Kept VERBATIM — never
 * silently reformatted, so "12.500 kg", "12,5 t" or "una plataforma completa"
 * all pass through to the PDF exactly as typed. Only obviously-meaningless
 * values (zero, placeholders) are rejected.
 */
const MEANINGLESS_WEIGHT =
  /^(0+([.,]0+)?\s*(kg|kgs|t|tn|toneladas?|kilos?)?|-+|\.+|n\/?a|s\/?e|sin\s+especificar|desconocido)$/i;

/**
 * A bare number (only digits and a decimal/thousands separator, no unit at
 * all) is assumed to be in tonnes — the unit this field asks for by default
 * (2026-09-09, user request: people shouldn't have to type the unit
 * themselves) — and gets " t" appended. Anything that already carries a
 * unit (kg, another "12,5 t") or is a genuinely alternative measure ("una
 * plataforma completa") is left exactly as typed — this only fills in the
 * unit when none was given, never reformats or overrides one already there.
 */
const BARE_NUMBER = /^\d+([.,]\d+)?$/;
const withDefaultWeightUnit = (w: string) => (BARE_NUMBER.test(w) ? `${w} t` : w);

export const step3Schema = z.object({
  goods: trimmed(2, 300, "Describe la mercancía"),
  weight: trimmed(1, 60, "Indica el peso o una medida alternativa")
    .transform(withDefaultWeightUnit)
    .refine(
      (w) => !MEANINGLESS_WEIGHT.test(w),
      "Indica un peso real (p. ej. 12 t) o una medida alternativa concreta",
    ),
  tractorPlate: z
    .string()
    .transform((s) => normalizePlate(s))
    .pipe(z.string().min(2, "Indica la matrícula de la tractora").max(20)),
  trailerPlate: z
    .string()
    .transform((s) => (s ? normalizePlate(s) : ""))
    .pipe(z.string().max(20))
    .optional()
    .or(z.literal("")),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

// step2Schema is a ZodEffects (post-.refine()) and cannot itself be .merge()d,
// so the full payload merges the raw shape and reapplies the same date-order rule.
export const decaPayloadSchema = step1Schema
  .merge(step2RawSchema)
  .merge(step3Schema)
  .refine(unloadNotBeforeLoad, { message: DATE_ORDER_MESSAGE, path: ["unloadDate"] });

export type DecaPayload = z.infer<typeof decaPayloadSchema>;
export type Step1 = z.infer<typeof step1Schema>;
export type Step2 = z.infer<typeof step2Schema>;
export type Step3 = z.infer<typeof step3Schema>;
export type { TransportLocation } from "./location";

export const STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema] as const;
