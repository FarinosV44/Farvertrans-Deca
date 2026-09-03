import { test, expect } from "@playwright/test";

const FORBIDDEN = [
  "solicitar información",
  "solicita información",
  "pedir presupuesto",
  "solicitar presupuesto",
  "pedir demo",
  "solicitar demo",
  "precios",
  "planes y precios",
  "hablar con un comercial",
];

test.describe("BUILD 06 — production landing", () => {
  test("AC-25/AC-32: SSR, one h1 with DeCA GRATIS, CTA to /crear, head tags", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      if (/favicon\.ico/.test(m.location().url ?? "")) return;
      errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("response", (r) => {
      if (r.status() >= 500) errors.push(`5xx ${r.url()}`);
    });

    await page.goto("/");

    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("DeCA GRATIS");

    const cta = page.getByTestId("cta-crear").first();
    await expect(cta).toHaveAttribute("href", "/crear");

    await expect(page).toHaveTitle(/DeCA Gratis/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);

    expect(errors, errors.join(" | ")).toHaveLength(0);
  });

  test("AC-33: JSON-LD has SoftwareApplication + FAQPage", async ({ page }) => {
    await page.goto("/");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.flatMap((b) => {
      const parsed = JSON.parse(b);
      return (Array.isArray(parsed) ? parsed : [parsed]).map((x) => x["@type"]);
    });
    expect(types).toContain("SoftwareApplication");
    expect(types).toContain("FAQPage");
  });

  test("AC-26: no pricing / contact / demo / sales gating on the landing", async ({ page }) => {
    await page.goto("/");
    const text = (await page.locator("body").innerText()).toLowerCase();
    for (const phrase of FORBIDDEN) {
      expect(text, `landing must not contain "${phrase}"`).not.toContain(phrase);
    }
    // no <form> that posts anywhere (no contact/lead form)
    await expect(page.locator("form")).toHaveCount(0);
  });

  test("AC-27: content and primary CTA work with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("DeCA GRATIS");
    const cta = page.getByTestId("cta-crear").first();
    await expect(cta).toHaveAttribute("href", "/crear");
    await cta.click();
    await expect(page).toHaveURL(/\/crear$/);
    await context.close();
  });

  for (const [w, h] of [
    [360, 740],
    [768, 1024],
    [1280, 900],
  ] as const) {
    test(`renders without horizontal overflow at ${w}px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, "no horizontal scroll").toBeLessThanOrEqual(1);
      // the persistent mobile CTA is present only below the md breakpoint
      const mobileCta = page.locator("div.md\\:hidden [data-testid='cta-crear']");
      if (w < 768) await expect(mobileCta).toBeVisible();
      else await expect(mobileCta).toBeHidden();
    });
  }

  test("robots + sitemap expose only public pages", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/api/);
    expect(robots).toMatch(/Disallow: \/d\//);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/crear");
    expect(sitemap).not.toContain("/api");
  });

  test("AC-31: landing_view event is emitted and accepted", async ({ page }) => {
    const [req] = await Promise.all([
      page.waitForRequest((r) => r.url().includes("/api/events") && r.method() === "POST", {
        timeout: 5000,
      }),
      page.goto("/"),
    ]);
    expect(req.postDataJSON()).toMatchObject({ name: "landing_view", path: "/" });
    const res = await req.response();
    expect(res?.status()).toBe(204);
  });
});
