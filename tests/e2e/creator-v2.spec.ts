import { test, expect, type Page } from "@playwright/test";

const DECA = {
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
  weight: "12.500 kg",
  tractorPlate: "1234 BCD",
};

async function fillStep2(page: Page) {
  await page.fill("#loadLocationName", DECA.loadLocationName);
  await page.fill("#loadLocationAddress", DECA.loadLocationAddress);
  await page.fill("#loadLocationPostalCode", DECA.loadLocationPostalCode);
  await page.fill("#loadLocationCity", DECA.loadLocationCity);
  await page.fill("#loadLocationProvince", DECA.loadLocationProvince);
  await page.fill("#loadLocationCountry", DECA.loadLocationCountry);
  await page.fill("#loadDate", DECA.loadDate);
  await page.fill("#unloadLocationName", DECA.unloadLocationName);
  await page.fill("#unloadLocationAddress", DECA.unloadLocationAddress);
  await page.fill("#unloadLocationPostalCode", DECA.unloadLocationPostalCode);
  await page.fill("#unloadLocationCity", DECA.unloadLocationCity);
  await page.fill("#unloadLocationProvince", DECA.unloadLocationProvince);
  await page.fill("#unloadLocationCountry", DECA.unloadLocationCountry);
  await page.fill("#unloadDate", DECA.unloadDate);
}

function email() {
  return `cv2${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function register(page: Page, nif = "B12345674") {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Operador CV2 SL");
  await page.fill("#companyNif", nif);
  await page.getByTestId("accept-terms").check();
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
    page.getByTestId("register-submit").click(),
  ]);
  await expect(page).toHaveURL(/\/verificar-email/);
  // D-053: generation is a hard gate on emailVerifiedAt — verify for real.
  const body = await res.json();
  await page.request.get(`/verificar-email/${body.verifyTestToken}`);
  await page.goto("/panel");
}

async function fillAndGenerate(page: Page) {
  await page.fill("#shipperName", DECA.shipperName);
  await page.fill("#shipperNif", DECA.shipperNif);
  await page.fill("#shipperAddress", DECA.shipperAddress);
  await page.fill("#carrierName", DECA.carrierName);
  await page.fill("#carrierNif", DECA.carrierNif);
  await page.fill("#carrierAddress", DECA.carrierAddress);
  await page.getByTestId("wizard-next").click();
  await fillStep2(page);
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", DECA.goods);
  await page.fill("#weight", DECA.weight);
  await page.fill("#tractorPlate", DECA.tractorPlate);
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);
}

test.describe("UX #25 — creator V2", () => {
  test('"usar mi empresa" fills a legal party from the logged-in company', async ({ page }) => {
    await register(page, "B12345674");
    await page.goto("/crear");
    await page.getByTestId("use-my-company-carrier").click();
    await expect(page.locator("#carrierName")).toHaveValue("Operador CV2 SL");
    await expect(page.locator("#carrierNif")).toHaveValue("B12345674");
  });

  test("template: save from a DeCA → appears in the wizard → creates a NEW independent document", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillAndGenerate(page);
    const firstUrl = page.url();
    const firstToken = firstUrl.split("/crear/")[1].split("?")[0];

    // save it as a template from the owner detail view
    await page.goto("/panel/historico");
    await page
      .getByTestId("historico-table")
      .getByRole("link", { name: "Detalle" })
      .first()
      .click();
    await page.getByTestId("save-template-open").click();
    await page.fill('[data-testid="template-name"]', "Valencia-Madrid habitual");
    await page.getByTestId("save-template-confirm").click();
    await expect(page.getByTestId("template-saved")).toBeVisible();

    // it shows in the templates section
    await page.goto("/panel/plantillas");
    await expect(page.getByTestId("template-list")).toContainText("Valencia-Madrid habitual");

    // start a new DeCA from the template
    await page.goto("/crear");
    await page.selectOption('[data-testid="template-picker"]', {
      label: "Valencia-Madrid habitual",
    });
    await expect(page.locator("#carrierName")).toHaveValue(DECA.carrierName);
    await expect(page.locator("#shipperName")).toHaveValue(DECA.shipperName);
    // dates are NOT carried by a template — must be set fresh
    await page.getByTestId("wizard-next").click();
    await expect(page.locator("#loadDate")).toHaveValue("");
    await expect(page.locator("#unloadDate")).toHaveValue("");
    await page.fill("#loadDate", "2026-11-15");
    await page.fill("#unloadDate", "2026-11-15");
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);

    // a brand-new independent document — different token/URL
    const secondToken = page.url().split("/crear/")[1].split("?")[0];
    expect(secondToken).not.toBe(firstToken);
    await page.goto("/panel/historico");
    await expect(page.getByText("2 documentos")).toBeVisible();
  });

  test("draft autosave: an in-progress form survives an accidental reload", async ({ page }) => {
    await page.goto("/crear"); // anonymous
    await page.fill("#shipperName", "Borrador SL");
    await page.fill("#carrierNif", "B99999990");
    await page.reload();
    await expect(page.locator("#shipperName")).toHaveValue("Borrador SL");
    await expect(page.locator("#carrierNif")).toHaveValue("B99999990");
  });

  test("a failed generation keeps the entered data (draft not lost)", async ({ page }) => {
    await register(page);
    await page.goto("/crear");
    await page.route("**/api/deca", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "internal", message: "Fallo simulado" } }),
      }),
    );
    await page.fill("#shipperName", DECA.shipperName);
    await page.fill("#shipperNif", DECA.shipperNif);
    await page.fill("#shipperAddress", DECA.shipperAddress);
    await page.fill("#carrierName", DECA.carrierName);
    await page.fill("#carrierNif", DECA.carrierNif);
    await page.fill("#carrierAddress", DECA.carrierAddress);
    await page.getByTestId("wizard-next").click();
    await fillStep2(page);
    await page.getByTestId("wizard-next").click();
    await page.fill("#goods", DECA.goods);
    await page.fill("#weight", DECA.weight);
    await page.fill("#tractorPlate", DECA.tractorPlate);
    await page.getByTestId("wizard-generate").click();

    await expect(page.getByText(/Fallo simulado|No se pudo generar/)).toBeVisible();
    // still on /crear, data intact
    await expect(page).toHaveURL(/\/crear$/);
    await expect(page.locator("#goods")).toHaveValue(DECA.goods);
  });
});
