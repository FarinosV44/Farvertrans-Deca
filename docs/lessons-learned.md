# Lessons Learned — Farvertrans DeCA

> Append-only; never trim. Symptom → cause → fix.

## E2E: acquisition-attribution tests flake in CI (never locally)

- **Symptom:** `attribution.spec.ts` / `operadores.spec.ts` fail intermittently in CI with
  `firstDeca = 0` / `companies = 0`; pass every time locally.
- **Cause 1:** `<AttributionCapture>` wrote the `fvd_attr` cookie from a post-hydration `useEffect`;
  in CI's slower env the test navigated away before it ran, so the acquisition row was recorded as
  organic. **Fix:** capture attribution in `middleware.ts`, synchronously with the request.
- **Cause 2:** `middleware.ts` set the cookie as `encodeURIComponent(json)`, but
  `NextResponse.cookies.set()` url-encodes again → the client couldn't parse it and overwrote
  first-touch with a null ref. **Fix:** pass the plain JSON string; Next encodes it once, matching the
  client's `document.cookie` form. Contract recorded in `[[attribution-cookie-encoding]]`.

## E2E: `getByText` strict-mode violations after adding `<select>` / `<option>` with the same label

- **Symptom:** `expect(getByText("X")).toBeVisible()` starts failing with "resolved to N elements"
  after a new filter dropdown lists a value that also appears in a table.
- **Cause:** `<option>` elements match `getByText` but are "hidden" inside a closed select.
- **Fix:** scope table assertions with `getByTestId("historico-table").toContainText(...)`, not a
  bare page-level `getByText`.

## E2E: heavy parallel runs stress the single dev server

- **Symptom:** with ~85 e2e tests on 4 workers against one `next start`, one or two register/create
  or "0 documentos" assertions flake per full run; every test passes in isolation and on retry.
- **Cause:** contention on the single server + Postgres, not a correctness bug.
- **Fix / mitigation:** `retries: 1` in CI absorbs it; add a `waitForResponse` before navigating off
  a page whose POST must land first (login, register). Do not "fix" by loosening assertions.

## I18N: never default server-side locale from `Accept-Language`

- **Symptom:** adding `lib/i18n/server.ts`'s locale resolver with an `Accept-Language`-based
  fallback (`if header starts with "en" → English`) broke 29 previously-green e2e specs across the
  whole suite — headings, buttons and table columns all came back in English where Spanish was
  expected.
- **Cause:** headless Chromium (Playwright's default) sends `Accept-Language: en-US` regardless of
  the intended test locale, so *every* request without an explicit `fvd_locale` cookie silently
  resolved to English. The same failure mode would hit a real Spanish visitor whose OS/browser is
  set to English — exactly the audience this Spanish-market product should default to Spanish for.
- **Fix:** `getLocale()` never reads `Accept-Language`. It reads only the explicit `fvd_locale`
  cookie (set by the switcher, or restored from `User.preferredLocale` on login) and falls back to
  the hardcoded default locale (`es`) otherwise. English is opt-in only, never inferred from browser
  headers. See D-062.
