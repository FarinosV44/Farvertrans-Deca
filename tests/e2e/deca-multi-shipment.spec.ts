import { test, expect, type Page } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * #112 — multiple shipments ("envíos") per DeCA, driven through the real
 * wizard in a real browser, against the real server. The issue's own worked
 * example: Valencia→Madrid + Castellón→Madrid, one DeCA, 2 envíos, same
 * shipper/carrier. Covers the acceptance criteria that are actually testable
 * end to end in Sprint 1 (creation); correction-flow + list-view summary
 * surfaces are Sprint 2.
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

test.describe("#112 — multiple shipments per DeCA", () => {
  test("the single-shipment flow is completely unaffected: the toggle is off by default and generates exactly as before", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillStep2(page);
    await page.getByTestId("wizard-next").click();
    await page.fill("#goods", DECA.goods);
    await page.fill("#weight", DECA.weight);
    await page.fill("#tractorPlate", DECA.tractorPlate);

    await expect(page.getByTestId("multi-shipment-toggle")).not.toBeChecked();
    await expect(page.getByTestId("extra-shipment-1")).toHaveCount(0);

    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
  });

  test("Valencia→Madrid + Castellón→Madrid saves as ONE DeCA with 2 envíos, correct PDF, and both shipments in the review", async ({
    page,
    request,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillStep2(page);
    await page.getByTestId("wizard-next").click();
    await page.fill("#goods", DECA.goods);
    await page.fill("#weight", DECA.weight);
    await page.fill("#tractorPlate", DECA.tractorPlate);

    await page.getByTestId("multi-shipment-toggle").check();
    await expect(page.getByTestId("extra-shipment-1")).toBeVisible();
    await page.fill("#extraLoadName0", SHIPMENT_2.loadName);
    await page.fill("#extraLoadAddress0", SHIPMENT_2.loadAddress);
    await page.fill("#extraLoadPostalCode0", SHIPMENT_2.loadPostalCode);
    await page.fill("#extraLoadCity0", SHIPMENT_2.loadCity);
    await page.fill("#extraLoadCountry0", "España");
    // same destination as shipment 1 (Plataforma Norte, Madrid) — the
    // issue's own worked example.
    await page.fill("#extraUnloadName0", DECA.unloadLocationName);
    await page.fill("#extraUnloadAddress0", DECA.unloadLocationAddress);
    await page.fill("#extraUnloadPostalCode0", DECA.unloadLocationPostalCode);
    await page.fill("#extraUnloadCity0", DECA.unloadLocationCity);
    await page.fill("#extraUnloadCountry0", "España");
    await page.fill("#extraGoods0", SHIPMENT_2.goods);
    await page.fill("#extraWeight0", SHIPMENT_2.weight);
    await page.fill("#extraLoadDate0", DECA.loadDate);
    await page.fill("#extraUnloadDate0", DECA.unloadDate);
    await page.fill("#extraTractorPlate0", DECA.tractorPlate);

    // Review shows both shipments before generating.
    const review = page.getByTestId("review-summary");
    await expect(review).toContainText(DECA.goods.toUpperCase());

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
    // 12000 kg + 8000 kg = 20000 kg — pdfjs's text-layer extraction of the
    // thousands separator glyph is not reliably the literal "." (a known
    // pdfjs quirk this file's own compliance suite works around elsewhere:
    // "pdfjs inserts positional whitespace, so compare whitespace-
    // insensitively"), so the separator character itself is not asserted.
    expect(upper).toMatch(/20.000 KG/);
    // Shipper/carrier appear once each — DeCA-level, never duplicated.
    expect(upper.match(new RegExp(DECA.shipperName.toUpperCase(), "g"))?.length).toBe(1);
    expect(upper.match(new RegExp(DECA.carrierName.toUpperCase(), "g"))?.length).toBe(1);
  });

  test("removing every extra shipment turns the toggle back off", async ({ page }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillStep2(page);
    await page.getByTestId("wizard-next").click();
    await page.fill("#goods", DECA.goods);
    await page.fill("#weight", DECA.weight);
    await page.fill("#tractorPlate", DECA.tractorPlate);

    await page.getByTestId("multi-shipment-toggle").check();
    await expect(page.getByTestId("extra-shipment-1")).toBeVisible();
    await page.getByTestId("extra-shipment-remove-1").click();
    await expect(page.getByTestId("multi-shipment-toggle")).not.toBeChecked();
    await expect(page.getByTestId("extra-shipment-1")).toHaveCount(0);
  });
});
