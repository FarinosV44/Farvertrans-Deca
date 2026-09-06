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
    label: `${r.loadLocation} → ${r.unloadLocation}`,
    sub: `${r.reference} · ${r.carrier || "sin transportista"}${r.tractorPlate ? ` · ${r.tractorPlate}` : ""}`,
    href: `/panel/deca/${r.id}`,
  }));
}
