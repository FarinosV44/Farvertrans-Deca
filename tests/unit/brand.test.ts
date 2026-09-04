import { describe, expect, it } from "vitest";
import { BRAND, titleTemplate } from "@/lib/brand";
import { es } from "@/lib/i18n/es";

describe("BRAND (#21 — centralised product brand)", () => {
  it("exposes every field the UI, PDF, email and SEO layers need", () => {
    for (const k of ["name", "shortName", "tagline", "supportEmail"] as const) {
      expect(typeof BRAND[k], k).toBe("string");
      expect(BRAND[k].length, k).toBeGreaterThan(1);
    }
    expect(BRAND.supportEmail).toMatch(/@/);
  });

  it("is the single source for the product name — the i18n catalog defers to it", () => {
    expect(es.common.appName).toBe(BRAND.name);
    expect(titleTemplate).toBe(`%s | ${BRAND.name}`);
  });

  it("carries no company attribution and never mentions Farvertrans (decision 2026-09-04)", () => {
    const json = JSON.stringify({ BRAND, common: es.common }).toLowerCase();
    expect(json).not.toContain("farvertrans");
    expect(json).not.toContain("s.l.");
    expect(BRAND.name).not.toBe("Farvertrans DeCA");
    expect("attribution" in BRAND).toBe(false);
    expect("legalName" in BRAND).toBe(false);
  });
});
