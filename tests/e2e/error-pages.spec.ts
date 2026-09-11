import { test, expect } from "@playwright/test";

/**
 * #118 — the branded incident page (route-segment `app/error.tsx`) vs. the
 * pre-existing, untouched 404 page (`app/not-found.tsx`): distinct content,
 * no leaked technical detail, real navigable actions.
 *
 * `/test-only/error-boundary` only throws when FVD_ENABLE_TEST_ROUTES=1
 * (playwright.config.ts's webServer sets it) — a real server-render error,
 * not a mocked API response, so this exercises the actual error boundary.
 */

test("a real render error shows the branded incident page, not a technical one", async ({
  page,
}) => {
  await page.goto("/test-only/error-boundary");

  await expect(page.getByRole("heading", { name: "Lo sentimos" })).toBeVisible();
  await expect(page.getByText(/no está disponible en este momento/)).toBeVisible();

  const retry = page.getByRole("button", { name: "Intentar de nuevo" });
  const goHome = page.getByRole("link", { name: "Ir al inicio" });
  await expect(retry).toBeVisible();
  await expect(goHome).toBeVisible();

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toContain("intentional test-only render error");
  expect(bodyText.toLowerCase()).not.toContain("stack");
  expect(bodyText.toLowerCase()).not.toContain("prisma");
});

test("'Ir al inicio' from the incident page navigates home", async ({ page }) => {
  await page.goto("/test-only/error-boundary");
  await page.getByRole("link", { name: "Ir al inicio" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("a nonexistent route shows the distinct 404 page, never the incident copy", async ({
  page,
}) => {
  const res = await page.goto("/this-does-not-exist-xyz");
  expect(res?.status()).toBe(404);

  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toContain("Lo sentimos");
  expect(bodyText.toLowerCase()).not.toContain("mantenimiento");
  expect(bodyText.toLowerCase()).not.toContain("incidencia");
});
