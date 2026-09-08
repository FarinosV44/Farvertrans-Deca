import { test, expect, type Page } from "@playwright/test";
import { internalPage } from "./helpers/admin-auth";

/**
 * #72 / #74 / #80 — the admin Resumen is a lean operating console (funnel +
 * "empresas a contactar" + alerts), and the "API/ERP Próximamente" dead element
 * is now a working "Solicitar integración" flow that reaches the superadmin.
 */

const rnd = () => `${Date.now()}${Math.floor(Math.random() * 1e5)}`;

async function register(page: Page, company: string) {
  await page.goto("/registro");
  await page.fill("#email", `ag${rnd()}@example.com`);
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", company);
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

test("the landing no longer says 'Próximamente' and offers an integration request", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#incluido")).not.toContainText("Próximamente");
  await expect(page.getByTestId("landing-integrations-cta")).toBeVisible();
});

test("a company requests an integration and it reaches the superadmin", async ({
  page,
  browser,
}) => {
  const company = `Integración SL ${rnd()}`;
  await register(page, company);
  await page.goto("/panel/integraciones");
  await page.getByTestId("integration-system").fill("Transporte TMS Pro");
  const [postRes] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/integraciones")),
    page.getByTestId("integration-submit").click(),
  ]);
  expect(postRes.status()).toBe(200);
  await expect(page.getByTestId("integration-done")).toBeVisible();

  const { page: admin, close } = await internalPage(browser);
  try {
    await admin.goto("/admin/integraciones");
    const row = admin.locator("tr", { hasText: company });
    await expect(row).toBeVisible();
    await expect(row).toContainText("Transporte TMS Pro");
    // triage it
    const [patchRes] = await Promise.all([
      admin.waitForResponse(
        (r) => r.url().includes("/api/integraciones") && r.request().method() === "PATCH",
      ),
      row.getByTestId("integration-status").selectOption("reviewed"),
    ]);
    expect(patchRes.status()).toBe(200);
    await admin.reload();
    await expect(
      admin.locator("tr", { hasText: company }).getByTestId("integration-status"),
    ).toHaveValue("reviewed");
  } finally {
    await close();
  }
});

test("the admin Resumen shows the activation funnel and an 'empresas a contactar' section", async ({
  browser,
}) => {
  const { page, close } = await internalPage(browser);
  try {
    await page.goto("/admin");
    await expect(page.getByTestId("admin-funnel")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Empresas a contactar" })).toBeVisible();
    // the detailed KPIs are behind progressive disclosure
    await expect(page.getByText("DeCA generados").first()).not.toBeVisible();
    await page.getByText("Más métricas").click();
    await expect(page.getByText("DeCA generados").first()).toBeVisible();

    await page.goto("/admin/activacion");
    await expect(page.getByRole("heading", { name: "Activación" })).toBeVisible();

    // #73 — the Sistema screen shows generation health + recent incidents,
    // with text (not colour only).
    await page.goto("/admin/sistema");
    await expect(page.getByTestId("generation-health")).toBeVisible();
    await expect(page.getByText("Tasa de éxito 24 h / 7 d")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Incidencias recientes" })).toBeVisible();

    // #82 — the companies list has rule-based segment chips that filter, and
    // combine with search; every chip has its rule as a tooltip.
    await page.goto("/admin/empresas");
    const chips = page.getByTestId("segment-chips");
    await expect(chips).toBeVisible();
    const firstChip = chips.getByRole("link").first();
    const chipName = (await firstChip.textContent())?.trim() ?? "";
    await firstChip.click();
    await expect(page).toHaveURL(/seg=/);
    await expect(page.getByTestId("empresa-clear")).toBeVisible();
    expect(chipName.length).toBeGreaterThan(0);

    // #81 — opening a company from the filtered list, then "← Empresas",
    // returns to the same filtered list (search + segment preserved).
    const rows = page.getByTestId("empresa-row-link");
    if ((await rows.count()) > 0) {
      const segInUrl = new URL(page.url()).searchParams.get("seg");
      await rows.first().click();
      await expect(page).toHaveURL(/\/admin\/empresas\/[^/?]+(\?|$)/);
      await page.getByTestId("admin-back").click();
      await expect(page).toHaveURL(new RegExp(`seg=${segInUrl}`));
      await expect(page.getByTestId("empresa-clear")).toBeVisible();
    }

    await page.goto("/admin/empresas");
    await page.getByTestId("empresa-search").fill("zzz-no-match-xyz");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(/q=zzz-no-match-xyz/);
  } finally {
    await close();
  }
});
