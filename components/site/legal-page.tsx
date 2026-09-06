import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import type { ReactNode } from "react";

/**
 * Shared shell for the minimal legal/support pages (footer nav): aviso legal,
 * privacidad, términos, cookies.
 *
 * LEGAL #52/#54, D-072/D-085: these pages' actual legal content is
 * deliberately Spanish-only in EVERY locale — a mistranslated liability or
 * GDPR clause carries real legal risk, and no translation of that content has
 * had a professional legal review. This is an explicit owner decision,
 * reaffirmed directly (D-085) rather than silently worked around. What DOES
 * change per locale is a short, non-technical notice — safe to translate —
 * telling a non-Spanish visitor why the page in front of them is in Spanish,
 * shown here once so all four pages stay consistent automatically.
 */
export async function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[760px] px-4 pb-24 pt-10 md:px-6 md:pb-12">
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {locale !== "es" && (
          <p
            role="note"
            data-testid="legal-not-translated-notice"
            className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text-muted)]"
          >
            {t.legalNotice.notTranslated}
          </p>
        )}
        <div className="prose-legal mt-6 space-y-4 text-[var(--color-text)] [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
