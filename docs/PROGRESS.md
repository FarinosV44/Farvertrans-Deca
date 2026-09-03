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
- Keel portability: [pending — embed question]
- Assistant config: [pending question] (tools: [pending])
- E2E: absent
- CI runs on: [pending — asked with assistant-config batch]
- Models: n/a (no agents configured yet)
- Keel baseline: v5.19.2
- Website intent: yes — own domain (domain TBD); site is in-codebase, no separate Phase 8
- Client budget: [pending — expected no, internal product]
- User guide: [asked at Phase 6]
- Docs theme: n/a until Phase 6
- Test-first policy: [asked at Phase 2 §4e — expected pure-logic, the compliance engine is pure-logic-heavy]
- Durability: git remote origin https://github.com/FarinosV44/Farvertrans-Deca.git (D-006)
- Autonomy: automatic / issues: after-sprint / Issue sweep interval: 24h / Issue capture: on (D-005)
- Branches: integration branch `develop` (created from `main`); current work branch: none yet
- Notify: PushNotification (terminal + phone via Remote Control) — the user (D-005)
- Chaining: [pending user answer at Phase 1 close]
- Chaining model: [pending]
- Chain verified: n/a

## Phase status
| Phase | Status | Key artifacts |
|-------|--------|---------------|
| 1 Discovery | in progress | docs/00-competitive-landscape.md ✓, docs/01-discovery.md ✓, docs/01a-confrontation.md ✓, docs/estimate.md (v1), docs/token-ledger.md |
| 2 Functional spec | pending | docs/02-functional-spec.md, docs/03-technical-plan.md, docs/flows/ |
| 3 Design handoff | pending | docs/design/DESIGN-BRIEF.md |
| 4 Faithful build | pending | docs/BUILD-SPEC.md |
| 5 Development | pending | docs/sprints/, docs/05-test-points.md |
| 6 Documentation | pending | docs/architecture.md, docs/api/, docs/usage/ |
| 7 Release | pending | docs/07-release.md |
| 8 Website | n/a (site is in the main codebase) | — |

## Current position
- Phase: 1 — Discovery.  Step: 3a — competitive confrontation + discovery-decision batch awaiting the user.
- Next action: get the user's answers to the discovery batch (scope decision mode + per-row decisions, founding brand interview, domain, client budget, chaining, embed skill, assistant config, sequencing). Then finalise scope in docs/01-discovery.md, produce docs/estimate.md v1, close Phase 1.

## Open items
- Unresolved user questions: the discovery batch (see docs/01-discovery.md "Open questions for the user").
- Open Design Requests: none.
- Unverified external steps/assets: none.
- Forge issues in progress: #1–#4 are the source EPICs for this whole build (see docs/issues.md once created).

### Deferred items (consciously postponed work)
- Local SEO pages (confrontation #24) — low severity — revisit post-launch.
- SEO long-tail / user-type pages beyond 10 core (#25) — low — post-launch.
- Multi-user/team (#26), public API (#27), bulk import (#28), eCMR interop feature (#29) — revisit when monetising.

Last updated: 2026-09-03 — Phase 1 step 3a
