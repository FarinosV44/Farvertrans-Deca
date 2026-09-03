import { test, expect } from "@playwright/test";

test("app boots and health endpoint responds", async ({ request }) => {
  const res = await request.get("/health");
  expect([200, 503]).toContain(res.status());
  const body = await res.json();
  expect(body).toHaveProperty("version");
  expect(body).toHaveProperty("db");
});

test("/ responds 200 server-side", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
});
