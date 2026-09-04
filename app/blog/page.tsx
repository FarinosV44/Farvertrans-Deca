import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCta } from "@/components/site/mobile-cta";
import { CtaButton } from "@/components/site/cta-button";
import { ArticleCard } from "@/components/content/article-card";
import { listPublishedFullSafe } from "@/lib/content/cms";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

const TITLE = "Blog de DeCA Fácil | Novedades y actualidad del transporte";
const DESCRIPTION =
  "Cambios normativos, fechas clave, inspecciones y consejos prácticos sobre el Documento Electrónico de Control (DeCA) para transportistas y cargadores.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${publicEnv.baseUrl}/blog` },
  openGraph: {
    type: "website",
    url: `${publicEnv.baseUrl}/blog`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: BRAND.name,
  },
};

export default async function BlogIndex() {
  const items = await listPublishedFullSafe("blog");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: TITLE,
    description: DESCRIPTION,
    url: `${publicEnv.baseUrl}/blog`,
    blogPost: items.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${publicEnv.baseUrl}/blog/${p.slug}`,
      datePublished: p.publishedAt?.toISOString(),
    })),
  };

  return (
    <>
      {items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[1000px] px-4 pb-24 pt-10 md:px-6 md:pb-12">
        <h1 className="text-3xl font-bold md:text-4xl">Blog</h1>
        <p className="mt-2 max-w-2xl text-lg text-[var(--color-text-muted)]">
          Novedades normativas, fechas clave y práctica real del transporte de mercancías — para
          llegar preparado al DeCA sin sorpresas.
        </p>
        <div className="mt-6">
          <CtaButton>CREAR DECA GRATIS</CtaButton>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
            <p className="text-lg font-bold">Estamos preparando los primeros artículos</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Mientras tanto, todo lo esencial sobre el DeCA está en{" "}
              <Link href="/guias" className="underline">
                nuestras guías
              </Link>{" "}
              y en{" "}
              <Link href="/soy-obligado" className="underline">
                ¿Estoy obligado?
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {items.map((p) => (
              <ArticleCard key={p.id} item={p} href={`/blog/${p.slug}`} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
      <MobileCta />
    </>
  );
}
