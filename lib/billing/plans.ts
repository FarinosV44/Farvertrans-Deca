/**
 * Plan catalogue for the FUTURE paid tier (#64 — design only).
 *
 * NOTHING in the product reads this yet. Pricing / plans / checkout are
 * forbidden for v1 (D-007 row 32, EPIC 01). This constant exists only so the
 * shape is designed and reviewable — see `docs/design/billing-model.md`. A
 * price change is a new `priceVersion` + a deploy, recorded like a Terms
 * version.
 *
 * Do NOT import this into any `app/**` file, the landing, or the panel.
 */

export type Plan = {
  key: string;
  name: string;
  /** Monthly price in euro cents, ex-VAT. `null` = not publicly priced / bespoke. */
  monthlyCents: number | null;
  /** What the plan includes, in product terms — not marketing copy. */
  includes: string[];
};

/** Illustrative only — real numbers are set when the feature is greenlit. */
export const PLANS: readonly Plan[] = [
  {
    key: "launch",
    name: "Lanzamiento",
    monthlyCents: 0,
    includes: ["Todo incluido durante la fase de lanzamiento"],
  },
  {
    key: "autonomo",
    name: "Autónomo",
    monthlyCents: null,
    includes: ["1 usuario", "DeCA ilimitados", "Historial", "Datos habituales"],
  },
  {
    key: "empresa",
    name: "Empresa",
    monthlyCents: null,
    includes: ["Multiusuario", "Roles y auditoría", "Plantillas", "Exportación"],
  },
] as const;

export const PRICE_VERSION = "design-2026-09" as const;
