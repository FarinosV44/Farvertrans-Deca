import { test, expect } from "@playwright/test";

/**
 * #96 (Core Web Vitals): the SEO cluster (`/que-es-el-deca` etc.) now passes a
 * fixed `locale` to `SiteHeader` instead of resolving it from a `cookies()`
 * read, so the page keeps its static generation / CDN caching (D-172). The
 * language switcher must still work there — `LanguageSwitcher` corrects the
 * header text CLIENT-SIDE (`data-i18n-key` + `lib/i18n/header-strings.ts`)
 * instead of relying on a server re-render for these specific pages.
 */
test.describe("#96 — static-page header stays locale-correct client-side (D-172)", () => {
  test("a static SEO page defaults to Spanish, and switching locale updates the header without a navigation", async ({
    page,
  }) => {
    await page.goto("/que-es-el-deca");
    await expect(page.getByTestId("header-login")).toHaveText("Entrar");

    await page.getByTestId("language-switcher").locator("summary").click();
    await page.getByTestId("language-switcher-en").click();

    // no navigation happened — same URL, no reload
    await expect(page).toHaveURL(/\/que-es-el-deca$/);
    await expect(page.getByTestId("header-login")).toHaveText("Log in");
    // the switcher's own "current" display also corrected itself
    await expect(page.getByTestId("language-switcher").locator("summary span")).toHaveText("en");
  });

  test("a returning visitor whose locale cookie is already non-Spanish sees the corrected header on load", async ({
    page,
  }) => {
    await page.context().addCookies([
      {
        name: "fvd_locale",
        value: "fr",
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.goto("/deca-obligatorio-2026");
    await expect(page.getByTestId("header-login")).toHaveText("Connexion");
  });

  test("a genuinely dynamic page (the landing) still resolves the header server-side, unaffected", async ({
    page,
  }) => {
    await page
      .context()
      .addCookies([{ name: "fvd_locale", value: "en", domain: "localhost", path: "/" }]);
    await page.goto("/");
    // server-rendered directly in English — no client correction needed here,
    // this just proves the #96 change didn't regress the existing dynamic path.
    await expect(page.getByTestId("header-login")).toHaveText("Log in");
  });

  // #116, D-211 — Portuguese (pt) added as a 9th locale.
  test("Portuguese is selectable in the switcher, updates the header, and a full page load renders real Portuguese content", async ({
    page,
  }) => {
    await page.goto("/que-es-el-deca");
    await page.getByTestId("language-switcher").locator("summary").click();
    await page.getByTestId("language-switcher-pt").click();
    await expect(page.getByTestId("header-login")).toHaveText("Entrar");
    await expect(page.getByTestId("language-switcher").locator("summary span")).toHaveText("pt");

    // A genuinely dynamic page, server-rendered directly in Portuguese from
    // the cookie the switch above just set — proves coverage beyond the
    // header slice (the issue's own "no fallback-to-Spanish gaps" AC).
    await page.goto("/");
    await expect(page.getByTestId("header-login")).toHaveText("Entrar");
    await expect(page.locator("h1")).toContainText("DeCA profissional");
  });

  // D-172: the `SiteHeader` fix above was necessary but NOT sufficient —
  // `app/layout.tsx` (the root layout, wraps every route, no exception)
  // independently calls `getLocale()` itself, and that alone still forces
  // `Cache-Control: no-store` site-wide. Confirmed directly against a real
  // production build. Left unfixed this slice (see D-172 for why: the root
  // layout also feeds `LocaleProvider`, which has 9 real `useT()` consumers
  // — the wizard, the registration form, support forms — that need an
  // accurate locale on first paint on pages that are ALREADY dynamic for
  // unrelated reasons and gain nothing from static caching). Re-enable once
  // that follow-up lands.
  test.fixme(
    "the static SEO page HTML itself is cacheable (no forced no-store) — D-172, pending root-layout fix",
    async ({ request }) => {
      const res = await request.get("/que-es-el-deca");
      const cacheControl = res.headers()["cache-control"] ?? "";
      expect(cacheControl, `cache-control was "${cacheControl}"`).not.toContain("no-store");
    },
  );
});
