import { test, expect, type Page } from "@playwright/test";

/**
 * AUTH #38 — every business entrypoint reaches the right context, with no
 * duplicate companies, broken invites or open redirects. (The Google OAuth
 * handshake is a later slice; this covers the email/claim/invite paths.)
 */

const rnd = () => `${Date.now()}${Math.floor(Math.random() * 1e5)}`;

async function register(page: Page): Promise<string> {
  const email = `u${rnd()}@example.com`;
  await page.goto("/registro");
  await page.fill("#email", email);
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", `Entrypoints SL ${rnd()}`);
  await page.fill("#companyNif", "B12345674");
  await page.getByTestId("accept-terms").check();
  await page.getByTestId("register-submit").click();
  await expect(page).toHaveURL(/\/verificar-email/);
  await page.goto("/panel");
  return email;
}

test.describe("AUTH #38 — business-ready entrypoints", () => {
  test("a safe internal `next` is honoured after login; an external one is ignored", async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const email = await register(page);

    // log out, then log back in with a safe next → lands there
    await page.goto("/");
    await page.getByTestId("account-menu").click();
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/logout")),
      page.getByTestId("logout").click(),
    ]);
    await page.goto("/entrar?next=%2Fpanel%2Fhistorico");
    await page.fill("#email", email);
    await page.fill("#password", "Supersecret123!");
    await page.getByTestId("register-submit").click();
    await expect(page).toHaveURL(/\/panel\/historico$/);

    // log out, log in with an OPEN-REDIRECT next → forced to /panel
    await page.goto("/");
    await page.getByTestId("account-menu").click();
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/logout")),
      page.getByTestId("logout").click(),
    ]);
    await page.goto("/entrar?next=https%3A%2F%2Fevil.example.com");
    await page.fill("#email", email);
    await page.fill("#password", "Supersecret123!");
    await page.getByTestId("register-submit").click();
    await expect(page).toHaveURL(/\/panel$/);
    expect(page.url()).not.toContain("evil.example.com");

    await ctx.close();
  });

  test("an expired/unknown invite link shows a recovery path, never a new company form", async ({
    page,
  }) => {
    await page.goto("/registro?invite=totally-unknown-token-000000000000");
    await expect(page.getByRole("heading", { name: "Invitación no válida" })).toBeVisible();
    await expect(page.locator("#companyName")).toHaveCount(0);
    await expect(page.getByTestId("invalid-invite-login")).toHaveAttribute("href", "/entrar");
  });

  test("an already-logged-in visitor to /entrar or /registro goes straight to the panel", async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await register(page);
    await page.goto("/entrar");
    await expect(page).toHaveURL(/\/panel$/);
    await page.goto("/registro");
    await expect(page).toHaveURL(/\/panel$/);
    await ctx.close();
  });
});
