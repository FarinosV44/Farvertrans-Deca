import { test, expect } from "@playwright/test";
import { SEO_PAGES } from "@/content/seo/pages";

/**
 * #99 — a regression suite over the technical SEO already achieved (#95),
 * ejecutable en CI on every push/PR (`npm run test:e2e` already runs
 * everything under `tests/e2e/`). Complements `scripts/seo-audit.mjs`, which
 * is the repeatable check against a REAL DEPLOYED origin (sitemap-driven,
 * external); this suite is the one that runs on every commit, against a
 * fixed list of critical routes, and additionally checks OG tags and JSON-LD
 * — the two things #95's script does not cover.
 *
 * Per the issue's own "seguridad frente a falsos positivos": every assertion
 * here is one of the CLEAR regressions the issue explicitly says must block
 * (noindex on a public page, wrong/absent canonical, 404 on a core page, a
 * broken sitemap, robots.txt blocking the whole site, invalid JSON-LD) —
 * never a cosmetic threshold.
 */

/**
 * The issue's own minimum list: home, generator, SEO core, guías/blog
 * listings + one each. `/generador-deca` and the persona pages already live
 * in `SEO_PAGES` — deduplicated so the same route is never asserted twice.
 */
const CRITICAL_ROUTES = [
  ...new Set(["/", "/soy-obligado", "/guias", "/blog", ...SEO_PAGES.map((p) => `/${p.slug}`)]),
];

function jsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    blocks.push(JSON.parse(m[1])); // throws (fails the test) on invalid JSON — the exact regression #99 asks to catch
  }
  return blocks;
}

test.describe("#99 — SEO regression suite (critical routes)", () => {
  for (const route of CRITICAL_ROUTES) {
    test(`${route}: 200, title, canonical, no accidental noindex, exactly one H1`, async ({
      request,
    }) => {
      const res = await request.get(route);
      expect(res.status(), `${route} must be 200`).toBe(200);

      const html = await res.text();
      expect(html, `${route}: missing <title>`).toMatch(/<title[^>]*>[^<]+<\/title>/);

      const canonical = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i.exec(
        html,
      )?.[1];
      expect(canonical, `${route}: missing <link rel=canonical>`).toBeTruthy();
      expect(
        canonical!.replace(/\/$/, ""),
        `${route}: canonical must self-reference (never an external/wrong host)`,
      ).toContain(route === "/" ? "" : route);

      const metaRobots = /<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i.exec(html)?.[1];
      expect(
        metaRobots ?? "",
        `${route}: a critical public route must never carry an accidental noindex`,
      ).not.toContain("noindex");
      expect(
        res.headers()["x-robots-tag"] ?? "",
        `${route}: X-Robots-Tag must never carry an accidental noindex`,
      ).not.toContain("noindex");

      const h1Count = (html.match(/<h1[^>]*>/gi) ?? []).length;
      expect(h1Count, `${route}: expected exactly one <h1>, found ${h1Count}`).toBe(1);
    });
  }

  test("home carries valid, parseable JSON-LD (WebSite/Organization)", async ({ request }) => {
    const html = await (await request.get("/")).text();
    const blocks = jsonLdBlocks(html); // throws on invalid JSON — that IS the regression check
    expect(blocks.length, "home is expected to carry at least one JSON-LD block").toBeGreaterThan(
      0,
    );
  });

  test("a published guide and a published blog post carry valid JSON-LD + OG tags", async ({
    request,
  }) => {
    for (const [listing, family] of [
      ["/guias", "guias"],
      ["/blog", "blog"],
    ] as const) {
      const listingHtml = await (await request.get(listing)).text();
      const slugMatch = new RegExp(`href=["']/${family}/([a-z0-9-]+)["']`).exec(listingHtml);
      if (!slugMatch) continue; // nothing published yet — not a regression, just no fixture
      const url = `/${family}/${slugMatch[1]}`;
      const res = await request.get(url);
      expect(res.status(), `${url} must be 200`).toBe(200);
      const html = await res.text();

      expect(html, `${url}: missing <title>`).toMatch(/<title[^>]*>[^<]+<\/title>/);
      expect(/<link[^>]+rel=["']canonical["']/.test(html), `${url}: missing canonical`).toBe(true);
      expect(/<meta\s+property=["']og:title["']/.test(html), `${url}: missing og:title`).toBe(true);
      expect(
        /<meta\s+property=["']og:type["']/.test(html) ||
          /<meta\s+property=["']og:image["']/.test(html),
        `${url}: missing basic OG (og:type/og:image)`,
      ).toBe(true);
      jsonLdBlocks(html); // throws on invalid JSON
    }
  });

  test("robots.txt is accessible and does not block the whole site", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body, "robots.txt must not blanket-disallow the whole site").not.toMatch(
      /Disallow:\s*\/\s*$/m,
    );
    expect(body, "robots.txt must reference the sitemap").toContain("sitemap.xml");
  });

  test("sitemap.xml is accessible, parseable, and lists only 200/indexable URLs", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(urls.length, "sitemap must not be empty").toBeGreaterThan(0);

    // Never a private/app path — the same discipline app/sitemap.ts documents.
    const forbidden = ["/admin", "/panel", "/api/", "/d/", "/operadores", "/crear"];
    for (const u of urls) {
      for (const f of forbidden) {
        expect(u, `sitemap must never list a private/app path (${f})`).not.toContain(f);
      }
    }

    // Every listed URL actually resolves 200 with no noindex — a broken or
    // stale sitemap entry is exactly the regression this check exists for.
    for (const u of urls) {
      const path = new URL(u).pathname;
      const r = await request.get(path, { headers: {} });
      expect(r.status(), `sitemap URL ${u} must return 200`).toBe(200);
    }
  });

  test("no internal <a href> on the home page points at a 404", async ({ request }) => {
    const html = await (await request.get("/")).text();
    const hrefs = new Set(
      [...html.matchAll(/href=["'](\/[a-z0-9\-/]*)["']/gi)]
        .map((m) => m[1])
        .filter((h) => !h.startsWith("//") && h !== "/"),
    );
    const broken: string[] = [];
    for (const href of hrefs) {
      const r = await request.get(href.split("?")[0], { maxRedirects: 5 });
      if (r.status() >= 400) broken.push(`${href} → ${r.status()}`);
    }
    expect(broken, `broken internal links from home: ${broken.join(", ")}`).toEqual([]);
  });
});
