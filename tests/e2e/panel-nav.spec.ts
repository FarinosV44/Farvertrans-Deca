import { test, expect, type Page } from "@playwright/test";

/**
 * #70 — the panel section navigation must never need a horizontal scrollbar,
 * on any of the reference widths, while keeping every section reachable in at
 * most two actions and the "Crear DeCA" CTA visible.
 */

function email() {
  return `nav70${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function register(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Navegación SL");
  await page.fill("#companyNif", "B12345674");
  await page.fill("#companyContactName", "Ana Ejemplo");
  await page.fill("#companyPhone", "600111222");
  await page.fill("#companyEmail", "empresa@example.com");
  await page.fill("#companyAddress", "Calle Prueba 1");
  await page.fill("#companyPostalCode", "46540");
  await page.fill("#companyCity", "El Puig");
  await page.getByTestId("accept-terms").check();
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
    page.getByTestId("register-submit").click(),
  ]);
  await page.request.get(`/verificar-email/${(await res.json()).verifyTestToken}`);
}

const PANEL_PAGES = [
  "/panel",
  "/panel/historico",
  "/panel/plantillas",
  "/panel/datos",
  "/panel/equipo",
  "/panel/empresa",
  "/panel/ayuda",
  "/panel/integraciones",
];

for (const [w, h] of [
  [360, 740],
  [768, 1024],
  [1280, 900],
  [1440, 900],
] as const) {
  test(`panel nav has no horizontal scroll at ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await register(page);
    for (const path of PANEL_PAGES) {
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator("h1").first()).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `no horizontal scroll on ${path}`).toBeLessThanOrEqual(1);
      // the section nav element itself must not scroll sideways either
      const navScroll = await page.evaluate(() => {
        const els = [
          ...document.querySelectorAll(
            '[data-testid="panel-nav"] nav, [data-testid="panel-nav"] details',
          ),
        ];
        return Math.max(0, ...els.map((e) => e.scrollWidth - e.clientWidth));
      });
      expect(navScroll, `nav element does not scroll on ${path}`).toBeLessThanOrEqual(1);
      // the header CTA stays reachable
      await expect(page.getByTestId("cta-crear").first()).toBeVisible();
    }
  });
}

test("panel home does not overflow on a phone once it has a DeCA to show", async ({ page }) => {
  // The user-reported bug: with recent-doc rows + the "duplicar" card rendered,
  // `/panel` scrolled sideways on mobile (D-144 — CSS-grid auto-track). The
  // empty-state panel never triggered it, so this seeds one DeCA first.
  await register(page);
  await page.goto("/crear");
  await page.fill("#shipperName", "Cargas del Turia SL");
  await page.fill("#shipperNif", "B96789011");
  await page.fill("#shipperAddress", "Av. del Puerto 120, Valencia");
  await page.fill("#carrierName", "Transportes Pérez SL");
  await page.fill("#carrierNif", "B12345674");
  await page.fill("#carrierAddress", "Pol. Ind. Fuente del Jarro 5, Paterna");
  await page.getByTestId("wizard-next").click();
  await page.fill("#loadLocationName", "Almacén Turia");
  await page.fill("#loadLocationAddress", "Av. del Puerto 120");
  await page.fill("#loadLocationPostalCode", "46023");
  await page.fill("#loadLocationCity", "Valencia");
  await page.fill("#loadLocationProvince", "Valencia");
  await page.fill("#loadLocationCountry", "España");
  await page.fill("#loadDate", "2026-10-06");
  await page.fill("#unloadLocationName", "Plataforma Norte");
  await page.fill("#unloadLocationAddress", "Calle Alcalá 200");
  await page.fill("#unloadLocationPostalCode", "28028");
  await page.fill("#unloadLocationCity", "Madrid");
  await page.fill("#unloadLocationProvince", "Madrid");
  await page.fill("#unloadLocationCountry", "España");
  await page.fill("#unloadDate", "2026-10-06");
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", "Palés de cerámica");
  await page.fill("#weight", "12.500 kg");
  await page.fill("#tractorPlate", "1234 BCD");
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);

  for (const [w, h] of [
    [360, 740],
    [390, 844],
    [414, 896],
  ] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/panel", { waitUntil: "networkidle" });
    await expect(page.getByTestId("app-repetir")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `no horizontal scroll on /panel at ${w}px`).toBeLessThanOrEqual(1);
  }
});

test("every section is reachable from the nav in at most two actions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await register(page);
  await page.goto("/panel");
  // mobile: open the disclosure (action 1), then pick the link (action 2)
  const nav = page.getByTestId("panel-nav");
  await nav.locator("details summary").first().click();
  await nav.locator("details").getByRole("link", { name: "Datos habituales" }).click();
  await expect(page).toHaveURL(/\/panel\/datos/);

  // desktop: one click, direct
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/panel");
  await page
    .getByRole("navigation", { name: "Secciones de la cuenta" })
    .getByRole("link", { name: "Equipo" })
    .click();
  await expect(page).toHaveURL(/\/panel\/equipo/);
});
