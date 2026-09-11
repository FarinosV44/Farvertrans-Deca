import { test, expect, type Page } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * #113 Phase 1 — "Ruta/envío habitual": a saved single leg (two existing
 * SavedLocation rows + optional goods/weight/recipient) that fills an ENVÍO N
 * block in the wizard in one action, and can be saved back inline from the
 * wizard itself (§11). Driven through the real wizard against the real
 * server + DB, mirroring `deca-multi-shipment.spec.ts`'s pattern.
 */

function email() {
  return `ss${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function register(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Rutas Habituales SL");
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

async function createSavedLocation(page: Page, data: Record<string, string>) {
  const res = await page.request.post("/api/saved/location", { data });
  expect(res.ok()).toBe(true);
  const body = await res.json();
  return body.item.id as string;
}

test.describe("#113 Phase 1 — ruta/envío habitual", () => {
  test("picking a saved route fills shipment 1 and produces a correct PDF", async ({
    page,
    request,
  }) => {
    await register(page);
    const loadId = await createSavedLocation(page, {
      name: "Almacén Turia",
      address: "Av. del Puerto 120",
      postalCode: "46023",
      city: "Valencia",
      country: "España",
      type: "load",
    });
    const unloadId = await createSavedLocation(page, {
      name: "Plataforma Norte",
      address: "Calle Alcalá 200",
      postalCode: "28028",
      city: "Madrid",
      country: "España",
      type: "unload",
    });
    const shipRes = await page.request.post("/api/saved-shipments", {
      data: {
        name: "Valencia → Madrid",
        loadLocationId: loadId,
        unloadLocationId: unloadId,
        goods: "Palés de cerámica",
        weight: "12000 kg",
      },
    });
    expect(shipRes.ok()).toBe(true);

    await page.goto("/crear");
    await page.fill("#shipperName", "Cargas del Turia SL");
    await page.fill("#shipperNif", "B96789011");
    await page.fill("#shipperAddress", "Av. del Puerto 120, Valencia");
    await page.fill("#carrierName", "Transportes Pérez SL");
    await page.fill("#carrierNif", "B12345674");
    await page.fill("#carrierAddress", "Pol. Ind. Fuente del Jarro, calle 5, Paterna");
    await page.getByTestId("wizard-next").click();

    await expect(page.getByTestId("autofill-shipment")).toBeVisible();
    await page.getByTestId("autofill-shipment").selectOption({ label: "Valencia → Madrid" });
    // #86 p3: SavedLocation stores every visible textual field UPPERCASE.
    await expect(page.locator("#loadLocationName")).toHaveValue("ALMACÉN TURIA");
    await expect(page.locator("#unloadLocationCity")).toHaveValue("MADRID");
    await page.fill("#loadDate", "2026-10-06");
    await page.fill("#unloadDate", "2026-10-06");
    await page.getByTestId("wizard-next").click();

    // goods/weight came from the picked route — never re-typed.
    await expect(page.locator("#goods")).toHaveValue("PALÉS DE CERÁMICA");
    await expect(page.locator("#weight")).toHaveValue("12000 kg");
    await page.fill("#tractorPlate", "1234 BCD");

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
    expect(upper).toContain("ALMACÉN TURIA");
    expect(upper).toContain("PLATAFORMA NORTE");
    expect(upper).toContain("PALÉS DE CERÁMICA");
  });

  test("guardar como envío habitual round-trips: saved from the wizard, then selectable on the next DeCA", async ({
    page,
  }) => {
    await register(page);
    await createSavedLocation(page, {
      name: "Fábrica Castellón",
      address: "Pol. Ind. 1",
      postalCode: "12004",
      city: "Castellón",
      country: "España",
      type: "load",
    });
    await createSavedLocation(page, {
      name: "Nave Sur",
      address: "Calle Sur 9",
      postalCode: "28002",
      city: "Madrid",
      country: "España",
      type: "unload",
    });

    await page.goto("/crear");
    await page.fill("#shipperName", "Cargas del Turia SL");
    await page.fill("#shipperNif", "B96789011");
    await page.fill("#shipperAddress", "Av. del Puerto 120, Valencia");
    await page.fill("#carrierName", "Transportes Pérez SL");
    await page.fill("#carrierNif", "B12345674");
    await page.fill("#carrierAddress", "Pol. Ind. Fuente del Jarro, calle 5, Paterna");
    await page.getByTestId("wizard-next").click();

    // #86 p3: SavedLocation stores every visible textual field UPPERCASE.
    await page
      .getByTestId("autofill-load-location")
      .selectOption({ label: "FÁBRICA CASTELLÓN — CASTELLÓN" });
    await page.getByTestId("autofill-unload-location").selectOption({ label: "NAVE SUR — MADRID" });
    await page.fill("#loadDate", "2026-10-06");
    await page.fill("#unloadDate", "2026-10-06");
    await page.getByTestId("wizard-next").click();
    await page.fill("#goods", "Azulejos");
    await page.fill("#weight", "8000 kg");
    await page.fill("#tractorPlate", "1234 BCD");

    await page.getByTestId("save-shipment-open").click();
    await page.fill('[data-testid="save-shipment-name"]', "Castellón → Madrid");
    await page.getByTestId("save-shipment-confirm").click();
    await expect(page.getByTestId("shipment-saved")).toBeVisible();

    // A fresh visit to /crear should now offer the just-saved route (the
    // picker lives on step 1 — origin/destination — not the landing step).
    await page.goto("/crear");
    await page.fill("#shipperName", "Cargas del Turia SL");
    await page.fill("#shipperNif", "B96789011");
    await page.fill("#shipperAddress", "Av. del Puerto 120, Valencia");
    await page.fill("#carrierName", "Transportes Pérez SL");
    await page.fill("#carrierNif", "B12345674");
    await page.fill("#carrierAddress", "Pol. Ind. Fuente del Jarro, calle 5, Paterna");
    await page.getByTestId("wizard-next").click();
    await expect(page.getByTestId("autofill-shipment")).toBeVisible();
    await expect(
      page.getByTestId("autofill-shipment").locator("option", { hasText: "Castellón → Madrid" }),
    ).toHaveCount(1);
  });
});
