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

## E2E: recovery-code regeneration races under `--workers=3` (same shared seeded admin)

- **Symptom:** `admin-2fa.spec.ts`'s "a recovery code works once and is then rejected on replay"
  occasionally fails under `--workers=3`; always passes in isolation or at `--workers=1`.
- **Cause:** every admin e2e test shares the ONE seeded `admin@farvertrans.local` account
  (`tests/e2e/helpers/admin-auth.ts`) — pre-existing convention, fine while the account's state was
  static. Recovery-code regeneration is now genuinely mutable shared state:
  `generateRecoveryCodes()` deletes-then-recreates the set, so two tests regenerating concurrently
  can race (one test's freshly-generated code gets invalidated by another's regenerate call before
  it's consumed).
- **Fix / mitigation:** same as the existing heavy-parallel-run lesson below — `retries: 1` in CI
  absorbs it. Do not "fix" by loosening the replay assertion or by giving every test its own admin
  account (that would be a much larger change for a low-frequency, already-covered-by-retry flake).

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

## 2026-09-07 — Windows: kill stray dev servers with taskkill, not pkill
`pkill` / `killall` do not exist in the Git-Bash environment on this machine (they exit 127
silently). Ad-hoc `npm run dev &` for curl testing therefore leaves `next dev` running; several
accumulated over a long session and fought over port 3000, so `next` served `text/html` 400s for
`/_next/static/*.js` and every form-based e2e test failed to hydrate → `waitForResponse` timeouts
that looked like product bugs. Fix: `taskkill //F //IM node.exe //T` then `rm -rf .next` before
re-running. Better: don't background a dev server for a one-off check — use the already-running
Playwright webServer, or `curl` against a foreground `next start`.

## 2026-09-07 — #59: never re-validate a locked field against an existing row
The #59 soft gate re-ran the CIF/NIF checksum on companies that predate the requirement. Those
companies can have a malformed identifier AND the owner cannot edit it (it is locked by design).
Result: a permanent, unresolvable "completa tus datos". A retroactive check on an existing row must
only assert what that row's owner can actually change; format/checksum rules belong on the
create/edit path, not the gate. Also: a gate message must name the real blocker, never a fixed list.

## 2026-09-09 — #94: a layout guard is not an authorization boundary in the App Router

- **Symptom:** every `/admin/*` page returned its full server-rendered payload — companies, users,
  NIFs, DeCA, acquisition — to an **unauthenticated** caller that sent one header, `RSC: 1`.
  `/admin/activacion` alone returned 7.74 MB with 6080 company-name hits. Meanwhile a normal browser
  navigation answered 404 correctly and every existing admin test stayed green.
- **Cause:** the pages had no guard of their own; the only one was the `(protected)` group layout's
  `requireInternal()`. Next renders layout and page in PARALLEL, so the page's data fetch ran and its
  Flight payload was streamed even though the layout aborted with `notFound()`. The layout aborting
  does not un-send what the page already produced.
- **Fix:** authorise inside the PAGE — the component that actually fetches. `await requireInternal()`
  is now the first statement of all 29 internal pages. Middleware was not an option here:
  `verifySession` uses `node:crypto` (not edge-capable) and the session token carries `uid` but not
  `role`.
- **Check added:** `scripts/keel-verify.mjs` fails when any `app/admin/(protected)/**/page.tsx`
  lacks a guard call, so the next admin page cannot forget it. Regression suite:
  `tests/e2e/admin-rsc-authz.spec.ts`, which asserts on the BYTES returned rather than on the status
  code — the status was 200 both before and after the fix, so a status assertion would have proved
  nothing.
- **The transferable lesson:** a test that only drives the browser tests only the transport the
  browser happens to use. `page.goto()` and an `RSC: 1` fetch take different paths through the same
  route, and for eight months only one of them was ever exercised. Any "X cannot reach Y" claim needs
  the raw request, not just the rendered page.

## 2026-09-09 — Playwright's `reuseExistingServer` will silently adopt a hand-started server

- **Symptom:** six admin e2e tests failed with `POST /api/deca` → 403 `email_not_verified` and
  `/crear` timeouts. They also failed on an untouched `git stash` baseline, which read convincingly
  as "pre-existing breakage" — and it was not.
- **Cause:** a server started by hand for `curl` probing was still on :3000, and
  `reuseExistingServer: !process.env.CI` adopted it. That server lacked the config's test seams
  (`FVD_DISABLE_ABUSE_CHECKS`, `FVD_EXPOSE_RESET_TOKEN`, `SUPERADMIN_BACKUP_PASSWORD`), so the suite
  ran against a subtly different product.
- **Fix:** `taskkill //F //IM node.exe //T` before running the suite and let Playwright start its own
  server. All 249 passed immediately after.
- **The transferable lesson:** comparing against a stashed baseline proves the change is not the
  cause; it does NOT prove the failure is real. Both runs shared the same wrong server. When a
  baseline "confirms" a pre-existing failure, check what is actually serving the requests before
  believing it.

## 2026-09-09 — dictionary entries that are functions cannot cross into a Client Component

- **Symptom:** `/panel` rendered without the new block and the server logged `Functions cannot be
  passed directly to Client Components`, pointing at `hint` and `limit`.
- **Cause:** several i18n values are `(max: number) => string`, and the whole `t.panel.quickActions`
  object was passed as a prop to a `"use client"` component. Every string in it serialises; the two
  functions do not.
- **Fix:** resolve them on the server (`t.panel.quickActions.hint(MAX_QUICK_ACTIONS)`), and where the
  argument is only known on the client, pass the string with a literal `{name}` placeholder and
  substitute it there (`historico.views.removeConfirm`).
- **Check added:** none mechanical — `tsc` accepts it and only a real render fails. This is why the
  e2e spec drives the actual page instead of asserting on props.

## 2026-09-09 — Invite/verification emails: arrive for a known address, never for a brand-new one

- **Symptom (user-reported from production):** inviting an email that ALREADY had an account (the
  user's father) delivered fine; inviting/registering a genuinely new email that had never signed
  up before never received anything.
- **Not a code bug — verified:** `sendMail()` (`lib/mailer.ts`) and the invite route
  (`app/api/team/invites/route.ts`) use the exact same code path for every recipient; nothing
  branches on whether the address already has an account.
- **Most likely cause (cannot be confirmed from this repo — needs the Resend dashboard):** Resend
  restricts an account with an UNVERIFIED sending domain to delivering only to the account's own
  verified email address(es) — this is standard sandbox/test-mode behaviour for every transactional
  email provider of this kind. It exactly explains "a known/owned address works, a stranger's
  doesn't."
- **What to check (the user, in the Resend dashboard):** domain verification status for
  `FVD_MAIL_FROM`'s domain (SPF/DKIM records); whether the account is still in test/sandbox mode;
  the exact rejection reason in the `mail_provider_error` server logs (already logged with full
  provider response body — `lib/mailer.ts` never swallows it — but only reachable from the
  Hostinger server's own logs, not from this repo).
- **What was fixed regardless (#102, D-163):** the admin-facing gap this exposed — an invite whose
  email fails to deliver now gets a prominent (not subdued) warning plus a WhatsApp-share and
  copy-link fallback, so a failed send is never a dead end even while the provider issue is being
  resolved operationally.

## 2026-09-11 — A backward-compat helper is unverified until something reads the data back through a real consumer

- **Symptom:** #112 (D-205) introduced `legacyMirrorFields()` to keep `dataJson`'s pre-#112 flat
  shape readable by every existing consumer (history, cockpit, search, CSV export…). It was written,
  unit-tested in isolation, and the unit tests passed — but it was never actually CALLED from
  `createDeca`/`correctDeca`. `dataJson` was persisted as the bare new canonical shape with no mirror
  at all. 399→413 unit tests all stayed green throughout, because unit tests called the helper
  function directly, which was itself correct — they never touched the code path that was supposed
  to call it.
- **Caught by:** 5 real e2e tests reading the STORED data back through the app's normal surfaces
  (`doc-cockpit.spec.ts` ×2, `build13.spec.ts`, `creator-v2.spec.ts`, `crear.spec.ts`) — the
  "Datos del documento" cockpit view showed empty `loadLocation`/`goods`/`weight` for a plain,
  ordinary single-shipment DeCA.
- **The gap:** proving a pure function is correct (unit test) is a different claim from proving it is
  actually wired into the path that needs it (integration/e2e test reading real persisted data). Both
  are necessary; neither substitutes for the other.
- **Rule going forward:** when a change introduces a backward-compatibility shim/mirror/adapter
  specifically so EXISTING code keeps working unchanged, don't just unit-test the shim — run (or keep
  running) the existing tests that exercise those unchanged consumers against data that went through
  the new write path. A green full-suite run on the OLD code paths, after the change, is the actual
  proof the shim is wired in; a passing unit test of the shim alone is not.
- **Check added:** none new and mechanical (this is inherently an integration-level property) — the
  existing full e2e suite already would have caught this on any full run; the fix was running it
  before declaring the slice done, not adding a new check.

## 2026-09-11 — `reuseExistingServer: true` means a re-run can silently test YESTERDAY's build

- **Symptom:** during the same #112 (D-205) slice, a second real bug was found (`recordAvailabilityShare`
  in `app/api/deca/route.ts` also assumed the pre-#112 flat `DecaPayload` shape — same class as the
  `legacyMirrorFields` wiring bug above). It was fixed, `tsc`/`eslint`/`prettier` all confirmed clean,
  and the specific e2e spec was re-run — and the exact same 5 tests failed AGAIN, unchanged, byte-for-
  byte the same errors. Only after adding a temporary `console.error` in the `.catch()` and seeing
  NOTHING printed was the real cause found: `playwright.config.ts`'s `webServer.reuseExistingServer:
  !process.env.CI` had reused a `node.exe` process orphaned by an EARLIER interrupted run (the very
  first full-suite attempt, killed by the OS for low memory mid-run) — that server was still bound to
  port 3000, serving a build from BEFORE the fix, and every `npx playwright test` invocation since had
  silently reused it instead of rebuilding.
- **Why this is dangerous, specifically:** the failure signature after the "fix" was IDENTICAL to the
  failure before it — no new error, no different line, nothing that looks like "still running old
  code." A change that appears to have no effect looks exactly like a change that was correct but
  insufficient, which sends debugging in the wrong direction (deeper into the fix's own logic, when
  the fix was never actually exercised).
- **Rule going forward:** after ANY interrupted/killed Playwright run (OOM kill, Ctrl-C, a crashed
  terminal), check `netstat`/`tasklist` for a process still bound to the dev-server port before
  trusting the next run's result — an orphaned `reuseExistingServer` process is invisible in the test
  output itself. When a fix that should obviously change a test's outcome produces the EXACT same
  failure as before, suspect a stale server before suspecting the fix.
- **Check added:** none mechanical yet (would need a pre-flight "is this server's build newer than the
  newest source file" check, not attempted here) — the immediate practice is checking for an orphaned
  server explicitly after any abnormal Playwright termination.
