import { test, expect, type Page } from "@playwright/test";

/**
 * PRODUCT #34 §3/§4 — the company can export its DeCA history to CSV, scoped to
 * its own tenant, with a product workflow status per row.
 */

const rnd = () => `${Date.now()}${Math.floor(Math.random() * 1e5)}`;

async function registerAndCreate(page: Page, company: string, destination = "Madrid") {
  await page.goto("/registro");
  await page.fill("#email", `u${rnd()}@example.com`);
  await page.fill("#password", "supersecret123");
  await page.fill("#companyName", company);
  await page.fill("#companyNif", "B12345674");
  await page.getByTestId("accept-terms").check();
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
    page.getByTestId("register-submit").click(),
  ]);
  await expect(page).toHaveURL(/\/verificar-email/);
  // D-053: generation is a hard gate on emailVerifiedAt — verify for real.
  const body = await res.json();
  await page.request.get(`/verificar-email/${body.verifyTestToken}`);
  await page.goto("/panel");
  await page.goto("/crear");
  for (const [s, v] of [
    ["#shipperName", "Cargas SL"],
    ["#shipperNif", "B96789011"],
    ["#shipperAddress", "Calle 1"],
    ["#carrierName", "Trans SL"],
    ["#carrierNif", "B12345674"],
    ["#carrierAddress", "Av 2"],
  ] as const)
    await page.fill(s, v);
  await page.getByTestId("wizard-next").click();
  for (const [s, v] of [
    ["#loadLocationName", "Almacén Valencia"],
    ["#loadLocationAddress", "Calle 1"],
    ["#loadLocationPostalCode", "46001"],
    ["#loadLocationCity", "Valencia"],
    ["#loadLocationProvince", "Valencia"],
    ["#loadLocationCountry", "España"],
    ["#loadDate", "2026-10-06"],
    ["#unloadLocationName", "Almacén Destino"],
    ["#unloadLocationAddress", "Av 2"],
    ["#unloadLocationPostalCode", "50001"],
    ["#unloadLocationCity", destination],
    ["#unloadLocationProvince", destination],
    ["#unloadLocationCountry", "España"],
    ["#unloadDate", "2026-10-06"],
  ] as const)
    await page.fill(s, v);
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", "Palés de cerámica");
  await page.fill("#weight", "12000 kg");
  await page.fill("#tractorPlate", "1234 BCD");
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
}

test.describe("PRODUCT #34 — history export + workflow status", () => {
  test("the workspace history shows a workflow status and an Exportar CSV link", async ({
    page,
  }) => {
    await registerAndCreate(page, `Export SL ${rnd()}`);
    await page.goto("/panel/historico");
    await expect(page.getByTestId("historico-table")).toContainText("Vigente");
    await expect(page.getByTestId("export-csv")).toHaveAttribute("href", "/api/export/history");
  });

  test("the CSV download carries the documented columns and this company's rows only", async ({
    browser,
  }) => {
    const aCtx = await browser.newContext();
    const a = await aCtx.newPage();
    const companyA = `Empresa A ${rnd()}`;
    await registerAndCreate(a, companyA, "Zaragoza");

    const bCtx = await browser.newContext();
    const b = await bCtx.newPage();
    await registerAndCreate(b, `Empresa B ${rnd()}`, "Bilbao");

    // company A downloads its history
    await a.goto("/panel/historico");
    const [download] = await Promise.all([
      a.waitForEvent("download"),
      a.getByTestId("export-csv").click(),
    ]);
    const stream = await download.createReadStream();
    let csv = "";
    for await (const chunk of stream) csv += chunk;

    expect(download.suggestedFilename()).toMatch(/^deca-historial-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(csv).toContain("referencia,creado,fecha_carga");
    expect(csv).toContain("Zaragoza");
    expect(csv).toContain("Vigente");
    // never another tenant's route
    expect(csv).not.toContain("Bilbao");

    // company B's own export cannot see A's document either
    const bRes = await b.request.get("/api/export/history");
    const bCsv = await bRes.text();
    expect(bCsv).toContain("Bilbao");
    expect(bCsv).not.toContain("Zaragoza");

    await aCtx.close();
    await bCtx.close();
  });

  test("an anonymous request to the export endpoint is rejected", async ({ request }) => {
    const res = await request.get("/api/export/history");
    expect(res.status()).toBe(401);
  });
});
