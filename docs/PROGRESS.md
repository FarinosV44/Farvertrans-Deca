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
| 5 Development | in progress | docs/sprints/sprint-1.md ✓, docs/sprints/sprint-2.md ✓, docs/05-test-points.md ✓ · BUILD 05–12 done · BUILD 13–15 pending |
| 6 Documentation | pending | docs/architecture.md, docs/api/, docs/usage/ |
| 7 Release | pending | docs/07-release.md |
| 8 Website | n/a (site is in the main codebase) | — |

## Current position
- Phase: 5 — Development (execution mode, D-019). Sprint 2.
- **Done: BUILD 05–12.** Core anonymous flow (05–09) + registered workspace (10) + acquisition
  tracking (11) + operator dashboard (12). All green: 43 unit + 43 e2e (6 compliance R-1…R-13 + axe on
  every public screen) + typecheck + lint + standalone build + keel-verify.
  - 05 scaffold · 06 landing · 07 `/crear` 3-step creator · 08 compliant PDF+QR+`/d/[token]` +
    `npm run test:compliance` gate · 09 signup+claim (own auth D-021) ·
    10 `/app` + `/app/historico` (search + date range) + `/app/datos` (saved data CRUD) + wizard
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
  "Guardar este DeCA" → `/registro` → `/app` with the document owned + reusable data.
- Next action: **BUILD 13** — driver share (`POST /api/share` + WhatsApp deep link + printable A4;
  AC-24), corrections/versioning (→ new `deca_version` with new token/QR/PDF, prior kept — R-13,
  AC-14/15/16), abuse controls (`lib/abuse` — sliding window per hashed IP+fingerprint, challenge above
  a soft threshold, NEVER on `/d/`, fail-open — F16/AC-34…36). Then #14 SEO base + 10 core pages +
  "¿Estoy obligado?", #15 launch gate (perf/Lighthouse AC-28, CSP + security headers, full compliance
  re-run, deploy runbook).
- Gaps before Phase 7 release: `.githooks/pre-commit` gate + `.github/workflows/ci.yml` (D-010, deferred
  at scaffold); `docs/.keel/plan.json` + `scripts/keel-close`/`keel-handoff-verify` (execution shortcut);
  password reset; real Supabase project + domain + email + hCaptcha (CREDENTIAL, pre-launch);
  RGPD review of anonymous-doc retention (D-016); legal check that a generated DeCA passes inspection.

## Open items
- Pre-launch only: real domain; RGPD review of anonymous-document retention; legal inspection check of generated DeCA; Hostinger VPS sizing.
- Unverified external steps/assets: Supabase project, Hostinger VPS, DNS, transactional email, hCaptcha, GitHub secrets.
- Forge EPICs: #1 landing, #2 attribution, #3 SEO, #4 compliance. Execution queue #5 onward.
- Ready for `main`: nothing yet.

### Deferred items
- Local SEO pages; long-tail/user-type SEO beyond core launch pages; multi-user/team; public API; bulk import; eCMR interop feature.

Last updated: 2026-09-03 — BUILD 05-12 done, starting BUILD 13
