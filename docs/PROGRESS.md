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
- Design system: founding — canonical will live at design-handoff/ SPEC/design-tokens.md + artifacts/styles/ + logo assets
- Keel portability: lock + embedded v5.19.2 (D-010)
- Assistant config: full — rules+agents materialised at Phase 2 close (D-018); permissions/pre-commit/CI at Phase 5 scaffold (tools: claude — AGENTS.md covers codex/copilot/cursor/windsurf) — D-010
- E2E: absent
- CI runs on: main (push to main, version tags, PRs targeting main) — D-010
- Models: orchestrator=<session model> / reviewer=sonnet / mechanical=haiku (D-017)
- Keel baseline: v5.19.2
- Website intent: yes — own domain (placeholder deca.farvertrans.es — D-011); site is in-codebase, no separate Phase 8
- Client budget: no (D-005 batch — internal product)
- User guide: [asked at Phase 6]
- Docs theme: n/a until Phase 6
- Test-first policy: pure-logic (D-014)
- Durability: git remote origin https://github.com/FarinosV44/Farvertrans-Deca.git (D-006)
- Autonomy: automatic / issues: after-sprint / Issue sweep interval: 24h / Issue capture: on (D-005)
- Branches: integration branch `develop` (created from `main`); current work branch: none yet
- Notify: PushNotification (terminal + phone via Remote Control) — the user (D-005)
- Chaining: off (D-009) — continuation-prompt.md written every session; user opens the next chat
- Chaining model: n/a
- Chain verified: n/a

## Phase status
| Phase | Status | Key artifacts |
|-------|--------|---------------|
| 1 Discovery | done | docs/00-competitive-landscape.md ✓, docs/01-discovery.md ✓, docs/01a-confrontation.md ✓, docs/estimate.md (v1) ✓, docs/token-ledger.md ✓, docs/keel-conformance.md ✓, docs/issues.md ✓ |
| 2 Functional spec | done | docs/02-functional-spec.md ✓ (F1–F18, AC-01…AC-37), docs/03-technical-plan.md ✓, docs/threat-model.md ✓, docs/flows/ ✓ (7 flows), docs/estimate.md v2 firm ✓, .claude/rules/ + .claude/agents/ ✓ |
| 3 Design handoff | pending | docs/design/DESIGN-BRIEF.md |
| 4 Faithful build | pending | docs/BUILD-SPEC.md |
| 5 Development | pending | docs/sprints/, docs/05-test-points.md |
| 6 Documentation | pending | docs/architecture.md, docs/api/, docs/usage/ |
| 7 Release | pending | docs/07-release.md |
| 8 Website | n/a (site is in the main codebase) | — |

## Current position
- Phase: 3 — Design handoff.  Step: not started.
- Next action: read references/phase-3-design-handoff.md and references/handoff-contract.md. Produce docs/design/DESIGN-BRIEF.md — founding brand (assistant proposes: modern SaaS, sober, conversion + legal-trust, mobile-first; open items → SPEC/open-questions.md), every screen in the Design split (docs/02-functional-spec.md §Design split), breakpoints 360/768/1280 verbatim, per-screen a11y requirements, the logo as a founding deliverable, the compliant PDF visual layout. No stock truck photos (EPIC 01). Then hand the brief to the user for approval.

## Open items
- Unresolved user questions: none. Deferred to Phase 3: founding brand interview open items (exact colours, typeface + licensing, dark mode, iconography, vetoes, any existing Farvertrans brand elements) → SPEC/open-questions.md.
- Pre-launch open items: real domain (placeholder deca.farvertrans.es — D-011); RGPD review of anonymous-document retention (D-016); Hostinger VPS sizing; whether in-place typo edits before first share are allowed (default: always new version).
- Open Design Requests: none.
- Unverified external steps/assets: Supabase project, Hostinger VPS, DNS, Resend, hCaptcha, GitHub secrets — all Phase 4 guided setup (CREDENTIAL).
- Forge issues in progress: #1 EPIC 01, #2 EPIC 02, #3 EPIC 03, #4 EPIC 04 (docs/issues.md). First reply beat at first sprint close.
- Ready for `main`: nothing yet.

### Deferred items (consciously postponed work)
- Local SEO pages (confrontation #24) — low severity — revisit post-launch.
- SEO long-tail / user-type pages beyond 10 core (#25) — low — post-launch.
- Multi-user/team (#26), public API (#27), bulk import (#28), eCMR interop feature (#29) — revisit when monetising.

Last updated: 2026-09-03 — Phase 2 done, entering Phase 3
