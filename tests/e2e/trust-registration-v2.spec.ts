import { test, expect, type Page } from "@playwright/test";

/**
 * TRUST #42 / GROWTH #46 — Praetoria legal identity, versioned terms
 * acceptance, the lightweight identity gate on the first anonymous DeCA, and
 * the dedicated email-confirmation screen.
 */

function email() {
  return `t42${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function fillWizardThroughStep1(page: Page) {
  await page.fill("#shipperName", "Cargas SL");
  await page.fill("#shipperNif", "B96789011");
  await page.fill("#shipperAddress", "Calle 1, Valencia");
  await page.fill("#carrierName", "Trans SL");
  await page.fill("#carrierNif", "B12345674");
  await page.fill("#carrierAddress", "Calle 5, Paterna");
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
}

test.describe("TRUST #42 — Praetoria legal identity", () => {
  test("legal pages and the footer name the operating entity", async ({ page }) => {
    await page.goto("/aviso-legal");
    await expect(page.getByText("PRAETORIA, S.L.").first()).toBeVisible();
    await expect(page.getByText("B21810452").first()).toBeVisible();

    await page.goto("/privacidad");
    await expect(page.getByText("Responsable del tratamiento")).toBeVisible();
    await expect(page.getByText("PRAETORIA, S.L.").first()).toBeVisible();

    await page.goto("/terminos");
    await expect(page.locator("h1")).toHaveText("Términos y condiciones");

    await page.goto("/");
    await expect(page.getByTestId("footer-operator")).toContainText("PRAETORIA, S.L.");
  });
});

test.describe("TRUST #42 §5 — versioned terms acceptance", () => {
  test("registration is blocked until Terms + Privacy are accepted", async ({ page }) => {
    await page.goto("/registro");
    await page.fill("#email", email());
    await page.fill("#password", "supersecret123");
    await page.fill("#companyName", "Terminos SL");
    await page.fill("#companyNif", "B12345674");
    await page.getByTestId("register-submit").click();
    await expect(page.getByRole("alert").first()).toContainText("Términos y Condiciones");
    await expect(page).toHaveURL(/\/registro$/);

    await page.getByTestId("accept-terms").check();
    await page.getByTestId("register-submit").click();
    await expect(page).toHaveURL(/\/verificar-email/);
  });
});

test.describe("GROWTH #46 — email confirmation screen", () => {
  test("shows the dedicated confirmation screen and a working verify link", async ({ page }) => {
    await page.goto("/registro");
    await page.fill("#email", email());
    await page.fill("#password", "supersecret123");
    await page.fill("#companyName", "Confirmacion SL");
    await page.fill("#companyNif", "B12345674");
    await page.getByTestId("accept-terms").check();
    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
      page.getByTestId("register-submit").click(),
    ]);
    const body = await res.json();

    await expect(page).toHaveURL(/\/verificar-email/);
    await expect(
      page.getByRole("heading", { name: "Confirma tu correo electrónico" }),
    ).toBeVisible();
    await expect(page.getByTestId("verify-email-address")).toBeVisible();

    // "Ya he confirmado mi cuenta" never traps the user — it always leaves.
    await page.getByTestId("verify-email-continue").click();
    await expect(page).toHaveURL(/\/panel$/);

    // unverified accounts see a reminder banner in the panel
    await expect(page.getByTestId("panel-verify-email-banner")).toBeVisible();

    // the emailed link actually verifies the account
    expect(body.verifyTestToken).toBeTruthy();
    await page.goto(`/verificar-email/${body.verifyTestToken}`);
    await expect(page.getByTestId("verify-email-success")).toBeVisible();

    // visiting /verificar-email again now redirects straight past it
    await page.goto("/verificar-email");
    await expect(page).toHaveURL(/\/panel$/);

    // the reminder banner is gone once verified
    await expect(page.getByTestId("panel-verify-email-banner")).not.toBeVisible();
  });

  test("an invalid token shows a clear error, never a crash", async ({ page }) => {
    await page.goto("/verificar-email/not-a-real-token");
    await expect(page.getByTestId("verify-email-error")).toBeVisible();
  });
});

test.describe("TRUST #42 §3/§4 — lightweight identity gate", () => {
  test("the anonymous wizard asks for name + email before generating, then gates the next DeCA", async ({
    page,
  }) => {
    await page.goto("/crear");
    await fillWizardThroughStep1(page);

    // cannot generate without the lightweight identity
    await page.getByTestId("wizard-generate").click();
    await expect(page.getByTestId("error-summary")).toBeVisible();
    await expect(page).toHaveURL(/\/crear$/);

    await page.fill("#leadName", "Ana García");
    await page.fill("#leadEmail", "ana@example.com");
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });

    // the SAME anonymous browser is sent to registration for the next one
    await page.goto("/crear");
    await expect(page.getByRole("heading", { name: "Ya has creado tu primer DeCA" })).toBeVisible();
    await expect(page.getByTestId("lead-gate-register")).toHaveAttribute(
      "href",
      "/registro?next=%2Fcrear",
    );
  });
});
