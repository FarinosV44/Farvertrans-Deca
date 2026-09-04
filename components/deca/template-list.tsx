"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatLocationShort, type TransportLocation } from "@/lib/deca/location";

type Row = {
  id: string;
  name: string;
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
      <p className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
        Aún no tienes plantillas. Genera un DeCA y pulsa «Guardar como plantilla» desde su detalle,
        o créala desde un documento del <Link href="/panel/historico">historial</Link>.
      </p>
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
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {[loadShort && unloadShort ? `${loadShort} → ${unloadShort}` : null, t.carrier?.name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href="/crear">Usar</Link>
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
