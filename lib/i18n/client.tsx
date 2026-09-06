"use client";
import { createContext, useContext, useMemo } from "react";
import { es } from "./dictionaries/es";
import { ca } from "./dictionaries/ca";
import { eu } from "./dictionaries/eu";
import { gl } from "./dictionaries/gl";
import { en } from "./dictionaries/en";
import { fr } from "./dictionaries/fr";
import { de } from "./dictionaries/de";
import type { Messages } from "./dictionaries/es";
import type { Locale } from "./locale";

const DICTS: Record<Locale, Messages> = { es, ca, eu, gl, en, fr, de };

const LocaleContext = createContext<{ locale: Locale; dict: Messages }>({
  locale: "es",
  dict: es,
});

/**
 * Seeds client components with the locale the server already resolved
 * (`getLocale()`, cookie/Accept-Language) — no client-side flash, no second
 * lookup. Mounted once in the root layout.
 */
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, dict: DICTS[locale] }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

/** The current dictionary — `const t = useT(); t.crear.buttons.generate`. */
export function useT(): Messages {
  return useContext(LocaleContext).dict;
}
