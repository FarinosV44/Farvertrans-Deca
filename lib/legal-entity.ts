import { BRAND } from "@/lib/brand";

/**
 * Centralised legal/custodian identity (TRUST #42 §1, LEGAL #52). The product
 * brand (`lib/brand.ts`) stays primary everywhere; this is the operating/
 * custodian entity, shown discreetly (footer, legal pages, registration, PDF
 * custody note) — never as the dominant visual element.
 */
export const LEGAL_ENTITY = {
  /** Full legal/registered name. */
  name: "PRAETORIA, S.L.",
  /** Spanish tax id. */
  cif: "B21810452",
  /** Registered address (LEGAL #52). */
  address: "Calle Pintor Francisco Ribalta 4A, 46540 El Puig, Valencia, España",
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
