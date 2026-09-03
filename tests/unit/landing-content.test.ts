import { describe, expect, it } from "vitest";
import { FAQ, landingJsonLd } from "@/lib/content/landing";

describe("landing JSON-LD", () => {
  const ld = landingJsonLd();

  it("emits a SoftwareApplication with a free offer", () => {
    const app = ld.find((x) => x["@type"] === "SoftwareApplication") as Record<string, unknown>;
    expect(app).toBeTruthy();
    expect((app.offers as Record<string, unknown>).price).toBe("0");
  });

  it("emits a FAQPage whose questions mirror the visible FAQ", () => {
    const faq = ld.find((x) => x["@type"] === "FAQPage") as Record<string, unknown>;
    const entities = faq.mainEntity as { name: string }[];
    expect(entities).toHaveLength(FAQ.length);
    expect(entities.map((e) => e.name)).toEqual(FAQ.map((f) => f.q));
  });
});
