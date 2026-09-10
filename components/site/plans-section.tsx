import Link from "next/link";
import { CheckIcon } from "@/components/panel/icons";
import { PLANS } from "@/lib/content/landing";
import type { Messages } from "@/lib/i18n/dictionaries/es";

/**
 * "Planes 2027" (#109) — a purely informational section INSIDE the landing
 * (`id="planes"`), not a `/precios` page. It previews the pricing planned for
 * January 2027 while the launch period stays free until 31/12/2026. No billing,
 * no plan enforcement, no forms — just an `<h2>` section and, for signed-out
 * visitors, the existing "start for free" entry point.
 *
 * Numbers come from `PLANS` (`lib/content/landing.ts`, one source of truth);
 * all copy comes from `dict.landing.plans` per locale, merged positionally.
 */
export function PlansSection({
  copy,
  authed,
  wrapClass,
}: {
  copy: Messages["landing"]["plans"];
  authed: boolean;
  wrapClass: string;
}) {
  const tiers = PLANS.map((p, i) => ({ ...p, ...copy.tiers[i] }));

  return (
    <section
      className={`${wrapClass} border-t border-[var(--color-border)] py-16`}
      aria-labelledby="planes"
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
        {copy.eyebrow}
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="planes" className="text-2xl font-bold md:text-3xl">
          {copy.heading}
        </h2>
        <span
          className="inline-flex w-fit items-center rounded-full bg-[var(--color-success)] px-3 py-1 text-xs font-bold text-white"
          data-testid="plans-launch-badge"
        >
          {copy.launchBadge}
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">{copy.subhead}</p>

      <ul className="mt-8 grid gap-4 lg:grid-cols-3">
        {tiers.map((tier) => (
          <li
            key={tier.id}
            data-testid={`plan-${tier.id}`}
            className={`flex flex-col rounded-[var(--radius-md)] border bg-[var(--color-surface)] p-5 ${
              tier.featured
                ? "border-[var(--color-primary)] shadow-[0_6px_20px_rgba(15,23,42,0.08)]"
                : "border-[var(--color-border)]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold">{tier.name}</h3>
              {tier.featured && (
                <span
                  data-testid="plan-recommended"
                  className="shrink-0 rounded-full bg-[var(--color-primary)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary-contrast)]"
                >
                  {copy.recommendedLabel}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{tier.target}</p>

            <p className="mt-4">
              <span className="text-3xl font-bold">{tier.amount}</span>{" "}
              <span className="text-sm text-[var(--color-text-muted)]">{copy.amountSuffix}</span>
            </p>

            <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <div className="flex items-baseline gap-1.5">
                <dt className="font-bold">{tier.decaPerMonth}</dt>
                <dd className="text-[var(--color-text-muted)]">{copy.decaPerMonthLabel}</dd>
              </div>
              <div className="flex items-baseline gap-1.5">
                <dt className="font-bold">{tier.users}</dt>
                <dd className="text-[var(--color-text-muted)]">{copy.usersLabel}</dd>
              </div>
            </dl>

            <p className="mt-4 text-sm">{tier.tagline}</p>

            {tier.inherits && <p className="mt-4 text-sm font-bold">{tier.inherits}</p>}
            <ul className="mt-3 flex flex-1 flex-col gap-2 text-sm">
              {tier.features.map((f) =>
                f.soon ? (
                  <li
                    key={f.label}
                    className="flex items-start gap-2 text-[var(--color-text-muted)]"
                  >
                    <span
                      aria-hidden
                      className="mt-1 h-3 w-3 shrink-0 rounded-full border border-dashed border-[var(--color-border)]"
                    />
                    <span>
                      {f.label}
                      <span className="ml-1.5 rounded-full border border-dashed border-[var(--color-border)] px-1.5 py-0.5 text-[11px]">
                        {copy.comingSoonLabel}
                      </span>
                    </span>
                  </li>
                ) : (
                  <li key={f.label} className="flex items-start gap-2">
                    <CheckIcon
                      width={15}
                      height={15}
                      aria-hidden
                      className="mt-0.5 shrink-0 text-[var(--color-success)]"
                    />
                    <span>{f.label}</span>
                  </li>
                ),
              )}
            </ul>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm font-medium text-[var(--color-text-muted)]">{copy.terms}</p>

      {authed ? (
        <p className="mt-2 text-sm">{copy.authedNote}</p>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-[var(--color-text-muted)]">{copy.reassurance}</p>
          <Link
            href="/crear"
            data-testid="plans-guest-cta"
            className="mt-3 inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--color-primary)] px-5 text-sm font-medium text-[var(--color-primary)] no-underline"
          >
            {copy.guestCta}
          </Link>
        </div>
      )}

      <p className="mt-6 max-w-3xl text-xs text-[var(--color-text-muted)]">{copy.footnote}</p>
      <p className="mt-2 max-w-3xl text-xs text-[var(--color-text-muted)]">{copy.apiDisclaimer}</p>
    </section>
  );
}
