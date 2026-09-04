import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCta } from "@/components/site/mobile-cta";
import { CtaButton } from "@/components/site/cta-button";
import { TrackView } from "@/components/analytics/track-view";
import { Markdown, extractHeadings } from "@/lib/content/markdown";
import type { ContentItem, Source } from "@/lib/content/cms";

/**
 * Premium branded article layout for CMS guides + blog posts (SEO #32):
 * breadcrumbs, a table of contents on long guides, hero, an editorial meta strip
 * (autor / última revisión), the rendered body, contextual CTAs, sources and a
 * related-content block.
 */
export function ArticleLayout({
  item,
  related,
  preview = false,
}: {
  item: ContentItem;
  related: { title: string; href: string }[];
  preview?: boolean;
}) {
  const isGuide = item.type === "guide";
  const familyHref = isGuide ? "/guias" : "/blog";
  const familyLabel = isGuide ? "Guías" : "Blog";
  const headings = extractHeadings(item.body);
  const sources = (item.sources as unknown as Source[]) ?? [];
  const reviewed = item.lastReviewedAt ? item.lastReviewedAt.toISOString().slice(0, 10) : null;

  return (
    <>
      {!preview && <TrackView event="content_view" />}
      <SiteHeader />

      {preview && (
        <div className="bg-[var(--color-primary)] px-4 py-2 text-center text-sm font-medium text-[var(--color-primary-contrast)]">
          Vista previa · estado: {item.status} · no indexable
        </div>
      )}

      <main id="contenido" className="mx-auto max-w-[760px] px-4 pb-24 pt-10 md:px-6 md:pb-12">
        <nav aria-label="Migas de pan" className="text-xs text-[var(--color-text-muted)]">
          <Link href="/" className="underline">
            Inicio
          </Link>
          <span aria-hidden> / </span>
          <Link href={familyHref} className="underline">
            {familyLabel}
          </Link>
          <span aria-hidden> / </span>
          <span>{item.title}</span>
        </nav>

        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{item.title}</h1>
        <p className="mt-3 text-lg text-[var(--color-text-muted)]">{item.excerpt}</p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]">
          {item.authorName && <span>Por {item.authorName}</span>}
          {reviewed && <span>Última revisión: {reviewed}</span>}
          {item.category && <span>{item.category}</span>}
        </div>

        {item.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.heroImage}
            alt=""
            className="mt-6 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)]"
          />
        )}

        {headings.length >= 3 && (
          <nav
            aria-label="Contenido"
            className="mt-8 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <p className="text-sm font-bold">En esta página</p>
            <ul className="mt-2 space-y-1 text-sm">
              {headings.map((h) => (
                <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
                  <a href={`#${h.id}`} className="hover:underline">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mt-6">
          <CtaButton event="content_cta_click">CREAR DECA GRATIS</CtaButton>
        </div>

        <article className="mt-6 text-[var(--color-text)]">
          <Markdown source={item.body} />
        </article>

        {sources.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold">Fuentes</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold">Sigue leyendo</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href}>{r.title}</Link>
                </li>
              ))}
              <li>
                <Link href="/soy-obligado">¿Estoy obligado a hacer el DeCA?</Link>
              </li>
            </ul>
          </section>
        )}

        <div className="mt-10 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 text-center">
          <p className="font-bold">{item.ctaLabel || "Crea tu DeCA ahora"}</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Sin tarjeta · Sin límite · Gratis hasta el 31/12/2026
          </p>
          <div className="mt-4">
            <CtaButton event="content_cta_click">CREAR DECA GRATIS</CtaButton>
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileCta />
    </>
  );
}
