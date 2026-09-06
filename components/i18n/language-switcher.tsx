"use client";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/locale";
import { GlobeIcon, CheckIcon } from "@/components/panel/icons";

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
export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<Locale | null>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  async function switchTo(locale: Locale) {
    if (locale === current || busy) return;
    setBusy(locale);
    try {
      await fetch("/api/i18n/locale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale }),
      });
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
      <ul
        role="menu"
        aria-label="Idioma / Language"
        className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] py-1 text-sm shadow-[0_8px_24px_rgba(15,23,32,0.12)]"
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
