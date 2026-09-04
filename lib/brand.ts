/**
 * Centralised product brand (BRAND #21). Every public-facing name, tagline and
 * contact detail comes from here — changing the brand is a one-file edit, not a
 * repo-wide find-and-replace.
 *
 * The product stands on its own as "DeCA Fácil" — it carries no company
 * attribution on any public surface (decision 2026-09-04). NOT verified for
 * trademark/domain availability — that check happens before the domain is
 * bought (see issue #21 naming gate).
 */
export const BRAND = {
  /** Full product name — headers, titles, metadata, PDF. */
  name: "DeCA Fácil",
  /** Short name — favicon alt, tight spaces, mobile. */
  shortName: "DeCA Fácil",
  /** One-line value proposition. */
  tagline: "Genera tu Documento Electrónico de Control en menos de 2 minutos.",
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
