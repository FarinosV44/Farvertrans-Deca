import { test, expect } from "@playwright/test";

const SLUGS = [
  "deca-gratis",
  "que-es-el-deca",
  "deca-obligatorio-2026",
  "como-hacer-un-deca",
  "requisitos-deca",
  "datos-obligatorios-deca",
  "deca-pdf-qr",
  "quien-esta-obligado-deca",
  "deca-vs-cmr",
  "generador-deca",
];

test.describe("BUILD 14 — SEO cluster", () => {
  test("all 10 core pages: SSR, one h1, unique title, canonical, CTA to /crear, no client JS needed", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    const titles = new Set<string>();

    for (const slug of SLUGS) {
      const res = await page.goto(`/${slug}`);
      expect(res?.status(), slug).toBe(200);

      await expect(page.locator("h1")).toHaveCount(1);
      const title = await page.title();
      expect(title.length, `${slug} title`).toBeGreaterThan(15);
      titles.add(title);

      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);

      // real CTA to the generator, works with JS disabled
      const cta = page.getByTestId("cta-crear").first();
      await expect(cta).toHaveAttribute("href", "/crear");

      // internal links to the cluster
      const links = await page
        .locator("main a[href^='/']")
        .evaluateAll((els) => els.map((e) => e.getAttribute("href")));
      expect(
        links.some((h) => h && h !== "/" && h.startsWith("/")),
        `${slug} internal links`,
      ).toBe(true);

      // last-reviewed date present
      await expect(page.getByText(/Última revisión normativa:/)).toBeVisible();
    }

    expect(titles.size, "no duplicate titles").toBe(SLUGS.length);
    await ctx.close();
  });

  test("an unknown slug 404s (dynamicParams disabled)", async ({ page }) => {
    expect((await page.goto("/deca-inventado-que-no-existe"))?.status()).toBe(404);
  });

  test("sitemap lists every core page and no private routes; robots excludes /app /api /d/", async ({
    request,
  }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const slug of SLUGS) expect(sitemap).toContain(`/${slug}`);
    expect(sitemap).toContain("/soy-obligado");
    expect(sitemap).not.toMatch(/\/app<|\/api<|\/d\//);

    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/app/);
    expect(robots).toMatch(/Disallow: \/api/);
    expect(robots).toMatch(/Disallow: \/d\//);
  });

  test('"¿Estoy obligado?" gives an answer with JavaScript disabled', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/soy-obligado?ambito=interior&tipo=publico&rol=transportista");
    await expect(page.getByText("Sí, estás obligado")).toBeVisible();
    await page.goto("/soy-obligado?ambito=internacional&tipo=publico&rol=transportista");
    await expect(page.getByText("No, en este caso no")).toBeVisible();
    await ctx.close();
  });

  test("a11y: a representative SEO page has no serious/critical violations", async ({ page }) => {
    const AxeBuilder = (await import("@axe-core/playwright")).default;
    await page.goto("/requisitos-deca");
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    const bad = r.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""));
    expect(bad.map((v) => v.id)).toEqual([]);
  });
});
