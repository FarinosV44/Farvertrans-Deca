---
schema: keel.sprint/1
sprint: 2
goal: Registered value + acquisition tracking + launch readiness (BUILD 10–15)
status: in-progress
slices:
  - id: S-10
    title: BUILD 10 — Registered workspace (history, saved entities, duplicate)
    status: done
    hours: 12
    depends_on: [S-09]
    criteria: [AC-07-workspace]
  - id: S-11
    title: BUILD 11 — Referral + UTM attribution per operator
    status: done
    hours: 10
    depends_on: [S-09]
    criteria: [AC-18, AC-19, AC-20, AC-21, AC-22, AC-23]
  - id: S-12
    title: BUILD 12 — Internal operator acquisition dashboard
    status: done
    hours: 8
    depends_on: [S-11]
    criteria: [AC-30]
  - id: S-13
    title: BUILD 13 — Sharing, corrections/versioning, abuse controls
    status: not-started
    hours: 14
    depends_on: [S-08]
    criteria: [AC-14, AC-15, AC-16, AC-24, AC-34, AC-35, AC-36]
  - id: S-14
    title: BUILD 14 — SEO base + 10 core pages + "am I obligated?"
    status: not-started
    hours: 16
    depends_on: [S-06]
    criteria: [AC-37]
  - id: S-15
    title: BUILD 15 — Launch gate (perf, security headers, compliance re-run, deploy runbook)
    status: not-started
    hours: 10
    depends_on: [S-10, S-11, S-12, S-13, S-14]
    criteria: [AC-11, AC-12, AC-28]
---

# Sprint 2 — Registered value, acquisition tracking, launch readiness

- Acceptance: registered companies get materially faster with use; every signup and DeCA is attributed
  to its operator/campaign; the launch gate (compliance + perf + security + deploy runbook) passes.
- Notes: execution mode (D-019). Each BUILD issue ends browser-verifiable + tested; comment beat 1 on
  each, never close.
- Close-out: _pending_

## S-10 close (BUILD 10)
`/app` actions-first workspace (+ Crear DeCA, Repetir último DeCA, últimos documentos, datos habituales
counts); `/app/historico` table+cards with free-text + date-range search; `/app/datos` CRUD for saved
companies/vehicles/addresses; wizard autofill from saved data for authed users; duplicate via
`/crear?from=<id>` (date reset, new id/token on generate). Authed `POST /api/deca` now owns the DeCA by
company. Green: 36 unit + 37 e2e (incl. 4 workspace + axe on all 3 new screens) + standalone + keel-verify.
