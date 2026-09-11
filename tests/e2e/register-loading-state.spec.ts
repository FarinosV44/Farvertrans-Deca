import { test, expect } from "@playwright/test";

/**
 * D-204 — LIVE INCIDENT: a customer clicked "Crear cuenta gratis", saw no
 * immediate feedback, and thought registration had failed (it had actually
 * succeeded). This drives the real form in a real browser and asserts what
 * the user actually sees: an immediate, specific loading state; the button
 * disabled the instant it is clicked; a second click while busy never
 * reaches the server a second time.
 */
test.describe("D-204 — registration gives immediate, specific feedback and cannot double-submit", () => {
  test("the button disables immediately, shows a spinner + specific text, and a rapid second click sends only one request", async ({
    page,
  }) => {
    let registerRequests = 0;
    await page.route("**/api/auth/register", async (route) => {
      registerRequests++;
      // Artificial delay so the busy state has a real window to assert
      // against, regardless of how fast the real backend responds.
      await new Promise((r) => setTimeout(r, 400));
      await route.continue();
    });

    const rnd = Date.now() + Math.floor(Math.random() * 1e5);
    await page.goto("/registro");
    await page.fill("#email", `loading${rnd}@example.com`);
    await page.fill("#password", "Supersecret123!");
    await page.fill("#companyName", `Loading State SL ${rnd}`);
    await page.fill("#companyNif", "B12345674");
    await page.fill("#companyContactName", "Ana Ejemplo");
    await page.fill("#companyPhone", "600111222");
    await page.fill("#companyEmail", "empresa@example.com");
    await page.fill("#companyAddress", "Calle Prueba 1");
    await page.fill("#companyPostalCode", "46540");
    await page.fill("#companyCity", "El Puig");
    await page.getByTestId("accept-terms").check();

    const submit = page.getByTestId("register-submit");
    await submit.click();

    // Immediate feedback: disabled, specific text, a visible spinner — not
    // the generic "Un momento…" and not just an inert button.
    await expect(submit).toBeDisabled();
    await expect(submit).toContainText("Creando tu cuenta");
    await expect(submit.locator(".animate-spin")).toBeVisible();

    // A second click while busy must be a no-op — the button is disabled, so
    // this simulates the user impatiently clicking again during the delay.
    await submit.click({ force: true });

    await expect(page).toHaveURL(/\/verificar-email/, { timeout: 10_000 });
    expect(registerRequests).toBe(1);
  });
});
