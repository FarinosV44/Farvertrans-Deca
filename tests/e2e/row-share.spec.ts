import { test, expect, type Page } from "@playwright/test";

/**
 * #77 — one-tap share of the DeCA in force straight from the history list, with
 * no need to open the PDF, no horizontal scroll on mobile, always the current
 * version.
 */

const V = {
  shipperName: "Cargas del Turia SL",
  shipperNif: "B96789011",
  shipperAddress: "Av. del Puerto 120, Valencia",
  carrierName: "Transportes Pérez SL",
  carrierNif: "B12345674",
  carrierAddress: "Calle 5, Paterna",
  loadLocationName: "Almacén Turia",
  loadLocationAddress: "Av. del Puerto 120",
  loadLocationPostalCode: "46023",
  loadLocationCity: "Valencia",
  loadLocationCountry: "España",
  loadDate: "2026-10-06",
  unloadLocationName: "Plataforma Norte",
  unloadLocationAddress: "Calle Alcalá 200",
  unloadLocationPostalCode: "28028",
  unloadLocationCity: "Madrid",
  unloadLocationCountry: "España",
  unloadDate: "2026-10-06",
  goods: "Palés de cerámica",
  weight: "12000 kg",
  tractorPlate: "1234 BCD",
};
const rnd = () => `${Date.now()}${Math.floor(Math.random() * 1e5)}`;

async function fillWizard(page: Page) {
  for (const [id, val] of [
    ["#shipperName", V.shipperName],
    ["#shipperNif", V.shipperNif],
    ["#shipperAddress", V.shipperAddress],
    ["#carrierName", V.carrierName],
    ["#carrierNif", V.carrierNif],
    ["#carrierAddress", V.carrierAddress],
  ])
    await page.fill(id, val);
  await page.getByTestId("wizard-next").click();
  for (const [id, val] of [
    ["#loadLocationName", V.loadLocationName],
    ["#loadLocationAddress", V.loadLocationAddress],
    ["#loadLocationPostalCode", V.loadLocationPostalCode],
    ["#loadLocationCity", V.loadLocationCity],
    ["#loadLocationCountry", V.loadLocationCountry],
    ["#loadDate", V.loadDate],
    ["#unloadLocationName", V.unloadLocationName],
    ["#unloadLocationAddress", V.unloadLocationAddress],
    ["#unloadLocationPostalCode", V.unloadLocationPostalCode],
    ["#unloadLocationCity", V.unloadLocationCity],
    ["#unloadLocationCountry", V.unloadLocationCountry],
    ["#unloadDate", V.unloadDate],
  ])
    await page.fill(id, val);
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", V.goods);
  await page.fill("#weight", V.weight);
  await page.fill("#tractorPlate", V.tractorPlate);
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
}

async function register(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", `share${rnd()}@example.com`);
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", `Compartir SL ${rnd()}`);
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

test("history row: share the current DeCA in one tap, no PDF detour, no h-scroll at 360px", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 360, height: 740 });
  await register(page);
  await page.goto("/crear");
  await fillWizard(page);

  await page.goto("/panel/historico");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  const cards = page.getByTestId("historico-cards");
  await cards.getByTestId("row-share").first().click();
  const menu = cards.getByTestId("row-share-menu").first();
  await expect(menu).toBeVisible();

  const wa = menu.getByRole("link", { name: /WhatsApp/i });
  const waHref = await wa.getAttribute("href");
  expect(waHref).toContain("wa.me");
  expect(decodeURIComponent(waHref!)).toMatch(/\/d\/[A-Za-z0-9_-]+/);

  await menu.getByRole("button", { name: /Copiar enlace/i }).click();
  await expect(menu.getByRole("button", { name: /Enlace copiado/i })).toBeVisible();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toMatch(/\/d\/[A-Za-z0-9_-]+$/);
});
