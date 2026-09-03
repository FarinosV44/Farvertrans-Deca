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
| 5 Development | in progress | docs/sprints/sprint-1.md ✓, docs/05-test-points.md ✓ · BUILD 05–07 done · BUILD 08–15 pending |
| 6 Documentation | pending | docs/architecture.md, docs/api/, docs/usage/ |
| 7 Release | pending | docs/07-release.md |
| 8 Website | n/a (site is in the main codebase) | — |

## Current position
- Phase: 5 — Development (execution mode, D-019). Sprint 1.
- Done: BUILD 05 (scaffold), BUILD 06 (production landing), BUILD 07 (anonymous 3-step creator `/crear`: mobile-first wizard, zod per step + `validateDeca` R-2, accessible error summary + inline errors, sessionStorage draft survives refresh/back, plate normalisation, foreign-NIF warn-not-block, `POST /api/deca` persists deca+version atomically with 256-bit token + 30-day claim token, idempotency-key dedup, `deca_started` once, result page `/crear/[id]` with priority actions). Green: build (+ standalone), typecheck, lint, 20 unit, 22 e2e (incl. @axe-core), keel-verify.
- Next action: BUILD 08 — real compliant PDF + QR + public inspection URL (EPIC #4, F2–F6, R-1…R-13): `@react-pdf/renderer` native text PDF (all mandatory fields, creation/mod metadata, ≤5 MB), QR → `/d/[token]`, store in private Supabase Storage, `GET /d/[token]` streams the PDF directly (no auth/interstitial/button, noindex, safe filename), unknown token → 404, fail-closed on any render/storage error, prior versions never overwritten. Wire the result screen's "Ver / descargar PDF" to the real file. Then BUILD 09 (signup + claim), continue 10→15.
- Note: `/d/[token]` and `/registro` are referenced by the BUILD 07 result screen but land in BUILD 08 / BUILD 09.
- Gap to close at sprint end: `.githooks/pre-commit` confidential gate + CI workflow (D-010 full assistant-config) not yet materialised.

## Open items
- Pre-launch only: real domain; RGPD review of anonymous-document retention; legal inspection check of generated DeCA; Hostinger VPS sizing.
- Unverified external steps/assets: Supabase project, Hostinger VPS, DNS, transactional email, hCaptcha, GitHub secrets.
- Forge EPICs: #1 landing, #2 attribution, #3 SEO, #4 compliance. Execution queue #5 onward.
- Ready for `main`: nothing yet.

### Deferred items
- Local SEO pages; long-tail/user-type SEO beyond core launch pages; multi-user/team; public API; bulk import; eCMR interop feature.

Last updated: 2026-09-03 — BUILD 05-07 done, starting BUILD 08
