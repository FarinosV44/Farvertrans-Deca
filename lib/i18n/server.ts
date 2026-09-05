import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./locale";
import { es } from "./dictionaries/es";
import { en } from "./dictionaries/en";
import type { Messages } from "./dictionaries/es";

const DICTS: Record<Locale, Messages> = { es, en };

/**
 * Server-side locale resolution: the explicit `fvd_locale` cookie (set by the
 * switcher, or restored from `User.preferredLocale` on login) wins; otherwise
 * Spanish (D-002) — this product's default market and language. Deliberately
 * NOT driven by `Accept-Language`: browsers/test runners commonly default
 * that header to `en-*` regardless of the visitor's actual language, which
 * would silently flip a Spanish visitor (or the entire e2e suite) to English.
 * English is opt-in, via the switcher or a saved account preference only.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const cookieVal = store.get(LOCALE_COOKIE)?.value;
  return isLocale(cookieVal) ? cookieVal : DEFAULT_LOCALE;
}

export async function getDictionary(locale?: Locale): Promise<Messages> {
  return DICTS[locale ?? (await getLocale())];
}
