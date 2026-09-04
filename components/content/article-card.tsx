import Link from "next/link";
import type { ContentItem } from "@/lib/content/cms";
import { estimateReadingMinutes } from "@/lib/content/reading-time";

const fmtDate = (d: Date | null) =>
  d ? d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : null;

/**
 * A published content item as a card — used on `/guias` and `/blog` (SEO #32).
 * Title, excerpt, category, date, estimated reading time, CTA.
 */
export function ArticleCard({
  item,
  href,
}: {
  item: Pick<ContentItem, "title" | "excerpt" | "category" | "publishedAt" | "body">;
  href: string;
}) {
  const minutes = estimateReadingMinutes(item.body);
  const date = fmtDate(item.publishedAt);
  return (
    <article className="flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-shadow hover:shadow-[0_4px_16px_-4px_rgba(15,23,32,0.12)]">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-text-muted)]">
        {item.category && (
          <span className="rounded-full bg-[var(--color-surface)] px-2 py-0.5 font-medium text-[var(--color-primary)]">
            {item.category}
          </span>
        )}
        {date && <span>{date}</span>}
        <span aria-hidden>·</span>
        <span>{minutes} min de lectura</span>
      </div>
      <h2 className="mt-3 text-lg font-bold leading-snug">
        <Link href={href} className="no-underline hover:underline">
          {item.title}
        </Link>
      </h2>
      <p className="mt-2 flex-1 text-sm text-[var(--color-text-muted)]">{item.excerpt}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1 self-start text-sm font-medium text-[var(--color-primary)] no-underline"
      >
        Leer artículo →
      </Link>
    </article>
  );
}
