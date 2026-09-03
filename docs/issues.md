# Issues — Farvertrans DeCA

> Living log of forge issues (GitHub: https://github.com/FarinosV44/Farvertrans-Deca/issues).
> Inventory first, one entry per issue worked. Updated the moment an issue is triaged, worked, or closed.
> Last inbound sweep: 2026-09-03 23:30 — issues #1–#20 open; no third-party comments. #1–#15 awaiting
> deploy; #16 code-complete on `main`; #17–#20 landed on `develop`, commented (beat 1), awaiting the
> user's merge to `main` + deploy.

## Inventory
| # | Title | Type | Priority | Status | Entry |
|---|-------|------|----------|--------|-------|
| 1 | EPIC 01 — Landing DeCA GRATIS | epic | high | awaiting deploy | E-001 |
| 2 | EPIC 02 — Tracking de captación por operador, enlace y campaña | epic | high | awaiting deploy | E-002 |
| 3 | EPIC 03 — SEO programático y arquitectura de contenidos DeCA | epic | medium | awaiting deploy | E-003 |
| 4 | EPIC 04 — Cumplimiento técnico real del DeCA | epic | high | awaiting deploy | E-004 |
| 5 | BUILD 05 — Scaffold runnable Next.js + Supabase/Prisma | build | high | awaiting deploy | E-005 |
| 6 | BUILD 06 — Production landing | build | high | awaiting deploy | E-006 |
| 7 | BUILD 07 — Anonymous 3-step DeCA creator | build | high | awaiting deploy | E-007 |
| 8 | BUILD 08 — Real compliant PDF + QR + public URL | build | high | awaiting deploy | E-008 |
| 9 | BUILD 09 — Company signup + claim anonymous DeCA | build | high | awaiting deploy | E-009 |
| 10 | BUILD 10 — Registered workspace: history, saved entities, duplicate | build | high | awaiting deploy | E-010 |
| 11 | BUILD 11 — Referral + UTM attribution | build | high | awaiting deploy | E-010 |
| 12 | BUILD 12 — Internal operator acquisition dashboard | build | medium | awaiting deploy | E-010 |
| 13 | BUILD 13 — Sharing, corrections/versioning, abuse controls | build | high | awaiting deploy | E-010 |
| 14 | BUILD 14 — Launch SEO base + core DeCA search pages | build | medium | awaiting deploy | E-010 |
| 15 | BUILD 15 — Launch gate: compliance, mobile, security, perf, deploy | build | high | awaiting deploy | E-010 |
| 16 | FIX 16 — Hostinger Cloud Startup runtime compatibility (ESM 503) | fix | high | fixed on `main`, awaiting deploy test | E-011 |
| 17 | FIX 17 — Rebuild DeCA form against exact legal data model | fix | high | on `develop`, awaiting main+deploy | E-011 |
| 18 | FIX 18 — Production PDF/QR path + persistent storage + metadata | fix | high | on `develop`, awaiting main+deploy | E-011 |
| 19 | FIX 19 — Legal versioning, correction workflow, 1-year preservation | fix | high | on `develop`, awaiting main+deploy | E-011 |
| 20 | LAUNCH 20 — Public-ready DeCA happy path | launch | high | automated part on `develop`; blocked on deploy + manual QR | E-011 |

### E-011 — FIX #16–#19 + LAUNCH #20 (Hostinger CJS, legal data model, PDF hash/persistence, retention, happy-path)
- Status: #16 fixed on `main` (`d200158` — see E-… / D-025), awaiting the user's deploy test.
  #17–#20 landed on `develop`, all green (52 unit + 63 e2e + 8 compliance + typecheck + lint + format
  + keel-verify). Commented beat 1 on #16–#20. NOT merged to `main` (needs the user's word).
- Commits on `develop`: #17 legal data model / carrier domicilio / review step · #18+#19 pdf_sha256 /
  FVD_STORAGE_DIR / version author / retention doc (migration `20260903230000`) · #20 launch-happy-path
  spec + `docs/production-smoke-checklist.md`. Decision D-026.
- Pending: merge `develop` → `main` (user); deploy with persistent DB + storage; run
  `docs/production-smoke-checklist.md` incl. the external QR scan; then beat 3 + the user closes #16–#20.

### E-010 — BUILD 10–15 (workspace, attribution, dashboard, sharing/versioning/abuse, SEO, launch gate)
- Status: **awaiting deploy** — all landed on `develop`; **v1 merged to `main`** (commit 75419dc,
  authorised by the user). 47 unit + 57 e2e + 6-check compliance suite + standalone build + keel-verify,
  all green. Commented beat 1 on #10–#15.
- Commits: 10 → 596418e · 11+12 → 3a52c54 · 13 → bc654ec · 14 → 90942db · 15 → 75419dc · CI fixes → 946ac88. v1 on main; CI green.
- Deploy: still needed (CREDENTIAL — Supabase project, Hostinger VPS, domain, Resend, hCaptcha).
  Runbook: `docs/07-release.md`.
- Pending: the user's RGPD + legal-inspection reviews; deploy; then beat 3 on #1–#15; then the user closes them.

## BUILD entries (sprint 1 — landed on develop, awaiting deploy)

### E-005..E-009 — BUILD 05–09 (the core anonymous flow)
- Status: **awaiting deploy** — all landed on `develop`, all verified green locally (31 unit + 32 e2e incl. 6-check R-1…R-13 compliance suite + 4 axe). Commented on each issue (beat 1). Not closed — the user confirms.
- E-005 #5 scaffold → commit 93f1868. E-006 #6 landing → 7262ca1. E-007 #7 creator → 7641709. E-008 #8 PDF/QR/URL → 206d734. E-009 #9 signup+claim → fc5609a.
- Diagnosis: n/a (feature work).
- Verification: `npm test` + `npm run test:e2e` + `npm run test:compliance`, all green; standalone build traces fonts.
- Deploy: **needed before the reporter can test** — the Supabase project + Hostinger VPS + domain + email provider are not set up (CREDENTIAL). Notified the user 2026-09-03 via PushNotification.
- Replies: beat 1 posted on #5–#9 (2026-09-03). Beat 2 = deploy notification sent. Beat 3 pending deploy.
- Lesson: none. Pending: BUILD 10–15; then deploy; then beat 3 + user closes.

## Entries

### E-001 — #1 EPIC 01 Landing DeCA GRATIS
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/1   Status: in progress (Phase 1 done — scope in docs/01-discovery.md, landing = confrontation row 12 + EPIC structure)
- Diagnosis: n/a (feature epic, not a bug)
- Resolution: planned for the launch-first subset (D-008). Full landing structure in v1 scope.
- Changes: none yet — spec in Phase 2, build in Phase 5.
- Verification: pending — Phase 5 test points + Phase 7 release gate (Core Web Vitals, SEO base, no pricing/checkout).
- Replies: none yet — first beat at first sprint close.
- Pending: everything (Phase 2 onward).

### E-002 — #2 EPIC 02 Acquisition tracking
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/2   Status: in progress
- Resolution: confrontation row 13 + lite dashboard row 23. In v1; built alongside the landing (cheap, time-sensitive).
- Changes: none yet.
- Verification: pending — tests for attribution + first-touch non-overwrite (per the issue's acceptance criteria).
- Replies: none yet.
- Pending: everything (Phase 2 onward).

### E-003 — #3 EPIC 03 Programmatic SEO
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/3   Status: in progress
- Resolution: SEO technical base (#15) + 10 core pages (#16) in v1, core pages land right after launch (D-008). Local (#24) and long-tail/user-type (#25) pages deferred to Later — thin-content risk, no pre-mandate payoff.
- Changes: none yet.
- Verification: pending — sitemap/canonical/metadata checks, no-thin-content review.
- Replies: none yet.
- Pending: URL architecture defined in Phase 2; pages built in Phase 5.

### E-004 — #4 EPIC 04 Technical compliance
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/4   Status: in progress
- Resolution: confrontation rows 2–6, 22 + abuse controls row 19. The product core. Regulatory baseline captured as R-1…R-13 in docs/00-competitive-landscape.md; will become a Phase 5 test-suite gate and a Phase 7 release gate.
- Changes: none yet.
- Verification: pending — the automated compliance suite (PDF <5 MB, native, QR legible + correct URL, HTTPS direct download no-auth, creation/modification recorded, retrievable, prior version preserved).
- Replies: none yet.
- Pending: everything (Phase 2 onward).
