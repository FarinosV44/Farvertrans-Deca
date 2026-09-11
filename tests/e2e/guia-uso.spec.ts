import { test, expect } from "@playwright/test";
import { GUIA_DE_USO_SLUG } from "@/prisma/content/guia-de-uso";

/**
 * #111 — the product usage guide lives inside the existing public Guías section
 * as a normal CMS content item, and renders through the same `ArticleLayout` as
 * every other guide (breadcrumbs, auto table of contents, related links). This
 * also exercises the two Markdown additions made for it: typed callouts and
 * block images with captions.
 *
 * Requires the guide to be seeded: `npm run seed:content` (or `npm run seed`).
 */

const PATH = `/guias/${GUIA_DE_USO_SLUG}`;

test("the usage guide is listed in /guias and opens like the other guides", async ({ page }) => {
  await page.goto("/guias");
  const card = page.getByRole("link", { name: /Guía de uso de DeCA Profesional/i });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(new RegExp(`${PATH}$`));
  await expect(
    page.getByRole("heading", { level: 1, name: "Guía de uso de DeCA Profesional" }),
  ).toBeVisible();
});

test("the guide renders its structure: TOC, working anchors, a callout and a figure", async ({
  page,
}) => {
  await page.goto(PATH);

  // Auto table of contents (ArticleLayout renders it when >=3 headings).
  const toc = page.getByRole("navigation", { name: "Contenido" });
  await expect(toc).toBeVisible();
  const crearLink = toc.getByRole("link", { name: /Cómo crear un DeCA/i });
  await expect(crearLink).toHaveAttribute("href", "#como-crear-un-deca");
  await crearLink.click();
  await expect(page).toHaveURL(new RegExp(`${PATH}#como-crear-un-deca$`));
  await expect(page.locator("#como-crear-un-deca")).toBeInViewport();

  // A typed callout (::: important -> "Importante" label).
  await expect(page.getByText("Importante", { exact: true }).first()).toBeVisible();

  // At least one screenshot figure with its caption.
  const figure = page.locator("figure").first();
  await expect(figure).toBeVisible();
  await expect(figure.locator("img")).toHaveAttribute("src", /^\/guia\//);
  await expect(figure.locator("figcaption")).toBeVisible();

  // FAQ block rendered as a definition list.
  await expect(page.getByText("¿Tengo que instalar una aplicación?")).toBeVisible();
});

test("#112/#115 — the multi-envío section is documented and reachable from the TOC", async ({
  page,
}) => {
  await page.goto(PATH);

  const toc = page.getByRole("navigation", { name: "Contenido" });
  const multiEnvioLink = toc.getByRole("link", { name: /Varios envíos en un mismo DeCA/i });
  await expect(multiEnvioLink).toHaveAttribute("href", "#varios-envios-en-un-mismo-deca");
  await multiEnvioLink.click();
  await expect(page).toHaveURL(new RegExp(`${PATH}#varios-envios-en-un-mismo-deca$`));
  await expect(page.locator("#varios-envios-en-un-mismo-deca")).toBeInViewport();

  await expect(page.getByText("Añadir otro envío", { exact: false }).first()).toBeVisible();
  await expect(page.getByText(/Castellón.*Madrid/).first()).toBeVisible();
});

test("the guide is indexable and has no horizontal overflow at any of the product's breakpoints", async ({
  page,
}) => {
  await page.goto(PATH);

  // Indexable — no robots noindex (ArticleLayout only adds it in preview mode).
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);

  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `no horizontal scroll at ${width}px`).toBeLessThanOrEqual(1);
  }
});
