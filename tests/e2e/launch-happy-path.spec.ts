import { test, expect, type Page } from "@playwright/test";
import { createHash } from "node:crypto";

/**
 * LAUNCH #20 — the public-ready DeCA happy path, end to end, from a clean
 * anonymous session. Automates the steps that CAN be automated; the QR scan from
 * a second physical device is in `docs/production-smoke-checklist.md`.
 *
 * Launch blockers this spec fails on: signup before first DeCA, mock/fake
 * document, QR pointing at the wrong host, `/d/[token]` returning HTML, missing
 * legal fields, PDF changing between fetches, claim regenerating the document.
 */

const DECA = {
  shipperName: "Cargas del Turia SL",
  shipperNif: "B96789011",
  shipperAddress: "Av. del Puerto 120, Valencia",
  carrierName: "Transportes Pérez SL",
  carrierNif: "B12345674",
  carrierAddress: "Pol. Ind. Fuente del Jarro, calle 5, Paterna",
  origin: "Valencia",
  destination: "Madrid",
  transportDate: "2026-10-06",
  goods: "Palés de cerámica",
  weight: "12.500 kg",
  tractorPlate: "1234 BCD",
};

function email() {
  return `lhp${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function fillWizardAnon(page: Page) {
  await page.fill("#shipperName", DECA.shipperName);
  await page.fill("#shipperNif", DECA.shipperNif);
  await page.fill("#shipperAddress", DECA.shipperAddress);
  await page.fill("#carrierName", DECA.carrierName);
  await page.fill("#carrierNif", DECA.carrierNif);
  await page.fill("#carrierAddress", DECA.carrierAddress);
  await page.getByTestId("wizard-next").click();
  await page.fill("#origin", DECA.origin);
  await page.fill("#destination", DECA.destination);
  await page.fill("#transportDate", DECA.transportDate);
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", DECA.goods);
  await page.fill("#weight", DECA.weight);
  await page.fill("#tractorPlate", DECA.tractorPlate);
}

test.describe("LAUNCH #20 — production happy path", () => {
  test("anonymous → PDF → QR-equivalent → save account → claim → duplicate", async ({
    page,
    request,
    baseURL,
  }) => {
    // 1-2. Landing → CREAR DECA GRATIS (mobile viewport)
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("DeCA GRATIS");
    await page.getByTestId("cta-crear").first().click();
    await expect(page).toHaveURL(/\/crear$/);
    // no signup wall
    await expect(page.getByText("No necesitas registrarte")).toBeVisible();

    // 3-4. Complete a legally valid DeCA + review the exact final data
    await fillWizardAnon(page);
    const review = page.getByTestId("review-summary");
    await expect(review).toBeVisible();
    for (const v of [
      DECA.shipperAddress,
      DECA.carrierAddress,
      DECA.destination,
      DECA.weight,
      DECA.tractorPlate,
    ]) {
      await expect(review).toContainText(v);
    }

    // 5-6. Generate once → result screen
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);
    await expect(page.getByRole("heading", { name: "DeCA generado" })).toBeVisible();

    // 7. Download link points straight at the public PDF URL
    const dl = page.getByTestId("result-download");
    const publicUrl = await dl.getAttribute("href");
    expect(publicUrl).toMatch(/\/d\/[A-Za-z0-9_-]+$/);

    // 8-9. QR-equivalent: fetch the public URL with a bare context — no auth, no
    // cookie, no interstitial — and get the PDF bytes directly.
    const insp = await request.get(publicUrl!);
    expect(insp.status()).toBe(200);
    expect(insp.headers()["content-type"]).toBe("application/pdf");
    expect(insp.headers()["set-cookie"]).toBeUndefined();
    expect(insp.headers()["x-robots-tag"]).toContain("noindex");
    const bytes = Buffer.from(await insp.body());
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    const hash1 = createHash("sha256").update(bytes).digest("hex");
    // the QR encodes the configured host, not localhost-by-accident / wrong host
    expect(publicUrl!.startsWith(baseURL!)).toBe(true);

    // 10. Share with the driver — WhatsApp deep link carries the public URL
    await page.getByTestId("result-share-toggle").click();
    const wa = page.locator('a[href^="https://wa.me/"]').first();
    const waHref = await wa.getAttribute("href");
    expect(decodeURIComponent(waHref ?? "")).toContain(publicUrl!);

    // 11-12. Save account AFTER value — claim the already-generated DeCA
    await page.getByTestId("result-save").click();
    await expect(page).toHaveURL(/\/registro\?claim=/);
    await page.fill("#email", email());
    await page.fill("#password", "supersecret123");
    await page.fill("#companyName", "Titular Launch SL");
    await page.fill("#companyNif", DECA.carrierNif);
    await page.getByTestId("register-submit").click();
    await expect(page).toHaveURL(/\/panel$/);

    // the claimed DeCA appears without regeneration — same token, identical bytes
    const after = await request.get(publicUrl!);
    expect(after.status()).toBe(200);
    expect(
      createHash("sha256")
        .update(Buffer.from(await after.body()))
        .digest("hex"),
    ).toBe(hash1);
    await expect(page.getByText(`${DECA.origin} → ${DECA.destination}`)).toBeVisible();

    // 13. Duplicate → a brand-new independent DeCA, faster
    await page.goto("/panel");
    await page.getByTestId("app-repetir").click();
    await expect(page).toHaveURL(/\/crear\?from=/);
    await expect(page.locator("#carrierAddress")).toHaveValue(DECA.carrierAddress); // prefilled
    await page.getByTestId("wizard-next").click();
    await expect(page.locator("#transportDate")).toHaveValue(""); // date reset
    await page.fill("#transportDate", "2026-10-20");
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);
    const dup = await page.getByTestId("result-download").getAttribute("href");
    expect(dup).not.toBe(publicUrl); // independent document, new token

    await page.goto("/panel/historico");
    await expect(page.getByText("2 documentos")).toBeVisible();
  });

  test("no signup wall: the whole creation flow works with no session and no account", async ({
    browser,
  }) => {
    const ctx = await browser.newContext(); // zero cookies
    const page = await ctx.newPage();
    await page.goto("/crear");
    await fillWizardAnon(page);
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);
    // never bounced to /registro before the document exists
    expect(page.url()).not.toContain("/registro");
    await ctx.close();
  });
});
