import { test, expect, type Page } from "@playwright/test";

/**
 * #84 — granular commercial-treatment consent. This file covers the settings
 * surface (registration opt-in + /panel/privacidad); the per-DeCA capture and
 * the issue's 8 minimum cases are in the same file once slice 3 lands.
 */

function email() {
  return `cc84${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function register(page: Page, opts: { commercialOptIn?: boolean } = {}) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Consentimiento SL");
  await page.fill("#companyNif", "B12345674");
  await page.fill("#companyContactName", "Ana Ejemplo");
  await page.fill("#companyPhone", "600111222");
  await page.fill("#companyEmail", "empresa@example.com");
  await page.fill("#companyAddress", "Calle Prueba 1");
  await page.fill("#companyPostalCode", "46540");
  await page.fill("#companyCity", "El Puig");
  await page.getByTestId("accept-terms").check();
  if (opts.commercialOptIn) await page.getByTestId("commercial-opt-in").check();
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
    page.getByTestId("register-submit").click(),
  ]);
  await page.request.get(`/verificar-email/${(await res.json()).verifyTestToken}`);
}

test.describe("#84 — commercial-treatment settings", () => {
  test("registration checkbox is unchecked by default and never blocks signup", async ({
    page,
  }) => {
    await page.goto("/registro");
    await expect(page.getByTestId("commercial-opt-in")).not.toBeChecked();
    // sign up WITHOUT ticking it
    await register(page);
    await page.goto("/panel/privacidad");
    await expect(page.getByTestId("mode-none")).toBeChecked();
  });

  test("ticking the registration checkbox sets the global mode to 'all'", async ({ page }) => {
    await register(page, { commercialOptIn: true });
    await page.goto("/panel/privacidad");
    await expect(page.getByTestId("mode-all")).toBeChecked();
    // and the exact-fields preview + revoke control are shown
    await expect(page.getByTestId("commercial-preview")).toBeVisible();
    await expect(page.getByTestId("commercial-revoke")).toBeVisible();
  });

  test("owner can move between the three modes and revoke; each persists", async ({ page }) => {
    await register(page);
    await page.goto("/panel/privacidad");
    const consentSaved = () =>
      page.waitForResponse((r) => r.url().includes("/api/company/consent") && r.ok());

    await Promise.all([consentSaved(), page.getByTestId("mode-per_deca").check()]);
    await page.reload();
    await expect(page.getByTestId("mode-per_deca")).toBeChecked();

    await Promise.all([consentSaved(), page.getByTestId("mode-all").check()]);
    await page.reload();
    await expect(page.getByTestId("mode-all")).toBeChecked();

    page.on("dialog", (d) => d.accept());
    await Promise.all([consentSaved(), page.getByTestId("commercial-revoke").click()]);
    await page.reload();
    await expect(page.getByTestId("mode-none")).toBeChecked();
  });

  test("channel 'email' hides the phone field and vice-versa", async ({ page }) => {
    await register(page, { commercialOptIn: true });
    await page.goto("/panel/privacidad");
    await page.getByTestId("commercial-channel").selectOption("email");
    await expect(page.getByTestId("commercial-email")).toBeVisible();
    await expect(page.getByTestId("commercial-phone")).toHaveCount(0);
    await expect(page.getByTestId("commercial-preview")).toContainText(
      "Correo electrónico autorizado",
    );
    await page.getByTestId("commercial-channel").selectOption("phone");
    await expect(page.getByTestId("commercial-phone")).toBeVisible();
    await expect(page.getByTestId("commercial-email")).toHaveCount(0);
  });

  test("a non-owner member sees the setting read-only", async ({ browser }) => {
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    await register(owner);
    await owner.goto("/panel/equipo");
    const memberEmail = email();
    await owner.fill('[data-testid="invite-email"]', memberEmail);
    await owner.getByTestId("invite-submit").click();
    const link = (await owner.locator("p.font-mono").first().textContent())!.trim();

    const memberCtx = await browser.newContext();
    const member = await memberCtx.newPage();
    await member.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await member.fill("#email", memberEmail);
    await member.fill("#password", "Supersecret123!");
    await member.getByTestId("register-submit").click();
    await expect(member).toHaveURL(/\/verificar-email/);

    await member.goto("/panel/privacidad");
    await expect(member.getByTestId("mode-none")).toBeDisabled();
    await expect(member.getByText("Solo el administrador de la empresa")).toBeVisible();

    await ownerCtx.close();
    await memberCtx.close();
  });
});
