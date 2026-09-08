import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/admin/audit", () => ({ recordAudit: vi.fn() }));

import { deriveOpportunity } from "@/lib/commercial/opportunities";
import {
  applyOpportunityFilter,
  routeMatchesGeoDate,
  sortOpportunities,
  type Opportunity,
  type RouteObservation,
} from "@/lib/commercial/opportunity-model";

const NOW = new Date("2026-09-08T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 864e5);

function route(over: Partial<RouteObservation> = {}): RouteObservation {
  return {
    routeKey: "ESPANA-VALENCIA__FRANCIA-LYON",
    loadCity: "Valencia",
    loadProvince: "Valencia",
    loadCountry: "España",
    unloadCity: "Lyon",
    unloadProvince: null,
    unloadCountry: "Francia",
    loadDate: "2026-09-07",
    unloadDate: "2026-09-09",
    observedAt: daysAgo(1),
    carrierName: "Transportes Pérez SL",
    corridors: ["es-francia"],
    endZone: "fr",
    ...over,
  };
}

function baseInput(over: Partial<Parameters<typeof deriveOpportunity>[0]> = {}) {
  return {
    companyId: "c1",
    companyName: "Transportes Pérez SL",
    companyStatus: "active",
    companyContactName: "Ana",
    channel: "both" as const,
    contactEmail: "flota@perez.example",
    contactPhone: "600111222",
    consentMode: "all" as const,
    consentVersion: "2026-09-15",
    consentGrantedAt: daysAgo(40),
    operator: { refCode: "ADRIAN01", name: "Adrián" },
    lastOperatorRefCode: "ADRIAN01",
    state: "review" as const,
    note: null,
    contactedAt: null,
    stateUpdatedAt: null,
    routes: [route()],
    ...over,
  };
}

describe("deriveOpportunity", () => {
  it("derives movement windows, last activity, corridors and end zones", () => {
    const o = deriveOpportunity(
      baseInput({
        routes: [
          route({ observedAt: daysAgo(1) }),
          route({ observedAt: daysAgo(20) }),
          route({
            observedAt: daysAgo(70),
            routeKey: "K2",
            unloadCity: "Milano",
            unloadCountry: "Italia",
            corridors: ["es-italia"],
            endZone: "it",
          }),
        ],
      }),
      NOW,
    );
    expect(o.movements.d7).toBe(1);
    expect(o.movements.d30).toBe(2);
    expect(o.movements.d90).toBe(3);
    expect(o.lastActivityAt).toEqual(daysAgo(1));
    expect(o.corridors.sort()).toEqual(["es-francia", "es-italia"]);
    expect(o.endZoneLabels).toContain("Francia");
    expect(o.endZoneLabels).toContain("Italia");
  });

  it("recurrence = most-repeated corridor in 90 days", () => {
    const o = deriveOpportunity(
      baseInput({
        routes: [
          route({ observedAt: daysAgo(2) }),
          route({ observedAt: daysAgo(9) }),
          route({ observedAt: daysAgo(15) }),
          route({ observedAt: daysAgo(40), routeKey: "K2", unloadCity: "Milano" }),
        ],
      }),
      NOW,
    );
    expect(o.topRouteRepeat).toBe(3);
    expect(o.topRouteLabel).toBe("Valencia → Lyon");
  });

  it("nextUnloadDate is the earliest future unload date", () => {
    const o = deriveOpportunity(
      baseInput({
        routes: [
          route({ unloadDate: "2026-09-20" }),
          route({ unloadDate: "2026-09-09" }),
          route({ unloadDate: "2026-08-01" }), // past
        ],
      }),
      NOW,
    );
    expect(o.nextUnloadDate).toBe("2026-09-09");
  });

  it("contactable only for an active company in an open state", () => {
    expect(deriveOpportunity(baseInput({ state: "review" }), NOW).contactable).toBe(true);
    expect(deriveOpportunity(baseInput({ state: "discarded" }), NOW).contactable).toBe(false);
    expect(
      deriveOpportunity(baseInput({ state: "review", companyStatus: "blocked" }), NOW).contactable,
    ).toBe(false);
  });

  it("a company with no observed routes still derives cleanly", () => {
    const o = deriveOpportunity(baseInput({ routes: [] }), NOW);
    expect(o.movements.total).toBe(0);
    expect(o.latestRoute).toBeNull();
    expect(o.lastActivityAt).toBeNull();
    expect(o.nextUnloadDate).toBeNull();
  });
});

describe("routeMatchesGeoDate", () => {
  it("matches origin/destination case- and accent-insensitively", () => {
    expect(routeMatchesGeoDate(route(), { originCity: "valencia" })).toBe(true);
    expect(routeMatchesGeoDate(route(), { destCity: "LYON" })).toBe(true);
    expect(routeMatchesGeoDate(route(), { destCountry: "francia" })).toBe(true);
    expect(routeMatchesGeoDate(route(), { destCity: "Madrid" })).toBe(false);
  });
  it("bounds the unload date", () => {
    expect(
      routeMatchesGeoDate(route({ unloadDate: "2026-09-09" }), {
        unloadFrom: "2026-09-09",
        unloadTo: "2026-09-09",
      }),
    ).toBe(true);
    expect(
      routeMatchesGeoDate(route({ unloadDate: "2026-09-10" }), { unloadTo: "2026-09-09" }),
    ).toBe(false);
    expect(routeMatchesGeoDate(route({ unloadDate: null }), { unloadFrom: "2026-09-01" })).toBe(
      false,
    );
  });
});

describe("applyOpportunityFilter", () => {
  const opps: Opportunity[] = [
    deriveOpportunity(baseInput({ companyId: "a", companyName: "Alfa SL", state: "review" }), NOW),
    deriveOpportunity(
      baseInput({
        companyId: "b",
        companyName: "Beta SL",
        state: "discarded",
        operator: { refCode: "MARIA02", name: "María" },
        lastOperatorRefCode: "MARIA02",
        routes: [
          route({
            unloadCity: "Rotterdam",
            unloadCountry: "Países Bajos",
            corridors: ["es-benelux"],
            endZone: "benelux",
            observedAt: daysAgo(50),
          }),
        ],
      }),
      NOW,
    ),
  ];

  it("filters by company name", () => {
    expect(applyOpportunityFilter(opps, { q: "alfa" }, NOW).map((o) => o.companyId)).toEqual(["a"]);
  });
  it("filters by state and the 'open' shortcut", () => {
    expect(
      applyOpportunityFilter(opps, { state: "discarded" }, NOW).map((o) => o.companyId),
    ).toEqual(["b"]);
    expect(applyOpportunityFilter(opps, { state: "open" }, NOW).map((o) => o.companyId)).toEqual([
      "a",
    ]);
  });
  it("filters by operator (first or last touch)", () => {
    expect(
      applyOpportunityFilter(opps, { operator: "MARIA02" }, NOW).map((o) => o.companyId),
    ).toEqual(["b"]);
  });
  it("filters by corridor", () => {
    expect(
      applyOpportunityFilter(opps, { corridor: "es-benelux" }, NOW).map((o) => o.companyId),
    ).toEqual(["b"]);
  });
  it("filters by destination across any observed route", () => {
    expect(
      applyOpportunityFilter(opps, { destCity: "Rotterdam" }, NOW).map((o) => o.companyId),
    ).toEqual(["b"]);
  });
  it("filters by activity window", () => {
    expect(applyOpportunityFilter(opps, { activity: "7d" }, NOW).map((o) => o.companyId)).toEqual([
      "a",
    ]);
  });
});

describe("sortOpportunities", () => {
  const a = deriveOpportunity(
    baseInput({ companyId: "a", routes: [route({ observedAt: daysAgo(1) })] }),
    NOW,
  );
  const b = deriveOpportunity(
    baseInput({
      companyId: "b",
      routes: [
        route({ observedAt: daysAgo(10) }),
        route({ observedAt: daysAgo(12) }),
        route({ observedAt: daysAgo(14) }),
      ],
    }),
    NOW,
  );

  it("recent = latest activity first", () => {
    expect(sortOpportunities([b, a], "recent").map((o) => o.companyId)).toEqual(["a", "b"]);
  });
  it("recurrence = most repeated corridor first", () => {
    expect(sortOpportunities([a, b], "recurrence").map((o) => o.companyId)).toEqual(["b", "a"]);
  });
  it("volume = more movements in 90d first", () => {
    expect(sortOpportunities([a, b], "volume").map((o) => o.companyId)).toEqual(["b", "a"]);
  });
});
