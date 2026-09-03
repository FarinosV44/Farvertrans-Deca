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
| 5 Development | in progress | docs/sprints/sprint-1.md ✓, docs/05-test-points.md ✓ · BUILD 05–08 done · BUILD 09–15 pending |
| 6 Documentation | pending | docs/architecture.md, docs/api/, docs/usage/ |
| 7 Release | pending | docs/07-release.md |
| 8 Website | n/a (site is in the main codebase) | — |

## Current position
- Phase: 5 — Development (execution mode, D-019). Sprint 1.
- Done: BUILD 05 (scaffold), BUILD 06 (landing), BUILD 07 (anonymous creator), BUILD 08 (compliant PDF + QR + public URL: `@react-pdf/renderer` native text PDF ≈20 KB with all R-2 fields as selectable text, embedded Inter OFL font, QR (error-correction H) → `/d/[token]`, PDF metadata CreationDate + Creator; `lib/storage` pluggable — Supabase Storage in prod, local FS in dev/tests; `GET /d/[token]` streams the exact PDF with `application/pdf` + `inline` + `noindex`, no cookie, no interstitial; unknown token → 404; `isPubliclyAvailable` R-9 7-day window; hashed-IP access log; render/store BEFORE any DB write so it fails closed; `deca_generated` emitted on the result page; `npm run test:compliance` suite = 6 R-1…R-13 checks, a Phase 7 gate). Green: build + standalone (fonts traced), typecheck, lint, 24 unit, 28 e2e (6 compliance + 3 a11y), keel-verify.
- **The core flow now works end to end:** open `/` → CREAR DECA GRATIS → 3 steps (no signup) → GENERAR DECA → real compliant PDF+QR at `/crear/[id]` → Ver/descargar PDF (`/d/[token]`, direct download) / Compartir (WhatsApp/email/copy).
- Next action: BUILD 09 — company signup + claim the anonymous DeCA without losing work (F6/F10, D-016): Supabase Auth (email OTP or email+password) with SSR sessions, `/registro?claim=<token>` → create `company` + `user` idempotently → attach the existing anonymous DeCA via the one-time 30-day claim token → land on `/app` with the document present. Keep signup to name + NIF + address only (no lead-qual fields). Emit `signup_started/completed`, `claim_completed`. Then BUILD 10 (workspace) → 15.
- Note: `/registro` and `/app` are referenced by the result screen and land in BUILD 09/10.
- Gap to close at sprint end: `.githooks/pre-commit` confidential gate + CI workflow (D-010 full assistant-config) not yet materialised.

## Open items
- Pre-launch only: real domain; RGPD review of anonymous-document retention; legal inspection check of generated DeCA; Hostinger VPS sizing.
- Unverified external steps/assets: Supabase project, Hostinger VPS, DNS, transactional email, hCaptcha, GitHub secrets.
- Forge EPICs: #1 landing, #2 attribution, #3 SEO, #4 compliance. Execution queue #5 onward.
- Ready for `main`: nothing yet.

### Deferred items
- Local SEO pages; long-tail/user-type SEO beyond core launch pages; multi-user/team; public API; bulk import; eCMR interop feature.

Last updated: 2026-09-03 — BUILD 05-08 done, starting BUILD 09
