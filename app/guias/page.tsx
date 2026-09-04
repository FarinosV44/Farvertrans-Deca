import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCta } from "@/components/site/mobile-cta";
import { CtaButton } from "@/components/site/cta-button";
import { GuideSearch } from "@/components/content/guide-search";
import { listPublishedFullSafe } from "@/lib/content/cms";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

const TITLE = "Guías del DeCA | Cómo generarlo, quién está obligado y requisitos";
const DESCRIPTION =
  "Guías prácticas sobre el Documento Electrónico de Control Administrativo (DeCA): cómo generarlo, quién está obligado, datos obligatorios, QR y correcciones.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${publicEnv.baseUrl}/guias` },
  openGraph: {
    type: "website",
    url: `${publicEnv.baseUrl}/guias`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: BRAND.name,
  },
};

export default async function GuiasIndex() {
  const items = await listPublishedFullSafe("guide");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${publicEnv.baseUrl}/guias`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[1000px] px-4 pb-24 pt-10 md:px-6 md:pb-12">
        <h1 className="text-3xl font-bold md:text-4xl">Guías del DeCA</h1>
        <p className="mt-2 max-w-2xl text-lg text-[var(--color-text-muted)]">
          Respuestas prácticas a las dudas reales de generar, entregar y corregir el Documento
          Electrónico de Control — un tema por guía, sin relleno.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <CtaButton>CREAR DECA GRATIS</CtaButton>
          <Link
            href="/soy-obligado"
            className="inline-flex min-h-12 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 font-medium no-underline"
          >
            ¿Estoy obligado?
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
            <p className="text-lg font-bold">Estamos publicando las primeras guías</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Vuelve pronto, o resuelve tu duda ahora mismo en{" "}
              <Link href="/soy-obligado" className="underline">
                ¿Estoy obligado a hacer el DeCA?
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-10">
            <GuideSearch guides={items} />
          </div>
        )}
      </main>
      <SiteFooter />
      <MobileCta />
    </>
  );
}
