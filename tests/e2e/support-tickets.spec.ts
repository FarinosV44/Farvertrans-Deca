import { test, expect, type Page } from "@playwright/test";
import { internalPage } from "./helpers/admin-auth";

/**
 * #86 part 5 — a message from "Asistencia técnica" becomes a tracked ticket
 * that the superadmin sees, answers and can move through the five states.
 */

function email() {
  return `sup${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function registerCompany(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Soporte Test SL");
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

test("a technical ticket reaches the superadmin, is answered and moved through states", async ({
  browser,
}) => {
  const userCtx = await browser.newContext();
  const user = await userCtx.newPage();
  await registerCompany(user);
  const subject = `No genera el PDF ${Date.now()}`;

  // open a ticket
  await user.goto("/panel/ayuda");
  await user.getByTestId("ticket-category").selectOption("generacion");
  await user.fill('[data-testid="ticket-subject"]', subject);
  await user.fill(
    '[data-testid="ticket-body"]',
    "Al pulsar GENERAR DECA no descarga nada y sale un error.",
  );
  const [createRes] = await Promise.all([
    user.waitForResponse((r) => r.url().endsWith("/api/support") && r.status() === 201),
    user.getByTestId("ticket-submit").click(),
  ]);
  const ticketId = (await createRes.json()).id as string;
  await expect(user.getByTestId("support-ticket-sent")).toBeVisible();
  await user.reload();
  await expect(user.getByTestId("my-tickets")).toContainText(subject);

  // superadmin opens THIS ticket, replies and resolves it
  const { page: admin, close } = await internalPage(browser);
  await admin.goto("/admin/soporte");
  await expect(admin.getByRole("cell", { name: subject })).toBeVisible();
  await admin.goto(`/admin/soporte/${ticketId}`);
  await expect(admin.getByText("Al pulsar GENERAR DECA")).toBeVisible();

  await admin.fill('[data-testid="ticket-admin-reply"]', "Prueba a vaciar la caché y reintentar.");
  await Promise.all([
    admin.waitForResponse((r) => r.url().includes("/api/admin/support/") && r.ok()),
    admin.getByTestId("ticket-admin-reply-send").click(),
  ]);
  await expect(admin.getByText("Prueba a vaciar la caché")).toBeVisible();

  await admin.getByTestId("ticket-status").selectOption("resolved");
  await Promise.all([
    admin.waitForResponse((r) => r.url().includes("/api/admin/support/") && r.ok()),
    admin.getByTestId("ticket-status-save").click(),
  ]);

  // the user sees the reply and can respond
  await user.goto(`/panel/ayuda/${ticketId}`);
  await expect(user.getByText("Prueba a vaciar la caché y reintentar.")).toBeVisible();
  await user.fill('[data-testid="ticket-reply-body"]', "Ya funciona, gracias.");
  await Promise.all([
    user.waitForResponse((r) => r.url().includes("/reply") && r.ok()),
    user.getByTestId("ticket-reply-submit").click(),
  ]);
  await expect(user.getByText("Ya funciona, gracias.")).toBeVisible();

  // a non-internal user cannot reach the admin support area
  const probe = await user.request.get("/admin/soporte");
  expect(probe.status()).toBe(404);

  await userCtx.close();
  await close();
});
