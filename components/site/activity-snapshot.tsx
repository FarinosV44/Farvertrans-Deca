import { DocumentIcon, BuildingIcon, TruckIcon, HistoryIcon } from "@/components/panel/icons";

/**
 * Non-interactive "Tu actividad" snapshot (#68) — the third right-column
 * visual in the "Cada DeCA te cuesta menos tiempo" section, so the column
 * balances the feature grid on the left instead of ending in empty space.
 * Same product-led-graphics rule as `SavedDataPreview` / `WorkspacePreview`
 * (DESIGN #55 §5): the layout mirrors a real panel summary; the figures are
 * generic placeholders coherent with the two previews above it (a handful of
 * saved parties, a short history), never a real customer's numbers. Decorative
 * and `aria-hidden` like its siblings — the real panel is behind the CTA.
 */
const TILES = [
  { Icon: DocumentIcon, value: "24", label: "DeCA creados" },
  { Icon: BuildingIcon, value: "3", label: "Empresas habituales" },
  { Icon: TruckIcon, value: "2", label: "Vehículos guardados" },
  { Icon: HistoryIcon, value: "Hoy", label: "Último DeCA creado" },
] as const;

export function ActivitySnapshot() {
  return (
    <div
      aria-hidden
      className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4 shadow-[0_4px_16px_rgba(15,23,32,0.08)]"
    >
      <p className="text-sm font-bold">Tu actividad</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {TILES.map((t) => (
          <div
            key={t.label}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-2"
          >
            <t.Icon width={14} height={14} className="text-[var(--color-text-muted)]" />
            <p className="mt-1.5 text-base font-bold tabular-nums leading-none">{t.value}</p>
            <p className="mt-1 text-[11px] leading-tight text-[var(--color-text-muted)]">
              {t.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
