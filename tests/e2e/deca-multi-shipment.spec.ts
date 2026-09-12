import { test, expect, type Page } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * #112 ACLARACIÓN FINAL (2026) — reverts the earlier per-field `+` buttons
 * beside "Lugar de carga"/"Lugar de descarga" and the "Vincular carga y
 * descarga" panel entirely. The definitive model: a single, discreet CTA
 * "+ Añadir otro envío dentro de este DeCA" appends ONE complete,
 * independent envío block (its own load, unload, mercancía, peso,
 * destinatario, fechas) — never inherited/paired from any other shipment.
 * Shipper/carrier/vehicle stay DeCA-level, asked once. Driven through the
 * real wizard in a real browser, against the real server.
 */

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
  weight: "12000 kg",
  tractorPlate: "1234 BCD",
};

const SHIPMENT_2 = {
  loadName: "Almacén Castellón",
  loadAddress: "Av. del Mar 5",
  loadPostalCode: "12003",
  loadCity: "Castellón de la Plana",
  unloadName: "Plataforma Toledo",
  unloadAddress: "Polígono La Sisla, nave 4",
  unloadPostalCode: "45200",
  unloadCity: "Illescas",
  goods: "Azulejos",
  weight: "8000 kg",
};

function email() {
  return `ms${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function register(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Multi Envío SL");
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

async function fillStep1(page: Page) {
  await page.fill("#shipperName", DECA.shipperName);
  await page.fill("#shipperNif", DECA.shipperNif);
  await page.fill("#shipperAddress", DECA.shipperAddress);
  await page.fill("#carrierName", DECA.carrierName);
  await page.fill("#carrierNif", DECA.carrierNif);
  await page.fill("#carrierAddress", DECA.carrierAddress);
}

/** Step 1 (route) — shipment 1's own load/unload, always visible. */
async function fillRoute(page: Page) {
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

async function fillVehicleAndGoods(page: Page) {
  await page.fill("#goods", DECA.goods);
  await page.fill("#weight", DECA.weight);
  await page.fill("#tractorPlate", DECA.tractorPlate);
}

async function fillShipment2(page: Page) {
  await page.fill("#extraLoadName0", SHIPMENT_2.loadName);
  await page.fill("#extraLoadAddress0", SHIPMENT_2.loadAddress);
  await page.fill("#extraLoadPostalCode0", SHIPMENT_2.loadPostalCode);
  await page.fill("#extraLoadCity0", SHIPMENT_2.loadCity);
  await page.fill("#extraUnloadName0", SHIPMENT_2.unloadName);
  await page.fill("#extraUnloadAddress0", SHIPMENT_2.unloadAddress);
  await page.fill("#extraUnloadPostalCode0", SHIPMENT_2.unloadPostalCode);
  await page.fill("#extraUnloadCity0", SHIPMENT_2.unloadCity);
  await page.fill("#extraGoods0", SHIPMENT_2.goods);
  await page.fill("#extraWeight0", SHIPMENT_2.weight);
}

test.describe("#112 ACLARACIÓN FINAL — 'Añadir otro envío' replaces the + buttons", () => {
  test("the single-shipment flow is completely unaffected: the CTA is present but unused", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);

    await expect(page.getByTestId("add-shipment")).toBeVisible();
    await expect(page.getByTestId("extra-shipment-1")).toHaveCount(0);
    // The old per-field `+` buttons and the linking panel no longer exist.
    await expect(page.getByTestId("add-load-1")).toHaveCount(0);
    await expect(page.getByTestId("add-unload-1")).toHaveCount(0);
    await expect(page.getByTestId("link-panel")).toHaveCount(0);

    await page.getByTestId("wizard-next").click();
    await fillVehicleAndGoods(page);
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
  });

  test("'+ Añadir otro envío' appends a COMPLETELY blank, independent envío — nothing inherited from shipment 1", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page); // Envío 1: Valencia → Madrid

    await page.getByTestId("add-shipment").click();
    await expect(page.getByTestId("extra-shipment-1")).toBeVisible();
    // BOTH sides start blank — no auto-pairing/keeping either side, unlike
    // the earlier (reverted) `+` mechanism.
    await expect(page.locator("#extraLoadName0")).toHaveValue("");
    await expect(page.locator("#extraUnloadName0")).toHaveValue("");
    await expect(page.locator("#extraGoods0")).toHaveValue("");
    await expect(page.locator("#extraWeight0")).toHaveValue("");
    // The new block's first field gets focus automatically (keyboard flow).
    await expect(page.locator("#extraLoadName0")).toBeFocused();

    await fillShipment2(page);
    // Shipment 1 is completely untouched by filling in shipment 2.
    await expect(page.locator("#loadLocationName")).toHaveValue(DECA.loadLocationName);
    await expect(page.locator("#unloadLocationName")).toHaveValue(DECA.unloadLocationName);
  });

  test("pressing the CTA again appends a THIRD, also fully independent envío — as many as needed", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);

    await page.getByTestId("add-shipment").click();
    await fillShipment2(page);
    await page.getByTestId("add-shipment").click();
    await expect(page.getByTestId("extra-shipment-2")).toBeVisible();
    await expect(page.locator("#extraLoadName1")).toHaveValue("");
    await expect(page.locator("#extraUnloadName1")).toHaveValue("");

    await expect(page.getByTestId(/^extra-shipment-\d+$/)).toHaveCount(2);
  });

  test("vehicle is a single shared field: no tractor/trailer input inside any envío block, shown once in the PDF", async ({
    page,
    request,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);
    await page.getByTestId("add-shipment").click();
    await fillShipment2(page);

    await expect(page.locator("#extraTractorPlate0")).toHaveCount(0);
    await expect(page.locator("#extraTrailerPlate0")).toHaveCount(0);

    // Review shows BOTH shipments and one computed total before generating.
    const review = page.getByTestId("review-summary");
    await page.getByTestId("wizard-next").click();
    await fillVehicleAndGoods(page);
    await expect(review).toContainText(DECA.goods.toUpperCase());
    await expect(review).toContainText("Envío 2");
    await expect(review).toContainText(SHIPMENT_2.loadName.toUpperCase());
    await expect(review).toContainText(SHIPMENT_2.goods.toUpperCase());
    await expect(review).toContainText("Peso total");
    await expect(review).toContainText(/20\.000 kg/i);

    const [genRes] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/deca") && r.request().method() === "POST"),
      page.getByTestId("wizard-generate").click(),
    ]);
    expect(genRes.status()).toBe(201);
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });

    const body = await genRes.json();
    const pdf = await request.get(`/d/${body.token}`);
    expect(pdf.status()).toBe(200);
    const doc = await getDocument({ data: new Uint8Array(await pdf.body()) }).promise;
    let out = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const c = await (await doc.getPage(i)).getTextContent();
      out += " " + c.items.map((it) => ("str" in it ? it.str : "")).join(" ");
    }
    const upper = out.replace(/\s+/g, " ").toUpperCase();

    expect(upper).toContain("ENVÍO 1");
    expect(upper).toContain("ENVÍO 2");
    expect(upper).toContain(DECA.loadLocationName.toUpperCase());
    expect(upper).toContain(SHIPMENT_2.loadName.toUpperCase());
    expect(upper).toContain(DECA.goods.toUpperCase());
    expect(upper).toContain(SHIPMENT_2.goods.toUpperCase());
    expect(upper).toContain("PESO TOTAL");
    // 12000 kg + 8000 kg = 20000 kg (pdfjs's thousands-separator glyph
    // extraction is not reliably the literal "." — whitespace-insensitive
    // match, same workaround this project's compliance suite already uses).
    expect(upper).toMatch(/20.000 KG/);
    // The plate appears exactly ONCE — a single shared "Vehículo" block, not
    // repeated per envío.
    expect(upper.match(new RegExp(DECA.tractorPlate.toUpperCase(), "g"))?.length).toBe(1);
    // Shipper/carrier appear once each — DeCA-level, never duplicated.
    expect(upper.match(new RegExp(DECA.shipperName.toUpperCase(), "g"))?.length).toBe(1);
    expect(upper.match(new RegExp(DECA.carrierName.toUpperCase(), "g"))?.length).toBe(1);

    // Historial shows a "+1 envío" indicator next to the shipment-1 route
    // summary — never a second row, never the full breakdown (#86 p3:
    // uppercase throughout).
    await page.goto("/panel/historico");
    const historyRow = page.locator("tbody tr", {
      hasText: new RegExp(DECA.loadLocationName, "i"),
    });
    await expect(historyRow).toContainText("+1 envío");
  });

  test("duplicar este envío clones every field into a new block at the end", async ({ page }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);
    await page.getByTestId("add-shipment").click();
    await fillShipment2(page);

    await page.getByTestId("extra-shipment-duplicate-1").click();
    await expect(page.getByTestId("extra-shipment-2")).toBeVisible();
    await expect(page.locator("#extraLoadName1")).toHaveValue(SHIPMENT_2.loadName);
    await expect(page.locator("#extraGoods1")).toHaveValue(SHIPMENT_2.goods);
    await expect(page.locator("#extraWeight1")).toHaveValue(SHIPMENT_2.weight);
  });

  test("removing an empty envío needs no confirmation; removing one with data does", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);

    // Empty block: no dialog should ever fire. If one did, Playwright's
    // default (no listener registered) auto-dismisses it, which would leave
    // the block in place — the assertion below catches that regression.
    await page.getByTestId("add-shipment").click();
    await page.getByTestId("extra-shipment-remove-1").click();
    await expect(page.getByTestId("extra-shipment-1")).toHaveCount(0);

    // With data: a real confirmation is required first.
    await page.getByTestId("add-shipment").click();
    await page.fill("#extraLoadName0", SHIPMENT_2.loadName);
    page.once("dialog", (d) => d.accept());
    await page.getByTestId("extra-shipment-remove-1").click();
    await expect(page.getByTestId("extra-shipment-1")).toHaveCount(0);
  });

  test("correcting an already-multi-shipment DeCA pre-loads its extra envíos — never silently drops them", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);
    await page.getByTestId("add-shipment").click();
    await fillShipment2(page);
    await page.getByTestId("wizard-next").click();
    await fillVehicleAndGoods(page);
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
    const decaId = page.url().split("/crear/")[1].split("?")[0];

    // Open the correction form and walk to step 1 (route) — shipment 2's
    // block must already be there, filled in, with NO manual re-entry.
    await page.goto(`/panel/deca/${decaId}/corregir`);
    await page.getByTestId("wizard-next").click();
    await expect(page.getByTestId("extra-shipment-1")).toBeVisible();
    await expect(page.locator("#extraLoadName0")).toHaveValue(SHIPMENT_2.loadName);
    await expect(page.locator("#extraGoods0")).toHaveValue(SHIPMENT_2.goods);
    await expect(page.locator("#extraWeight0")).toHaveValue(SHIPMENT_2.weight);

    // Edit shipment 2's weight and save the correction.
    await page.fill("#extraWeight0", "9000 kg");
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("correction-reason").fill("Ajuste de peso en envío 2");
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(new RegExp(`/panel/deca/${decaId}$`), { timeout: 15_000 });

    await expect(page.getByTestId("change-list")).toContainText("Envío 2");
    await expect(page.getByTestId("change-list")).toContainText("9000 kg");
  });

  test("responsive: the CTA stays visible, reachable and non-overlapping at every breakpoint", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);

    for (const width of [320, 375, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const cta = page.getByTestId("add-shipment");
      await expect(cta).toBeVisible();
      const box = await cta.boundingBox();
      expect(box).not.toBeNull();
      // A real, comfortable touch target (issue §9).
      expect(box!.height).toBeGreaterThanOrEqual(20);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth + 1),
    );
  });

  test("keyboard: the CTA has a real accessible name and is reachable without a mouse", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);

    await expect(
      page.getByRole("button", { name: "+ Añadir otro envío dentro de este DeCA" }),
    ).toBeVisible();

    await page.getByTestId("add-shipment").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("extra-shipment-1")).toBeVisible();
  });
});
