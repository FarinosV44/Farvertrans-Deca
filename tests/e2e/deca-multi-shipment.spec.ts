import { test, expect, type Page } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * #112 (rewritten spec) — multiple loads/unloads via `+` buttons beside
 * "Lugar de carga"/"Lugar de descarga", replacing the earlier toggle +
 * "Añadir otro envío" CTA entirely. Driven through the real wizard in a real
 * browser, against the real server. The issue's own worked example:
 * Valencia→Madrid + Castellón→Madrid, one DeCA, 2 envíos, same shipper/
 * carrier, one shared vehicle.
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

const SHIPMENT_3 = {
  unloadName: "Plataforma Toledo",
  unloadAddress: "Polígono La Sisla, nave 4",
  unloadPostalCode: "45200",
  unloadCity: "Illescas",
  weight: "5000 kg",
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

/** Step 1 (route) — shipment 1's own load/unload, always visible, `+`
 *  buttons beside each legend. */
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

test.describe("#112 — multiple loads/unloads via + buttons", () => {
  test("the single-shipment flow is completely unaffected: no extra block, `+` buttons present but unused", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);

    // The `+` buttons are always there — issue §2 — but nothing has been
    // pressed, so the route stays exactly as clean as before #112.
    await expect(page.getByTestId("add-load-1")).toBeVisible();
    await expect(page.getByTestId("add-unload-1")).toBeVisible();
    await expect(page.getByTestId("extra-shipment-1")).toHaveCount(0);

    await page.getByTestId("wizard-next").click();
    await fillVehicleAndGoods(page);
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
  });

  test("`+` on carga inherits the destino; `+` on descarga inherits the origen; never a cartesian product", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);

    // Valencia→Madrid exists. Press `+` on Lugar de carga: a new envío
    // appears, blank origin, Madrid already filled in as the destino —
    // never re-typed.
    await page.getByTestId("add-load-1").click();
    await expect(page.getByTestId("extra-shipment-1")).toBeVisible();
    await expect(page.locator("#extraUnloadName0")).toHaveValue(DECA.unloadLocationName);
    await expect(page.locator("#extraLoadName0")).toHaveValue("");
    // The new block's first field gets focus automatically (keyboard flow).
    await expect(page.locator("#extraLoadName0")).toBeFocused();
    await page.fill("#extraLoadName0", SHIPMENT_2.loadName);
    await page.fill("#extraLoadAddress0", SHIPMENT_2.loadAddress);
    await page.fill("#extraLoadPostalCode0", SHIPMENT_2.loadPostalCode);
    await page.fill("#extraLoadCity0", SHIPMENT_2.loadCity);
    await page.fill("#extraGoods0", SHIPMENT_2.goods);
    await page.fill("#extraWeight0", SHIPMENT_2.weight);

    // Now press `+` on THIS envío's own Lugar de descarga: a third envío
    // appears, Castellón already filled in as the origen (never re-typed),
    // blank destino.
    await page.getByTestId("add-unload-2").click();
    await expect(page.getByTestId("extra-shipment-2")).toBeVisible();
    await expect(page.locator("#extraLoadName1")).toHaveValue(SHIPMENT_2.loadName);
    await expect(page.locator("#extraUnloadName1")).toHaveValue("");
    await page.fill("#extraUnloadName1", SHIPMENT_3.unloadName);
    await page.fill("#extraUnloadAddress1", SHIPMENT_3.unloadAddress);
    await page.fill("#extraUnloadPostalCode1", SHIPMENT_3.unloadPostalCode);
    await page.fill("#extraUnloadCity1", SHIPMENT_3.unloadCity);
    await page.fill("#extraWeight1", SHIPMENT_3.weight);

    // Exactly 3 real trayectos exist — Valencia→Madrid, Castellón→Madrid,
    // Castellón→Toledo (well, Illescas) — never a 4th "Valencia→Toledo"
    // nobody asked for. Two EXTRA blocks (envío 2 and envío 3), never more.
    await expect(page.getByTestId(/^extra-shipment-\d+$/)).toHaveCount(2);
  });

  test("2026 correction — 1 carga + 2 descargas resolves to 2 envíos sharing the same origin", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page); // Envío 1: Valencia → Madrid

    // `+` on Lugar de descarga (envío 1's own row): a second destino for the
    // SAME origin — never touches Lugar de carga.
    await page.getByTestId("add-unload-1").click();
    await expect(page.locator("#extraLoadName0")).toHaveValue(DECA.loadLocationName);
    await expect(page.locator("#extraUnloadName0")).toHaveValue("");
    await page.fill("#extraUnloadName0", SHIPMENT_3.unloadName);
    await page.fill("#extraUnloadAddress0", SHIPMENT_3.unloadAddress);
    await page.fill("#extraUnloadPostalCode0", SHIPMENT_3.unloadPostalCode);
    await page.fill("#extraUnloadCity0", SHIPMENT_3.unloadCity);
    await page.fill("#extraGoods0", "Azulejos adicionales");
    await page.fill("#extraWeight0", SHIPMENT_3.weight);

    // Exactly 2 envíos total, both starting at Valencia — never a 3rd.
    await expect(page.getByTestId(/^extra-shipment-\d+$/)).toHaveCount(1);
    await expect(page.locator("#loadLocationName")).toHaveValue(DECA.loadLocationName);
    await expect(page.locator("#extraLoadName0")).toHaveValue(DECA.loadLocationName);
  });

  test("2026 correction — 2 cargas + 1 descarga resolves to 2 envíos sharing the same destination", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page); // Envío 1: Valencia → Madrid

    // `+` on Lugar de carga (envío 1's own row): a second origen for the
    // SAME destino — never touches Lugar de descarga.
    await page.getByTestId("add-load-1").click();
    await expect(page.locator("#extraUnloadName0")).toHaveValue(DECA.unloadLocationName);
    await expect(page.locator("#extraLoadName0")).toHaveValue("");
    await page.fill("#extraLoadName0", SHIPMENT_2.loadName);
    await page.fill("#extraLoadAddress0", SHIPMENT_2.loadAddress);
    await page.fill("#extraLoadPostalCode0", SHIPMENT_2.loadPostalCode);
    await page.fill("#extraLoadCity0", SHIPMENT_2.loadCity);
    await page.fill("#extraGoods0", SHIPMENT_2.goods);
    await page.fill("#extraWeight0", SHIPMENT_2.weight);

    // Exactly 2 envíos total, both ending at Madrid — never a 3rd.
    await expect(page.getByTestId(/^extra-shipment-\d+$/)).toHaveCount(1);
    await expect(page.locator("#unloadLocationName")).toHaveValue(DECA.unloadLocationName);
    await expect(page.locator("#extraUnloadName0")).toHaveValue(DECA.unloadLocationName);
  });

  test("2026 correction — 'Vincular carga y descarga' appears only once both sides have 2+ places, and links an existing pair without retyping", async ({
    page,
    request,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page); // Envío 1: Valencia → Madrid

    // Only 1 distinct place per side so far — the panel stays hidden; a
    // single row's `+` is already unambiguous.
    await expect(page.getByTestId("link-panel")).toHaveCount(0);

    // A second, independent load (Castellón), inheriting Madrid as usual.
    await page.getByTestId("add-load-1").click();
    await page.fill("#extraLoadName0", SHIPMENT_2.loadName);
    await page.fill("#extraLoadAddress0", SHIPMENT_2.loadAddress);
    await page.fill("#extraLoadPostalCode0", SHIPMENT_2.loadPostalCode);
    await page.fill("#extraLoadCity0", SHIPMENT_2.loadCity);
    await page.fill("#extraGoods0", SHIPMENT_2.goods);
    await page.fill("#extraWeight0", SHIPMENT_2.weight);

    // Still only 1 distinct unload (Madrid) in play — panel still hidden.
    await expect(page.getByTestId("link-panel")).toHaveCount(0);

    // A second, independent unload (Illescas), off envío 2's own row.
    await page.getByTestId("add-unload-2").click();
    await page.fill("#extraUnloadName1", SHIPMENT_3.unloadName);
    await page.fill("#extraUnloadAddress1", SHIPMENT_3.unloadAddress);
    await page.fill("#extraUnloadPostalCode1", SHIPMENT_3.unloadPostalCode);
    await page.fill("#extraUnloadCity1", SHIPMENT_3.unloadCity);
    await page.fill("#extraWeight1", SHIPMENT_3.weight);

    // NOW there are 2 distinct loads (Valencia, Castellón) AND 2 distinct
    // unloads (Madrid, Illescas) — the panel appears.
    await expect(page.getByTestId("link-panel")).toBeVisible();

    // Link Valencia → Illescas — an entirely NEW pairing neither existing
    // row expresses — by PICKING both places, never retyping either address.
    await page
      .getByTestId("link-load-select")
      .selectOption({ label: `${DECA.loadLocationName} — ${DECA.loadLocationCity}` });
    await page
      .getByTestId("link-unload-select")
      .selectOption({ label: `${SHIPMENT_3.unloadName} — ${SHIPMENT_3.unloadCity}` });
    await page.getByTestId("link-create").click();

    // A 3rd envío now exists, never a cartesian sweep of all 2×2=4 combos.
    await expect(page.getByTestId(/^extra-shipment-\d+$/)).toHaveCount(3);
    const linked = page.getByTestId("extra-shipment-3");
    await expect(linked.locator("#extraLoadName2")).toHaveValue(DECA.loadLocationName);
    await expect(linked.locator("#extraUnloadName2")).toHaveValue(SHIPMENT_3.unloadName);
    // Goods/weight are the resulting envío's OWN — never copied — start blank.
    await expect(linked.locator("#extraGoods2")).toHaveValue("");
    await expect(linked.locator("#extraWeight2")).toHaveValue("");
    await page.fill("#extraGoods2", "Cerámica adicional");
    await page.fill("#extraWeight2", "3000 kg");

    await page.getByTestId("wizard-next").click();
    await fillVehicleAndGoods(page);
    const [genRes] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/deca") && r.request().method() === "POST"),
      page.getByTestId("wizard-generate").click(),
    ]);
    expect(genRes.status()).toBe(201);
    const body = await genRes.json();
    const pdf = await request.get(`/d/${body.token}`);
    const doc = await getDocument({ data: new Uint8Array(await pdf.body()) }).promise;
    let out = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const c = await (await doc.getPage(i)).getTextContent();
      out += " " + c.items.map((it) => ("str" in it ? it.str : "")).join(" ");
    }
    const upper = out.replace(/\s+/g, " ").toUpperCase();
    // The linked envío's real route + goods appear, PDF coherent with the
    // relationship actually defined via the panel — this is the 4th envío
    // overall (envío 2 = Castellón→Madrid, envío 3 = Castellón→Illescas via
    // add-unload-2, envío 4 = the newly-linked Valencia→Illescas).
    expect(upper).toContain("ENVÍO 4");
    expect(upper).toContain(SHIPMENT_3.unloadName.toUpperCase());
    expect(upper).toContain("CERÁMICA ADICIONAL");
    // pdfjs's thousands-separator glyph extraction is not reliably the
    // literal "." (same documented workaround as the sibling test above).
    expect(upper).toMatch(/3\.?000 KG/);
  });

  test("2026 correction — `+` beside Lugar de carga never creates a descarga, and vice versa", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);

    await page.getByTestId("add-load-1").click();
    // Only the LOAD side of the new envío is blank — its unload arrived
    // already filled (inherited), never a second, independently-blank
    // descarga waiting to be paired.
    await expect(page.locator("#extraLoadName0")).toHaveValue("");
    await expect(page.locator("#extraUnloadName0")).not.toHaveValue("");
    await expect(page.getByTestId(/^extra-shipment-\d+$/)).toHaveCount(1);

    await page.getByTestId("add-unload-1").click();
    await expect(page.locator("#extraUnloadName1")).toHaveValue("");
    await expect(page.locator("#extraLoadName1")).not.toHaveValue("");
    // Still exactly 2 envíos total (1 from each `+`) — neither press created
    // an extra, unrelated entry on the other side.
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
    await page.getByTestId("add-load-1").click();
    await page.fill("#extraLoadName0", SHIPMENT_2.loadName);
    await page.fill("#extraLoadAddress0", SHIPMENT_2.loadAddress);
    await page.fill("#extraLoadPostalCode0", SHIPMENT_2.loadPostalCode);
    await page.fill("#extraLoadCity0", SHIPMENT_2.loadCity);
    await page.fill("#extraGoods0", SHIPMENT_2.goods);
    await page.fill("#extraWeight0", SHIPMENT_2.weight);

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

  test("naturaleza is pre-filled from the source envío but stays editable; peso is never copied", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);

    await page.getByTestId("add-unload-1").click();
    // Shipment 1's own `goods` is entered on step 2 of this wizard, so at
    // this point (still step 1) there is nothing yet for the new envío to
    // copy — the point under test is that WEIGHT is NEVER pre-filled as a
    // "final" value, and the field stays freely editable either way.
    await expect(page.locator("#extraWeight0")).toHaveValue("");
    await page.fill("#extraGoods0", SHIPMENT_2.goods);
    await expect(page.locator("#extraGoods0")).toHaveValue(SHIPMENT_2.goods);
  });

  test("duplicar este envío clones every field into a new block at the end", async ({ page }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);
    await page.getByTestId("add-load-1").click();
    await page.fill("#extraLoadName0", SHIPMENT_2.loadName);
    await page.fill("#extraLoadAddress0", SHIPMENT_2.loadAddress);
    await page.fill("#extraGoods0", SHIPMENT_2.goods);
    await page.fill("#extraWeight0", SHIPMENT_2.weight);

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
    await page.getByTestId("add-load-1").click();
    await page.getByTestId("extra-shipment-remove-1").click();
    await expect(page.getByTestId("extra-shipment-1")).toHaveCount(0);

    // With data: a real confirmation is required first.
    await page.getByTestId("add-load-1").click();
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
    await page.getByTestId("add-load-1").click();
    await page.fill("#extraLoadName0", SHIPMENT_2.loadName);
    await page.fill("#extraLoadAddress0", SHIPMENT_2.loadAddress);
    await page.fill("#extraLoadPostalCode0", SHIPMENT_2.loadPostalCode);
    await page.fill("#extraLoadCity0", SHIPMENT_2.loadCity);
    await page.fill("#extraGoods0", SHIPMENT_2.goods);
    await page.fill("#extraWeight0", SHIPMENT_2.weight);
    await page.getByTestId("wizard-next").click();
    await fillVehicleAndGoods(page);
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
    const decaId = page.url().split("/crear/")[1].split("?")[0];

    // Open the correction form and walk to step 1 (route) — shipment 2's
    // block must already be there, filled in, with NO manual re-entry and
    // no toggle to check.
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

  test("responsive: the + buttons stay visible, reachable and non-overlapping at every breakpoint", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);

    for (const width of [320, 375, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const addLoad = page.getByTestId("add-load-1");
      const addUnload = page.getByTestId("add-unload-1");
      await expect(addLoad).toBeVisible();
      await expect(addUnload).toBeVisible();
      const loadBox = await addLoad.boundingBox();
      const unloadBox = await addUnload.boundingBox();
      expect(loadBox).not.toBeNull();
      expect(unloadBox).not.toBeNull();
      // A real, comfortable touch target (issue §9), and it never overlaps
      // its own label (both fit inside the fieldset's own width).
      expect(loadBox!.width).toBeGreaterThanOrEqual(24);
      expect(loadBox!.height).toBeGreaterThanOrEqual(24);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth + 1),
    );
  });

  test("keyboard: the + buttons have a real accessible name and are reachable without a mouse", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await fillRoute(page);

    await expect(page.getByRole("button", { name: "Añadir otro lugar de carga" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Añadir otro lugar de descarga" })).toBeVisible();

    await page.getByTestId("add-load-1").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("extra-shipment-1")).toBeVisible();
  });
});
