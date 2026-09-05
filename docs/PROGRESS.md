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
