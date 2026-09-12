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

  // #112: no toggle — pressing "+" beside "Lugar de carga" adds a second
  // envío that keeps shipment 1's unload side (Madrid) automatically.
  await page.getByTestId("add-load-1").click();
  await page.fill("#extraLoadName0", "Almacén Castellón");
  await page.fill("#extraLoadAddress0", "Av. del Mar 5");
  await page.fill("#extraLoadPostalCode0", "12003");
  await page.fill("#extraLoadCity0", "Castellón de la Plana");
  await page.fill("#extraGoods0", "Azulejos");
  await page.fill("#extraWeight0", "8000 kg");

  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", "Palés de cerámica");
  await page.fill("#weight", "12000 kg");
  await page.fill("#tractorPlate", "1234 BCD");

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

  // #131 — 2026 mobile UX follow-up: Inspección visible directly (not hidden
  // in "···"), filters/results never overlap, no horizontal scroll at any of
  // the 4 widths the issue names.
  for (const width of [320, 375, 390, 430]) {
    test(`#131 mobile at ${width}px: Inspección is direct, Corregir/Duplicar/PDF stay in "···", no overlap or horizontal scroll`, async ({
      page,
    }) => {
      await register(page);
      await createMultiShipmentDeca(page);

      await page.setViewportSize({ width, height: 800 });
      await page.goto("/panel/historico");

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);

      const cards = page.getByTestId("historico-cards");
      await expect(cards).toBeVisible();
      const card = cards.locator("li").first();

      // The 3 high-value actions are direct links/buttons on the card itself.
      await expect(card.getByRole("link", { name: "Ver detalle" })).toBeVisible();
      await expect(card.getByRole("link", { name: "Inspección" })).toBeVisible();
      await expect(card.getByTestId("row-share")).toBeVisible();

      // Corregir/Duplicar/PDF are NOT visible until the "···" menu opens.
      await expect(card.getByRole("link", { name: "Corregir" })).toBeHidden();
      await card.getByTestId("row-menu-trigger").click();
      const menu = page.getByTestId("row-menu").first();
      await expect(menu.getByRole("menuitem", { name: "Corregir" })).toBeVisible();
      await expect(menu.getByRole("menuitem", { name: "Duplicar" })).toBeVisible();
      await expect(menu.getByRole("menuitem", { name: "PDF" })).toBeVisible();
      // Inspección is never duplicated inside the menu.
      await expect(menu.getByRole("menuitem", { name: "Inspección" })).toHaveCount(0);
      await page.keyboard.press("Escape");

      // No two action elements in the card visually overlap (a real bounding-
      // box check, not just "no page-level horizontal scroll").
      const actionBoxes = await card
        .locator("a, button")
        .evaluateAll((els) =>
          els
            .map((el) => el.getBoundingClientRect())
            .map((r) => ({ x: r.x, y: r.y, w: r.width, h: r.height })),
        );
      for (let i = 0; i < actionBoxes.length; i++) {
        for (let j = i + 1; j < actionBoxes.length; j++) {
          const a = actionBoxes[i];
          const b = actionBoxes[j];
          const overlapsX = a.x < b.x + b.w && b.x < a.x + a.w;
          const overlapsY = a.y < b.y + b.h && b.y < a.y + a.h;
          expect(overlapsX && overlapsY, `elements ${i} and ${j} overlap at ${width}px`).toBe(
            false,
          );
        }
      }
    });

    test(`#131 filter fields at ${width}px: Buscar/Desde/Hasta/Transportista/Matrícula/Filtrar never overlap`, async ({
      page,
    }) => {
      await register(page);
      await createMultiShipmentDeca(page);

      await page.setViewportSize({ width, height: 800 });
      await page.goto("/panel/historico");

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);

      const fieldIds = ["#q", "#from", "#to", "#carrier", "#plate"];
      const boxes: { id: string; x: number; y: number; w: number; h: number }[] = [];
      for (const id of fieldIds) {
        const locator = page.locator(id);
        if ((await locator.count()) === 0) continue;
        const box = await locator.boundingBox();
        if (box) boxes.push({ id, x: box.x, y: box.y, w: box.width, h: box.height });
      }
      const filterBtn = await page.getByRole("button", { name: "Filtrar" }).boundingBox();
      if (filterBtn) {
        boxes.push({
          id: "#filter-btn",
          x: filterBtn.x,
          y: filterBtn.y,
          w: filterBtn.width,
          h: filterBtn.height,
        });
      }

      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i];
          const b = boxes[j];
          const overlapsX = a.x < b.x + b.w && b.x < a.x + a.w;
          const overlapsY = a.y < b.y + b.h && b.y < a.y + a.h;
          expect(overlapsX && overlapsY, `${a.id} and ${b.id} overlap at ${width}px`).toBe(false);
        }
      }
    });
  }
});
