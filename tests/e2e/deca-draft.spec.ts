import { test, expect, type Page } from "@playwright/test";

/**
 * #76 — an authenticated in-progress DeCA is saved as a draft: it shows on the
 * panel, resumes with the data intact, discards behind a confirm, and never
 * appears as an issued document. Generating it removes the draft.
 */

const rnd = () => `${Date.now()}${Math.floor(Math.random() * 1e5)}`;

async function register(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", `draft${rnd()}@example.com`);
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", `Borrador SL ${rnd()}`);
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

test("start a DeCA, leave, resume from the panel, then discard", async ({ page }) => {
  await register(page);
  await page.goto("/crear");
  await page.fill("#shipperName", "Cargas del Turia SL");
  await page.fill("#shipperNif", "B96789011");
  await page.fill("#shipperAddress", "Av. del Puerto 120, Valencia");
  // wait for the debounced server save
  await page.waitForResponse(
    (r) => r.url().endsWith("/api/deca/draft") && r.request().method() === "PUT",
  );

  await page.goto("/panel");
  const banner = page.getByTestId("draft-banner");
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("Borrador pendiente");
  // it is NOT in the issued-documents list
  await expect(page.locator("#contenido")).toContainText("Aún no tienes documentos.");

  await page.getByTestId("draft-continue").click();
  await expect(page).toHaveURL(/\/crear$/);
  await expect(page.locator("#shipperName")).toHaveValue("Cargas del Turia SL");
  await expect(page.locator("#shipperAddress")).toHaveValue("Av. del Puerto 120, Valencia");

  await page.goto("/panel");
  await page.getByTestId("draft-discard").click();
  await page.getByTestId("draft-discard-confirm").click();
  await expect(page.getByTestId("draft-banner")).toHaveCount(0);
});

test("generating the DeCA clears the draft", async ({ page }) => {
  await register(page);
  await page.goto("/crear");
  await page.fill("#shipperName", "Cargas del Turia SL");
  await page.fill("#shipperNif", "B96789011");
  await page.fill("#shipperAddress", "Av. del Puerto 120, Valencia");
  await page.fill("#carrierName", "Transportes Pérez SL");
  await page.fill("#carrierNif", "B12345674");
  await page.fill("#carrierAddress", "Calle 5, Paterna");
  await page.getByTestId("wizard-next").click();
  await page.fill("#loadLocationName", "Almacén Turia");
  await page.fill("#loadLocationAddress", "Av. del Puerto 120");
  await page.fill("#loadLocationPostalCode", "46023");
  await page.fill("#loadLocationCity", "Valencia");
  await page.fill("#loadLocationCountry", "España");
  await page.fill("#loadDate", "2026-10-06");
  await page.fill("#unloadLocationName", "Plataforma Norte");
  await page.fill("#unloadLocationAddress", "Calle Alcalá 200");
  await page.fill("#unloadLocationPostalCode", "28028");
  await page.fill("#unloadLocationCity", "Madrid");
  await page.fill("#unloadLocationCountry", "España");
  await page.fill("#unloadDate", "2026-10-06");
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", "Palés de cerámica");
  await page.fill("#weight", "12000 kg");
  await page.fill("#tractorPlate", "1234 BCD");
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });

  await page.goto("/panel");
  await expect(page.getByTestId("draft-banner")).toHaveCount(0);
  await expect(page.locator("#contenido")).not.toContainText("Aún no tienes documentos.");
});
