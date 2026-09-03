import { describe, expect, it } from "vitest";
import { BRAND, titleTemplate } from "@/lib/brand";
import { es } from "@/lib/i18n/es";

describe("BRAND (#21 — centralised product brand)", () => {
  it("exposes every field the UI, PDF, email and SEO layers need", () => {
    for (const k of [
      "name",
      "shortName",
      "tagline",
      "legalName",
      "attribution",
      "supportEmail",
    ] as const) {
      expect(typeof BRAND[k], k).toBe("string");
      expect(BRAND[k].length, k).toBeGreaterThan(1);
    }
    expect(BRAND.supportEmail).toMatch(/@/);
    expect(BRAND.attribution).toContain(BRAND.legalName);
  });

  it("is the single source for the product name — the i18n catalog defers to it", () => {
    expect(es.common.appName).toBe(BRAND.name);
    expect(titleTemplate).toBe(`%s | ${BRAND.name}`);
  });

  it("does not leak the internal 'Farvertrans DeCA' product name", () => {
    expect(BRAND.name).not.toBe("Farvertrans DeCA");
    // Farvertrans survives only as the company attribution
    expect(BRAND.attribution.toLowerCase()).toContain("farvertrans");
  });
});
