import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  SEO_HUBS,
  STRATEGIC_ROUTES,
  DEFAULT_HUB_SLUG,
  pickCornerstones,
  suggestRelatedByCategory,
  type RelatedCandidate,
} from "@/lib/content/internal-linking";
import { SEO_PAGES } from "@/content/seo/pages";

const seoSlugs = new Set(SEO_PAGES.map((p) => p.slug));

describe("#97 — internal-linking architecture (pure logic)", () => {
  it("every hub slug is a real content/seo/pages.ts slug", () => {
    for (const hub of SEO_HUBS) {
      expect(seoSlugs.has(hub.slug), `hub "${hub.slug}" must be a real SEO page`).toBe(true);
    }
    expect(seoSlugs.has(DEFAULT_HUB_SLUG)).toBe(true);
  });

  it("every strategic route is a real route (home, or a real SEO page slug)", () => {
    for (const route of STRATEGIC_ROUTES) {
      const ok = route === "/" || seoSlugs.has(route.replace(/^\//, ""));
      expect(ok, `strategic route "${route}" must be real`).toBe(true);
    }
  });

  it("no duplicate hubs or strategic routes", () => {
    expect(new Set(SEO_HUBS.map((h) => h.slug)).size).toBe(SEO_HUBS.length);
    expect(new Set(STRATEGIC_ROUTES).size).toBe(STRATEGIC_ROUTES.length);
  });

  it("scripts/internal-links-audit.mjs's local STRATEGIC_ROUTES copy stays in sync", () => {
    const src = readFileSync(join(process.cwd(), "scripts/internal-links-audit.mjs"), "utf-8");
    const m = /const STRATEGIC_ROUTES = \[([\s\S]*?)\];/.exec(src);
    expect(m, "STRATEGIC_ROUTES not found in the audit script").toBeTruthy();
    const scriptRoutes = [...m![1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    expect(scriptRoutes).toEqual(STRATEGIC_ROUTES);
  });

  describe("pickCornerstones", () => {
    it("never links a page to itself", () => {
      const picks = pickCornerstones("que-es-el-deca", []);
      expect(picks.find((p) => p.slug === "que-es-el-deca")).toBeUndefined();
    });

    it("skips slugs already linked elsewhere on the page", () => {
      const already = SEO_HUBS.slice(0, 3).map((h) => h.slug);
      const picks = pickCornerstones("deca-cargadores", already);
      for (const p of picks) expect(already).not.toContain(p.slug);
    });

    it("returns at most `max` picks with non-empty, varied anchors", () => {
      const picks = pickCornerstones("deca-gratis", [], 3);
      expect(picks.length).toBeLessThanOrEqual(3);
      const anchors = picks.map((p) => p.anchor);
      expect(new Set(anchors).size).toBe(anchors.length); // no duplicate anchor text
      for (const a of anchors) expect(a.length).toBeGreaterThan(0);
    });

    it("is deterministic — same input, same output", () => {
      const a = pickCornerstones("deca-vs-cmr", ["que-es-el-deca"]);
      const b = pickCornerstones("deca-vs-cmr", ["que-es-el-deca"]);
      expect(a).toEqual(b);
    });
  });

  describe("suggestRelatedByCategory", () => {
    const items: RelatedCandidate[] = [
      { id: "1", slug: "a", title: "A", type: "guide", category: "normativa" },
      { id: "2", slug: "b", title: "B", type: "guide", category: "Normativa" }, // same, different case
      { id: "3", slug: "c", title: "C", type: "blog", category: "operativa" },
      { id: "4", slug: "d", title: "D", type: "guide", category: null },
    ];

    it("matches same category case/whitespace-insensitively, excludes self", () => {
      const out = suggestRelatedByCategory(items, { id: "1", category: "normativa" });
      expect(out.map((x) => x.id)).toEqual(["2"]);
    });

    it("returns nothing for an uncategorised item", () => {
      expect(suggestRelatedByCategory(items, { id: "4", category: null })).toEqual([]);
    });

    it("caps at `limit`", () => {
      const many: RelatedCandidate[] = Array.from({ length: 10 }, (_, i) => ({
        id: `x${i}`,
        slug: `x${i}`,
        title: `X${i}`,
        type: "guide",
        category: "cat",
      }));
      const out = suggestRelatedByCategory(many, { id: "current", category: "cat" }, 5);
      expect(out.length).toBe(5);
    });
  });
});
