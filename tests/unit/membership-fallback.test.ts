import { describe, expect, it } from "vitest";
import { pickFallbackMembership } from "@/lib/team-membership";

/**
 * #102 — when a user loses their ACTIVE membership (removed from that
 * company), the fallback picks another membership they still hold rather
 * than falling through to "no company" (the pre-#102 bug). The one part of
 * that decision that is pure — WHICH remaining membership becomes active —
 * is extracted here and test-first, per the project's pure-logic policy.
 */
const m = (companyId: string, daysAgo: number) => ({
  companyId,
  role: "member" as const,
  createdAt: new Date(Date.now() - daysAgo * 86_400_000),
});

describe("#102 pickFallbackMembership", () => {
  it("returns null when no membership remains — the only legitimate 'no company' state", () => {
    expect(pickFallbackMembership([])).toBeNull();
  });

  it("returns the only remaining membership", () => {
    const only = m("A", 5);
    expect(pickFallbackMembership([only])).toBe(only);
  });

  it("picks the OLDEST remaining membership — the company the user has belonged to longest", () => {
    const older = m("A", 30);
    const newer = m("B", 2);
    expect(pickFallbackMembership([newer, older])).toBe(older);
    expect(pickFallbackMembership([older, newer])).toBe(older);
  });

  it("gives the same answer regardless of input order", () => {
    const a = m("A", 10); // clearly older
    const b = m("B", 1); // clearly newer
    expect(pickFallbackMembership([a, b])).toBe(a);
    expect(pickFallbackMembership([b, a])).toBe(a);
  });

  it("does not mutate the input array", () => {
    const older = m("A", 30);
    const newer = m("B", 2);
    const input = [newer, older];
    pickFallbackMembership(input);
    expect(input).toEqual([newer, older]);
  });
});
