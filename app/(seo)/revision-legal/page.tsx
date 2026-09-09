import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCta } from "@/components/site/mobile-cta";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import { LEGAL_ENTITY } from "@/lib/legal-entity";
import { PRAETORIA_REVIEWER_DISPLAY, reviewerPersonJsonLd } from "@/lib/content/legal-reviewer";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";

/**
 * Public author/reviewer page (SEO task #3/#6): explains, using ONLY the
 * already-vetted `LEGAL_ENTITY` copy, the relationship between {@link BRAND}
 * (DeCA Profesional) and PRAETORIA, and names the optional legal reviewer
 * credited on some guides (`legalReviewer` / `legalReviewerName`). Per
 * D-039/D-043, PRAETORIA's disclosure here is a deliberate, separate,
 * already-approved decision — this page adds no new biographical claim
 * beyond what `LEGAL_ENTITY` already states publicly (footer, /aviso-legal).
 */

const CANONICAL = `${publicEnv.baseUrl}/revision-legal`;

export const metadata: Metadata = {
  title: "Autoría y revisión legal de los contenidos",
  description:
    "Quién escribe y revisa los contenidos de DeCA Profesional, y qué relación tiene con PRAETORIA, S.L., despacho jurídico especializado en transporte.",
  alternates: { canonical: CANONICAL },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: CANONICAL,
    title: "Autoría y revisión legal de los contenidos",
    description:
      "Quién escribe y revisa los contenidos de DeCA Profesional, y qué relación tiene con PRAETORIA, S.L.",
    siteName: BRAND.name,
  },
};

export default function RevisionLegalPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "Autoría y revisión legal de los contenidos",
      url: CANONICAL,
      description: metadata.description,
      // PRAETORIA, S.L. is the legal operator/publisher; DeCA Profesional is
      // its product brand (2026-09 legal-content pass, docs/decisions.md
      // D-108).
      publisher: {
        "@type": "Organization",
        name: LEGAL_ENTITY.name,
        url: LEGAL_ENTITY.corporateUrl,
        brand: { "@type": "Brand", name: BRAND.name, url: publicEnv.baseUrl },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: publicEnv.baseUrl },
        { "@type": "ListItem", position: 2, name: "Autoría y revisión legal", item: CANONICAL },
      ],
    },
    // The named legal reviewer, as a standalone structured entity on the
    // page that is literally about them — structured properties
    // (name/jobTitle/identifier/memberOf), never the combined display
    // string as `Person.name`. See lib/content/legal-reviewer.ts.
    { "@context": "https://schema.org", ...reviewerPersonJsonLd(PRAETORIA_REVIEWER_DISPLAY) },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader nav locale={DEFAULT_LOCALE} />
      <main id="contenido" className="mx-auto max-w-[760px] px-4 pb-24 pt-10 md:px-6 md:pb-12">
        <nav aria-label="Migas de pan" className="text-xs text-[var(--color-text-muted)]">
          <Link href="/" className="underline">
            Inicio
          </Link>
          <span aria-hidden> / </span>
          <span>Autoría y revisión legal</span>
        </nav>

        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
          Autoría y revisión legal de los contenidos
        </h1>

        <div className="mt-6 space-y-4 text-[var(--color-text)]">
          <p>
            Los contenidos de {BRAND.name} sobre el Documento Electrónico de Control Administrativo
            (DeCA) están escritos por el equipo editorial de {BRAND.name} a partir de las fuentes
            normativas citadas en cada página (BOE, Ministerio de Transportes).
          </p>
          <p>
            Algunas guías incluyen además una revisión legal a cargo de{" "}
            <strong>{PRAETORIA_REVIEWER_DISPLAY}</strong>. Esa página lo indica explícitamente en su
            cabecera, junto a la fecha de última revisión normativa.
          </p>
          <h2 className="text-lg font-bold">Relación con PRAETORIA</h2>
          <p>{LEGAL_ENTITY.legalBackingLine}</p>
          <p>{LEGAL_ENTITY.custodyLine}</p>
          <p>
            {LEGAL_ENTITY.operatorLine}, con domicilio en {LEGAL_ENTITY.address}.
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Esta página no constituye asesoramiento jurídico individualizado. Para una consulta
            sobre tu caso concreto, contacta con{" "}
            <a href={`mailto:${LEGAL_ENTITY.supportEmail}`} className="underline">
              {LEGAL_ENTITY.supportEmail}
            </a>
            .
          </p>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-bold">Guías relacionadas</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              <Link href="/que-es-el-deca">Qué es el DeCA y para qué sirve</Link>
            </li>
            <li>
              <Link href="/deca-obligatorio-2026">Por qué el DeCA es obligatorio desde 2026</Link>
            </li>
            <li>
              <Link href="/como-hacer-un-deca">Cómo hacer un DeCA paso a paso</Link>
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
      <MobileCta />
    </>
  );
}
