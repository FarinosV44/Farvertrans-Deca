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
import {
  HERO,
  TRUST_ROW,
  STEPS,
  PERSONAS,
  DAILY_USE,
  BENEFITS,
  LEGAL_POINTS,
  LEGAL_SOURCE,
  OPERATOR_TRUST,
  FAQ,
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

export default async function HomePage() {
  const user = await getCurrentUser().catch(() => null);
  const authed = !!user?.companyId;

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
                {HERO.eyebrow}
              </p>
              <h1 className="mt-3 text-[2.5rem] leading-[1.05] font-extrabold tracking-tight sm:text-[3rem] md:text-[4.25rem]">
                {HERO.h1}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-[var(--color-text-muted)] md:text-xl">
                {HERO.subhead}
              </p>
              <p className="mt-3 max-w-xl text-sm text-[var(--color-text-muted)]">{HERO.proof}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <CtaButton
                  event="hero_cta"
                  testId="cta-hero"
                  className="text-base shadow-[0_8px_24px_rgba(11,92,255,0.28)]"
                >
                  {HERO.cta}
                </CtaButton>
                {!authed && (
                  <Link
                    href="/entrar"
                    data-testid="hero-login"
                    className="inline-flex min-h-12 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 font-medium no-underline hover:border-[var(--color-primary)]"
                  >
                    {HERO.ctaSecondary}
                  </Link>
                )}
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-muted)]">
                {TRUST_ROW.map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <span aria-hidden className="text-[var(--color-success)]">
                      ✓
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <DecaPreview />
          </div>
        </section>

        {/* 3 steps — with the real UI as the visual */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="pasos"
        >
          <h2 id="pasos" className="text-2xl font-bold md:text-3xl">
            Crea tu DeCA en 3 pasos
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
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
                Del formulario al PDF con QR, sin pasos de más
              </h2>
              <ul className="mt-5 space-y-3 text-sm">
                {BENEFITS.map((b) => (
                  <li key={b.title}>
                    <span className="font-bold">{b.title}. </span>
                    <span className="text-[var(--color-text-muted)]">{b.body}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <CtaButton event="product_demo_cta">{HERO.cta}</CtaButton>
              </div>
            </div>
            <DecaPreview />
          </div>
        </section>

        {/* Personas */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="para-quien"
        >
          <h2 id="para-quien" className="text-2xl font-bold md:text-3xl">
            Hecho para quien mueve mercancía
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PERSONAS.map((p) => (
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
                  Cómo funciona para {p.title.toLowerCase()} →
                </TrackedLink>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <CtaButton event="persona_section_cta">{HERO.cta}</CtaButton>
          </div>
        </section>

        {/* Daily use */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="cada-dia"
        >
          <h2 id="cada-dia" className="text-2xl font-bold md:text-3xl">
            Por qué usarlo cada día
          </h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {DAILY_USE.map((d) => (
              <li key={d} className="flex gap-2 text-sm">
                <span aria-hidden className="text-[var(--color-primary)]">
                  ✓
                </span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-[var(--color-text-muted)]">
            La primera vez no necesitas cuenta. Después, <Link href="/entrar">tu empresa</Link>{" "}
            guarda todo esto para que el siguiente DeCA sea cuestión de segundos.
          </p>
        </section>

        {/* Legal / trust */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="normativa"
        >
          <h2 id="normativa" className="text-2xl font-bold md:text-3xl">
            Qué exige la normativa
          </h2>
          <ul className="mt-6 grid gap-2 md:grid-cols-2">
            {LEGAL_POINTS.map((p) => (
              <li key={p} className="flex gap-2 text-sm">
                <span aria-hidden className="text-[var(--color-success)]">
                  ✓
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            Fuente:{" "}
            <a href={LEGAL_SOURCE.url} target="_blank" rel="noopener noreferrer">
              {LEGAL_SOURCE.label}
            </a>
          </p>
        </section>

        {/* Operator / discreet legal-professional trust (TRUST #42 §2/§2A) */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-12`}
          aria-labelledby="operador"
        >
          <h2 id="operador" className="text-lg font-bold text-[var(--color-text-muted)]">
            {OPERATOR_TRUST.heading}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]" data-testid="operator-trust">
            {OPERATOR_TRUST.body}
          </p>
        </section>

        {/* FAQ */}
        <section
          className={`${wrap} border-t border-[var(--color-border)] py-16`}
          aria-labelledby="faq"
        >
          <h2 id="faq" className="text-2xl font-bold md:text-3xl">
            Preguntas frecuentes
          </h2>
          <FaqAccordion items={FAQ} />
        </section>

        {/* Final CTA */}
        <section className="bg-[var(--color-primary)]">
          <div className={`${wrap} py-16 text-center`}>
            <h2 className="text-2xl font-bold text-white md:text-3xl">Haz tu primer DeCA gratis</h2>
            <p className="mt-2 text-white/90">Sin demo. Sin comercial. Sin tarjeta.</p>
            <div className="mt-7">
              <CtaButton
                event="final_cta"
                testId="cta-final"
                variant="inverse"
                className="text-base"
              >
                {HERO.cta}
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
