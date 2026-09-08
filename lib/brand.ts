/**
 * Centralised product brand (BRAND #21). Every public-facing name, tagline and
 * contact detail comes from here — changing the brand is a one-file edit, not a
 * repo-wide find-and-replace.
 *
 * The product stands on its own as "DeCA Profesional" — it carries no company
 * attribution on any public surface (decision 2026-09-04, renamed from "DeCA
 * Fácil" per D-081). NOT verified for trademark/domain availability — that
 * check happens before the domain is bought (see issue #21 naming gate).
 */
export const BRAND = {
  /** Full product name — headers, titles, metadata, PDF. */
  name: "DeCA Profesional",
  /** Short name — favicon alt, tight spaces, mobile. */
  shortName: "DeCA Profesional",
  /** One-line value proposition. */
  tagline: "Genera tu Documento Electrónico de Control en menos de 2 minutos.",
  /**
   * TECHNICAL support (#86 p6 — kept fully separate from the legal channel).
   * The email stays PRAETORIA's dedicated DeCA address; legal has its own
   * (`LEGAL_ENTITY.legalEmail` = info@praetoriaabogados.es).
   */
  supportEmail: "Deca@praetoriaabogados.es",
  /** Technical-support phone (owner directive, 2026-09-06). No longer the primary channel (#86 p6). */
  supportPhone: "607 52 77 19",
  /**
   * WhatsApp numbers for the panel help centre. International format, digits
   * only. Technical and legal currently share the same line (607 52 77 19)
   * but keep their own pre-filled message and their own section (#86 p6) so
   * the numbers can split later with a one-line edit.
   */
  supportWhatsapp: "34607527719",
  legalWhatsapp: "34607527719",
  /** Human-readable support hours, shown beside the channels when set. */
  supportHours: "",
  /** Canonical base URL comes from the environment (NEXT_PUBLIC_FVD_BASE_URL). */
  get baseUrl(): string {
    return process.env.NEXT_PUBLIC_FVD_BASE_URL ?? "http://localhost:3000";
  },
  /** Brand colour (matches --color-primary in globals.css). */
  color: "#0b5cff",
} as const;

/** `"<title> | DeCA Profesional"` — the metadata title template. */
export const titleTemplate = `%s | ${BRAND.name}`;
