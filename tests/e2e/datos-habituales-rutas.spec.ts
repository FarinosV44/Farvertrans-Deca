import { test, expect, type Page } from "@playwright/test";

/**
 * #113 Phase 2 — Datos habituales visual redesign: tabs (incl. the new
 * Rutas/envíos habituales tab), global search, the duplicate-detection
 * warning (§13), and the dashboard's new "Rutas habituales" quick action.
 * Driven through the real UI, not the API directly (that's already covered
 * by Phase 1's `saved-shipments.spec.ts`).
 */

function email() {
  return `dh${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function register(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Datos Habituales SL");
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
  await expect(page).toHaveURL(/\/verificar-email/);
  const body = await res.json();
  await page.request.get(`/verificar-email/${body.verifyTestToken}`);
  await page.goto("/panel");
}

async function addLocation(
  page: Page,
  data: { name: string; address: string; postalCode: string; city: string; type: string },
) {
  await page.getByTestId("add-location").click();
  await page.getByTestId("l-type").selectOption(data.type);
  await page.fill("#l-name", data.name);
  await page.fill("#l-address", data.address);
  await page.fill("#l-postal-code", data.postalCode);
  await page.fill("#l-city", data.city);
  await page.getByRole("dialog").getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText(data.name.toUpperCase())).toBeVisible();
}

test.describe("#113 Phase 2 — Datos habituales redesign", () => {
  test("Rutas tab: needs 2 places first, then create/favorite/edit/delete a saved route via the real UI", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/panel/datos");

    // The Rutas tab is disabled-to-create until 2 places exist (never a
    // dead-end select with nothing in it).
    await page.getByTestId("tab-shipment").click();
    await expect(page.getByText("Aún no tienes rutas habituales")).toBeVisible();
    await expect(page.getByText(/Necesitas al menos 2 lugares/)).toBeVisible();
    await expect(page.getByTestId("add-shipment")).toHaveCount(0);

    await page.getByTestId("tab-location").click();
    await addLocation(page, {
      name: "Fábrica Castellón",
      address: "Pol. Ind. 1",
      postalCode: "12004",
      city: "Castellón",
      type: "load",
    });
    await addLocation(page, {
      name: "Nave Sur",
      address: "Calle Sur 9",
      postalCode: "28002",
      city: "Madrid",
      type: "unload",
    });

    await page.getByTestId("tab-shipment").click();
    await expect(page.getByTestId("add-shipment")).toBeVisible();
    await page.getByTestId("add-shipment").click();
    await page.fill("#s-name", "Castellón → Madrid");
    await page
      .getByTestId("s-load-location")
      .selectOption({ label: "FÁBRICA CASTELLÓN — CASTELLÓN" });
    await page.getByTestId("s-unload-location").selectOption({ label: "NAVE SUR — MADRID" });
    await page.fill("#s-goods", "Azulejos");
    await page.fill("#s-weight", "8000 kg");
    await page.getByRole("dialog").getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByText("Castellón → Madrid")).toBeVisible();

    // favorite it
    await page
      .locator("li", { hasText: "Castellón → Madrid" })
      .getByTestId("favorite-star")
      .click();
    await expect(
      page.locator("li", { hasText: "Castellón → Madrid" }).getByTestId("favorite-star"),
    ).toHaveAttribute("aria-pressed", "true");

    // edit in place
    await page
      .locator("li", { hasText: "Castellón → Madrid" })
      .getByTestId("edit-shipment")
      .click();
    await page.fill("#s-weight", "9000 kg");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.locator("li", { hasText: "Castellón → Madrid" })).toContainText("9000 kg");

    // it appears in the wizard's own "usar ruta habitual" picker (Phase 1 integration)
    await page.goto("/crear");
    await page.fill("#shipperName", "Cargas del Turia SL");
    await page.fill("#shipperNif", "B96789011");
    await page.fill("#shipperAddress", "Av. del Puerto 120, Valencia");
    await page.fill("#carrierName", "Transportes Pérez SL");
    await page.fill("#carrierNif", "B12345674");
    await page.fill("#carrierAddress", "Pol. Ind. Fuente del Jarro, calle 5, Paterna");
    await page.getByTestId("wizard-next").click();
    await expect(
      page.getByTestId("autofill-shipment").locator("option", { hasText: "Castellón → Madrid" }),
    ).toHaveCount(1);

    // delete it
    await page.goto("/panel/datos");
    await page.getByTestId("tab-shipment").click();
    await page
      .locator("li", { hasText: "Castellón → Madrid" })
      .getByRole("button", { name: "Borrar" })
      .click();
    await expect(page.getByText("Castellón → Madrid")).toHaveCount(0);
  });

  // #133 — a SavedLocation still referenced by a SavedShipment is DB-level
  // RESTRICTed; deleting it must surface a clear message, never a silent
  // no-op or a raw error, and the location must survive the attempt.
  test("#133: deleting a location still used by a saved route shows a clear error, not a silent failure", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/panel/datos");
    await page.getByTestId("tab-location").click();
    await addLocation(page, {
      name: "Fábrica Castellón",
      address: "Pol. Ind. 1",
      postalCode: "12004",
      city: "Castellón",
      type: "load",
    });
    await addLocation(page, {
      name: "Nave Sur",
      address: "Calle Sur 9",
      postalCode: "28002",
      city: "Madrid",
      type: "unload",
    });

    await page.getByTestId("tab-shipment").click();
    await page.getByTestId("add-shipment").click();
    await page.fill("#s-name", "Castellón → Madrid");
    await page
      .getByTestId("s-load-location")
      .selectOption({ label: "FÁBRICA CASTELLÓN — CASTELLÓN" });
    await page.getByTestId("s-unload-location").selectOption({ label: "NAVE SUR — MADRID" });
    await page.getByRole("dialog").getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByText("Castellón → Madrid")).toBeVisible();

    // try to delete a location the route above still points to
    await page.getByTestId("tab-location").click();
    await page
      .locator("li", { hasText: "FÁBRICA CASTELLÓN" })
      .getByRole("button", { name: "Borrar" })
      .click();

    await expect(page.locator('p[role="alert"]')).toContainText(/en uso|ruta/i);
    await expect(page.getByText("FÁBRICA CASTELLÓN")).toBeVisible();

    // the OTHER (unreferenced) location still deletes normally
    await addLocation(page, {
      name: "Almacén Libre",
      address: "Calle Suelta 3",
      postalCode: "46001",
      city: "Valencia",
      type: "both",
    });
    await page
      .locator("li", { hasText: "ALMACÉN LIBRE" })
      .getByRole("button", { name: "Borrar" })
      .click();
    await expect(page.getByText("ALMACÉN LIBRE")).toHaveCount(0);
  });

  test("global search filters the active tab's list", async ({ page }) => {
    await register(page);
    await page.goto("/panel/datos");
    await page.getByTestId("tab-vehicle").click();
    await page.getByTestId("add-vehicle").click();
    await page.fill("#v-alias", "Camión Norte");
    await page.fill("#v-tractor", "1111 AAA");
    await page.getByRole("dialog").getByRole("button", { name: "Guardar" }).click();
    await page.getByTestId("add-vehicle").click();
    await page.fill("#v-alias", "Camión Sur");
    await page.fill("#v-tractor", "2222 BBB");
    await page.getByRole("dialog").getByRole("button", { name: "Guardar" }).click();
    await expect(page.locator("#panel-vehicle ul > li")).toHaveCount(2);

    await page.getByTestId("datos-search").fill("Norte");
    await expect(page.locator("#panel-vehicle ul > li")).toHaveCount(1);
    await expect(page.locator("#panel-vehicle")).toContainText("CAMIÓN NORTE");
    await expect(page.locator("#panel-vehicle")).not.toContainText("CAMIÓN SUR");

    await page.getByTestId("datos-search").fill("");
    await expect(page.locator("#panel-vehicle ul > li")).toHaveCount(2);
  });

  test("§13 duplicate detection: warns on a repeated plate but still allows saving anyway", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/panel/datos");
    await page.getByTestId("tab-vehicle").click();
    await page.getByTestId("add-vehicle").click();
    await page.fill("#v-tractor", "1234 BCD");
    await page.getByRole("dialog").getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByText("1234BCD")).toBeVisible();

    await page.getByTestId("add-vehicle").click();
    await page.fill("#v-tractor", "1234-bcd"); // same plate, different format/case
    await page.getByRole("dialog").getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByTestId("duplicate-warning-vehicle")).toBeVisible();

    await page.getByTestId("duplicate-save-anyway").click();
    await expect(page.locator("#panel-vehicle ul > li")).toHaveCount(2);
  });

  test("/panel/datos#rutas deep-link opens the Rutas tab directly, and the dashboard offers it as a quick action", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/panel/datos#rutas");
    await expect(page.getByTestId("tab-shipment")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Aún no tienes rutas habituales")).toBeVisible();

    await page.goto("/panel");
    await page.getByTestId("quick-actions-customise").click();
    await expect(page.getByText("Rutas habituales")).toBeVisible();
  });
});
