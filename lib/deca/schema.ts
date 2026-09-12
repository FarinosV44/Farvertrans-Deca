import { z } from "zod";
import { normalizePlate } from "./plate";
import { locationSchema } from "./location";
import { DECA_ROLES } from "./roles";

/**
 * DeCA data model (R-2 / Art. 6 Orden FOM/2861/2012). Strings are trimmed; the
 * three steps of the wizard map to step1/step2/step3 below and are validated
 * incrementally, then the whole payload is validated once more before generation.
 *
 * #112 — MULTIPLE SHIPMENTS ("envíos", Resolución de 5 de junio de 2026 apdo.
 * Sexto). A DeCA may bundle several real loading/unloading legs when they
 * share the SAME shipper and carrier — those two stay DeCA-level fields
 * (never per-shipment), which is what makes "cannot mix a different shipper/
 * carrier in one DeCA" true by construction rather than a validation rule.
 * Per the user's own scope: `loadLocation`/`unloadLocation`/`goods`/`weight`/
 * `recipient` are ALWAYS explicit per shipment; `loadDate`/`unloadDate`/
 * `tractorPlate`/`trailerPlate`/`notes` have a DeCA-level DEFAULT that a
 * shipment may override. `resolveShipment()` below computes the final
 * effective value for each field — the PDF and every other reader must go
 * through it, never read a shipment's raw (possibly-absent) override field
 * directly.
 *
 * BACKWARD COMPATIBILITY: `decaPayloadSchema` accepts EITHER shape — the
 * pre-#112 flat single-shipment body (every existing caller: the wizard's
 * simple flow, `lib/diagnostics.ts`, every e2e spec that posts to
 * `/api/deca`) or the new `{ ..., shipments: [...] }` body — and normalizes
 * both into the SAME canonical parsed `DecaPayload` type. A flat legacy body
 * becomes a single-element `shipments` array; nothing about its accepted
 * values or error messages changes.
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

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const dateField = (msg: string) => z.string().regex(DATE_RE, msg);

/**
 * Structured loading/unloading model (PRODUCT #41 §2–3). Shared by both the
 * DeCA-level default dates and a shipment's own load/unload dates.
 */
const step2RawSchema = z.object({
  loadLocation: locationSchema,
  unloadLocation: locationSchema,
  loadDate: dateField("Fecha de carga (AAAA-MM-DD)"),
  unloadDate: dateField("Fecha de descarga (AAAA-MM-DD)"),
});

const DATE_ORDER_MESSAGE = "La fecha de descarga no puede ser anterior a la de carga";

function unloadNotBeforeLoad(d: { loadDate: string; unloadDate: string }): boolean {
  // Only compare once both dates are well-formed; a malformed date is already
  // flagged by its own regex issue.
  if (!DATE_RE.test(d.loadDate) || !DATE_RE.test(d.unloadDate)) return true;
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
 * all) is assumed to be in KILOGRAMS — the unit this field asks for by
 * default (2026-09-12, user request: the form and the generated DeCA both
 * use kg, not tonnes) — and gets " kg" appended. Anything that already
 * carries a unit (t, another "12500 kg") or is a genuinely alternative
 * measure ("una plataforma completa") is left exactly as typed — this only
 * fills in the unit when none was given, never reformats or overrides one
 * already there. This only changes how a FUTURE bare number is interpreted;
 * an already-generated DeCA's weight string is stored verbatim and never
 * rewritten.
 */
const BARE_NUMBER = /^\d+([.,]\d+)?$/;
const withDefaultWeightUnit = (w: string) => (BARE_NUMBER.test(w) ? `${w} kg` : w);

const weightField = z
  .string()
  .trim()
  .min(1, "Indica el peso o una medida alternativa")
  .max(60, "Indica el peso o una medida alternativa")
  .transform(withDefaultWeightUnit)
  .refine(
    (w) => !MEANINGLESS_WEIGHT.test(w),
    "Indica un peso real (p. ej. 12 t) o una medida alternativa concreta",
  );

const tractorPlateField = z
  .string()
  .transform((s) => normalizePlate(s))
  .pipe(z.string().min(2, "Indica la matrícula de la tractora").max(20));

const trailerPlateField = z
  .string()
  .transform((s) => (s ? normalizePlate(s) : ""))
  .pipe(z.string().max(20))
  .optional()
  .or(z.literal(""));

export const step3Schema = z.object({
  goods: trimmed(2, 300, "Describe la mercancía"),
  weight: weightField,
  tractorPlate: tractorPlateField,
  trailerPlate: trailerPlateField,
  reference: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type Step1 = z.infer<typeof step1Schema>;
export type Step2 = z.infer<typeof step2Schema>;
export type Step3 = z.infer<typeof step3Schema>;
export type { TransportLocation } from "./location";

export const STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema] as const;

// ---------------------------------------------------------------------------
// #112 — per-shipment schema + the DeCA-level default fields a shipment may
// override. `recipient` is new (no formal party today has this role) — kept
// deliberately lightweight (a name, not a full NIF/address party) per the
// user's explicit scope decision.
// ---------------------------------------------------------------------------

export const shipmentSchema = z.object({
  loadLocation: step2RawSchema.shape.loadLocation,
  unloadLocation: step2RawSchema.shape.unloadLocation,
  goods: step3Schema.shape.goods,
  weight: step3Schema.shape.weight,
  recipient: z.string().trim().max(200).optional().or(z.literal("")),
  // Overrides — absent/omitted means "use the DeCA-level default".
  loadDate: dateField("Fecha de carga (AAAA-MM-DD)").optional(),
  unloadDate: dateField("Fecha de descarga (AAAA-MM-DD)").optional(),
  tractorPlate: tractorPlateField.optional(),
  trailerPlate: trailerPlateField,
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type ShipmentPayload = z.infer<typeof shipmentSchema>;

/** The final, effective value of every shipment field once its overrides are
 *  applied over the DeCA-level defaults. The PDF and every other reader use
 *  ONLY this — never a shipment's raw (possibly-absent) override field. */
export type ResolvedShipment = {
  loadLocation: ShipmentPayload["loadLocation"];
  unloadLocation: ShipmentPayload["unloadLocation"];
  goods: string;
  weight: string;
  recipient: string;
  loadDate: string;
  unloadDate: string;
  tractorPlate: string;
  trailerPlate: string;
  notes: string;
};

const decaDefaultsSchema = z.object({
  loadDate: dateField("Fecha de carga (AAAA-MM-DD)"),
  unloadDate: dateField("Fecha de descarga (AAAA-MM-DD)"),
  tractorPlate: tractorPlateField,
  trailerPlate: trailerPlateField,
  reference: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

const canonicalSchema = step1Schema
  .merge(decaDefaultsSchema)
  .extend({ shipments: z.array(shipmentSchema).min(1, "Añade al menos un envío") })
  .superRefine((d, ctx) => {
    // The DeCA-level defaults must themselves be date-ordered (used as-is
    // whenever a shipment does not override either date).
    if (!unloadNotBeforeLoad({ loadDate: d.loadDate, unloadDate: d.unloadDate })) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: DATE_ORDER_MESSAGE,
        path: ["unloadDate"],
      });
    }
    // Every RESOLVED shipment (default + its own override) must be
    // date-ordered too — this is what actually matters once overrides exist.
    d.shipments.forEach((s, i) => {
      const loadDate = s.loadDate ?? d.loadDate;
      const unloadDate = s.unloadDate ?? d.unloadDate;
      if (!unloadNotBeforeLoad({ loadDate, unloadDate })) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: DATE_ORDER_MESSAGE,
          path: ["shipments", i, "unloadDate"],
        });
      }
      // #128: vehicle is a single DeCA-level datum once there is more than one
      // shipment (D-214) — the printed "Vehículo" summary block always shows
      // the DeCA-level default, never a per-shipment resolved value, so a
      // differing per-shipment override would compute a resolved plate
      // (`resolveShipment()`) that the PDF never actually prints. A single
      // shipment has no such block — its own plate IS what renders, so no
      // ambiguity exists there and an override is still allowed.
      if (d.shipments.length > 1) {
        if (s.tractorPlate !== undefined && s.tractorPlate !== d.tractorPlate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La matrícula tractora es única para todo el DeCA; no puede variar por envío.",
            path: ["shipments", i, "tractorPlate"],
          });
        }
        if (s.trailerPlate && s.trailerPlate !== d.trailerPlate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "La matrícula del remolque es única para todo el DeCA; no puede variar por envío.",
            path: ["shipments", i, "trailerPlate"],
          });
        }
      }
    });
  });

/**
 * Accepts either the pre-#112 flat single-shipment body or the new
 * `{ ..., shipments: [...] }` body and normalizes both into ONE element with
 * a `shipments` array before the canonical schema runs. A flat body's
 * `loadLocation`/`unloadLocation`/`goods`/`weight` become its single
 * shipment; everything else (shipper/carrier/dates/plates/reference/notes)
 * was already DeCA-level and needs no change.
 */
function normalizeDecaInput(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) return raw;
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r.shipments)) return raw; // already the new shape
  const { loadLocation, unloadLocation, goods, weight, recipient, ...rest } = r;
  return { ...rest, shipments: [{ loadLocation, unloadLocation, goods, weight, recipient }] };
}

export const decaPayloadSchema = z.preprocess(normalizeDecaInput, canonicalSchema);

export type DecaPayload = z.infer<typeof canonicalSchema>;

/** Merge a shipment's overrides onto the DeCA-level defaults into the final,
 *  effective value for every field — the single source of truth the PDF and
 *  every other reader must use. */
export function resolveShipment(deca: DecaPayload, shipment: ShipmentPayload): ResolvedShipment {
  return {
    loadLocation: shipment.loadLocation,
    unloadLocation: shipment.unloadLocation,
    goods: shipment.goods,
    weight: shipment.weight,
    recipient: shipment.recipient ?? "",
    loadDate: shipment.loadDate ?? deca.loadDate,
    unloadDate: shipment.unloadDate ?? deca.unloadDate,
    tractorPlate: shipment.tractorPlate ?? deca.tractorPlate,
    trailerPlate: shipment.trailerPlate || deca.trailerPlate || "",
    notes: shipment.notes || deca.notes || "",
  };
}

/** All shipments, resolved — what every renderer/consumer should iterate. */
export function resolveShipments(deca: DecaPayload): ResolvedShipment[] {
  return deca.shipments.map((s) => resolveShipment(deca, s));
}

/**
 * `shipments[0]`'s resolved view, in the EXACT pre-#112 flat shape
 * (`loadLocation`/`unloadLocation`/`goods`/`weight`/`loadDate`/`unloadDate`/
 * `tractorPlate`/`trailerPlate`/`notes` at the top level). Written into
 * `dataJson` ALONGSIDE the new `shipments` array (never instead of it) so
 * every existing reader of the flat shape (history, search, CSV export,
 * templates, route-intel, the admin cross-tenant table — none of them
 * touched in this sprint) keeps working completely unchanged: it reads
 * "shipment 1," which is the correct, intentional summary for now
 * (Sprint 2 adds the "+N envíos" badge on top of this same value).
 */
export function legacyMirrorFields(deca: DecaPayload): Record<string, unknown> {
  const first = resolveShipments(deca)[0];
  return {
    loadLocation: first.loadLocation,
    unloadLocation: first.unloadLocation,
    goods: first.goods,
    weight: first.weight,
    loadDate: first.loadDate,
    unloadDate: first.unloadDate,
    tractorPlate: first.tractorPlate,
    trailerPlate: first.trailerPlate,
    notes: first.notes,
  };
}

/** Parses a resolved weight string to kilograms when it is a plain number +
 *  recognised unit (kg/t, matching `withDefaultWeightUnit`'s own units) —
 *  returns `null` for anything else (a genuinely alternative measure like
 *  "una plataforma completa" is never guessed at). */
function parseWeightKg(w: string): number | null {
  const m = /^([\d.,]+)\s*(kg|kgs|t|tn|toneladas?)?$/i.exec(w.trim());
  if (!m) return null;
  const n = Number(m[1].replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(n)) return null;
  const unit = (m[2] ?? "t").toLowerCase();
  return unit.startsWith("k") ? n : n * 1000;
}

/**
 * Sum of every shipment's resolved weight, in kilograms, formatted to match
 * the app's own "12.500 kg" convention — ONLY when every shipment's weight
 * is numeric-parseable. `allParsed: false` means at least one shipment used
 * a genuinely alternative, non-numeric measure ("una plataforma completa");
 * the total is never fabricated or partially computed in that case — never
 * silently drop a shipment's weight from the sum. Takes just `{ weight }` (a
 * `ResolvedShipment[]` satisfies this) so the wizard's own review summary can
 * call it on raw, not-yet-resolved form/extra-shipment fields too — weight is
 * never DeCA-level-overridable, so there is nothing to resolve for it.
 */
export function sumWeights(shipments: { weight: string }[]): { total: string; allParsed: boolean } {
  const kgs = shipments.map((s) => parseWeightKg(s.weight));
  if (kgs.some((kg) => kg === null)) return { total: "", allParsed: false };
  const totalKg = (kgs as number[]).reduce((a, b) => a + b, 0);
  return { total: `${totalKg.toLocaleString("es-ES")} kg`, allParsed: true };
}
