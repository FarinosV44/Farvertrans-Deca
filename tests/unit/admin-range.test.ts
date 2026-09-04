import { describe, expect, it } from "vitest";
import { rangeFromParam, RANGE_KEYS } from "@/lib/admin/range";

const NOW = new Date("2026-09-04T12:00:00.000Z");

describe("rangeFromParam (ADMIN #33 filters)", () => {
  it("defaults to 30 days for a missing or unknown value", () => {
    for (const v of [undefined, "", "bogus", "1y"]) {
      const r = rangeFromParam(v, NOW);
      expect(r.value).toBe("30d");
      expect(r.since.toISOString()).toBe("2026-08-05T12:00:00.000Z");
    }
  });

  it("resolves each known key to the right window start", () => {
    expect(rangeFromParam("24h", NOW).since.toISOString()).toBe("2026-09-03T12:00:00.000Z");
    expect(rangeFromParam("7d", NOW).since.toISOString()).toBe("2026-08-28T12:00:00.000Z");
    expect(rangeFromParam("90d", NOW).since.toISOString()).toBe("2026-06-06T12:00:00.000Z");
  });

  it("every declared key round-trips", () => {
    for (const k of RANGE_KEYS) expect(rangeFromParam(k, NOW).value).toBe(k);
  });
});
