import { test, expect, type Page } from "@playwright/test";

const D = {
  shipperName: "Cargas del Turia SL",
  shipperNif: "B96789011",
  shipperAddress: "Av. del Puerto 120, Valencia",
  carrierName: "Transportes Pérez SL",
  carrierNif: "B12345674",
  carrierAddress: "Pol. Ind. Fuente del Jarro 5, Paterna",
  loadLocation: {
    name: "Almacén Turia",
    address: "Av. del Puerto 120",
    postalCode: "46023",
    city: "Valencia",
    province: "Valencia",
    country: "España",
  },
  unloadLocation: {
    name: "Plataforma Norte",
    address: "Calle Alcalá 200",
    postalCode: "28028",
    city: "Madrid",
    province: "Madrid",
    country: "España",
  },
  loadDate: "2026-10-06",
  unloadDate: "2026-10-06",
  goods: "Palés",
  weight: "12000 kg",
  tractorPlate: "1234 BCD",
};

function email() {
  return `dd${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function anonCreate(page: Page) {
  await page.goto("/crear");
  await page.fill("#shipperName", D.shipperName);
  await page.fill("#shipperNif", D.shipperNif);
  await page.fill("#shipperAddress", D.shipperAddress);
  await page.fill("#carrierName", D.carrierName);
  await page.fill("#carrierNif", D.carrierNif);
  await page.fill("#carrierAddress", D.carrierAddress);
  await page.getByTestId("wizard-next").click();
  for (const [s, v] of [
    ["#loadLocationName", D.loadLocation.name],
    ["#loadLocationAddress", D.loadLocation.address],
    ["#loadLocationPostalCode", D.loadLocation.postalCode],
    ["#loadLocationCity", D.loadLocation.city],
    ["#loadLocationProvince", D.loadLocation.province],
    ["#loadLocationCountry", D.loadLocation.country],
    ["#loadDate", D.loadDate],
    ["#unloadLocationName", D.unloadLocation.name],
    ["#unloadLocationAddress", D.unloadLocation.address],
    ["#unloadLocationPostalCode", D.unloadLocation.postalCode],
    ["#unloadLocationCity", D.unloadLocation.city],
    ["#unloadLocationProvince", D.unloadLocation.province],
    ["#unloadLocationCountry", D.unloadLocation.country],
    ["#unloadDate", D.unloadDate],
  ] as const)
    await page.fill(s, v);
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", D.goods);
  await page.fill("#weight", D.weight);
  await page.fill("#tractorPlate", D.tractorPlate);
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
}

test.describe("OPS #26 — driver delivery, sharing, QR verification", () => {
  test("result screen: open PDF, share (WhatsApp), copy, print, verify QR — analytics fire, no PII", async ({
    page,
    context,
  }) => {
    const events: { name: string; body: string }[] = [];
    await page.route("**/api/events", async (route) => {
      const b = route.request().postData() || "{}";
      try {
        events.push({ name: JSON.parse(b).name, body: b });
      } catch {
        /* ignore */
      }
      await route.fulfill({ status: 204, body: "" });
    });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await anonCreate(page);
    const publicUrl = await page.getByTestId("result-download").getAttribute("href");
    expect(publicUrl).toMatch(/\/d\/[A-Za-z0-9_-]+$/);

    // <=2 taps to send to the driver: "Enviar al conductor" → WhatsApp
    await page.getByTestId("result-share-toggle").click();
    const wa = page.getByTestId("share-whatsapp");
    expect(decodeURIComponent((await wa.getAttribute("href")) ?? "")).toContain(publicUrl!);
    await wa.click();

    await page.getByTestId("result-copy").click();
    await expect(page.getByTestId("result-copy")).toHaveText("Enlace copiado");
    await page.getByTestId("result-print").click();

    // Comprobar QR: exact URL + version
    await page.getByTestId("qr-verify-toggle").click();
    const panel = page.getByTestId("qr-verify-panel");
    await expect(panel).toContainText(publicUrl!);
    await expect(panel).toContainText("Versión 1");

    await page.waitForTimeout(300);
    const names = events.map((e) => e.name);
    for (const n of [
      "share_opened",
      "share_whatsapp",
      "public_link_copied",
      "print_clicked",
      "qr_verify_opened",
    ]) {
      expect(names, n).toContain(n);
    }
    // no analytics payload carries document content or the URL token
    const token = publicUrl!.split("/d/")[1];
    for (const e of events) {
      expect(e.body).not.toContain(token);
      expect(e.body).not.toContain(D.carrierNif);
      expect(e.body).not.toContain(D.goods);
    }
  });

  test("the QR public URL opens with no auth/cookie/interstitial in a clean browser", async ({
    browser,
    request,
  }) => {
    // create via API, then hit /d/[token] from a bare context
    const res = await request.post("/api/deca", {
      data: {
        shipper: { name: D.shipperName, nif: D.shipperNif, address: D.shipperAddress },
        carrier: { name: D.carrierName, nif: D.carrierNif, address: D.carrierAddress },
        loadLocation: D.loadLocation,
        unloadLocation: D.unloadLocation,
        loadDate: D.loadDate,
        unloadDate: D.unloadDate,
        goods: D.goods,
        weight: D.weight,
        tractorPlate: D.tractorPlate,
      },
    });
    const { token } = await res.json();
    const clean = await browser.newContext();
    const r = await clean.request.get(`/d/${token}`);
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toBe("application/pdf");
    expect(r.headers()["set-cookie"]).toBeUndefined();
    expect(
      Buffer.from(await r.body())
        .subarray(0, 5)
        .toString(),
    ).toBe("%PDF-");
    await clean.close();
  });

  test("a corrected DeCA prompts a re-share and points share actions at the current version", async ({
    page,
  }) => {
    // register + create + correct
    await page.goto("/registro");
    await page.fill("#email", email());
    await page.fill("#password", "supersecret123");
    await page.fill("#companyName", "OPS SL");
    await page.fill("#companyNif", "B12345674");
    await page.getByTestId("register-submit").click();
    await expect(page).toHaveURL(/\/panel$/);
    await anonCreate(page);

    // go to the owner detail, correct the unload location
    await page.goto("/panel/historico");
    await page
      .getByTestId("historico-table")
      .getByRole("link", { name: "Detalle" })
      .first()
      .click();
    const v1Url = await page.getByTestId("result-download").getAttribute("href");
    await page.getByTestId("deca-corregir").click();
    await page.getByTestId("wizard-next").click();
    await page.fill("#unloadLocationCity", "Barcelona");
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("correction-reason").fill("Cambio de destino");
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/panel\/deca\/[a-z0-9]+$/i);

    // prominent re-share reminder + share now targets v2
    await expect(page.getByTestId("reshare-reminder")).toBeVisible();
    const v2Url = await page.getByTestId("result-download").getAttribute("href");
    expect(v2Url).not.toBe(v1Url);
    await page.getByTestId("qr-verify-toggle").click();
    await expect(page.getByTestId("qr-verify-panel")).toContainText("Versión 2");
  });
});
