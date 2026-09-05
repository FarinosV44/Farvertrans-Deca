import { test, expect } from "@playwright/test";

/**
 * The "generate first, register second" anonymous-claim flow (BUILD 09) was
 * retired by PRIORITY 1 (product hardening directive): a DeCA can no longer
 * be generated anonymously at all, so there is nothing left to claim on a NEW
 * signup. `/registro?claim=<token>` still exists server-side purely to honor
 * claim links already emailed to real users before this change (D-052) — that
 * legacy path is not covered here since it can no longer be produced by the
 * product and is exercised only by historical data, not new behavior.
 */

test.describe("BUILD 09 / GROWTH #46 — registration form", () => {
  test("keep signup short — no lead-qualification fields on the form", async ({ page }) => {
    await page.goto("/registro");
    const text = (await page.locator("form").innerText()).toLowerCase();
    // TRUST #42 / GROWTH #46 explicitly add persona de contacto + teléfono to the
    // required field set (D-043, supersedes D-021's "no lead-qualification fields"
    // for these two) — banned words narrowed to the ones still deliberately absent.
    for (const banned of ["flota", "facturación", "empleados", "presupuesto", "demo", "cargo"]) {
      expect(text).not.toContain(banned);
    }
  });
});
