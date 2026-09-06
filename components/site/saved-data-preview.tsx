import { BuildingIcon, TruckIcon, MapPinIcon, CheckIcon } from "@/components/panel/icons";

/**
 * Non-interactive visual of the real `/panel/datos` saved-data manager
 * (DESIGN #55 §5 follow-up) — pairs with `WorkspacePreview`'s history table
 * to give the "Cada DeCA te cuesta menos tiempo" section two real product
 * visuals instead of one plus empty space. Where `WorkspacePreview` shows
 * the "reutiliza siempre" outcome (past documents), this shows the "guarda
 * una vez" building blocks (saved companies/vehicles/locations) that make
 * that reuse possible — same generic-values-on-real-layout rule as
 * `DecaPreview` and `WorkspacePreview`.
 */
const ROWS = [
  { Icon: BuildingIcon, label: "Transportes Ejemplo SL", meta: "Cargador · NIF B00000000" },
  { Icon: TruckIcon, label: "1234 ABC", meta: "Tractora + remolque" },
  { Icon: MapPinIcon, label: "Polígono Ejemplo, Valencia", meta: "Lugar de carga" },
] as const;

export function SavedDataPreview() {
  return (
    <div
      aria-hidden
      className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4 shadow-[0_4px_16px_rgba(15,23,32,0.08)]"
    >
      <p className="text-sm font-bold">Datos guardados</p>
      <div className="mt-3 space-y-2">
        {ROWS.map((r) => (
          <div
            key={r.label}
            className="flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-2"
          >
            <r.Icon width={15} height={15} className="shrink-0 text-[var(--color-text-muted)]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{r.label}</p>
              <p className="truncate text-[11px] text-[var(--color-text-muted)]">{r.meta}</p>
            </div>
            <CheckIcon width={13} height={13} className="shrink-0 text-[var(--color-success)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
