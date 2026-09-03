import type { Metadata } from "next";
import { publicEnv } from "@/lib/env";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCta } from "@/components/site/mobile-cta";
import { CtaButton } from "@/components/site/cta-button";
import { TrackView } from "@/components/analytics/track-view";
import { DecaPreview } from "@/components/site/deca-preview";
import {
  HERO,
  STEPS,
  BENEFITS,
  LEGAL_POINTS,
  LEGAL_SOURCE,
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
    siteName: "Farvertrans DeCA",
  },
};

export default function HomePage() {
  return (
    <>
      <TrackView event="landing_view" />
      <script
        type="application/ld+json"
        // Static, no user data — safe.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingJsonLd()) }}
      />
      <SiteHeader />

      <main id="contenido" className="pb-24 md:pb-0">
        {/* Hero */}
        <section className="mx-auto max-w-[1120px] px-4 pt-10 pb-6 md:px-6 md:pt-16">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                {HERO.eyebrow}
              </p>
              <h1 className="mt-2 text-[2.75rem] leading-none font-bold md:text-6xl">{HERO.h1}</h1>
              <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">{HERO.subhead}</p>
              <div className="mt-7">
                <CtaButton className="text-base">{HERO.cta}</CtaButton>
              </div>
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">{HERO.trust}</p>
            </div>
            <DecaPreview />
          </div>
        </section>

        {/* 3 steps */}
        <section className="mx-auto max-w-[1120px] px-4 py-12 md:px-6" aria-labelledby="pasos">
          <h2 id="pasos" className="text-2xl font-bold md:text-3xl">
            Hazlo en 3 pasos
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-primary)] font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 3 benefits */}
        <section className="mx-auto max-w-[1120px] px-4 py-12 md:px-6" aria-labelledby="beneficios">
          <h2 id="beneficios" className="text-2xl font-bold md:text-3xl">
            Por qué Farvertrans DeCA
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6"
              >
                <h3 className="text-lg font-bold">{b.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Legal / trust */}
        <section className="mx-auto max-w-[1120px] px-4 py-12 md:px-6" aria-labelledby="normativa">
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

        {/* FAQ */}
        <section className="mx-auto max-w-[1120px] px-4 py-12 md:px-6" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-bold md:text-3xl">
            Preguntas frecuentes
          </h2>
          <dl className="mt-6 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {FAQ.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="font-bold">{f.q}</dt>
                <dd className="mt-1 text-sm text-[var(--color-text-muted)]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Final CTA */}
        <section className="bg-[var(--color-primary)]">
          <div className="mx-auto max-w-[1120px] px-4 py-14 text-center md:px-6">
            <h2 className="text-2xl font-bold text-white md:text-3xl">Haz tu primer DeCA gratis</h2>
            <p className="mt-2 text-white">Sin demo. Sin comercial. Sin tarjeta.</p>
            <div className="mt-6">
              <CtaButton variant="inverse" className="text-base">
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
