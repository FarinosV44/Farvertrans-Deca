import type { Metadata } from "next";
import Link from "next/link";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCta } from "@/components/site/mobile-cta";
import { CtaButton } from "@/components/site/cta-button";
import { TrackView } from "@/components/analytics/track-view";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { DecaPreview } from "@/components/site/deca-preview";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { qrPngDataUriCached } from "@/lib/pdf/qr";
import {
  PlusIcon,
  QrIcon,
  HistoryIcon,
  CopyIcon,
  TruckIcon,
  BuildingIcon,
  MapPinIcon,
  ShieldIcon,
  IconBadge,
} from "@/components/panel/icons";
import {
  STEPS,
  PERSONAS,
  BENEFITS,
  LEGAL_SOURCE,
  OPERATOR_TRUST,
  landingJsonLd,
} from "@/lib/content/landing";

export const metadata: Metadata = {
  title: "DeCA Gratis | Genera el Documento de Control Online",
  description:
    "Genera gratis el Documento Electrónico de Control (DeCA) obligatorio desde el 5 de octubre de 2026. PDF nativo, QR y conservación online. Sin tarjeta y sin límite.",
  alternates: { canonical: publicEnv.baseUrl + "/" },
  openGraph: {
    type: "website",
    url: publicEnv.baseUrl + "/",
    title: "DeCA Gratis | Genera el Documento de Control Online",
    description:
      "Crea tu Documento Electrónico de Control en segundos. PDF nativo, QR y conservación online. Sin tarjeta, sin límite.",
    siteName: BRAND.name,
  },
};

export const dynamic = "force-dynamic";

const wrap = "mx-auto max-w-[1120px] px-4 md:px-6";

/**
 * Visual product showcase (PRIORITY 5) — the same icon language as the workspace,
 * not text bullets. Icons only: the label/body text is locale text, sourced
 * positionally from `dict.landing.dailyUse` (kept in this exact order in every
 * dictionary — see `lib/i18n/dictionaries/*.ts`).
 */
const PRODUCT_SHOWCASE = [
  { Icon: PlusIcon },
  { Icon: QrIcon },
  { Icon: HistoryIcon },
  { Icon: CopyIcon },
  { Icon: TruckIcon },
  { Icon: BuildingIcon },
  { Icon: MapPinIcon },
  { Icon: ShieldIcon },
] as const;

export default async function HomePage() {
  const user = await getCurrentUser().catch(() => null);
  const authed = !!user?.companyId;
  // DESIGN #55 §1: a REAL QR (same `lib/pdf/qr.ts` used for the actual PDF),
  // pointing at the site's own base URL — never a decorative pixel grid.
  const heroQr = await qrPngDataUriCached(publicEnv.baseUrl);

  // I18N #54: the whole landing reads from `getDictionary(locale)` unconditionally
  // now — `lib/content/landing.ts` only supplies the non-translatable bits that
  // stay identical across every locale (persona slugs/tracking events, the legal
  // source URL/label, JSON-LD). Adding a new locale to `lib/i18n/dictionaries/`
  // and `DICTS` in `lib/i18n/server.ts` is enough for the landing to pick it up —
  // no page-level branching needed. Legal-entity trust copy (`OPERATOR_TRUST.body`)
  // is deliberately NEVER translated — it's PRAETORIA's own legal-identity
  // wording, translating it is #52/legal-review territory, not a landing-copy
  // task, and it stays Spanish in every locale.
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const hero = dict.landing.hero;
  const trustRow = dict.landing.trustRow;
  const steps = STEPS.map((s, i) => ({ ...s, ...dict.landing.steps[i] }));
  const benefits = BENEFITS.map((b, i) => ({ ...b, ...dict.landing.benefits[i] }));
  const personas = PERSONAS.map((p, i) => ({ ...p, ...dict.landing.personas[i] }));
  const legalPoints = dict.landing.legalPoints;
  const faq = dict.landing.faq;

  return (
    <>
      <TrackView event="landing_view" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingJsonLd()) }}
      />
      <SiteHeader nav authed={authed} companyName={user?.company?.name} />

      <main id="contenido" className="pb-24 md:pb-0">
        {/* Hero */}
        <section className={`${wrap} pt-12 pb-10 md:pt-20`}>
          <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
            <div>
              <p className="text-sm font-semibold tracking-wide text-[var(--color-primary)]">
                {hero.eyebrow}
              </p>
              <h1 className="mt-3 text-[2.5rem] leading-[1.05] font-extrabold tracking-tight sm:text-[3rem] md:text-[4.25rem]">
                {hero.h1}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-[var(--color-text-muted)] md:text-xl">
                {hero.subhead}
              </p>
              <p className="mt-3 max-w-xl text-sm text-[var(--color-text-muted)]">{hero.proof}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <CtaButton
                  event="hero_cta"
                  testId="cta-hero"
                  className="text-base shadow-[0_8px_24px_rgba(11,92,255,0.28)]"
                >
                  {hero.cta}
                </CtaButton>
                {!authed && (
                  <Link
                    href="/entrar"
                    data-testid="hero-login"
                    className="inline-flex min-h-12 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 font-medium no-underline hover:border-[var(--color-primary)]"
                  >
                    {hero.ctaSecondary}
                  </Link>
                )}
              </div>
              <p className="mt-3 text-sm font-medium text-[var(--color-text-muted)]">
                {hero.noCardNote}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-muted)]">
                {trustRow.map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <span aria-hidden className="text-[var(--color-success)]">
                      ✓
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <DecaPreview qrDataUri={heroQr} />
          </div>
        </section>

        {/* 3 steps — with the real UI as the visual */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="pasos"
        >
          <h2 id="pasos" className="text-2xl font-bold md:text-3xl">
            {dict.landing.stepsHeading}
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-primary)] font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Product proof */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="producto"
        >
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 id="producto" className="text-2xl font-bold md:text-3xl">
                {dict.landing.productHeading}
              </h2>
              <ul className="mt-5 space-y-3 text-sm">
                {benefits.map((b) => (
                  <li key={b.title}>
                    <span className="font-bold">{b.title}. </span>
                    <span className="text-[var(--color-text-muted)]">{b.body}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <CtaButton event="product_demo_cta">{hero.cta}</CtaButton>
              </div>
            </div>
            <DecaPreview qrDataUri={heroQr} />
          </div>
        </section>

        {/* Personas */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="para-quien"
        >
          <h2 id="para-quien" className="text-2xl font-bold md:text-3xl">
            {dict.landing.personasHeading}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {personas.map((p) => (
              <div
                key={p.title}
                className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
              >
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p className="mt-1 text-sm font-medium">{p.jobToBeDone}</p>
                <ul className="mt-3 space-y-1 text-sm text-[var(--color-text-muted)]">
                  {p.benefits.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span aria-hidden className="text-[var(--color-success)]">
                        ✓
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <TrackedLink
                  href={`/${p.slug}`}
                  event={p.event}
                  data-testid={`persona-cta-${p.slug}`}
                  className="mt-4 inline-block self-start text-sm font-medium text-[var(--color-primary)]"
                >
                  {dict.landing.personaCtaPrefix} {p.title.toLowerCase()} →
                </TrackedLink>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <CtaButton event="persona_section_cta">{hero.cta}</CtaButton>
          </div>
        </section>

        {/* Daily use */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="cada-dia"
        >
          <h2 id="cada-dia" className="text-2xl font-bold md:text-3xl">
            {dict.landing.dailyUseHeading}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
            {dict.landing.dailyUseSubhead}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCT_SHOWCASE.map(({ Icon }, i) => {
              const item = dict.landing.dailyUse[i];
              return (
                <div
                  key={item.label}
                  className="flex flex-col items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                >
                  <IconBadge size={44}>
                    <Icon width={20} height={20} />
                  </IconBadge>
                  <div>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-sm text-[var(--color-text-muted)]">
            {dict.landing.dailyUseFooter}{" "}
            <Link href="/entrar">{dict.landing.dailyUseFooterLink}</Link>{" "}
            {dict.landing.dailyUseFooterAfterLink}
          </p>
        </section>

        {/* Legal / trust */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="normativa"
        >
          <h2 id="normativa" className="text-2xl font-bold md:text-3xl">
            {dict.landing.regulationHeading}
          </h2>
          <ul className="mt-6 grid gap-2 md:grid-cols-2">
            {legalPoints.map((p) => (
              <li key={p} className="flex gap-2 text-sm">
                <span aria-hidden className="text-[var(--color-success)]">
                  ✓
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            {dict.landing.legalSourceLabel}{" "}
            <a href={LEGAL_SOURCE.url} target="_blank" rel="noopener noreferrer">
              {LEGAL_SOURCE.label}
            </a>
          </p>
        </section>

        {/* Operator / discreet legal-professional trust (TRUST #42 §2/§2A) — body is
            PRAETORIA's own legal-identity wording and is intentionally NEVER translated
            (see the i18n note above), whatever the locale. */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-12`}
          aria-labelledby="operador"
        >
          <h2 id="operador" className="text-lg font-bold text-[var(--color-text-muted)]">
            {dict.landing.operatorTrustHeading}
          </h2>
          <p
            className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]"
            data-testid="operator-trust"
          >
            {OPERATOR_TRUST.body}
          </p>
        </section>

        {/* FAQ */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="faq"
        >
          <h2 id="faq" className="text-2xl font-bold md:text-3xl">
            {dict.landing.faqHeading}
          </h2>
          <FaqAccordion items={faq} />
        </section>

        {/* Final CTA */}
        <section className="bg-[var(--color-primary)]">
          <div className={`${wrap} py-16 text-center`}>
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              {dict.landing.finalCtaHeading}
            </h2>
            <p className="mt-2 text-white/90">{dict.landing.finalCtaSubhead}</p>
            <div className="mt-7">
              <CtaButton
                event="final_cta"
                testId="cta-final"
                variant="inverse"
                className="text-base"
              >
                {hero.cta}
              </CtaButton>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <MobileCta />
    </>
  );
}
