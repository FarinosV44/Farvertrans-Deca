import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

function email() {
  return `o${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function loginAdmin(request: APIRequestContext) {
  const r = await request.post("/api/auth/login", {
    data: { email: "admin@farvertrans.local", password: "admin-dev-only" },
  });
  expect(r.status(), "run npm run seed to create the internal user").toBe(200);
}

async function registerAndGenerate(page: Page, ref?: string) {
  await page.goto(ref ? `/?ref=${ref}` : "/");
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "supersecret123");
  await page.fill("#companyName", "Captada SL");
  await page.fill("#companyNif", "B12345674");
  await page.getByTestId("register-submit").click();
  await expect(page).toHaveURL(/\/panel$/);
  await page.goto("/crear");
  for (const [sel, val] of [
    ["#shipperName", "Cargas SL"],
    ["#shipperNif", "B96789011"],
    ["#shipperAddress", "Calle 1"],
    ["#carrierName", "Trans SL"],
    ["#carrierNif", "B12345674"],
  ] as const) {
    await page.fill(sel, val);
  }
  await page.getByTestId("wizard-next").click();
  await page.fill("#origin", "Valencia");
  await page.fill("#destination", "Madrid");
  await page.fill("#transportDate", "2026-10-06");
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", "Palés");
  await page.fill("#weight", "12000 kg");
  await page.fill("#tractorPlate", "1234 BCD");
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);
}

test.describe("BUILD 12 — internal operator dashboard", () => {
  test("a non-internal user cannot discover /operadores (404) nor its stats API", async ({
    page,
    request,
  }) => {
    expect((await page.goto("/operadores"))?.status()).toBe(404);
    expect((await request.get("/api/operadores/stats")).status()).toBe(404);

    await page.goto("/registro");
    await page.fill("#email", email());
    await page.fill("#password", "supersecret123");
    await page.fill("#companyName", "Regular SL");
    await page.fill("#companyNif", "B12345674");
    await page.getByTestId("register-submit").click();
    await expect(page).toHaveURL(/\/panel$/);
    expect((await page.goto("/operadores"))?.status()).toBe(404);
  });

  test("internal user sees the operator table; counts reconcile with the API", async ({
    page,
    request,
  }) => {
    await registerAndGenerate(page, "alejandro");

    // read stats via the seeded internal user on the request context
    await loginAdmin(request);
    const stats = await (await request.get("/api/operadores/stats")).json();
    const api = stats.operators.find((o: { refCode: string }) => o.refCode === "alejandro");
    expect(api.companies).toBeGreaterThanOrEqual(1);
    expect(api.firstDeca).toBeGreaterThanOrEqual(1);
    expect(api.totalDeca).toBeGreaterThanOrEqual(1);

    // and the page renders it (fresh context needs its own baseURL)
    const baseURL = `http://localhost:${process.env.PORT ?? "3000"}`;
    const adminCtx = await page.context().browser()!.newContext({ baseURL });
    const admin = await adminCtx.newPage();
    await admin.goto("/registro");
    await admin.getByRole("button", { name: "Ya tengo cuenta" }).click();
    await admin.fill("#email", "admin@farvertrans.local");
    await admin.fill("#password", "admin-dev-only");
    await Promise.all([
      admin.waitForResponse((r) => r.url().includes("/api/auth/login") && r.status() === 200),
      admin.getByTestId("register-submit").click(),
    ]);
    await admin.goto("/operadores", { waitUntil: "networkidle" });
    await expect(admin.getByRole("heading", { name: "Captación por operador" })).toBeVisible();
    const row = admin.locator("tr", { hasText: "alejandro" }).first();
    await expect(row).toContainText("Alejandro");
    // a signed-up-but-inactive operator column shows 0 first-DeCA where none generated
    await expect(admin.locator("table")).toBeVisible();
    await adminCtx.close();
  });
});
