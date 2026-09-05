import { test, expect } from "@playwright/test";

/**
 * AUTH #30 (UI) — the premium auth card. The Google handshake is a later slice;
 * this covers what the redesign ships now: the focused card, the Google button
 * present but inert, password show/hide, contextual headings, mode switch.
 */

test.describe("AUTH #30 — premium auth card", () => {
  test("login screen: focused card, no site nav, Google button present but inert", async ({
    page,
  }) => {
    await page.goto("/entrar");
    await expect(page.getByRole("heading", { name: "Bienvenido de nuevo" })).toBeVisible();
    // No customer site chrome during auth.
    await expect(page.getByTestId("header-login")).toHaveCount(0);

    const google = page.getByRole("button", { name: "Continuar con Google" });
    await expect(google).toBeVisible();
    await expect(google).toBeDisabled();
    await expect(page.getByText("disponible muy pronto")).toBeVisible();

    // The brand wordmark links home.
    await expect(page.getByRole("link", { name: "DeCA Fácil — inicio" })).toBeVisible();
  });

  test("password show/hide toggles the field type", async ({ page }) => {
    await page.goto("/entrar");
    const pw = page.locator("#password");
    await pw.fill("Supersecret123!");
    await expect(pw).toHaveAttribute("type", "password");
    await page.getByTestId("password-toggle").click();
    await expect(pw).toHaveAttribute("type", "text");
    await page.getByTestId("password-toggle").click();
    await expect(pw).toHaveAttribute("type", "password");
  });

  test("mode switch flips login ⇆ register in place", async ({ page }) => {
    await page.goto("/entrar");
    await expect(page.getByRole("heading", { name: "Bienvenido de nuevo" })).toBeVisible();
    await page.getByTestId("auth-mode-toggle").click();
    await expect(page.getByRole("heading", { name: "Crea tu cuenta gratis" })).toBeVisible();
    await expect(page.locator("#companyName")).toBeVisible();
    await page.getByTestId("auth-mode-toggle").click();
    await expect(page.getByRole("heading", { name: "Bienvenido de nuevo" })).toBeVisible();
  });
});
