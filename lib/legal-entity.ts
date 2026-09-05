import { BRAND } from "@/lib/brand";

/**
 * Centralised legal/custodian identity (TRUST #42 §1). The product brand
 * (`lib/brand.ts`) stays primary everywhere; this is the operating/custodian
 * entity, shown discreetly (footer, legal pages, registration, PDF custody
 * note) — never as the dominant visual element.
 *
 * `address` is intentionally a placeholder until the real registered address
 * is provided — never invent one (D-041 precedent: same pattern already used
 * for the legal pages before this identity existed).
 */
export const LEGAL_ENTITY = {
  /** Full legal/registered name. */
  name: "PRAETORIA, S.L.",
  /** Spanish tax id. */
  cif: "B21810452",
  /** Real registered address — set once provided by the owner; never fabricated. */
  address: "Domicilio social: pendiente de publicación",
  /** Support/operational contact — reuses the product's support address. */
  supportEmail: BRAND.supportEmail,
  /** Data-protection contact, if it ever differs from support. */
  privacyEmail: BRAND.supportEmail,
  legalNoticeUrl: "/aviso-legal",
  termsUrl: "/terminos",
  privacyUrl: "/privacidad",
  /** Public wording — service operator line (subtle, never the primary brand). */
  operatorLine: `Servicio operado por PRAETORIA, S.L. · CIF B21810452`,
  custodyLine: "Custodia digital de los documentos gestionada por PRAETORIA, S.L.",
  /** Secondary credibility line — the discreet legal-professional backing (#42 §2A). */
  legalBackingLine:
    "PRAETORIA, S.L. es un despacho jurídico con experiencia en servicios para empresas y profesionales del transporte.",
  /** Current Terms & Conditions / Privacy acceptance version (TRUST #42 §5). */
  termsVersion: "2026-09-04",
} as const;
