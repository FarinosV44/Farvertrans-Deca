import { SearchIcon, HistoryIcon } from "@/components/panel/icons";

/**
 * Non-interactive visual of the real `/panel/historico` workspace — DESIGN
 * #55 §5's "empresa trabaja más rápido" visual, paired with the "cada DeCA
 * te cuesta menos tiempo" section. Same product-led-graphics rule as
 * `DecaPreview` (§1): the layout, columns and status badges mirror the real
 * history table exactly; only the route/plate/date values are generic
 * placeholders, never a real customer's data.
 */
const ROWS = [
  { route: "Valencia → Madrid", plate: "1234 ABC", date: "3 sept.", status: "ok" },
  { route: "Bilbao → Zaragoza", plate: "5678 BCD", date: "3 sept.", status: "ok" },
  { route: "Sevilla → Córdoba", plate: "1234 ABC", date: "2 sept.", status: "corrected" },
  { route: "Madrid → Barcelona", plate: "9012 CDE", date: "1 sept.", status: "ok" },
] as const;

export function WorkspacePreview() {
  return (
    <div
      aria-hidden
      className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4 shadow-[0_4px_16px_rgba(15,23,32,0.08)]"
    >
      <div className="flex items-center gap-2">
        <HistoryIcon width={16} height={16} className="text-[var(--color-text-muted)]" />
        <p className="text-sm font-bold">Histórico</p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex h-8 flex-1 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 text-[11px] text-[var(--color-text-muted)]">
          <SearchIcon width={13} height={13} className="shrink-0" />
          <span className="truncate">Buscar por matrícula o ruta…</span>
        </div>
        <span className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-primary-contrast)]">
          Todos
        </span>
      </div>
      <div className="mt-3 divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
        {ROWS.map((r) => (
          <div key={r.route + r.date} className="flex items-center gap-2 py-2.5 text-xs">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.route}</p>
              <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-muted)]">
                {r.plate} · {r.date}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium text-white ${
                r.status === "ok" ? "bg-[var(--color-success)]" : "bg-[var(--color-primary)]"
              }`}
            >
              {r.status === "ok" ? "Vigente" : "Corregida"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
