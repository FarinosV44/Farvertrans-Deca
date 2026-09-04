import { test, expect, type Page } from "@playwright/test";

const V = {
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

async function fillStep1(page: Page) {
  await page.fill("#shipperName", V.shipperName);
  await page.fill("#shipperNif", V.shipperNif);
  await page.fill("#shipperAddress", V.shipperAddress);
  await page.fill("#carrierName", V.carrierName);
  await page.fill("#carrierNif", V.carrierNif);
  await page.fill("#carrierAddress", V.carrierAddress);
}

async function fillStep2(page: Page) {
  await page.fill("#loadLocationName", V.loadLocationName);
  await page.fill("#loadLocationAddress", V.loadLocationAddress);
  await page.fill("#loadLocationPostalCode", V.loadLocationPostalCode);
  await page.fill("#loadLocationCity", V.loadLocationCity);
  await page.fill("#loadLocationProvince", V.loadLocationProvince);
  await page.fill("#loadLocationCountry", V.loadLocationCountry);
  await page.fill("#loadDate", V.loadDate);
  await page.fill("#unloadLocationName", V.unloadLocationName);
  await page.fill("#unloadLocationAddress", V.unloadLocationAddress);
  await page.fill("#unloadLocationPostalCode", V.unloadLocationPostalCode);
  await page.fill("#unloadLocationCity", V.unloadLocationCity);
  await page.fill("#unloadLocationProvince", V.unloadLocationProvince);
  await page.fill("#unloadLocationCountry", V.unloadLocationCountry);
  await page.fill("#unloadDate", V.unloadDate);
}

test.describe("BUILD 07 — anonymous 3-step DeCA creator", () => {
  test("AC-01: an anonymous visitor completes all steps and reaches the result", async ({
    page,
  }) => {
    await page.goto("/crear");
    await expect(page.getByText("No necesitas registrarte")).toBeVisible();

    await fillStep1(page);
    await page.getByTestId("wizard-next").click();

    await fillStep2(page);
    await page.getByTestId("wizard-next").click();

    await page.fill("#goods", V.goods);
    await page.fill("#weight", V.weight);
    await page.fill("#tractorPlate", V.tractorPlate);
    await page.fill("#leadName", "Ana García");
    await page.fill("#leadEmail", "ana@example.com");

    // AC: the review summary shows the exact final data before generating
    const review = page.getByTestId("review-summary");
    await expect(review).toBeVisible();
    await expect(review).toContainText(V.carrierAddress);
    await expect(review).toContainText(V.shipperName);
    await expect(review).toContainText(V.goods);

    await page.getByTestId("wizard-generate").click();

    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);
    await expect(page.getByRole("heading", { name: "DeCA generado" })).toBeVisible();
    await expect(page.getByText("Almacén Turia — Valencia → Plataforma Norte — Madrid")).toBeVisible();
  });

  test("AC-02: a mandatory omission blocks advancing with a Spanish message + error summary", async ({
    page,
  }) => {
    await page.goto("/crear");
    await page.fill("#shipperName", V.shipperName); // leave NIF + address + carrier empty
    await page.getByTestId("wizard-next").click();

    const summary = page.getByTestId("error-summary");
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("Indica el NIF");
    // still on step 1
    await expect(page.getByText("Paso 1 de 3")).toBeVisible();
  });

  test("back/forward preserves entered data", async ({ page }) => {
    await page.goto("/crear");
    await fillStep1(page);
    await page.getByTestId("wizard-next").click();
    await page.fill("#loadLocationName", V.loadLocationName);
    await page.getByRole("button", { name: "Atrás" }).click();
    await expect(page.locator("#shipperName")).toHaveValue(V.shipperName);
    await page.getByTestId("wizard-next").click();
    await expect(page.locator("#loadLocationName")).toHaveValue(V.loadLocationName);
  });

  test("a11y: the wizard has no serious/critical axe violations and errors are announced", async ({
    page,
  }) => {
    await page.goto("/crear");
    await page.getByTestId("wizard-next").click();
    await expect(page.getByTestId("error-summary")).toBeVisible();
  });
});

test.describe("POST /api/deca (F1/F2/R-2)", () => {
  const payload = {
    shipper: { name: V.shipperName, nif: V.shipperNif, address: V.shipperAddress },
    carrier: { name: V.carrierName, nif: V.carrierNif, address: V.carrierAddress },
    loadLocation: {
      name: V.loadLocationName,
      address: V.loadLocationAddress,
      postalCode: V.loadLocationPostalCode,
      city: V.loadLocationCity,
      province: V.loadLocationProvince,
      country: V.loadLocationCountry,
    },
    unloadLocation: {
      name: V.unloadLocationName,
      address: V.unloadLocationAddress,
      postalCode: V.unloadLocationPostalCode,
      city: V.unloadLocationCity,
      province: V.unloadLocationProvince,
      country: V.unloadLocationCountry,
    },
    loadDate: V.loadDate,
    unloadDate: V.unloadDate,
    goods: V.goods,
    weight: V.weight,
    tractorPlate: V.tractorPlate,
  };

  test("AC-09: rejects a payload missing a mandatory field with 422 + field errors", async ({
    request,
  }) => {
    const res = await request.post("/api/deca", {
      data: { ...payload, loadLocation: { ...payload.loadLocation, name: "" } },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("validation");
    expect(body.error.fields).toHaveProperty(["loadLocation.name"]);
  });

  test("AC-01: accepts a valid payload with 201 + token", async ({ request }) => {
    const res = await request.post("/api/deca", { data: payload });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.decaId).toBeTruthy();
    expect(String(body.token).length).toBeGreaterThan(20);
    expect(body.claimToken).toBeTruthy(); // anonymous → gets a claim token
  });

  test("AC-04b: the same idempotency key never creates a second DeCA", async ({ request }) => {
    const key = `test-${Date.now()}-${Math.random()}`;
    const a = await request.post("/api/deca", {
      data: payload,
      headers: { "idempotency-key": key },
    });
    const b = await request.post("/api/deca", {
      data: payload,
      headers: { "idempotency-key": key },
    });
    expect(a.status()).toBe(201);
    expect(b.status()).toBe(201);
    expect((await a.json()).decaId).toBe((await b.json()).decaId);
  });

  test("a foreign NIF is accepted (warning, not rejection)", async ({ request }) => {
    const res = await request.post("/api/deca", {
      data: {
        ...payload,
        carrier: { name: "Spedition GmbH", nif: "DE811569869", address: "Hafenstraße 12, Hamburg" },
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect((body.warnings as string[]).some((w) => w.includes("transportista"))).toBe(true);
  });
});
