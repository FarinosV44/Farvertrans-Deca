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
  title: "Guías del DeCA | Cómo generarlo, quién está obligado y requisitos",
  description:
    "Guías prácticas sobre el Documento Electrónico de Control Administrativo (DeCA): cómo generarlo, quién está obligado, datos obligatorios, QR y correcciones.",
  alternates: { canonical: `${publicEnv.baseUrl}/guias` },
};

export default async function GuiasIndex() {
  const items = await listContent({ type: "guide", status: "published" });
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[760px] px-4 pb-24 pt-10 md:px-6 md:pb-12">
        <h1 className="text-3xl font-bold md:text-4xl">Guías del DeCA</h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">
          Todo lo que necesitas para generar y gestionar el Documento Electrónico de Control.
        </p>
        <div className="mt-6">
          <CtaButton>CREAR DECA GRATIS</CtaButton>
        </div>
        {items.length === 0 ? (
          <p className="mt-8 text-sm text-[var(--color-text-muted)]">Pronto habrá guías aquí.</p>
        ) : (
          <ul className="mt-8 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {items.map((g) => (
              <li key={g.id} className="py-4">
                <Link href={`/guias/${g.slug}`} className="text-lg font-bold no-underline">
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
