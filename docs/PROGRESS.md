# PROGRESS — Farvertrans DeCA

> Living state. Read this FIRST in every session. Keep current and compact.

## Project card
- Name / one-line purpose: Farvertrans DeCA — free, no-limit generator of the Spanish DeCA control document, built for mass acquisition before the 2026-10-05 mandate.
- Project type: Web app (SSR/SSG + API + hosted service) / secondary: Website (marketing + programmatic SEO)
- Stack & target platform(s): Next.js 15 (App Router) + TypeScript, Supabase (Postgres + Storage + Auth), Prisma, @react-pdf/renderer, hosted on Hostinger VPS (Docker) — web/HTML (D-013)
- License: proprietary / UNLICENSED (D-003)
- Docs language: English (token economy — D-002)
- Security profile: references/security/web-app.md + references/security/website.md
- Accessibility: WCAG 2.2 AA floor + AAA where feasible; EN 301 549 / EAA (references/accessibility.md) — D-004
- i18n: single — Spanish (es-ES) for v1, i18n-ready code, additive later (D-002)
- Installed base: fresh v1
- Design system: founding — implementation-first brief at docs/design/IMPLEMENTATION-BRIEF.md; production tokens/assets to be created during first UI slice
- Keel portability: lock + embedded v5.19.2 (D-010)
- Assistant config: full — rules+agents materialised at Phase 2 close (D-018); permissions/pre-commit/CI at Phase 5 scaffold
- E2E: absent
- CI runs on: main (push to main, version tags, PRs targeting main) — D-010
- Models: orchestrator=<session model> / reviewer=sonnet / mechanical=haiku (D-017)
- Keel baseline: v5.19.2
- Website intent: yes — own domain (placeholder deca.farvertrans.es — D-011); site is in-codebase
- Client budget: no (D-005 batch — internal product)
- User guide: [asked at Phase 6]
- Docs theme: n/a until Phase 6
- Test-first policy: pure-logic (D-014)
- Durability: git remote origin https://github.com/FarinosV44/Farvertrans-Deca.git (D-006)
- Autonomy: automatic / issues: after-sprint / Issue sweep interval: 24h / Issue capture: on (D-005)
- Branches: integration branch `develop`; committing BUILD slices directly to `develop`. Nothing awaits `main`.
- Notify: PushNotification (terminal + phone via Remote Control) — the user (D-005)
- Chaining: off (D-009) — continuation-prompt.md written every session; user opens the next chat
- Chaining model: n/a
- Chain verified: n/a

## Phase status
| Phase | Status | Key artifacts |
|-------|--------|---------------|
| 1 Discovery | done | docs/00-competitive-landscape.md ✓, docs/01-discovery.md ✓, docs/01a-confrontation.md ✓, docs/estimate.md (v1) ✓, docs/token-ledger.md ✓, docs/keel-conformance.md ✓, docs/issues.md ✓ |
| 2 Functional spec | done | docs/02-functional-spec.md ✓ (F1–F18, AC-01…AC-37), docs/03-technical-plan.md ✓, docs/threat-model.md ✓, docs/flows/ ✓ (7 flows), docs/estimate.md v2 firm ✓, .claude/rules/ + .claude/agents/ ✓ |
| 3+4 Design (folded — D-019) | done | docs/design/IMPLEMENTATION-BRIEF.md ✓ (screen list + journey + concrete tokens; no external design-tool round-trip) |
| 5 Development | done (v1) | docs/sprints/sprint-1.md ✓, docs/sprints/sprint-2.md ✓, docs/05-test-points.md ✓ · BUILD 05–15 done — v1 released to main |
| 6 Documentation | pending | docs/architecture.md, docs/api/, docs/usage/ |
| 7 Release | pending | docs/07-release.md |
| 8 Website | n/a (site is in the main codebase) | — |

## Current position
- Phase: 5 — Development (execution mode, D-019). Sprint 2 **CLOSED**. **v1 released to `main`.**
- **Done: BUILD 05–15.** Core anonymous flow (05–09) + registered workspace (10) + acquisition
  tracking (11) + operator dashboard (12) + sharing/versioning/abuse (13) + SEO cluster (14) + launch
  gate (15). All green: 47 unit + 57 e2e (6 compliance R-1…R-13 + axe on every public screen +
  cross-tenant + security headers) + typecheck + lint + format + standalone build + keel-verify.
  - 05 scaffold · 06 landing · 07 `/crear` 3-step creator · 08 compliant PDF+QR+`/d/[token]` +
    `npm run test:compliance` gate · 09 signup+claim (own auth D-021) ·
    10 `/panel` + `/panel/historico` (search + date range) + `/panel/datos` (saved data CRUD) + wizard
    autofill + duplicate `/crear?from=<id>` + authed `POST /api/deca` owns the DeCA ·
    11 `lib/attribution/*` — `?ref=` + 5 UTMs, first-touch-never-overwritten + last-touch, first-party
    cookie+localStorage `AttributionCapture` in the root layout, `acquisition` row written at signup,
    `first_deca_at` on first DeCA (authed create + claim), user never sees an operator name ·
    12 `/operadores` internal-only dashboard (404 for everyone else) + `GET /api/operadores/stats`:
    per-operator visits/companies/first-DeCA/total-DeCA/active-7d/30d + conversion rates, from real
    events + real usage; unknown ref codes + organic grouped. Seed adds `admin@farvertrans.local` /
    `admin-dev-only` (internal role, local only).
- **The full flow works and is test-verified:** `/` → CREAR DECA GRATIS → 3 steps (no signup) →
  GENERAR DECA → real compliant PDF+QR at `/crear/[id]` → download (`/d/[token]`) / share →
  "Guardar este DeCA" → `/registro` → `/panel` with the document owned + reusable data.
- **BUILD 13 done** — sharing + corrections/versioning + abuse controls:
  - Sharing: result panel WhatsApp deep link + copy + email via `POST /api/share` (rate-limited,
    templated envelope, mailto fallback when Resend unconfigured), `deca_shared` event.
  - Corrections (R-13): `/app/deca/[id]` detail + version history; `/app/deca/[id]/corregir` reuses
    the wizard in correction mode (required "motivo"); `POST /api/deca/[id]/version` → new
    `deca_version` with a NEW token/URL/QR/PDF, prior versions untouched and still retrievable,
    `deca.currentVersionId` updated, `deca_corrected` event. Non-owner → 401/404.
  - Abuse (F16): `lib/abuse/*` — pure sliding-window `decide()`, signed proof-of-work challenge (plain
    SHA-256, no client secret; hCaptcha when configured), server `checkAbuse()` on anonymous
    `POST /api/deca` + `POST /api/share`. Fingerprinted requests get the tight limit, un-fingerprinted
    a loose IP-only one. `GET /d/[token]` NEVER calls it (inspectors never challenged). Wizard solves
    the PoW invisibly and retries. First-time user is never challenged.
- **BUILD 14 done** — SEO cluster: `content/seo/pages.ts` (10 pages, real Spanish content, BOE/Ministerio/
  CETM citations, last-reviewed date) rendered by one template `app/(seo)/[slug]/page.tsx`
  (`dynamicParams=false` → unknown slug 404s; static generation; FAQPage JSON-LD; canonical; internal
  cluster links; CTA to `/crear`). `/soy-obligado` guided obligation check (SSR query-param form, works
  without JS). `sitemap.ts` extended. SEO technical base (robots/meta/OG) was already done in BUILD 06.
- **BUILD 15 done** — launch gate: `middleware.ts` (CSP + HSTS-in-prod + nosniff + X-Frame-Options DENY
  + Referrer-Policy + Permissions-Policy); cross-tenant authz e2e (company B → 404 on A's document,
  correction, history); token-entropy + failure-path e2e; `.githooks/pre-commit` confidential gate
  (`core.hooksPath` set) + `.claude/settings.json` allow-list + `.github/workflows/ci.yml` +
  `Dockerfile` (Next standalone, non-root, healthcheck) + `.dockerignore`; `docs/07-release.md`
  (compliance matrix with evidence, quality gate, Hostinger+Supabase deploy runbook, sample-DeCA
  instructions, merge-to-main steps).
- **v1 released:** `develop` merged to `main` (946ac88, BUILD 05–15). CI green on main (typecheck, lint,
  format, 47 unit, 57 e2e, 6 compliance, keel-verify, secret scan). No version tag (not
  requested).
- **Post-release hotfixes on `main` (CI green at d200158):**
  - `ff731dd` — Prisma Linux binaryTargets + node:20-slim Dockerfile + lenient `/health` healthcheck.
  - `fbc19ca` — **the first 503**: route segment literally named `app` (`app/app/`) collided with `/`
    in the Next standalone build, so `GET /` 307-redirected to `/registro`. Fixed by
    `git mv app/app app/panel` + updating every link/redirect/robots/test. Verified in Docker.
  - `a653d37` + `7a0b175` — acquisition attribution captured in `middleware.ts` (removed a
    client-hydration race + a cookie double-encoding bug that made two e2e tests flaky in CI).
  - `e088f51` — `docker-compose.prod.yml`: self-contained deploy (app + Postgres + PDF volume), D-024.
  - `d200158` — **the Cloud Startup 503**: LiteSpeed `lsnode.js` does `require(startupFile)`; the ESM
    standalone `server.js` threw `ERR_REQUIRE_ESM`. Removed `"type":"module"` from package.json (Next
    now emits CJS `server.js`) + added `server.cjs` startup file + `scripts/standalone-postbuild.mjs`
    + a CI guard. D-025. Hostinger startup file = `server.cjs`.
- **FIX #16–#19 + LAUNCH #20 (D-026) — merged to `main` at `0272c33`, CI green:** #16 = the Cloud
  Startup 503 above (code-complete, awaiting the user's deploy test). #17 = carrier domicilio now
  required + weight kept verbatim + wizard review step + `docs/legal-data-model.md`. #18 = per-version
  `pdf_sha256` (checked on every download) + `FVD_STORAGE_DIR` persistent path. #19 = version author +
  `docs/retention-policy.md` (claim never resets retention / regenerates). #20 =
  `tests/e2e/launch-happy-path.spec.ts` + `docs/production-smoke-checklist.md`. Migration
  `20260903230000`.
- **Product V2 — #21–#28 (D-027):** brand config ("DeCA Fácil"), premium landing V2, password
  recovery + logout + auth states, workspace filters/mobile, DeCA templates + "usar mi empresa",
  driver-delivery (native share / print / Comprobar QR / re-share reminder), multi-user company
  workspaces + invitations (`/panel/equipo`), and the operator acquisition engine
  (`/operadores/captacion` — prospects, onboarding links, activation funnel). 8 commits on `develop`,
  8 new e2e specs, 4 migrations (`20260904090000`…`_120000`). Merged to `main` — CI status below.
- **Product V3 — #29–#38 (in progress):**
  - **#29 P0 FIX — generation reliability + real failure exposure (D-029), on `develop`:** every
    render/storage/DB failure is now classified into a stage (`validation` / `configuration` /
    `pdf_render` / `pdf_storage` / `database` / `unknown`) and carries a 6-char correlation code the
    user reads out. `lib/deca/generation.ts` (pure classification + code + PII redaction),
    `lib/deca/failures.ts` (structured log line + `generation_failure` row — never the payload),
    `lib/deca/persist.ts` (per-stage wrappers + orphan-object cleanup when the DB write fails after
    upload), `lib/diagnostics.ts` + `GET /api/admin/diagnostics` + `npm run diagnose -- <url>`
    (deploy readiness: env, DB, migrations, PDF render smoke, storage round-trip, HTTPS base URL,
    providers, 24 h generation health), `lib/admin/guard.ts` (internal session or `FVD_ADMIN_TOKEN`
    header; 404 never 403). Wizard shows the code and retries with the SAME idempotency key.
    `POST /api/deca` resolves the idempotency key BEFORE the rate limiter so an idempotent replay is
    never answered with 429. Migration `20260904140000_generation_failure`. Gate green:
    79 unit + 95 e2e + 8 compliance + typecheck + lint + format + keel-verify. **Not done (CREDENTIAL):**
    reproducing the production exception + switching prod to persistent storage — `npm run diagnose`
    names it.
  - **#33 ADMIN V2 — internal command center at `/admin` (D-030), on `develop`:** shell (sidebar +
    mobile drawer, `requireInternal()` → 404, `noindex`, `/admin` in robots.txt) + 11 screens:
    Resumen (KPIs + operational alerts), DeCA (cross-tenant table + detail), Empresas (+ detail),
    Usuarios, Captación (reuses #28), Operadores (reuses #12), Contenido (SEO list; editorial CMS
    blocked on #32), Errores (#29 failures by correlation code + triage), Sistema (`runDiagnostics`).
    Global search API across company/user/DeCA ref/correlation code/prospect. `lib/admin/*`
    (metrics, failures, records, search, range, guard). `PATCH /api/admin/failures/[id]` +
    `GET /api/admin/search`. Gate green: 84 unit + 100 e2e + 8 compliance + typecheck + lint +
    format + standalone build + keel-verify. Deferred (recorded in D-030): internal sub-roles,
    editorial content CMS (#32), axe on admin screens.
  - **#30 AUTH — premium auth card, UI-only (D-031), on `develop`:** `/entrar` + `/registro` now a
    focused centered card on a branded ground (`AuthShell`), no site chrome. Contextual headings,
    "Continuar con Google" button (official 4-colour G; **inert** until `GOOGLE_CLIENT_ID`+SECRET
    set — caption "disponible muy pronto"), "o continúa con email" divider, password show/hide,
    trust line, in-place login⇆register switch. Auth LOGIC untouched — zero regression.
    `components/auth/{auth-shell,google-button,password-field}.tsx` + restyled `register-form.tsx`.
    Gate green: 84 unit + 104 e2e + 8 compliance + build + keel-verify.
    **Deferred to the OAuth slice (D-031):** the real Google handshake (needs OAuth-lib decision vs
    D-021 + Google credentials), account-linking safety, progressive company onboarding (2-step).
  - **#31 UX — creation-flow clarity (D-032), on `develop`:** plain-language progress label
    (`Paso 1 de 3 · Quién contrata…`), focus jumps to the first field to fix, review grouped into
    PDF sections each with `Editar`, visible "Estamos generando tu PDF y QR…" status, human
    microcopy, sticky mobile action bar. Kept at 3 steps + inline review (see D-032). Gate green:
    84 unit + 108 e2e + 8 compliance.
  - **#36 PRODUCT — document cockpit (D-033), on `develop`:** `/crear/[id]` + `/panel/deca/[id]`
    rebuilt via shared `lib/deca/detail.ts` — QR inspection card (real server-rendered QR),
    sectioned data mirroring the PDF, version timeline (badges, per-version PDF link, author in
    workspace), "Qué ha cambiado" field diff for v2+ (`diffVersions` pure + unit-tested),
    technical-details accordion. Gate green: 88 unit + 110 e2e + 8 compliance.
  - **#37 TEAM — role change + resend + status (D-034), on `develop`:** `changeRole()` +
    `PATCH /api/team/members/[id]` (promote/demote, never drop the last admin), per-member role
    select on `/panel/equipo`, join date + "Activo" status, "Reenviar" on pending invites. #27
    already covered most of #37's acceptance. Also folds in a #36 refinement (server QR memoized,
    `qrPngDataUriCached`). Gate green: 88 unit + 111 e2e + 8 compliance.
  - **#35 GROWTH — persona-led landing (D-035), on `develop`:** landing persona section upgraded to
    4 job-to-be-done cards (autónomo / empresa / agencia / cargador), each CTA → its own persona SEO
    page (`/deca-autonomos`, `/deca-empresas-transporte`, `/deca-agencias-transporte`,
    `/deca-cargadores`, auto in sitemap). 4 persona CTA events. No pricing/sales contact. Gate green:
    114 e2e + 8 compliance. Onboarding adaptation deferred to #38.
  - **#34 PRODUCT — competitive feature pack (D-036), on `develop`:** history CSV export
    (`GET /api/export/history`, company-scoped, filter-aware, RFC 4180 + BOM; `historyToCsv` pure +
    unit-tested; "Exportar CSV" on `/panel/historico`), operational workflow status
    (`docWorkflowStatus` — Vigente / Corregida / No disponible, a product state not a legal one),
    integration boundary documented (DecaPayload + createDeca/correctDeca + historyToCsv). **Company
    logo → new issue #39** (touches the compliant PDF); **PWA/offline → new issue #40**. Also capped
    local e2e workers at 3 (react-pdf is CPU-bound; 6 starved the loop). Gate green: 94 unit + 117
    e2e + 8 compliance.
  - **#38 AUTH — business-ready entrypoints, hardened (D-037), on `develop`:** `safeInternalPath()`
    (pure + unit-tested) fixes the post-auth `next` open redirect; `/registro?invite=<bad>` now
    shows an "Invitación no válida" recovery card instead of a new-company form. Most of #38 was
    already in place (#19/#27/#28/#30). **Deferred with the user: Google OAuth handshake + 2-step
    progressive onboarding** — land together in the OAuth slice. Gate green: 98 unit + 120 e2e + 8
    compliance.
  - **#32 SEO — Guides + Blog CMS (D-038), on `develop`:** `ContentItem` model (migration
    `20260904160000_content`) + `/guias/[slug]` + `/blog/[slug]` (SSR, published-only, `?preview=1`
    for internal) + `/guias` + `/blog` indexes + Article/BreadcrumbList JSON-LD + sitemap + slug
    redirects. Safe in-house markdown renderer (no `dangerouslySetInnerHTML`). Admin:
    `/admin/contenido` (+ nuevo / [id] / guias / blog), `ContentEditor` with live editorial warnings,
    draft/publish/unpublish/archive, `POST`+`PATCH`+`DELETE /api/admin/contenido`. Core SEO cluster
    stays in code (not migrated — churn for no gain). Seed content via `npm run seed:content`
    (idempotent). Gate green: 105 unit + 125 e2e + 8 compliance.
  - **Product V3 (#29–#38) MERGED to `main`** (merge commit `f09dde0`, 2026-09-04) on the user's
    explicit instruction. `develop` == `main`. CI running on the `main` push. No version tag (not
    requested). Splits opened: #39 (company logo on PDF), #40 (PWA/offline). Deferred to the OAuth
    slice: Google handshake + 2-step onboarding (part of #30/#38). D-039: no company attribution
    anywhere public.
- **Remaining before public launch (the user's, not code):** RGPD review of anonymous-doc retention
  (D-016); legal/inspection check of a real generated DeCA; provision Postgres/storage + domain +
  Resend + hCaptcha, deploy per `docs/07-release.md`; run `docs/production-smoke-checklist.md`; close
  issues #5–#28.
- **Post-launch code items (tracked in `docs/07-release.md`):** nonce-based CSP;
  `docs/.keel/plan.json` + `scripts/keel-close`/`keel-handoff-verify` (skipped under execution mode
  D-019); local + long-tail SEO pages (`docs/sprints/deferred.md`).
- If work continues: **Phase 6 (Documentation)** — `docs/architecture.md`, `docs/api/` full reference,
  `docs/security.md`, `docs/accessibility.md` (record the guided AT pass), `README.md`, `guide/`
  end-user HTML guide.

## Open items
- Pre-launch only: real domain; RGPD review of anonymous-document retention; legal inspection check of generated DeCA; Hostinger VPS sizing.
- Unverified external steps/assets: Supabase project, Hostinger VPS, DNS, transactional email, hCaptcha, GitHub secrets.
- Forge EPICs: #1 landing, #2 attribution, #3 SEO, #4 compliance. Execution queue #5 onward.
- Ready for `main`: the unverified-email panel banner (`a4a28bb`, this session) — small additive
  feature, not yet forwarded (only CI/CD-fix commits were forwarded without re-asking this session).
  `main` is at `04ad0e3`; `develop` is one commit ahead.

### Deferred items
- Local SEO pages; long-tail/user-type SEO beyond core launch pages; public API; CSV *file upload*
  for prospect import (paste-import shipped); eCMR interop feature.

## Launch execution (2026-09-04, user directive — "ruthless launch sequence" per #44)
- **DNS resolved.** `https://decaprofesional.es/` now serves HTTP 200 with a
  valid cert and the app's own security headers — confirmed via `curl`.
- **`develop` merged to `main`, pushed, CI green at `04ad0e3`.** `main` now
  includes D-042 (PRODUCT #41 structured goods legal data model), D-043
  (TRUST #42 + GROWTH #46 — Praetoria identity, versioned terms, email
  verification, lead gate) — merge explicitly authorised by the user — plus two
  fixes forwarded the same session: a `format:check` red (prettier) and the
  `directUrl`/connection-pool fix below.
- **BLOCKED — the live app has not been redeployed with `main`'s latest
  commit; production DB was reported down but is now root-caused and fixed in
  code.** Evidence:
  - `GET /health` on `https://decaprofesional.es/health` → `{"status":"degraded",
    "version":"0.1.0","db":"down"}` (unchanged as of the last check — expected,
    since nothing has been redeployed yet).
  - The live site is still serving the PRE-D-042/D-043 build: `/terminos` 404s
    and the homepage carries no Praetoria trust copy, even though both exist on
    `main`. Hostinger deploy is a manual SSH/build step
    (`docs/07-release.md` "Hostinger Cloud Startup") — it does not auto-deploy
    on `git push`.
  - **Root cause of `db: "down"`, diagnosed and fixed:** the user shared the
    production `DATABASE_URL` — Supabase's SESSION pooler (port 5432,
    Supavisor free-tier `pool_size` 15). `npx prisma migrate status` against it
    returned `FATAL: max clients reached in session mode`; the same
    credentials over the TRANSACTION pooler (port 6543, `pgbouncer=true`)
    answered a real query fine. Prisma had no `directUrl`, so the app's
    runtime queries and every migration/tooling connection fought over the
    same 15-connection cap. Fixed on `main` (`04ad0e3`): `directUrl` added to
    `prisma/schema.prisma`; `DATABASE_URL` (app, transaction pooler) split from
    `DIRECT_URL` (migrations, session pooler) in `.env.example`,
    `.env.prod.example`, CI, and `docs/07-release.md`. The credential itself
    was never written to any file — used only as a transient shell env var for
    the connectivity test.
  - **RESOLVED — the user set both env vars and redeployed.** `npm run
    diagnose` then showed every critical check green (config, storage_config
    [Supabase Storage], db, pdf_render, storage_write, base_url) — EXCEPT
    `schema`, which reported OK too but generation itself 500'd with a
    classified `database` failure (`recordGenerationFailure`, correlation
    `4A46LH`): `The column "creator_name" does not exist in the current
    database`. Root cause: the redeploy's `prisma migrate deploy` step never
    actually applied `20260904190634_trust_registration_v2` — almost
    certainly because it also hit the session-pooler connection cap during
    the same build. **Fixed:** the user ran the migration SQL directly in the
    Supabase SQL Editor; this session then resolved Prisma's migration ledger
    (`_prisma_migrations` was missing that row — `prisma migrate resolve` hung
    against the pooled connection, since its advisory-lock step doesn't work
    over pgbouncer transaction mode, so the row was inserted directly via a
    plain `INSERT`, verified against the other 10 migration rows already
    present). Confirmed fixed by generating a real DeCA (below).
- **Phase 9 — real production E2E, done this session (not just code review):**
  - **TEST A (new visitor):** anonymous `POST /api/deca` → 201, real
    `decaId`/`token`/`pdfSha256`. `GET /d/<token>` → 200, `content-type:
    application/pdf`, first 8 bytes `%PDF-`, byte length 20616, SHA-256
    matches the API's `pdfSha256` exactly, no `set-cookie`. PDF text
    (extracted via `pdfjs-dist`) prints the exact same
    `https://decaprofesional.es/d/<token>` URL that serves it (R-5/R-6). The
    ONE thing this cannot prove is a literal camera scanning a screen/printout
    — HARDWARE, not code — but the QR is generated by the same
    already-unit-tested code path as the printed URL. Registered a real test
    account (`launch-test-*@example.com`) with `claim=<claimToken>` → the
    anonymous DeCA is claimed, same token still resolves. `/verificar-email`
    renders correctly for the unverified account. **Blocked, CREDENTIAL:** no
    `RESEND_API_KEY`/`FVD_MAIL_FROM` configured yet, so the verification email
    never actually sends (confirmed via `npm run diagnose`'s `mail: warn`) —
    the soft-gate design means this does NOT block the rest of the flow, but
    the literal "click the link in the inbox" step needs Resend set up.
  - **TEST B (returning user, duplicate):** same session, authenticated
    `POST /api/deca` with different load/unload → new independent `decaId` +
    `token` + `pdfSha256`. `GET /d/<newToken>` → 200 `application/pdf`.
    `GET /panel/historico` shows BOTH documents (Almacén Norte→Sur and
    Almacén Norte→Este).
  - Test data left in production (`launch-test-*@example.com`,
    "Transportes Lanzamiento SL", "Cargador Prueba SL") — flagged to the user,
    not deleted without asking.
  - **Still open:** the panel banner (D-045, below) was merged to `main`
    AFTER this E2E pass, so it hasn't been re-verified live; Resend/hCaptcha
    are unconfigured (mail: warn, Google OAuth: warn — both non-blocking).
  - **Also verified: versioning/corrections (#19) in production.**
    `POST /api/deca/<id>/version` with a real `changeReason` → new version 2,
    NEW independent token/PDF (SHA-256 `333f2d98…`). Version 1's URL re-fetched
    afterward → byte-for-byte identical SHA-256 to before the correction
    (R-13 retention, confirmed live, not just in the local suite). Document
    detail page `/panel/deca/<id>` → 200.
  - **Found and fixed live: double-slash URL bug (SEO-affecting, not
    transactional).** `NEXT_PUBLIC_FVD_BASE_URL` was set on Hostinger WITH a
    trailing slash; most URL call sites build `${baseUrl}/path` without
    stripping it, so canonical tags, OG tags, and every `sitemap.xml` entry
    were double-slashed (`decaprofesional.es//crear`) — confirmed live via
    curl before the fix. The `/d/[token]` and QR URLs were unaffected only
    because that one call site already stripped it defensively. Fixed at the
    source in `lib/env.ts` (`publicEnv.baseUrl` now strips trailing slashes
    once, so no per-call-site patching and no future recurrence regardless of
    how the env var is set) — 2 new unit tests, 108 unit + 27 targeted e2e
    (landing/SEO/compliance) green, merged to `main`. **Still needs a
    redeploy** to actually take effect in production (it's a
    `NEXT_PUBLIC_*` var, baked in at build time — editing the Hostinger env
    var alone won't fix it without a rebuild).
- **D-042 done, on `main`:** PRODUCT #41 goods-only
  slice — structured `loadLocation`/`unloadLocation` (name/address/postalCode/
  city/province/country, all required) replace the loose `origin`/`destination`
  strings; separate `loadDate`/`unloadDate` (unload >= load, same-day allowed)
  replace the single `transportDate`. No DB migration needed (`dataJson` is a
  JSON blob; `Deca.serviceStart`/`serviceEnd` columns already existed and are now
  actually populated, which also activates the previously-dead R-9 deactivation
  window for new documents only). Every consumer updated: PDF, wizard UI, review
  summary, document cockpit + diff, history + CSV export, admin table/search,
  templates, all `/panel/*` + `/crear/*` pages, diagnostics smoke payload.
  `docs/legal-data-model.md` rewritten. **Gate green locally** (Docker Postgres,
  since production access is blocked): 106 unit + 129 e2e + typecheck + lint.
  **Deferred, on the record (D-042):** passenger (`viajeros`) schema (needs its
  own legal-requirement research first, per the issue and the user's explicit
  instruction not to invent passenger fields), the `GOODS|PASSENGERS` type enum
  + company default + `/crear` type picker, structured `SavedAddress` (was
  already dead/unused in the wizard before this slice), admin type filter.
- **D-043 done, on `main`:** #42 + #46 —
  Praetoria legal identity (footer + legal pages + `/terminos` + landing trust
  section), versioned `TermsAcceptance` (required checkbox, team-invite joins
  exempt), company signup fields (contactName/phone/profile picker — logo
  upload deferred), email verification (soft gate — `/verificar-email`
  dedicated screen + resend/change-email, `/panel` never blocked), and the
  lightweight name+email identity gate on the first anonymous DeCA
  (`fvd_lead` cookie → `/crear` shows a "register for your next one" screen;
  the API itself stays lenient — see D-043 for why the abuse-tolerance tests
  forced that scope call). Landing hero repositioned to professional-first
  copy per the issue's exact wording. Migration
  `20260904190634_trust_registration_v2`. New
  `tests/e2e/trust-registration-v2.spec.ts` (5 tests) plus ~17 existing e2e
  files mechanically updated (accept-terms checkbox + /verificar-email
  redirect at every genuine UI registration; lead fields at every anonymous
  wizard-generate). **Gate green locally**: 106 unit + 134 e2e + typecheck +
  lint.
- **Not started:** company logo upload (#46, deferred); passenger transport
  type (#41 §4/§5 — GOODS|PASSENGERS enum, company default, `/crear` picker,
  admin filter — blocked on the passenger legal-requirement research the issue
  itself demands before building).
- **AUTH #30 — Google OAuth ACTIVATED (D-046), on `main`.** The real handshake
  (`lib/auth/google.ts` + `lib/auth/oauth-state.ts`, plain fetch, no SDK),
  `/api/auth/google` + `/api/auth/google/callback`, account linking by email
  (`findOrCreateGoogleUser`), and the 2-step company-completion screen
  (`/registro/completar-empresa` + `completeCompanyForUser`) for a brand-new
  Google sign-up. Migration `20260904225323_google_oauth`. Stays inert
  ("disponible muy pronto") until `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
  are set — the user is adding those the next morning; no further deploy
  needed once they do. 114 unit (6 new) + 134 e2e + 8 compliance green.
- **Investigated: "el botón de entrar no funciona"** — reproduced live in a
  real browser against `https://decaprofesional.es/entrar` with the
  `launch-test-*` test account: filled the form, clicked Entrar, landed on
  `/panel` correctly (session cookie set, history + banner rendered). Could
  not reproduce a failure. One screenshot call timed out mid-navigation
  (tooling hiccup, not a functional failure — the login had already
  succeeded by the time it was retried). No fix applied since nothing
  reproduced; flagged to the user to report exact steps/browser/error if it
  recurs.
- **In-`/panel` unverified-email reminder banner — DONE** (this session):
  `panel-verify-email-banner` shown on `/panel` whenever `user.emailVerifiedAt`
  is null, linking to `/verificar-email?next=/panel`. e2e assertion added to
  `trust-registration-v2.spec.ts` (banner visible right after the soft-gate
  skip, gone after verifying via the token link). **On `develop` only, not yet
  forwarded to `main`** (new scope, not a break-fix — needs the user's OK).
- **Real local verification (Docker started this session, not just CI):**
  at `develop@82bde39` — 106 unit + **134 e2e + 8 compliance (R-1…R-13), all
  passing** against a real local Postgres, including R-7/R-8 (the public
  `/d/[token]` URL serves the exact PDF with no auth/cookie/interstitial —
  Phase 4's requirement, confirmed automated, not just code review). Typecheck
  + lint + format also clean. The one thing this cannot verify is a literal
  second physical device scanning a live QR against a reachable HTTPS
  URL — that needs the real deployment.

## Launch hardening (2026-09-05, user directive — close remaining launch-relevant gaps per issues #20-#47)
- **Issue review done** (code-verified, not just forge state — every one of #20-#47 is still OPEN
  on the forge; none closed yet, pending the closing pass below):
  - **Substantially complete, verified in production or gate-green locally:** #16-20 (launch happy
    path), #21 (brand), #22 (landing V2, superseded/extended by #35/#42/#46), #23 (registration),
    #25 (creator V2 — templates/autofill/autosave), #26 (driver delivery/share/QR verify), #27+#37
    (team/multi-user), #28 (acquisition engine — prospects/invites/operator dashboard), #29
    (generation reliability/diagnostics), #30 (auth UI + real Google OAuth, D-046, inert pending
    credentials), #31 (creator UX), #32 (guides/blog CMS), #33 (admin V2 shell), #34 (CSV export +
    workflow status + integration boundary), #35 (persona landing), #36 (document cockpit), #38
    (auth entrypoints hardened), #41 (goods structured locations/dates — passenger split explicitly
    deferred per the issue's own gate), #42 (Praetoria trust + lightweight lead gate + full onboarding
    on repeat — verified in production TEST A/B), #44 (launch sequence — Phase 0 blockers all met),
    #46 (trust landing + signup + email verification, soft gate).
  - **Gaps found and closed this session:** #24 (panel was plain text/list UI — D-047 icon-led
    visual layer, phase 1; full IA still open), #45 (route data lived only in a JSON blob, no
    commercial-consent model — D-048 added `DecaRouteIntel` + `CommercialConsent`), #47 (admin
    company detail was missing verification/terms/consent/DeCA-rate fields — D-049).
  - **Genuinely not started (deliberate, on the record):** #39 (company logo on PDF — its own
    issue since D-036), passenger transport type (#41 §4/§5, blocked on legal research per the
    issue's own instruction).
  - **Real-UI walkthrough DONE this session (D-050), on local dev, not just code review:**
    registered a real company end-to-end (profile picker, terms, data-protection notice — found and
    fixed a double-period copy bug live), viewed the new icon-led `/panel` + `/panel/datos`,
    toggled commercial consent end-to-end, generated a real goods DeCA, then used "Repetir /
    duplicar" to generate a second one changing only the two dates — new id/token/QR, old document
    untouched, both in `/panel/historico`, confirming second-DeCA speed with a real timed pass. A
    `DecaRouteIntel` row was confirmed written correctly in Postgres for both. This was on
    `develop` locally — **not yet re-verified on decaprofesional.es**, since `develop` hasn't been
    merged to `main`/redeployed this session (production still runs the pre-D-047/048/049 build;
    confirmed healthy: `/health` → `db:up`, D-042/D-043 trust copy live).
- **Not yet actioned this session:** Resend/hCaptcha configuration (external, user's task, D-029
  already names it); a full `/panel` IA rebuild (separate nav pages for Vehículos/Rutas/Mi
  empresa/Configuración — D-047 scope note); route-intelligence dashboard (#45 explicitly defers
  it); closing/commenting the forge issues themselves (queued next — Keel never closes on its own
  code-reading alone, but D-047/048/049 plus the existing gate-green evidence are enough to close
  #24 (phase-1 note), #45 and #47 with an explicit "what remains" comment, and to comment
  what-shipped-where on the others without closing them yet pending the outstanding real-UI pass).

**D-051: `develop` (D-047…D-050) merged to `main` at `a34ec6a`, on the user's explicit request.**
Not yet deployed/migrated on production — see D-051 for what remains (redeploy + `prisma migrate
deploy`).

## Product hardening — PRIORITY 1 (2026-09-05, owner directive: registration gate + email verification)
- **D-052 done, on `develop` (`a21252b`):** `POST /api/deca` now requires an authenticated session
  before validation runs (401 `auth_required`) — a DeCA can no longer be generated anonymously at
  all, superseding D-042/D-043's lightweight anonymous-first design. The wizard still lets a visitor
  fill all 3 steps anonymously (`sessionStorage` draft unchanged); only the final step replaces
  "GENERAR DECA" with an inline auth-gate (`auth-gate` testid) linking to `/registro?next=%2Fcrear` /
  `/entrar?next=%2Fcrear` — same-tab navigation, so the draft survives with zero extra plumbing.
  Removed the superseded one-time lead-gate (`lib/deca/lead.ts` deleted).
- **D-053 done, on `develop` (`a21252b`):** email verification is now ALSO a hard gate on generation
  (403 `email_not_verified`, checked fresh from Postgres every call) — supersedes D-043's "soft
  gate" framing for generation specifically (login/browsing stay unaffected). Fixed the real bug the
  owner reported: "Ya he confirmado mi cuenta" used to navigate unconditionally with no server check
  — it now calls a new `GET /api/auth/verify-email/status` and only proceeds if truly verified,
  else shows "Tu correo todavía no está verificado…" and stays put (negative case has its own e2e
  test, UI + API both asserted blocked). Registration/resend no longer claim an email sent when the
  provider actually failed (both surface real `sent`/`delivery` state now; confirmed the bug is real
  — this session's own e2e runs log `verification_email_not_sent` on every registration, since local
  `.env`'s Resend key/domain are placeholders). Each new verification token invalidates the previous
  one (no unlimited active tokens). Found and fixed a related Next.js client-router-cache staleness
  bug along the way (`router.refresh()` now pairs with every post-auth `router.push(next)`).
  **Blocked on a real credential (not code):** actually receiving the email in a real inbox needs a
  real Resend API key + verified sending domain — production's Resend status is unconfirmed this
  session (ask the user to confirm/provide it; local dev already exercises resend/cooldown/expired/
  used/invalid-token via the `FVD_EXPOSE_RESET_TOKEN` test seam, just not real delivery).
- **D-054 done, on `develop` (`a21252b`):** investigated the user's report that every `/panel/*`
  screen works in production except `/panel/datos`. Root cause: `getCommercialConsent()` (D-048)
  queries a table from migration `20260905095427_route_intel_and_commercial_consent`, which D-051
  explicitly recorded as NOT YET applied to production while the calling code is live — an unguarded
  query crashing the whole page (the same class D-041 already fixed once for /blog+/guias). Fixed to
  fail safe (logs + returns "not granted") instead of crashing. **Still needs**: the user to confirm
  `prisma migrate deploy` has actually run on production for that migration — the code fix prevents
  a crash either way, but the toggle won't persist until the table exists.
- Gate green: 131 e2e (incl. 8 compliance) + 118 unit + typecheck + lint + format + keel-verify.
  ~20 e2e spec files updated for the new hard gates. Pushed to `origin/develop`.

## Product hardening — PRIORITY 2 (2026-09-05, same session, owner directive: #24 real master-data system)
- **D-055 done, on `develop`:** `SavedCompany`/`SavedVehicle` re-scoped from per-user to
  per-COMPANY (shared team resource, TEAM #27) — migration `20260905133820_workspace_saved_master_data`,
  data-preserving (backfills `company_id` from each row's creator, no data lost). `SavedAddress`
  replaced by `SavedLocation` (structured: name/address/postalCode/city/province/country + load|
  unload|both type, matching the DeCA's own location shape exactly) — existing addresses migrated in.
  `SavedCompany` gains `role` (shipper|carrier|both), contact fields, `lastUsedAt`. `SavedVehicle`
  gains `alias`, `lastUsedAt`. Required fields tightened to match the DeCA's own validation (a saved
  record missing postal code/city/province/address could "save" yet still force manual retyping —
  defeats the point).
  Wizard: role/type-filtered `<select>` dropdowns for cargador contractual, transportista efectivo,
  lugar de carga, lugar de descarga, vehículo (native, accessible, matches existing convention) —
  selecting one populates every field immediately; "usar el mismo" quick actions copy shipper⇄carrier;
  "last used" tracked server-side (`usedSaved` in the create payload, best-effort bump, never blocks
  generation). `/panel/datos` UI (`SavedDataManager`) rebuilt for the new fields; also fixed a found
  bug where its add-forms never reset after a successful save.
  Editing/deleting saved data still never mutates a generated DeCA (unchanged BUILD 10 guarantee,
  DeCAs hold their own data copy).
  New `tests/e2e/master-data.spec.ts`: the issue's exact acceptance bar — create records, build a
  DeCA from ONLY the dropdowns, generate, duplicate, change only dates, generate again; "materially
  faster" asserted as a data-entry-action count (2 vs 9), not wall-clock (Playwright fills instantly
  regardless of field count, so timing isn't a meaningful proxy for human typing effort).
  Gate green: 132 e2e (incl. 8 compliance) + 118 unit + typecheck + lint + format + keel-verify.
- **Not done / deferred:** a bespoke type-ahead combobox beyond native `<select>` filtering
  (accessibility risk vs. UX gain judged not worth it — D-055); `docs/reference/endpoints.md` doesn't
  exist at all yet (pre-existing Phase 6 gap, not from this slice — `docs/api/INDEX.md` kept current
  instead, including two previously-undocumented endpoints found along the way).
- **Not yet on `main`** — awaiting the user's explicit merge instruction (this session did not ask).

## Product hardening — PRIORITY 3 + 4 (2026-09-05, same session, owner directive: #49 premium PDF + #39 logo, together)
- **D-056 done, on `develop`:** `lib/pdf/deca-document.tsx` fully redesigned — navy header with
  brand mark + optional customer logo + a document-status pill, two-column party cards (cargador
  contractual / transportista efectivo), two-column route cards with accent-dot kind labels and
  inline dates, a labeled goods/vehicle grid, and a footer with the verification URL + QR in a fixed
  bottom-right quiet zone. Every value is still a real `<Text>` node — the 8-test compliance suite
  (R-3/4/5/6/7/8/11/13 + FIX-18) passed unmodified. Colours stay within the existing brand (navy +
  `BRAND.color`), no new font or dependency.
  `Company.logoDataUri` (new nullable column, migration `20260905141620_company_logo`) — optional
  PDF header logo, validated from the DECODED bytes (`lib/company/logo.ts`: hand-parses real PNG/
  JPEG headers for dimensions, rejects SVG/anything else, size-capped ≈512 KB), never a client-
  claimed MIME type. Read once at generation time in `createDeca`/`correctDeca` and baked into that
  render only — changing/removing the logo later cannot touch a stored PDF, by construction (no
  extra guard needed). New `/panel/empresa` (owner-only upload/preview/remove; a member sees it
  read-only) fills WORKSPACE #24's "Mi empresa" nav slot.
  **Verified with real generated PDFs, not just automated text-extraction** (registered a real
  account, generated several DeCAs via the live API, read the actual rendered pages): confirmed the
  premium layout, a customer logo rendering correctly in the header, long values (company names/
  addresses/goods) wrapping cleanly with no clipping or shrunk text, a correction showing "DOCUMENTO
  CORREGIDO", and — critically — that removing/changing the company logo left an earlier document's
  PDF byte-for-byte identical (same SHA-256) while a brand-new document reflected the change.
  New tests: `tests/e2e/company-logo.spec.ts` (4) + `tests/unit/company-logo.test.ts` (9).
  Gate green: 136 e2e (incl. 8 compliance) + 127 unit + typecheck + lint + format + keel-verify.
- **Closed by D-059:** admin (#33) now surfaces "has a logo" on the company detail page.
- **Still deferred:** the rest of the `/panel` IA (Configuración) beyond the new "Mi empresa"
  (D-047's existing open scope note).
- **Not yet on `main`** — awaiting the user's explicit merge instruction.

## Product hardening — PRIORITY 5 (2026-09-05, same session, owner directive: landing/brand polish, #46)
- **D-057 done, on `develop`:** found and fixed a real accuracy bug — D-052's hard registration
  gate (PRIORITY 1) made several landing/legal/SEO copy claims false ("sin registro"/"sin cuenta"
  for DeCA generation, inherited from before that change). Fixed the hero trust row, a step
  caption, a persona bullet, two SEO FAQ answers, and a registro-page recovery link. **Also fixed
  `app/privacidad/page.tsx` and `app/cookies/page.tsx`**, which still described the "Identidad
  ligera"/"Primer DeCA" lead-gate data-collection mechanism that D-052 deleted — a stale privacy/
  cookie notice describing a removed data practice, not just marketing copy.
  Added a visual product-features showcase (8 icon cards: Generar DeCA, PDF+QR, Histórico,
  Duplicar, Vehículos/Empresas/Lugares habituales, Custodia digital) reusing the workspace's own
  icon set (`components/panel/icons.tsx`, +2 new icons) in place of a plain text checklist —
  answers the issue's "show visually" list and doubles as PRIORITY 6 progress (shared icon
  language between landing and product). Confirmed live in a real browser: the hero already
  matched the owner's exact requested copy word-for-word from earlier work (D-043); the new
  section renders consistent with the panel's visual style.
  **Assessed, not rebuilt:** the landing's overall structure/hero/personas/FAQ were already built
  across #22/#35/#42/#46 in prior sessions and substantially satisfy the issue; a ground-up visual
  redesign was judged unwarranted — this slice's job was the accuracy sweep + the one genuinely
  missing visual element.
  Gate green: 136 e2e (incl. 8 compliance) + 127 unit + typecheck + lint + format + keel-verify.
- **Next up:** PRIORITY 6 (consistent product UI) — largely already advanced by this session's own
  work (D-047's panel icon system now also used on the landing); no further dedicated slice queued
  before this session ends.

## D-058: `develop` (D-052…D-057) merged to `main` at `89e7881`, on the user's explicit request ("push to main" before leaving)
Fast-forwarded from `e7f8745`. Full local gate green immediately before merging (typecheck, lint,
format, 127 unit, 8 compliance, full landing suite). **Not yet deployed/migrated on production** —
two new migrations (`20260905133820_workspace_saved_master_data`, `20260905141620_company_logo`)
need `prisma migrate deploy` on Hostinger after the next redeploy, same as D-051's still-pending
migration. See D-058 for the full pre-merge evidence and what remains.

### If a session resumes this project — read first
- **The user's `/panel/datos` production report (D-054) is fixed in code but NOT deployed.** Confirm
  with the user whether a redeploy + `prisma migrate deploy` has happened since this session; if not,
  that is the very first thing to raise.
- **Google OAuth credentials were set on Hostinger by the user this session** (their message, not yet
  independently verified) — once deployed, the existing D-046 code should activate with no further
  changes; verify live rather than assuming.
- **Real Resend delivery is still unconfirmed** — the user said they will configure it (see D-053).
  Do not close out email-verification-as-tested until a real inbox receipt is confirmed.
- **D-059 done, on `develop` (`main` at merge `89e7881` predates it — see below):** closed D-056's
  deferred admin "has a logo" item, and did a real-browser PRIORITY 6 consistency check across
  `/panel`, `/panel/empresa`, `/crear` — the whole app already shares one CSS-custom-property design
  system from before this session, so 1–5's new components were consistent by construction. No
  further dedicated PRIORITY 6 slice queued.
- **All 6 owner priorities substantively addressed this session** (D-052…D-059). If resumed: verify
  nothing new has come in from the owner before assuming the list is closed — Keel decisions are
  never re-opened on the assistant's own initiative, but a fresh directive supersedes this note.

## D-060: production migration gap fixed live; D-061: lightweight lead gate restored (owner reversal)
- **D-060 — production incident, RESOLVED.** All 3 pending migrations
  (`20260905095427_route_intel_and_commercial_consent`, `20260905133820_workspace_saved_master_data`,
  `20260905141620_company_logo`) are now applied to production — the user ran their DDL directly via
  the Supabase SQL Editor (session-mode pooler was exhausted, blocking `prisma migrate deploy`), this
  session reconciled `_prisma_migrations`. Live "Entrar" and "Crear DeCA" confirmed working again by
  the user. The stale warnings above about undeployed migrations are now HISTORICAL — do not re-raise
  them without checking current production state first.
- **D-061 — owner directive, reverses part of D-052/PRIORITY 1:** a DeCA can once again be generated
  by an anonymous visitor with just a name + email (lightweight lead gate); only a SECOND anonymous
  DeCA from the same browser requires full registration. Authenticated users still need a verified
  email (D-053, unchanged). Implemented in `app/api/deca/route.ts`, `app/crear/page.tsx`,
  `components/deca/wizard.tsx`, `lib/deca/lead.ts` (recreated). Full test suite updated to match
  (see D-061 in `decisions.md` for the file list). Gate green: 137 e2e + 127 unit + typecheck + lint +
  format. Not yet merged to `main` as of this note — see next action.
- **Next action:** merge `develop` → `main` and push once the owner confirms, per standing "push to
  main" authorization pattern this session — then no further code deploy step is needed for D-060
  (deployment-state only), but D-061 IS a real code change and DOES need a `main` merge + redeploy to
  reach production.

## D-062: I18N #50 slice 1 — core i18n architecture + ES/EN translation of the critical path
- Owner filed GitHub issue #50 (full product internationalization) then asked to start on it. Scoped
  to a first slice (owner's explicit choice when asked): build the real i18n engine + language
  switcher + `User.preferredLocale` persistence + locale-aware verification emails, and translate
  exactly the critical QA flow #50 named — landing header/hero, signup/login, email verification,
  panel shell, the full DeCA creator (all fields/gates/result), and history. New migration
  `20260905190509_user_preferred_locale`. Deliberately deferred (documented on the issue, not
  silently dropped): saved-data management screens, document cockpit, admin, blog/guías, legal
  pages, the PDF itself (needs the owner's sign-off on legal terminology first), locale-prefixed
  URLs, and zod validation-error messages.
  Architecture: cookie-based (`fvd_locale`), not URL-prefixed — avoids duplicate-content SEO risk
  and the large mechanical risk of wrapping every route in a `[locale]` segment on a live product.
  Caught and fixed a real bug mid-slice: the locale resolver's `Accept-Language` fallback defaulted
  to English under headless Chromium (and would for a real Spanish user with an English OS), broke
  29 e2e tests; removed — Spanish is now the unconditional default absent an explicit cookie. Gate:
  137 e2e + 127 unit + typecheck + lint + format, plus a real-browser walk (ES→EN→ES, no mixed
  screens on the translated path). See `decisions.md` D-062 for the full file list. Issue #50 stays
  OPEN with this slice's scope commented — most of the epic remains for future sessions.

## D-063: SECURITY #53 P0 block 1 — auth/session hardening
Owner filed #51-#54 (desktop, legal, security incl. mandatory admin 2FA, multilingual UI) with an
explicit execution order and "keep moving, don't ask" instruction. Working through it in priority
order, P0 security first. This block: login/register now rate-limited (previously ZERO — real gap),
mailer logs the real provider error on failure (found the placeholder `RESEND_API_KEY` is why local
delivery doesn't work), password reset invalidates the prior token, sessions are now revocable
(`User.sessionVersion`, migration `20260905204705_user_session_version`) — a stolen cookie or a
session opened before a password reset now actually dies, plus a "log out everywhere" button —
and the password policy is 12+ chars/complexity/no-common/no-email-or-company-name, enforced
identically client + server via one isomorphic module. Gate: 141 e2e + 133 unit, all green
(content-cms.spec.ts reconfirmed as the pre-existing --workers=3-only flake). See `decisions.md`
D-063. **Continuing immediately** to mandatory admin TOTP 2FA (next P0 item) — not stopping to ask.

Last updated: 2026-09-04 — Product V3 (#29–#38) complete, merged to `main`; D-040 nav discoverability;
D-041 fixed the /blog + /guias production crash (unguarded Prisma calls → the generic error
boundary) + the same unclassified-500 class of bug in DeCA generation, rebuilt /blog + /guias as
real pages, rebuilt the footer (4 columns), added 4 legal pages, audited nav (no dead links). Gate:
105 unit + 129 e2e + 8 compliance. `develop` == `main`. No version tag.
D-042 (goods-only structured loading/unloading + separate load/unload dates, PRODUCT #41) done on
`develop`, gate green (106 unit + 129 e2e). D-043 (Praetoria trust identity, versioned terms,
email verification, lightweight lead gate — TRUST #42 + GROWTH #46) done on `develop`, gate green
(106 unit + 134 e2e). Production verification blocked on DNS cutover to decaprofesional.es (user's
infra task, not code).
DNS resolved 2026-09-04 (later same day). `develop` (D-042+D-043) merged to `main`, CI red on
format:check, fixed and re-forwarded (`04ad0e3`) — `main` CI fully green. Root-caused the
production `db: "down"` health check to a Supabase session-pooler connection-limit exhaustion
(no `directUrl` split between app runtime and migrations) — fixed in `prisma/schema.prisma` +
env docs; needs the user to set `DATABASE_URL`(6543,pgbouncer)+`DIRECT_URL`(5432) on Hostinger and
redeploy. Added an unverified-email reminder banner to `/panel` (`a4a28bb`, on `develop` only).

## D-064: SECURITY #53 P0 block 2 — mandatory admin TOTP 2FA
Continuing the owner's #51-#54 execution order right after D-063, no pause. Admin `/admin` access
(pages AND every `/api/admin/*` route) now requires real TOTP 2FA — RFC 6238, no new dependency,
QR + manual-secret enrollment, one-time recovery codes, step-up re-auth for destructive actions.
Found and fixed a real gap while wiring it: every existing admin API route only checked the
`internal` role, never 2FA — a compromised password alone could already reach them. Migration
`20260905211042_admin_2fa_and_audit_log` (also adds the append-only `SecurityAuditLog` table, not
yet wired to real events beyond the 2FA routes themselves — follow-up). Moved the existing admin
pages into an `(protected)` route group (URLs unchanged) so the new 2FA pages don't inherit the
gate they're supposed to satisfy. Gate: 148 e2e + 139 unit, all green — plus a real-browser
enrollment walkthrough (QR, wrong-code rejection, recovery codes, landing on `/admin`). See
`decisions.md` D-064. **Continuing immediately** to step-up wiring for real destructive actions,
audit-log event coverage, backup/recovery review, and a security-headers pass.

## D-065: SECURITY #53 P0 block 3 — audit log wired to real events
Audited what destructive admin actions actually exist before wiring anything (none of
company/user-delete, role-change, security/legal-config, bulk-export exist yet — not a gap, a scope
finding; `requireStepUp()` has no real caller beyond 2FA-code regeneration for now). Wired
`recordAudit()` into what DOES exist: admin login success/failure (admin accounts only), password
reset, and the content-CMS publish/unpublish/archive actions (already a soft archive, never a hard
delete). Gate: 152 e2e + 139 unit, all green. One new documented parallel-only flake (recovery-code
regeneration racing under `--workers=3`, shared seeded admin — passes in isolation, CI's `retries:1`
absorbs it). See `decisions.md` D-065. **Continuing** to backup/recovery review and a
security-headers pass, then #51/#52/#54.

## D-066: SECURITY #53 P0 block 4 — re-authentication required to change primary email
Found and fixed: the email-change endpoint changed the account's email with only an active
session, no password check. Now requires `currentPassword` (constant-time verified), and an
internal-role caller additionally needs a fresh TOTP check (step-up, D-064) — the first real
caller of `requireStepUp()` outside the 2FA routes themselves. Zero prior test coverage on this
flow; added it. Also fixed a genuine flake in D-065's own new admin-login-audit test (rescoped to
the actor's own id instead of an unscoped "2 most recent rows", which another concurrent test could
occupy under `--workers=3`). Gate: 154 e2e (2 pre-existing documented parallel-only flakes,
unrelated) + 139 unit, all green. Session/authorization hardening (owner's P0 item 7) is now
substantively complete — see `decisions.md` D-066 for exactly what remains not applicable (no
idle-timeout distinct from the TOTP-freshness window; no admin-2FA-reset feature exists to
invalidate sessions after). Owner sent #55 (premium product system) + #56 (multi-level control
center: super-admin/company-admin/operator/read-only roles, invitations, route intelligence) —
explicitly queued by the owner for AFTER the current security/legal/auth work; noted, continuing
the P0 queue first per their own stated order.

## D-067: SECURITY #53 P0 blocks 5+6 — backup/recovery, security headers, document-loss protection
All three turned out to be audit findings, not code changes. Backup/recovery: wrote an honest
runbook in `docs/07-release.md` §6 stating plainly what can't be verified from code (Supabase's
actual plan tier / PITR / bucket-versioning settings — dashboard-only, never guessed at), a genuine
independent recovery path that already exists (DeCA PDFs are re-renderable from the `dataJson`
stored alongside them, not just the rendered bytes), a restore procedure, and an explicitly-empty
"restoration-test log" — no claim of a tested backup exists because none has been tested. Security
headers: already solid from an earlier session (CSP/HSTS/Permissions-Policy on pages via
`middleware.ts`, X-Content-Type-Options/Referrer-Policy/X-Frame-Options on EVERY route including
API/PDF via `next.config.ts`, no permissive CORS anywhere) — reviewed against the fuller P0 list,
no gaps found, no changes made. Document-loss protection: grepped the whole API surface for any
delete touching `deca`/`deca_version`/`company`/`user` — none exist; combined with `deca_version`
already being append-only, the owner's requirements are satisfied by the absence of any such
feature, not a gap to close. See `decisions.md` D-067. **Continuing** to #51 (desktop visual
overhaul), #52 (legal identity/liability), #54 (Spanish-first i18n expansion) per the owner's
execution order — #55/#56 remain queued after.

## D-068: LEGAL #52 — real legal identity, custody/liability/jurisdiction framework, GDPR controller/processor split
Real registered address + dedicated support email replace the earlier placeholders in
`lib/legal-entity.ts`/`lib/brand.ts`; fixed two stale-prose bugs found in the sweep (a placeholder-
dependent address sentence, and a false "account always required for first DeCA" claim contradicting
D-061). `app/terminos/page.tsx` rewritten with the substantive content the owner's #52 spec required:
tri-party responsibility split (PRAETORIA/customer/transport parties), explicit custody ≠
certification-of-truth framing, a lawful B2B limitation-of-liability clause with the owner's exact
enumerated non-verified-items list (preserving liability for fraud/gross negligence/non-waivable
duties), a free-launch-phase caveat (promotional/temporary, no perpetual-free promise), and a
Valencia jurisdiction clause qualified against mandatory/consumer rules. `app/privacidad/page.tsx`
gained a GDPR controller (account/auth/security/billing) vs processor (Art. 28, data inside generated
DeCA documents) section. Checked and confirmed adequate without changes: `TermsAcceptance` already
versioned/timestamped/append-only; the landing page's free-launch line already secondary, not
dominant; `app/cookies/page.tsx` accurate as-is. Found and fixed one real regression during the gate:
new GDPR prose made a `trust-registration-v2.spec.ts` `getByText` assertion ambiguous
(case-insensitive substring match hit both a heading and new bold text) — fixed by scoping it to
`getByRole("heading", ...)`. Full gate green: typecheck/lint/prettier clean, 139/139 unit, 151 e2e
passed + the 2 already-documented parallel-only flakes (unrelated to this change) + the one
regression above fixed and re-verified. See `decisions.md` D-068. Pushed to `develop` only.
**Continuing** to #51 (desktop visual overhaul) next, per the owner's execution order.

## D-069: DESIGN #51 slice 1 — fake-QR artwork removed, result screen widened for desktop
Fetched issue #51's full text via `gh issue view 51` for its exact acceptance criteria.
`components/site/deca-preview.tsx` (landing hero/product-proof illustration, not the real result
screen) had its 4×4 fake-QR-style grid replaced with the existing `DocumentIcon` in a tinted badge —
satisfies the explicit "remove the fake QR square" acceptance item. `app/crear/[id]/page.tsx` (the
real `DeCA generado` screen) widened from a centered 680px single column to a 1120px two-column
desktop layout (data + history left, actions + real QR sidebar right, mobile unchanged) with a new
reference/version/status chip row. Gate: typecheck/lint/prettier clean, the 29 e2e tests covering this
screen + landing (incl. 360/768/1280px overflow checks) all passed, plus a real Chrome walkthrough of
the full wizard → result screen at 1440px confirming the visual fix. Landing's broader visual richness
(personas/steps/showcase sections), registration, wizard-step chrome and `/panel` are the rest of #51
and are NOT done yet — deliberately sequenced behind this concrete, testable slice. See `decisions.md`
D-069. **Continuing** with the rest of #51 next.

## D-070: DESIGN #51 slice 2 — `/panel` widened to a two-column desktop layout
`app/panel/page.tsx` widened from a centered 900px single column to a 1200px two-column desktop
split (quick actions + recent documents left, saved-data summary cards as a sidebar right); mobile
unchanged. `AppNav`'s horizontal tab bar (shared by every `/panel/*` route) deliberately left as-is —
a sidebar-nav rework is a separate, larger, higher-risk slice, not silently dropped. Hit and diagnosed
a false-failure flake: a stray `npm run dev` from the prior manual browser check was still on port
3000, causing 8 unrelated e2e failures until killed via `netstat`/`taskkill`; re-ran clean, 16/16
passed incl. the `/panel` a11y check. Verified visually by registering a real throwaway account and
viewing `/panel` at 1440px. See `decisions.md` D-070. **Continuing** with the rest of #51.

## D-071: I18N #54 slice 1 — full English coverage of the landing page
Moved from #51 to #54 after #51's objective/checkable acceptance items were met — its remaining scope
is open-ended aesthetic polish rather than bounded fixes. Closed D-062's named follow-up: translated
every remaining landing section (3 steps, product benefits, all 4 personas, the 8-item daily-use grid,
7 regulation points, all 10 FAQ entries, every heading/CTA) into `lib/i18n/dictionaries/en.ts`,
key-parity enforced by `satisfies Messages` against `es.ts`. Deliberately left untranslated (and
explained inline): PRAETORIA's own legal-identity sentence (`OPERATOR_TRUST.body`) — translating a
legal entity's own wording is legal-review territory, not a landing-copy task — plus the footer and
page metadata (no `generateMetadata` wiring yet). Fixed two real locale bugs found while wiring this:
two CTA buttons were hardcoded to the Spanish `HERO.cta` regardless of locale. Gate: typecheck (the
`satisfies Messages` parity check), lint, prettier, `vitest run` 139/139, and the Spanish-path e2e
specs (`landing.spec.ts`, `auth-entrypoints.spec.ts`, `creator-ux31.spec.ts`) all green and unchanged.
No e2e coverage exists yet for the English locale at all (noted as a gap, not fixed here) — verified
instead by a full manual Chrome walkthrough of the entire English landing page section by section.
See `decisions.md` D-071. **Next:** further #54 language expansion (CA/EU/GL, then FR/DE/IT) is a
much larger and higher-risk effort, especially translating the legal pages accurately — flagged to
the owner rather than started speculatively.

## D-072: I18N #54 slice 2 — Catalan added; landing scales to any locale; legal pages stay Spanish-only (owner decision)
Owner decided (asked via AskUserQuestion): translate product UI into remaining #54 languages
(Catalan, Basque, Galician, French, German, Italian); legal pages (`/terminos`, `/privacidad`,
`/aviso-legal`) stay Spanish in every locale until a professional legal review exists — standing rule
for the rest of #54. Refactored `app/page.tsx` to read the landing unconditionally from
`getDictionary(locale)` instead of D-071's `isEn ? x : y` branching, since `es`'s dictionary content
now matches `lib/content/landing.ts` exactly — adding a locale is now a dictionaries-only change, no
page edits. Discovered `crear`/`panel`/`historico`/`result`/`auth`/`emails` were already fully
bilingual from an earlier session (not just landing) — so a new locale dictionary makes the entire
product UI available in that language immediately. Added `lib/i18n/dictionaries/ca.ts` (Catalan, full
`satisfies Messages` parity), wired into both `DICTS` maps (`lib/i18n/server.ts` AND
`lib/i18n/client.tsx` — two separate maps that must stay in sync) plus `LOCALES`. Found and fixed a
real regression: a 3rd language-switcher button broke the 360px no-overflow test — root cause was
this project's Tailwind `--breakpoint-sm` being redefined to 360px, making `sm:` fire exactly at the
test's viewport rather than acting as a "wider screens" escape hatch (documented as a lesson for next
time). Fixed by dropping the `sm:` variants and shrinking header padding unconditionally. Gate:
typecheck/lint/prettier clean, 139/139 unit, 153/154 e2e (1 pre-existing documented flake). Verified
live: toggled to Catalan, confirmed the landing AND the full `/crear` wizard render correctly with
zero page-level code for the new locale. See `decisions.md` D-072. **Not done, explicitly deferred by
owner's own scope decision:** Basque/Galician/French/German/Italian dictionaries, and all legal-page
translation. Basque flagged as needing extra translation-quality scrutiny (language isolate, lower
confidence than the Romance languages here).

## D-073: I18N #54 slice 3 — Galician added; fixed a keyboard-reachability test that breaks with every new locale
Added `lib/i18n/dictionaries/gl.ts` following the exact Catalan pattern (D-072) — no `app/page.tsx`
changes needed at all, confirming the dictionary-only scaling claim. Found and fixed a structural
regression: `tests/e2e/a11y.spec.ts`'s keyboard-reachability test had a hardcoded 12-Tab-press budget
to reach the header CTA, and each new language switcher button eats one more tab stop — Catalan had
already pushed it to the edge, Galician broke it outright. Raised the budget once to 30 (covers the
full 8-locale target: es/ca/eu/gl/en/fr/de/it) instead of re-tuning it per locale. Gate: typecheck
(parity check), lint, prettier clean, 139/139 unit, 154/154 e2e with zero flakes this run. Verified
live: Galician renders correctly, 4-button switcher fits with no overflow at 1440px. See
`decisions.md` D-073. **Continuing** with Basque next (flagged for extra scrutiny — language isolate,
lower translation confidence than the Romance languages done so far), then French, German, Italian.

## D-074: I18N #54 slice 4 — Basque added (flagged, lower confidence); language switcher fixed permanently
Added `lib/i18n/dictionaries/eu.ts` (Basque), slotted into `LOCALES` between Catalan and Galician per
the owner's specified order. **Explicit caveat, not glossed over:** Basque is a language isolate with
grammar nothing like the Romance languages already done (ergative case, agglutinative morphology) —
this session's translation confidence here is meaningfully lower, and a native-speaker review is
recommended before treating it as equally trustworthy. Also fixed the language-switcher overflow
problem PERMANENTLY instead of patching it a third time: D-072 and D-073 each hit a 360px overflow
regression from one more switcher button; the switcher now has a fixed max-width with internal
horizontal scroll (`overflow-x-auto`), decoupling its width from how many locales exist — French,
German, and Italian can be added later with zero header changes. Gate: typecheck (parity), lint,
prettier clean, 139/139 unit, 153/154 e2e (1 pre-existing flake, unrelated). Verified live: Basque
renders correctly, switcher's internal scroll works at 1440px. See `decisions.md` D-074. **Continuing**
with French, German, Italian next — all well-resourced languages with high translation confidence,
unlike Basque.

## D-075: I18N #54 slice 5 — French added
Added `lib/i18n/dictionaries/fr.ts` following the same pattern as Catalan/Galician. Zero header/page
changes needed for the 6th switcher button — confirms D-074's fixed-width, internally-scrolling
switcher absorbs new locales with no further changes. Gate: typecheck (parity), lint, prettier clean,
139/139 unit, 152/154 e2e (2 pre-existing flakes, unrelated, no new regression). Verified live: French
renders correctly across nav/hero/trust-row/CTA. See `decisions.md` D-075. **Continuing** with German,
then Italian.

## D-076: I18N #54 slice 6 — German added
Added `lib/i18n/dictionaries/de.ts` following the same pattern. Zero header/page changes needed for
the 7th switcher button. Gate: typecheck (parity), lint, prettier clean, 139/139 unit, 153/154 e2e
(1 pre-existing flake, unrelated). Verified live: German renders correctly. See `decisions.md` D-076.
**Continuing** with Italian — the last of the six UI-only languages from the owner's D-072 scope
decision.

## D-077: I18N #54 slice 7 (final) — Italian added, completing the 8-locale set; fixed a WCAG target-size regression
Added `lib/i18n/dictionaries/it.ts`, completing the full es/ca/eu/gl/en/fr/de/it locale set the owner
specified. **Found and fixed a real accessibility regression, not a flake:** the 8th switcher button
pushed individual button touch targets under WCAG 2.2's 24×24px minimum (axe `target-size`/
`target-offset`), caught by 4 a11y test failures across `/`, `/crear`, an SEO page, and `/panel/*`.
Fixed by widening buttons to `px-2` + `min-w-8`, which the D-074 fixed-width/internal-scroll switcher
absorbs without reintroducing the earlier page-overflow problem — width cap solves overflow, size
floor solves touch-target a11y, both now satisfied together. Gate: typecheck (8-locale parity),
lint, prettier clean, 139/139 unit, 153/154 e2e (1 pre-existing flake). Verified live: Italian renders
correctly, 8-button switcher touch targets properly sized. See `decisions.md` D-077.

**I18N #54 status:** product UI (landing, wizard, panel, auth, emails) now available in all 8 target
locales. Legal pages stay Spanish-only everywhere (owner decision, D-072). Basque carries an explicit
lower-confidence caveat pending native-speaker review. No automated i18n smoke test exists yet across
locales (only manual verification per slice) — flagged as a reasonable follow-up, not done this
session to keep slices bounded.

## D-078: PRODUCT #56 slice 1 — `read_only` (Auditor) company role, enforced server-side
Owner said "continue, you set the priority." Reviewed #55 (premium visual/component system — largely
superseded by the #51 work already done this session) vs #56 (multi-level control center: roles,
invitations, super-admin, route intelligence, search) and started #56 as the more foundational,
bounded next step. Audited the existing role model first: platform-level "Super Admin" is already
satisfied by `Role.internal` + mandatory 2FA (#53); company-level `owner`/`member` already map onto
#56's Company Admin/Operator. The one real gap was a Read-only/Auditor role — built it as this slice.

`CompanyRole` enum extended with `read_only` (additive migration, applied to local dev DB). `lib/team.ts`
gained a `canWrite()` helper and widened types. **Found and fixed a real bug** while extending the
"keep ≥1 owner" invariant in `changeRole()` — it only guarded owner→member demotion, not owner→
read_only, which would have silently zeroed out a company's admins. Server-side 403 checks added to
every mutating route a read_only member could reach (DeCA create/correct, saved-data create/delete,
templates create/delete) — the real security boundary. UI: role now selectable at invite time, "Solo
lectura" label added, `/crear` shows a dedicated read-only gate screen (translated into all 8 locales),
`/panel` hides create/duplicate actions for read_only users. Explicitly deferred, not dropped:
`/panel/datos`'s SavedDataManager still shows add/delete UI to read_only users (server rejects it
correctly, just a rougher UX) — noted as a follow-up. The external-carrier-vs-employee invite
distinction from #56 was NOT tackled — no external-invite mechanism exists yet, so there's no current
risk to fix, just a bigger future feature to build carefully.

Gate: typecheck, lint, prettier clean, 139/139 unit. New e2e test in `team.spec.ts` covers the full
flow: invite-time role selection, member-list label, history/detail view still works, `/crear` gate
renders, `/panel` hides create button, and a direct API call returns 403 regardless of any UI gate.
Full suite 154/154 passed. See `decisions.md` D-078.

## D-079: PRODUCT #56 slice 2 — company-scoped global search + Cmd/Ctrl+K command palette
Continued #56's "power-user UX" list. Reused `listHistory`'s existing free-text filter instead of a
second search path — new `lib/data/search.ts` wraps it, capped to top 8 hits. New `GET /api/search`
(company-scoped, available to `read_only` too — viewing isn't a write) backs a new
`components/panel/command-palette.tsx`: Cmd/Ctrl+K modal, debounced search, arrow-key nav, Enter to
navigate. Mounted in `SiteHeader` (gated on `authed && companyName`) rather than a new panel layout
file. Re-verified against the exact 360px-overflow and target-size tests that earlier i18n slices had
already found regressions in — both held with the new icon-only trigger. Found and fixed a real
test-hydration race (not a product bug): `Control+k` pressed before the client component's listener
attached, only visible under parallel workers — fixed with the same `networkidle` wait pattern already
used elsewhere in the suite. Also corrected three stale "owner only" doc claims in `docs/api/INDEX.md`
that predated this session (those routes never actually checked ownership, only company membership).
Gate: typecheck, lint, prettier clean, 139/139 unit, 154/154 e2e (2 pre-existing unrelated flakes). See
`decisions.md` D-079.

## D-080: PRODUCT #56 slice 3 — company-level route intelligence on the panel home
Found the entire data layer already existed from DATA #45 (commercial route-matching): `DecaRouteIntel`
rows have been written on every DeCA creation all along, just never read back for the company's own
use. New `lib/data/route-intel.ts`'s `getTopRoutes()` reads that data (fetch-then-group in JS, same
pattern as `lib/data/history.ts`), tracking each route's count and most-recent DeCA id. `/panel`
sidebar gained a "Rutas frecuentes" section with a real "quick create from route" link
(`/crear?from=<lastDecaId>`, reusing the existing duplicate-prefill path — no new prefill logic).
Respects the D-078 `read_only` gate. Deliberately shipped only this one item from #56's six-item route-
intelligence list (frequent routes + quick-create) rather than a shallow pass across all of them.
Gate: typecheck, lint, prettier clean, 139/139 unit, **157/157 e2e passed with zero flakes this run**.
New e2e test creates two DeCAs on the same route and verifies the count and quick-create prefill.
See `decisions.md` D-080. **Continuing** with the next #56 piece next.

## D-081: DESIGN #55 (landing-only per owner's explicit boundary vs #51/#56) — brand renamed "DeCA Profesional"; language switcher redesigned as a globe dropdown
Owner sent a large #55 directive with an explicit scope boundary: #51 = broad component/visual system,
#55 = landing page only, #56 = control center (already in progress). Renamed the brand from "DeCA
Fácil" to "DeCA Profesional" (owner's explicit current direction, reversing D-039's specific string
choice, not its no-attribution policy) — `lib/brand.ts` plus 3 hardcoded references now derive from
`BRAND.name`. This broke the header's 360px budget again (longer wordmark) — the same regression class
D-072/D-073/D-074 had already hit three times from the switcher growing. Fixed it properly this time by
implementing #55 §4 (language selector) instead of patching padding again: the switcher is now a
`<details>` globe-icon dropdown (reusing `AccountMenu`'s proven pattern) listing all 8 locales by
native name, with a footprint that can't regress regardless of locale count or brand-name length.
Gate: typecheck, lint, prettier clean, 139/139 unit, 155/157 e2e (2 flakes re-ran green in isolation,
confirmed unrelated). **This is the first of several #55 slices** — hero visual, free-value sections,
persona/trust/FAQ/footer polish, and full responsive re-verification remain. See `decisions.md` D-081.
**Continuing** with the #55 hero-visual slice next.

## D-082: DESIGN #55 slice 2 — hero visual richness (real QR, layered cards) + "Sin tarjeta" + footer address
Rebuilt `components/site/deca-preview.tsx` as two overlapping cards (creator behind, generated-result
in front) with a genuinely real server-generated QR (same `lib/pdf/qr.ts` the actual PDF uses, pointing
at the site's base URL) — never a decorative pattern. Added `hero.noCardNote` ("Sin tarjeta · Sin
límite de documentos durante la fase de lanzamiento.") to all 8 dictionaries, placed under the CTA.
Added the full registered address to the footer. Found and fixed two real regressions before shipping:
a WCAG color-contrast failure on the new status badge, and a CSS Grid intrinsic-min-width overflow at
768px (classic `min-width: auto` grid gotcha) — fixed with one `min-w-0`, verified with zero overflow
across all ten widths the owner's directive listed (375–1920px). Gate: typecheck, lint, prettier clean,
139/139 unit, 155/157 e2e (2 pre-existing flakes, unrelated). See `decisions.md` D-082. **Remaining
#55 work** (free-value section, visual storytelling sections, persona/trust/regulation/FAQ/final-CTA
polish) continues in subsequent slices — not attempted in one block.

## D-083: DESIGN #55 slice 3 — "Todo incluido durante el lanzamiento" free-value section
New section right after the "3 steps" section: a checklist grid of 12 features, 10 marked available
(including "Rutas frecuentes", the #56 feature shipped earlier this session) with a green check, 2
explicitly marked "Próximamente" (Modo inspección, Acceso API/ERP) with a dashed/empty-circle
treatment — never presented as if live, per the owner's hard constraint against advertising
unshipped features. `available` is a fact in `lib/content/landing.ts`, never localized; labels come
from a new `freeValueItems` dictionary key across all 8 locales. Hit and fixed the same class of
flex-overflow regression as D-082 (a `flex-1` label needing `min-w-0` to shrink under a badge) —
re-verified across the same 10 widths (375–1920px), zero overflow. Gate: typecheck, lint, prettier
clean, 139/139 unit, 156/157 e2e (1 pre-existing flake). See `decisions.md` D-083. **Continuing**
with the remaining #55 sections (visual storytelling, persona/trust/regulation/FAQ/final-CTA polish)
next.

## D-084: DESIGN #55 slice 4 — "por qué usarlo cada día" reframed; final CTA rebuilt
Two copy-focused sections using the owner's own suggested wording near-verbatim, across all 8
dictionaries. §7: heading → "Cada DeCA te cuesta menos tiempo que el anterior.", subhead → "Guarda
una vez. Reutiliza siempre." (value copy only — the section's existing feature-tile content
unchanged). §11: final CTA rebuilt with "Empieza ahora. Sin tarjeta." + a new supporting subhead + a
new microcopy line under the button ("Gratis durante la fase de lanzamiento · Sin tarjeta").
Found and fixed two real regressions: an e2e test hardcoding the old heading text (legitimate update,
not a weakened assertion), and a third contrast-on-translucent-background failure this session — fixed
by matching the already-passing `/90` opacity instead of the new `/80`. Gate: typecheck, lint, prettier
clean, 139/139 unit, 155/157 e2e (2 pre-existing flakes). See `decisions.md` D-084. **Remaining #55**:
visual storytelling (§5), persona cards (§6), trust/regulation/FAQ polish (§8-§10), micro-interactions
and density pass (§14-§15).

## D-085: LEGAL #52/#54 — legal pages stay Spanish-only; translated disclaimer added
Owner's own message this slice ("continue... if you dont know something just ask the legal paages are
very important") explicitly invited a clarifying question on legal-page translation (deliberately
deferred at D-072 over real liability/GDPR risk) and flagged it as important — asked via
`AskUserQuestion` rather than assumed. Owner's explicit choice: **"Keep Spanish-only, add a
disclaimer"** — legal content in `/aviso-legal`, `/privacidad`, `/terminos`, `/cookies` stays
Spanish-only in every locale (zero legal-accuracy risk, nothing legal machine-translated); a new
short, safe-to-translate `legalNotice.notTranslated` key (all 8 dictionaries) explains to non-Spanish
visitors that the binding version is in Spanish. `components/site/legal-page.tsx` (the one shared
wrapper used by all 4 pages) converted to an async Server Component, notice gated on `locale !== "es"`
— no per-page caller changes needed. Gate: typecheck, lint, prettier clean, 139/139 unit, **157/157
e2e, no flakes this run**. Manually verified in a real dev-server session across all 8 locales × all 4
legal pages: notice absent under `es`, present with the correct translated text under every other
locale. See `decisions.md` D-085. D-072's Spanish-only scope is reaffirmed, not reversed.
**Continuing** with the remaining #55 items (§5, §6, §8-§10, §14-§15) next.

## D-086: DESIGN #55 slice 5 — normative card (§9), trust card (§8), persona icons (§6), micro-interactions (§14)
Bundled four polish items on existing sections: the 7-point normative checklist now sits in one
bordered card with the same `CheckIcon` visual language as the free-value section; the PRAETORIA
trust blurb now sits in a small quiet card with a muted shield icon (deliberately still secondary —
no new colour/size, matching the owner's "not law-firm-like" constraint); each persona card now leads
with a job-matched icon (`PERSONA_ICONS`) plus a restrained hover-elevation shadow, reused on the
daily-use cards and free-value items for one consistent hover language; the FAQ accordion gained a
hover highlight and a short fade-in on the opened answer (new `fade-in-up` keyframe, already covered
by the existing global reduced-motion override). Gate: typecheck, lint, prettier clean, 139/139 unit,
18/18 targeted landing+a11y e2e. Full suite 154/157 (3 pre-existing parallel-only flakes, all
reconfirmed passing with `--workers=1`, none touching this slice's files). Manually verified in a
real browser at 1440px. See `decisions.md` D-086. **Remaining #55**: §5 (visual storytelling), §10
(FAQ grouping — needs new content structure), §15 (density/hierarchy pass).

## D-087: DESIGN #55 slice 6 — visual storytelling (§5), scoped to 2 highest-impact visuals
Asked the owner how to scope §5 (5 possible visuals listed in the directive); owner picked "highest-
impact 1-2" over building all five thin or skipping it. Added a decorative connecting line across the
3-steps section (turns it into an actual flow diagram, desktop only) and a new
`components/site/workspace-preview.tsx` — a non-interactive mock of the real `/panel/historico` table
(search bar, filter chip, 4 rows with route/plate/date/status), same "real layout, generic values"
rule as the hero's `DecaPreview`. Placed in the "Daily use" section, restructured to a 2-column
layout (icons left, workspace preview right) pairing the §7 speed-copy with concrete visual proof.
Gate: typecheck, lint, prettier clean, 139/139 unit, 18/18 targeted landing+a11y e2e, a custom
10-width overflow script (375–1920px) at zero overflow, full suite 155/157 (2 pre-existing flakes,
reconfirmed unrelated). Manually verified in a real browser at 1440px. See `decisions.md` D-087.
**Remaining #55**: §10 (FAQ grouping), §15 (density/hierarchy pass) — #55 is substantially complete
otherwise.

## D-088: `develop` (D-063…D-087) merged to `main` at `d7792d6`, on the user's explicit request ("push all... to main")
Pre-merge gate re-verified on `develop` itself (not just trusting each slice's own prior gate):
typecheck, `npm run lint` (project's real lint script — 2 pre-existing unrelated `<img>` warnings
only), `prettier --check .` repo-wide, 139/139 unit, all clean. `--no-ff` merge, no conflicts, 138
files changed. Brings `main` current with SECURITY #53 (2FA, session revocation, rate limiting,
password policy, audit log), LEGAL #52/#54 (Praetoria identity, custody/liability/GDPR, Spanish-only
legal pages + disclaimer), I18N #54 (8 locales), PRODUCT #56 slices 1-3 (read_only role, search
palette, route intel), DESIGN #51/#55 (landing overhaul). Pushed to `origin/main`. **3 new
migrations on `main` NOT yet applied to production**
(`20260905204705_user_session_version`, `20260905211042_admin_2fa_and_audit_log`,
`20260906094103_company_role_read_only`) — a redeploy + `prisma migrate deploy` is needed before any
of this session's security/role work is live. See `decisions.md` D-088.
**Continuing** with the remaining #55 items (§10, §15) and any other open issues next, per the
user's "keep going on closing and finishing all the remaining issues" instruction.

## D-089: DESIGN #55 slice 7 — FAQ grouping (§10 done, closes #55 bar §15), hero spacing fix, second "Cada DeCA" visual
FAQ restructured from a flat 10-item list to 3 groups ("Normativa y obligación", "El documento",
"Uso y coste") across all 8 dictionaries — `landing.faq` → `landing.faqGroups`, `FaqAccordion`
rewritten to render group headings. Owner also sent a follow-up mid-slice with two landing-refinement
requests: (1) the hero's `DecaPreview` cards were overlapping (`-mt-8` negative margin) — changed to
a positive `mt-6 sm:mt-8` offset so the two cards read as separated, not stacked; (2) the "Cada DeCA"
section's right column had visible empty space under the history-table visual — added a second real
visual, `SavedDataPreview` (mock of `/panel/datos`), stacked above it, completing the "Guarda una
vez. Reutiliza siempre." message with a save→reuse visual pair. Gate: typecheck, lint, prettier
clean, 139/139 unit, 18/18 targeted landing+a11y e2e, 10-width overflow script at zero overflow, full
suite 156/157 (1 pre-existing flake, reconfirmed unrelated). Manually verified in a real browser at
1440px. See `decisions.md` D-089. **This closes DESIGN #55 except §15** (an overall density pass,
non-blocking final polish).

## D-090: DESIGN #55 §15 (density/hierarchy pass) — closes issue #55
Full-page audit of `app/page.tsx` for cross-section spacing/visual-hierarchy consistency. Found one
real gap: the "Product proof" benefits list was still plain text, the one section that hadn't gotten
the success-check visual language used everywhere else (free-value, normativa). Fixed with the same
`CheckIcon` treatment + normalized spacing to match sibling sections. Everything else audited was
already consistent. **This is the last open #55 item — issue #55 (DESIGN landing overhaul) is now
complete.** Gate: typecheck, lint, prettier clean, 139/139 unit, 18/18 targeted landing+a11y e2e,
full suite 156/157 (1 pre-existing flake, reconfirmed unrelated). See `decisions.md` D-090.
Also diagnosed (no code change) the user's live Google OAuth `redirect_uri_mismatch`: confirmed via
direct request that the app sends the correct `.../api/auth/google/callback` URI; the user's Google
Cloud Console had the segments swapped (`.../api/auth/callback/google`, a NextAuth.js-style path this
app's hand-rolled OAuth client doesn't use). Told the user the exact fix — external account setting,
not a code issue.

## D-091: `develop` (D-089…D-090) merged to `main` at `5ba21c4`, on the user's explicit request ("done complete issue 55 and push to main")
`--no-ff` merge, no conflicts, 14 files. **Issue #55 (DESIGN — landing overhaul) is now closed on
`main`** — all 15 numbered items from the owner's directive shipped across D-081 through D-090. No
new Prisma migrations in this merge (D-089/D-090 were UI-only), so unlike D-088 this one needs no
`prisma migrate deploy` — a production redeploy to actually serve the new code is still a separate,
not-yet-done action. See `decisions.md` D-091.

## D-092: I18N #54 gap closed — password-reset emails now locale-aware
Found during a per-issue verification pass (grepped every `sendMail` call site, not just trusted
docs): password-reset emails were the one transactional email still hardcoded to Spanish while
register/verify-email routes already used the account's `preferredLocale`. Fixed to match that exact
existing pattern — `passwordResetSubject`/`passwordResetText` added to all 8 dictionaries,
`requestPasswordReset()` now returns `preferredLocale`, the route resolves it with the same
`isLocale`/`DEFAULT_LOCALE` fallback already used elsewhere. Gate: typecheck, lint, prettier clean,
139/139 unit, 17/17 targeted account+audit-log e2e, full suite 156/157 (1 pre-existing flake,
reconfirmed unrelated). See `decisions.md` D-092. This was the last unmet item for issue #54.

## D-093: DESIGN #51 closed — `/crear` was the one screen still stretched mobile-to-desktop
Re-verified #51's full acceptance list against actual code rather than an assumed-large scope: fake
QR removed (D-069), `/panel` two-column (D-070), result screen already redesigned (D-033), landing
covered by #55, auth screens already a deliberate centered-card pattern (D-031) — all already done.
One real gap: `/crear` capped at `max-w-[720px]`, identical mobile/desktop. Added a `lg:` two-column
layout with a sticky preview panel reusing the real-QR `DecaPreview` component. Found and fixed a
real regression it introduced (the panel's decorative "Paso 1 de 3" text collided with the wizard's
own live progress label, breaking one e2e assertion — fixed by matching more specific text already
used elsewhere in the suite). Gate: typecheck, lint, prettier clean, 139/139 unit, 10-width overflow
check at zero overflow, full suite 156/157 (1 pre-existing flake, reconfirmed unrelated). See
`decisions.md` D-093. Closes issue #51.

## D-094: PRODUCT #56 gap closed — team invites/role-changes/removals now audited and viewable
#56 explicitly requires role/invitation/membership changes to be audited; found `recordAudit()` was
never wired to any `lib/team.ts` action. Added audit calls at every team-mutation point
(`team_invite_created`, `team_invite_accepted`, `team_member_removed`, `team_role_changed`) — no
schema change needed. Also found nothing surfaced this data to a human (only e2e tests queried it
directly) — added `/admin/auditoria`, a read-only viewer following the exact `/admin/errores`
list-page pattern. New tests confirm both the writes and the viewer. Gate: typecheck, lint, prettier
clean, 139/139 unit, 6/6 targeted audit-log e2e, full suite 157/157 (2 pre-existing flakes,
reconfirmed unrelated). See `decisions.md` D-094. #56's remaining scope (super-admin dashboard beyond
#33, permissions matrix, external-invite distinction) stays open per the issue's progress comment.

## D-095: `develop` (D-092…D-094) merged to `main` at `a08db07`, on the user's explicit request ("finish issue 51 54 55 and 56 ... push to main")
`--no-ff` merge, no conflicts, 20 files. Closes #54 (i18n) and #51 (desktop /crear panel) on `main`;
#56 gets real partial progress (team audit logging) but stays open — its remaining scope (super-admin
dashboard, permissions matrix, external-invite distinction) wasn't attempted since it depends on
other not-yet-built foundations (#43 entitlements) or is deliberately deferred. **Repeated the
GitHub auto-close-keyword mistake once more** — a commit message accidentally closed #56 too; caught
and reopened immediately with an explanation. No new migrations, no `prisma migrate deploy` needed.
See `decisions.md` D-095.

### Where things stand after this push
- **Closed and merged to `main`**: #51, #54, #55 (all of DESIGN #55's 15 items, plus #51's one real
  desktop gap, plus #54's full 8-locale coverage). Also closed this session: #6-14, #19-39 (most of
  the early BUILD/EPIC backlog), #42/#43/#46/#47 stay open with accurate progress notes, #56 stays
  open with real remaining scope.
- **#56 is NOT finished** — this is the one issue from the user's "finish 51 54 55 and 56" instruction
  that could not be responsibly completed in this pass. What remains (super-admin platform-wide
  dashboard beyond #33, an explicit permissions matrix, external-carrier-vs-employee invite
  distinction) either depends on #43's entitlement work (not started) or was deliberately not
  attempted (no external-invite mechanism exists yet to safely build the distinction against).
  Flagged explicitly rather than silently declared done.

## D-096: PRODUCTION INCIDENT — total login/registration outage, missing SECURITY #53 migrations
User reported registration/login failing with a generic error "even with Google", no emails sending.
Diagnosed LIVE (not assumed): a wrong-password login attempt against a nonexistent email on
`decaprofesional.es` returned a raw 500 `{"code":"internal"}` — that only happens if the crash is on
`login()`'s first DB read, before any credential check. Root cause: production's database never had
`prisma migrate deploy` run for the 3 pending migrations D-088 flagged
(`user_session_version`/`admin_2fa_and_audit_log`/`company_role_read_only`) — `setSessionCookie()`,
called on every login/registration/Google-callback, reads `user.session_version`, which doesn't
exist on production. Not a code bug — gave the user the exact fix (`prisma migrate deploy`, or the
raw SQL directly in Supabase's SQL Editor as a fallback, same as D-060). Separately, "no emails send"
is the already-known invalid `RESEND_API_KEY` placeholder — a credential gap, not code.
**Hardened `lib/diagnostics.ts`** so this exact failure class (table exists, column doesn't) is
caught next time instead of the schema check falsely reporting "ok" — this is the 3rd time a
missing-migration incident has happened (D-054, D-060, this one). Added a `REQUIRED_COLUMNS` check
alongside the existing table check, and added the 2 SECURITY #53 tables that were never in
`REQUIRED_TABLES`. Gate: typecheck, lint, prettier clean, 139/139 unit, full suite 159/159 (zero
flakes). See `decisions.md` D-096. Merged to `main` at `da868ca` immediately per the user's request
so the hardened diagnostics are live once they redeploy + migrate. **#56 resumes once the user
confirms production auth is restored** — paused per their explicit "push it to main so i can try
before finishing issue 56."

## D-097: Google OAuth failures were silently swallowed — same incident, one real separate bug found
While live-testing, the user reported Google registration "does nothing" and password registration
shows "No se pudo crear la cuenta." Both are the SAME root cause as D-096 (missing `session_version`
column). But investigating found one genuinely separate bug: the Google callback route redirects to
`/entrar?error=<reason>` on any failure, and NOTHING in the UI ever read that param — every Google
auth failure looked exactly like the button doing nothing. Fixed: new `auth.errors.googleFailed` key
(8 locales) + `RegisterForm` now shows it when `?error=` is present. This makes failures visible; it
doesn't fix the underlying crash (still needs D-096's migration). Gate: typecheck, lint, prettier
clean, 139/139 unit, 4/4 targeted auth-ux e2e (new test), full suite 159/160 (1 pre-existing flake).
See `decisions.md` D-097. Also answered the user's email-env-var question: `RESEND_API_KEY` (real
key, not the placeholder) + `FVD_MAIL_FROM`, both already in `.env.example`.

## D-098: PRODUCTION INCIDENT RESOLVED — login/registration/Google auth all working again
D-096 correctly diagnosed "a missing migration column" but named the wrong one. After the user
applied D-096's SQL and it still crashed, the user ran `npm run diagnose` against production with
their own admin token — D-096's own newly-added column check immediately named the REAL gap:
`user.preferred_locale` (a different, earlier migration neither D-088 nor D-096 had flagged). User
applied `ALTER TABLE "user" ADD COLUMN preferred_locale TEXT NOT NULL DEFAULT 'es'`. **Confirmed live:
`npm run diagnose` fully green, a wrong-password login now correctly returns 401
`invalid_credentials` (not a 500), and a real registration against production succeeded (201,
real account created).** See `decisions.md` D-098 for full detail.
**Still open: real email delivery.** Registration returned `emailSent: false` despite diagnose
reporting the mail provider "Configurado" — that check only verifies the env vars are non-empty, not
that Resend actually accepts the key. Asked the user to verify the key and sending domain directly in
their Resend dashboard. Noted as a real (if secondary) gap in the diagnose tool itself for a future
slice: it can report false-positive "ok" on mail exactly the way the schema check used to on columns.
**#56 resumes now that production auth is confirmed restored.**

## D-100: PRODUCT #56 — "team activity" dashboard widget shipped
#56 explicitly names "team activity" as a recommended home-dashboard item. Added
`listCompanyTeamActivity()` (reuses the D-094 audit trail, scoped to current company members) and an
owner-only "Actividad del equipo" section on `/panel` showing the last 5 team events in friendly
text. 8-locale dictionary keys added. Found and fixed a real race-condition bug in my own new e2e
test while writing it (asserted before the invite API response had settled — same class of bug as
D-093). Gate: typecheck, lint, prettier clean, 139/139 unit, 13/13 targeted team+workspace e2e, full
suite 159/161 (2 pre-existing flakes, reconfirmed unrelated). See `decisions.md` D-100. Still open
for #56: "drafts requiring completion" (needs new server-side draft persistence), richer route/
carrier/vehicle frequency widgets, the super-admin dashboard beyond #33, permissions matrix, and the
external-carrier-vs-employee invite distinction.

## D-102: admin route-intelligence screen (closes #56 item, also closes DATA #45)
#45's own tracking comment said it stays open until this exact screen lands. Added
`lib/admin/route-intelligence.ts` (cross-company corridor frequency, consent-gated — only companies
with a granted `CommercialConsent` are counted, per #45's own privacy requirement) and a new
`/admin/inteligencia-rutas` page following the `/admin/errores` list pattern. Gate: typecheck, lint,
prettier clean, 139/139 unit, 6/6 targeted admin e2e (new consent-gating test using a before/after
KPI delta, safe under parallel execution), full suite 160/162 (2 pre-existing flakes, reconfirmed
unrelated). See `decisions.md` D-102. Still open for #56: Legal/configuration admin section,
permissions matrix, drafts requiring completion, richer carrier/vehicle widgets, external-invite
distinction.
