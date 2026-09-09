"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_NAMES, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n/locale";
import { HEADER_STRINGS } from "@/lib/i18n/header-strings";
import { GlobeIcon, CheckIcon } from "@/components/panel/icons";

function readLocaleCookie(): Locale | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const v = m ? decodeURIComponent(m[1]) : null;
  return isLocale(v) ? v : null;
}

/**
 * #96 (Core Web Vitals): patches the header's OTHER translated text nodes
 * (marked `data-i18n-key` in `SiteHeader`) in place, client-side, with no
 * server round-trip. Needed because a STATIC page (the SEO cluster, legal
 * pages — #96) always server-renders the Spanish default so it stays
 * cacheable; a visitor whose `fvd_locale` cookie already says otherwise (or
 * who just switched) gets corrected here instead of via `getLocale()`.
 * A DYNAMIC page's own `router.refresh()` already re-renders these same
 * nodes correctly server-side, so this is a harmless no-op there (the text
 * already matches).
 */
function applyHeaderStrings(locale: Locale) {
  const strings = HEADER_STRINGS[locale];
  for (const [key, value] of Object.entries(strings)) {
    document.querySelectorAll(`[data-i18n-key="${key}"]`).forEach((el) => {
      el.textContent = value;
    });
  }
}

/**
 * Locale picker (I18N #1, redesigned per #55 §4 for 8 locales:
 * es/ca/eu/gl/en/fr/de/it). A native `<details>`/`<summary>` popover — same
 * proven pattern as `AccountMenu` (no custom open/close JS, closes on
 * outside click via the browser, keyboard-operable by default) — showing a
 * globe icon + the current locale code, expanding to a list of native
 * language names (endonyms, not translated — the universal convention).
 *
 * This replaces the earlier one-button-per-locale row, which had already
 * broken the header's 360px no-overflow budget three times over as locales
 * were added (D-072/D-073/D-074) and would have broken it a fourth time the
 * moment the wordmark text itself grew (D-081, "DeCA Fácil" → "DeCA
 * Profesional"). A dropdown's footprint is now CONSTANT regardless of how
 * many locales exist or how long the brand name is.
 */
export function LanguageSwitcher({ current: serverCurrent }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<Locale | null>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  // #96: `serverCurrent` reflects what was actually rendered (the true
  // locale on a dynamic page; a fixed default like "es" on a static one).
  // On mount, correct it — and the header text — from the visitor's real
  // cookie if the two differ, without waiting on a server round-trip.
  const [current, setCurrent] = useState(serverCurrent);

  useEffect(() => {
    const cookieLocale = readLocaleCookie();
    if (cookieLocale && cookieLocale !== serverCurrent) {
      setCurrent(cookieLocale);
      applyHeaderStrings(cookieLocale);
    }
  }, [serverCurrent]);

  async function switchTo(locale: Locale) {
    if (locale === current || busy) return;
    setBusy(locale);
    try {
      await fetch("/api/i18n/locale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      setCurrent(locale);
      applyHeaderStrings(locale);
      if (detailsRef.current) detailsRef.current.open = false;
      startTransition(() => router.refresh());
    } finally {
      setBusy(null);
    }
  }

  return (
    <details ref={detailsRef} className="relative" data-testid="language-switcher">
      <summary
        aria-label={`Idioma: ${LOCALE_NAMES[current]}`}
        className="flex min-h-10 min-w-10 cursor-pointer list-none items-center justify-center gap-1 rounded-[var(--radius-md)] px-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        <GlobeIcon width={18} height={18} />
        <span className="text-xs font-medium uppercase">{current}</span>
      </summary>
      {/* Anchored to the switcher's LEFT edge, not the right: the switcher is
          never the rightmost header item (the login link + CTA sit after it),
          so `right-0` threw the 176px menu leftward across the screen — on a
          phone it covered half the viewport (#68 follow-up). `left-0` drops it
          straight down from the globe; the max-width keeps it on screen at any
          width. */}
      <ul
        role="menu"
        aria-label="Idioma / Language"
        className="absolute left-0 z-50 mt-2 w-44 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] py-1 text-sm shadow-[0_8px_24px_rgba(15,23,32,0.12)]"
      >
        {LOCALES.map((l) => (
          <li key={l}>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={current === l}
              data-testid={`language-switcher-${l}`}
              disabled={pending || busy === l}
              onClick={() => void switchTo(l)}
              className="flex min-h-9 w-full items-center justify-between gap-2 px-3 text-left hover:bg-[var(--color-surface)] disabled:opacity-60"
            >
              <span>{LOCALE_NAMES[l]}</span>
              {current === l && (
                <CheckIcon
                  width={14}
                  height={14}
                  className="shrink-0 text-[var(--color-primary)]"
                />
              )}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
