# PROGRESS — Farvertrans DeCA

> Living state. Read this FIRST in every session. Keep current and compact.

## Project card
- Name / one-line purpose: Farvertrans DeCA — free, no-limit generator of the Spanish DeCA control document, built for mass acquisition before the 2026-10-05 mandate.
- Project type: Web app (SSR/SSG + API + hosted service) / secondary: Website (marketing + programmatic SEO)
- Stack & target platform(s): [pending docs/03-technical-plan.md — candidates: Node LTS, SSR framework, PostgreSQL, S3-compatible object store, server-side text-PDF engine, QR encoder] — web/HTML
- License: proprietary / UNLICENSED (D-003)
- Docs language: English (token economy — D-002)
- Security profile: references/security/web-app.md + references/security/website.md
- Accessibility: WCAG 2.2 AA floor + AAA where feasible; EN 301 549 / EAA (references/accessibility.md) — D-004
- i18n: single — Spanish (es-ES) for v1, i18n-ready code, additive later (D-002)
- Installed base: fresh v1
- Design system: founding — canonical will live at design-handoff/ SPEC/design-tokens.md + artifacts/styles/ + logo assets
- Keel portability: lock + embedded v5.19.2 (D-010)
- Assistant config: full (tools: claude — AGENTS.md covers codex/copilot/cursor/windsurf) — D-010
- E2E: absent
- CI runs on: main (push to main, version tags, PRs targeting main) — D-010
- Models: n/a (no agents configured yet)
- Keel baseline: v5.19.2
- Website intent: yes — own domain (placeholder deca.farvertrans.es — D-011); site is in-codebase, no separate Phase 8
- Client budget: no (D-005 batch — internal product)
- User guide: [asked at Phase 6]
- Docs theme: n/a until Phase 6
- Test-first policy: [asked at Phase 2 §4e — expected pure-logic, the compliance engine is pure-logic-heavy]
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
| 2 Functional spec | pending | docs/02-functional-spec.md, docs/03-technical-plan.md, docs/flows/ |
| 3 Design handoff | pending | docs/design/DESIGN-BRIEF.md |
| 4 Faithful build | pending | docs/BUILD-SPEC.md |
| 5 Development | pending | docs/sprints/, docs/05-test-points.md |
| 6 Documentation | pending | docs/architecture.md, docs/api/, docs/usage/ |
| 7 Release | pending | docs/07-release.md |
| 8 Website | n/a (site is in the main codebase) | — |

## Current position
- Phase: 2 — Functional spec.  Step: not started.
- Next action: read references/phase-2-functional-spec.md; produce docs/02-functional-spec.md (flows + AC-nn), docs/03-technical-plan.md (stack, code map, change map, environment requirements, testing/driver plan), docs/threat-model.md, docs/flows/, firm estimate v2. Materialise the assistant-config rules + subagents at Phase 2 close (D-010).

## Open items
- Unresolved user questions: none (Phase 1 closed). Deferred: brand interview open items → Phase 3 SPEC/open-questions.md; real domain → pre-launch (placeholder deca.farvertrans.es).
- Open Design Requests: none.
- Unverified external steps/assets: none.
- Forge issues in progress: #1 EPIC 01, #2 EPIC 02, #3 EPIC 03, #4 EPIC 04 — the source EPICs for this whole build (docs/issues.md). First reply beat at first sprint close.

### Deferred items (consciously postponed work)
- Local SEO pages (confrontation #24) — low severity — revisit post-launch.
- SEO long-tail / user-type pages beyond 10 core (#25) — low — post-launch.
- Multi-user/team (#26), public API (#27), bulk import (#28), eCMR interop feature (#29) — revisit when monetising.

Last updated: 2026-09-03 — Phase 1 done, entering Phase 2
