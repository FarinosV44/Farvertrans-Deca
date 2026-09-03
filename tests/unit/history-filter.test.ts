import { describe, expect, it } from "vitest";
import { rowMatches, type FilterableRow } from "@/lib/data/history-filter";
import { savedVehicleSchema, savedCompanySchema } from "@/lib/data/saved-schema";

const row: FilterableRow = {
  reference: "DECA-AB12CD34",
  origin: "Valencia",
  destination: "Madrid",
  carrier: "Transportes Pérez SL",
  tractorPlate: "1234BCD",
  transportDate: "2026-10-06",
  shipperName: "Cargas del Turia SL",
  shipperNif: "B96789011",
  carrierNif: "B12345674",
};

describe("history filter", () => {
  it("matches with no filters", () => {
    expect(rowMatches(row, {})).toBe(true);
  });
  it("matches free text across reference, place, carrier, plate and shipper", () => {
    for (const q of ["ab12cd", "madrid", "pérez", "1234bcd", "turia", "b96789011"]) {
      expect(rowMatches(row, { q }), q).toBe(true);
    }
    expect(rowMatches(row, { q: "barcelona" })).toBe(false);
  });
  it("applies the date range on the transport date", () => {
    expect(rowMatches(row, { from: "2026-10-01", to: "2026-10-31" })).toBe(true);
    expect(rowMatches(row, { from: "2026-11-01" })).toBe(false);
    expect(rowMatches(row, { to: "2026-09-30" })).toBe(false);
  });
});

describe("saved-entity schemas", () => {
  it("normalises a vehicle plate", () => {
    expect(
      savedVehicleSchema.parse({ tractorPlate: "1234-bcd", trailerPlate: " r 99 x " }).tractorPlate,
    ).toBe("1234BCD");
  });
  it("rejects a company with no NIF", () => {
    expect(savedCompanySchema.safeParse({ name: "X SL", nif: "" }).success).toBe(false);
  });
});
