import { test, expect, type Page } from "@playwright/test";

/**
 * #114 — Historial visual redesign: multi-envío route summary, the new "···"
 * overflow menu (mouse + keyboard), the filtered empty state, and mobile
 * cards with no horizontal scroll. Filter LOGIC itself is untouched — the
 * existing filter e2e coverage (elsewhere) is the regression guard for that.
 */

function email() {
  return `hr${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function register(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Historico Redesign SL");
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

async function createMultiShipmentDeca(page: Page) {
  await page.goto("/crear");
  await page.fill("#shipperName", "Cargas del Turia SL");
  await page.fill("#shipperNif", "B96789011");
  await page.fill("#shipperAddress", "Av. del Puerto 120, Valencia");
  await page.fill("#carrierName", "Transportes Pérez SL");
  await page.fill("#carrierNif", "B12345674");
  await page.fill("#carrierAddress", "Pol. Ind. Fuente del Jarro, calle 5, Paterna");
  await page.getByTestId("wizard-next").click();

  await page.fill("#loadLocationName", "Almacén Turia");
  await page.fill("#loadLocationAddress", "Av. del Puerto 120");
  await page.fill("#loadLocationPostalCode", "46023");
  await page.fill("#loadLocationCity", "Valencia");
  await page.fill("#loadDate", "2026-10-06");
  await page.fill("#unloadLocationName", "Plataforma Norte");
  await page.fill("#unloadLocationAddress", "Calle Alcalá 200");
  await page.fill("#unloadLocationPostalCode", "28028");
  await page.fill("#unloadLocationCity", "Madrid");
  await page.fill("#unloadDate", "2026-10-06");
  await page.getByTestId("wizard-next").click();

  await page.fill("#goods", "Palés de cerámica");
  await page.fill("#weight", "12000 kg");
  await page.fill("#tractorPlate", "1234 BCD");

  await page.getByTestId("multi-shipment-toggle").check();
  await page.fill("#extraLoadName0", "Almacén Castellón");
  await page.fill("#extraLoadAddress0", "Av. del Mar 5");
  await page.fill("#extraLoadPostalCode0", "12003");
  await page.fill("#extraLoadCity0", "Castellón de la Plana");
  await page.fill("#extraUnloadName0", "Plataforma Norte");
  await page.fill("#extraUnloadAddress0", "Calle Alcalá 200");
  await page.fill("#extraUnloadPostalCode0", "28028");
  await page.fill("#extraUnloadCity0", "Madrid");
  await page.fill("#extraGoods0", "Azulejos");
  await page.fill("#extraWeight0", "8000 kg");
  await page.fill("#extraLoadDate0", "2026-10-06");
  await page.fill("#extraUnloadDate0", "2026-10-06");
  await page.fill("#extraTractorPlate0", "1234 BCD");

  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
}

test.describe("#114 — Historial redesign", () => {
  test("a multi-envío DeCA shows its extra route + the badge in the redesigned row", async ({
    page,
  }) => {
    await register(page);
    await createMultiShipmentDeca(page);

    await page.goto("/panel/historico");
    const row = page.getByTestId("historico-table").locator("tr", { hasText: "ALMACÉN TURIA" });
    await expect(row).toContainText("+1 envío");
    await expect(row).toContainText("ALMACÉN CASTELLÓN");
  });

  test("the '···' menu opens/closes via mouse and keyboard, and exposes Corregir/Duplicar/PDF", async ({
    page,
  }) => {
    await register(page);
    await createMultiShipmentDeca(page);
    await page.goto("/panel/historico");

    const trigger = page.getByTestId("historico-table").getByTestId("row-menu-trigger").first();
    await trigger.click();
    const menu = page.getByTestId("row-menu").first();
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Corregir" })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Duplicar" })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "PDF" })).toBeVisible();

    // Escape closes it and returns focus to the trigger (#114 §13 a11y)
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();

    // keyboard-operable: Tab to the trigger, Enter opens it
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("row-menu").first()).toBeVisible();
  });

  test("filtered empty state offers 'Limpiar filtros', which actually clears the filters", async ({
    page,
  }) => {
    await register(page);
    await createMultiShipmentDeca(page);

    await page.goto("/panel/historico?plate=0000ZZZ");
    await expect(page.getByText("No se han encontrado DeCA")).toBeVisible();
    await page.getByRole("link", { name: "Limpiar filtros" }).click();
    await expect(page).toHaveURL(/\/panel\/historico$/);
    await expect(page.getByTestId("historico-table")).toContainText("ALMACÉN TURIA");
  });

  test("mobile: cards show the same actions with no horizontal scroll", async ({ page }) => {
    await register(page);
    await createMultiShipmentDeca(page);

    await page.setViewportSize({ width: 375, height: 740 });
    await page.goto("/panel/historico");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    const cards = page.getByTestId("historico-cards");
    await expect(cards).toBeVisible();
    await expect(page.getByTestId("historico-table")).toBeHidden();
    await expect(cards).toContainText("+1 envío");
    await expect(cards.getByRole("link", { name: "Ver detalle" }).first()).toBeVisible();
    await cards.getByTestId("row-menu-trigger").first().click();
    await expect(page.getByTestId("row-menu").first()).toContainText("Corregir");
  });
});
