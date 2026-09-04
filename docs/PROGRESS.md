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
  - **All of Product V3 (#29–#38) is on `develop`.** Splits opened: #39 (company logo on PDF), #40
    (PWA/offline). Deferred to the OAuth slice: Google handshake + 2-step onboarding (part of #30/#38).
    Nothing on `main` yet — awaits the user's `develop`→`main` merge.
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
- Ready for `main`: #29 (D-029) + #33 (D-030) + #30 (D-031, UI-only) on `develop`, gate green — await the user's `develop`→`main` merge (user chose "hold for now"). Everything through #28 already on `main`.
  `develop`→`main` merge (user chose "hold for now"). Everything through #28 already on `main`.

### Deferred items
- Local SEO pages; long-tail/user-type SEO beyond core launch pages; public API; CSV *file upload*
  for prospect import (paste-import shipped); eCMR interop feature.

Last updated: 2026-09-04 — Product V3: #29 (D-029) + #33 (D-030, Admin V2) + #30 UI-only (D-031, premium auth card) on `develop`, gate green (84 unit + 104 e2e + 8 compliance). Next: #31. #32/#34–#38 not started.
