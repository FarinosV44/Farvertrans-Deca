import { describe, expect, it } from "vitest";
import { distinctPlaces, type PlaceFields } from "@/components/deca/wizard";

/**
 * #112 correction — "Vincular carga y descarga" only appears once BOTH the
 * load and unload sides have 2+ distinct places. `distinctPlaces()` is the
 * pure dedup this decision rests on.
 */
const place = (over: Partial<PlaceFields> = {}): PlaceFields => ({
  name: "Almacén Turia",
  address: "Av. del Puerto 120",
  postalCode: "46023",
  city: "Valencia",
  province: "Valencia",
  country: "España",
  ...over,
});

describe("distinctPlaces (#112 correction)", () => {
  it("collapses two identical places (same name+city+address) into one", () => {
    const out = distinctPlaces([place(), place()]);
    expect(out).toHaveLength(1);
  });

  it("keeps two genuinely different places", () => {
    const out = distinctPlaces([place(), place({ name: "Almacén Castellón", city: "Castellón" })]);
    expect(out).toHaveLength(2);
  });

  it("is case- and whitespace-insensitive on the match", () => {
    const out = distinctPlaces([place(), place({ name: "  ALMACÉN TURIA  " })]);
    expect(out).toHaveLength(1);
  });

  it("drops a genuinely blank place (never counted as a real stop)", () => {
    const out = distinctPlaces([
      place(),
      { name: "", address: "", postalCode: "", city: "", province: "", country: "" },
    ]);
    expect(out).toHaveLength(1);
  });

  it("treats two places with the same name in different cities as distinct", () => {
    const out = distinctPlaces([place(), place({ city: "Madrid" })]);
    expect(out).toHaveLength(2);
  });
});
