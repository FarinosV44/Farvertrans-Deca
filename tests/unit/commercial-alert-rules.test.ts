import { describe, expect, it } from "vitest";
import { evaluateAlerts, type AlertConfig, type AlertInput } from "@/lib/commercial/alert-rules";

const NOW = new Date("2026-09-08T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 864e5);

const config: AlertConfig = {
  priorityCorridors: ["es-francia"],
  priorityCountries: ["Benelux"],
  minMovements: 2,
  windowDays: 30,
  staleFollowUpDays: 10,
  reactivationDays: 60,
};

const base: AlertInput = {
  companyId: "c1",
  companyName: "Transportes Prueba SL",
  state: "review",
  corridors: [],
  endZoneLabels: [],
  endZones: [],
  movements: { d7: 0, d30: 0, d60: 0, d90: 0, total: 0 },
  topRouteRepeat: 0,
  topRouteLabel: null,
  nextUnloadDate: null,
  lastActivityAt: null,
  routeGapDays: null,
  lastCommercialTouchAt: null,
  hasAcquisitionOperator: false,
  signupAt: null,
  firstDecaAt: null,
};

const kinds = (i: Partial<AlertInput>) =>
  evaluateAlerts({ ...base, ...i }, config, NOW).map((a) => a.kind);

describe("evaluateAlerts", () => {
  it("upcoming descarga in a priority corridor within 7 days", () => {
    expect(
      kinds({
        corridors: ["es-francia"],
        nextUnloadDate: "2026-09-11",
        topRouteLabel: "Valencia → Lyon",
      }),
    ).toContain("upcoming_priority_zone");
  });

  it("does NOT fire upcoming when the route is not a priority", () => {
    expect(kinds({ corridors: ["levante-madrid"], nextUnloadDate: "2026-09-11" })).not.toContain(
      "upcoming_priority_zone",
    );
  });

  it("first activity in a priority corridor", () => {
    expect(
      kinds({ corridors: ["es-francia"], movements: { d7: 1, d30: 1, d60: 1, d90: 1, total: 2 } }),
    ).toContain("first_time_priority_corridor");
  });

  it("route repeated 3+ times", () => {
    expect(kinds({ topRouteRepeat: 4, topRouteLabel: "A → B" })).toContain("route_repeated_3x_30d");
  });

  it("growing activity vs the prior 30 days", () => {
    expect(kinds({ movements: { d7: 2, d30: 6, d60: 8, d90: 10, total: 10 } })).toContain(
      "growing_activity",
    );
  });

  it("interesting but uncontacted (state = review)", () => {
    expect(kinds({ state: "review", topRouteRepeat: 3 })).toContain("interesting_uncontacted");
    expect(kinds({ state: "contacted", topRouteRepeat: 3 })).not.toContain(
      "interesting_uncontacted",
    );
  });

  it("open opportunity with no follow-up for staleFollowUpDays", () => {
    expect(kinds({ state: "interested", lastCommercialTouchAt: daysAgo(14) })).toContain(
      "interested_no_followup",
    );
    expect(kinds({ state: "interested", lastCommercialTouchAt: daysAgo(3) })).not.toContain(
      "interested_no_followup",
    );
  });

  it("reactivated after a long gap", () => {
    expect(kinds({ routeGapDays: 75, lastActivityAt: daysAgo(2) })).toContain("reactivated");
    expect(kinds({ routeGapDays: 75, lastActivityAt: daysAgo(40) })).not.toContain("reactivated");
  });

  it("referral company that generated its first DeCA", () => {
    expect(
      kinds({ hasAcquisitionOperator: true, firstDecaAt: daysAgo(2), signupAt: daysAgo(10) }),
    ).toContain("referral_first_deca");
  });

  it("acquired company reaching recurring activity", () => {
    expect(
      kinds({
        hasAcquisitionOperator: true,
        movements: { d7: 1, d30: 4, d60: 5, d90: 6, total: 6 },
      }),
    ).toContain("acquired_company_recurring");
  });

  it("a quiet, unremarkable carrier produces no alerts", () => {
    expect(evaluateAlerts(base, config, NOW)).toEqual([]);
  });

  it("dedupeKey is stable per company+kind (+ weekly bucket where time-sensitive)", () => {
    const a = evaluateAlerts({ ...base, state: "review", topRouteRepeat: 3 }, config, NOW);
    const b = evaluateAlerts({ ...base, state: "review", topRouteRepeat: 3 }, config, NOW);
    expect(a[0].dedupeKey).toBe(b[0].dedupeKey);
    expect(a[0].dedupeKey.startsWith("c1:")).toBe(true);
  });
});
