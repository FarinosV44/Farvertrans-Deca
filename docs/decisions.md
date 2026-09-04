# Decisions — Farvertrans DeCA

> Append-only. A session NEVER re-opens a decision recorded here on its own initiative;
> only the user reverses a decision (append the reversal as a new entry).

## D-001 — Project type: web app + marketing/SEO site
- Date / phase: 2026-09-03 / Phase 1
- Decision: Primary type = Web app (SPA/SSR + API backend + hosted service). Secondary = Website (marketing landing + programmatic SEO cluster). Security profiles loaded: `references/security/web-app.md` and `references/security/website.md`.
- Why: EPIC 04 needs authenticated document generation, storage, unique public URLs and an audit trail (an app); EPIC 01 and EPIC 03 need fast, indexable SSR/SSG public pages (a site). They share one codebase and one design system.
- Alternatives rejected: pure static site (cannot generate/store compliant documents); WordPress (heavier, worse fit for the document engine and tracking).

## D-002 — Product output language: Spanish only (v1); docs language: English
- Date / phase: 2026-09-03 / Phase 1
- Decision: The user-facing product ships in **Spanish only** for v1. Code is written i18n-ready (no hardcoded user-facing strings at the use site, strings centralised) so a second locale is additive, but no second locale is built now. All `docs/` artifacts, code comments, commit messages and internal prompts are in **English** (Keel token-economy default).
- Why: The product targets the Spanish national DeCA mandate exclusively; every SEO keyword, legal reference and user is Spanish. English base would add cost with zero v1 value. This is a deliberate, recorded departure from Keel's English-output default (SKILL.md permits it with a recorded reason).
- Alternatives rejected: English base + Spanish locale (pure overhead for a Spain-only regulatory product); multi-language v1 (no demand, delays launch before 2026-10-05).

## D-003 — License: proprietary / UNLICENSED
- Date / phase: 2026-09-03 / Phase 1
- Decision: Closed-source proprietary SaaS. `package.json` `"private": true`, `"license": "UNLICENSED"`, no LICENSE file granting rights. Third-party dependencies must be permissively licensed (MIT/BSD/Apache-2.0/ISC); copyleft (GPL/AGPL) runtime dependencies are not adopted without an explicit decision.
- Why: Commercial SaaS, not distributed as source. No marketplace GPL requirement applies.
- Alternatives rejected: open-source (no reason to; would expose the compliance engine and tracking logic).

## D-004 — Accessibility target: WCAG 2.2 AA + EAA
- Date / phase: 2026-09-03 / Phase 1
- Decision: WCAG 2.2 AA as the floor (AAA where feasible), EN 301 549 / European Accessibility Act in scope (EU digital service, applies since 2025-06-28). Target platform: web/HTML. Built accessible from the first slice.
- Why: Legal exposure in the EU market; the audience includes older drivers and small-operator staff on phones. Non-negotiable per SKILL.md.

## D-005 — Session setup: automatic, after-sprint issues, capture on, push notifications
- Date / phase: 2026-09-03 / Phase 1
- Decision: `Autonomy: automatic` — Keel commits and pushes to `develop` without asking; never merges to `main`, never tags, never releases without explicit instruction. Forge issue duty: review at every sprint close, sweep interval 24h. Issue capture: on — a defect the user reports becomes a GitHub issue before the fix starts. Notification channel: Claude Code PushNotification (delivers to terminal + phone via Remote Control) — recipient: the user.
- Why: User chose all recommended options in the session-start batch.

## D-006 — Durability: GitHub remote
- Date / phase: 2026-09-03 / Phase 1
- Decision: Work survives off this machine via `origin` = https://github.com/FarinosV44/Farvertrans-Deca.git. Integration branch `develop` created from `main`.
- Why: Repo already had a GitHub remote at session start. Satisfies SKILL.md "Work never lives only on this machine".

## D-007 — v1 scope: confrontation rows 1–23 in, 24–29 Later, 30–32 Never
- Date / phase: 2026-09-03 / Phase 1
- Decision: v1 = rows 1–23 of `docs/01a-confrontation.md`. Later = 24 (local SEO pages), 25 (long-tail/user-type SEO pages), 26 (multi-user/team), 27 (public API), 28 (bulk import), 29 (eCMR/CMR/ADR interop feature — SEO page now, feature later). Never in v1 = 30 (paid WhatsApp Business API), 31 (AI/LLM assistant), 32 (pricing/plans/checkout).
- Why: User chose "accept my recommendations" as the decision mode; recorded as default accepted. Rows 1–16 are the launch product, 17–23 are the differentiators that make it win, all cheap except row 19 (abuse controls, mandatory companion to unlimited-free row 17).
- Alternatives rejected: "add everything" (drags in local SEO thin-content risk, multi-user, API — none needed for capture, all delay launch); row-by-row (user delegated to the recommendation column).
- Not checked: whether Truckio/DecaHub free tiers are genuinely capped (search inconclusive) — does not change the decision, unlimited-free is our positioning regardless.

## D-008 — Build sequence: EPIC 04 + 01 + 02 to launch, SEO content after
- Date / phase: 2026-09-03 / Phase 1
- Decision: Compliance engine (EPIC 04) + landing (EPIC 01) + acquisition tracking (EPIC 02) + SEO technical base built to a launchable state before 2026-10-05. The 10 core SEO content pages (EPIC 03) land immediately after launch; local + long-tail pages post-launch. Launch is NOT gated on the full SEO architecture.
- Why: Organic SEO will not pay off before the mandate; the pre-mandate capture spike comes from operator links. The compliance engine is the hard part and must be solid. User confirmed.

## D-009 — Chaining: off
- Date / phase: 2026-09-03 / Phase 1
- Decision: `Chaining: off`. Every session writes `docs/continuation-prompt.md` and shows the prompt; the user opens the next chat. `Chaining model: n/a`. `start` was not available anyway (Windows; macOS-verified only).
- Why: User chose off — simple, no unattended development, no surprises.

## D-010 — Portability: embed skill; Assistant config: full + CI on main
- Date / phase: 2026-09-03 / Phase 1
- Decision: Embed the Keel skill in the repo (`.claude/skills/keel/` + `.agents/skills/keel/`). Assistant config package = full: path-scoped rules + reviewer/verifier subagents + permission allow-lists + `.githooks/pre-commit` confidential-data gate + CI workflow. `CI runs on: main` (push to main, version tags, PRs targeting main) — not every develop push, since Keel drives the full suite locally before each commit. Tools: claude (primary); AGENTS.md covers codex/copilot/cursor/windsurf.
- Why: User chose all recommended. Repo becomes self-sufficient in any environment.

## D-011 — Domain: placeholder until the user decides
- Date / phase: 2026-09-03 / Phase 1
- Decision: Use `deca.farvertrans.es` as a configurable placeholder for canonical URLs, sitemap, OG tags, the DeCA QR base URL and each document's public URL. A single config value; the user sets the real domain before launch. Public document URLs must be domain-portable (no hardcoded host).
- Why: User does not have the domain decided yet; it does not block development.

## D-012 — Brand: assistant founds the identity, user reviews in Phase 3
- Date / phase: 2026-09-03 / Phase 1
- Decision: No prior brand system. The assistant proposes the founding identity (palette, typography, logo, personality — direction: modern SaaS, sober, conversion- and legal-trust-oriented, mobile-first) and the user reacts to it on real design in Phase 3. Open interview items (exact colours, typeface licensing, dark mode, iconography, vetoes, whether Farvertrans has existing brand elements) go to `SPEC/open-questions.md` for Design/Phase 3.
- Why: User chose "you propose and show me in Phase 3".

## D-013 — Stack: Next.js + Supabase, hosted on Hostinger
- Date / phase: 2026-09-03 / Phase 2
- Decision: Next.js (App Router, SSR/SSG) on Node 20 LTS, TypeScript. Supabase for PostgreSQL, object storage (PDFs), and authentication (passwordless email OTP + optional password). ORM: Prisma against the Supabase Postgres (or Supabase client where RLS is the better fit — decided per module in the technical plan). PDF: `@react-pdf/renderer` (genuine text-based PDF from React components, embedded fonts, small output — NOT headless-browser screenshot). QR: `qrcode`. Rate limiting / abuse: Postgres-backed limiter + a hashed IP/fingerprint counter (Upstash Redis optional later). Hosting: Hostinger VPS running the Next.js server via Docker (Node SSR needs a running process; Hostinger shared/cloud web hosting is not sufficient). Email: a transactional provider (Resend / Postmark — pinned in Phase 5).
- Why: User chose "Hostinger y Supabase". Supabase collapses Postgres + storage + auth + RLS into one managed service, which fits the deadline and a solo maintainer. Next.js gives SSR/SSG for the SEO requirement (EPIC 01/03) in one codebase with the app.
- Alternatives rejected: Vercel + Neon (user prefers Hostinger/Supabase); VPS + self-hosted Postgres/MinIO (more ops burden, no benefit here); WordPress (poor fit for the document engine).
- Not checked: whether Hostinger's specific VPS tier limits (RAM, bandwidth) suffice at peak capture volume — to size in Phase 5 with the user; does not change the architecture.

## D-014 — Test-first policy: pure-logic
- Date / phase: 2026-09-03 / Phase 2 §4e
- Decision: `Test-first policy: pure-logic`. Pure functions of their inputs — DeCA data validation against R-2, public URL/token generation, 7-day deactivation logic, version/correction rules (R-13), abuse-limit calculations, attribution first-touch/last-touch rules (EPIC 02) — get their test written and seen failing before the implementation. Markup, framework glue and third-party integration are exempt. Two rules hold regardless: every bug fix starts from a failing reproduction test; a test derived from an AC-nn or a reproduced bug is never edited to pass.
- Why: User chose the recommended default. The compliance engine and the attribution engine are logic-dense — exactly where test-first pays.

## D-015 — No quality rubric for this project
- Date / phase: 2026-09-03 / Phase 2 §6a
- Decision: No `docs/rubrics/` domain. The adversarial spec review uses the standard mechanical checklist only.
- Why: User chose "no for this project" — it is a web app, not an extensible library/plugin/MCP whose extension surface locks on release.

## D-016 — Anonymous DeCA: valid document + 30-day claim link
- Date / phase: 2026-09-03 / Phase 2
- Decision: A DeCA created without an account is generated complete, legally valid, and retained 1 year (R-10) like any other. The creator receives a claim link (high-entropy token, valid 30 days) to attach the document to a new or existing account. Unclaimed after 30 days: the document remains valid and retained (legal obligation) but becomes unrecoverable by the creator through the UI (no account link). Anonymous creation is rate-limited per hashed IP + browser fingerprint (abuse control, confrontation row 19). Registering unlocks history, saved data (companies/vehicles/addresses), duplication and corrections.
- Why: User chose the recommended option — preserves the zero-friction differentiator vs DecaDoc while keeping legal validity and bounding abuse.
- Not checked: the RGPD retention basis for orphaned anonymous documents containing third-party personal data (shipper/carrier/driver) — to confirm with a data-protection review before launch; recorded as a pre-launch open item.

## D-017 — Assistant subagent model binding
- Date / phase: 2026-09-03 / Phase 2 close
- Decision: Role→model map (Claude Code): orchestrator = the session model the user launches with (Keel does not set it); reviewer = `sonnet` (`code-reviewer`, `security-auditor`, `design-fidelity-auditor`); mechanical = `haiku` (`docs-verifier`, `playground-qa`, `a11y-auditor`, `test-driver`, `launch-verifier`). Applied as the tool default without interrogating the user (recommend-don't-interrogate).
- Why: On a flat Claude Code subscription the marginal token cost is ≈ €0, so cheaper models buy speed and rate-limit headroom, not money — `test-driver` is the most repeated Phase 5 invocation and benefits most. Reviewers need real judgment; `sonnet` handles it.
- Materialised in: `.claude/agents/*.md` `model:` fields; project card `Models:` line.

## D-018 — Assistant config rules + agents materialised (Phase 2 close)
- Date / phase: 2026-09-03 / Phase 2 close
- Decision: `.claude/rules/` (code-style, security, docs-discipline — path-scoped to `app/**`, `lib/**`, `prisma/**`, `content/**`) and `.claude/agents/` (code-reviewer, security-auditor, docs-verifier, design-fidelity-auditor, playground-qa, a11y-auditor, test-driver, launch-verifier) generated. `guide-qa` deferred to Phase 6 (guide decision not yet made). Permission allow-list (`.claude/settings.json`), `.githooks/pre-commit` gate, and CI workflow deferred to the Phase 5 scaffold (their sources — verified tooling commands — do not exist yet).
- Why: Sources (§Conventions, threat model, code map globs) are fixed at Phase 2 close per `references/assistant-config.md`.

## D-019 — Implementation-first acceleration after Phase 2 (execution mode)
- Date / phase: 2026-09-03 / entering build
- Decision: The user explicitly prioritised a working product over further speculative documentation ("I want execution, not more discovery or speculative documentation"). The formal Keel Phase 3 (design-tool handoff) and Phase 4 (faithful-build audit) are folded into a single lean `docs/design/IMPLEMENTATION-BRIEF.md` — screen list + primary journey + concrete design tokens, type scale and component conventions the build follows directly. No external design-tool round-trip for v1. Work proceeds in vertical executable slices on the BUILD backlog (#5→#15) on `develop`; each issue ends with browser-verifiable functionality + tests. Discovery is not expanded unless implementation evidence reveals a genuine gap.
- Why: Discovery, confrontation, functional spec, technical plan and threat model already exist; the acquisition window before 2026-10-05 rewards shipping.
- Guardrail: D-001…D-018, regulatory R-1…R-13 and EPICs #1–#4 remain binding — an execution-sequencing change, not permission to bypass compliance or quality gates.
- Scope guard (user-stated): NO ERP, TMS, invoicing, fleet tracking, Stripe, pricing, checkout, sales/lead forms, or unrelated logistics features. Signup is never required before the first DeCA (D-016 reinforced).
- Alternatives rejected: full Phase 3 design-tool handoff (too slow for the deadline; the user vetoed it).

## D-020 — Pinned stack versions at BUILD 05; postcss advisory accepted (tracked)
- Date / phase: 2026-09-03 / BUILD 05
- Decision: Next 15.5.25, React 19.0.0, Tailwind 4.3.3 (`@tailwindcss/postcss` aligned to 4.3.3 — 4.0.0 threw "Missing field `negated` on ScannerOptions.sources"), Prisma 6.1.0, @react-pdf/renderer 4.1.6, @supabase/ssr 0.5.2, Playwright 1.55.1, Vitest 3.2.7 (bumped from 2.1.8 to clear a critical RCE advisory in the vitest/vite/esbuild dev chain), zod 3.24.1.
- `npm audit` residual after this work: 0 critical, 1 high (`postcss <=8.5.22`, reached only through Next's own bundled build toolchain — a build-time source-map path-traversal class, not a runtime exposure of the deployed app). Fix requires Next 16 (semver-major). **Accepted as a tracked risk** for now; revisit with a deliberate Next 16 upgrade after launch. 3 moderate + 4 low are all dev-only toolchain.
- This environment's npm blocks package install scripts by default (`allowScripts`); prisma/@prisma/*, esbuild, sharp, unrs-resolver are explicitly approved in `package.json` `allowScripts`.
- Why: get a green, runnable scaffold under the 2026-10-05 deadline without a major-version upgrade mid-build.
- Not checked: whether a later dependency (e.g. `@react-pdf` fonts, hCaptcha SDK) forces a version change — treated as normal maintenance.

## D-021 — v1 auth: own email+password + HMAC session cookie (Supabase Auth deferred)
- Date / phase: 2026-09-03 / BUILD 09
- Decision: v1 authentication is implemented in-app: email + password (scrypt, `node:crypto`, no native dep) with an HMAC-SHA256-signed httpOnly `fvd_session` cookie (`lib/auth/*`). The `user.auth_user_id` column is kept (`local:<uuid>` for now) so switching to Supabase Auth later is additive, not a migration. Signup collects only email, password, company name + NIF + address — no lead-qualification fields.
- Why: D-013 named Supabase Auth, but there is no Supabase project yet (CREDENTIAL, pre-launch) and the deadline is hard. Own-auth keeps the whole flow runnable and testable in dev/CI today with the same pattern already used for storage (`lib/storage` — Supabase in prod, local in dev). Reversible.
- Alternatives rejected: running Supabase locally via the CLI (heavy, another moving part); blocking BUILD 09 on the Supabase project (breaks "value before signup" for the deadline).
- Not checked: whether Supabase Auth's email deliverability / OTP UX is materially better for this audience — to weigh when the Supabase project exists; email OTP can be added alongside password without schema change.
- Pre-launch: decide password reset (email) and consider migrating to Supabase Auth or adding OTP.

## D-022 — PDF storage is explicit (FVD_STORAGE); v1 shipped with green CI on main
- Date / phase: 2026-09-03 / BUILD 15 close
- Decision: `lib/storage` selects its backend from `FVD_STORAGE` (`local` default / `supabase`), not from
  guessing whether the Supabase URL "looks real". Dev, tests and CI use the local filesystem store (no
  external calls); production sets `FVD_STORAGE=supabase`. `keel-verify` and the CI secret scan exclude
  their own detection-pattern files (`.github/`, `.githooks/`, `scripts/keel-verify.mjs`).
  `@types/node` pinned via `overrides` so `npm ci` resolves the committed lock on standard npm.
- Why: CI on `main` failed three times — placeholder Supabase host (DNS), self-flagging secret patterns,
  a lock drift between this machine's hardened npm and GitHub's npm. All fixed; CI is green.
- v1 = BUILD 05–15, on `main` at 946ac88, CI passing (typecheck, lint, format, 47 unit, 57 e2e,
  6 compliance, keel-verify, secret scan).

## D-023 — Workspace route renamed `/app` → `/panel` (fixes a standalone-build 503)
- Date / phase: 2026-09-03 / post-BUILD-15 hotfix
- Decision: The authenticated workspace routes move from `/app*` to `/panel*` (`/panel`, `/panel/historico`,
  `/panel/datos`, `/panel/deca/[id]`, `/panel/deca/[id]/corregir`). All links, `robots.ts`, `register-form`
  redirect, the correction redirect, and every e2e test updated. `components/app/` (a components folder, not
  a route) keeps its name.
- Why: a route segment literally named `app` (dir `app/app/`) collided with `/` in the Next.js
  **standalone** production build — `GET /` and `GET /app` both 307-redirected to `/registro` (the
  workspace's own not-logged-in redirect), so the deployed site returned a redirect/503 for the landing
  page while `next start` locally served it fine. Verified fixed by building and running the Docker image:
  `/` → 200 "DeCA GRATIS", `/panel` → 307 /registro (correct).
- Also in this hotfix: `prisma` `binaryTargets` add `debian-openssl-3.0.x` + `linux-musl-openssl-3.0.x`
  (cross-OS deploys); `Dockerfile` switched to `node:20-slim`, `HOSTNAME=0.0.0.0`, a `public/` dir added,
  healthcheck only requires the server to respond (a DB outage is then visible at `/health` instead of
  taking the whole site down); `docs/07-release.md` gains a "Hosting choice" section.
- The user deploys to Hostinger with Docker (confirmed — other projects run the same way).

## D-024 — Self-contained production deploy (docker-compose.prod.yml); attribution captured in middleware
- Date / phase: 2026-09-03 / post-BUILD-15
- Decision: ship `docker-compose.prod.yml` + `.env.prod.example` as the primary deploy path — app +
  bundled Postgres + a named volume at `/app/.storage` (`FVD_STORAGE=local`), so a VPS with Docker
  needs no Supabase or external DB account. A one-shot `migrate` service runs
  `node node_modules/prisma/build/index.js migrate deploy` (the standalone image has no
  `node_modules/.bin`, so `npx prisma` cannot be used). `Dockerfile` pre-creates `/app/.storage`
  owned by `nextjs` so the fresh volume inherits writable ownership.
- Also: acquisition attribution (`?ref=`, UTMs, referrer) is now merged and written to the `fvd_attr`
  cookie in `middleware.ts`, synchronously with the request. The client `<AttributionCapture>` stays
  for SPA navigations. Removed a post-hydration race that failed two e2e tests intermittently in CI.
- Why: the user runs Docker on Hostinger and did not want to stand up Supabase. Verified end-to-end
  locally with the compose stack: `/` 200, `/health` `db:up`, anonymous create → `/d/[token]` returns
  a 21 KB native 1-page PDF. Managed-Postgres path kept as a documented alternative.
- CI green on `main` at `a653d37` after the middleware change.

## D-025 — Project is CommonJS-typed so Next standalone `server.js` loads under Hostinger LiteSpeed
- Date / phase: 2026-09-03 / post-BUILD-15 hotfix
- Decision: removed `"type": "module"` from `package.json`. Next.js then emits
  `.next/standalone/server.js` and `.next/standalone/package.json` as **CommonJS** instead of ESM.
  Added `server.cjs` (repo root) as the Hostinger Cloud Startup entry point — `.cjs` is always CJS
  regardless of any `"type"` field, so LiteSpeed's `lsnode.js` (`require(startupFile)`) can load it;
  it fixes up the standalone asset layout (`.next/static`, `public/`) and `require()`s the server.
  Added `scripts/standalone-postbuild.mjs` (wired as npm `postbuild`) to copy `.next/static`,
  `public/` and `prisma/migrations/` into `.next/standalone/` — no-ops for a non-standalone build.
- Why: Hostinger Cloud Startup's LiteSpeed Node launcher starts the app with CommonJS
  `require(startupFile)`. The ESM standalone `server.js` threw `ERR_REQUIRE_ESM`, and the ESM
  standalone `package.json` (`"type": "module"`) broke Hostinger's injected `preload-timestamp.js`.
  The site 503'd before the app started. Not a Prisma/DB/build problem.
- All repo config that needs ESM is already `.mjs` (`eslint.config.mjs`, `postcss.config.mjs`,
  `scripts/*.mjs`) or `.ts` (handled by Next/vitest/tsx) — dropping the type field changed nothing
  locally or in CI. Verified: 47 unit + 57 e2e + 6 compliance + typecheck + lint + format + keel-verify;
  standalone booted via `require('./server.cjs')` serving `/` 200, `/health` `db:up`, anonymous DeCA
  create → `/d/[token]` 20 KB native PDF; `docker-compose.prod.yml` stack still boots.
- CI guard: new "Standalone server is CommonJS" step — `node --check` on `server.js`, asserts no
  `"type":"module"` in the standalone package.json, boots it via `require('./server.cjs')`.
- Hostinger config after this fix: **Application startup file = `server.cjs`**, app root = repo root,
  Node 20+. Build: `npm ci && npx prisma generate && npx prisma migrate deploy && NEXT_STANDALONE=1 npm run build`.

## D-026 — Legal data-model hardening + production readiness (FIX #17–#19, LAUNCH #20)
- Date / phase: 2026-09-03 / post-BUILD-15
- Decision (supersedes the F1/F2 field list where they conflict):
  - **Carrier domicilio is now a required DeCA field** (`carrier.address`). Art. 6.1.a)
    Orden FOM/2861/2012 requires the domicilio of BOTH parties; v1 only captured the
    shipper's. Added to `lib/deca/schema.ts`, the wizard step 1, the PDF, and the legal
    mapping (`docs/legal-data-model.md`). Correcting a pre-#17 DeCA now prompts for it.
  - **Weight is kept VERBATIM** — never silently reformatted. A regex rejects only
    meaningless values (`0`, `0 kg`, `-`, `n/a`, `sin especificar`).
  - **Review step**: the wizard's last step renders `<ReviewSummary>`
    (`data-testid="review-summary"`) with every assembled value before GENERAR DECA.
  - **Per-version PDF SHA-256** (`deca_version.pdf_sha256`) written at generation,
    re-checked on every `/d/[token]` download (mismatch → logged, still served).
    Returned in the `POST /api/deca` response.
  - **`FVD_STORAGE_DIR`** env — for `FVD_STORAGE=local`, an absolute persistent path
    OUTSIDE the deploy tree, so a redeploy never wipes the repository of record (R-10).
    Docker compose sets it to the `fvd-prod-storage` volume; documented for Hostinger.
  - **Version author** (`deca_version.created_by_user_id`) recorded on corrections and
    shown in the owner-only audit view (`/panel/deca/[id]`).
  - Retention rules written down in `docs/retention-policy.md`: append-only, old PDF
    bytes never overwritten, no cleanup job deletes retained PDFs, **a claim never
    resets the retention clock or regenerates the inspection document** (verified:
    `claimDeca()` only sets `company_id`/`created_by_user_id`).
  - **LAUNCH #20**: `tests/e2e/launch-happy-path.spec.ts` (anonymous → PDF →
    QR-equivalent → save account → claim → duplicate, mobile viewport, byte-identical
    across claim) + `docs/production-smoke-checklist.md` (manual QR / second-device steps
    + launch blockers).
- Migration: `20260903230000_deca_version_pdf_hash_author` (two nullable columns).
- Why: the forge issues #17–#20 asked for a legally complete data model, a durable
  inspection path and a proven end-to-end launch flow. No prior decision reopened.
- Verified: 52 unit + 63 e2e + 8 compliance + typecheck + lint + format + keel-verify.

## D-027 — Product V2: brand, landing, accounts, workspace, creator, delivery, teams, acquisition (#21–#28)
- Date / phase: 2026-09-04 / post-launch product iteration
- One coherent batch delivered issue-by-issue (each its own commit + tests). No prior decision reopened.
  - **#21 BRAND** — `lib/brand.ts` is the single source for the product name ("DeCA Fácil"),
    tagline, legal/company attribution ("Un servicio de Farvertrans S.L."), support email, colour.
    Threaded through i18n, header, footer, PDF metadata, share text, SEO. "Farvertrans" survives only
    as company attribution. `components/brand/wordmark.tsx`.
  - **#22 DESIGN** — landing V2 (`app/page.tsx`): premium hero + proof line + secondary ENTRAR,
    trust row, 3 steps, product proof, personas, daily-use, `<FaqAccordion>` (SSR `<details>`),
    final CTA. Placement events (hero_cta/header_cta/login_click/…). Landing is `force-dynamic` for
    the auth-aware header; SEO cluster stays static.
  - **#23 ACCOUNT** — `PasswordResetToken` + `/recuperar` flow (no enumeration, 1h TTL, single-use);
    `/api/auth/logout` + account menu; `/entrar`; growth events. Test seam `FVD_EXPOSE_RESET_TOKEN`
    (playwright webServer only).
  - **#24 WORKSPACE** — history `carrier` + `plate` filters; rows link to Detalle/Corregir; mobile
    cards; version shown; editing saved data never mutates history.
  - **#25 UX** — `DecaTemplate` + `/api/templates` + wizard template picker + "usar mi empresa" +
    `/panel/plantillas`; a template holds no date/token; draft autosave survives reload / failed gen.
  - **#26 OPS** — ResultActions reordered; native Web Share; Imprimir; "Comprobar QR" (exact URL +
    version + SHA-256); corrected-doc re-share reminder targeting the current version; delivery events.
  - **#27 TEAM** — `CompanyRole` (owner/member) + `CompanyInvite` (hashed token, 14-day TTL);
    signup joins an invited company (no duplicate company); `/panel/equipo` + `<TeamManager>`;
    removing a member detaches immediately; last owner protected.
  - **#28 GROWTH** — `Prospect` funnel (prospect→invited→registered→activated→active); operator
    issues an opaque `/registro?invite=` onboarding link that creates a company AND forces the
    operator ref-code attribution through to the first DeCA (= activation); `/operadores/captacion`
    funnel + prospect table + lightweight paste-import (CSV file upload deferred, allowed by the issue).
- Migrations: `20260904090000_password_reset_token`, `_100000_deca_template`, `_110000_company_team`,
  `_120000_prospect_acquisition`.
- Verified: 57 unit + 85 e2e (incl. 8 new specs) + 8 compliance + typecheck + lint + format +
  keel-verify. Two pre-existing timing flakes (operadores attribution race, wizard) pass on retry.

## D-028 — CTA text was invisible (Tailwind v4 layer bug); deploy-build hardening; drop "al menos" copy
- Date / phase: 2026-09-04 / post-#28 fixes
- **CTA text invisible in production** ("un gran bloque azul sin texto"). Root cause: `app/globals.css`
  had unlayered base rules — `a { color: var(--color-primary) }`. In Tailwind **v4**, unlayered CSS
  beats every `@layer`, so it overrode `text-[var(--color-primary-contrast)]` (in `@layer utilities`)
  on every `<a>`/`<Link>` CTA → blue text on a blue background. Verified: computed colour was
  `rgb(11,92,255)` on `rgb(11,92,255)` before, `rgb(255,255,255)` after.
  - Fix: wrap all base element styles in `@layer base` in `globals.css`. Added `.btn-primary` /
    `.btn-inverse` helper classes to `CtaButton` as belt-and-braces. Regression test in
    `landing.spec.ts` — primary CTA text colour must differ from its background.
- **`SKIP_BUILD_CHECKS=1`** env (`next.config.ts`) — skips ESLint + `tsc` during `next build`. Both
  run in CI on every push to `main`; the flag lets a resource-constrained deploy host (Hostinger
  Cloud Startup) drop `eslint` / `unrs-resolver` / `typescript` from the build's critical path.
  Never set in CI. Documented in `docs/07-release.md` + `.env.prod.example`, alongside the npm-install
  hang workaround (Prisma engine download) and the Node 22 recommendation.
- **Copy:** dropped the hedge "al menos" from the free/unlimited marketing lines — now
  "Sin límite / Gratis **hasta el 31/12/2026**". Legal "conservar **al menos** un año" (R-10) kept.

## D-029 — Generation failures are staged, correlated and recoverable (P0 FIX #29)
- Date / phase: 2026-09-04 / Product V3 (sprint 3, issues #29–#38)
- **Problem:** every render/storage/database failure collapsed into one generic 500
  ("No se pudo generar el DeCA"). Neither the user nor support could tell a missing bucket from a
  dead database, and diagnosing it needed SSH access to the host's logs.
- **Decision:**
  - `lib/deca/generation.ts` (pure) classifies a failure into one of six stages — `validation`,
    `configuration`, `pdf_render`, `pdf_storage`, `database`, `unknown` — and mints a 6-character
    correlation code from an unambiguous alphabet (no O/0, no I/1) that the user can read out.
  - `lib/deca/persist.ts` wraps each pipeline stage; a DB failure AFTER the object upload deletes the
    stored object best-effort, so unreachable PDFs never accumulate (issue §6).
  - `lib/deca/failures.ts` logs one structured line and writes a `generation_failure` row
    (migration `20260904140000`). The row holds the stage, the error class and a **redacted** message —
    emails and identifier-like runs are stripped — plus runtime metadata. Never the DeCA payload.
  - The API answers `{ code: "generation_failed", message, correlationId, retryable: true }`; the
    stage itself is added only when `FVD_DEBUG=1`.
  - The wizard keeps every field, shows the code and offers `Reintentar generación`, retrying with the
    SAME idempotency key — a retry can never produce a second document.
  - `POST /api/deca` resolves the idempotency key BEFORE the anonymous-creation rate limiter: a replay
    creates nothing, so a user recovering from a transient failure is never answered with a 429.
  - `lib/diagnostics.ts` + `GET /api/admin/diagnostics` + `npm run diagnose -- <url>` verify a real
    deployment: env, DB, migrations, PDF render smoke, storage write/read/delete round-trip, public
    URL (HTTPS in production), providers and the last 24 h of generation health.
  - `lib/admin/guard.ts` is the single internal-authorization surface (internal-role session or
    `FVD_ADMIN_TOKEN` header); every internal route answers 404, never 403.
- **Why:** a failure nobody can diagnose is a failure that repeats. The correlation code turns a
  support call into a lookup, and the readiness script turns a deploy into a verified deploy.
- **Not done here (needs the real host — CREDENTIAL):** reproducing the specific production exception,
  and switching production to persistent storage. `npm run diagnose` is the tool that names it; the
  `storage_config` check warns explicitly when `FVD_STORAGE=local` runs without `FVD_STORAGE_DIR`.

## D-030 — Admin V2 command center at `/admin` (ADMIN #33)
- Date / phase: 2026-09-04 / Product V3 (sprint 3, issues #29–#38)
- **Decision:** a dedicated internal area at `/admin` (persistent desktop sidebar + mobile drawer),
  gated by `requireInternal()` — 404, never 403, for every non-internal caller (no
  security-by-hidden-link; `noindex` in the layout metadata + `/admin` added to `robots.txt`).
  Sections: Resumen (KPIs today/7d/30d + operational alerts), DeCA (cross-tenant searchable table +
  detail with version history, PDF hash, storage key, public/QR URL — content is summarised, never
  editable from admin), Empresas (+ detail: members, invites, saved-data counts, acquisition, recent
  DeCA), Usuarios, Captación (reuses #28 `acquisitionFunnel` + `ProspectManager`), Operadores
  (reuses #12 `operatorStats`), Contenido, Errores (#29 failures by correlation code + triage:
  resolve/note), Sistema (`runDiagnostics` report). Global search (`GET /api/admin/search`) across
  company / user / DeCA reference / correlation code / prospect.
- **Data models** (`lib/admin/*`) deliberately bypass the company scoping that `lib/data/*` enforces —
  they are only reachable through `requireInternal()`. No auth secret is ever returned; DeCA payloads
  are summarised, never dumped.
- **Deliberate omissions (recorded, not forgotten):**
  - **Fine-grained internal sub-roles** (`internal_admin` / `internal_operator`, #33 §10) — deferred.
    The existing `Role.internal` is the single gate; a second tier is a schema + session change worth
    its own slice once there is a reason for read-limited internal users.
  - **Editorial content management** (Guías + Blog publishing, #33 §6) — blocked on SEO #32. `/admin/
    contenido` lists the current static SEO pages and says so.
  - **axe pass on admin screens** — the automated a11y pass covers public + customer screens; the
    internal cockpit is out of that sweep for now (keyboard/labels still followed in the markup).
- **Why:** the product can be operated day-to-day from one place — growth, customers, DeCA activity,
  failures and system health — without SSH or ad-hoc SQL. The Errores + Sistema screens are the ones
  D-029 forward-referenced.

## D-031 — Premium auth card, UI-only (AUTH #30, first slice)
- Date / phase: 2026-09-04 / Product V3 (sprint 3, issues #29–#38)
- **Decision:** `/entrar` and `/registro` now render a focused centered card on a calm branded
  ground (`AuthShell`, `.auth-ground`), no site header/footer during auth. Contextual headings
  ("Bienvenido de nuevo" / "Crea tu cuenta gratis" / "Guarda este DeCA" / "Únete al equipo"),
  supporting text, a **"Continuar con Google"** button with the official four-colour G mark, an
  "o continúa con email" divider, email, a password field with a show/hide toggle, a trust line
  ("Gratis · Sin tarjeta · Tus DeCA en un solo lugar"), and an in-place login ⇆ register switch.
- **The Google button is present but inert** until `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are
  set — it renders `disabled` with the caption "Acceso con Google disponible muy pronto." Never a
  dead-looking control; becomes a real `<a href="/api/auth/google">` when `googleEnabled` is true.
- **Scope call — UI only, agreed with the user.** The real Google OAuth handshake is a separate
  slice: it needs an OAuth approach against the custom email+password stack (D-021) — a new
  dependency + a decision superseding part of D-021 — plus a Google Cloud OAuth client (the user's
  credential). Account-linking safety (§"Account-linking / identity safety") lands with it.
- **Progressive company onboarding (§"Registration screen")** — NOT changed here. Five e2e specs
  fill `#companyName`/`#companyNif` on the first `/registro` render; splitting identity from company
  into two steps is a flow change, not a restyle, and belongs with the OAuth slice (the Google
  round-trip is what forces a post-auth onboarding step anyway). The company fieldset stays visible,
  restyled.
- **Why:** the auth experience now reads like a mature SaaS product (#21 brand) without touching a
  line of the auth logic, so it ships with zero regression risk and the OAuth work starts from a
  finished surface.

## D-032 — Creation flow clarity, kept at 3 steps + review (UX #31)
- Date / phase: 2026-09-04 / Product V3 (sprint 3)
- **Decision:** `/crear` keeps its **3 input steps + inline review on step 3** rather than splitting
  into 4 steps + a separate review screen. The issue asks for "at most 4 short steps and a final
  review" — 3 + review satisfies it, and a 4th step index would have rippled through ~23
  `wizard-generate` call sites across 13 e2e specs for no user-visible gain over an inline review
  that is already sectioned and scannable.
- **What changed (the issue's actual intent):**
  - Progress indicator now carries a plain-language label — `Paso 1 de 3 · Quién contrata y quién
    transporta` — not only a number.
  - Continuing with a gap sends focus straight to the **first field to fix** (the error summary
    stays for screen-reader users).
  - The review is grouped into the **PDF's own sections**, each with an `Editar` button that jumps
    back to the owning step.
  - A visible **"Estamos generando tu PDF y QR… no cierres esta página"** status with a spinner
    while the request is in flight; the button locks (double-submit already impossible via #29's
    idempotency key).
  - Human microcopy on every block: *¿Quién te ha contratado este transporte?*, *¿Qué empresa
    realiza físicamente el transporte?*, *Puedes usar un NIF/VAT extranjero*, *Si no hay remolque,
    déjalo vacío*.
  - Sticky action bar on mobile.
- **Not changed:** field order within step 3, and the company fieldset still shows on `/registro`
  (that is #38's progressive-onboarding work).

## D-033 — Post-generation document cockpit (PRODUCT #36)
- Date / phase: 2026-09-04 / Product V3 (sprint 3)
- **Decision:** the bare "DeCA generado ✓" success state and the thin
  `/panel/deca/[id]` are replaced by a real document cockpit, shared by both the
  anonymous result view and the authenticated workspace view via
  `lib/deca/detail.ts` (`getDecaCockpit`). Both render from the stored version
  payload, so the on-screen summary can never diverge from the PDF.
- **Pieces** (`components/deca/`): `qr-card.tsx` (the REAL current-version QR
  rendered server-side from the same URL the PDF embeds, + HTTPS URL + Abrir /
  Copiar / Descargar QR), `doc-summary.tsx` (structured data in the PDF's own
  sections), `version-timeline.tsx` (`VersionTimeline` — history with
  current/superseded badges, per-version PDF link, author in the workspace view;
  `ChangeList` — field-level "Qué ha cambiado" diff for v2+, `diffVersions()` is
  pure and unit-tested).
- **Workspace view** additionally shows: reference, "Versión actual: N", public-
  URL status badge, service date, generation timestamp, a "Detalles técnicos"
  `<details>` (SHA-256, token), Corregir / Duplicar / guardar plantilla, and the
  version history even for a single version.
- **Anonymous view** keeps the "Guardar mis DeCA" conversion CTA and hides the
  single-version history.
- **Tenant isolation:** `getDecaCockpit(id, { companyId })` returns null when the
  DeCA is not that company's (T-1); without `companyId` (anon result) any holder
  of the `id` may view it — the result page has never been secret, the claim
  token is what matters.

## D-034 — Team management: role change + resend + status (TEAM #37)
- Date / phase: 2026-09-04 / Product V3 (sprint 3)
- **Context:** #27 already shipped company workspaces, owner/member roles,
  one-time expiring invitations, immediate revocation, tenant isolation and the
  per-version author audit (#19). #37's acceptance was therefore mostly already
  met; the delta built here:
  - `changeRole()` in `lib/team.ts` + `PATCH /api/team/members/[id]` — an admin
    promotes/demotes a member (owner-only, not self, the workspace always keeps
    at least one admin).
  - `/panel/equipo`: a per-member role `<select>` (Operador / Administrador),
    the member's join date and an "Activo" status, and a "Reenviar" action on a
    pending invitation.
- **Deliberate omission (recorded):** "last activity / login" per member (#37
  team UI) — there is no `lastActiveAt` column and the issue qualifies it "if
  safely available". Adding it is a schema migration + a write on every login;
  deferred until there is a support reason for it. Join date + active status are
  shown instead.
- Admin membership inspection for support already exists at `/admin/empresas/[id]`
  (#33).

## D-035 — Persona-led landing + persona pages (GROWTH #35)
- Date / phase: 2026-09-04 / Product V3 (sprint 3)
- **Decision:** the landing's "Hecho para quien mueve mercancía" section (from
  #22) is upgraded to four job-to-be-done cards — *Transportista autónomo*,
  *Empresa de transporte*, *Agencia / operador*, *Cargador / expedidor* — each
  with concrete benefits and a CTA to its own persona page. Four persona SEO
  pages added to `SEO_PAGES` (`/deca-autonomos`, `/deca-empresas-transporte`,
  `/deca-agencias-transporte`, `/deca-cargadores`), rendered by the existing
  `(seo)/[slug]` template and auto-included in the sitemap.
- **No pricing/plans, no sales contact:** every persona CTA leads to product use
  (a persona page or `/crear`). The messaging stays "una sola herramienta, todos
  los perfiles, gratis durante la fase de lanzamiento".
- **Analytics:** `persona_autonomo_cta`, `persona_transport_company_cta`,
  `persona_agency_cta`, `persona_shipper_cta` added to the closed event set;
  fired by a `TrackedLink` on each card, no PII (like every other event).
- **Onboarding adaptation** (§"Onboarding adaptation") — NOT built: it would tie
  into #38's progressive onboarding and #30's OAuth flow. Persona pages inform;
  they never lock functionality. Deferred to #38.

## D-036 — Competitive feature pack: CSV export + workflow status + integration boundary (PRODUCT #34)
- Date / phase: 2026-09-04 / Product V3 (sprint 3)
- **Delivered here:**
  - **CSV export** — `GET /api/export/history` streams the signed-in company's
    DeCA history (company-scoped, T-1; honours the `/panel/historico` filters) as
    UTF-8 CSV with a BOM and the documented columns (referencia, creado,
    fecha_transporte, cargador, transportista, origen, destino, matrículas,
    mercancía, versión, estado, url_publica). `historyToCsv()` is pure (RFC 4180
    quoting) + unit-tested. "Exportar CSV" link on `/panel/historico`.
  - **Operational workflow status** — `docWorkflowStatus()` maps a history row to
    a PRODUCT state (`Vigente` / `Corregida` / `No disponible`), deliberately NOT
    a legal status; shown in the workspace history (table + mobile cards).
  - **Integration-ready boundary** — the stable typed payload is
    `DecaPayload` (`lib/deca/schema.ts`, already exported); the create service is
    `createDeca()` / `correctDeca()` (`lib/deca/persist.ts`) and the export
    service is `historyToCsv()` (`lib/deca/export.ts`). No public paid API is
    built; API-key concepts stay behind a future issue.
- **Split out to their own issues** (same rationale as the user's PWA split):
  - **#39** — optional company logo on generated PDFs. Touches the compliant
    PDF; must be guarded by `tests/compliance/`.
  - **#40** — driver-friendly offline / PWA access. A stale cached document must
    never look current — needs careful service-worker design.
- **P2/Later (per the issue):** AI PDF import, S3/SFTP connectors, full ERP/TMS
  REST API, premium support — not built, not blocking launch.

## D-037 — Business-ready entrypoints, hardened (AUTH #38, minus OAuth)
- Date / phase: 2026-09-04 / Product V3 (sprint 3)
- **Context:** most of #38 was already in place — anonymous-first creation, the
  claim round-trip preserving the exact PDF/QR/URL (#19), team invites joining
  the existing workspace (#27), prospect invites preserving operator attribution
  (#28), authed visitors to `/entrar`/`/registro` bounced to `/panel`, the
  premium auth card (#30), and the persona headings. The hardening built here:
  - **`safeInternalPath()`** (`lib/auth/safe-redirect.ts`, pure + unit-tested) —
    the post-auth `next` redirect now rejects `//host`, absolute URLs,
    backslash/whitespace tricks and any bounce back into an auth screen or the
    API. Wired into `RegisterForm` (was `next.startsWith("/")` — an open
    redirect).
  - **Invalid invite state** — `/registro?invite=<expired|used|unknown>` now
    shows an "Invitación no válida" card with recovery links (Entrar / crear un
    DeCA gratis) instead of silently falling through to a new-company form
    (which #38 forbids: "never create a duplicate company").
- **Deferred (agreed with the user):** the Google OAuth handshake and the
  two-step progressive company onboarding (identity → minimum company →
  `/panel`). The company fieldset stays on the first `/registro` render
  (D-031/D-032); the OAuth round-trip is what will force a post-auth onboarding
  step, so both land together in the OAuth slice.

## D-038 — Guides + Blog CMS with admin publishing (SEO #32)
- Date / phase: 2026-09-04 / Product V3 (sprint 3)
- **Decision:** a DB-backed editorial content engine, separate from the core SEO
  cluster.
  - **Data:** `ContentItem` (migration `20260904160000_content`) — type
    (guide|blog), slug (unique), status (draft|published|archived), title,
    excerpt, markdown body, category, tags, hero image, author, all SEO fields
    (seoTitle, metaDescription, canonical override, OG, robots index),
    focusKeyword (editorial guidance only), sources, relatedSlugs, previousSlugs
    (slug-change redirects), ctaLabel, publishedAt, lastReviewedAt.
  - **Public:** `/guias/[slug]` + `/blog/[slug]` (SSR, published-only, draft →
    404 unless `?preview=1` as an internal user), `/guias` + `/blog` indexes.
    Premium `ArticleLayout` — breadcrumbs, ToC on long guides, autor / última
    revisión, sources, "sigue leyendo", contextual CTAs. Article/BlogPosting +
    BreadcrumbList JSON-LD. In the sitemap. A moved slug 301s from the old one.
  - **Markdown:** an in-house safe renderer (`lib/content/markdown.tsx`) — React
    elements only, never `dangerouslySetInnerHTML` for body content (T-5) —
    supporting headings, lists, bold/italic/code/links, blockquote callouts,
    tables, `::: faq` blocks and the `[[cta]]` token.
  - **Admin:** `/admin/contenido` (list + type/status filters + the read-only
    core cluster), `/admin/contenido/nuevo`, `/admin/contenido/[id]`,
    `/admin/guias` + `/admin/blog` (filtered). `ContentEditor` — a plain
    markdown textarea (not a page builder), live editorial warnings (missing
    meta, long title, no CTA, normative claims with no source — heuristics, not
    a fake score), draft / publish / unpublish / archive, public preview link.
    `POST /api/admin/contenido` + `PATCH`/`DELETE /api/admin/contenido/[id]` —
    internal only (404). Archive is soft; never a hard delete.
  - **Analytics:** `content_view`, `content_cta_click`.
- **The core SEO cluster stays in code and at root slugs.** The 10
  `content/seo/pages.ts` pages are not migrated into the CMS — moving them would
  churn every internal link, the sitemap and the SEO tests for no gain. The CMS
  is the additive editorial layer; `/admin/contenido` shows the cluster as
  read-only. Seeded editorial content (`prisma/content-seed.ts`,
  `npm run seed:content`, idempotent, also run by `prisma/seed.ts`) covers the
  non-overlapping pieces (cómo corregir, cómo llevarlo el conductor, errores
  frecuentes, cuenta atrás) so the CMS is never empty.

## D-039 — The product carries no company attribution
- Date / phase: 2026-09-04 / Product V3 (sprint 3)
- **Decision (user request):** remove every user-facing reference that links the
  product to a company. "DeCA Fácil" stands on its own.
  - `lib/brand.ts`: `legalName` and `attribution` fields removed.
  - Footer: "Un servicio de Farvertrans S.L. · vX" → "DeCA Fácil · vX".
  - Auth card: the "Un servicio de …" line removed.
  - Generated PDF footer: "Generado por DeCA Fácil · vX" (company dropped).
  - `lib/i18n/es.ts`: `common.attribution` key removed.
  - SEO copy: "Con/es Farvertrans DeCA …" → "Con/es DeCA Fácil …".
  - `lib/growth.ts` comment: "Farvertrans operators" → "internal operators".
  - `tests/unit/brand.test.ts` + `tests/e2e/landing.spec.ts` now assert the
    string "farvertrans"/"s.l." appears nowhere on the public surface.
- **Not changed (mechanical identifiers, not user-facing — flagged to the user):**
  the git repository name (`FarinosV44/Farvertrans-Deca`), the `FVD_` /
  `NEXT_PUBLIC_FVD_` environment-variable prefix, the npm package name
  (`farvertrans-deca`), and the internal `docs/` which still call the project
  "Farvertrans DeCA". Renaming any of these is a breaking, cross-cutting change
  (every deploy config, every env var) and none of them is visible to a user or
  in the product; left for an explicit follow-up if wanted.

## D-040 — Guides + Blog are discoverable from the site nav (SEO #32 follow-up)
- Date / phase: 2026-09-04 / Product V3 (sprint 3)
- **Fix:** #32 shipped the routes, the CMS and the sitemap entries, but nothing
  in the site header or footer linked to `/guias` or `/blog`, so a human
  browsing the site could not find them (only crawlers via the sitemap). Added
  "Guías" and "Blog" to the landing header nav and the footer link row.
- **Also:** `/admin` Resumen now shows real content KPIs (guías/blog publicados,
  borradores, clics de CTA desde contenido) via `contentStats()` instead of the
  "llega con #32" stub, and the e2e spec cleans up the content it creates.

## D-041 — /blog + /guias production crash fixed; footer rebuilt; legal pages added
- Date / phase: 2026-09-04 / post-V3 hardening
- **Root cause (verified):** `app/guias/page.tsx` and `app/blog/page.tsx` called
  `listContent()` (a raw Prisma query) with no error handling. Any DB/config
  problem on the deploy (unmigrated `content_item` table, unreachable
  `DATABASE_URL`, a misconfigured `FVD_STORAGE`/Supabase env) threw an
  unhandled exception, which Next's root `error.tsx` boundary caught and
  rendered as the generic "Algo no ha ido bien" screen — confirmed by
  reproducing the exact boundary text the user reported. The landing page never
  touches `content_item`, which is why `/` kept working.
- **Fix — defensive data layer:** `listPublishedFullSafe()`, `resolvePublicSafe()`,
  `resolveRelatedSafe()` (`lib/content/cms.ts`) catch and log
  (`content_index_failed` / `content_page_failed` / preview) instead of
  throwing; `/guias` and `/blog` render an elegant empty state on any failure,
  never the framework error page. `/guias/[slug]` and `/blog/[slug]` still 404
  correctly when content genuinely doesn't exist.
- **Also found + fixed the same class of bug in DeCA generation itself:**
  `POST /api/deca`'s idempotency pre-check and the abuse-gate call (added in
  D-029/#29) sat OUTSIDE the try/catch that classifies failures — a DB hiccup
  there produced a raw, unclassified 500 (no correlation code, no
  `generation_failure` row, the wizard's generic "No se pudo generar el DeCA"
  message) instead of the staged failure #29 promises. Moved both inside the
  try/catch. The wizard also now treats ANY 5xx as a retryable classified
  failure (not only `generation_failed`), so an unclassified crash still keeps
  the draft and offers a retry instead of a dead end.
- **`/blog` and `/guias` rebuilt as real pages** (not placeholders): H1, intro,
  `ArticleCard` (title, excerpt, category, date, estimated reading time, CTA),
  responsive grid, per-type JSON-LD (`Blog`/`BlogPosting` on `/blog`,
  `CollectionPage` on `/guias`), canonical + OG metadata. `/guias` adds a
  client-side search/filter (`GuideSearch`) — no new API route needed at this
  catalog size.
- **Footer rebuilt** as a 4-column product footer (Producto / Recursos / Legal +
  brand column), better hierarchy, hover states, mobile stacking, the BOE
  reference kept with its link, a clickable support email.
- **Four legal pages added** (`/aviso-legal`, `/privacidad`, `/cookies`,
  `/contacto`) — real content, `noindex,follow`. The legal-entity identity
  (razón social, NIF, domicilio) is explicitly flagged as "se publicará antes
  del lanzamiento" rather than inventing one — no fabricated company data,
  consistent with D-039.
- **Navigation audited**: `tests/e2e/nav-links.spec.ts` crawls every header and
  footer link and asserts 200; every route the header/footer can reach now
  exists.

## D-042 — Goods DeCA: structured loading/unloading locations + separate load/unload dates (PRODUCT #41, goods only)
- Date / phase: 2026-09-04 / launch execution (user directive: production stability → generation → legal data model)
- **Decision:** for **goods (`mercancías`) transport only**, replaced the loose
  `origin` (string) / `destination` (string) / `transportDate` (single date)
  fields with:
  - `loadLocation` / `unloadLocation` — required structured addresses
    (`{name, address, postalCode, city, province, country}`, `lib/deca/location.ts`),
    matching #41 §2's minimum: company/establishment name + complete address.
  - `loadDate` / `unloadDate` — separate required dates, `unloadDate >= loadDate`
    enforced both client-side (wizard step 2, immediate feedback) and
    server-side (`decaPayloadSchema` refine — cannot be bypassed via a direct
    API call). Same-day loading/unloading is explicitly allowed.
  - No DB migration: `dataJson` is already a JSON blob (schema-free at the
    Postgres level), and `Deca.serviceStart`/`serviceEnd` already existed as
    columns — `loadDate`→`serviceStart`, `unloadDate`→`serviceEnd`
    (`lib/deca/persist.ts`). This is the first time `serviceEnd` is ever
    populated, which activates the previously-dead R-9 deactivation window
    (`lib/deca/deactivation.ts`) for NEW documents only; existing documents
    keep `serviceEnd = null` and stay always available — not a regression.
  - Touched: PDF (`lib/pdf/deca-document.tsx`), review summary + wizard step 2 UI
    (`components/deca/wizard.tsx`), document cockpit (`lib/deca/detail.ts` diff
    FIELDS extended to track city/province too, `components/deca/doc-summary.tsx`),
    history + CSV export (`lib/data/history.ts`, `lib/data/history-filter.ts`,
    `lib/deca/export.ts` — CSV columns `fecha_carga`/`fecha_descarga`/
    `lugar_carga`/`lugar_descarga`), admin cross-tenant table/search
    (`lib/admin/records.ts`), templates (`lib/data/templates.ts`,
    `components/deca/{save-template,template-list}.tsx`), all `/panel/*` and
    `/crear/*` pages, `lib/diagnostics.ts` smoke payload,
    `docs/legal-data-model.md` (full rewrite of the requirement→field mapping).
  - Test suite: `tests/unit/{deca-validate,deca-diff,deca-export,
    deca-generation-pipeline,history-filter}.test.ts` + all 16 e2e specs that
    filled `#origin`/`#destination`/`#transportDate` (`tests/e2e/{crear,
    creator-v2,creator-ux31,team,driver-delivery,export-csv,launch-happy-path,
    reliability,admin,auth-ux,doc-cockpit,operadores,workspace,growth,registro,
    launch-gate,attribution,build13}.spec.ts`).
  - Gate green (local, Docker Postgres): 106 unit + 129 e2e + typecheck + lint.
- **Deferred (recorded, not forgotten):**
  - **Passenger (`viajeros`) document schema** (#41 §4) — the issue explicitly
    requires researching and documenting the exact mandatory passenger-transport
    data against the applicable regulation BEFORE building a schema/form/PDF
    ("Do not invent passenger fields by analogy with goods"). This matches the
    user's own explicit instruction in this session ("Do not invent passenger
    fields until the passenger legal model is validated"). Not started.
  - **`GOODS | PASSENGERS` type enum + company-default transport type +
    first-time `/crear` type picker** (#41 §1/§5/§6) — depend on the passenger
    schema existing; not started.
  - **Structured `SavedAddress`** (#41 "saved-address/autocomplete... should
    save this full structured location, not a loose text string") — the
    wizard's saved-address autofill was already unused/dead for the load/unload
    step before this slice (`SavedData.addresses` was passed but never read in
    step 2 UI), so nothing regressed. Upgrading `SavedAddress` to a structured
    shape + wiring real autofill is its own slice (schema migration + UI).
  - **Admin filter by Mercancías/Viajeros** (#41 §7) — depends on the type enum.
- **Why:** issue #44 (LAUNCH — ruthless launch sequence) lists "correct legal/
  data model for goods transport (#17 + #41)" as a Phase 0 launch blocker, ahead
  of acquisition/registration work. The user's own directive this session named
  goods structured locations + separate dates as the PHASE 3 priority, explicitly
  deferring passenger fields. This is pure application-layer work (no external
  credential/deploy dependency), so it proceeded while Hostinger production
  access was blocked on DNS propagation to the new domain (`decaprofesional.es`).
- **Not verified in production:** this slice is code-complete and gate-green
  locally; production deployment/verification is blocked on the DNS cutover
  (see PROGRESS.md open items) and is the user's infrastructure task.
