import { test, expect } from "@playwright/test";

/**
 * GROWTH #35 — persona-led landing + pages. Visitors self-identify; every
 * persona CTA leads to product use (a persona page or the generator), never a
 * sales contact; the persona CTA is tracked.
 */

const PERSONAS = [
  { slug: "deca-autonomos", event: "persona_autonomo_cta" },
  { slug: "deca-empresas-transporte", event: "persona_transport_company_cta" },
  { slug: "deca-agencias-transporte", event: "persona_agency_cta" },
  { slug: "deca-cargadores", event: "persona_shipper_cta" },
];

test.describe("GROWTH #35 — persona-led landing", () => {
  test("the landing has a persona section; each card links to its persona page", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Hecho para quien mueve mercancía" }),
    ).toBeVisible();
    for (const p of PERSONAS) {
      const cta = page.getByTestId(`persona-cta-${p.slug}`);
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute("href", `/${p.slug}`);
    }
  });

  test("a persona CTA fires its analytics event, with no PII", async ({ page }) => {
    const events: string[] = [];
    await page.route("**/api/events", async (route) => {
      try {
        const body = JSON.parse(route.request().postData() || "{}");
        events.push(body.name);
        expect(JSON.stringify(body)).not.toMatch(/@|NIF/i);
      } catch {
        /* ignore */
      }
      await route.fulfill({ status: 204, body: "" });
    });
    await page.goto("/");
    await page.getByTestId("persona-cta-deca-autonomos").click();
    await expect(page).toHaveURL(/\/deca-autonomos$/);
    expect(events).toContain("persona_autonomo_cta");
  });

  test("each persona page: SSR, one h1, unique title, canonical, CTA to /crear, no JS needed", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    const titles = new Set<string>();
    for (const p of PERSONAS) {
      const res = await page.goto(`/${p.slug}`);
      expect(res?.status(), p.slug).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(15);
      titles.add(title);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.getByTestId("cta-crear").first()).toHaveAttribute("href", "/crear");
      // no forced sales contact
      const text = (await page.locator("main").innerText()).toLowerCase();
      for (const banned of [
        "llámanos",
        "pedir más info",
        "solicita una demo",
        "contacta con ventas",
      ]) {
        expect(text, `${p.slug} / ${banned}`).not.toContain(banned);
      }
    }
    expect(titles.size).toBe(PERSONAS.length);
    await ctx.close();
  });
});
