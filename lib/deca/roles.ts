/**
 * Canonical Spanish names for the two parties of a DeCA (LEGAL #61).
 *
 * The 2026 resolution distinguishes the party that *contracts* the transport
 * ("cargador contractual") from the one that *performs* it ("transportista
 * efectivo"). These strings are the single source of truth for every
 * Spanish-only, non-i18n surface: the generated PDF, the correction-diff row
 * labels, and the zod validation messages.
 *
 * User-facing UI copy is translated and goes through the i18n dictionaries
 * instead (`t.legal.roles.*`); the Spanish (`es`) values there MUST match the
 * `title` / `short` strings below so there is exactly one wording to maintain.
 *
 * NOT to be confused with the `CompanyProfile` onboarding categories
 * ("Transportista de mercancías", "Empresa cargadora", …) — those are a
 * business-type self-classification, a different concept, and are left as-is.
 */
export const DECA_ROLES = {
  shipper: {
    /** Sentence-case heading / label form. */
    title: "Cargador contractual",
    /** Mid-sentence form. */
    inline: "cargador contractual",
    /** Bare short form, for tight table headers and machine-ish contexts. */
    short: "cargador",
    /** All-caps, for the PDF. */
    upper: "CARGADOR CONTRACTUAL",
  },
  carrier: {
    title: "Transportista efectivo",
    inline: "transportista efectivo",
    short: "transportista",
    upper: "TRANSPORTISTA EFECTIVO",
  },
} as const;

export type DecaRoleKey = keyof typeof DECA_ROLES;
