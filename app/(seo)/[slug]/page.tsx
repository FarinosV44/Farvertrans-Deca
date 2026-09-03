import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCta } from "@/components/site/mobile-cta";
import { CtaButton } from "@/components/site/cta-button";
import { TrackView } from "@/components/analytics/track-view";
import { publicEnv } from "@/lib/env";
import { HERO } from "@/lib/content/landing";
import { SEO_PAGES, getSeoPage } from "@/content/seo/pages";

export const dynamicParams = false; // only the 10 known slugs render; anything else 404s

export function generateStaticParams() {
  return SEO_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const p = getSeoPage((await params).slug);
  if (!p) return {};
  const url = `${publicEnv.baseUrl}/${p.slug}`;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: p.title,
      description: p.description,
      siteName: "Farvertrans DeCA",
    },
  };
}

export default async function SeoPageView({ params }: { params: Promise<{ slug: string }> }) {
  const p = getSeoPage((await params).slug);
  if (!p) notFound();

  return (
    <>
      <TrackView event="landing_view" />
      <SiteHeader />

      <main id="contenido" className="mx-auto max-w-[760px] px-4 pb-24 pt-10 md:px-6 md:pb-12">
        <nav aria-label="Migas de pan" className="text-xs text-[var(--color-text-muted)]">
          <Link href="/" className="inline-block py-1 underline">
            Inicio
          </Link>
          <span aria-hidden> / </span>
          <span>{p.h1}</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{p.h1}</h1>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Última revisión normativa: {p.lastReviewed}
        </p>

        {p.intro.map((para) => (
          <p key={para} className="mt-4 text-[var(--color-text)]">
            {para}
          </p>
        ))}

        <div className="mt-6">
          <CtaButton>{HERO.cta}</CtaButton>
        </div>

        {p.sections.map((s) => (
          <section key={s.h2} className="mt-8">
            <h2 className="text-xl font-bold md:text-2xl">{s.h2}</h2>
            {s.body.map((b) => (
              <p key={b} className="mt-2 text-[var(--color-text)]">
                {b}
              </p>
            ))}
          </section>
        ))}

        <section className="mt-10" aria-labelledby="faq">
          <h2 id="faq" className="text-xl font-bold md:text-2xl">
            Preguntas frecuentes
          </h2>
          <dl className="mt-3 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {p.faq.map((f) => (
              <div key={f.q} className="py-3">
                <dt className="font-bold">{f.q}</dt>
                <dd className="mt-1 text-sm text-[var(--color-text-muted)]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold">Fuentes</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {p.sources.map((src) => (
              <li key={src.url}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block min-h-[24px] py-1"
                >
                  {src.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold">Sigue leyendo</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {[...p.related, "requisitos-deca"].map((slug) => {
              const r = getSeoPage(slug);
              return (
                <li key={slug}>
                  <Link href={`/${slug}`} className="inline-block min-h-[24px] py-1">
                    {r?.h1 ?? slug}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/" className="inline-block min-h-[24px] py-1">
                Landing y generador
              </Link>
            </li>
          </ul>
        </section>

        <div className="mt-10 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 text-center">
          <p className="font-bold">Crea tu DeCA ahora</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{HERO.trust}</p>
          <div className="mt-4">
            <CtaButton>{HERO.cta}</CtaButton>
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileCta />
    </>
  );
}
