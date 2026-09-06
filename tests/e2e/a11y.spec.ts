import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["/", "/crear", "/registro"];

for (const path of PAGES) {
  test(`a11y: ${path} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(
      serious,
      serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`).join("\n"),
    ).toEqual([]);
  });
}

test("a11y: landing is keyboard-reachable to the primary CTA", async ({ page }) => {
  await page.goto("/");
  // Tab a bounded number of times; the primary CTA must be focusable. The
  // budget must clear skip-link + wordmark + 5 nav links + the language
  // switcher (I18N #54 — one focusable button per locale, currently 4:
  // es/ca/gl/en, headed to 8: es/ca/eu/gl/en/fr/de/it) + the login link, so
  // it's set generously rather than re-tuned every time a locale is added.
  let found = false;
  for (let i = 0; i < 30 && !found; i++) {
    await page.keyboard.press("Tab");
    found = await page.evaluate(
      () => document.activeElement?.getAttribute("data-testid") === "cta-crear",
    );
  }
  expect(found).toBe(true);
});
