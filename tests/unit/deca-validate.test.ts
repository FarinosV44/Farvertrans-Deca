import { describe, expect, it } from "vitest";
import { validateDeca, DecaValidationError } from "@/lib/deca/validate";
import { normalizePlate, looksLikeSpanishPlate } from "@/lib/deca/plate";
import { checkNif } from "@/lib/deca/nif";

const valid = {
  shipper: { name: "Cargas SL", nif: "B12345678", address: "Calle Mayor 1, Valencia" },
  carrier: {
    name: "Transportes Pérez SL",
    nif: "B98765432",
    address: "Pol. Ind. Fuente del Jarro, calle 5, Paterna",
  },
  loadLocation: {
    name: "Almacén Turia",
    address: "Av. del Puerto 120",
    postalCode: "46023",
    city: "Valencia",
    province: "Valencia",
    country: "España",
  },
  unloadLocation: {
    name: "Plataforma Norte",
    address: "Calle Alcalá 200",
    postalCode: "28028",
    city: "Madrid",
    province: "Madrid",
    country: "España",
  },
  loadDate: "2026-10-06",
  unloadDate: "2026-10-06",
  goods: "Palés de cerámica",
  weight: "12000 kg",
  tractorPlate: "1234 BCD",
  trailerPlate: "R-9876 XYZ",
  reference: "PED-2026-4412",
};

describe("normalizePlate", () => {
  it("uppercases and strips separators", () => {
    expect(normalizePlate("1234-bcd")).toBe("1234BCD");
    expect(normalizePlate(" r 9876 xyz ")).toBe("R9876XYZ");
  });
  it("recognises the Spanish format only after normalisation", () => {
    expect(looksLikeSpanishPlate("1234 BCD")).toBe(true);
    expect(looksLikeSpanishPlate("AB123CD")).toBe(false);
  });
});

describe("checkNif", () => {
  it("validates a correct DNI and CIF", () => {
    expect(checkNif("12345678Z").valid).toBe(true); // 12345678 % 23 = 14 -> 'Z'
    expect(checkNif("B12345678").kind).toBe("cif");
  });
  it("flags a wrong control letter", () => {
    expect(checkNif("12345678A").valid).toBe(false);
  });
  it("returns unknown for a foreign-looking id", () => {
    expect(checkNif("DE811569869").kind).toBe("unknown");
  });
});

describe("validateDeca (R-2 / AC-09)", () => {
  it("accepts a complete payload and normalises plates", () => {
    const r = validateDeca(valid);
    expect(r.data.tractorPlate).toBe("1234BCD");
    expect(r.data.trailerPlate).toBe("R9876XYZ");
  });

  it("rejects when a mandatory Art. 6 field is missing", () => {
    for (const missing of [
      { ...valid, shipper: { ...valid.shipper, nif: "" } },
      { ...valid, carrier: { ...valid.carrier, name: "" } },
      { ...valid, loadLocation: { ...valid.loadLocation, name: "" } },
      { ...valid, loadLocation: { ...valid.loadLocation, address: "" } },
      { ...valid, loadLocation: { ...valid.loadLocation, postalCode: "" } },
      { ...valid, loadLocation: { ...valid.loadLocation, city: "" } },
      { ...valid, loadLocation: { ...valid.loadLocation, province: "" } },
      { ...valid, loadLocation: { ...valid.loadLocation, country: "" } },
      { ...valid, unloadLocation: { ...valid.unloadLocation, name: "" } },
      { ...valid, unloadLocation: { ...valid.unloadLocation, address: "" } },
      { ...valid, loadDate: "" },
      { ...valid, unloadDate: "" },
      { ...valid, goods: "" },
      { ...valid, weight: "" },
      { ...valid, tractorPlate: "" },
      { ...valid, shipper: { ...valid.shipper, address: "" } },
      { ...valid, carrier: { ...valid.carrier, address: "" } },
    ]) {
      expect(() => validateDeca(missing)).toThrow(DecaValidationError);
    }
  });

  it("rejects a malformed load/unload date", () => {
    expect(() => validateDeca({ ...valid, loadDate: "06/10/2026" })).toThrow(DecaValidationError);
    expect(() => validateDeca({ ...valid, unloadDate: "06/10/2026" })).toThrow(
      DecaValidationError,
    );
  });

  it("rejects an unload date before the load date (same day is allowed)", () => {
    expect(() =>
      validateDeca({ ...valid, loadDate: "2026-10-10", unloadDate: "2026-10-09" }),
    ).toThrow(DecaValidationError);
    // Same-day loading/unloading must be allowed.
    const r = validateDeca({ ...valid, loadDate: "2026-10-10", unloadDate: "2026-10-10" });
    expect(r.data).toBeTruthy();
  });

  it("does NOT block a foreign NIF — it warns instead", () => {
    const r = validateDeca({
      ...valid,
      carrier: { name: "Spedition GmbH", nif: "DE811569869", address: "Hafenstraße 12, Hamburg" },
    });
    expect(r.data).toBeTruthy();
    expect(r.warnings.some((w) => w.includes("transportista"))).toBe(true);
  });

  it("keeps the weight VERBATIM — never silently reformats the commercial meaning", () => {
    for (const w of [
      "12.500 kg",
      "12,5 t",
      "1.234,56 kg",
      "una plataforma completa (aprox. 24 t)",
    ]) {
      const r = validateDeca({ ...valid, weight: w });
      expect(r.data.weight).toBe(w);
    }
  });

  it("rejects a meaningless weight (zero / placeholder) with no alternative measure", () => {
    for (const w of ["0", "0 kg", "0,0 t", "-", "n/a", "sin especificar"]) {
      expect(() => validateDeca({ ...valid, weight: w })).toThrow(DecaValidationError);
    }
  });

  it("collects field errors keyed by path", () => {
    try {
      validateDeca({ ...valid, loadLocation: { ...valid.loadLocation, name: "" }, goods: "" });
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(DecaValidationError);
      const err = e as DecaValidationError;
      expect(Object.keys(err.fieldErrors)).toEqual(
        expect.arrayContaining(["loadLocation.name", "goods"]),
      );
    }
  });
});
