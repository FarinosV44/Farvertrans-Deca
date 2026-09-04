export type HistoryFilters = {
  q?: string; // free text: reference / company / carrier / plate / load / unload location
  from?: string; // yyyy-mm-dd (load date >=)
  to?: string; // yyyy-mm-dd (load date <=)
  carrier?: string; // exact effective-carrier name (WORKSPACE #24)
  plate?: string; // tractor/trailer plate contains (normalised, case-insensitive)
};

export type FilterableRow = {
  reference: string;
  loadLocation: string;
  unloadLocation: string;
  carrier: string;
  tractorPlate: string;
  trailerPlate?: string;
  loadDate: string;
  shipperName?: string;
  shipperNif?: string;
  carrierNif?: string;
};

/** Pure predicate: does a history row match the given filters? */
export function rowMatches(row: FilterableRow, f: HistoryFilters): boolean {
  if (f.from && row.loadDate && row.loadDate < f.from) return false;
  if (f.to && row.loadDate && row.loadDate > f.to) return false;

  if (f.carrier && f.carrier.trim() && row.carrier !== f.carrier.trim()) return false;

  const plate = f.plate?.replace(/[\s-]/g, "").toLowerCase();
  if (plate) {
    const plates = `${row.tractorPlate} ${row.trailerPlate ?? ""}`
      .replace(/[\s-]/g, "")
      .toLowerCase();
    if (!plates.includes(plate)) return false;
  }

  const q = f.q?.trim().toLowerCase();
  if (!q) return true;

  const hay = [
    row.reference,
    row.loadLocation,
    row.unloadLocation,
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
