import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCta } from "@/components/site/mobile-cta";
import { CtaButton } from "@/components/site/cta-button";
import { listContent } from "@/lib/content/cms";
import { publicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Blog del DeCA | Actualidad y novedades del transporte",
  description:
    "Novedades normativas, recordatorios de fechas, inspecciones y consejos de implantación del DeCA.",
  alternates: { canonical: `${publicEnv.baseUrl}/blog` },
};

export default async function BlogIndex() {
  const items = await listContent({ type: "blog", status: "published" });
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[760px] px-4 pb-24 pt-10 md:px-6 md:pb-12">
        <h1 className="text-3xl font-bold md:text-4xl">Blog del DeCA</h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">
          Cambios normativos, fechas clave y práctica del día a día.
        </p>
        <div className="mt-6">
          <CtaButton>CREAR DECA GRATIS</CtaButton>
        </div>
        {items.length === 0 ? (
          <p className="mt-8 text-sm text-[var(--color-text-muted)]">
            Pronto habrá artículos aquí.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {items.map((g) => (
              <li key={g.id} className="py-4">
                <Link href={`/blog/${g.slug}`} className="text-lg font-bold no-underline">
                  {g.title}
                </Link>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{g.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
      <MobileCta />
    </>
  );
}
