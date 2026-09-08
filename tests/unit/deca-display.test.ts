import { describe, expect, it } from "vitest";
import { toDisplayDeca } from "@/lib/deca/display";

const raw = {
  shipper: {
    name: "Transportes Martínez sl",
    nif: "B12345674",
    address: "Calle Mayor 24",
    city: "Valencia",
  },
  carrier: {
    name: "logística del turia sa",
    nif: "a96789011",
    address: "Pol. Fuente 5",
    postalCode: "46988",
    city: "paterna",
  },
  loadLocation: {
    name: "almacén norte",
    address: "Av. del Puerto 120",
    postalCode: "46023",
    city: "valencia",
    province: "valencia",
    country: "españa",
  },
  unloadLocation: {
    name: "plataforma sur",
    address: "calle alcalá 200",
    postalCode: "28028",
    city: "madrid",
    country: "españa",
  },
  goods: "Mercancía general paletizada",
  weight: "12.500 kg",
  loadDate: "2026-10-06",
  unloadDate: "2026-10-06",
  tractorPlate: "1234BCD",
  reference: "ped-2026-4412",
  notes: "Entregar antes de las 14h",
};

describe("toDisplayDeca (#86 p3 / 2026-09-08 FIX)", () => {
  const d = toDisplayDeca(structuredClone(raw));

  it("uppercases every visible textual field", () => {
    expect(d.shipper.name).toBe("TRANSPORTES MARTÍNEZ SL");
    expect(d.shipper.address).toBe("CALLE MAYOR 24");
    expect(d.shipper.city).toBe("VALENCIA");
    expect(d.carrier.name).toBe("LOGÍSTICA DEL TURIA SA");
    expect(d.loadLocation.name).toBe("ALMACÉN NORTE");
    expect(d.loadLocation.address).toBe("AV. DEL PUERTO 120");
    expect(d.loadLocation.city).toBe("VALENCIA");
    expect(d.loadLocation.province).toBe("VALENCIA");
    expect(d.loadLocation.country).toBe("ESPAÑA");
    expect(d.unloadLocation.city).toBe("MADRID");
    expect(d.goods).toBe("MERCANCÍA GENERAL PALETIZADA");
    expect(d.reference).toBe("PED-2026-4412");
    expect(d.notes).toBe("ENTREGAR ANTES DE LAS 14H");
  });

  it("never touches NIF, postal code, weight, dates", () => {
    expect(d.shipper.nif).toBe("B12345674");
    expect(d.carrier.nif).toBe("a96789011"); // left exactly as stored
    expect(d.carrier.postalCode).toBe("46988");
    expect(d.loadLocation.postalCode).toBe("46023");
    expect(d.weight).toBe("12.500 kg");
    expect(d.loadDate).toBe("2026-10-06");
  });

  it("is idempotent and tolerant of a partial payload", () => {
    expect(toDisplayDeca(toDisplayDeca(structuredClone(raw)))).toEqual(d);
    expect(toDisplayDeca({ goods: "palés" } as Record<string, unknown>)).toEqual({
      goods: "PALÉS",
    });
    expect(toDisplayDeca({} as Record<string, unknown>)).toEqual({});
  });

  it("does not mutate the original", () => {
    const orig = structuredClone(raw);
    toDisplayDeca(orig);
    expect(orig.shipper.name).toBe("Transportes Martínez sl");
  });
});
