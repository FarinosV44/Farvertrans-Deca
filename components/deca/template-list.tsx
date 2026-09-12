"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatLocationShort, type TransportLocation } from "@/lib/deca/location";
import { FavoriteStar } from "@/components/deca/favorite-star";

type Row = {
  id: string;
  name: string;
  favorite?: boolean;
  loadLocation?: Partial<TransportLocation>;
  unloadLocation?: Partial<TransportLocation>;
  carrier?: { name?: string };
};

export type TemplateListMessages = {
  emptyTitle: string;
  emptyBody: string;
  emptyHint: string;
  generateCta: string;
  fromHistoryCta: string;
  use: string;
  delete: string;
};

/** Manage saved DeCA templates (UX #25). */
export function TemplateList({ templates, t }: { templates: Row[]; t: TemplateListMessages }) {
  const router = useRouter();

  async function remove(id: string) {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (templates.length === 0) {
    return (
      <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <p className="text-base font-bold">{t.emptyTitle}</p>
        <p className="mt-2 max-w-prose text-sm text-[var(--color-text-muted)]">{t.emptyBody}</p>
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">{t.emptyHint}</p>
        <div className="mt-4 flex flex-col gap-2 md:flex-row">
          <Link
            href="/crear"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)] no-underline hover:bg-[var(--color-primary-hover)] md:w-auto"
          >
            {t.generateCta}
          </Link>
          <Link
            href="/panel/historico"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary)] no-underline hover:bg-[var(--color-primary-bg)] md:w-auto"
          >
            {t.fromHistoryCta}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul
      className="mt-3 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]"
      data-testid="template-list"
    >
      {templates.map((tpl) => {
        const loadShort = formatLocationShort(tpl.loadLocation);
        const unloadShort = formatLocationShort(tpl.unloadLocation);
        return (
          <li key={tpl.id} className="flex items-center justify-between gap-3 py-3 text-sm">
            <div className="flex min-w-0 items-start gap-2">
              <FavoriteStar
                favorite={!!tpl.favorite}
                payload={{ kind: "template", id: tpl.id }}
                label={tpl.name}
              />
              <div className="min-w-0">
                <p className="font-medium">{tpl.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {[
                    loadShort && unloadShort ? `${loadShort} → ${unloadShort}` : null,
                    tpl.carrier?.name,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href={`/crear?template=${tpl.id}`}>{t.use}</Link>
              <button
                type="button"
                onClick={() => remove(tpl.id)}
                className="text-[var(--color-danger)] underline"
              >
                {t.delete}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
