export const LOCALES = ["es", "ca", "eu", "gl", "en", "fr", "de", "it"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

/**
 * Native endonym for each locale — how a language names itself, not a
 * translation into the current UI language (the universal convention for a
 * language picker: "Español" reads the same whether the page is in French or
 * German). Single source of truth so the switcher UI never needs per-locale
 * dictionary entries for this.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  es: "Español",
  ca: "Català",
  eu: "Euskara",
  gl: "Galego",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
};
/** Client-readable (not httpOnly) — the switcher and analytics both read it. */
export const LOCALE_COOKIE = "fvd_locale";

export function isLocale(v: string | null | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}
