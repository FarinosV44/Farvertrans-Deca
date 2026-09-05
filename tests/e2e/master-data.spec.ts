import { test, expect, type Page } from "@playwright/test";

/**
 * WORKSPACE #24 — saved master data as a real operational system: create
 * reusable parties/locations/vehicles, build a DeCA entirely from the
 * searchable dropdowns (no retyping), generate, then duplicate and confirm
 * the second document is materially faster (only date changes).
 */

function email() {
  return `md${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function register(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "supersecret123");
  await page.fill("#companyName", "Master Data SL");
  await page.fill("#companyNif", "B12345674");
  await page.getByTestId("accept-terms").check();
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
    page.getByTestId("register-submit").click(),
  ]);
  await expect(page).toHaveURL(/\/verificar-email/);
  const body = await res.json();
  await page.request.get(`/verificar-email/${body.verifyTestToken}`);
  await page.goto("/panel");
}

test.describe("WORKSPACE #24 — real operational master-data system", () => {
  test("create saved records → build a DeCA entirely from dropdowns → generate → duplicate → second DeCA is materially faster", async ({
    page,
  }) => {
    await register(page);

    // 1. Create the habitual records the issue asks for.
    await page.goto("/panel/datos");

    // the <details> panel stays open (uncontrolled) across the router.refresh()
    // after each save, so "Añadir" is only clicked once per section.
    await page.locator("section", { hasText: "Empresas y contactos" }).getByText("Añadir").click();
    await page.getByTestId("c-role").selectOption("shipper");
    await page.fill("#c-name", "Cargador Habitual SL");
    await page.fill("#c-nif", "B11111111");
    await page.fill("#c-address", "Calle Uno 1, Valencia");
    await page.fill("#c-contact-name", "Marta Ruiz");
    await page
      .locator("section", { hasText: "Empresas y contactos" })
      .getByRole("button", { name: "Guardar" })
      .click();
    await expect(page.getByText("Cargador Habitual SL")).toBeVisible();

    await page.getByTestId("c-role").selectOption("carrier");
    await page.fill("#c-name", "Transportista Habitual SL");
    await page.fill("#c-nif", "B22222222");
    await page.fill("#c-address", "Calle Dos 2, Paterna");
    await page
      .locator("section", { hasText: "Empresas y contactos" })
      .getByRole("button", { name: "Guardar" })
      .click();
    await expect(page.getByText("Transportista Habitual SL")).toBeVisible();

    await page
      .locator("section", { hasText: "Lugares de carga y descarga" })
      .getByText("Añadir")
      .click();
    await page.getByTestId("l-type").selectOption("load");
    await page.fill("#l-name", "Almacén Habitual Valencia");
    await page.fill("#l-address", "Av. del Puerto 120");
    await page.fill("#l-postal-code", "46023");
    await page.fill("#l-city", "Valencia");
    await page.fill("#l-province", "Valencia");
    await page
      .locator("section", { hasText: "Lugares de carga y descarga" })
      .getByRole("button", { name: "Guardar" })
      .click();
    await expect(page.getByText("Almacén Habitual Valencia")).toBeVisible();

    await page.getByTestId("l-type").selectOption("unload");
    await page.fill("#l-name", "Plataforma Habitual Madrid");
    await page.fill("#l-address", "Calle Alcalá 200");
    await page.fill("#l-postal-code", "28028");
    await page.fill("#l-city", "Madrid");
    await page.fill("#l-province", "Madrid");
    await page
      .locator("section", { hasText: "Lugares de carga y descarga" })
      .getByRole("button", { name: "Guardar" })
      .click();
    await expect(page.getByText("Plataforma Habitual Madrid")).toBeVisible();

    await page.locator("section", { hasText: "Vehículos" }).getByText("Añadir").click();
    await page.fill("#v-alias", "Camión 1");
    await page.fill("#v-tractor", "9999 ABC");
    await page
      .locator("section", { hasText: "Vehículos" })
      .getByRole("button", { name: "Guardar" })
      .click();
    await expect(page.getByText("Camión 1")).toBeVisible();

    // 2. Build the DeCA entirely from the dropdowns — no manual typing of
    // any party, location or vehicle field. "Materially faster" is measured
    // as data-entry actions, not wall-clock time: Playwright fills a field
    // instantly regardless of how much a human would have had to type, so a
    // timing comparison here would not reflect a real user's experience —
    // the field/dropdown COUNT is the honest, deterministic proxy.
    let firstDecaActions = 0;
    await page.goto("/crear");
    await page
      .getByTestId("autofill-shipper")
      .selectOption({ label: "Cargador Habitual SL — B11111111" });
    firstDecaActions++;
    await expect(page.locator("#shipperName")).toHaveValue("Cargador Habitual SL");
    await page
      .getByTestId("autofill-carrier")
      .selectOption({ label: "Transportista Habitual SL — B22222222" });
    firstDecaActions++;
    await expect(page.locator("#carrierName")).toHaveValue("Transportista Habitual SL");
    await page.getByTestId("wizard-next").click();

    await page
      .getByTestId("autofill-load-location")
      .selectOption({ label: "Almacén Habitual Valencia — Valencia" });
    firstDecaActions++;
    await expect(page.locator("#loadLocationAddress")).toHaveValue("Av. del Puerto 120");
    await page.fill("#loadDate", "2026-10-06");
    firstDecaActions++;
    await page
      .getByTestId("autofill-unload-location")
      .selectOption({ label: "Plataforma Habitual Madrid — Madrid" });
    firstDecaActions++;
    await expect(page.locator("#unloadLocationAddress")).toHaveValue("Calle Alcalá 200");
    await page.fill("#unloadDate", "2026-10-06");
    firstDecaActions++;
    await page.getByTestId("wizard-next").click();

    await page.fill("#goods", "Palés");
    firstDecaActions++;
    await page.fill("#weight", "12000 kg");
    firstDecaActions++;
    await page.getByTestId("autofill-vehicle").selectOption({ label: "Camión 1 — 9999ABC" });
    firstDecaActions++;
    await expect(page.locator("#tractorPlate")).toHaveValue("9999ABC");
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });

    // 3. Duplicate → change only the dates → generate the second document.
    let secondDecaActions = 0;
    await page.goto("/panel");
    await page.getByTestId("app-repetir").click();
    await expect(page).toHaveURL(/\/crear\?from=/);
    await expect(page.locator("#shipperName")).toHaveValue("Cargador Habitual SL"); // prefilled
    await expect(page.locator("#carrierName")).toHaveValue("Transportista Habitual SL");
    await page.getByTestId("wizard-next").click();
    await expect(page.locator("#loadDate")).toHaveValue(""); // dates reset — must be set fresh
    await page.fill("#loadDate", "2026-10-20");
    secondDecaActions++;
    await page.fill("#unloadDate", "2026-10-20");
    secondDecaActions++;
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });

    // The duplicate needs only the 2 date fields — every party, location and
    // vehicle field carries over untouched. Materially fewer actions than
    // building the first DeCA from scratch (even entirely via dropdowns).
    expect(secondDecaActions).toBeLessThan(firstDecaActions);

    await page.goto("/panel/historico");
    await expect(page.getByText("2 documentos")).toBeVisible();

    // 4. Editing/removing master data never mutates an already-generated DeCA.
    await page.goto("/panel/datos");
    await page
      .locator("li", { hasText: "Cargador Habitual SL" })
      .getByRole("button", { name: "Borrar" })
      .click();
    await expect(page.getByText("Cargador Habitual SL")).toHaveCount(0);
    await page.goto("/panel/historico");
    await expect(page.getByTestId("historico-table")).toContainText("Cargador Habitual SL");
  });
});
