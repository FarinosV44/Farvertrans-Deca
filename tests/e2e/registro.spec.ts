import { test, expect } from "@playwright/test";

/**
 * The "generate first, register second" anonymous-claim flow (BUILD 09) was
 * briefly retired by D-052/PRIORITY 1, then restored by D-060 (owner
 * directive): an anonymous visitor generates their first DeCA with just a
 * name + email, and `/registro?claim=<token>` converts that document into a
 * real account's — covered end to end in `launch-happy-path.spec.ts` and
 * `trust-registration-v2.spec.ts`, not duplicated here.
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
