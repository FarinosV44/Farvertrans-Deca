export type HistoryFilters = {
  q?: string; // free text: reference / company / carrier / plate / origin / destination
  from?: string; // yyyy-mm-dd (transport date >=)
  to?: string; // yyyy-mm-dd (transport date <=)
};

export type FilterableRow = {
  reference: string;
  origin: string;
  destination: string;
  carrier: string;
  tractorPlate: string;
  transportDate: string;
  shipperName?: string;
  shipperNif?: string;
  carrierNif?: string;
};

/** Pure predicate: does a history row match the given filters? */
export function rowMatches(row: FilterableRow, f: HistoryFilters): boolean {
  if (f.from && row.transportDate && row.transportDate < f.from) return false;
  if (f.to && row.transportDate && row.transportDate > f.to) return false;

  const q = f.q?.trim().toLowerCase();
  if (!q) return true;

  const hay = [
    row.reference,
    row.origin,
    row.destination,
    row.carrier,
    row.tractorPlate,
    row.shipperName ?? "",
    row.shipperNif ?? "",
    row.carrierNif ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}
