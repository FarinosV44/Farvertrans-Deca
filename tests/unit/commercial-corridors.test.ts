import { describe, expect, it } from "vitest";
import {
  CORRIDORS,
  countryCode,
  endZone,
  isCorridorRoute,
  matchCorridors,
  zoneOf,
  ZONE_LABEL,
} from "@/lib/commercial/corridors";

describe("countryCode", () => {
  it("maps common free-text country names and codes to a code", () => {
    expect(countryCode("España")).toBe("ES");
    expect(countryCode("ESPANA")).toBe("ES");
    expect(countryCode("france")).toBe("FR");
    expect(countryCode("Países Bajos")).toBe("NL");
    expect(countryCode("Bélgica")).toBe("BE");
    expect(countryCode("Italia")).toBe("IT");
    expect(countryCode("ALEMANIA")).toBe("DE");
  });
  it("returns null for empty/unknown", () => {
    expect(countryCode("")).toBeNull();
    expect(countryCode(null)).toBeNull();
    expect(countryCode("Narnia")).toBeNull();
  });
});

describe("zoneOf", () => {
  it("classifies Spanish provinces into regional zones", () => {
    expect(zoneOf("España", "Valencia")).toBe("es-levante");
    expect(zoneOf("España", "Barcelona")).toBe("es-cataluna");
    expect(zoneOf("España", "Madrid")).toBe("es-madrid");
    expect(zoneOf("España", "Bizkaia")).toBe("es-norte");
    expect(zoneOf("España", "Sevilla")).toBe("es-andalucia");
    expect(zoneOf("España", "Pontevedra")).toBe("es-noroeste");
    expect(zoneOf("España", "Cuenca")).toBe("es-otras");
  });
  it("recognises an ES province even when the country field is blank", () => {
    expect(zoneOf("", "Valencia")).toBe("es-levante");
  });
  it("classifies foreign countries", () => {
    expect(zoneOf("Francia", null)).toBe("fr");
    expect(zoneOf("Portugal", null)).toBe("pt");
    expect(zoneOf("Bélgica", null)).toBe("benelux");
    expect(zoneOf("Países Bajos", null)).toBe("benelux");
    expect(zoneOf("Italia", null)).toBe("it");
    expect(zoneOf("Reino Unido", null)).toBe("otros-ue");
  });
  it("falls back to a well-known city hint when country is blank", () => {
    expect(zoneOf("", "", "Lyon")).toBe("fr");
    expect(zoneOf("", "", "Rotterdam")).toBe("benelux");
    expect(zoneOf(null, null, "Milano")).toBe("it");
  });
  it("returns null when nothing is recognisable", () => {
    expect(zoneOf("", "", "")).toBeNull();
    expect(zoneOf(null, null, null)).toBeNull();
  });
  it("every zone has a label", () => {
    for (const c of CORRIDORS) {
      for (const z of [...c.from, ...c.to]) expect(ZONE_LABEL[z]).toBeTruthy();
    }
  });
});

describe("matchCorridors", () => {
  it("matches Valencia → Lyon as the España ↔ Francia corridor, both directions", () => {
    const there = matchCorridors({
      loadCountry: "España",
      loadProvince: "Valencia",
      unloadCountry: "Francia",
      unloadCity: "Lyon",
    });
    expect(there.map((c) => c.id)).toContain("es-francia");

    const back = matchCorridors({
      loadCountry: "Francia",
      loadCity: "Lyon",
      unloadCountry: "España",
      unloadProvince: "Valencia",
    });
    expect(back.map((c) => c.id)).toContain("es-francia");
  });

  it("matches a Benelux destination", () => {
    const m = matchCorridors({
      loadCountry: "España",
      loadProvince: "Madrid",
      unloadCountry: "Países Bajos",
      unloadCity: "Rotterdam",
    });
    expect(m.map((c) => c.id)).toContain("es-benelux");
  });

  it("matches a domestic Levante ↔ Cataluña route", () => {
    const m = matchCorridors({
      loadCountry: "España",
      loadProvince: "Valencia",
      unloadCountry: "España",
      unloadProvince: "Barcelona",
    });
    expect(m.map((c) => c.id)).toContain("levante-cataluna");
  });

  it("returns nothing for an unremarkable route", () => {
    expect(
      matchCorridors({
        loadCountry: "España",
        loadProvince: "Cuenca",
        unloadCountry: "España",
        unloadProvince: "Albacete",
      }),
    ).toEqual([]);
  });

  it("returns nothing when a point cannot be placed", () => {
    expect(matchCorridors({ loadCity: "???", unloadCity: "???" })).toEqual([]);
  });
});

describe("endZone / isCorridorRoute", () => {
  it("endZone is the unload zone", () => {
    expect(
      endZone({ loadCountry: "España", loadProvince: "Valencia", unloadCountry: "Italia" }),
    ).toBe("it");
  });
  it("isCorridorRoute is a boolean shortcut", () => {
    expect(
      isCorridorRoute({
        loadCountry: "España",
        loadProvince: "Valencia",
        unloadCountry: "Francia",
        unloadCity: "Lyon",
      }),
    ).toBe(true);
    expect(isCorridorRoute({ loadCity: "x", unloadCity: "y" })).toBe(false);
  });
});
