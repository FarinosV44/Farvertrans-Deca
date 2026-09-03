# Test Points — Farvertrans DeCA

| Date | Slice / issue | Criterion | Coverage | Red first | Command | Result | Evidence (commit) |
|---|---|---|---|---|---|---|---|
| 2026-09-03 | BUILD 05 scaffold | app boots, `/` renders, one h1, CTA→/crear, no console errors, no 5xx | driven (Playwright smoke, 2/2 pass) | n/a (scaffold) | `npm run test:e2e` | PASS (2 passed, 39.8s) | 7719c- (next commit) |
| 2026-09-03 | BUILD 05 scaffold | env parsing rules (bad URL, short secret, FVD_DEBUG coercion) | driven (Vitest, 3/3 pass) | n/a (mirrors lib/env) | `npm run test:unit` | PASS (3 passed) | 7719c- |
| 2026-09-03 | BUILD 05 scaffold | Prisma schema validates + migrates + seeds | driven | n/a | `npx prisma validate` / `migrate dev` / `npm run seed` | PASS (migration 20260903114315_init applied; 4 operators seeded) | 7719c- |
| 2026-09-03 | BUILD 05 scaffold | lint + typecheck + build + keel-verify pass | driven | n/a | `npm run lint` / `npm run typecheck` / `npm run build` / `node scripts/keel-verify.mjs` | PASS (all clean) | 7719c- |
| 2026-09-03 | BUILD 05 scaffold | health endpoint | driven (Playwright) | n/a | `GET /health` | PASS (200, version + db reported) | 7719c- |
