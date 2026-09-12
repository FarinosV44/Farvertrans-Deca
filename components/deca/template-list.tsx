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

/** Manage saved DeCA templates (UX #25). */
export function TemplateList({ templates }: { templates: Row[] }) {
  const router = useRouter();

  async function remove(id: string) {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (templates.length === 0) {
    return (
      <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <p className="text-base font-bold">Crea tu primera plantilla</p>
        <p className="mt-2 max-w-prose text-sm text-[var(--color-text-muted)]">
          Guarda rutas y datos que repites para generar nuevos DeCA más rápido. Las plantillas
          rellenan tus datos habituales y siempre generan un documento nuevo e independiente.
        </p>
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
          Ideal para rutas frecuentes, clientes habituales y operaciones repetitivas.
        </p>
        <div className="mt-4 flex flex-col gap-2 md:flex-row">
          <Link
            href="/crear"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)] no-underline hover:bg-[var(--color-primary-hover)] md:w-auto"
          >
            Generar un DeCA
          </Link>
          <Link
            href="/panel/historico"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary)] no-underline hover:bg-[var(--color-primary-bg)] md:w-auto"
          >
            Crear desde un DeCA
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
      {templates.map((t) => {
        const loadShort = formatLocationShort(t.loadLocation);
        const unloadShort = formatLocationShort(t.unloadLocation);
        return (
          <li key={t.id} className="flex items-center justify-between gap-3 py-3 text-sm">
            <div className="flex min-w-0 items-start gap-2">
              <FavoriteStar
                favorite={!!t.favorite}
                payload={{ kind: "template", id: t.id }}
                label={t.name}
              />
              <div className="min-w-0">
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {[
                    loadShort && unloadShort ? `${loadShort} → ${unloadShort}` : null,
                    t.carrier?.name,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href={`/crear?template=${t.id}`}>Usar</Link>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="text-[var(--color-danger)] underline"
              >
                Borrar
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
