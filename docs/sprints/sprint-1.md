---
schema: keel.sprint/1
sprint: 1
goal: Runnable product to the core anonymous flow — landing → create → compliant PDF+QR → download/share → register
status: in-progress
slices:
  - id: S-05
    title: BUILD 05 — Scaffold runnable Next.js app + Supabase/Prisma foundation
    status: done
    hours: 10
    depends_on: []
    criteria: [scaffold]
  - id: S-06
    title: BUILD 06 — Production landing (DeCA GRATIS + one-click anonymous start)
    status: done
    hours: 12
    depends_on: [S-05]
    criteria: [AC-25, AC-26, AC-27, AC-29, AC-31, AC-32, AC-33]
  - id: S-07
    title: BUILD 07 — Anonymous 3-step DeCA creator with real validation
    status: done
    hours: 15
    depends_on: [S-05]
    criteria: [AC-01, AC-02, AC-04, AC-04b, AC-09]
  - id: S-08
    title: BUILD 08 — Real compliant PDF + QR + public inspection URL
    status: not-started
    hours: 16
    depends_on: [S-07]
    criteria: [AC-03, AC-05, AC-06, AC-07, AC-08, AC-10, AC-11, AC-12, AC-13, AC-14, AC-17, AC-24]
  - id: S-09
    title: BUILD 09 — Company signup + claim anonymous DeCA
    status: not-started
    hours: 12
    depends_on: [S-08]
    criteria: [AC-17, AC-19, AC-20]
---

# Sprint 1 — Runnable product to the core anonymous flow

- Acceptance: a browser can open `/`, click through `/crear`, generate a real compliant PDF with a
  working QR, download/share it, and then create a company account that owns that document.
- Notes: per D-019 the build follows `docs/design/IMPLEMENTATION-BRIEF.md` directly (no external design tool).
  Test-point results go in `docs/05-test-points.md`.
- Close-out: _pending_
