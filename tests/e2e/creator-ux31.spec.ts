import { test, expect, type Page } from "@playwright/test";

/**
 * UX #31 — the creation flow reads plainly and never dead-ends: named step
 * labels, focus lands on the first field to fix, a clean review with per-block
 * Editar, and a visible "generating" state.
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

/** Registers a fresh company via the API and leaves the page's cookie jar authenticated. */
async function registerAndLogin(page: Page) {
  const addr = `ux31${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
  const res = await page.request.post("/api/auth/register", {
    data: {
      email: addr,
      password: "supersecret123",
      companyName: "UX31 SL",
      companyNif: "B12345674",
      acceptTerms: true,
    },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  // D-053: generation is a hard gate on emailVerifiedAt — verify for real.
  await page.request.get(`/verificar-email/${body.verifyTestToken}`);
}

async function fillStep1(page: Page) {
  await page.fill("#shipperName", V.shipperName);
  await page.fill("#shipperNif", V.shipperNif);
  await page.fill("#shipperAddress", V.shipperAddress);
  await page.fill("#carrierName", V.carrierName);
  await page.fill("#carrierNif", V.carrierNif);
  await page.fill("#carrierAddress", V.carrierAddress);
}

async function fillStep2(page: Page) {
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
}

test.describe("UX #31 — ultra-simple creation flow", () => {
  test("the progress indicator carries a plain-language label, not only a number", async ({
    page,
  }) => {
    await page.goto("/crear");
    await expect(page.getByText("Paso 1 de 3 · Quién contrata y quién transporta")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Quién contrata y quién transporta" }),
    ).toBeVisible();
  });

  test("continuing with a gap sends focus to the first field to fix", async ({ page }) => {
    await page.goto("/crear");
    await page.fill("#shipperName", V.shipperName); // NIF left empty
    await page.getByTestId("wizard-next").click();
    await expect(page.getByTestId("error-summary")).toBeVisible();
    await expect(page.locator("#shipperNif")).toBeFocused();
  });

  test("the review step groups data into PDF sections, each with Editar", async ({ page }) => {
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillStep2(page);
    await page.getByTestId("wizard-next").click();
    await page.fill("#goods", V.goods);
    await page.fill("#weight", V.weight);
    await page.fill("#tractorPlate", V.tractorPlate);

    const review = page.getByTestId("review-summary");
    await expect(review).toContainText("Empresa que contrata el transporte");
    await expect(review).toContainText("Transportista que realiza el transporte");
    await expect(review).toContainText(V.shipperName);
    await expect(review).toContainText(V.goods);

    // "Editar" on the parties block jumps back to step 1.
    await page.getByTestId("review-edit-shipper").click();
    await expect(page.getByText("Paso 1 de 3 ·")).toBeVisible();
    await expect(page.locator("#shipperName")).toHaveValue(V.shipperName);
  });

  test("pressing GENERAR DECA shows a generating state and cannot double-submit", async ({
    page,
  }) => {
    await registerAndLogin(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillStep2(page);
    await page.getByTestId("wizard-next").click();
    await page.fill("#goods", V.goods);
    await page.fill("#weight", V.weight);
    await page.fill("#tractorPlate", V.tractorPlate);

    const generate = page.getByTestId("wizard-generate");
    await generate.click();
    // The button locks and a plain progress line appears.
    await expect(generate).toBeDisabled();
    await expect(page.getByTestId("generating-status")).toBeVisible();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
  });
});
