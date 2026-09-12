import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { extraRouteSummaries } from "@/lib/data/history-routes";
import { historyIsTruncated, HISTORY_ROW_CAP } from "@/lib/data/history";

/** #114 — the multi-envío route summary shown on the redesigned Historial row. */
describe("extraRouteSummaries", () => {
  const shipment = (loadCity: string, unloadCity: string) => ({
    loadLocation: { name: "", city: loadCity },
    unloadLocation: { name: "", city: unloadCity },
  });

  it("returns nothing for a single-shipment (or missing) list", () => {
    expect(extraRouteSummaries(undefined)).toEqual([]);
    expect(extraRouteSummaries([shipment("VALENCIA", "MADRID")])).toEqual([]);
  });

  it("skips shipment 1 and summarises the rest as ORIGEN → DESTINO", () => {
    const out = extraRouteSummaries([
      shipment("VALENCIA", "MADRID"),
      shipment("CASTELLÓN", "MADRID"),
    ]);
    expect(out).toEqual(["CASTELLÓN → MADRID"]);
  });

  it("caps at 3 extra routes, never listing an unbounded number", () => {
    const shipments = [
      shipment("A", "B"),
      shipment("C", "D"),
      shipment("E", "F"),
      shipment("G", "H"),
      shipment("I", "J"),
    ];
    expect(extraRouteSummaries(shipments)).toEqual(["C → D", "E → F", "G → H"]);
  });

  it("prefers name over city when a name is present, matching formatLocationShort", () => {
    const out = extraRouteSummaries([
      shipment("VALENCIA", "MADRID"),
      { loadLocation: { name: "FÁBRICA", city: "CASTELLÓN" }, unloadLocation: { city: "MADRID" } },
    ]);
    expect(out).toEqual(["FÁBRICA — CASTELLÓN → MADRID"]);
  });
});

// #137 — listHistory()'s hard 500-row cap must be detectable, so /panel/historico
// can warn the user instead of silently dropping older documents from search.
describe("historyIsTruncated", () => {
  it("is false at or below the cap", () => {
    expect(historyIsTruncated(0)).toBe(false);
    expect(historyIsTruncated(HISTORY_ROW_CAP)).toBe(false);
  });

  it("is true only once the company's real total exceeds the cap", () => {
    expect(historyIsTruncated(HISTORY_ROW_CAP + 1)).toBe(true);
    expect(historyIsTruncated(HISTORY_ROW_CAP + 500)).toBe(true);
  });

  it("respects an explicit cap override", () => {
    expect(historyIsTruncated(10, 5)).toBe(true);
    expect(historyIsTruncated(5, 5)).toBe(false);
  });
});
