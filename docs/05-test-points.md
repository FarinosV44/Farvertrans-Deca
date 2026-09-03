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
| 2026-09-03 | BUILD 06 landing | pickRefSnapshot / eventInputSchema / landing JSON-LD builder | driven (Vitest 7 tests) | pure logic — analytics + content builders | `npm run test:unit` | PASS (10 unit total) | next commit |
