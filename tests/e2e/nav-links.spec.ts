import { test, expect } from "@playwright/test";

/**
 * Navigation audit: every link reachable from the header and the footer must
 * resolve to a real page — no dead links, ever (SEO #32 follow-up).
 */

const EXPECTED_STATUS = (path: string) => (path.startsWith("/#") ? undefined : 200);

test.describe("Navigation — no broken links in header/footer", () => {
  test("every header link resolves", async ({ page, request }) => {
    await page.goto("/");
    const hrefs = await page
      .locator("header a[href]")
      .evaluateAll((els) =>
        els.map((e) => e.getAttribute("href")).filter((h): h is string => !!h && h.startsWith("/")),
      );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of new Set(hrefs)) {
      const path = href.split("#")[0] || "/";
      const expected = EXPECTED_STATUS(href);
      if (expected === undefined) continue; // in-page anchor on the same page
      const res = await request.get(path);
      expect(res.status(), `header link ${href}`).toBe(expected);
    }
  });

  test("every footer link resolves — Producto / Recursos / Legal columns", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const hrefs = await page
      .locator("footer a[href]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("href")).filter((h): h is string => !!h));
    expect(hrefs.length).toBeGreaterThanOrEqual(9); // 4 product/resource/legal cols worth + email

    for (const href of new Set(hrefs)) {
      if (href.startsWith("mailto:") || href.startsWith("http")) continue; // external / email — not a route
      const path = href.split("#")[0] || "/";
      if (href.includes("#")) continue; // in-page anchor
      const res = await request.get(path);
      expect(res.status(), `footer link ${href}`).toBe(200);
    }
  });

  test("the four legal pages render with a real h1 and no dead-end", async ({ page }) => {
    for (const [path, heading] of [
      ["/aviso-legal", "Aviso legal"],
      ["/privacidad", "Política de privacidad"],
      ["/cookies", "Política de cookies"],
      ["/contacto", "Contacto"],
    ] as const) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
  });

  test("/blog and /guias load directly by URL with the header, footer and a real h1", async ({
    page,
  }) => {
    for (const [path, h1] of [
      ["/blog", "Blog"],
      ["/guias", "Guías del DeCA"],
    ] as const) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      // never the generic Next error boundary
      await expect(page.getByText("Algo no ha ido bien")).toHaveCount(0);
    }
  });
});
