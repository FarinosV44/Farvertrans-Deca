# Continuation prompt — Farvertrans DeCA

Repo: FarinosV44/Farvertrans-Deca
Branch: develop
Generated: 2026-09-03
Keel: v5.19.2
Commit: fa5f08f  Tree: 717afb0
Position: Phase 5 (execution mode D-019). Sprint 1 closed — BUILD 05–09 done. Next = **BUILD 10**.

User direction (still in force):

> Execution, not documentation. Work the GitHub BUILD issues in order. Each issue ends with real,
> browser-verifiable functionality + tests. Don't stop between issues for minor decisions resolvable
> from the spec. No ERP/TMS/invoicing/Stripe/pricing/checkout/sales forms/fleet tracking. Signup is
> never required before the first DeCA — value first, account after.

Read CLAUDE.md and the full Keel skill first, then `docs/PROGRESS.md`, `docs/decisions.md`
(D-001…D-021 — never re-litigate), `docs/lessons-learned.md`, `docs/02-functional-spec.md`,
`docs/03-technical-plan.md`, `docs/05-test-points.md`, `docs/issues.md`.

`Autonomy: automatic` — commit + push to `develop` after each green slice; never merge to `main`/tag/
release. `Chaining: off`. `Notify: PushNotification`. After each BUILD issue, comment on it (beat 1,
"landed, awaiting deploy") and never close it.

## DONE — BUILD 05–09 (all on develop, all green: 31 unit + 32 e2e + standalone build + keel-verify)
The full flow works and is test-verified: `/` landing → **CREAR DECA GRATIS** → 3-step `/crear`
(no signup) → **GENERAR DECA** → real compliant native-text PDF + QR at `/crear/[id]` → Ver/descargar
PDF (`/d/[token]`, direct download, no auth) / Compartir (WhatsApp/email/copy) → "Guardar este DeCA
creando una cuenta" → `/registro` → `/app` with the document owned.

- **05** scaffold — Next 15 + TS + Tailwind 4 + Prisma + `lib/supabase` + full schema + migrations +
  seed + `/health` + docker playground + `scripts/keel-verify.mjs` / `keel-doctor.mjs`.
- **06** landing — full EPIC 01 structure, SSR, one h1, no forms/pricing, JSON-LD, robots+sitemap,
  `landing_view`/`click_crear_deca` → `POST /api/events` (`lib/analytics`).
- **07** `/crear` — `components/deca/wizard.tsx`, `lib/deca/{schema,validate,plate,nif,token}`,
  `POST /api/deca`, Idempotency-Key, `deca_started`, `/crear/[id]` result.
- **08** compliant PDF — `lib/pdf/{deca-document,render,qr,fonts}` (@react-pdf native text, embedded
  Inter OFL, QR EC-H), `lib/storage` (pluggable Supabase / local-FS), `GET /d/[token]` (direct PDF,
  noindex, no auth/cookie/interstitial, 404 unknown, R-9 `isPubliclyAvailable`), hashed-IP access log,
  fail-closed (render+store BEFORE DB write), `npm run test:compliance` = 6 R-1…R-13 checks (RELEASE GATE).
- **09** signup+claim — `lib/auth/{password,session,index}` (own email+password, scrypt, HMAC cookie —
  D-021, Supabase Auth deferred), `lib/deca/claim.ts`, `POST /api/auth/{register,login}`, `/registro`,
  minimal `/app`. Auth failure never orphans the DeCA.

## NEXT — BUILD 10, then 11 → 15 in order
- **#10 Registered workspace (F7, F8):** `/app` history + search (date, origin→destination, carrier,
  plate, status; view/duplicate/share/download); saved companies/vehicles/addresses CRUD (tables exist,
  scope to `user.id`) with autofill in the `/crear` wizard for authed users; "Duplicar" / "Repetir
  último DeCA" pre-fills the wizard (new id/token on generate); deleting a saved entity never alters an
  already-generated DeCA. Tests + axe per new screen.
- **#11 Attribution (EPIC 02):** `lib/attribution/*` — parse `ref` + 5 UTMs, first-touch never
  overwritten + last-touch, first-party cookie + localStorage, write the `acquisition` row at signup,
  set `first_deca_at` on the first DeCA. AC-18…AC-23. Wire into `/registro` + landing.
- **#12 `/operadores`** internal acquisition dashboard (`role: internal`), per-operator visits/signups/
  companies/first-DeCA/total/active + conversions; non-internal → 404.
- **#13** driver share `POST /api/share` + WhatsApp deep link + printable A4; corrections → new
  `deca_version` (new token/QR/PDF, prior kept — R-13, AC-14/15/16); abuse controls `lib/abuse`
  (sliding window per hashed IP+fingerprint, challenge above soft threshold, never on `/d/`, fail-open —
  F16/AC-34…36).
- **#14** SEO base + 10 core pages `content/seo/*.mdx` (one template; BOE citations; last-reviewed date;
  internal links; CTA) + "¿Estoy obligado?" page (F17).
- **#15** launch gate: Lighthouse CI perf budgets (AC-28), CSP + security headers (T-5), full
  `npm run test:compliance` re-run, deploy runbook (Hostinger VPS + Docker + Supabase + DNS + Resend +
  hCaptcha).

## Gaps to close before Phase 7 release
- `.githooks/pre-commit` confidential gate + `.github/workflows/ci.yml` (D-010 full assistant-config,
  deferred at scaffold — materialise from `references/assistant-config.md`).
- `docs/.keel/plan.json`, `scripts/keel-close` / `keel-handoff-verify` not generated (execution shortcut).
- Password reset (email). `npm audit`: 0 critical, 1 high (`postcss` via Next's toolchain — accepted D-020).
- CREDENTIAL (user provides, pre-launch): real Supabase project, Hostinger VPS, domain, Resend, hCaptcha —
  then deploy, then beat-3 comments on #5–#15, then the user closes them. RGPD review of anonymous-doc
  retention (D-016). Legal check that a generated DeCA passes inspection.

## Local run
`npm install` · `npm run db:up` · `npm run db:migrate` · `npm run seed` · `npm run dev` → localhost:3000.
Full check: `npm run typecheck && npm run lint && npm run test:unit && npm run test:e2e && npm run test:compliance && node scripts/keel-verify.mjs`.
This env's npm blocks install scripts — approve new ones with `npm approve-scripts <pkg>`.
Kill a stale port-3000 server before `test:e2e`.
