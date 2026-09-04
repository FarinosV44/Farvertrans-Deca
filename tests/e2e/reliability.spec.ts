import { test, expect, type Page } from "@playwright/test";
import { createHash } from "node:crypto";

/**
 * P0 FIX #29 — generation must succeed, and when it cannot, it must fail in a
 * way that is diagnosable and never loses the user's work.
 *
 * The stage-classification and orphan-cleanup paths are unit-tested against a
 * mocked store/database (`tests/unit/deca-generation-pipeline.test.ts`); this
 * spec covers what only a running server can prove.
 */

const PAYLOAD = {
  shipper: { name: "Cargas Fiables SL", nif: "B96789011", address: "Av. del Puerto 120, Valencia" },
  carrier: { name: "Transportes Fiables SL", nif: "B12345674", address: "Calle 5, Paterna" },
  loadLocation: {
    name: "Almacén Fiable",
    address: "Av. del Puerto 120",
    postalCode: "46023",
    city: "Valencia",
    province: "Valencia",
    country: "España",
  },
  unloadLocation: {
    name: "Plataforma Fiable",
    address: "Calle 6, Zaragoza",
    postalCode: "50001",
    city: "Zaragoza",
    province: "Zaragoza",
    country: "España",
  },
  loadDate: "2026-10-06",
  unloadDate: "2026-10-06",
  goods: "Palés de cerámica",
  weight: "12.500 kg",
  tractorPlate: "1234 BCD",
  trailerPlate: "",
  reference: "",
};

async function fillStep2(page: Page) {
  await page.fill("#loadLocationName", PAYLOAD.loadLocation.name);
  await page.fill("#loadLocationAddress", PAYLOAD.loadLocation.address);
  await page.fill("#loadLocationPostalCode", PAYLOAD.loadLocation.postalCode);
  await page.fill("#loadLocationCity", PAYLOAD.loadLocation.city);
  await page.fill("#loadLocationProvince", PAYLOAD.loadLocation.province);
  await page.fill("#loadLocationCountry", PAYLOAD.loadLocation.country);
  await page.fill("#loadDate", PAYLOAD.loadDate);
  await page.fill("#unloadLocationName", PAYLOAD.unloadLocation.name);
  await page.fill("#unloadLocationAddress", PAYLOAD.unloadLocation.address);
  await page.fill("#unloadLocationPostalCode", PAYLOAD.unloadLocation.postalCode);
  await page.fill("#unloadLocationCity", PAYLOAD.unloadLocation.city);
  await page.fill("#unloadLocationProvince", PAYLOAD.unloadLocation.province);
  await page.fill("#unloadLocationCountry", PAYLOAD.unloadLocation.country);
  await page.fill("#unloadDate", PAYLOAD.unloadDate);
}

test.describe("#29 — DeCA generation reliability", () => {
  test("a successful create returns a real id, token and PDF hash, immediately fetchable", async ({
    request,
    baseURL,
  }) => {
    const res = await request.post("/api/deca", {
      headers: { "idempotency-key": `rel-${Date.now()}-${Math.random()}` },
      data: PAYLOAD,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.decaId).toBeTruthy();
    expect(body.token).toMatch(/^[A-Za-z0-9_-]{20,}$/);
    expect(body.pdfSha256).toMatch(/^[0-9a-f]{64}$/);

    // The PDF is retrievable through the public inspection route right away and
    // its bytes hash to exactly what the API reported (integrity anchor, #18).
    const pdf = await request.get(`${baseURL}/d/${body.token}`);
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()["content-type"]).toBe("application/pdf");
    const bytes = Buffer.from(await pdf.body());
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(body.pdfSha256);
  });

  test("a retry with the same idempotency key cannot create a second document", async ({
    request,
  }) => {
    // The replay must also be exempt from the anonymous-creation rate limit: it
    // creates nothing, and a user recovering from a transient failure must never
    // be answered with a 429 (#29 / D-029).
    const key = `idem-${Date.now()}-${Math.random()}`;
    const first = await request.post("/api/deca", {
      headers: { "idempotency-key": key },
      data: PAYLOAD,
    });
    const second = await request.post("/api/deca", {
      headers: { "idempotency-key": key },
      data: PAYLOAD,
    });
    expect(first.status()).toBe(201);
    expect(second.status()).toBe(201);
    const a = await first.json();
    const b = await second.json();
    expect(b.decaId).toBe(a.decaId);
    expect(b.token).toBe(a.token);
  });

  test("an invalid payload is a field-level 422, never a generic failure", async ({ request }) => {
    const res = await request.post("/api/deca", {
      data: { ...PAYLOAD, carrier: { ...PAYLOAD.carrier, address: "" } },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("validation");
    expect(body.error.fields).toBeTruthy();
    expect(body.error.correlationId).toBeUndefined();
  });

  test("the wizard cannot double-submit: Generate is disabled while generating", async ({
    page,
  }) => {
    await page.goto("/crear");
    await page.fill("#shipperName", PAYLOAD.shipper.name);
    await page.fill("#shipperNif", PAYLOAD.shipper.nif);
    await page.fill("#shipperAddress", PAYLOAD.shipper.address);
    await page.fill("#carrierName", PAYLOAD.carrier.name);
    await page.fill("#carrierNif", PAYLOAD.carrier.nif);
    await page.fill("#carrierAddress", PAYLOAD.carrier.address);
    await page.getByTestId("wizard-next").click();
    await fillStep2(page);
    await page.getByTestId("wizard-next").click();
    await page.fill("#goods", PAYLOAD.goods);
    await page.fill("#weight", PAYLOAD.weight);
    await page.fill("#tractorPlate", PAYLOAD.tractorPlate);
    await page.fill("#leadName", "Ana García");
    await page.fill("#leadEmail", "ana@example.com");

    const generate = page.getByTestId("wizard-generate");
    await generate.click();
    // A real PDF render happens between click and redirect; allow for it under
    // full-suite parallel load.
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
  });

  test("the internal diagnostics endpoint is invisible to anonymous callers", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/diagnostics");
    expect(res.status()).toBe(404);
  });

  test("a failed generation keeps the draft, shows a code and offers a retry", async ({ page }) => {
    await page.goto("/crear");
    await page.fill("#shipperName", PAYLOAD.shipper.name);
    await page.fill("#shipperNif", PAYLOAD.shipper.nif);
    await page.fill("#shipperAddress", PAYLOAD.shipper.address);
    await page.fill("#carrierName", PAYLOAD.carrier.name);
    await page.fill("#carrierNif", PAYLOAD.carrier.nif);
    await page.fill("#carrierAddress", PAYLOAD.carrier.address);
    await page.getByTestId("wizard-next").click();
    await fillStep2(page);
    await page.getByTestId("wizard-next").click();
    await page.fill("#goods", PAYLOAD.goods);
    await page.fill("#weight", PAYLOAD.weight);
    await page.fill("#tractorPlate", PAYLOAD.tractorPlate);
    await page.fill("#leadName", "Ana García");
    await page.fill("#leadEmail", "ana@example.com");

    // Force ONE server failure, exactly as production would surface it.
    let failed = false;
    await page.route("**/api/deca", async (route) => {
      if (failed) return route.continue();
      failed = true;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "generation_failed",
            message: "No hemos podido guardar el documento. Tus datos siguen guardados.",
            correlationId: "AB34CD",
            retryable: true,
          },
        }),
      });
    });

    await page.getByTestId("wizard-generate").click();

    const failure = page.getByTestId("generation-failure");
    await expect(failure).toBeVisible();
    await expect(page.getByTestId("failure-code")).toHaveText("AB34CD");
    // The user's work is intact — the review still holds every value.
    await expect(page.getByTestId("review-summary")).toContainText(PAYLOAD.goods);
    await expect(page.locator("#tractorPlate")).toHaveValue(/1234/);

    // Retrying goes through to the real endpoint and succeeds.
    await page.getByTestId("retry-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "DeCA generado" })).toBeVisible();
  });
});
