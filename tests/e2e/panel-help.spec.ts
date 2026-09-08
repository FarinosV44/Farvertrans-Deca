import { test, expect, type Page } from "@playwright/test";

/**
 * #63 — support + legal-assistance channels reachable from any authenticated
 * area, with technical support and legal assistance clearly separated.
 */

function email() {
  return `help63${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function register(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Ayuda SL");
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
  await page.goto("/panel");
}

test("the help centre is reachable from the panel nav and shows separated channels", async ({
  page,
}) => {
  await register(page);

  // Reachable from the panel nav on any page.
  await page.getByRole("link", { name: "Ayuda" }).first().click();
  await expect(page).toHaveURL(/\/panel\/ayuda/);

  const tech = page.getByTestId("support-tech-channels");
  const legal = page.getByTestId("support-legal-channels");
  await expect(tech).toBeVisible();
  await expect(legal).toBeVisible();

  // #86 p6: technical support leads with WhatsApp + email — no conventional
  // phone as a primary channel, and an "open a ticket" form on the page.
  await expect(tech.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(tech.locator('a[href^="mailto:"]')).toHaveCount(1);
  await expect(tech.locator('a[href*="wa.me"]')).toHaveCount(1);
  await expect(page.getByTestId("ticket-submit")).toBeVisible();

  // Legal assistance is a distinct section, its own channel + prudent wording.
  await expect(page.getByRole("heading", { name: /Asistencia jurídica/ })).toBeVisible();
  await expect(page.locator("#contenido")).toContainText("no garantiza ningún resultado");
  await expect(legal.locator('a[href*="wa.me"]')).toHaveCount(1);
  await expect(legal.locator('a[href$="info@praetoriaabogados.es"]')).toHaveCount(1);
});

test("the account menu links to help too", async ({ page }) => {
  await register(page);
  await page.getByTestId("account-menu").click();
  await page.getByRole("link", { name: "Ayuda y soporte" }).click();
  await expect(page).toHaveURL(/\/panel\/ayuda/);
});
