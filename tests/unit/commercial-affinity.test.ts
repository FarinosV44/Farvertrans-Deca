import { describe, expect, it } from "vitest";
import { affinityScore, autoTags, type AffinityInput } from "@/lib/commercial/affinity";

const base: AffinityInput = {
  d7: 0,
  d30: 0,
  d90: 0,
  total: 0,
  trend: "none",
  daysSinceFirst: null,
  topRouteRepeat: 0,
  distinctRoutes: 0,
  corridorIds: [],
  hasAuthorisedContact: false,
  consentMode: "per_deca",
};

describe("affinityScore", () => {
  it("a cold carrier with no activity scores low and shows the penalty rule", () => {
    const r = affinityScore({ ...base, total: 3 });
    expect(r.score).toBe(0);
    expect(r.band).toBe("Baja");
    expect(r.breakdown).toContainEqual({
      label: "Sin actividad en los últimos 90 días",
      points: -15,
    });
  });

  it("an active recurring corridor carrier scores high, every point explained", () => {
    const r = affinityScore({
      ...base,
      d7: 2,
      d30: 6,
      d90: 14,
      total: 20,
      trend: "up",
      daysSinceFirst: 200,
      topRouteRepeat: 5,
      distinctRoutes: 3,
      corridorIds: ["es-francia", "es-benelux"],
      hasAuthorisedContact: true,
      consentMode: "all",
    });
    expect(r.score).toBe(100); // clamped
    expect(r.band).toBe("Alta");
    // the breakdown sums to the pre-clamp raw and lists only contributing rules
    const raw = r.breakdown.reduce((n, x) => n + x.points, 0);
    expect(raw).toBeGreaterThanOrEqual(100);
    expect(r.breakdown.every((x) => x.points !== 0)).toBe(true);
  });

  it("is monotonic-ish: adding an authorised contact never lowers the score", () => {
    const without = affinityScore({ ...base, d30: 3, d90: 6, corridorIds: ["es-italia"] });
    const withContact = affinityScore({
      ...base,
      d30: 3,
      d90: 6,
      corridorIds: ["es-italia"],
      hasAuthorisedContact: true,
    });
    expect(withContact.score).toBeGreaterThan(without.score);
  });

  it("band thresholds: 70 = Alta, 40 = Media", () => {
    // 20 (d7) + 15 (d30>=2) + 15 (corridor) + 10 (contact) + 10 (all) = 70
    const alta = affinityScore({
      ...base,
      d7: 1,
      d30: 2,
      d90: 2,
      corridorIds: ["es-francia"],
      hasAuthorisedContact: true,
      consentMode: "all",
    });
    expect(alta.score).toBe(70);
    expect(alta.band).toBe("Alta");
  });
});

describe("autoTags", () => {
  it("derives objective labels", () => {
    const tags = autoTags({
      ...base,
      d7: 3,
      d30: 10,
      d90: 20,
      total: 25,
      topRouteRepeat: 4,
      corridorIds: ["es-francia"],
    });
    expect(tags).toContain("Muy activo");
    expect(tags).toContain("Recurrente Francia");
    expect(tags).toContain("Ruta estable");
    expect(tags).not.toContain("Actividad reciente"); // "Muy activo" wins
  });

  it("flags a brand-new carrier and a dormant one", () => {
    expect(autoTags({ ...base, total: 1, d90: 0, daysSinceFirst: 5 })).toEqual(
      expect.arrayContaining(["Nuevo transportista", "Sin actividad 90d"]),
    );
  });

  it("empty history → no tags", () => {
    expect(autoTags(base)).toEqual([]);
  });
});
