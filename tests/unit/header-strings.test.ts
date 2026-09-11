import { describe, expect, it } from "vitest";
import { HEADER_STRINGS, HEADER_APP_NAME } from "@/lib/i18n/header-strings";
import { LOCALES } from "@/lib/i18n/locale";
import { es } from "@/lib/i18n/dictionaries/es";
import { ca } from "@/lib/i18n/dictionaries/ca";
import { eu } from "@/lib/i18n/dictionaries/eu";
import { gl } from "@/lib/i18n/dictionaries/gl";
import { en } from "@/lib/i18n/dictionaries/en";
import { fr } from "@/lib/i18n/dictionaries/fr";
import { de } from "@/lib/i18n/dictionaries/de";
import { it as itDict } from "@/lib/i18n/dictionaries/it";
import { pt } from "@/lib/i18n/dictionaries/pt";
import { BRAND } from "@/lib/brand";

const FULL_DICTS = { es, ca, eu, gl, en, fr, de, it: itDict, pt };

/**
 * #96 — `lib/i18n/header-strings.ts` is a hand-kept CLIENT-SAFE slice of the
 * full per-locale dictionaries (so the header's locale swap doesn't need to
 * bundle the entire landing's copy in every locale). This test is the thing
 * that keeps it honest: any drift between the two — a dictionary string
 * changed but the slice forgotten — fails here, not silently in the UI.
 */
describe("#96 — header-strings.ts stays in sync with the full dictionaries", () => {
  it("covers every locale", () => {
    expect(new Set(Object.keys(HEADER_STRINGS))).toEqual(new Set(LOCALES));
  });

  it("appName is BRAND.name, identical in every locale (never translated)", () => {
    expect(HEADER_APP_NAME).toBe(BRAND.name);
    for (const locale of LOCALES) {
      expect(FULL_DICTS[locale].common.appName).toBe(BRAND.name);
    }
  });

  it.each(LOCALES)("%s: every header string matches the full dictionary verbatim", (locale) => {
    const full = FULL_DICTS[locale];
    const slice = HEADER_STRINGS[locale];
    expect(slice.headerCta).toBe(full.common.headerCta);
    expect(slice.loginCta).toBe(full.common.loginCta);
    expect(slice.panelCta).toBe(full.common.panelCta);
    expect(slice.howItWorks).toBe(full.nav.howItWorks);
    expect(slice.plans).toBe(full.nav.plans);
    expect(slice.regulation).toBe(full.nav.regulation);
    expect(slice.guides).toBe(full.nav.guides);
    expect(slice.blog).toBe(full.nav.blog);
    expect(slice.faq).toBe(full.nav.faq);
  });
});
