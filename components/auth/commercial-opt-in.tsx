"use client";
import { useT } from "@/lib/i18n/client";
import { RouteIcon } from "@/components/panel/icons";

/**
 * The optional "Oportunidades de carga" consent (#84). ONE implementation,
 * shared by every onboarding path that founds a company — the email/password
 * registration form and the Google 2-step company-completion form — so both
 * offer the exact same choice and persist the exact same value (D-159/D-160,
 * D-193). Never pre-ticked, never blocks account creation. The parent owns the
 * boolean and sends it in its own submit; the backend applies it via
 * `applySignupCommercialOptIn()`.
 *
 * Deliberately un-prominent (D-159/D-160): a light box, closed disclosure, no
 * "Opcional" badge — it IS optional and being the only checkbox on the page
 * with no required styling is what signals that.
 */
export function CommercialOptIn({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const t = useT();
  return (
    <div
      data-testid="commercial-opt-in-box"
      className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
    >
      <div className="flex items-center gap-1.5">
        <RouteIcon width={16} height={16} className="shrink-0 text-[var(--color-text-muted)]" />
        <span className="text-sm font-semibold">{t.auth.commercialOptIn.title}</span>
      </div>
      <label className="mt-2 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          data-testid="commercial-opt-in"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span>{t.auth.commercialOptIn.label}</span>
      </label>
      <p className="mt-1 pl-6 text-xs text-[var(--color-text-muted)]">
        {t.auth.commercialOptIn.hint}
      </p>
      <details className="mt-1.5 pl-6">
        <summary className="cursor-pointer text-xs font-medium text-[var(--color-primary)] underline">
          {t.auth.commercialOptIn.moreInfo}
        </summary>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          {t.auth.commercialOptIn.moreInfoBody}
        </p>
      </details>
    </div>
  );
}
