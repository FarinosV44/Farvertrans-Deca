import { describe, expect, it } from "vitest";
import { extraRouteSummaries } from "@/lib/data/history-routes";

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
