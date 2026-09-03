# Continuation prompt — Farvertrans DeCA

Repo: FarinosV44/Farvertrans-Deca
Branch: develop (v1 also on main)
Generated: 2026-09-03
Keel: v5.19.2
Position: **Everything is on `main` at `0272c33`, CI green — v1 (BUILD 05–15) + all 503 fixes + FIX
#16–#19 + LAUNCH #20. `develop` == `main`. Nothing pending in code.** Phase 5 closed.
Next action is the USER's: deploy and run `docs/production-smoke-checklist.md`, then close #16–#20.
Local dev: `npm run db:up && npx prisma migrate deploy && npm run seed` (migration `20260903230000`
adds `deca_version.pdf_sha256` + `.created_by_user_id`). Gate: 52 unit + 63 e2e + 8 compliance.
Post-release hotfixes on `main`: Prisma Linux engines (`ff731dd`); **503 #1** = `/app` route segment
collided with `/` in the standalone build → `/app`→`/panel` rename (`fbc19ca`, D-023); attribution
captured in `middleware.ts`, race + cookie double-encoding fixed (`a653d37` + `7a0b175`);
self-contained `docker-compose.prod.yml` (`e088f51`, D-024); **503 #2 (Hostinger Cloud Startup)** =
LiteSpeed `lsnode.js` does `require(startupFile)` and the ESM standalone `server.js` threw
`ERR_REQUIRE_ESM` → removed `"type":"module"` (Next emits CJS `server.js`) + `server.cjs` startup file
+ `scripts/standalone-postbuild.mjs` + CI guard (`d200158`, D-025). All verified end-to-end locally.
Two deploy paths documented in `docs/07-release.md`: VPS+Docker (`server.js`) / Cloud Startup (`server.cjs`).

**FIX #16–#19 + LAUNCH #20 (D-026), on `develop`:** #16 = the Cloud Startup 503 (code-complete on
`main`, awaiting the user's deploy test). #17 = `carrier.address` now required (Art. 6.1.a), weight kept
verbatim, wizard review step (`review-summary`), `docs/legal-data-model.md`. #18 = `deca_version.pdf_sha256`
(returned by `POST /api/deca`, re-checked on every `/d/[token]`), `FVD_STORAGE_DIR` persistent path.
#19 = `deca_version.created_by_user_id` + owner audit view + `docs/retention-policy.md` (claim never
resets retention / regenerates). #20 = `tests/e2e/launch-happy-path.spec.ts` + `docs/production-smoke-checklist.md`.
**All merged to `main` at `0272c33`, CI green.** Remaining: deploy + `docs/production-smoke-checklist.md`
(incl. the external QR scan), then beat 3 + the user closes #16–#20.

## What happened

The four EPICs (#1–#4) were broken by the user into 11 executable BUILD issues (#5–#15). All 11 are
built, tested and on `develop`; `develop` was merged to `main` (commit 75419dc) with the user's explicit
authorisation. Every issue has a beat-1 comment ("landed, awaiting deploy"); none is closed (the user
closes them after testing a live deploy).

**Green:** 47 unit + 57 e2e (incl. the 6-check R-1…R-13 compliance suite, axe on every public screen,
360/768/1280, cross-tenant authz, security headers) + typecheck + lint + format + `NEXT_STANDALONE=1
npm run build` + `node scripts/keel-verify.mjs`.

The full product works end to end: `/` landing → CREAR DECA GRATIS → 3-step `/crear` (no signup) →
GENERAR DECA → real compliant native-text PDF + QR at `/crear/[id]` → download (`/d/[token]`) / share
(WhatsApp/email/copy) → "Guardar este DeCA" → `/registro` → `/panel` (history, saved data, duplicate,
corrections/versioning). Plus operator attribution + `/operadores` internal dashboard + 10 SEO pages +
"¿Estoy obligado?" + abuse controls + CSP/security headers.

Key code map: `lib/deca/*` (validate R-2, PDF, tokens, versioning, deactivation), `lib/pdf/*`
(@react-pdf), `lib/storage` (Supabase/local), `lib/auth/*` (own email+password — D-021),
`lib/attribution/*`, `lib/abuse/*`, `lib/data/*` (history+saved), `content/seo/pages.ts`,
`middleware.ts` (headers), `Dockerfile`, `.github/workflows/ci.yml`. Full reference: `docs/api/INDEX.md`.
Decisions: `docs/decisions.md` D-001…D-025. Release evidence + runbook: `docs/07-release.md`.

## Before public launch — the USER's tasks (not code)

1. **RGPD review** of retaining anonymous documents that contain third-party personal data vs the
   1-year retention obligation (D-016). Document the legal basis + an erasure procedure.
2. **Legal / inspection check** of a real generated DeCA (generate a sample — instructions in
   `docs/07-release.md`).
3. Deploy — pick one (both in `docs/07-release.md`):
   - **Hostinger Cloud Startup** (what the user is on): hPanel → Node.js, startup file = `server.cjs`,
     app root = repo, Node 20+; managed Postgres (`DATABASE_URL`); env from `.env.example`; build
     `npm ci && npx prisma generate && npx prisma migrate deploy && NEXT_STANDALONE=1 npm run build`.
   - **VPS + Docker:** `cp .env.prod.example .env.prod`, fill 4 values, `docker compose -f
     docker-compose.prod.yml up -d --build`, TLS proxy in front.
   Supabase/Resend/hCaptcha optional. Real domain still to decide (placeholder `deca.farvertrans.es`,
   D-011); `NEXT_PUBLIC_FVD_BASE_URL` must equal the live HTTPS URL (R-5/R-6).
4. Then: beat-3 comments on #1–#15 ("testable now on <url>") and the user closes the issues.

## If work continues (next session)

Two options:

- **Post-launch code items** (all tracked in `docs/07-release.md`): nonce-based CSP (drop
  `'unsafe-inline'` for scripts); password-reset (email) flow; local + long-tail SEO pages
  (`docs/sprints/deferred.md`); Keel `docs/.keel/plan.json` + `scripts/keel-close`/`keel-handoff-verify`
  (skipped under execution mode D-019).
- **Phase 6 — Documentation** (Keel): `docs/architecture.md`, full `docs/api/` reference from
  `INDEX.md`, `docs/security.md`, `docs/accessibility.md` (record a guided assistive-technology pass),
  `README.md`, and `guide/` — the end-user HTML guide (ask the user: languages + ships-in-release).

`Autonomy: automatic` — commit + push to `develop`; a further `develop`→`main` merge needs a fresh
explicit instruction. `Chaining: off`. `Notify: PushNotification`.

## Local run
`npm install` · `npm run db:up` · `npm run db:migrate` · `npm run seed` · `npm run dev` → localhost:3000.
Full check: `npm run typecheck && npm run lint && npm run format:check && npm run test:unit && npm run test:e2e && npm run test:compliance && node scripts/keel-verify.mjs`.
This env's npm blocks install scripts — approve with `npm approve-scripts <pkg>`.
Interactive `prisma migrate dev` is BLOCKED here — hand-write `prisma/migrations/<ts>_name/migration.sql` then `npx prisma migrate deploy && npx prisma generate`.
`server-only` throws in Vitest — keep pure logic in files without that import.
Kill a stale port-3000 server before `test:e2e`.
Seeded internal user for `/operadores`: `admin@farvertrans.local` / `admin-dev-only` (local only).
