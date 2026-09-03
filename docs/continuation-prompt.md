# Continuation prompt — Farvertrans DeCA

Repo: FarinosV44/Farvertrans-Deca
Branch: develop
Generated: 2026-09-03
Keel: v5.19.2
Commit: 3a52c54
Position: Phase 5 (execution mode D-019). Sprint 2. BUILD 05–12 done. Next = **BUILD 13**.

User direction (still in force):

> Execution, not documentation. Work the GitHub BUILD issues in order. Each ends browser-verifiable +
> tested. Don't stop between issues for minor decisions resolvable from the spec. No ERP/TMS/invoicing/
> Stripe/pricing/checkout/sales forms/fleet tracking. Signup is never required before the first DeCA.

Read CLAUDE.md + the full Keel skill, then `docs/PROGRESS.md`, `docs/decisions.md` (D-001…D-021 — never
re-litigate), `docs/lessons-learned.md`, `docs/02-functional-spec.md`, `docs/03-technical-plan.md`,
`docs/05-test-points.md`, `docs/issues.md`, `docs/sprints/sprint-2.md`.

`Autonomy: automatic` — commit + push to `develop` after each green slice; never merge to `main`/tag/
release. `Chaining: off`. `Notify: PushNotification`. After each BUILD issue: comment beat 1 ("landed,
awaiting deploy"), never close it.

## DONE — BUILD 05–12 (all on develop, all green: 43 unit + 43 e2e + standalone build + keel-verify)
The full flow works and is test-verified: `/` landing → **CREAR DECA GRATIS** → 3-step `/crear`
(no signup) → **GENERAR DECA** → real compliant native-text PDF + QR at `/crear/[id]` → download
(`/d/[token]`, direct, no auth) / share → **"Guardar este DeCA creando una cuenta"** → `/registro`
→ `/app` with the document owned + reusable saved data. Attribution + operator dashboard also live.

- **05** scaffold (Next 15 + TS + Tailwind 4 + Prisma + `lib/supabase` + schema + migrations + seed +
  `/health` + docker playground + `scripts/keel-verify.mjs`/`keel-doctor.mjs`).
- **06** landing (full EPIC 01, SSR, JSON-LD, robots+sitemap, `lib/analytics` + `POST /api/events`).
- **07** `/crear` (`components/deca/wizard.tsx`, `lib/deca/{schema,validate,plate,nif,token}`,
  `POST /api/deca`, Idempotency-Key, result `/crear/[id]`).
- **08** compliant PDF (`lib/pdf/{deca-document,render,qr,fonts}`, `lib/storage` pluggable,
  `GET /d/[token]` direct download, `isPubliclyAvailable` R-9, fail-closed, `npm run test:compliance`
  = 6 R-1…R-13 checks — RELEASE GATE).
- **09** signup+claim (`lib/auth/{password,session,index}` own email+password D-021, `lib/deca/claim.ts`,
  `POST /api/auth/{register,login}`, `/registro`, `/app`).
- **10** workspace (`/app` actions-first, `/app/historico` search+date range, `/app/datos` saved-data
  CRUD, wizard autofill, duplicate `/crear?from=<id>`, authed `POST /api/deca` owns the DeCA).
- **11** attribution (`lib/attribution/*` — `?ref=`+5 UTMs, first/last touch, `<AttributionCapture>` in
  root layout, `acquisition` row at signup, `first_deca_at`).
- **12** `/operadores` internal dashboard + `GET /api/operadores/stats` (404 for non-internal); seed
  `admin@farvertrans.local` / `admin-dev-only`.

## NEXT — BUILD 13, then 14, 15
- **#13 Sharing, corrections/versioning, abuse controls:**
  - Driver share: `POST /api/share` (rate-limited, templated envelope, no user free-text) + WhatsApp
    deep link + printable A4 view with a prominent QR (F9, R-12, AC-24). The result screen's
    `components/deca/result-actions.tsx` already has the WhatsApp/email/copy UI — wire the email send.
  - Corrections → new version (R-13, AC-14/15/16): authed owner edits a DeCA → create `deca_version`
    n+1 with a NEW token/URL/QR/PDF, keep version n intact, record `changeReason` + timestamp, set
    `deca.currentVersionId`. New route `POST /api/deca/[id]/version`. A `/app/deca/[id]` detail page
    with the version list (currently the result page `/crear/[id]` is the only detail view). `deca_corrected` event.
  - Abuse controls (F16, AC-34…36): `lib/abuse` — sliding-window limiter keyed on hashed IP +
    hashed browser fingerprint (`abuse_counter` table exists); a soft threshold on anonymous
    `POST /api/deca` + `/api/share` + auth attempts triggers a challenge (hCaptcha, or a proof-of-work
    fallback when `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` is unset); NEVER challenge or block `GET /d/[token]`
    (fail open); per-IP 404 rate-limit already partially there on `/d/`. `lib/hash.ts` has the IP hash.
- **#14 SEO base + 10 core pages** (`content/seo/*.mdx` — one template; each: one intent, BOE citation,
  last-reviewed date, internal links to landing/requisitos/FAQ/generador, ends in CREAR DECA GRATIS) +
  "¿Estoy obligado?" guided page (F17). Sitemap already exists — extend `PUBLIC_PATHS`.
- **#15 Launch gate:** Lighthouse CI perf budgets (AC-28: LCP<2.0s, INP<200ms, CLS<0.1 mobile),
  CSP + HSTS + security headers (T-5/T-8 — extend `next.config.ts headers()`), full
  `npm run test:compliance` re-run, deploy runbook (Hostinger VPS + Docker + Supabase project + RLS +
  DNS + Resend + hCaptcha + GitHub secrets).

## Gaps to close before Phase 7 release
- `.githooks/pre-commit` confidential gate + `.github/workflows/ci.yml` (D-010 full assistant-config —
  materialise from `references/assistant-config.md`).
- `docs/.keel/plan.json`, `scripts/keel-close` / `keel-handoff-verify` not generated (execution shortcut).
- Password reset (email) flow. Login route: wire `signup_started`/`login` events if wanted.
- Duplicated line in `docs/05-test-points.md` (harmless).
- `npm audit`: 0 critical, 1 high (`postcss` via Next's toolchain — accepted D-020, revisit with Next 16).
- CREDENTIAL (user provides, pre-launch): real Supabase project, Hostinger VPS, domain, Resend, hCaptcha →
  deploy → beat-3 comments on #5–#15 → the user closes them. RGPD review of anonymous-doc retention
  (D-016). Legal check that a generated DeCA passes inspection.

## Local run
`npm install` · `npm run db:up` · `npm run db:migrate` · `npm run seed` · `npm run dev` → localhost:3000.
Full check: `npm run typecheck && npm run lint && npm run test:unit && npm run test:e2e && npm run test:compliance && node scripts/keel-verify.mjs`.
This env's npm blocks install scripts — approve new ones with `npm approve-scripts <pkg>`.
Kill a stale port-3000 server before `test:e2e` (Windows: `taskkill //F //PID <pid>`).
Interactive `prisma migrate dev` is BLOCKED here — hand-write `prisma/migrations/<ts>_name/migration.sql`
then `npx prisma migrate deploy && npx prisma generate`.
`server-only` throws in Vitest — keep pure logic in files without that import (see `lib/data/saved-schema.ts`,
`lib/attribution/parse.ts`).
