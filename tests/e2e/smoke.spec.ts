import { test, expect } from "@playwright/test";

test("landing renders server-side with one h1 and a CTA to /crear", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    // Browser-initiated /favicon.ico probe is not an app defect; the SVG icon link is present.
    if (/favicon\.ico/.test(m.location().url ?? "")) return;
    errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 500) errors.push(`5xx: ${r.url()}`);
  });

  const res = await page.goto("/");
  expect(res?.status()).toBe(200);

  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);
  await expect(h1).toContainText("DeCA GRATIS");

  const cta = page.getByRole("link", { name: /CREAR DECA GRATIS/i });
  await expect(cta).toHaveAttribute("href", "/crear");

  expect(errors, `console errors: ${errors.join(" | ")}`).toHaveLength(0);
});

test("health endpoint responds", async ({ request }) => {
  const res = await request.get("/health");
  expect([200, 503]).toContain(res.status());
  const body = await res.json();
  expect(body).toHaveProperty("version");
});
