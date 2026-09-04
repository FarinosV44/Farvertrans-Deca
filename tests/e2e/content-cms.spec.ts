import { test, expect, type Browser, type Page } from "@playwright/test";

/**
 * SEO #32 — the content engine. An internal user creates a guide, previews the
 * draft privately, publishes it, and it becomes a public, indexable page with
 * the generator CTA. Customers cannot touch any of it.
 */

const ADMIN = { email: "admin@farvertrans.local", password: "admin-dev-only" };
const baseURL = `http://localhost:${process.env.PORT ?? "3000"}`;
const rnd = () => `${Date.now()}${Math.floor(Math.random() * 1e5)}`;

async function internalPage(browser: Browser): Promise<{ page: Page; close: () => Promise<void> }> {
  const ctx = await browser.newContext({ baseURL });
  const page = await ctx.newPage();
  await page.goto("/entrar");
  await page.fill("#email", ADMIN.email);
  await page.fill("#password", ADMIN.password);
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/login") && r.status() === 200),
    page.getByTestId("register-submit").click(),
  ]);
  return { page, close: () => ctx.close() };
}

test.describe("SEO #32 — content CMS", () => {
  test("a seeded guide renders publicly: SSR, one h1, canonical, generator CTA, JSON-LD", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    const res = await page.goto("/guias/como-corregir-un-deca");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.getByTestId("cta-crear").first()).toHaveAttribute("href", "/crear");
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(ld).toContain('"Article"');
    expect(ld).toContain('"BreadcrumbList"');
    await ctx.close();
  });

  test("the guides index lists published guides", async ({ page }) => {
    await page.goto("/guias");
    await expect(page.getByRole("heading", { name: "Guías del DeCA" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Cómo corregir/ })).toBeVisible();
  });

  test("a customer cannot reach the CMS admin or its API", async ({ page, request }) => {
    expect((await page.goto("/admin/contenido"))?.status()).toBe(404);
    expect((await page.goto("/admin/contenido/nuevo"))?.status()).toBe(404);
    expect(
      (await request.post("/api/admin/contenido", { data: { type: "guide", slug: "x" } })).status(),
    ).toBe(404);
  });

  test("an internal user creates a draft, previews it privately, then publishes it", async ({
    browser,
  }) => {
    const slug = `guia-e2e-${rnd()}`;
    const { page, close } = await internalPage(browser);
    try {
      await page.goto("/admin/contenido/nuevo");
      await page.getByTestId("ce-title").fill("Guía de prueba e2e");
      await page.getByTestId("ce-slug").fill(slug);
      await page
        .getByTestId("ce-excerpt")
        .fill("Un extracto suficientemente largo para pasar la validación mínima.");
      await page
        .getByTestId("ce-body")
        .fill(
          "## Sección\n\nContenido de prueba con un enlace a [[cta]] al final.\n\n- punto uno\n- punto dos",
        );
      await page
        .getByTestId("ce-metaDescription")
        .fill(
          "Meta descripción de prueba con la longitud adecuada para que el aviso editorial no salte en este caso.",
        );
      await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/contenido") && r.request().method() === "POST",
        ),
        page.getByTestId("ce-save-draft").click(),
      ]);
      await expect(page).toHaveURL(/\/admin\/contenido\/[a-z0-9]+$/i);

      // the public route 404s while it is a draft…
      const anon = await browser.newContext({ baseURL });
      const anonPage = await anon.newPage();
      expect((await anonPage.goto(`/guias/${slug}`))?.status()).toBe(404);
      await anon.close();

      // …but the internal user can preview it
      await page.goto(`/guias/${slug}?preview=1`);
      await expect(page.getByText("Vista previa")).toBeVisible();
      await expect(page.getByRole("heading", { name: "Guía de prueba e2e" })).toBeVisible();

      // publish
      await page.goBack();
      await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/contenido/") && r.request().method() === "PATCH",
        ),
        page.getByTestId("ce-publish").click(),
      ]);

      const anon2 = await browser.newContext({ baseURL });
      const anonPage2 = await anon2.newPage();
      const res = await anonPage2.goto(`/guias/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(anonPage2.getByRole("heading", { name: "Guía de prueba e2e" })).toBeVisible();
      // in the sitemap now
      const sitemap = await anonPage2.request.get("/sitemap.xml");
      expect(await sitemap.text()).toContain(`/guias/${slug}`);
      await anon2.close();
    } finally {
      await close();
    }
  });

  test("a duplicate slug is rejected", async ({ browser }) => {
    const { page, close } = await internalPage(browser);
    try {
      await page.goto("/admin/contenido/nuevo");
      await page.getByTestId("ce-title").fill("Choque de slug");
      await page.getByTestId("ce-slug").fill("como-corregir-un-deca"); // seeded
      await page.getByTestId("ce-excerpt").fill("Extracto suficientemente largo para el mínimo.");
      await page.getByTestId("ce-body").fill("## Título\n\nCuerpo con [[cta]] suficiente.");
      const res = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/contenido") && r.request().method() === "POST",
        ),
        page.getByTestId("ce-save-draft").click(),
      ]);
      expect(res[0].status()).toBe(409);
      await expect(page.getByTestId("ce-error")).toContainText(/slug/i);
    } finally {
      await close();
    }
  });
});
