import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: { decaRouteIntel: { create: vi.fn() } } }));

import { routeKeyFor } from "@/lib/deca/route-intel";

describe("routeKeyFor", () => {
  it("builds a folded corridor key from country+city on both ends (diacritics stripped)", () => {
    expect(routeKeyFor("Valencia", "España", "Lyon", "Francia")).toBe(
      "ESPANA-VALENCIA__FRANCIA-LYON",
    );
  });

  it("is case/accent-insensitive", () => {
    expect(routeKeyFor("valencia", "españa", "LYON", "FRANCIA")).toBe(
      routeKeyFor("Valencia", "España", "Lyon", "Francia"),
    );
  });

  it("returns null when a city is missing on either end", () => {
    expect(routeKeyFor(undefined, "España", "Lyon", "Francia")).toBeNull();
    expect(routeKeyFor("Valencia", "España", undefined, "Francia")).toBeNull();
  });

  it("still builds a key when country is missing (city-only corridor)", () => {
    expect(routeKeyFor("Valencia", undefined, "Lyon", undefined)).toBe("VALENCIA__LYON");
  });
});
