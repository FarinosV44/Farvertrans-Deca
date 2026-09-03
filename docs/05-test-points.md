# Test Points — Farvertrans DeCA

| Date | Slice / issue | Criterion | Coverage | Red first | Command | Result | Evidence (commit) |
|---|---|---|---|---|---|---|---|
| 2026-09-03 | BUILD 05 scaffold | app boots, `/` renders, one h1, CTA→/crear, no console errors, no 5xx | driven (Playwright smoke, 2/2 pass) | n/a (scaffold) | `npm run test:e2e` | PASS (2 passed, 39.8s) | 7719c- (next commit) |
| 2026-09-03 | BUILD 05 scaffold | env parsing rules (bad URL, short secret, FVD_DEBUG coercion) | driven (Vitest, 3/3 pass) | n/a (mirrors lib/env) | `npm run test:unit` | PASS (3 passed) | 7719c- |
| 2026-09-03 | BUILD 05 scaffold | Prisma schema validates + migrates + seeds | driven | n/a | `npx prisma validate` / `migrate dev` / `npm run seed` | PASS (migration 20260903114315_init applied; 4 operators seeded) | 7719c- |
| 2026-09-03 | BUILD 05 scaffold | lint + typecheck + build + keel-verify pass | driven | n/a | `npm run lint` / `npm run typecheck` / `npm run build` / `node scripts/keel-verify.mjs` | PASS (all clean) | 7719c- |
| 2026-09-03 | BUILD 05 scaffold | health endpoint | driven (Playwright) | n/a | `GET /health` | PASS (200, version + db reported) | 7719c- |
| 2026-09-03 | BUILD 06 landing | AC-25 SSR, one h1 "DeCA GRATIS", CTA→/crear (not contact) | driven (Playwright) | n/a | `npm run test:e2e` | PASS | next commit |
| 2026-09-03 | BUILD 06 landing | AC-26 no pricing/contact/demo/sales gating; 0 `<form>` | driven | n/a | e2e landing.spec | PASS | next commit |
| 2026-09-03 | BUILD 06 landing | AC-27 content + primary CTA work with JS disabled | driven (jsEnabled:false) | n/a | e2e landing.spec | PASS | next commit |
| 2026-09-03 | BUILD 06 landing | AC-32 title/meta/canonical/OG present; robots disallows /api /d/; sitemap public-only | driven | n/a | e2e landing.spec | PASS | next commit |
| 2026-09-03 | BUILD 06 landing | AC-33 JSON-LD SoftwareApplication + FAQPage | driven | n/a | e2e landing.spec | PASS | next commit |
| 2026-09-03 | BUILD 06 landing | AC-31 landing_view event emitted + accepted (204) | driven | n/a | e2e landing.spec | PASS | next commit |
| 2026-09-03 | BUILD 06 landing | AC-29 no serious/critical axe violations on / and /crear; CTA keyboard-reachable | driven (@axe-core/playwright) | n/a | e2e a11y.spec | PASS | next commit |
| 2026-09-03 | BUILD 06 landing | responsive: no horizontal overflow at 360/768/1280; mobile CTA shows <768 only | driven | n/a | e2e landing.spec | PASS | next commit |
| 2026-09-03 | BUILD 06 landing | pickRefSnapshot / eventInputSchema / landing JSON-LD builder | driven (Vitest 7 tests) | pure logic — analytics + content builders | `npm run test:unit` | PASS (10 unit total) | 7262ca1 |
| 2026-09-03 | BUILD 07 creator | validateDeca R-2/AC-09 (missing-field rejection, foreign-NIF warn-not-block, date format, path-keyed errors); normalizePlate; checkNif | driven (Vitest, 10 tests) | logic written from R-2/AC-09, not the impl; tests pass on first run (velocity note — no observed red) | `npm run test:unit` | PASS (20 unit total) | next commit |
| 2026-09-03 | BUILD 07 creator | AC-01 anonymous completes 3 steps → /crear/[id] "DeCA generado" | driven (Playwright) | n/a | e2e crear.spec | PASS | next commit |
| 2026-09-03 | BUILD 07 creator | AC-02 mandatory omission blocks advance, Spanish message, accessible error summary, stays on step | driven | n/a | e2e crear.spec | PASS | next commit |
| 2026-09-03 | BUILD 07 creator | back/forward preserves entered data (sessionStorage draft) | driven | n/a | e2e crear.spec | PASS | next commit |
| 2026-09-03 | BUILD 07 creator | AC-09 POST /api/deca 422 + field errors on missing mandatory field | driven | n/a | e2e crear.spec | PASS | next commit |
| 2026-09-03 | BUILD 07 creator | AC-01 POST /api/deca 201 + ≥256-bit token + claim token for anonymous | driven | n/a | e2e crear.spec | PASS | next commit |
| 2026-09-03 | BUILD 07 creator | AC-04b same idempotency-key never creates a 2nd DeCA | driven | n/a | e2e crear.spec | PASS | next commit |
| 2026-09-03 | BUILD 07 creator | AC-04 wizard axe-clean; progressbar named; error summary role=alert focus | driven (@axe-core) | n/a | e2e a11y.spec + crear.spec | PASS | 7641709 |
| 2026-09-03 | BUILD 08 PDF/QR/URL | R-5/AC-07 QR encodes URL X → jsQR decodes back to exactly X | driven (Vitest, pngjs+jsqr) | pure logic — QR round-trip | `npm run test:unit` | PASS | next commit |
| 2026-09-03 | BUILD 08 PDF/QR/URL | R-8 public token: ≥40 url-safe chars, unique per call | driven (Vitest) | pure logic | `npm run test:unit` | PASS | next commit |
| 2026-09-03 | BUILD 08 PDF/QR/URL | R-9 availability window: available until 7 natural days after service end, then not | driven (Vitest) | pure logic — written from R-9 | `npm run test:unit` | PASS | next commit |
| 2026-09-03 | BUILD 08 PDF/QR/URL | R-3/R-4 PDF is native text (all R-2 values extractable via pdfjs), starts %PDF-, < 5 MB (~20 KB) | driven (Playwright + pdfjs) `test:compliance` | n/a | `npm run test:compliance` | PASS | next commit |
| 2026-09-03 | BUILD 08 PDF/QR/URL | R-5/R-6 PDF carries the exact /d/[token] URL as text | driven | n/a | test:compliance | PASS | next commit |
| 2026-09-03 | BUILD 08 PDF/QR/URL | R-7/R-8 /d/[token] streams the PDF directly: application/pdf, inline, noindex, no set-cookie, not HTML | driven | n/a | test:compliance | PASS | next commit |
| 2026-09-03 | BUILD 08 PDF/QR/URL | R-8 unknown token → generic 404 text/plain | driven | n/a | test:compliance | PASS | next commit |
| 2026-09-03 | BUILD 08 PDF/QR/URL | R-11 PDF metadata records CreationDate + Creator="Farvertrans DeCA v..." | driven (pdfjs getMetadata) | n/a | test:compliance | PASS | next commit |
| 2026-09-03 | BUILD 08 PDF/QR/URL | R-13 fails closed — invalid payload → 422, no document | driven | n/a | test:compliance | PASS | next commit |
| 2026-09-03 | BUILD 08 PDF/QR/URL | standalone build traces lib/pdf/fonts into .next/standalone (Hostinger Docker) | driven | n/a | `NEXT_STANDALONE=1 npm run build` + ls | PASS | 206d734 |
| 2026-09-03 | BUILD 09 signup+claim | password scrypt hash/verify (correct/wrong/malformed); min length | driven (Vitest) | pure logic | `npm run test:unit` | PASS | next commit |
| 2026-09-03 | BUILD 09 signup+claim | session token HMAC sign/verify; tamper + junk rejected | driven (Vitest) | pure logic | `npm run test:unit` | PASS (31 unit total) | next commit |
| 2026-09-03 | BUILD 09 signup+claim | AC-17 generate first → register second → DeCA claimed, appears in /app | driven (Playwright) | n/a | e2e registro.spec | PASS | next commit |
| 2026-09-03 | BUILD 09 signup+claim | auth failure (422) never orphans/deletes the DeCA; claim token still usable after | driven | n/a | e2e registro.spec | PASS | next commit |
| 2026-09-03 | BUILD 09 signup+claim | a claim token cannot be reused by a second account (reports already-used) | driven | n/a | e2e registro.spec | PASS | next commit |
| 2026-09-03 | BUILD 09 signup+claim | signup form carries no lead-qual fields (flota/facturación/empleados/teléfono/demo/cargo) | driven | n/a | e2e registro.spec | PASS | next commit |
| 2026-09-03 | BUILD 09 signup+claim | /registro axe-clean (no serious/critical) | driven (@axe-core) | n/a | e2e a11y.spec | PASS | next commit |
| 2026-09-03 | BUILD 09 signup+claim | /registro axe-clean (no serious/critical) | driven (@axe-core) | n/a | e2e a11y.spec | PASS | fc5609a |
| 2026-09-03 | BUILD 10 workspace | history filter predicate (free text across ref/place/carrier/plate/shipper; date range) | driven (Vitest) | pure logic | `npm run test:unit` | PASS (36 unit) | next commit |
| 2026-09-03 | BUILD 10 workspace | saved-entity schemas (plate normalisation, NIF required) | driven (Vitest) | pure logic | `npm run test:unit` | PASS | next commit |
| 2026-09-03 | BUILD 10 workspace | authed DeCA is owned by the company + appears in /app + /app/historico | driven (Playwright) | n/a | e2e workspace.spec | PASS | next commit |
| 2026-09-03 | BUILD 10 workspace | history search filters (q match / no-match, date range) | driven | n/a | e2e workspace.spec | PASS | next commit |
| 2026-09-03 | BUILD 10 workspace | "Repetir último DeCA" / duplicate prefills, date reset, NEW id/token on generate | driven | n/a | e2e workspace.spec | PASS | next commit |
| 2026-09-03 | BUILD 10 workspace | saved data add → autofill in wizard (company + vehicle) → delete; a generated DeCA is untouched | driven | n/a | e2e workspace.spec | PASS | next commit |
| 2026-09-03 | BUILD 10 workspace | /app, /app/historico, /app/datos axe-clean | driven (@axe-core) | n/a | e2e workspace.spec | PASS | next commit |
| 2026-09-03 | BUILD 11 attribution | parseTouch: referral/campaign/organic/direct classification + all 5 UTMs captured | driven (Vitest) | pure logic — written from F12/EPIC 02 | `npm run test:unit` | PASS (43 unit) | next commit |
| 2026-09-03 | BUILD 11 attribution | merge rules: first-touch captured once + NEVER overwritten after lock; last-touch updates on qualifying touch only; no-op once locked; acquisition-row flatten | driven (Vitest, 5 tests) | pure logic | `npm run test:unit` | PASS | next commit |
| 2026-09-03 | BUILD 11 attribution | AC-18/19 ?ref=adrian → browse → anonymous flow → signup attributed to adrian; user never sees operator name | driven (Playwright) | n/a | e2e attribution.spec | PASS | next commit |
| 2026-09-03 | BUILD 11 attribution | AC-20 return via ?ref=maria before signup → last-touch maria, first stays adrian | driven | n/a | e2e attribution.spec | PASS | next commit |
| 2026-09-03 | BUILD 11 attribution | AC-21/22 no ref + no UTM → organic/direct, still recorded | driven | n/a | e2e attribution.spec | PASS | next commit |
| 2026-09-03 | BUILD 11 attribution | AC-23 per-operator companies/first-DeCA/total-DeCA queryable via /api/operadores/stats (internal only) | driven | n/a | e2e attribution.spec | PASS | next commit |
| 2026-09-03 | BUILD 11 attribution | first_deca_at set when an attributed company generates its first DeCA (authed create + claim) | driven | n/a | e2e attribution.spec | PASS | next commit |
| 2026-09-03 | BUILD 12 dashboard | non-internal user cannot discover /operadores (404) nor /api/operadores/stats (404) — anon + regular user | driven (Playwright) | n/a | e2e operadores.spec | PASS | next commit |
| 2026-09-03 | BUILD 12 dashboard | internal user sees the operator table; per-operator companies/first-DeCA/total-DeCA reconcile with the API | driven | n/a | e2e operadores.spec | PASS | next commit |
| 2026-09-03 | BUILD 13 abuse | decide(): first-time user allowed (no challenge); soft threshold → challenge; hard → block+retry-after | driven (Vitest) | pure logic — F16 | `npm run test:unit` | PASS (47 unit) | next commit |
| 2026-09-03 | BUILD 13 abuse | PoW challenge: valid nonce (plain SHA-256) verified; wrong/forged-prefix/wrong-scope/oversize rejected | driven (Vitest) | pure logic | `npm run test:unit` | PASS | next commit |
| 2026-09-03 | BUILD 13 abuse | AC-34/35 anonymous: first 3 creates never challenged; 4th → 429 challenge; solved PoW retry → 201 | driven (Playwright API) | n/a | e2e build13.spec | PASS | next commit |
| 2026-09-03 | BUILD 13 abuse | AC-36 `GET /d/[token]` never returns 429 (15 rapid fetches all 200) | driven | n/a | e2e build13.spec | PASS | next commit |
| 2026-09-03 | BUILD 13 versioning | AC-14/15 correction → new `deca_version` (new token/QR/PDF), reason + "Versión actual: 2"; v1 PDF still retrievable with original destination; distinct tokens per version | driven (Playwright + pdfjs) | n/a | e2e build13.spec | PASS | next commit |
| 2026-09-03 | BUILD 13 versioning | AC-16 non-owner cannot correct (401 from an unauthenticated context) | driven | n/a | e2e build13.spec | PASS | next commit |
| 2026-09-03 | BUILD 13 sharing | AC-24 share panel: WhatsApp deep link contains the `/d/` URL; email via `POST /api/share` (rate-limited, templated, mailto fallback when unconfigured); `deca_shared` event | driven | n/a | e2e build13.spec | PASS | next commit |
| 2026-09-03 | BUILD 14 SEO | 10 core pages: SSR (JS disabled), exactly one h1, unique <title>, canonical, meta description, FAQPage JSON-LD, CTA→/crear, internal cluster links, last-reviewed date | driven (Playwright, jsEnabled:false) | n/a | e2e seo.spec | PASS | next commit |
| 2026-09-03 | BUILD 14 SEO | an unknown slug 404s (dynamicParams=false) | driven | n/a | e2e seo.spec | PASS | next commit |
| 2026-09-03 | BUILD 14 SEO | sitemap lists all 10 + /soy-obligado, no /app /api /d/; robots disallows private areas | driven | n/a | e2e seo.spec | PASS | next commit |
| 2026-09-03 | BUILD 14 SEO | "¿Estoy obligado?" returns a conclusion with JavaScript disabled (SSR query-param form) | driven | n/a | e2e seo.spec | PASS | next commit |
| 2026-09-03 | BUILD 14 SEO | representative SEO page axe-clean (no serious/critical) | driven (@axe-core) | n/a | e2e seo.spec | PASS | next commit |
