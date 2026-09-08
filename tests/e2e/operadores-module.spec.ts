import { test, expect, type Page } from "@playwright/test";
import { internalPage } from "./helpers/admin-auth";

/**
 * #86 part 8 — the superadmin creates an operator, gets an individual
 * /registro?ref=<code> link, and a company that signs up through it is
 * attributed to that operator (first-touch, persisted at signup).
 */

function email() {
  return `opm${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function registerWithRef(page: Page, ref: string) {
  await page.goto(`/registro?ref=${ref}`);
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Empresa Referida SL");
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
  await page.request.get(`/verificar-email/${(await res.json()).verifyTestToken}`);
}

test("superadmin creates an operator; a company registered via its link is attributed", async ({
  browser,
}) => {
  const { page: admin, close } = await internalPage(browser);
  await admin.goto("/admin/operadores");

  await admin.fill('[data-testid="operator-name"]', "Comercial Uno");
  const [createRes] = await Promise.all([
    admin.waitForResponse((r) => r.url().endsWith("/api/admin/operadores") && r.status() === 201),
    admin.getByTestId("operator-create").click(),
  ]);
  const refCode = (await createRes.json()).refCode as string;
  expect(refCode).toMatch(/^[A-Z0-9]+$/);

  // its individual link is copyable and points at /registro?ref=
  await expect(admin.getByTestId(`operator-copy-${refCode}`)).toBeVisible();

  // a company signs up through the link
  const userCtx = await browser.newContext();
  const user = await userCtx.newPage();
  await registerWithRef(user, refCode);

  // the operator detail shows the attributed company
  await admin.goto("/admin/operadores");
  await admin.getByRole("link", { name: /Comercial Uno/ }).click();
  await expect(admin).toHaveURL(/\/admin\/operadores\/[a-z0-9]+$/i);
  await expect(admin.getByText(`/registro?ref=${refCode}`)).toBeVisible();
  await expect(admin.getByText("Empresa Referida SL")).toBeVisible();

  // deactivating keeps the history
  await admin.goto("/admin/operadores");
  await admin
    .getByRole("button", { name: /desactivar/i })
    .first()
    .click();
  await admin.reload();
  await expect(admin.getByRole("button", { name: /activar/i }).first()).toBeVisible();

  await userCtx.close();
  await close();
});
