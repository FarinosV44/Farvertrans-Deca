import "server-only";
import { listHistory } from "@/lib/data/history";

/**
 * Company-scoped global search (PRODUCT #56 — power-user command palette).
 * Reuses `listHistory`'s existing free-text filter (`lib/data/history-filter.ts`
 * `rowMatches`, already matching reference/locations/carrier/plate/shipper/NIF)
 * rather than a second query path — same matching rules everywhere a company
 * searches its own DeCA history.
 */

export type SearchHit = {
  label: string;
  sub: string;
  href: string;
};

export async function searchCompanyDecas(
  companyId: string,
  rawQuery: string,
): Promise<SearchHit[]> {
  const q = rawQuery.trim();
  if (q.length < 2) return [];

  const rows = await listHistory(companyId, { q });
  return rows.slice(0, 8).map((r) => ({
    // #112: matches the "sin transportista" fallback just below — this file
    // doesn't thread a locale dictionary through (unlike the full pages), so
    // the badge follows the same plain-Spanish convention already here.
    label: `${r.loadLocation} → ${r.unloadLocation}${r.shipmentCount > 1 ? ` (+${r.shipmentCount - 1} envío${r.shipmentCount > 2 ? "s" : ""})` : ""}`,
    sub: `${r.reference} · ${r.carrier || "sin transportista"}${r.tractorPlate ? ` · ${r.tractorPlate}` : ""}`,
    href: `/panel/deca/${r.id}`,
  }));
}
