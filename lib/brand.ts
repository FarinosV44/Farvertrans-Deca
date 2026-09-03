/**
 * Centralised product brand (BRAND #21). Every public-facing name, tagline and
 * contact detail comes from here — changing the brand before launch is a
 * one-file edit, not a repo-wide find-and-replace.
 *
 * `Farvertrans S.L.` stays as the company behind the product (legal / commercial
 * attribution only); the product itself is marketed under `name`.
 *
 * Working name: "DeCA Fácil". NOT verified for trademark/domain availability —
 * that check happens before the domain is bought (see issue #21 naming gate).
 */
export const BRAND = {
  /** Full product name — headers, titles, metadata, PDF. */
  name: "DeCA Fácil",
  /** Short name — favicon alt, tight spaces, mobile. */
  shortName: "DeCA Fácil",
  /** One-line value proposition. */
  tagline: "Genera tu Documento Electrónico de Control en menos de 2 minutos.",
  /** Company/legal attribution — shown as a small line, never as the product name. */
  legalName: "Farvertrans S.L.",
  attribution: "Un servicio de Farvertrans S.L.",
  /** Support / operational contact. */
  supportEmail: "hola@decafacil.es",
  /** Canonical base URL comes from the environment (NEXT_PUBLIC_FVD_BASE_URL). */
  get baseUrl(): string {
    return process.env.NEXT_PUBLIC_FVD_BASE_URL ?? "http://localhost:3000";
  },
  /** Brand colour (matches --color-primary in globals.css). */
  color: "#0b5cff",
} as const;

/** `"<title> | DeCA Fácil"` — the metadata title template. */
export const titleTemplate = `%s | ${BRAND.name}`;
