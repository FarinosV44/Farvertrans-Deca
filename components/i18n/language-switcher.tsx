"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LOCALES, type Locale } from "@/lib/i18n/locale";

/**
 * Locale toggle (I18N #1, expanded per #54). No URL change in this slice —
 * same page, cookie + (when signed in) `User.preferredLocale` decide the
 * language server-side, so a `router.refresh()` after the switch is enough
 * to re-render translated content with no navigation and no lost scroll
 * position. The group has a fixed max-width and scrolls internally
 * (`overflow-x-auto`) rather than growing with `LOCALES` — #54 is headed to
 * 8 locales (es/ca/eu/gl/en/fr/de/it), and a switcher that keeps widening
 * the header on every new language previously broke the 360px no-overflow
 * check twice (D-072, this entry) before being fixed here once, permanently.
 */
export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<Locale | null>(null);

  async function switchTo(locale: Locale) {
    if (locale === current || busy) return;
    setBusy(locale);
    try {
      await fetch("/api/i18n/locale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      startTransition(() => router.refresh());
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      role="group"
      aria-label="Language / Idioma"
      data-testid="language-switcher"
      className="flex max-w-[104px] items-center overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs font-medium"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          data-testid={`language-switcher-${l}`}
          aria-pressed={current === l}
          disabled={pending || busy === l}
          onClick={() => void switchTo(l)}
          className={`min-h-8 min-w-8 shrink-0 px-2 uppercase transition-colors disabled:opacity-60 ${
            current === l
              ? "bg-[var(--color-primary)] text-[var(--color-primary-contrast)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
