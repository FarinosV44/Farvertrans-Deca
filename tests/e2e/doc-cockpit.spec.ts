import { test, expect, type Page } from "@playwright/test";

/**
 * PRODUCT #36 — the post-generation document cockpit: a real QR/inspection
 * card, the structured data in the PDF's own sections, version history, and a
 * "what changed" diff after a correction.
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
  loadLocationProvince: "Valencia",
  loadLocationCountry: "España",
  loadDate: "2026-10-06",
  unloadLocationName: "Plataforma Norte",
  unloadLocationAddress: "Calle Alcalá 200",
  unloadLocationPostalCode: "28028",
  unloadLocationCity: "Madrid",
  unloadLocationProvince: "Madrid",
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
  await page.fill("#loadLocationProvince", V.loadLocationProvince);
  await page.fill("#loadLocationCountry", V.loadLocationCountry);
  await page.fill("#loadDate", V.loadDate);
  await page.fill("#unloadLocationName", V.unloadLocationName);
  await page.fill("#unloadLocationAddress", V.unloadLocationAddress);
  await page.fill("#unloadLocationPostalCode", V.unloadLocationPostalCode);
  await page.fill("#unloadLocationCity", V.unloadLocationCity);
  await page.fill("#unloadLocationProvince", V.unloadLocationProvince);
  await page.fill("#unloadLocationCountry", V.unloadLocationCountry);
  await page.fill("#unloadDate", V.unloadDate);
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", V.goods);
  await page.fill("#weight", V.weight);
  await page.fill("#tractorPlate", V.tractorPlate);
  // Only the anonymous flow shows the lightweight identity gate (TRUST #42 §3).
  if (await page.locator("#leadName").count()) {
    await page.fill("#leadName", "Ana García");
    await page.fill("#leadEmail", "ana@example.com");
  }
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
}

test.describe("PRODUCT #36 — document cockpit", () => {
  test("anonymous result: real QR card, HTTPS URL, and the data in PDF sections", async ({
    page,
  }) => {
    await page.goto("/crear");
    await fillWizard(page);

    const qr = page.getByTestId("qr-card");
    await expect(qr).toBeVisible();
    // A real QR image, not a placeholder.
    const img = qr.locator("img");
    await expect(img).toHaveAttribute("src", /^data:image\/png;base64,/);
    const url = await page.getByTestId("qr-card-url").textContent();
    expect(url).toMatch(/^https?:\/\/.+\/d\/[A-Za-z0-9_-]+$/);

    // The structured summary mirrors the PDF sections.
    await expect(page.getByText("Empresa que contrata el transporte")).toBeVisible();
    await expect(page.getByText("Transportista efectivo")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Datos del documento" })).toBeVisible();
    await expect(page.locator("#contenido")).toContainText(V.goods);
    await expect(page.locator("#contenido")).toContainText(V.shipperName);
  });

  test("workspace: a corrected DeCA shows version history and a 'what changed' diff", async ({
    page,
  }) => {
    await page.goto("/registro");
    await page.fill("#email", `u${rnd()}@example.com`);
    await page.fill("#password", "supersecret123");
    await page.fill("#companyName", `Cockpit SL ${rnd()}`);
    await page.fill("#companyNif", "B12345674");
    await page.getByTestId("accept-terms").check();
    await page.getByTestId("register-submit").click();
    await expect(page).toHaveURL(/\/verificar-email/);
    await page.goto("/panel");

    await page.goto("/crear");
    await fillWizard(page);
    const decaId = page.url().split("/crear/")[1].split("?")[0];

    await page.goto(`/panel/deca/${decaId}`);
    await expect(page.getByRole("heading", { name: "Historial de versiones" })).toBeVisible();
    await expect(page.getByText("Versión actual: 1")).toBeVisible();

    // Correct the unload location.
    await page.getByTestId("deca-corregir").click();
    await page.getByTestId("wizard-next").click();
    await page.fill("#unloadLocationCity", "Zaragoza");
    await page.getByTestId("wizard-next").click();
    await page.fill("#tractorPlate", V.tractorPlate);
    await page.getByTestId("correction-reason").fill("Cambio de destino");
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(new RegExp(`/panel/deca/${decaId}$`));

    await expect(page.getByText("Versión actual: 2")).toBeVisible();
    const diff = page.getByTestId("change-list");
    await expect(diff).toBeVisible();
    await expect(diff).toContainText("Lugar de descarga — localidad");
    await expect(diff).toContainText("Madrid");
    await expect(diff).toContainText("Zaragoza");
  });
});
