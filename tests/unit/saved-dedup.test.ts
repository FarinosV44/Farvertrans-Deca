import { describe, expect, it } from "vitest";
import {
  findDuplicateCompany,
  findDuplicateLocation,
  findDuplicateShipment,
  findDuplicateVehicle,
} from "@/lib/data/saved-dedup";

/**
 * #113 §13 — soft duplicate detection for "Datos habituales". Exact-match
 * only (never fuzzy — a false positive would block a legitimate save with
 * confusing noise); case/format variations of the SAME value must still
 * match (the whole point is catching "I typed this again slightly
 * differently"), and a genuinely different value must never be flagged.
 */
describe("findDuplicateCompany", () => {
  const existing = [
    { id: "c1", name: "Cargas del Turia SL", nif: "B96789011", address: "Av. del Puerto 120" },
  ];

  it("catches the same NIF typed in a different case", () => {
    const dup = findDuplicateCompany(existing, { name: "Otro nombre", nif: "b96789011" });
    expect(dup?.id).toBe("c1");
  });

  it("catches the same name+address typed differently, even with a different NIF", () => {
    const dup = findDuplicateCompany(existing, {
      name: "  cargas del turia sl  ",
      address: "av. del puerto 120",
      nif: "B00000000",
    });
    expect(dup?.id).toBe("c1");
  });

  it("does not flag a genuinely different company", () => {
    const dup = findDuplicateCompany(existing, {
      name: "Otra Empresa SL",
      address: "Calle Distinta 5",
      nif: "B11111111",
    });
    expect(dup).toBeUndefined();
  });
});

describe("findDuplicateVehicle", () => {
  const existing = [{ id: "v1", tractorPlate: "1234 BCD" }];

  it("catches the same plate typed with different spacing/case", () => {
    expect(findDuplicateVehicle(existing, { tractorPlate: "1234bcd" })?.id).toBe("v1");
    expect(findDuplicateVehicle(existing, { tractorPlate: "1234-BCD" })?.id).toBe("v1");
  });

  it("does not flag a different plate", () => {
    expect(findDuplicateVehicle(existing, { tractorPlate: "5678 XYZ" })).toBeUndefined();
  });
});

describe("findDuplicateLocation", () => {
  const existing = [
    { id: "l1", address: "Av. del Puerto 120", postalCode: "46023", city: "Valencia" },
  ];

  it("catches the same address typed differently", () => {
    const dup = findDuplicateLocation(existing, {
      address: "av. del puerto 120",
      postalCode: "46023",
      city: "VALENCIA",
    });
    expect(dup?.id).toBe("l1");
  });

  it("does not flag the same street name in a different city", () => {
    const dup = findDuplicateLocation(existing, {
      address: "Av. del Puerto 120",
      postalCode: "08001",
      city: "Barcelona",
    });
    expect(dup).toBeUndefined();
  });
});

describe("findDuplicateShipment", () => {
  const existing = [{ id: "s1", loadLocationId: "loc-a", unloadLocationId: "loc-b" }];

  it("catches the exact same load/unload pair", () => {
    expect(
      findDuplicateShipment(existing, { loadLocationId: "loc-a", unloadLocationId: "loc-b" })?.id,
    ).toBe("s1");
  });

  it("does not flag the reversed pair (a different real route)", () => {
    expect(
      findDuplicateShipment(existing, { loadLocationId: "loc-b", unloadLocationId: "loc-a" }),
    ).toBeUndefined();
  });

  it("does not flag a pair sharing only one leg", () => {
    expect(
      findDuplicateShipment(existing, { loadLocationId: "loc-a", unloadLocationId: "loc-c" }),
    ).toBeUndefined();
  });
});
