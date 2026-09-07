import { test, expect, type Page } from "@playwright/test";

/**
 * #69 — Modo Inspección: a clean view of the DeCA version currently in force,
 * reachable in one tap from the detail page, showing the real reference,
 * status, parties, route, plates and QR, with "Abrir PDF vigente" pointing at
 * exactly the current version. It must never surface an old version as in force
 * and must not touch the public `/d/[token]` flow.
 */

const V = {
  shipperName: "Cargas del Turia SL",
  shipperNif: "B96789011",
  shipperAddress: "Av. del Puerto 120, Valencia",
  carrierName: "Transportes Pérez SL",
  carrierNif: "B12345674",
  carrierAddress: "Calle 5, Paterna",
  loadLocationName: "Almacén Turia",
  loadLocationAddress: "Av. del Puerto 120",
  loadLocationPostalCode: "46023",
  loadLocationCity: "Valencia",
  loadLocationCountry: "España",
  loadDate: "2026-10-06",
  unloadLocationName: "Plataforma Norte",
  unloadLocationAddress: "Calle Alcalá 200",
  unloadLocationPostalCode: "28028",
  unloadLocationCity: "Madrid",
  unloadLocationCountry: "España",
  unloadDate: "2026-10-06",
  goods: "Palés de cerámica",
  weight: "12000 kg",
  tractorPlate: "1234 BCD",
};
const rnd = () => `${Date.now()}${Math.floor(Math.random() * 1e5)}`;

async function fillWizard(page: Page) {
  await page.fill("#shipperName", V.shipperName);
  await page.fill("#shipperNif", V.shipperNif);
  await page.fill("#shipperAddress", V.shipperAddress);
  await page.fill("#carrierName", V.carrierName);
  await page.fill("#carrierNif", V.carrierNif);
  await page.fill("#carrierAddress", V.carrierAddress);
  await page.getByTestId("wizard-next").click();
  await page.fill("#loadLocationName", V.loadLocationName);
  await page.fill("#loadLocationAddress", V.loadLocationAddress);
  await page.fill("#loadLocationPostalCode", V.loadLocationPostalCode);
  await page.fill("#loadLocationCity", V.loadLocationCity);
  await page.fill("#loadLocationCountry", V.loadLocationCountry);
  await page.fill("#loadDate", V.loadDate);
  await page.fill("#unloadLocationName", V.unloadLocationName);
  await page.fill("#unloadLocationAddress", V.unloadLocationAddress);
  await page.fill("#unloadLocationPostalCode", V.unloadLocationPostalCode);
  await page.fill("#unloadLocationCity", V.unloadLocationCity);
  await page.fill("#unloadLocationCountry", V.unloadLocationCountry);
  await page.fill("#unloadDate", V.unloadDate);
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", V.goods);
  await page.fill("#weight", V.weight);
  await page.fill("#tractorPlate", V.tractorPlate);
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
}

async function register(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", `insp${rnd()}@example.com`);
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", `Inspección SL ${rnd()}`);
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
  await page.goto("/panel");
}

test("one tap from the detail page → a clean inspection view of the version in force", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await register(page);
  await page.goto("/crear");
  await fillWizard(page);
  const decaId = page.url().split("/crear/")[1].split("?")[0];

  await page.goto(`/panel/deca/${decaId}`);
  await page.getByTestId("deca-inspeccion").click();
  await expect(page).toHaveURL(new RegExp(`/panel/deca/${decaId}/inspeccion$`));

  const card = page.getByTestId("inspection-card");
  await expect(card).toBeVisible();
  await expect(page.getByTestId("inspection-status")).toHaveText("VIGENTE");
  await expect(card).toContainText("Versión 1 · en vigor");
  await expect(card).toContainText(V.shipperName);
  await expect(card).toContainText(V.carrierName);
  await expect(card).toContainText("Valencia");
  await expect(card).toContainText("Madrid");
  await expect(card).toContainText("1234BCD"); // plates are stored normalised
  // a real QR
  await expect(card.locator('img[alt*="QR"]')).toHaveAttribute("src", /^data:image\/png;base64,/);
  // no internal data
  await expect(card).not.toContainText(/SHA-256|sha256/i);
  // no horizontal scroll on a phone
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  // "Abrir PDF vigente" points at the current version's public URL
  const href = await page.getByTestId("inspection-open-pdf").getAttribute("href");
  expect(href).toMatch(/\/d\/[A-Za-z0-9_-]+$/);
});

test("after a correction the inspection view follows the version in force, not the old one", async ({
  page,
}) => {
  await register(page);
  await page.goto("/crear");
  await fillWizard(page);
  const decaId = page.url().split("/crear/")[1].split("?")[0];

  await page.goto(`/panel/deca/${decaId}/inspeccion`);
  const oldHref = await page.getByTestId("inspection-open-pdf").getAttribute("href");

  // correct the destination
  await page.goto(`/panel/deca/${decaId}`);
  await page.getByTestId("deca-corregir").click();
  await page.getByTestId("wizard-next").click();
  await page.fill("#unloadLocationCity", "Zaragoza");
  await page.getByTestId("wizard-next").click();
  await page.fill("#tractorPlate", V.tractorPlate);
  await page.getByTestId("correction-reason").fill("Cambio de destino");
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(new RegExp(`/panel/deca/${decaId}$`));

  await page.goto(`/panel/deca/${decaId}/inspeccion`);
  await expect(page.getByTestId("inspection-status")).toHaveText("CORREGIDO");
  await expect(page.getByTestId("inspection-card")).toContainText("Versión 2 · en vigor");
  await expect(page.getByTestId("inspection-card")).toContainText("Zaragoza");
  const newHref = await page.getByTestId("inspection-open-pdf").getAttribute("href");
  expect(newHref).not.toBe(oldHref);
});

test("the public /d/[token] route is unaffected — still a direct PDF, no interstitial", async ({
  page,
  request,
}) => {
  await register(page);
  await page.goto("/crear");
  await fillWizard(page);
  const decaId = page.url().split("/crear/")[1].split("?")[0];
  await page.goto(`/panel/deca/${decaId}/inspeccion`);
  const href = await page.getByTestId("inspection-open-pdf").getAttribute("href");
  const res = await request.get(href!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/pdf");
});
