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
  origin: "Valencia",
  destination: "Madrid",
  transportDate: "2026-10-06",
  goods: "Palés de cerámica",
  weight: "12000 kg",
  tractorPlate: "1234 BCD",
};

async function fillStep1(page: Page) {
  await page.fill("#shipperName", V.shipperName);
  await page.fill("#shipperNif", V.shipperNif);
  await page.fill("#shipperAddress", V.shipperAddress);
  await page.fill("#carrierName", V.carrierName);
  await page.fill("#carrierNif", V.carrierNif);
  await page.fill("#carrierAddress", V.carrierAddress);
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
    await page.fill("#origin", V.origin);
    await page.fill("#destination", V.destination);
    await page.fill("#transportDate", V.transportDate);
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
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await page.fill("#origin", V.origin);
    await page.fill("#destination", V.destination);
    await page.fill("#transportDate", V.transportDate);
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
