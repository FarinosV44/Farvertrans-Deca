import { test, expect, type Browser, type Page } from "@playwright/test";
import { PrismaClient } from "@/prisma/generated/client";

/**
 * ADMIN #33 — the internal command center. Covers the acceptance checklist:
 * a normal customer cannot reach it, an internal user can operate the product
 * from `/admin`, and a production generation error is locatable by the #29
 * correlation code.
 */

const ADMIN = { email: "admin@farvertrans.local", password: "admin-dev-only" };
const rnd = () => `${Date.now()}${Math.floor(Math.random() * 1e5)}`;
const baseURL = `http://localhost:${process.env.PORT ?? "3000"}`;

async function internalPage(browser: Browser): Promise<{ page: Page; close: () => Promise<void> }> {
  const ctx = await browser.newContext({ baseURL });
  const page = await ctx.newPage();
  await page.goto("/entrar");
  await page.fill("#email", ADMIN.email);
  await page.fill("#password", ADMIN.password);
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/login") && r.status() === 200),
    page.getByTestId("register-submit").click(),
  ]);
  return { page, close: () => ctx.close() };
}

async function registerAndGenerate(page: Page, company: string) {
  const mail = `u${rnd()}@example.com`;
  await page.goto("/registro");
  await page.fill("#email", mail);
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
  for (const [sel, val] of [
    ["#shipperName", "Cargas SL"],
    ["#shipperNif", "B96789011"],
    ["#shipperAddress", "Calle 1, Valencia"],
    ["#carrierName", "Trans SL"],
    ["#carrierNif", "B12345674"],
    ["#carrierAddress", "Av. Central 3, Madrid"],
  ] as const) {
    await page.fill(sel, val);
  }
  await page.getByTestId("wizard-next").click();
  for (const [sel, val] of [
    ["#loadLocationName", "Almacén Valencia"],
    ["#loadLocationAddress", "Calle 1"],
    ["#loadLocationPostalCode", "46001"],
    ["#loadLocationCity", "Valencia"],
    ["#loadLocationProvince", "Valencia"],
    ["#loadLocationCountry", "España"],
    ["#loadDate", "2026-10-06"],
    ["#unloadLocationName", "Almacén Zaragoza"],
    ["#unloadLocationAddress", "Av. Central 3"],
    ["#unloadLocationPostalCode", "50001"],
    ["#unloadLocationCity", "Zaragoza"],
    ["#unloadLocationProvince", "Zaragoza"],
    ["#unloadLocationCountry", "España"],
    ["#unloadDate", "2026-10-06"],
  ] as const) {
    await page.fill(sel, val);
  }
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", "Palés de cerámica");
  await page.fill("#weight", "12000 kg");
  await page.fill("#tractorPlate", "1234 BCD");
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
  return { mail, company };
}

test.describe("ADMIN #33 — internal command center", () => {
  test("a normal customer cannot discover /admin nor its APIs", async ({ page, request }) => {
    expect((await page.goto("/admin"))?.status()).toBe(404);
    expect((await page.goto("/admin/errores"))?.status()).toBe(404);
    expect((await request.get("/api/admin/search?q=acme")).status()).toBe(404);
    expect((await request.get("/api/admin/diagnostics")).status()).toBe(404);

    await page.goto("/registro");
    await page.fill("#email", `c${rnd()}@example.com`);
    await page.fill("#password", "supersecret123");
    await page.fill("#companyName", "Cliente Normal SL");
    await page.fill("#companyNif", "B12345674");
    await page.getByTestId("accept-terms").check();
    await page.getByTestId("register-submit").click();
    await expect(page).toHaveURL(/\/verificar-email/);
    await page.goto("/panel");
    expect((await page.goto("/admin"))?.status()).toBe(404);
  });

  test("internal user gets the shell, overview KPIs and system health", async ({ browser }) => {
    const { page, close } = await internalPage(browser);
    try {
      await page.goto("/admin");
      await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Secciones de administración" }).first(),
      ).toBeVisible();
      await expect(page.getByText("DeCA generados").first()).toBeVisible();

      await page.goto("/admin/sistema");
      await expect(page.getByRole("heading", { name: "Sistema" })).toBeVisible();
      await expect(page.getByText("Base de datos accesible")).toBeVisible();
      await expect(page.getByText("Generación de PDF")).toBeVisible();
    } finally {
      await close();
    }
  });

  test("a generation failure is locatable by its #29 correlation code and can be triaged", async ({
    browser,
  }) => {
    const prisma = new PrismaClient();
    const correlationId = "Z7K4M2";
    await prisma.generationFailure.create({
      data: {
        correlationId,
        stage: "pdf_storage",
        errorClass: "StorageError",
        message: "bucket unavailable",
        route: "POST /api/deca",
        authenticated: false,
        storageDriver: "local",
        appVersion: "0.1.0",
      },
    });

    const { page, close } = await internalPage(browser);
    try {
      await page.goto(`/admin/errores/${correlationId}`);
      await expect(page.getByRole("heading", { name: `Fallo ${correlationId}` })).toBeVisible();
      await expect(page.getByText("pdf_storage").first()).toBeVisible();

      // Triage: add a note, mark resolved.
      await page.getByTestId("failure-note").fill("Confirmado con el proveedor; ya resuelto.");
      await Promise.all([
        page.waitForResponse(
          (r) =>
            r.url().includes(`/api/admin/failures/${correlationId}`) &&
            r.request().method() === "PATCH",
        ),
        page.getByTestId("failure-save-note").click(),
      ]);
      await Promise.all([
        page.waitForResponse(
          (r) =>
            r.url().includes(`/api/admin/failures/${correlationId}`) &&
            r.request().method() === "PATCH",
        ),
        page.getByTestId("failure-resolved").check(),
      ]);
      await expect(page.getByTestId("failure-resolved")).toBeChecked();

      const row = await prisma.generationFailure.findUnique({ where: { correlationId } });
      expect(row?.note).toContain("proveedor");
      expect(row?.resolvedAt).not.toBeNull();

      // It now shows under the "resueltos" filter on the list.
      await page.goto("/admin/errores?status=resolved");
      await expect(
        page.getByTestId("failure-link").filter({ hasText: correlationId }),
      ).toBeVisible();
    } finally {
      await prisma.generationFailure.deleteMany({ where: { correlationId } });
      await prisma.$disconnect();
      await close();
    }
  });

  test("internal user finds a DeCA by search and inspects its version, PDF hash and public URL", async ({
    browser,
  }) => {
    const { page: customer, close: closeCustomer } = await (async () => {
      const ctx = await browser.newContext({ baseURL });
      return { page: await ctx.newPage(), close: () => ctx.close() };
    })();
    const company = `Admin Deca SL ${rnd()}`;
    await registerAndGenerate(customer, company);
    await closeCustomer();

    const { page, close } = await internalPage(browser);
    try {
      await page.goto(`/admin/deca?q=${encodeURIComponent("Zaragoza")}`);
      const link = page.getByTestId("deca-row-link").first();
      await expect(link).toBeVisible();
      await link.click();
      await expect(page.getByText("Hash PDF (SHA-256)")).toBeVisible();
      await expect(page.getByText("URL pública / inspección")).toBeVisible();
      await expect(page.getByText("Versiones (1)")).toBeVisible();
    } finally {
      await close();
    }
  });

  test("internal user finds a company and sees its members and DeCA usage", async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL });
    const customer = await ctx.newPage();
    const company = `Ficha Empresa SL ${rnd()}`;
    const { mail } = await registerAndGenerate(customer, company);
    await ctx.close();

    const { page, close } = await internalPage(browser);
    try {
      await page.goto(`/admin/empresas?q=${encodeURIComponent("Ficha Empresa SL")}`);
      const link = page.getByTestId("empresa-row-link").first();
      await expect(link).toBeVisible();
      await link.click();
      await expect(page.getByText(mail)).toBeVisible();
      await expect(page.getByText("DeCA recientes")).toBeVisible();

      // Global search reaches the same company.
      await page.goto("/admin");
      await page.getByTestId("admin-search-input").first().fill("Ficha Empresa SL");
      await expect(page.getByTestId("admin-search-results").first()).toBeVisible();
    } finally {
      await close();
    }
  });
});
