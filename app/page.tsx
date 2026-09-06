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
import { WorkspacePreview } from "@/components/site/workspace-preview";
import { SavedDataPreview } from "@/components/site/saved-data-preview";
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
  RouteIcon,
  ShieldIcon,
  IconBadge,
  CheckIcon,
} from "@/components/panel/icons";
import {
  STEPS,
  PERSONAS,
  BENEFITS,
  LEGAL_SOURCE,
  OPERATOR_TRUST,
  FREE_VALUE_ITEMS,
  landingJsonLd,
} from "@/lib/content/landing";

// SEO: this is the product/brand homepage — its primary intent is "generador
// profesional de DeCA" (the software), not "gratis", which is owned
// exclusively by /deca-gratis (see docs/decisions.md keyword-cannibalisation
// entry). Keep this distinct from /deca-gratis's title/description.
export const metadata: Metadata = {
  title: "DeCA Profesional | Generador online del Documento de Control",
  description:
    "Genera y gestiona el Documento Electrónico de Control (DeCA) del transporte de mercancías por carretera: PDF nativo, QR, historial y conservación online, antes del 5 de octubre de 2026.",
  alternates: { canonical: publicEnv.baseUrl + "/" },
  openGraph: {
    type: "website",
    url: publicEnv.baseUrl + "/",
    title: "DeCA Profesional | Generador online del Documento de Control",
    description:
      "El Documento Electrónico de Control (DeCA) para transportistas y cargadores: PDF nativo, QR, historial y conservación online.",
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

/**
 * DESIGN #55 §6: one icon per persona, matched to its job-to-be-done, in the
 * same fixed order as `PERSONAS` in `lib/content/landing.ts`.
 */
const PERSONA_ICONS = [TruckIcon, BuildingIcon, RouteIcon, MapPinIcon] as const;

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
  const freeValueItems = FREE_VALUE_ITEMS.map((item, i) => ({
    ...item,
    ...dict.landing.freeValueItems[i],
  }));
  const legalPoints = dict.landing.legalPoints;
  const faqGroups = dict.landing.faqGroups;

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
          {/* DESIGN #55 §5: a connecting line turns the 3 numbered circles into an
              actual flow, not just a 3-column list — desktop only, since the
              stacked mobile layout already reads top-to-bottom as a sequence. */}
          <div className="relative mt-8 grid gap-6 md:grid-cols-3">
            <div
              aria-hidden
              className="absolute top-[18px] right-[calc(16.6%+18px)] left-[calc(16.6%+18px)] hidden h-px bg-[var(--color-border)] md:block"
            />
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <span className="relative z-10 grid h-9 w-9 place-items-center rounded-full bg-[var(--color-primary)] font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Free value — what competitors often paywall, included during launch */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="incluido"
        >
          <h2 id="incluido" className="text-2xl font-bold md:text-3xl">
            {dict.landing.freeValueHeading}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
            {dict.landing.freeValueSubhead}
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {freeValueItems.map((item) => (
              <li
                key={item.label}
                className={`flex items-center gap-2.5 rounded-[var(--radius-md)] border px-4 py-3 text-sm transition-shadow duration-200 ${
                  item.available
                    ? "border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.07)]"
                    : "border-dashed border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                {item.available ? (
                  <CheckIcon
                    width={16}
                    height={16}
                    className="shrink-0 text-[var(--color-success)]"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="h-4 w-4 shrink-0 rounded-full border border-[var(--color-border)]"
                  />
                )}
                <span className="min-w-0 flex-1">{item.label}</span>
                {!item.available && (
                  <span className="shrink-0 text-xs">{dict.landing.freeValueComingSoon}</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Product proof — DESIGN #55 §15: benefits list now uses the same
            success-check visual language as the free-value/normativa sections
            (was plain "Title. body" text, the one remaining spot that read as
            flatter than the rest of the redesigned page). */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="producto"
        >
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 id="producto" className="text-2xl font-bold md:text-3xl">
                {dict.landing.productHeading}
              </h2>
              <ul className="mt-6 space-y-3 text-sm">
                {benefits.map((b) => (
                  <li key={b.title} className="flex items-start gap-3">
                    <CheckIcon
                      width={16}
                      height={16}
                      className="mt-0.5 shrink-0 text-[var(--color-success)]"
                    />
                    <span>
                      <span className="font-bold">{b.title}. </span>
                      <span className="text-[var(--color-text-muted)]">{b.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
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
            {personas.map((p, i) => {
              const Icon = PERSONA_ICONS[i];
              return (
                <div
                  key={p.title}
                  className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-shadow duration-200 hover:shadow-[0_8px_28px_rgba(15,23,42,0.08)]"
                >
                  <IconBadge size={44}>
                    <Icon width={20} height={20} />
                  </IconBadge>
                  <h3 className="mt-4 text-lg font-bold">{p.title}</h3>
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
              );
            })}
          </div>
          <div className="mt-8">
            <CtaButton event="persona_section_cta">{hero.cta}</CtaButton>
          </div>
        </section>

        {/* Daily use — DESIGN #55 §5: paired with two real product visuals
            (`WorkspacePreview` + `SavedDataPreview`, same product-led-graphics
            rule as the hero's `DecaPreview`) so "Guarda una vez. Reutiliza
            siempre." has concrete visual proof on both halves of that claim —
            saved data on top, the reuse outcome (history) below it — instead
            of one visual and empty space under it. */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="cada-dia"
        >
          <div className="grid items-start gap-10 md:grid-cols-2 md:gap-14">
            <div>
              <h2 id="cada-dia" className="text-2xl font-bold md:text-3xl">
                {dict.landing.dailyUseHeading}
              </h2>
              <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
                {dict.landing.dailyUseSubhead}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {PRODUCT_SHOWCASE.map(({ Icon }, i) => {
                  const item = dict.landing.dailyUse[i];
                  return (
                    <div
                      key={item.label}
                      className="flex flex-col items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-shadow duration-200 hover:shadow-[0_8px_28px_rgba(15,23,42,0.08)]"
                    >
                      <IconBadge size={40}>
                        <Icon width={18} height={18} />
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
            </div>
            <div className="space-y-4">
              <SavedDataPreview />
              <WorkspacePreview />
            </div>
          </div>
        </section>

        {/* Legal / trust — DESIGN #55 §9: grouped in one scannable card instead of
            bare full-width text, each point led by the same success-check visual
            language as the free-value section (D-083) for consistency. */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="normativa"
        >
          <h2 id="normativa" className="text-2xl font-bold md:text-3xl">
            {dict.landing.regulationHeading}
          </h2>
          <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <ul className="grid gap-x-8 gap-y-4 md:grid-cols-2">
              {legalPoints.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm leading-relaxed">
                  <CheckIcon
                    width={16}
                    height={16}
                    className="mt-0.5 shrink-0 text-[var(--color-success)]"
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            {dict.landing.legalSourceLabel}{" "}
            <a href={LEGAL_SOURCE.url} target="_blank" rel="noopener noreferrer">
              {LEGAL_SOURCE.label}
            </a>
          </p>
        </section>

        {/* Operator / discreet legal-professional trust (TRUST #42 §2/§2A) — body is
            PRAETORIA's own legal-identity wording and is intentionally NEVER translated
            (see the i18n note above), whatever the locale.
            DESIGN #55 §8: kept deliberately secondary/muted (no gavels, scales, or
            law-firm visual cliché) — the only change is a quiet bordered card so it
            reads as a trust footnote, not a wall of small text. */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-12`}
          aria-labelledby="operador"
        >
          <div className="flex max-w-2xl items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-5">
            <ShieldIcon
              width={18}
              height={18}
              className="mt-0.5 shrink-0 text-[var(--color-text-muted)]"
            />
            <div>
              <h2 id="operador" className="text-sm font-bold text-[var(--color-text-muted)]">
                {dict.landing.operatorTrustHeading}
              </h2>
              <p
                className="mt-1.5 text-sm text-[var(--color-text-muted)]"
                data-testid="operator-trust"
              >
                {OPERATOR_TRUST.body}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="faq"
        >
          <h2 id="faq" className="text-2xl font-bold md:text-3xl">
            {dict.landing.faqHeading}
          </h2>
          <FaqAccordion groups={faqGroups} />
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
            <p className="mt-4 text-sm text-white/90">{dict.landing.finalCtaMicrocopy}</p>
          </div>
        </section>
      </main>

      <SiteFooter />
      <MobileCta />
    </>
  );
}
