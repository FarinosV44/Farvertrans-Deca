import { test, expect } from "@playwright/test";
import { totpAt } from "@/lib/auth/totp";
import { addVirtualAuthenticator, createFreshInternalUser } from "./helpers/webauthn";

/**
 * SECURITY #53 passkey follow-up — passkey-primary / TOTP-fallback admin
 * 2FA. Covers the brief's explicit test list: passkey login, TOTP fallback,
 * recovery codes, and trusted-device behaviour. `admin-2fa.spec.ts` already
 * covers the pre-existing TOTP-only account and step-up paths in full; this
 * file only adds what's genuinely new.
 */

async function loginPassword(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  await page.goto("/entrar");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/login") && r.status() === 200),
    page.getByTestId("register-submit").click(),
  ]);
}

test.describe("SECURITY #53 passkey follow-up", () => {
  test("passkey-primary setup enrolls a fresh admin and grants /admin access", async ({ page }) => {
    const { email, password } = await createFreshInternalUser();
    await addVirtualAuthenticator(page);
    await loginPassword(page, email, password);

    await page.goto("/admin");
    await page.waitForURL(/\/admin\/2fa\/setup/);
    await expect(page.getByTestId("setup-passkey-start")).toBeVisible();
    await expect(page.getByTestId("setup-use-totp")).toBeVisible(); // fallback never hidden

    await page.getByTestId("setup-passkey-start").click();
    await expect(page.getByTestId("recovery-codes")).toBeVisible();
    const codes = await page.getByTestId("recovery-codes").locator("li").allTextContents();
    expect(codes.length).toBeGreaterThan(0);

    await page.getByTestId("totp-setup-continue").click();
    await page.waitForURL(/\/admin$/);
  });

  test("TOTP fallback from the choice screen still works end to end", async ({ page }) => {
    const { email, password } = await createFreshInternalUser();
    await loginPassword(page, email, password);

    await page.goto("/admin");
    await page.waitForURL(/\/admin\/2fa\/setup/);
    await page.getByTestId("setup-use-totp").click();
    await expect(page.getByTestId("totp-qr")).toBeVisible();

    await page.locator("details summary").click();
    const secret = (await page.getByTestId("totp-manual-secret").innerText()).trim();
    await page.getByTestId("totp-code-input").fill(totpAt(secret));
    await page.getByTestId("totp-setup-confirm").click();

    await expect(page.getByTestId("recovery-codes")).toBeVisible();
    await page.getByTestId("totp-setup-continue").click();
    await page.waitForURL(/\/admin$/);
  });

  test("no platform authenticator: setup leads with TOTP, not the cross-device passkey QR", async ({
    page,
  }) => {
    // Force `platformAuthenticatorIsAvailable()` false — a desktop without
    // Windows Hello / Touch ID (the dev machine running the suite may actually
    // have one, so we stub it). Leading with the passkey there sends the admin
    // into a hybrid-transport QR the phone hangs on "conectando…"; the choice
    // screen must lead with the code app instead.
    await page.addInitScript(() => {
      if (window.PublicKeyCredential) {
        window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = () =>
          Promise.resolve(false);
      }
    });
    const { email, password } = await createFreshInternalUser();
    await loginPassword(page, email, password);

    await page.goto("/admin");
    await page.waitForURL(/\/admin\/2fa\/setup/);

    // TOTP is the primary call to action (solid button), passkey is demoted.
    const totpBtn = page.getByTestId("setup-use-totp");
    await expect(totpBtn).toBeVisible();
    await expect(totpBtn).toHaveClass(/bg-\[var\(--color-primary\)\]/);
    await expect(page.getByTestId("setup-passkey-start")).not.toHaveClass(
      /bg-\[var\(--color-primary\)\]/,
    );

    await totpBtn.click();
    await expect(page.getByTestId("totp-qr")).toBeVisible();
  });

  test("passkey login: the verify screen's Face ID button completes a fresh session", async ({
    page,
  }) => {
    const { email, password } = await createFreshInternalUser();
    await addVirtualAuthenticator(page);
    await loginPassword(page, email, password);

    await page.goto("/admin");
    await page.waitForURL(/\/admin\/2fa\/setup/);
    await page.getByTestId("setup-passkey-start").click();
    await expect(page.getByTestId("recovery-codes")).toBeVisible();
    await page.getByTestId("totp-setup-continue").click();
    await page.waitForURL(/\/admin$/);

    // fresh session, no `tv` yet — must hit the verify challenge again
    await page.request.post("/api/auth/logout");
    await loginPassword(page, email, password);
    await page.goto("/admin");
    await page.waitForURL(/\/admin\/2fa\/verify/);

    await expect(page.getByTestId("passkey-verify-start")).toBeVisible();
    await expect(page.getByTestId("totp-verify-input")).toBeVisible(); // fallback stays usable
    await page.getByTestId("passkey-verify-start").click();
    await page.waitForURL(/\/admin$/);
  });

  test('"trust this device" grants /admin access without re-verifying next time', async ({
    page,
  }) => {
    const { email, password } = await createFreshInternalUser();
    await loginPassword(page, email, password);
    await page.goto("/admin");
    await page.waitForURL(/\/admin\/2fa\/setup/);
    await page.getByTestId("setup-use-totp").click();
    await page.locator("details summary").click();
    const secret = (await page.getByTestId("totp-manual-secret").innerText()).trim();
    await page.getByTestId("totp-code-input").fill(totpAt(secret));
    await page.getByTestId("totp-setup-confirm").click();
    await page.getByTestId("totp-setup-continue").click();
    await page.waitForURL(/\/admin$/);

    await page.request.post("/api/auth/logout");
    await loginPassword(page, email, password);
    await page.goto("/admin");
    await page.waitForURL(/\/admin\/2fa\/verify/);

    await page.getByTestId("trust-device-checkbox").check();
    await page.getByTestId("totp-verify-input").fill(totpAt(secret));
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/admin/2fa/trust-device") && r.ok()),
      page.getByTestId("totp-verify-submit").click(),
    ]);
    await page.waitForURL(/\/admin$/);

    // a brand-new session (password only, no TOTP check at all) on the SAME
    // browser/device must reach /admin directly — the trusted-device cookie
    // stands in for a fresh 2FA check.
    await page.request.post("/api/auth/logout");
    await loginPassword(page, email, password);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("security screen lists the passkey and blocks removing the last strong-auth method", async ({
    page,
  }) => {
    const { email, password } = await createFreshInternalUser();
    await addVirtualAuthenticator(page);
    await loginPassword(page, email, password);
    await page.goto("/admin");
    await page.waitForURL(/\/admin\/2fa\/setup/);
    await page.getByTestId("setup-passkey-start").click();
    await expect(page.getByTestId("recovery-codes")).toBeVisible();
    await page.getByTestId("totp-setup-continue").click();
    await page.waitForURL(/\/admin$/);

    await page.goto("/admin/seguridad");
    await expect(page.getByTestId("passkey-remove")).toHaveCount(1);
    await expect(page.getByTestId("totp-configure-button")).toBeVisible();
    await expect(page.getByTestId("recovery-remaining")).toHaveText("10");

    // the only strong-auth method on this account — must be refused, not silently removed
    await page.getByTestId("passkey-remove").click();
    await expect(page.getByTestId("passkey-add-error")).toBeVisible();
    await expect(page.getByTestId("passkey-remove")).toHaveCount(1);
  });
});
