import { formatLocationShort, type TransportLocation } from "@/lib/deca/location";

/**
 * #114 — up to `cap` routes ("ORIGEN → DESTINO") for shipments beyond the
 * first, for the redesigned Historial row's multi-envío summary line. Pure —
 * no DB access, kept as a sibling of `history-filter.ts` so it stays
 * unit-testable (`lib/data/history.ts` is `server-only`). Caller passes the
 * UPPERCASED `shipments` (post-`toDisplayDeca`, #86 p3), so the summary
 * matches every other visible field on the row; never truncates so
 * aggressively the route becomes unreadable, but never lists more than `cap`
 * either — "no convertir la fila en una lista enorme".
 */
export function extraRouteSummaries(shipments: unknown[] | undefined, cap = 3): string[] {
  if (!Array.isArray(shipments)) return [];
  return shipments.slice(1, 1 + cap).map((raw) => {
    const s = raw as {
      loadLocation?: Partial<TransportLocation>;
      unloadLocation?: Partial<TransportLocation>;
    };
    return `${formatLocationShort(s.loadLocation)} → ${formatLocationShort(s.unloadLocation)}`;
  });
}
