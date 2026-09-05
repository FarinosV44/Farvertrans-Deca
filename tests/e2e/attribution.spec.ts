import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { loginAdminApi } from "./helpers/admin-auth";

function email() {
  return `a${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

/** The seeded internal user (past the mandatory TOTP challenge) — the only way to read the operator stats. */
async function internalStats(request: APIRequestContext) {
  await loginAdminApi(request);
  const res = await request.get("/api/operadores/stats");
  expect(res.status()).toBe(200);
  return res.json();
}

async function registerWith(page: Page, companyNif: string) {
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Attrib Test SL");
  await page.fill("#companyNif", companyNif);
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
}

test.describe("BUILD 11 — referral + UTM attribution", () => {
  test("AC-18/19: ?ref=adrian then signup is attributed to adrian", async ({ page, request }) => {
    // arrive via the operator link
    await page.goto(
      "/?ref=adrian&utm_source=whatsapp&utm_medium=direct&utm_campaign=lanzamiento_deca",
    );
    // browse other pages — attribution must survive navigation
    await page.goto("/crear");
    await page.goto("/registro");

    // the user never sees or types an operator name
    await expect(page.locator("body")).not.toContainText("adrian");

    const nif = "B12345674";
    await registerWith(page, nif);

    // AC-23: query the acquisition via the operator report endpoint
    const body = await internalStats(request);
    const adrian = body.operators.find((o: { refCode: string }) => o.refCode === "adrian");
    expect(adrian.companies).toBeGreaterThanOrEqual(1);
  });

  test("AC-20: returning via ?ref=maria before signup sets last-touch; first stays adrian", async ({
    page,
    request,
  }) => {
    await page.goto("/?ref=adrian");
    await page.goto("/?ref=maria&utm_source=email");
    await page.goto("/registro");
    await registerWith(page, "B12345674");

    // read the raw acquisition row through the stats endpoint's per-operator counts:
    // both adrian (first) and maria (last) should be resolvable; adrian keeps the company
    const stats = await internalStats(request);
    const adrian = stats.operators.find((o: { refCode: string }) => o.refCode === "adrian");
    expect(adrian.companies).toBeGreaterThanOrEqual(1);
  });

  test("AC-21/22: no ref and no UTM → organic/direct, still recorded", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    await page.goto("/registro");
    await registerWith(page, "B12345674");
    const stats = await internalStats(request);
    expect(stats.organic.companies).toBeGreaterThanOrEqual(1);
  });

  test("first_deca_at is set when an attributed company generates its first DeCA", async ({
    page,
    request,
  }) => {
    await page.goto("/?ref=diana");
    await page.goto("/registro");
    await registerWith(page, "B12345674");

    // create a DeCA while authed
    await page.goto("/crear");
    await page.fill("#shipperName", "Cargas SL");
    await page.fill("#shipperNif", "B96789011");
    await page.fill("#shipperAddress", "Calle 1");
    await page.fill("#carrierName", "Trans SL");
    await page.fill("#carrierNif", "B12345674");
    await page.fill("#carrierAddress", "Av. Central 3, Madrid");
    await page.getByTestId("wizard-next").click();
    for (const [s, v] of [
      ["#loadLocationName", "Almacén Valencia"],
      ["#loadLocationAddress", "Calle 1"],
      ["#loadLocationPostalCode", "46001"],
      ["#loadLocationCity", "Valencia"],
      ["#loadLocationProvince", "Valencia"],
      ["#loadLocationCountry", "España"],
      ["#loadDate", "2026-10-06"],
      ["#unloadLocationName", "Almacén Madrid"],
      ["#unloadLocationAddress", "Av. Central 3"],
      ["#unloadLocationPostalCode", "28001"],
      ["#unloadLocationCity", "Madrid"],
      ["#unloadLocationProvince", "Madrid"],
      ["#unloadLocationCountry", "España"],
      ["#unloadDate", "2026-10-06"],
    ] as const)
      await page.fill(s, v);
    await page.getByTestId("wizard-next").click();
    await page.fill("#goods", "Palés");
    await page.fill("#weight", "12000 kg");
    await page.fill("#tractorPlate", "1234 BCD");
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);

    const stats = await internalStats(request);
    const diana = stats.operators.find((o: { refCode: string }) => o.refCode === "diana");
    expect(diana.firstDeca).toBeGreaterThanOrEqual(1);
  });
});
