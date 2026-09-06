import type { APIRequestContext, Browser, Page } from "@playwright/test";
import { totpAt } from "@/lib/auth/totp";
import { ADMIN_TEST_TOTP_SECRET } from "../../fixtures/admin-totp-secret";

/**
 * The seeded local/test internal user (`prisma/seed.ts`) — pre-enrolled in
 * TOTP so every e2e admin login exercises the REAL mandatory-2FA challenge
 * (SECURITY #53) rather than bypassing it.
 */
export const ADMIN = { email: "admin@farvertrans.local", password: "admin-dev-only" };

/** A currently-valid 6-digit code for the seeded admin's fixed TOTP secret. */
export function adminTotpCode(): string {
  return totpAt(ADMIN_TEST_TOTP_SECRET);
}

/** Full API login: password, then the TOTP challenge, on the given request context. */
export async function loginAdminApi(request: APIRequestContext): Promise<void> {
  const res = await request.post("/api/auth/login", { data: ADMIN });
  if (!res.ok()) throw new Error(`admin login failed: ${res.status()}`);
  const verify = await request.post("/api/admin/2fa/verify", {
    data: { code: adminTotpCode() },
  });
  if (!verify.ok()) throw new Error(`admin TOTP verify failed: ${verify.status()}`);
}

const baseURL = `http://localhost:${process.env.PORT ?? "3000"}`;

/** Full UI login (password form → TOTP challenge screen) in a fresh browser context. */
export async function internalPage(
  browser: Browser,
): Promise<{ page: Page; close: () => Promise<void> }> {
  const ctx = await browser.newContext({ baseURL });
  const page = await ctx.newPage();
  await page.goto("/entrar");
  await page.fill("#email", ADMIN.email);
  await page.fill("#password", ADMIN.password);
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/login") && r.status() === 200),
    page.getByTestId("register-submit").click(),
  ]);
  // The first admin page load bounces to the TOTP challenge (SECURITY #53).
  await page.goto("/admin");
  await page.waitForURL(/\/admin\/2fa\/verify/);
  await page.getByTestId("totp-verify-input").fill(adminTotpCode());
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/admin/2fa/verify") && r.status() === 200),
    page.getByTestId("totp-verify-submit").click(),
  ]);
  await page.waitForURL(/\/admin$/);
  return { page, close: () => ctx.close() };
}
