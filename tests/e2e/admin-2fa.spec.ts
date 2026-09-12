import { test, expect, type Page } from "@playwright/test";
import { ADMIN, adminTotpCode, internalPage, loginAdminApi } from "./helpers/admin-auth";
import { PrismaClient } from "@/prisma/generated/client";
import { scryptSync, randomBytes } from "node:crypto";
import { totpAt } from "@/lib/auth/totp";
import { ADMIN_TEST_TOTP_SECRET } from "../fixtures/admin-totp-secret";

const prisma = new PrismaClient();
function hashPw(p: string) {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("hex")}$${scryptSync(p, salt, 64).toString("hex")}`;
}

/** A fresh internal user with TOTP enrolled (isolated backup-lockout counter). */
async function freshTotpAdmin(): Promise<{ email: string; password: string }> {
  const addr = `t91${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
  const password = "Supersecret123!";
  await prisma.user.create({
    data: {
      authUserId: `local:test-${addr}`,
      email: addr,
      passwordHash: hashPw(password),
      role: "internal",
      totpSecret: ADMIN_TEST_TOTP_SECRET,
      totpEnabledAt: new Date(),
    },
  });
  return { email: addr, password };
}

async function loginPw(page: Page, e: string, p: string) {
  await page.goto("/entrar");
  await page.fill("#email", e);
  await page.fill("#password", p);
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/login") && r.status() === 200),
    page.getByTestId("register-submit").click(),
  ]);
}

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

  test("#91: the backup password grants Super Admin access; a wrong one is rejected generically", async ({
    page,
  }) => {
    const { email, password } = await freshTotpAdmin();
    await loginPw(page, email, password);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/2fa\/verify/);

    // the code input is always available; the backup option sits below it
    await expect(page.getByTestId("totp-verify-input")).toBeVisible();
    await page.getByTestId("use-backup-password").click();
    await expect(page.getByTestId("backup-password-input")).toBeVisible();

    // wrong password → generic 400 error, still gated
    await page.getByTestId("backup-password-input").fill("definitely-not-it");
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/admin/2fa/backup") && r.status() === 400),
      page.getByTestId("backup-password-submit").click(),
    ]);
    await expect(page.getByTestId("backup-password-error")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/2fa\/verify/);

    // correct password → same Super Admin session as TOTP, lands on /admin
    await page.getByTestId("backup-password-input").fill("e2e-backup-Sup3r!");
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/admin/2fa/backup") && r.status() === 200),
      page.getByTestId("backup-password-submit").click(),
    ]);
    await expect(page).toHaveURL(/\/admin$/);
    // an admin API route that requires a fresh strong-auth check now works
    const res = await page.request.get("/api/admin/search?q=acme");
    expect(res.status()).not.toBe(404);
  });

  test("#91: the backup endpoint needs a normal session — never replaces the app login", async ({
    request,
  }) => {
    const res = await request.post("/api/admin/2fa/backup", {
      data: { password: "e2e-backup-Sup3r!" },
    });
    expect(res.status()).toBe(401); // not logged in at all
  });

  test("#91: repeated wrong backup passwords lock the admin out (even the correct one)", async ({
    page,
  }) => {
    const { email, password } = await freshTotpAdmin();
    await loginPw(page, email, password);
    for (let i = 0; i < 5; i++) {
      const r = await page.request.post("/api/admin/2fa/backup", {
        data: { password: `nope-${i}` },
      });
      expect(r.status()).toBe(400);
    }
    const locked = await page.request.post("/api/admin/2fa/backup", {
      data: { password: "e2e-backup-Sup3r!" },
    });
    expect(locked.status()).toBe(429);
  });

  test("#91: TOTP still works alongside the backup option", async ({ page }) => {
    const { email, password } = await freshTotpAdmin();
    await loginPw(page, email, password);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/2fa\/verify/);
    await page.getByTestId("totp-verify-input").fill(totpAt(ADMIN_TEST_TOTP_SECRET));
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/admin/2fa/verify") && r.status() === 200),
      page.getByTestId("totp-verify-submit").click(),
    ]);
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("#86 p7: after verifying, the admin stays in and is not bounced back to the 2FA screen", async ({
    browser,
  }) => {
    const { page, close } = await internalPage(browser); // lands on /admin
    // reload + navigate around — a stale prefetched /admin redirect used to
    // send the user straight back to /admin/2fa/verify here
    await page.reload();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/contenido");
    await expect(page).toHaveURL(/\/admin\/contenido$/);
    await expect(page).not.toHaveURL(/2fa/);
    // hitting the challenge screen directly with a fresh session bounces to /admin
    await page.goto("/admin/2fa/verify");
    await expect(page).toHaveURL(/\/admin$/);
    await close();
  });

  test("#86 p7: the 2FA challenge always shows the code input (never hidden behind a passkey)", async ({
    page,
  }) => {
    await page.goto("/entrar");
    await page.fill("#email", ADMIN.email);
    await page.fill("#password", ADMIN.password);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/login") && r.status() === 200),
      page.getByTestId("register-submit").click(),
    ]);
    await page.goto("/admin/2fa/verify");
    await expect(page.getByTestId("totp-verify-input")).toBeVisible();
    await expect(page.getByTestId("totp-verify-submit")).toBeVisible();
  });

  test("a normal (non-internal) user cannot call the admin 2FA API at all", async ({ request }) => {
    const addr = email();
    await request.post("/api/auth/register", {
      data: {
        email: addr,
        password: "Supersecret123!",
        companyName: "No Admin SL",
        companyNif: "B12345674",
        companyContactName: "Ana Ejemplo",
        companyPhone: "600111222",
        companyEmail: "empresa@example.com",
        companyAddress: "Calle Prueba 1",
        companyPostalCode: "46540",
        companyCity: "El Puig",
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

  // Same D-184/D-194 defect class as `admin-account-lifecycle.spec.ts`'s
  // "#62 correction" test, reintroduced in `SecurityScreen`'s `StepUpNotice`
  // (shared by 4 step-up actions on /admin/seguridad): its "Verificar ahora"
  // link carried `next` but not `stepup=1`, so it used the 12h admin-freshness
  // check instead of the 10-minute step-up window and could bounce the admin
  // back without ever re-challenging.
  test("SecurityScreen's step-up notice (regenerate codes) links with next AND stepup=1", async ({
    browser,
  }) => {
    const { page, close } = await internalPage(browser);
    try {
      await page.route("**/api/admin/2fa/regenerate-codes", async (route) => {
        await route.fulfill({ status: 403, contentType: "application/json", body: "{}" });
      });
      await page.goto("/admin/seguridad");
      await page.getByTestId("regenerate-codes-button").click();

      const verificar = page.getByTestId("step-up-notice").getByRole("link");
      await expect(verificar).toHaveAttribute(
        "href",
        "/admin/2fa/verify?next=/admin/seguridad&stepup=1",
      );
      await verificar.click();
      await page.waitForURL(/\/admin\/seguridad$/);
    } finally {
      await close();
    }
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
