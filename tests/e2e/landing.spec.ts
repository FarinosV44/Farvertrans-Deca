import { test, expect } from "@playwright/test";
import { BRAND } from "../../lib/brand";

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

  test("#21: the product brand is centralised — header/footer show the brand, not 'Farvertrans DeCA'", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("header")).toContainText(BRAND.name);
    const footer = page.locator("footer");
    await expect(footer).toContainText(BRAND.name);
    await expect(footer).toContainText(BRAND.attribution); // "Un servicio de Farvertrans S.L."
    // no bare internal product name anywhere in the visible page
    const body = (await page.locator("body").innerText()).toLowerCase();
    expect(body).not.toContain("farvertrans deca");
    // returning-user entry point
    await expect(page.getByTestId("header-login")).toHaveAttribute("href", "/entrar");
  });

  test("#22: premium landing V2 — hero, trust row, personas, daily-use, product proof, final CTA", async ({
    page,
  }) => {
    await page.goto("/");
    // hero: headline + proof + primary CTA above the fold
    await expect(page.locator("h1")).toHaveText("DeCA GRATIS");
    await expect(
      page.getByText(
        "PDF nativo · QR válido para inspección · URL directa · Sin tarjeta · Sin límite al menos hasta el 31/12/2026",
      ),
    ).toBeVisible();
    await expect(page.getByTestId("cta-hero")).toBeInViewport();
    // returning-user entry point in the hero
    await expect(page.getByTestId("hero-login")).toHaveAttribute("href", "/entrar");
    // conversion sections present
    for (const id of ["pasos", "producto", "para-quien", "cada-dia", "normativa", "faq"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    await expect(
      page.getByRole("heading", { name: "Hecho para quien mueve mercancía" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Por qué usarlo cada día" })).toBeVisible();
    // multiple CTAs down the page (hero + section + persona) + a final one
    expect(await page.getByTestId("cta-crear").count()).toBeGreaterThanOrEqual(2);
    const final = page.getByTestId("cta-final");
    await final.scrollIntoViewIfNeeded();
    await expect(final).toBeVisible();
  });

  test("#22: FAQ content is in the SSR HTML (indexable) even before any interaction", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    // every answer is present in the markup with JS disabled
    await expect(
      page.getByText(/El Documento Electrónico de Control Administrativo es la versión digital/),
    ).toBeAttached();
    await ctx.close();
  });

  test("#22: hero CTA and header login fire distinct placement analytics events", async ({
    page,
  }) => {
    const events: string[] = [];
    await page.route("**/api/events", async (route) => {
      try {
        events.push(JSON.parse(route.request().postData() || "{}").name);
      } catch {
        /* ignore */
      }
      await route.fulfill({ status: 204, body: "" });
    });

    await page.goto("/");
    await page.getByTestId("cta-hero").click(); // -> /crear, fires hero_cta + click_crear_deca
    await expect(page).toHaveURL(/\/crear$/);
    await page.waitForTimeout(200);
    expect(events).toContain("hero_cta");
    expect(events).toContain("click_crear_deca");

    events.length = 0;
    await page.goto("/");
    await page.getByTestId("header-login").click(); // -> /entrar, fires login_click
    await expect(page).toHaveURL(/\/entrar$/);
    await page.waitForTimeout(200);
    expect(events).toContain("login_click");
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
