"use client";
import Link from "next/link";
import { useT } from "@/lib/i18n/client";
import { RouteIcon } from "@/components/panel/icons";

/**
 * The optional **DECA Conecta** consent, shown during account creation (#84 →
 * DECA Conecta rename). ONE implementation, shared by every onboarding path
 * that founds a company — the email/password registration form and the Google
 * 2-step company-completion form — so both offer the exact same choice and
 * persist the exact same value (D-159/D-160, D-193). Never pre-ticked, never
 * blocks account creation; accepting the legal terms never activates it. The
 * parent owns the boolean and sends it in its own submit; the backend applies
 * it via `applySignupCommercialOptIn()`.
 *
 * DECA Conecta is an OPTIONAL feature: with the carrier's authorisation it uses
 * only the destination + date of a DeCA to surface compatible load
 * opportunities — never the full DeCA, never GPS tracking. The stored consent
 * value and all backend behaviour are unchanged by the rename.
 */
export function CommercialOptIn({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const t = useT();
  const c = t.auth.commercialOptIn;
  return (
    <div
      data-testid="commercial-opt-in-box"
      className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="flex items-center gap-1.5">
          <RouteIcon width={16} height={16} className="shrink-0 text-[var(--color-primary)]" />
          <span className="text-sm font-semibold">{c.brand}</span>
        </span>
        <span className="rounded-full border border-[var(--color-primary)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-primary)]">
          {c.badge}
        </span>
      </div>
      <p className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">{c.tagline}</p>

      <label className="mt-3 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          data-testid="commercial-opt-in"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span className="font-medium">{c.label}</span>
      </label>
      <p className="mt-1 pl-6 text-xs text-[var(--color-text-muted)]">{c.hint}</p>

      <details className="mt-1.5 pl-6">
        <summary className="cursor-pointer text-xs font-medium text-[var(--color-primary)] underline">
          {c.moreInfo}
        </summary>
        <div className="mt-2 space-y-2.5 text-xs text-[var(--color-text-muted)]">
          <div>
            <p className="font-semibold text-[var(--color-text)]">{c.info.howTitle}</p>
            <p className="mt-0.5">{c.info.howBody}</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--color-text)]">{c.info.matchTitle}</p>
            <ul className="mt-0.5 list-disc pl-4">
              {c.info.matchItems.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[var(--color-text)]">{c.info.contactTitle}</p>
            <ul className="mt-0.5 list-disc pl-4">
              {c.info.contactItems.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[var(--color-text)]">{c.info.neverTitle}</p>
            <ul className="mt-0.5 list-disc pl-4">
              {c.info.neverItems.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[var(--color-text)]">{c.info.controlTitle}</p>
            <p className="mt-0.5">{c.info.controlBody}</p>
          </div>
        </div>
      </details>

      <p className="mt-1.5 pl-6">
        <Link
          href="/blog/deca-conecta-ofertas-carga"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="commercial-opt-in-article"
          className="text-xs text-[var(--color-primary)] underline"
        >
          {c.articleLink}
        </Link>
      </p>
    </div>
  );
}
