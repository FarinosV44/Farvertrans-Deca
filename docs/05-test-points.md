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
