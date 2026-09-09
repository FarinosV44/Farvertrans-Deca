import { describe, expect, it } from "vitest";
import { landingJsonLd } from "@/lib/content/landing";

describe("landing JSON-LD", () => {
  const ld = landingJsonLd();

  it("emits a SoftwareApplication with a free offer", () => {
    const app = ld.find((x) => x["@type"] === "SoftwareApplication") as Record<string, unknown>;
    expect(app).toBeTruthy();
    expect((app.offers as Record<string, unknown>).price).toBe("0");
  });

  it("emits a WebSite entry", () => {
    const site = ld.find((x) => x["@type"] === "WebSite") as Record<string, unknown>;
    expect(site).toBeTruthy();
    expect(site.name).toBeTruthy();
    expect(site.url).toBeTruthy();
  });

  /**
   * #98 (D-169): FAQPage was deliberately REMOVED — the issue's own
   * instruction is not to use it automatically, and Google's guidelines
   * since 2023 restrict FAQ rich results to a narrow set of authoritative
   * sites, which this landing does not qualify for. A regression that
   * silently reintroduces it must fail here.
   */
  it("never emits a FAQPage (D-169)", () => {
    expect(ld.find((x) => x["@type"] === "FAQPage")).toBeUndefined();
  });
});
