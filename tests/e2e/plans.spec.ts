import { test, expect } from "@playwright/test";

/**
 * #109 — "Planes 2027" is an INFORMATIONAL section inside the home (`#planes`),
 * not a `/precios` page and not a checkout. These tests lock the commercial
 * facts, the "recommended" signal, the live-vs-coming-soon split, and the
 * absence of any billing affordance — and confirm the rest of the landing is
 * untouched.
 */

test.describe("#109 — Planes 2027 section", () => {
  test("renders inside the home at #planes with an h2 (no new h1, no new route)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1); // home still has exactly one h1
    await expect(page.locator("#planes")).toHaveCount(1);
    await expect(page.locator("h2#planes")).toBeVisible();
    // anchor navigation from the URL works
    await page.goto("/#planes");
    await expect(page.locator("#planes")).toBeInViewport({ ratio: 0.1 });
  });

  test("shows the exact previewed amounts and per-month / user figures", async ({ page }) => {
    await page.goto("/");
    const starter = page.getByTestId("plan-starter");
    const professional = page.getByTestId("plan-professional");
    const business = page.getByTestId("plan-business");

    await expect(starter).toContainText("19,99");
    await expect(professional).toContainText("49,99");
    await expect(business).toContainText("89,99");

    await expect(starter).toContainText("100");
    await expect(starter).toContainText("2");
    await expect(professional).toContainText("300");
    await expect(professional).toContainText("5");
    await expect(business).toContainText("1.000");
    await expect(business).toContainText("15");
  });

  test("free-until-31/12/2026 message is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("plans-launch-badge")).toContainText("31/12/2026");
    await expect(page.locator("section:has(#planes)")).toContainText("31 de diciembre de 2026");
  });

  test("Professional is the recommended tier; only it", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("plan-recommended")).toHaveCount(1);
    await expect(
      page.getByTestId("plan-professional").getByTestId("plan-recommended"),
    ).toBeVisible();
    await expect(page.getByTestId("plan-recommended")).toHaveText(/recomendado/i);
  });

  test("live vs. coming-soon split: only implemented features are shown as live", async ({
    page,
  }) => {
    await page.goto("/");
    const professional = page.getByTestId("plan-professional");
    const business = page.getByTestId("plan-business");

    // Business owns API / ERP-TMS / technical onboarding — the only "Próximamente" items
    await expect(business).toContainText("API");
    await expect(business).toContainText(/ERP \/ TMS/i);
    await expect(business).toContainText(/próximamente/i);
    // exactly the 3 unbuilt integration items carry the badge, nowhere else
    await expect(page.locator("section:has(#planes)").getByText("Próximamente")).toHaveCount(3);

    // #111 — those 3 items ALSO carry "+ coste adicional" (not included in the
    // subscription price), and the small disclaimer spells it out. No fixed price.
    await expect(business).toContainText(/\+ coste adicional/i);
    await expect(page.locator("section:has(#planes)").getByText("+ coste adicional")).toHaveCount(
      3,
    );
    await expect(page.locator("section:has(#planes)")).toContainText(
      /no están incluidas en el precio de la suscripción/i,
    );
    await expect(page.locator("section:has(#planes)")).not.toContainText(/€80|80 ?€/);

    // Starter must NOT claim API / ERP
    await expect(page.getByTestId("plan-starter")).not.toContainText(/\bAPI\b/);
    await expect(page.getByTestId("plan-starter")).not.toContainText(/ERP/i);

    // Professional is fully live now — real features present, no "Próximamente"
    await expect(professional).toContainText(/CSV/);
    await expect(professional).toContainText(/Búsqueda avanzada/i);
    await expect(professional).toContainText(/2 años/i);
    await expect(professional).not.toContainText(/próximamente/i);
  });

  test("no billing affordance anywhere on the landing", async ({ page }) => {
    await page.goto("/");
    const body = (await page.locator("body").innerText()).toLowerCase();
    for (const banned of [
      "comprar",
      "contratar",
      "elegir plan",
      "suscribirme",
      "pagar ahora",
      "checkout",
      "stripe",
    ]) {
      expect(body, `landing must not contain "${banned}"`).not.toContain(banned);
    }
    // no form was introduced (AC-26 already asserts count 0 site-wide; re-check near the section)
    await expect(
      page.locator("#planes").locator("xpath=ancestor::section").locator("form"),
    ).toHaveCount(0);
    // the only CTA in the section is the informational "start free" link → /crear
    await expect(page.getByTestId("plans-guest-cta")).toHaveAttribute("href", "/crear");
  });

  test("desktop header has a discreet Planes link to /#planes", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const link = page.locator('header a[href="/#planes"]');
    await expect(link).toHaveText("Planes");
  });

  test("no horizontal scroll at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/#planes");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("the launch badge reads 'Gratis hasta el 31/12/2026' and is placed per breakpoint", async ({
    page,
  }) => {
    const geom = () =>
      page.evaluate(() => {
        const h2 = document.querySelector("#planes")!;
        const badge = document.querySelector("[data-testid='plans-launch-badge']")!;
        const sec = h2.closest("section")!;
        const para = [...sec.querySelectorAll("p")].find((el) =>
          el.textContent!.includes("gratuito hasta"),
        )!;
        const h = h2.getBoundingClientRect();
        const b = badge.getBoundingClientRect();
        const p = para.getBoundingClientRect();
        return {
          text: badge.textContent!.trim(),
          belowH2: b.top >= h.bottom - 3,
          rightOfH2: b.left > h.right,
          abovePara: b.bottom <= p.top + 3,
          centeredX: Math.abs((b.left + b.right) / 2 - window.innerWidth / 2) <= 2,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });

    // Mobile (<768): below the H2, above the paragraph, horizontally centred.
    for (const width of [320, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/#planes");
      const g = await geom();
      expect(g.text, `text @ ${width}`).toBe("Gratis hasta el 31/12/2026");
      expect(g.belowH2, `below H2 @ ${width}`).toBe(true);
      expect(g.rightOfH2, `not beside H2 @ ${width}`).toBe(false);
      expect(g.abovePara, `above paragraph @ ${width}`).toBe(true);
      expect(g.centeredX, `centred @ ${width}`).toBe(true);
      expect(g.overflow, `no overflow @ ${width}`).toBeLessThanOrEqual(0);
    }

    // Desktop (>=768): badge sits to the right of the heading row.
    for (const width of [1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/#planes");
      const g = await geom();
      expect(g.rightOfH2, `right of H2 @ ${width}`).toBe(true);
      expect(g.abovePara, `above paragraph @ ${width}`).toBe(true);
      expect(g.overflow, `no overflow @ ${width}`).toBeLessThanOrEqual(0);
    }
  });

  test("the existing free-launch section is still present and unchanged in intent", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("#incluido")).toBeVisible();
    await expect(page.getByTestId("landing-integrations-cta")).toBeVisible();
  });
});
