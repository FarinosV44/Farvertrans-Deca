import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { summariseRoutes, type CarrierRouteRecord } from "@/lib/commercial/carrier-profile";

const NOW = new Date("2026-09-08T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 864e5);

function rec(over: Partial<CarrierRouteRecord> = {}): CarrierRouteRecord {
  return {
    routeKey: "ESPANA-VALENCIA__FRANCIA-LYON",
    loadCity: "Valencia",
    loadProvince: "Valencia",
    loadCountry: "España",
    unloadCity: "Lyon",
    unloadProvince: null,
    unloadCountry: "Francia",
    tractorPlate: "1234 BCD",
    generatedAt: daysAgo(2),
    ...over,
  };
}

describe("summariseRoutes", () => {
  it("groups by route, counts, keeps the last-seen date, orders by frequency", () => {
    const s = summariseRoutes([
      rec({ generatedAt: daysAgo(2) }),
      rec({ generatedAt: daysAgo(10) }),
      rec({ generatedAt: daysAgo(30) }),
      rec({
        routeKey: "K2",
        unloadCity: "Milano",
        unloadCountry: "Italia",
        generatedAt: daysAgo(15),
      }),
    ]);
    expect(s.routes[0].label).toBe("Valencia → Lyon");
    expect(s.routes[0].count).toBe(3);
    expect(s.routes[0].lastSeen).toEqual(daysAgo(2));
    expect(s.routes[0].corridorLabels).toContain("España ↔ Francia");
    expect(s.topRouteRepeat).toBe(3);
  });

  it("tallies frequent countries / provinces / cities", () => {
    const s = summariseRoutes([rec(), rec(), rec({ unloadCity: "Marseille", routeKey: "K3" })]);
    expect(s.loadCities[0]).toEqual({ name: "Valencia", count: 3 });
    expect(s.unloadCountries[0].name).toBe("Francia");
  });

  it("only surfaces a plate used 2+ times", () => {
    const s = summariseRoutes([
      rec({ tractorPlate: "1111 AAA" }),
      rec({ tractorPlate: "1111 AAA" }),
      rec({ tractorPlate: "2222 BBB" }),
    ]);
    expect(s.plates).toEqual([{ plate: "1111 AAA", count: 2 }]);
  });

  it("collects the distinct corridor ids", () => {
    const s = summariseRoutes([
      rec(),
      rec({ routeKey: "K2", unloadCity: "Rotterdam", unloadCountry: "Países Bajos" }),
    ]);
    expect(s.corridorIds.sort()).toEqual(["es-benelux", "es-francia"]);
  });

  it("empty input → empty summary", () => {
    const s = summariseRoutes([]);
    expect(s.routes).toEqual([]);
    expect(s.plates).toEqual([]);
    expect(s.corridorIds).toEqual([]);
    expect(s.topRouteRepeat).toBe(0);
  });
});
