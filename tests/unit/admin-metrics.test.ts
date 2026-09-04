import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { windowStart } from "@/lib/admin/metrics";

const NOW = new Date("2026-09-04T15:30:00.000Z");

describe("windowStart (ADMIN #33 overview)", () => {
  it("`today` is UTC midnight of the current day", () => {
    expect(windowStart("today", NOW).toISOString()).toBe("2026-09-04T00:00:00.000Z");
  });

  it("`7d` and `30d` are rolling windows from now", () => {
    expect(windowStart("7d", NOW).toISOString()).toBe("2026-08-28T15:30:00.000Z");
    expect(windowStart("30d", NOW).toISOString()).toBe("2026-08-05T15:30:00.000Z");
  });
});
