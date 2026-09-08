import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { rollupFunnel, maxProgress } from "@/lib/commercial/kpis";
import { OPPORTUNITY_STATES } from "@/lib/commercial/opportunity-model";

describe("rollupFunnel", () => {
  it("counts each state and always returns every state in funnel order", () => {
    const f = rollupFunnel(["review", "review", "contacted", "converted"]);
    expect(f.map((r) => r.state)).toEqual(OPPORTUNITY_STATES);
    expect(f.find((r) => r.state === "review")!.count).toBe(2);
    expect(f.find((r) => r.state === "contacted")!.count).toBe(1);
    expect(f.find((r) => r.state === "converted")!.count).toBe(1);
    expect(f.find((r) => r.state === "discarded")!.count).toBe(0);
  });
  it("every row carries a Spanish label", () => {
    for (const r of rollupFunnel([])) expect(r.label.length).toBeGreaterThan(2);
  });
});

describe("maxProgress", () => {
  it("uses the furthest point ever reached, not just the current state", () => {
    // contacted then bounced to not_interested still counts as 'contacted'
    expect(maxProgress("not_interested", ["contacted", "not_interested"])).toBe(1);
    expect(maxProgress("interested", [])).toBe(2);
    expect(maxProgress("converted", ["contacted", "interested"])).toBe(6);
  });
  it("terminal-only history is -1", () => {
    expect(maxProgress("discarded", ["discarded"])).toBe(-1);
    expect(maxProgress("review", [])).toBe(0);
  });
});
