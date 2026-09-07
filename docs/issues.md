# Issues — Farvertrans DeCA

> Living log of forge issues (GitHub: https://github.com/FarinosV44/Farvertrans-Deca/issues).
> Inventory first, one entry per issue worked. Updated the moment an issue is triaged, worked, or closed.
> Last inbound sweep: 2026-09-08 — open on the forge: #1–#4, #24, #33, #40–#43, #46, #47, #56
> (worked in D-042…D-111, awaiting the user's close), and the launch batches **#59–#68** (all
> implemented + on `main`, awaiting the user's close) and **#69–#83** (in progress this run —
> user: "start working and don't stop till you finish them all"). No third-party comments on any
> issue. #29–#38 closed.
>
> Earlier note (2026-09-04): #1–#28 all merged to `main`; every issue commented (beat 1); awaiting
> the user's deploy + verification, then beat 3, then the user closes them.

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
| 16 | FIX 16 — Hostinger Cloud Startup runtime compatibility (ESM 503) | fix | high | on `main`, awaiting deploy test | E-011 |
| 17 | FIX 17 — Rebuild DeCA form against exact legal data model | fix | high | on `main`, awaiting deploy | E-011 |
| 18 | FIX 18 — Production PDF/QR path + persistent storage + metadata | fix | high | on `main`, awaiting deploy | E-011 |
| 19 | FIX 19 — Legal versioning, correction workflow, 1-year preservation | fix | high | on `main`, awaiting deploy | E-011 |
| 20 | LAUNCH 20 — Public-ready DeCA happy path | launch | high | automated part on `main`; blocked on deploy + manual QR | E-011 |
| 21 | BRAND 21 — standalone marketable brand | brand | medium | on `main` | E-012 |
| 22 | DESIGN 22 — Landing V2 | design | high | on `main` | E-012 |
| 23 | ACCOUNT 23 — frictionless registration + recovery | fix | high | on `main` | E-012 |
| 24 | WORKSPACE 24 — daily-use company panel | fix | medium | on `main` | E-012 |
| 25 | UX 25 — fast creator V2 (autocomplete, templates) | fix | high | on `main` | E-012 |
| 26 | OPS 26 — driver delivery + QR verification | fix | high | on `main` | E-012 |
| 27 | TEAM 27 — multi-user company workspaces | feat | medium | on `main` | E-012 |
| 28 | GROWTH 28 — company acquisition engine | feat | high | on `main` | E-012 |

### E-012 — Product V2 (#21–#28): brand, landing, accounts, workspace, creator, delivery, teams, acquisition
- Status: **all 8 merged to `main`** (D-027). 8 commits, 8 new e2e specs, 4 migrations. Beat-1
  commented on #21–#28. Local gate: 57 unit + 85 e2e + 8 compliance + typecheck + lint + format +
  keel-verify (2 pre-existing timing flakes pass on retry).
- Commits (develop→main): #21 brand · #22 landing V2 · #23 auth/recovery · #24 workspace filters ·
  #25 templates · #26 driver delivery · #27 team workspaces · #28 acquisition engine.
- Pending: the user deploys, runs `docs/production-smoke-checklist.md` (esp. team invite + prospect
  onboarding on the live URL), then beat-3 + closes #21–#28.

### E-011 — FIX #16–#19 + LAUNCH #20 (Hostinger CJS, legal data model, PDF hash/persistence, retention, happy-path)
- Status: **all merged to `main` at `0272c33`, CI green** (52 unit + 63 e2e + 8 compliance + typecheck
  + lint + format + keel-verify + the "Standalone server is CommonJS" guard). Commented beat 1 on #16–#20.
- Commits: #16 → `d200158` (D-025) · #17 → `9459cba` · #18+#19 → `593fc2a` (migration `20260903230000`)
  · #20 → `2ec398b`. Decision D-026.
- Pending: the user deploys (Cloud Startup startup file `server.cjs`, or VPS+Docker) with persistent
  DB + storage (`FVD_STORAGE_DIR` / Supabase); runs `docs/production-smoke-checklist.md` incl. the
  external QR scan; then beat 3 + the user closes #16–#20.

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

---

## Launch batch #59–#64 (2026-09-07 — plan `.claude/plans/sunny-greeting-snowflake.md`)

### I-061 — #61 Unify DeCA-party legal terminology  · P0 · **worked, on `develop`**
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/61
- Diagnosis: a partial migration had already happened (D-107) — the PDF, review screen, FAQ and most
  legal prose already said "cargador contractual" / "transportista efectivo" — but there was **no
  central source**, so the wizard chrome, correction-diff, zod messages and a few components had
  drifted or hardcoded the bare forms. The two *literal* phrases the issue lists
  ("transportista de mercancías", "empresa cargadora") only occur in the CompanyProfile onboarding
  picker, which is a business-type self-classification, **not** the DeCA parties — left unchanged.
- Resolution (D-114): new `lib/deca/roles.ts` (`DECA_ROLES`) as the single source for the
  Spanish-only surfaces (PDF, correction-diff labels, zod messages) + a `t.legal.roles` group in all
  8 i18n dictionaries for translated UI. Wired `lib/pdf/deca-document.tsx`, `lib/deca/detail.ts`,
  `lib/deca/schema.ts`, `lib/deca/validate.ts`, `components/deca/doc-summary.tsx` (fixed a real
  asymmetry — the shipper card said "Empresa que contrata el transporte", the carrier
  "Transportista efectivo"). Deliberately did NOT mechanically rewrite ~50 SEO prose lines or the
  short-form table headers ("Cargador"/"Transportista"), per the issue's own "no mechanical
  substitution" instruction — those are natural short forms in context, not the old incorrect phrases.
- Commits: `<pending>` on `develop`.
- Verification: 142 unit (3 new in `deca-roles.test.ts`; `deca-diff.test.ts` label updated to the
  new intentional wording) + typecheck + prettier green. e2e + a real generated-PDF eye check
  pending local Docker.
- Replies: beat 1 pending.

### I-059 — #59 Mandatory complete company + contact data · P0 · **worked, on `develop`**
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/59
- Resolution (D-115): soft-gate approach (user decision). New signups must give the full ficha
  (name, CIF/NIF with a valid control character, contact person, phone, email, address, postal code,
  town); an invalid own CIF is a hard block (`isValidOwnNif` wrapping `checkNif`), while the DeCA
  wizard's counterparty NIF stays a soft warning. Postal code + town became their own `Company`
  columns (`postal_code`, `city`) + `data_completed_at`. Existing companies are handled by the soft
  gate: `POST /api/deca` returns 409 `company_data_incomplete` for an authed create until the ficha
  is complete, `/panel/empresa` shows a "Completa los datos de tu empresa" step — login and
  `/d/[token]` are never blocked. Shared `companyDataSchema` now backs the register /
  complete-company / profile routes (they each had their own before).
- Commits: `c182ba0` (foundation), `<pending>` (wiring) on `develop`. Migration
  `20260907150000_company_full_ficha_fields` — applied to local dev; **needs `prisma migrate deploy`
  on production** (D-112 pattern).
- Verification: 154 unit + typecheck + prettier; 2 new e2e specs (`registro-company-data`,
  `panel-company-completeness`) 11/11; the ~29 existing e2e `register()` call sites updated to send
  the full ficha (`B12345675` → the valid `B12345674`). Full e2e run <pending>.
- Deferred: `complete-company-form.tsx` (Google step 2) still hardcodes ES strings — an i18n pass is
  a follow-up, not #59 scope.
- Replies: beat 1 pending.

### I-062 — #62 Superadmin lifecycle · P0 · **DONE, on `main`** (D-116/D-117/D-121/D-127)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/62
- Resolution: part 1 (D-116, `713bc31`) — `AccountStatus` enum on `User`/`Company` (migration
  `20260907170000`), `getCurrentSession()` + `login()` reject a suspended user/company. Part 2
  (D-117) — `lib/admin/lifecycle.ts` + `anonymize.ts` (in-place PII overwrite, never deletes a row /
  DeCA / audit row — D-067), `PATCH /api/admin/{empresas,usuarios}/[id]` (`getInternalUser` → 404,
  then `requireStepUp` → 401), new `/admin/usuarios/[id]` page + `<AccountActions>` (first
  client-interactive `/admin` component) + status badges on the list pages. `/d/[token]` untouched —
  a blocked company's DeCA stays verifiable.
- Gap fix (D-127, on `main`): the `edit` action existed in the API from D-117 but no UI called it —
  the detail page was read-only. New `components/admin/company-edit-form.tsx` (8-field disclosure,
  step-up aware, surfaces the 422 on a bad CIF/NIF). This is the superadmin escape hatch #59's D-123
  fix assumes. `admin-account-lifecycle.spec.ts` "edit the ficha" added.
- Migration `20260907170000` **applied to production** (D-121). Beat-1 commented.
- Verification: 172 unit + `admin-account-lifecycle.spec.ts` 4/4 + `account-status.spec.ts` 2/2 +
  22/22 admin e2e + compliance 8/8.
- Deferred: `t.admin.*` i18n (the whole admin area is ES-only server components by convention).
### I-063 — #63 Visible support + legal-assistance channels · P1 · **DONE, on `develop`** (D-118)
- `/panel/ayuda` (técnico + jurídico separated), "Ayuda" nav tab + account-menu link,
  `lib/support/channels.ts`, `BRAND` whatsapp/hours empty-by-default, JSON-LD contactPoint,
  `t.panel.help.*` ×8. 3 unit + 2 e2e + full e2e green. Beat 1 posted. No production migration.
### I-060 — #60 Backup & restore of DeCA documents · P0 · **DONE, on `develop`** (D-119)
- `scripts/backup.mjs` (pg_dump + PDF bucket + age-encrypted tar) + `scripts/restore.mjs` (scratch
  only, refuses production) + `.github/workflows/backup.yml` (daily → S3-compatible store) +
  `docs/backup-and-restore.md` (RPO ≤24h / RTO ≤4h). DB-half restore-test EXECUTED + logged in
  07-release §6. Beat 1 posted. **User action:** create the object-store bucket + `age` key + repo
  secrets, then run the workflow once + a full restore-test (Storage half). No production migration.

### I-064 — #64 Subscription/billing model — DESIGN ONLY · P2 · **DONE, on `develop`** (D-120)
- `docs/design/billing-model.md` (models + state machine + invoicing + permissions + no-rework
  proof) + `lib/billing/plans.ts`. No schema, no migration, no UI. Beat 1 posted.

**Batch #59–#64: all six done on `develop`.** User decisions (2026-09-07): #59 soft-gate + hard CIF
block on own company; #60 GitHub Actions + external object store, RPO ≤24h; #62 states 1–3 built +
anonymize-in-place (no hard delete, D-067).

---

## Launch batch #69–#83 (triaged 2026-09-08)

### I-075 — #75 P0 Bug: "Soltero" in the PDF address · **DONE, on `main`** (D-129)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/75
- `province` was a mandatory free-text field + a fixed `{pc} {city} — {province}, {country}` template
  → junk in, junk printed. Fix: `province` optional across DeCA + saved-location schemas + wizard;
  new `formatLocationCityLine()` composes only informed parts, never a dangling separator, never a
  substitute. Historical payloads untouched. `deca-location.test.ts` (new) + validate + pdf-snapshot
  regressions. 180 unit + 19 DeCA e2e. No migration.



### I-068 — #68 Landing "Cada DeCA te cuesta menos tiempo" composition · P2 · **DONE, on `main`** (D-128)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/68
- Desktop void under the right-column Histórico block. Fix: left feature grid compacted to 3 cols
  of flat Sistema Vía cards; new `components/site/activity-snapshot.tsx` ("Tu actividad", aria-hidden
  product visual — not a decorative image) as a third right-column block; footer line tied to the
  grid with the 2px "línea" rule. Also fixed a pre-existing 768px header overflow (section nav
  `md:flex` → `lg:flex`) that had `landing.spec.ts:201` red on `main`.
- 172 unit + 14/14 landing e2e + nav-links + crear + launch-happy-path + compliance 8/8. No i18n,
  no schema. Beat-1 commented. Awaiting the user's live-verification close.
- Follow-up (D-128): fixed the `LanguageSwitcher` dropdown flying left across the viewport on
  mobile (`right-0` → `left-0`, it's not the rightmost header item); regression test added.

### I-067 — #67 Own visual identity — "Sistema Vía" · P1 · **DONE, on `main`** (D-125/D-126)
- Proposal approved 2026-09-07. Artifact: https://claude.ai/code/artifact/a275359c-16ff-4bbc-b25f-b4fd99a1e8f5 · spec `docs/design/sistema-via.md` · D-122…D-126.
- Done (`5848cb9` on `main`): tokens + Archivo/IBM Plex Mono, `components/ui/` system
  (Kicker/Pill/Button/Alert/EmptyState/Progress); site header, panel + admin nav, verify-email
  notice, historial table, company-profile-form, admin badges/tables/headers, wizard progress bar
  all migrated; mobile header framing fix (wordmark/CTA wrap, stray heading focus box).
- Beat-1 comment posted (ES). Awaiting the user's live-verification close.
- Deferred follow-ups (not blockers): `Card`/`DataTable` primitives + remaining panel cards,
  node-based wizard progress, admin i18n pass.

--- old triage note kept below ---
### (was) I-067 — needs direction
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/67
- A full design-system project: palette + functional colours, typography scale, grid/spacing,
  iconography, interaction/a11y states, reusable components, and a documented difference from
  Farvertrans — applied across nav, dashboard, forms, the DeCA flow, states/alerts, buttons,
  cards/tables, empty/confirmation screens, icons, mobile. Acceptance criteria require a **visual
  proposal approved before implementation**.
- Current state: there IS a token system (`app/globals.css` — `--color-primary #0b5cff`, Inter,
  simple radii) and `docs/design/IMPLEMENTATION-BRIEF.md`. #67 replaces the *look*, not the tokens'
  role.
- **This is the keystone** — #65 and #66 both say "reuse the general visual system / combine with
  the new DeCA Profesional identity", i.e. they depend on #67.

### I-065 — #65 Admin panel → Sistema Vía · P1 · **DONE, on `main`** (D-125/D-126)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/65
- `components/admin/ui.tsx` — `Badge` → tinted pill + hairline functional-colour border (tone API
  kept, every admin badge updates), `Table` → 2px ink header rule + uppercase headers, `PageHeader`
  → "Superadministración" kicker. `AccountActions` (#62) on `components/ui/` (`Button`, `Pill`).
  Destructive actions already a distinct group (#62). 21 e2e (admin / audit-log / company-logo) green.

### I-066 — #66 Generated DeCA — CMR-style numbered grid · P1 · **DONE, on `main`** (D-125/D-126)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/66
- `lib/pdf/deca-document.tsx` — each mandatory block is a numbered cell (1–8) with a filled-square
  badge, in the Sistema Vía colours. **Still a DeCA**, not a CMR. Every legal field kept; postal
  code + town in both location cells (#59). New `tests/unit/deca-pdf-snapshot.test.ts` locks the
  structure + every value. Full R-1…R-13 compliance suite + company-logo + build13 + launch-happy
  green. Mockup was the approved Sistema Vía artifact's "Documento generado" screen.
