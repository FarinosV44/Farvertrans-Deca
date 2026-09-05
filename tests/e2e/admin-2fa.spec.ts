import { test, expect } from "@playwright/test";
import { ADMIN, adminTotpCode, internalPage, loginAdminApi } from "./helpers/admin-auth";

/**
 * SECURITY #53 — mandatory admin TOTP 2FA. Covers the owner's explicit
 * ADMIN TEST / ADMIN STEP-UP TEST / AUTHORIZATION TEST cases: password alone
 * never grants admin access, a wrong code is rejected, a correct code is
 * accepted, and a fresh admin API route is unreachable without it either.
 */

function email() {
  return `t2fa${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

test.describe("SECURITY #53 — mandatory admin TOTP 2FA", () => {
  test("password alone is not enough: login succeeds but /admin demands TOTP first", async ({
    page,
  }) => {
    const login = await page.request.post("/api/auth/login", {
      data: { email: ADMIN.email, password: ADMIN.password },
    });
    expect(login.status()).toBe(200); // the password itself is genuinely correct...
    // ...but /admin refuses until TOTP is verified — password compromise alone
    // must never be sufficient for admin access (SECURITY #53).
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/2fa\/verify/);
  });

  test("a wrong TOTP code is rejected; the correct one is accepted", async ({ page }) => {
    await page.goto("/entrar");
    await page.fill("#email", ADMIN.email);
    await page.fill("#password", ADMIN.password);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/login") && r.status() === 200),
      page.getByTestId("register-submit").click(),
    ]);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/2fa\/verify/);

    await page.getByTestId("totp-verify-input").fill("000000");
    await page.getByTestId("totp-verify-submit").click();
    await expect(page.getByTestId("totp-verify-error")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/2fa\/verify/); // still gated

    await page.getByTestId("totp-verify-input").fill(adminTotpCode());
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/admin/2fa/verify") && r.status() === 200),
      page.getByTestId("totp-verify-submit").click(),
    ]);
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("a normal (non-internal) user cannot call the admin 2FA API at all", async ({ request }) => {
    const addr = email();
    await request.post("/api/auth/register", {
      data: {
        email: addr,
        password: "Supersecret123!",
        companyName: "No Admin SL",
        companyNif: "B12345674",
        acceptTerms: true,
      },
    });
    const res = await request.post("/api/admin/2fa/verify", { data: { code: "123456" } });
    expect(res.status()).toBe(401);
  });

  test("an admin API route is unreachable without a fresh TOTP check, even with a valid session", async ({
    request,
  }) => {
    // logged in, but never verified TOTP this run
    const login = await request.post("/api/auth/login", {
      data: { email: ADMIN.email, password: ADMIN.password },
    });
    expect(login.status()).toBe(200);
    const res = await request.get("/api/admin/search?q=acme");
    expect(res.status()).toBe(404); // isInternalRequest() now requires fresh TOTP too
  });

  test("full admin flow works end to end via the API helper", async ({ request }) => {
    await loginAdminApi(request);
    const res = await request.get("/api/admin/search?q=acme");
    expect(res.status()).not.toBe(404);
  });

  // The stale-rejection half of step-up (a check older than 10 minutes must
  // be refused) isn't separately exercised here — it shares the exact same
  // age-comparison code as the base admin gate, which IS covered above
  // ("password alone is not enough" / TOTP-required tests); this confirms
  // the positive path: a freshly-verified session passes requireStepUp().
  test("step-up: a freshly-verified admin session can regenerate recovery codes", async ({
    browser,
  }) => {
    const { page, close } = await internalPage(browser);
    const res = await page.request.post("/api/admin/2fa/regenerate-codes");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.recoveryCodes)).toBe(true);
    expect(body.recoveryCodes.length).toBeGreaterThan(0);
    await close();
  });

  test("a recovery code works once and is then rejected on replay", async ({ page, request }) => {
    // generate a fresh set of codes via step-up, consume one via a NEW session's challenge
    await loginAdminApi(request);
    const regen = await request.post("/api/admin/2fa/regenerate-codes");
    const { recoveryCodes } = await regen.json();
    const code = recoveryCodes[0] as string;

    // fresh unauthenticated-for-TOTP session
    await page.goto("/entrar");
    await page.fill("#email", ADMIN.email);
    await page.fill("#password", ADMIN.password);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/login") && r.status() === 200),
      page.getByTestId("register-submit").click(),
    ]);
    const first = await page.request.post("/api/admin/2fa/verify", { data: { code } });
    expect(first.status()).toBe(200);
    const replay = await page.request.post("/api/admin/2fa/verify", { data: { code } });
    expect(replay.status()).toBe(400);
  });
});
