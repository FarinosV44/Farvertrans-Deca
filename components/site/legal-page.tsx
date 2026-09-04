import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import type { ReactNode } from "react";

/** Shared shell for the minimal legal/support pages (footer nav). */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[760px] px-4 pb-24 pt-10 md:px-6 md:pb-12">
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        <div className="prose-legal mt-6 space-y-4 text-[var(--color-text)] [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
