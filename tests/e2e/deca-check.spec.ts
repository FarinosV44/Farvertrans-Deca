import { test, expect, type Page } from "@playwright/test";

/**
 * #71 — the pre-generation "Comprobación del DeCA" block. It is a light view
 * over the SAME zod schemas the server validates with, makes no legal claim,
 * and every problem row jumps to its field.
 */

const V = {
  shipperName: "Cargas del Turia SL",
  shipperNif: "B96789011",
  shipperAddress: "Av. del Puerto 120, Valencia",
  carrierName: "Transportes Pérez SL",
  carrierNif: "B12345674",
  carrierAddress: "Pol. Ind. Fuente del Jarro, calle 5, Paterna",
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

async function toReviewStep(page: Page, opts: { carrierNif?: string } = {}) {
  await page.goto("/crear");
  await page.fill("#shipperName", V.shipperName);
  await page.fill("#shipperNif", V.shipperNif);
  await page.fill("#shipperAddress", V.shipperAddress);
  await page.fill("#carrierName", V.carrierName);
  await page.fill("#carrierNif", opts.carrierNif ?? V.carrierNif);
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
}

test("shows 'Faltan datos obligatorios' until the mandatory fields are filled, then 'Listo para generar'", async ({
  page,
}) => {
  await toReviewStep(page);
  const check = page.getByTestId("deca-check");
  await expect(check).toBeVisible();
  await expect(check).toHaveAttribute("data-status", "missing");
  await expect(check).toContainText("Faltan datos obligatorios");
  // it never claims legal validity
  await expect(check).not.toContainText(/legalmente v[aá]lido|100 ?%|conforme a la ley/i);
  await expect(check).toContainText("No es una validación jurídica");

  await page.fill("#goods", V.goods);
  await page.fill("#weight", V.weight);
  await page.fill("#tractorPlate", V.tractorPlate);
  await expect(check).toHaveAttribute("data-status", "ready");
  await expect(check).toContainText("Listo para generar");
});

test("a problem row jumps focus to the field that must be corrected", async ({ page }) => {
  await toReviewStep(page);
  await page.fill("#goods", V.goods);
  await page.fill("#weight", V.weight);
  // leave the tractor plate empty
  const check = page.getByTestId("deca-check");
  await expect(check).toHaveAttribute("data-status", "missing");
  await check.getByTestId("deca-check-fix-2").click();
  await expect(page.locator("#tractorPlate")).toBeFocused();
});

test("a structurally complete DeCA with a foreign NIF is 'Revisar datos', not blocked", async ({
  page,
}) => {
  await toReviewStep(page, { carrierNif: "DE811569869" });
  await page.fill("#goods", V.goods);
  await page.fill("#weight", V.weight);
  await page.fill("#tractorPlate", V.tractorPlate);
  const check = page.getByTestId("deca-check");
  await expect(check).toHaveAttribute("data-status", "review");
  await expect(check).toContainText("Revisar datos");
});
