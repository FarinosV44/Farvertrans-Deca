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
- Branches: integration branch `develop`; committing BUILD slices directly to `develop`. **`develop` and `main` are BOTH at `99791b3` (2026-09-12, D-235 — user's explicit instruction "yes push to main and apply") — fully in sync.** Carries D-226 (#128 fix) through D-234 (#134 fix): #128/#129/#130 (P1), #112/#119 corrections, #131 mobile UX fix, and #132/#133/#134 (P2 audit fixes). P2 findings #132/#133/#134 done this session; remaining P2 + all P3 audit findings NOT started — that's the next work. `git merge`/`checkout` commands were initially blocked by the Claude Code auto-mode permission classifier ("Modify Shared Resources") this session; the user approved and the merges (both #112 and #119, plus the pending #119 migration, plus this `develop`→`main` merge) proceeded normally. Product version is **0.3.0**; UI supports 9 locales incl. `pt`. No tag requested. **Production DB schema is current through D-235** (verified directly via `prisma migrate status` against production, not just trusted from docs — the prior "current through D-218" claim turned out to be wrong for one migration; see D-235) — **production APP CODE is still NOT redeployed** for any of D-202→D-234; still runs a pre-`cc82787` build reporting `0.2.0`. The user's next Hostinger redeploy picks up everything at once — **and needs the same targeted `contentItem.update` this session ran on dev** to refresh the live guide's already-seeded body (a plain redeploy does not do this — see D-210). **A third production DB credential was pasted in chat this session (D-235)** — the user said they will rotate it; the long-overdue DB password/anon-key rotation (flagged since D-158) is now the single most urgent outstanding item, not yet done.
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
| 5 Development | done (v1) | docs/sprints/sprint-1.md ✓, docs/sprints/sprint-2.md ✓, docs/05-test-points.md ✓ · BUILD 05–15 done — v1 released to main |
| 6 Documentation | pending | docs/architecture.md, docs/api/, docs/usage/ |
| 7 Release | pending | docs/07-release.md |
| 8 Website | n/a (site is in the main codebase) | — |

## Current position
- **D-239 — #112 ACLARACIÓN FINAL implemented: reverted the per-field `+` buttons and "Vincular
  carga y descarga" entirely, this session (2026-09-12), on the user's URGENT mid-session
  instruction. Full detail in `docs/decisions.md` D-239.** The definitive model is now a single
  "+ Añadir otro envío dentro de este DeCA" CTA that appends one completely independent envío block
  — nothing inherited/paired from any other shipment. Removed `shipmentKeepingUnload/Load`,
  `linkExistingPlaces`, the "Vincular" panel, `distinctPlaces`/`PlaceFields`/`RouteSide`, and
  `AddPlaceButton` — all D-214/D-229 work now superseded. #128's fix (D-226) remains valid
  unchanged. `tests/e2e/deca-multi-shipment.spec.ts` fully rewritten; `wizard-distinct-places.test.ts`
  deleted. Gate: tsc/eslint/prettier clean, 495/495 unit, 9/9 rewritten multi-shipment e2e + 19/19
  commercial-availability + 12/12 historico-redesign (both updated) + 20-test regression sweep, all
  green. Committed to `develop`, not yet pushed. **#119's ACLARACIÓN FINAL is next — also urgent,
  also supersedes this session's own D-230 work.**
- **D-238 — #136 [P2 audit finding] fixed: templates list "Usar" link now actually applies the
  template, this session (2026-09-12). Full detail in `docs/decisions.md` D-238.** `/crear?template=
  <id>` now applies once on mount via a shared `applyTemplate()` extracted from the dropdown's
  onChange. New e2e case verified red-then-green. **Also found and recorded, NOT fixed (out of
  scope): a pre-existing flake** — `wizard.tsx`'s draft PUT/DELETE are both fire-and-forget, and can
  race under parallel-worker load, occasionally restoring a stale draft. Gate: tsc/eslint/prettier
  clean, 500/500 unit unaffected, 6/6 `creator-v2.spec.ts` with `--workers=1`. Committed to
  `develop`, not yet pushed.
- **D-237 — #131 correction: the mobile Historial filter form still collided at 375/390/430px, this
  session (2026-09-12). Full detail in `docs/decisions.md` D-237.** D-231's own fix was wrong for 3
  of its 4 target widths: `app/globals.css` redefines `--breakpoint-sm: 360px` (not Tailwind's stock
  640px), so D-231's leftover `sm:grid-cols-3` tier was silently active at 375/390/430px the whole
  time, squeezing every field into ~97-116px columns — invisible to D-231's own bounding-box overlap
  test since a native date input's internal chrome overflows its cell without the OUTER box
  overlapping its neighbor. Removed the `sm:` tier entirely (single-column all the way to `md:`
  768px). Also normalized Transportista's `<select>` (`appearance-none` + custom chevron + matching
  `py-2`/`leading-[1.375rem]`) to byte-for-byte match Matrícula's `<input>` height, closing a
  cross-browser (Safari/iOS) risk the Chromium-only diagnostic couldn't itself observe. 3 new
  assertions added to the existing per-width e2e test, verified red-then-green via `git stash`. Gate:
  tsc/eslint/prettier clean, 500/500 unit unaffected, 12/12 `historico-redesign.spec.ts` + 16/16
  regression sweep. Committed to `develop`, not yet pushed.
- **D-236 — #135 [P2 audit finding] fixed: 3 routes standardized on the `{ error: { code, message
  } }` shape, this session (2026-09-12). Full detail in `docs/decisions.md` D-236.**
  `app/api/deca/draft`, `app/api/favorites`, `app/api/integraciones` returned plain-text error
  bodies against this project's own documented convention. Checked every client caller first — none
  depend on the old shape (consistency fix, not a live-bug fix, so no test-first red/green cycle
  applies). Gate: tsc/eslint/prettier clean, 500/500 unit unaffected, 5/5
  `favorites.spec.ts`+`deca-draft.spec.ts`. Committed to `develop`, not yet pushed.
- **D-235 — production migrations applied + `develop` merged to `main` through #134, this session
  (2026-09-12), on the user's explicit instruction. Full detail in `docs/decisions.md` D-235.**
  `prisma migrate status` run directly against production (temporary credential the user pasted in
  chat) found 3 pending migrations, not the 2 assumed from docs alone — the project card's "current
  through D-218" claim was wrong for `20260912120000_availability_capacity_type`. All 3 applied via
  `prisma migrate deploy`, confirmed "up to date" after. No new tables involved, so no RLS
  re-enrollment needed. `develop` (`99791b3`) fast-forwarded into `main` cleanly — `git diff main
  develop` empty after. Full gate re-run on `main`, clean, pushed. **Outstanding:** production APP
  CODE still not redeployed (separate Hostinger action); DB password/anon-key rotation is now the
  most urgent open item (a third live credential now sits in a chat transcript — user says they will
  rotate it, not yet done).
- **D-234 — #134 [P2 audit finding] fixed: `diffVersions()` now covers the `notes` field, this
  session (2026-09-12). Full detail in `docs/decisions.md` D-234.** `notes` had the same
  per-shipment override pattern as `tractorPlate`/`trailerPlate` and was written into `dataJson`,
  but the diff type/FIELDS/SHIPMENT_FIELDS never covered it — a notes-only correction showed as "no
  changes." Added the field to all 3 places. Gate: tsc/eslint/prettier clean, 500/500 unit (+2 new,
  test-first), 2/2 `doc-cockpit.spec.ts`. Committed to `develop`, not yet pushed.
- **D-233 — #133 [P2 audit finding] fixed: deleting a still-referenced `SavedLocation` now surfaces
  a clear error instead of failing silently, this session (2026-09-12). Full detail in
  `docs/decisions.md` D-233.** `deleteSaved()` now catches the Prisma `P2003` FK violation and
  throws a typed `SavedInUseError`; the route maps it to 409; the client's `remove()` now checks
  the response and shows the message via the existing error banner (previously ignored the response
  entirely). Gate: tsc/eslint/prettier clean, 498/498 unit unaffected, 5/5
  `datos-habituales-rutas.spec.ts` (4 pre-existing + 1 new). Committed to `develop`, not yet pushed.
- **D-232 — #132 [P2 audit finding] fixed: last-owner removal/demotion race in `lib/team.ts`, this
  session (2026-09-12). Full detail in `docs/decisions.md` D-232.** `removeMember()`/`changeRole()`
  checked "at least one owner remains" BEFORE the write transaction — two owners removing/demoting
  each other at the same instant could both pass the check and leave zero owners. New
  `countOwnersLocked()` moves the check inside the transaction with a `SELECT ... FOR UPDATE` row
  lock. New e2e test fires both removals concurrently via `Promise.all`, confirmed RED (both 200,
  0 owners) before the fix, GREEN after (exactly one 200 + one 422). Gate: tsc/eslint/prettier
  clean, 498/498 unit unaffected, 12/12 `team.spec.ts`. Committed to `develop`, not yet pushed.
  **First of the P2/P3 audit findings; continuing through the rest.**
- **D-231 — #131 [mobile UX] fixed: Historial filter grid + mobile card actions, this session
  (2026-09-12). Full detail in `docs/decisions.md` D-231.** Filter `<form>`'s base grid was
  `grid-cols-2` at all 4 widths the user's report named (320-430px, all below Tailwind's `sm:` 640px
  breakpoint) — changed to `grid-cols-1` + `min-w-0` on each field wrapper/control, fixing the
  overlap. Mobile card's "Inspección" link moved out of `<RowMenu>` to sit directly beside Ver
  detalle/Compartir, mirroring the desktop table (which already had this arrangement) —
  Corregir/Duplicar/PDF stay inside `<RowMenu>`. Layout-only: no filter logic, query params,
  `<RowMenu>`/`<RowShare>` behaviour changed. Gate: tsc/eslint/prettier/keel-verify clean (2
  pre-existing unrelated warnings only), 498/498 unit unaffected, 12/12 `historico-redesign.spec.ts`
  (4 pre-existing + 8 new, one per width × 2 checks) + 3/3 `export-csv.spec.ts`, plus a 30-test
  regression sweep (`workspace.spec.ts`'s `/panel/historico` a11y scan, `panel-nav`, `row-share`,
  `team`, `master-data`, `driver-delivery`) all passing unchanged. Test-first verified red-then-green
  via `git stash`. Committed to `develop`, not yet pushed. **Issue #112/#119 corrections and this
  mobile fix are the full "make the corrections, then this fix" request — now complete. Moving to
  the P2/P3 audit findings next.**
- **D-230 — #119 correction implemented: postal-code-based matching + 4 new vehicle types for
  DECA Conecta, this session (2026-09-12). Full detail in `docs/decisions.md` D-230.** New additive
  migration (3 nullable columns on `DecaAvailabilityShare`); `VehicleType` expanded to 6 values +
  new `isVehicleType()` guard (replacing 3 scattered inline checks); `postalCodesMatch()`/
  `zonesMatch()` prefer postal code when both sides of a comparison have one, falling back to the
  existing free-text matching otherwise — safe for pre-correction rows with no postal code.
  `VehicleTypePicker` now takes a `labels` map instead of hardcoded props (adding a 7th type later
  is one map entry) + an "otro" free-text field; also fixed a pre-existing type duplication
  (`capacity-vehicle-picker.tsx` now imports `VehicleType`/`CapacityMode` from
  `lib/commercial/types.ts` instead of re-declaring them). New i18n keys in all 9 locales. Never
  touches the DeCA or its PDF. Gate: tsc/eslint/prettier/keel-verify/prisma-validate clean,
  production build clean, 498/498 unit (+10 new), 19/19 e2e in `commercial-availability.spec.ts`
  (15 pre-existing confirmed unaffected + 4 new) + 38/38 in `commercial-consent.spec.ts`. Committed
  to `develop`, not yet pushed. **Both #112 and #119's corrections are now implemented — moving to
  the user's mobile Historial UX request, then P2/P3 audit findings.**
- **D-229 — #112 correction implemented: "Vincular carga y descarga" linking panel, this session
  (2026-09-12). Full detail in `docs/decisions.md` D-229.** Traced the existing per-row `+` handlers
  first and confirmed no cartesian-product risk and 1×N/N×1 auto-pairing already worked correctly
  (verified against the pre-existing, already-green e2e test) — so this was scoped as a small,
  additive feature rather than a wizard data-model rewrite, avoiding the largest risk for a feature
  this close to legal-document generation. New pure `distinctPlaces()` + a new linking panel
  (appears only once both load/unload sides have 2+ distinct places), new i18n keys in all 9
  locales. Zero changes to the payload builder, schema, PDF renderer, templates, or correction
  preload. Gate: tsc/eslint/prettier/keel-verify clean, 488/488 unit (+5 new), 27/27 e2e (13
  pre-existing multi-shipment tests confirmed unaffected + 5 new + the creator suite). Committed to
  `develop`, not yet pushed. **#119's correction (postal-code matching + expanded vehicle types)
  queued next; not started.**
- **D-228 — #130 [P1] fixed: added the missing `Deca` table indexes, this session (2026-09-12).
  Full detail in `docs/decisions.md` D-228.** `@@index([companyId, createdAt])` +
  `@@index([createdByUserId])` — confirmed a real omission (other models in the same schema already
  carry the identical pattern). New hand-written migration
  `prisma/migrations/20260912140000_deca_query_indexes/` (the local shadow DB can't apply D-186's
  RLS migration cleanly, same pre-existing issue D-203 hit — CI uses `migrate deploy`, unaffected).
  Applied to local dev DB, verified directly via `psql \d deca`. No automated test (pure DB-structure
  change; this project has no integration tier touching a real DB) — recorded as an honest gap, not
  claimed as covered. Gate: tsc/eslint/prettier/keel-verify/`prisma validate` clean, 483/483 unit
  (unchanged), broader e2e regression green (one `master-data.spec.ts` failure reproduced as the
  documented parallel-contention flake, confirmed clean in isolation, unrelated to `Deca`).
  Committed to `develop`, not yet pushed. **All P0/P1 findings from the audit (#123–#130) are now
  fixed** — only P2/P3 findings remain, none started.
- **D-227 — #129 [P1] fixed: `POST /api/team/invites` is now rate-limited, this session
  (2026-09-12). Full detail in `docs/decisions.md` D-227.** Mirrors `app/api/support/route.ts`'s
  exact pattern — `checkAbuse("share", ...)` + `abuseResponse()` right after the auth check, before
  any DB write. Test-first: new `tests/unit/team-invites-rate-limit.test.ts` (2 cases, imports the
  real route handler directly since the e2e suite structurally can't exercise rate-limiting),
  blocking case observed red before the fix. Gate: tsc/eslint/prettier/keel-verify clean, 483/483
  unit (+2 new), `team.spec.ts` 11/11 + `membership.spec.ts` 6/6. Committed to `develop`, not yet
  pushed.
- **Mid-#128, the user asked to re-read the newest comments on #112/#119 (2026-09-12) before
  continuing, since they carry substantial UX corrections to multi-shipment creation and DECA
  Conecta matching.** Read both in full. **#112's correction** (a "paradas"/stops model with
  per-side `+` buttons, a linking UI for many-loads×many-unloads, explicit no-cartesian-product
  requirement) reconfirms "tractora; remolque" stay DeCA-level data — consistent with, not
  contradicting, D-226 below. **#119's correction** (postal-code-based zone/destination matching,
  6 new vehicle types incl. `OTRO` with a free-text specify field) doesn't touch the DeCA schema at
  all. **Neither correction was implemented this session** — both are substantial, separate feature
  work, out of scope for this audit-fix pass; flagged to the user, not started.
- **D-226 — #128 [P1] fixed: vehicle plate rejected as a per-shipment override once a DeCA has more
  than one shipment, this session (2026-09-12). Full detail in `docs/decisions.md` D-226.**
  `canonicalSchema`'s `superRefine` now rejects a per-shipment `tractorPlate`/`trailerPlate`
  differing from the DeCA-level default when `shipments.length > 1` (single-shipment unaffected —
  no ambiguity there). Verified consistent with the #112/#119 corrections above before finishing.
  Test-first: 4 new cases in `deca-schema-shipments.test.ts`, 2 observed red before the fix; found
  and adjusted one existing test that had been demonstrating override-precedence using the exact
  field this fix now restricts (swapped to `notes`). Gate: tsc/eslint/prettier/keel-verify clean,
  481/481 unit (+4 new), 23/23 targeted e2e (`deca-multi-shipment`, `crear`, `creator-v2`).
  Committed to `develop`, not yet pushed.
- **D-224 — #127 [P1] fixed (user-scoped): the one confirmed PII-in-logs leak, this session
  (2026-09-12). Full detail in `docs/decisions.md` D-224.** Asked the user to choose between a
  full `pino` migration and a minimal fix; **user chose minimal.** `lib/mailer.ts`'s provider-error
  log no longer leaks a raw recipient email echoed back by Resend — redacted via new
  `redactPii()` (`lib/text/redact.ts`), extracted (not duplicated) from the already-tested regex in
  `lib/deca/generation.ts`'s `safeErrorSummary()`, which now calls the shared helper too. **Recorded,
  not fixed:** this project's actual logging convention is console + per-site redaction, not
  `pino` as `.claude/rules/code-style.md`/`docs/03-technical-plan.md` claim — those files still need
  correcting (flagged, not done in this slice); no centralized redaction enforcement exists, a new
  log call site must remember to apply `redactPii()` itself (accepted risk, user's explicit choice).
  Test-first: 4 new `text-redact` cases (extraction, verified byte-identical) + 1 new `mailer` case,
  observed red by temporarily stashing the fix. Gate: tsc/eslint/prettier/keel-verify clean,
  477/477 unit (+5 new), `reliability.spec.ts` 7/7 + `register-loading-state.spec.ts` 1/1. Committed
  to `develop`, not yet pushed.
- **D-223 — #126 [P1] fixed: CSV history export now neutralizes formula/CSV-injection characters,
  this session (2026-09-12). Full detail in `docs/decisions.md` D-223.** `csvField()` prefixes a
  leading `=`/`+`/`-`/`@` with `'` (the standard "force text" convention) before RFC 4180 quoting.
  Test-first: 2 new cases in `tests/unit/deca-export.test.ts`, observed red before the fix. Gate:
  tsc/eslint/prettier/keel-verify clean, 472/472 unit (+2 new), `export-csv.spec.ts` 3/3. Committed
  to `develop`, not yet pushed.
- **D-222 — #125 [P1] fixed: `/d/[token]`'s 404 path now calls the `d_404` abuse policy that was
  declared but never wired in, this session (2026-09-12). Full detail in `docs/decisions.md`
  D-222.** `notFound()` now calls `checkAbuse("d_404", ...)` — 429 at the hard tier, never a
  CAPTCHA (no UI to answer one here, and a real inspector must always get through per
  security.md/T-3); a successful document fetch is never checked. New
  `tests/unit/d-token-rate-limit.test.ts` (4 cases, imports the real route handler directly since
  the e2e suite runs with `FVD_DISABLE_ABUSE_CHECKS=1` and structurally cannot exercise
  rate-limiting), 2 observed red before the fix. Gate: tsc/eslint/prettier/keel-verify clean,
  470/470 unit (+4 new), 39/39 targeted e2e regression (`compliance`, `driver-delivery`,
  `launch-gate` incl. token-entropy + cross-tenant checks, `seo-regression`). Committed to
  `develop`, not yet pushed.
- **D-221 — #124 [P1] fixed: team invite tokens now bound to the invited email in all 3
  redemption paths (`signup()`/`completeCompanyForUser()` in `lib/auth/index.ts`, `acceptInvite()`
  in `lib/team.ts`), this session (2026-09-12). Full detail in `docs/decisions.md` D-221.** New
  `"invite_email_mismatch"` error code (both `AuthError` and `TeamError`); a redemption whose
  account email doesn't match the invite's is rejected before any membership write. Test-first: 2
  new e2e cases in `team.spec.ts`, both observed red (attacker actually joined the target company)
  before the fix. **Real pre-existing test bug found and fixed along the way:** an existing
  `team.spec.ts` test invited one random email but registered a different one — it was unknowingly
  relying on the exact hole this fix closes; fixed to reuse the same email for both steps. Gate:
  tsc/eslint/prettier/keel-verify clean, 466/466 unit (unchanged), `team.spec.ts` 11/11,
  `membership.spec.ts` 6/6, targeted `commercial-consent.spec.ts` cases, `auth-entrypoints.spec.ts`
  + `register-duplicate-race.spec.ts` green. Committed to `develop`, not yet pushed.
- **D-220 — #123 [P0] fixed: removed the `FVD_HASH_SECRET` insecure-fallback pattern from
  `lib/auth/session.ts`/`lib/hash.ts`/`lib/abuse/challenge.ts`/`lib/admin/backup-password.ts`/
  `lib/auth/oauth-state.ts`/`lib/auth/webauthn-challenge.ts`, this session (2026-09-12). Full detail
  in `docs/decisions.md` D-220.** New shared `requireHashSecret()` (`lib/env.ts`, throws if
  missing/<16 chars, no fallback); new `instrumentation.ts` calls `getEnv()` at boot (nodejs runtime)
  so a misconfigured deploy now fails closed instead of silently serving with a publicly-known
  secret — verified end-to-end with a real `next start` run (every request 500s when the var is
  empty, confirmed by log + curl, not just a unit assertion). New `tests/unit/setup-env.ts`
  (vitest `setupFiles`) gives unit tests a valid test secret, since Vitest never loaded `.env` and
  11 existing tests across 4 files were silently depending on the removed fallback. Test-first:
  `tests/unit/hash-secret-required.test.ts`, 8 cases, observed red (7/8) before the fix, green after.
  **Gate: tsc/eslint/prettier/keel-verify clean, 466/466 unit (+8 new), production build clean,
  39/39 targeted e2e regression** (`admin-2fa`, `admin-account-lifecycle`, `admin-passkey`,
  `auth-ux`, `auth-entrypoints`, `register-duplicate-race`, `register-loading-state` — incl. the
  previously-flaky recovery-code-replay test, green this run). `docs/api/INDEX.md` updated.
  **Separate pre-existing gap noticed, not fixed (out of scope):** `docs/reference/lib.md` and
  `docs/reference/endpoints.md`, which nearly every INDEX.md row points to, do not exist anywhere in
  the repo — `docs/api/` contains only `INDEX.md`. Predates this session. Committed to `develop`,
  not yet pushed/merged — next action closes #123 with a comment once pushed.
- **Full repository code-review / regression audit, this session (2026-09-12), requested by the
  user independently of any single issue.** Scope: architecture/data flow, DB schema/Prisma/
  migrations, auth/authz/tenant isolation, superadmin, all DeCA creation flows (single +
  multi-shipment), PDF/QR/public URL/inspection mode, versioning, history/search/CSV/templates/
  habitual data, team/company/support/errors, responsive/a11y/i18n, API routes/validation,
  security, dead code/performance. Full validation suite run and clean: `tsc`/`eslint`/`prettier`/
  `keel-verify`, **458/458 unit**, production build, **366/368 e2e** (the 1 failure is the
  pre-existing documented `admin-2fa.spec.ts` recovery-code-replay flake, confirmed against
  `docs/lessons-learned.md` — not a regression); `npm audit` found 4 known transitive-dependency
  vulnerabilities (2 low/1 moderate/1 high, `@supabase/auth-js` + `postcss` via `next`, both fixes
  are breaking-change bumps — tracked as technical debt, not opened as issues). Executed as 7
  parallel independent read-only review passes; cross-checked against `docs/lessons-learned.md`/
  `docs/decisions.md` for regressions on past incidents (#94 RSC-IDOR, D-163 membership, D-205/
  D-206 multi-shipment mirroring, D-187 QR overlap — all confirmed still correctly fixed).
  **Per "Issue capture: on", the P0/P1 findings were opened as forge issues #123–#130 before any
  fix work** — full detail per issue in `docs/issues.md`'s new "Full code review / regression
  audit" section: #123 (P0, `FVD_HASH_SECRET` fallback to a hardcoded public string, unenforced at
  boot — session-forgery risk), #124 (P1, team invite not bound to the invited email), #125 (P1,
  `/d/[token]` rate-limiting declared but never wired in), #126 (P1, CSV export formula-injection),
  #127 (P1, no centralized logging/redaction framework — `pino` is documented but not actually a
  dependency), #128 (P1, multi-shipment PDF can omit a per-shipment plate override the schema still
  accepts), #129 (P1, no abuse control on `POST /api/team/invites`), #130 (P1, `Deca` table has no
  supporting indexes for its actual query patterns). The full structured report (P0–P3 findings,
  security findings, data-integrity risks, missing tests, UX/responsive regressions, technical
  debt, areas reviewed with no issues found, prioritized fix plan) was delivered to the user
  in-conversation, not duplicated into `docs/`. **No code changed by the audit itself — none of
  #123–#130 started yet.**
- **D-216 — I-122: Superadmin can correct a company's razón social/CIF-NIF safely, this session
  (2026-09-12). Full detail in `docs/decisions.md` D-216.** Extended the existing #62 ficha editor
  rather than building a new tool: added a pre-save duplicate-CIF/NIF warning (never a hard block,
  matching D-162's existing philosophy), a real old→new audit trail (the DB column existed but was
  never read/written for this action), and client-side confirm-on-NIF-change + Cancel. Found and
  fixed a real regression risk: 45 e2e spec files share one hardcoded fixture NIF, which would have
  false-positive-triggered the new duplicate check against an existing lifecycle test — fixed by
  updating that one test to use the new `confirmDuplicateNif` override rather than weakening the
  check. Opened as issue #122 (after most of the work — a process deviation, noted). **Gate:
  tsc/eslint/prettier clean, 444/444 unit, 9/9 new e2e + 11/11 + 19/19 regression green.** Committed
  directly to `develop`, merged fast-forward to `main` this same session.
- **D-214 — I-112 REWRITTEN by the user, superseding D-205/D-206: `+` buttons replace the toggle,
  this session (2026-09-12). Full detail in `docs/decisions.md` D-214.** Worked on its own branch
  `feat/112-plus-button-shipments`, PR #120 into `develop`, per the user's explicit "separate
  branch/PR per issue, do not merge" instruction — held open, CI green, until the user's later
  explicit instruction this same session to merge both #112 and #119 into `develop`/`main` (see
  D-218). No data-model or migration change (the existing `DeCA 1─N shipments` JSON model already
  matched). Wizard rewrite: no toggle, `+` icon buttons beside "Lugar de carga"/"Lugar de descarga"
  (shipment 1 and every extra envío), inheriting the opposite side with zero cartesian-product risk
  (one press = exactly one new envío). Vehicle now strictly DeCA-level (client no longer sends a
  per-shipment override; PDF shows it once when multi). Weight's bare-number default changed from
  tonnes to **kg** (trailing request, same PR) — de-risked by confirming zero e2e fixtures relied on
  the old default. Real mid-build fix: the extra-shipment render was gated to the wrong step
  (`step===2`, should be `step===1` where the `+` buttons actually are) — moved so pressing `+`
  shows the new block immediately. **Gate: tsc/eslint/prettier clean throughout, 444/444 unit, 9/9
  new e2e + 4/4 + 29/29 regression green** (one contention flake under 5-file parallel load,
  confirmed clean in isolation and on repeat). Pre-implementation comment posted on #112 per its own
  requirement.
- **D-217 — I-119: DECA Conecta expanded (zona/destino preferente, capacidad, tipo, edit, v1
  matching), this session (2026-09-12). Full detail in `docs/decisions.md` D-217.** Worked on its own
  branch `feat/119-conecta-availability` (off `develop`), per the same "separate branch/PR per
  issue, don't merge" instruction as #112 — held open, CI green, until the user's later explicit
  instruction this same session to merge both #112 and #119 into `develop`/`main` (see D-218).
  Additive-only Prisma migration (6 nullable/defaulted columns on `DecaAvailabilityShare`, RLS
  already enabled on the table from its original migration — adding columns needs no re-enrolling).
  `lib/commercial/availability.ts` rewritten: `DecaFacts` now carries every shipment so a multi-envío
  DeCA (#112) can name its "descarga final" for Conecta purposes only; "Grupaje" requires positive
  metros+kg or the whole record is rejected; new `expiryStatus()` (computed at read time, never
  stored) and `updateAvailabilityShare()` (first real edit capability); new
  `findCompatibleAvailabilities()` — a v1 matching proposal since no demand-side inventory exists
  yet, cross-matching against other companies' own pending availability records, anonymised. Wizard
  section redesigned (zona rename, destino preferente, camión completo/grupaje + LONA/FRIGORÍFICO
  accessible card pickers — shared between the wizard and the new edit UI — 3 new icons, live
  summary line, privacy copy). **Gate: tsc/eslint/prettier clean, 458/458 unit, 15/15 new e2e +
  23/23 `commercial-consent` regression + 13/13 broader sweep green.** Pre-implementation comment
  posted on #119 per its own requirement.
- **D-218 — user explicitly instructed merging #112 and #119 into `develop`/`main` this session
  (2026-09-12), overriding the earlier "leave both PRs open, don't merge" instruction.** Merged
  `feat/112-plus-button-shipments` first (clean, no overlap with #122's direct-to-develop work),
  then `feat/119-conecta-availability` on top — the real conflict, since #119 was branched before
  #112 landed and both independently rewrote `components/deca/wizard.tsx`'s multi-shipment section;
  resolved by hand, keeping #112's `+`-button/no-toggle architecture and layering #119's
  commercial-share (zona/destino preferente/capacidad/tipo) fields on top unchanged. `docs/
  decisions.md`/`docs/PROGRESS.md` D-number collisions across the three branches (#112, #119, #122
  each independently used D-214/D-215 relative to their own branch point) resolved by renumbering to
  D-214/D-216/D-217 in final chronological-ish order, D-218 for this merge decision itself. Applied
  the pending #119 migration (`20260912120000_availability_capacity_type`) to the dev DB —
  purely additive, RLS unaffected (verified: the table's original migration already enables RLS with
  no per-column policies, so new nullable columns need nothing extra). Full gate re-run after both
  merges: tsc/eslint/prettier clean, 444/444 unit (post-#112), full sweep re-verified after #119
  (see the next test-point entries), then fast-forward merged `develop` into `main` and pushed both.
- **D-213 — I-118: branded incident page for 5xx / server-render errors, this session
  (2026-09-12), immediately after D-212. Full detail in `docs/decisions.md` D-213.** New
  `components/errors/incident-page.tsx` (shared branded screen, reuses the existing `Wordmark`/
  `.auth-ground` visual language — zero DB/network dependency). `app/error.tsx` rewritten to use
  it; new `app/global-error.tsx` (the ONLY boundary that catches a root-layout error — self-
  contained, no `LocaleProvider`/`getLocale()`/fonts). New copy in `es.ts`'s `errors` block
  (`incidentTitle`/`incidentMessage`/`retry`/`goHome`), mirrored in all 8 other locale dictionaries
  since `Messages = typeof es` and each asserts `satisfies Messages` — content-only, these
  boundaries still only ever import `es.ts` directly. Deliberately built NO maintenance-mode system
  (none existed, issue forbids inventing one) and reused NO correlation-ID (the #29 DeCA-generation
  one is DB-backed and scoped to a different problem). **Found and fixed a real Next.js routing bug
  while building the e2e test seam:** `app/_test/error-boundary/` (leading underscore) is a Next.js
  "private folder" excluded from routing entirely — the route silently 404'd regardless of the env
  flag; moved to `app/test-only/error-boundary/`, confirmed working. New
  `tests/e2e/error-pages.spec.ts` (3/3 green) exercises a REAL server-render throw, not a mocked
  response. `global-error.tsx` has no automated coverage (no jsdom in the unit setup, and an
  env-gated root-layout throw is unsafe to ship) — verified manually instead with a temporary,
  uncommitted header-gated throw + a real production-build screenshot, then fully reverted
  (`git diff app/layout.tsx` empty before commit). **Gate: tsc/eslint/prettier clean, 444/444 unit,
  3/3 new e2e + 30/30 regression e2e (`workspace.spec.ts` + `seo-regression.spec.ts`) green.**
- **D-212 — I-117: Historial row vertical alignment fix, this session (2026-09-12), immediately
  after D-211. Full detail in `docs/decisions.md` D-212.** Direct user report (follow-up to #114):
  rows felt top-aligned/cramped once a cell wrapped onto multiple lines. Root cause: the `<tr>`
  carried `align-top`, cascading to every `<td>` — none had its own vertical-align, and 5 of 6
  cells had NO vertical padding at all. Fix (CSS-only, zero data/logic change): `align-top` →
  `align-middle` on the row; uniform `py-4` added to every cell; `pr-3` → `pr-4` on every column
  (header AND body, kept in sync to avoid a header/body column-width mismatch). **Verified for
  real**, not assumed: a temporary uncommitted script rendered a real DeCA with deliberately long
  shipper/carrier names against a genuine production build and screenshotted the actual result —
  confirmed the status badge/plate/actions now sit centered against the wrapped content, not
  pinned to the top; screenshot deleted after inspection. **Gate: 444/444 unit (no new — CSS-only),
  tsc/eslint/prettier clean, full targeted e2e regression sweep 17/17 green** (incl. the mobile
  card test, confirming mobile — a flex layout with no vertical-align concept — was correctly
  unaffected; incl. the a11y scan). Ready to commit/push.
- **D-211 — I-116: Portuguese (`pt`) added as a 9th UI locale, this session (2026-09-11),
  immediately after D-210. Full detail in `docs/decisions.md` D-211.** New
  `lib/i18n/dictionaries/pt.ts` (European pt-PT, `satisfies Messages`) + `pt` added to
  `LOCALES`/`LOCALE_NAMES`. **Real wiring surface was 6 files, not the 2 the issue's own scope
  named** — investigation found `lib/i18n/server.ts`, `lib/i18n/client.tsx`, and the hand-kept
  client-safe `lib/i18n/header-strings.ts` slice (#96/D-172) all needed an explicit `pt` entry;
  `tests/unit/header-strings.test.ts` needed `pt` in its own `FULL_DICTS` too. `LanguageSwitcher`,
  `/api/i18n/locale`, and `relativeTime()` confirmed to need NO changes — all three already derive
  from `LOCALES` generically. The ~1000-line translation itself was delegated to a subagent
  (self-verified via tsc/eslint before reporting), then INDEPENDENTLY re-verified — spot-read
  multiple sections, confirmed every function-valued key's logic preserved. **One real
  discrepancy found by this cross-check, not by either tool:** `header-strings.ts`'s hand-written
  `pt.regulation` didn't byte-match `pt.ts`'s own `nav.regulation` — fixed. **Gate: 444/444 unit
  (+1 — the 9th locale extends an existing parameterised test), tsc/eslint/prettier/keel-verify
  clean, i18n-header/landing e2e specs green** (1 pre-existing unrelated `test.fixme` skip in
  each, confirmed unrelated). New e2e test proves `pt` end-to-end: selectable in the switcher,
  updates the header live, AND a full dynamic-page load renders real Portuguese content (not just
  the header slice). **PUSHED to `develop` AND `main`** (commit `abfca16`). **#112 through #116 are
  now ALL complete — no issue is
  currently queued.**
- **D-210 — I-115: Guía de uso updated + v0.2.0 → v0.3.0 release closeout, this session
  (2026-09-11), immediately after D-209. Full detail in `docs/decisions.md` D-210.** Version
  bumped in the single mechanical source (`package.json` + `lib/version.ts`, cross-checked by
  `scripts/keel-verify.mjs` — confirmed `version in sync (0.3.0)`). New lightweight
  `docs/CHANGELOG.md` (none existed before). Guide (`prisma/content/guia-de-uso.ts`) updated with
  a new "Varios envíos en un mismo DeCA" section (#112) and rewritten Historial/Datos habituales
  sections matching D-209/D-207/D-208's real redesigns — deliberately did NOT do the issue's
  suggested full top-level reorder (confirmed with the user via the plan approval), since the
  current "Paso 1/2/3" structure already mirrors the real wizard and a reorder would have churned
  every anchor/cross-link for a cosmetic change. **Real finding, not originally scoped:** editing
  the guide's TS constant alone does NOT update an already-seeded `ContentItem` row —
  `seedContent()` is create-only-if-absent. Fixed via a targeted `contentItem.update` (temporary,
  uncommitted script, deleted after use) mirroring the exact D-201c precedent for this same row —
  same id, same status, same total row count before/after. **Production needs the identical
  targeted update at deploy time** — a plain redeploy will NOT refresh the live guide's body.
  All screenshots regenerated for real via the existing automated `scripts/guide-screenshots.mjs`
  against a genuine production build (confirmed `/health` → `"version":"0.3.0"` first); found and
  fixed a real capture-tool bug along the way (a too-tall element screenshot baked the sticky
  header into the composite) for the one new capture, `crear-multi-envio.png`. **Gate: 443/443
  unit (no new — content/config/scripts only), tsc/eslint/prettier/keel-verify clean, guide e2e
  suite 4/4 green (run twice, once via Playwright's own properly-managed server per this
  session's own lessons-learned rule), the one affected `admin.spec.ts` test green.** **PUSHED to
  `develop` AND `main`** (commit `12a5760`). **I-115 complete — this was the LAST issue in the
  user's explicitly-ordered queue
  (#112→#115); all four are now done.**
- **New issue #116 opened this session** (Portuguese `pt` as a supported UI language, per the
  user's explicit request) — motivated by this session's own D-202 incident. Scoped to the
  existing 8-locale dictionary pattern; editorial content and legal pages excluded per D-002/D-072.
  Not started.
- **Production migration gap check (2026-09-11), before starting I-114:** confirmed no gap other
  than D-207's `saved_shipment` migration, applied it directly to production, verified RLS enabled
  (`relrowsecurity: true`) and 0 rows. Production DB schema is now current through D-208; app code
  still needs the user's Hostinger redeploy.
- **D-209 — I-114: Historial visual redesign, this session (2026-09-11), immediately after D-208.
  Full detail in `docs/decisions.md` D-209.** Results area restyled (desktop stays a real
  `<table>`, mobile stays cards) — route as the dominant line, shipper/carrier micro-labels, a
  status+version badge cluster, multi-envío extra-route summaries (new `HistoryRow.extraRoutes`,
  pure helper in new `lib/data/history-routes.ts`). New `RowMenu` (`components/deca/row-menu.tsx`)
  "···" overflow menu for Corregir/Duplicar/PDF (mirrors `RowShare`'s popover but adds
  keyboard/Escape support). Filtered vs. genuinely-empty empty states. Filter LOGIC completely
  untouched — verified by re-running 7 pre-existing e2e specs unmodified, all green. **Real bug
  found via the new e2e test and fixed by REMOVING a planned feature:** a route-level
  `loading.tsx` (Suspense skeleton, planned per the issue's own §12) silently broke same-route
  `<Link>` clicks that only change search params — the "Limpiar filtros"/"Limpiar" links stopped
  navigating (RSC fetch self-aborted). Isolated via controlled A/B (removing only that file fixed
  it), confirmed not a pre-existing bug this session introduced elsewhere, then removed entirely
  rather than worked around — full account in `docs/lessons-learned.md`. **Gate: 443/443 unit
  (+4 new), tsc/eslint/prettier/keel-verify clean, full targeted e2e regression sweep 34/34
  green.** **PUSHED to `develop` AND `main`** (commit `d1fd931`). **I-114 complete — #115 now fully
  unblocked** (#112/#113/#114 all
  done).
- **D-208 — I-113 Phase 2: Datos habituales visual redesign, this session (2026-09-11), immediately
  after D-207 (user: "continue"). Full detail in `docs/decisions.md` D-208.** Tabbed redesign
  (`components/app/saved-data-manager.tsx`, rewritten in place, export renamed
  `DatosHabitualesManager`) covering all 4 kinds now that Rutas exists: global search, compact
  summary counts, a "+ Añadir dato habitual" menu, `role="tablist"` tabs, and a new `Modal` overlay
  (`components/app/modal.tsx`, extracted from the command palette's existing pattern) replacing the
  old `<details>` "Añadir". New Rutas tab reuses `savedShipmentLabel()` (now exported from
  `wizard.tsx`); its form has no free-text location fields, only 2 selects over already-saved
  places. **3 scope decisions confirmed with the user beforehand** (AskUserQuestion, all
  "Recommended"): no wizard deep-link pre-select for "Usar" (the existing pickers already cover it);
  a real Modal for creation (not just restyling `<details>`); client-side duplicate detection
  (`lib/data/saved-dedup.ts`, new, pure, 10 unit tests) shown as a non-blocking warning. **2 real
  bugs found and fixed before shipping, not originally scoped:** (1) conditionally mounting only the
  active tab left the other 3 tabs' `aria-controls` pointing at a nonexistent id — an
  `aria-valid-attr-value` a11y violation; fixed by keeping all 4 panels mounted and toggling the
  `hidden` attribute instead (the correct WAI-ARIA tabs pattern). (2) `/panel/datos#rutas` (and the
  pre-existing `#empresas`/`#vehiculos`/`#lugares`, which #93's quick-actions catalogue links to
  directly) didn't actually open that tab — reading `location.hash` inside `useState`'s lazy
  initializer looked right but never won out over Next.js's SSR reconciliation; fixed with the
  standard pattern (SSR-safe default + a `useEffect` correcting it post-mount). Also: `#93` gains a
  4th `rutas` quick action (D-156's "no such destination exists" premise is now false, superseded by
  fact — not re-litigated); `FavoriteStar`'s type was missing the `"shipment"` kind (blocked starring
  a route from any UI, one-line fix). **A real environment trap along the way (now in
  `docs/lessons-learned.md`):** a manually-started `npm run dev` (leftover from an abandoned manual
  browser smoke-test) silently got reused by Playwright's `reuseExistingServer` instead of its own
  properly-configured `npm run build && npm run start` — missing `FVD_EXPOSE_RESET_TOKEN=1` meant
  every e2e registration's email verification silently no-opped, causing near-total, misleadingly
  generic test failures unrelated to the actual code. **Gate, confirmed complete: 439/439 unit
  (+10 new), tsc/eslint/prettier/keel-verify clean, targeted e2e regression sweep 34/34 green**
  (`datos-habituales-rutas.spec.ts` 4/4 new, `master-data.spec.ts` 2/2, `favorites.spec.ts` 1/1,
  `workspace.spec.ts` 7/7 incl. a11y, `saved-shipments.spec.ts` 2/2, `deca-multi-shipment.spec.ts`
  4/4, `crear.spec.ts` 9/9, `creator-v2.spec.ts` 5/5 — across two runs, 1 transient `ECONNRESET`
  confirmed a contention flake in isolation). **PUSHED to `develop` AND `main`** (commit `efe970c`).
  **I-113 is now FULLY complete (Phase 1 + Phase 2). Queued next:** #114, then #115.
- **D-207 — I-113 Phase 1: "Ruta/envío habitual" + wizard integration, this session (2026-09-11),
  immediately after D-205/D-206. Full detail in `docs/decisions.md` D-207.** New `SavedShipment`
  model (`prisma/schema.prisma`, migration `20260911200000_saved_shipment`, additive-only, RLS
  enrolled) — a reusable single leg referencing two existing `SavedLocation` rows by id (never a
  free-text address, per the issue's own §12). `lib/data/saved-shipments.ts` CRUD (mirrors
  `lib/data/saved.ts`), `POST/GET /api/saved-shipments`, `PATCH/DELETE /api/saved-shipments/[id]`,
  `POST /api/favorites` gains a `"shipment"` kind. Wizard (`components/deca/wizard.tsx`): a "Usar
  ruta/envío habitual" picker on shipment 1 AND every extra `ENVÍO N` block (which had ZERO
  saved-data pickers before this — the concrete gap the issue names), plus inline "☆ Guardar como
  envío habitual" (`components/deca/save-shipment.tsx`, mirrors `SaveTemplate`'s pattern), gated on
  both legs already being `SavedLocation`-backed. **Plantillas/Datos-habituales boundary resolved**
  (issue §5, user's explicit choice): `DecaTemplate` keeps owning a whole multi-envío recurring lane
  (`templatePayloadSchema` gains optional `shipments[]`, reusing #112's `shipmentSchema` verbatim);
  `lib/data/templates.ts` split into a schema-only `template-schema.ts` (no `server-only`) + the
  DB-touching file, mirroring the pre-existing `saved-schema.ts`/`saved.ts` split, so the schema
  stays unit-testable. **Adjacent pre-existing gap fixed while touching the same file:** the
  correction page was passing a hardcoded-empty `saved={{...: []}}` — the correction wizard's
  saved-data autofill was dead for every kind, not just shipments; now calls `listSaved()` +
  `listSavedShipments()` for real. **Out of scope (Phase 2, later session, per the user's phasing
  choice):** the Datos habituales page's own visual redesign (tabs/search/empty
  states/mobile) — no UI to browse/manage saved shipments exists yet, only create (inline, from the
  wizard) and consume (the picker). **Gate: 429/429 unit (+9 new), tsc/eslint/prettier clean;
  targeted e2e regression sweep 21/21 green** (`saved-shipments.spec.ts` 2/2 new,
  `deca-multi-shipment.spec.ts` 4/4, `crear.spec.ts` 9/9, `creator-v2.spec.ts` 5/5, `favorites.spec.ts`
  1/1 — not the full suite, scoped to every surface this slice touched). **PUSHED to `develop` AND
  `main`** (commit `3c344e1`). **Queued next:** #113 Phase 2, then #114, #115.
- **D-205 — I-112 Sprint 1: multiple shipments ("envíos") per DeCA — creation, this session
  (2026-09-11). CODE COMPLETE on `develop`, NOT YET pushed/merged to `main` (pending final full e2e
  gate + commit — see below).** Planned in plan mode with the user first (16 AC issue). Data model
  exactly as the user specified: shipper/carrier DeCA-level only (no per-shipment field — "can't mix"
  is true by construction); `loadLocation`/`unloadLocation`/`goods`/`weight`/new lightweight
  `recipient` always explicit per shipment; `loadDate`/`unloadDate`/`tractorPlate`/`trailerPlate`/
  `notes` are DeCA-level defaults a shipment may override (`resolveShipment()`/`resolveShipments()`,
  `lib/deca/schema.ts`). `DecaVersion.dataJson` is free-form JSON (no migration needed — `shipments`
  is just a new array inside it); `createDeca`/`correctDeca` were already payload-shape-agnostic; the
  EXISTING correction/versioning system already satisfies the "modificación trazable" requirement for
  multi-shipment payloads, nothing new built there. `decaPayloadSchema` accepts the pre-#112 flat body
  OR the new `shipments[]` body (zero changes needed anywhere that posts the flat shape — ~30 e2e
  specs, `lib/diagnostics.ts`'s smoke payload, all unchanged). PDF (`lib/pdf/deca-document.tsx`): one
  route+goods block per resolved shipment; exactly 1 shipment renders byte-identical to before #112;
  2+ get a solid-fill "ENVÍO N" badge, a PESO TOTAL (`sumWeights()`, only when every weight is
  numeric-parseable), and the Resolución's own disclaimer that numbering ≠ execution order. Wizard
  (`components/deca/wizard.tsx`): off by default, pixel-identical single-shipment flow; a toggle
  reveals manual-entry "+ Añadir otro envío" blocks (no autofill in Sprint 1); hidden entirely during
  correction (`!isCorrection`) since an existing multi-shipment DeCA's extras aren't pre-loaded yet —
  closing that gap is explicit Sprint 2 scope. **Real bug found + fixed mid-slice (now in
  `docs/lessons-learned.md`):** `legacyMirrorFields()` (the backward-compat write that keeps
  `dataJson`'s flat top-level fields readable by every untouched consumer — history/search/CSV/
  templates/route-intel/admin table) was written and unit-tested but never actually wired into
  `createDeca`/`correctDeca` — caught by 5 real e2e tests reading stored data back (cockpit showed
  empty loadLocation/goods/weight), not by any unit test. Fixed (`toDataJson()` in
  `lib/deca/persist.ts`); also fixed as part of the same pass, a real correctness gap not originally
  scoped: R-9's `serviceStart`/`serviceEnd` now cover the min/max resolved date across ALL shipments,
  not just the DeCA-level default (a shipment overriding its own dates outside the default window
  would have been excluded from part of its own legal availability window). New
  `tests/e2e/deca-multi-shipment.spec.ts` drives the real wizard → real server → downloads and
  text-extracts the REAL generated PDF for the issue's own Valencia→Madrid + Castellón→Madrid example.
  **A second real bug of the same class was then found by the full e2e suite:**
  `app/api/deca/route.ts` passed `validated.data` straight into `recordAvailabilityShare()` (#84) —
  another direct flat-shape consumer the first sweep missed. Fixed the same way (resolve shipment 1 at
  the call site); confirmed complete via an exhaustive grep of every `.loadLocation`/`.unloadLocation`
  site in the codebase. **Real infrastructure detour along the way (full account in
  `docs/lessons-learned.md`):** an OOM-killed first full-suite attempt, a Docker Desktop WSL2
  networking failure needing a user-approved restart, and — the one that actually delayed confirming
  the fix — `reuseExistingServer: true` silently reusing a `node.exe` server orphaned by the killed
  run, testing yesterday's build until that process was found and killed. **Gate, now genuinely
  complete: 413/413 unit (14 new), tsc/eslint/prettier/keel-verify clean, full Playwright suite run
  TWICE after all fixes (321–323 passed each time, 1 skipped) — the only failure across both runs
  (`content-cms.spec.ts`, unrelated to #112) confirmed a pre-existing contention flake, 6/6 green in
  isolation.**
- **D-206 — I-112 Sprint 2, same session, immediately after D-205: closes every Sprint-1-deferred
  item.** Review-summary now shows one read-only block per extra shipment before generating (was
  entirely invisible before — a real gap). `diffVersions` (`lib/deca/detail.ts`) is shipment-aware: an
  added/removed/edited shipment beyond the first is its own "Envío N" diff row, satisfying the
  Resolución's traceability requirement (apdo. Quinto) for multi-shipment corrections specifically;
  shipment 1 also gains a `recipient` diff row (the one field never mirrored to the top level, so
  invisible to the diff until now). "+N envíos" badge shipped on every list-view surface: Historial
  (table + mobile), Inicio's recent list, Ctrl+K search, CSV export (`envios_totales`, a real column —
  `lugar_carga`/`lugar_descarga` never touched, so an existing CSV consumer never breaks), and the admin
  cross-tenant table — `HistoryRow.shipmentCount` / `DecaAdminRow.shipmentCount` drive it, a shared
  `t.common.shipmentsBadge()` i18n function (8 locales) where a dictionary is available. Correcting an
  already-multi-shipment DeCA no longer silently drops its extra envíos — `WizardInitial.extraShipments`
  pre-loads them (resolved against DeCA-level defaults, same as `resolveShipment()`) and the `!
  isCorrection` gate on the toggle is removed. **Real adjacent bug found + fixed (not originally
  scoped):** `toDisplayDeca()` never recursed into `shipments[]` — the #86p3 "every visible field
  renders UPPERCASE" guarantee held for shipment 1 (mirrored) but NOT for any shipment beyond it, in the
  actual generated PDF. Sprint 1's own PDF test never caught it (it uppercased the extracted text before
  comparing — a presence check, not a casing check). Fixed test-first; the PDF snapshot test was also
  tightened to assert against non-uppercased extracted text specifically, closing the detection gap.
  New e2e: the Historial badge check appended to the main creation test; a full correction round-trip
  (pre-loaded toggle+fields → edit → save with a reason → the diff names "Envío 2" + the new value); the
  review-summary assertion strengthened to actually check for "Envío 2" content. **Gate, confirmed
  complete: 420/420 unit (+7 new), tsc/eslint/prettier/keel-verify clean, full Playwright suite
  321/324 + 1 skipped — the 2 failures (`admin-2fa.spec.ts`, `content-cms.spec.ts`) both unrelated to
  #112, confirmed 19/19 green together in isolation.** **Queued after Sprint 2:** #113 (Datos
  habituales redesign), #114 (Historial redesign), #115 (v0.2.0→v0.3.0 + docs close-out) — none
  investigated yet.
- **D-202 — LIVE INCIDENT hotfix, this session (2026-09-11): a foreign (Portuguese) company could not
  self-register** — #59's "own company" NIF/postal-code validators were Spain-only hard gates,
  unlike R-2's deliberate "foreign counterparty" leniency elsewhere. Fixed: `isValidOwnNif()` now
  accepts a plausible foreign tax id (digit-bearing, 5–20 chars) when the shape isn't recognisably
  Spanish (Spanish-shaped ids still checksum-validated); new `isValidPostalCode()` falls back to a
  lenient foreign-postal-code check after the strict Spanish one; `companyDataSchema.postalCode`
  bound widened 5→3–12 chars. Same rule now shared by registration, the profile-edit route, and the
  soft-completeness gate. Test-first (red confirmed): `tests/unit/validation-spanish.test.ts` +
  2 pre-existing `validation-company.test.ts` cases updated (requirement change, not a weakened
  assertion — see D-202). 399/399 unit, tsc, prettier, keel-verify all clean. **PUSHED to `develop`
  AND `main` (commit `9490f04`)** — still needs the user's next Hostinger redeploy to reach production.
- **D-203 + D-204 — registration latency audit + duplicate-submission hardening, same session
  (2026-09-11), COMPLETE (code-side; production migration + deploy still pending, see below).**
  `User.email` is now DB-`@unique` (migration `20260911090000_unique_user_email`, hand-written — the
  local shadow DB is broken by D-186's RLS migration, unrelated pre-existing issue) — `signup()`'s old
  `findFirst` duplicate check was a TOCTOU race with no DB backstop; all 3 signup paths now catch the
  P2002 violation into a clean `email_taken` 409. `recordTermsAcceptance()` folded into the same
  `$transaction` as company/user/membership (closes a real, separate atomicity gap as a side effect).
  Registration route fully timed (`register_timing` / `register_background_timing` structured logs);
  ONLY the Resend email send + locale persist moved off the critical path via Next 15's `after()` —
  attribution write / #84 opt-in / GROWTH #28 prospect-attach were ALSO tried deferred first and
  reverted after breaking `attribution.spec.ts` + 8 `commercial-consent.spec.ts` cases (immediate-
  consistency requirements neither's swallowed try/catch had revealed — see D-204 for the detail, kept
  so this isn't re-attempted). `emailSent` now means "mail is configured" (sync check), not "delivered"
  — superseding D-053's exact synchronous guarantee for this one step, the user's own explicit call.
  Client: register-specific "Creando tu cuenta…" + spinner (8 locales), reusing the wizard's existing
  spinner pattern; button-disable-on-click and the redirect/error handling were already correct.
  New e2e, both real-browser/real-server, not mocked: `register-duplicate-race.spec.ts` (two real
  concurrent POSTs, same email → exactly one 201 + one clean 409) and `register-loading-state.spec.ts`
  (intercepted+delayed request → asserts the disabled button/spinner/text immediately, a forced second
  click never reaches the server twice, success still redirects). Full suite 317/317 e2e (run twice —
  once catching the same D-202-vintage test-premise issue in `registro-company-data.spec.ts`, fixed the
  same way), 399/399 unit, tsc/prettier/keel-verify clean. **Production, read-only, checked directly**
  (temporary credential the user pasted in-chat — flagged as a repeat of the D-158 exposure, rotation
  recommended): zero duplicate-email rows ever (D-203's migration is safe to apply), 23 real
  registrations today with no duplicate/clustering signal, a shared-policy `abuse_counter` proxy (not
  register-specific) showing mild repeated-attempt activity. **Production app logs (Hostinger
  docker/console output) were NOT reachable this session** — no SSH/Docker access, DB access only —
  that specific evidence needs the user's own `docker logs` pull or the next deploy + a monitoring
  pass. **D-203's migration DEPLOYED to production** this session (`prisma migrate deploy` against
  the production DB, `20260911090000_unique_user_email` — confirmed applied: `prisma migrate status`
  reports up to date, all 40/40; `user_email_key` unique constraint verified present directly;
  `relrowsecurity=t` unchanged (D-186's RLS posture intact); row count unchanged at 73 before/after,
  no data loss). Full migration-gap sweep run before and after: zero gap. **`develop`/`main` code
  (D-202/D-203/D-204) still needs the user's next Hostinger redeploy to actually run in production** —
  the DB schema is ahead of the currently-deployed app code, which is fine (additive, backward-
  compatible) but the UX/latency/foreign-registration fixes are not live until that redeploy. The
  temporary production credential used for all of this was deleted from disk
  (`.env.prod-readonly.local`) once verification was complete.
- **`develop` == `main` == `cc82787` (2026-09-10), both pushed. EVERYTHING from this session is on
  `main`:** D-194, #111 (D-195…D-198), D-199, D-200, the D-200 badge-mobile-chip follow-up, and
  **D-201 / D-201b / D-201c (DECA Conecta)**. CI: run 34534080435 (DECA Conecta merge).
  **NO schema change and NO migration in ANY of this session's work** — `git diff bcb3060..HEAD
  -- prisma/{migrations,schema.prisma}` is empty; production verified DIRECTLY at 39/39.
  Production was redeployed by the user earlier (#111 + D-194 LIVE); the DECA Conecta UI + the
  D-200 chip + the 3 new guide screenshots go live on the **next** Hostinger redeploy. The prod
  guide CMS row is already updated in place to document DECA Conecta (D-201c).
  Plan: `~/.claude/plans/stateful-puzzling-sunrise.md`.
  - **D-201 / D-201b / D-201c — "DECA Conecta" rename** of the optional commercial-opportunity
    feature (task with 15 sections). **DONE:** registration card + `/panel/privacidad` +
    per-DeCA wizard label restructured (OPCIONAL badge, tagline "Tu destino puede conectarte con
    tu próxima carga.", expanded info, Destinatarios/Finalidad/Revocación); all 8 locales;
    terminology sweep (admin nav/pages, legal-page `<h2>` leads with the brand, code comments;
    "Kilómetro Cero" confirmed ABSENT so no redirect); guide "## DECA Conecta" section (the
    task's exact copy) + guide↔article link; 2 new + 1 recaptured guide screenshots; prod guide
    row updated in place (no dup). **Zero backend/DB change** — the 3 stored modes, per-DeCA
    override, audit and API contracts untouched; no migration. `commercial-consent.spec.ts`
    23/23 (5 new + 18 behaviour-preservation); guia-uso 3/3; admin-rsc-authz 19/19.
    **STILL OPEN (task §12–14, all article-CMS / asset work — NOT repo code):** the published
    article `/blog/deca-conecta-ofertas-carga` needs its 3 screenshots + 2 internal links
    (`/deca-gratis`, the guide) added via `/admin/blog`; a discreet DECA Conecta card in the
    Guides section; the featured/OG image.
  - **D-200 — Planes 2027 launch badge.** Dropped the "Ahora:" prefix (8 locales → "Gratis hasta
    el 31/12/2026"); breakpoint-aware placement (< md 768: own line below H2, centred; ≥ md:
    right of the heading row). New responsive `plans.spec.ts` test. No pricing/card/CTA change.
  - **#111 — support/docs experience, 4 parts (D-195…D-198):**
  - **Part 4 / D-198 — landing API/ERP pricing clarity + "Solicitar integración" reaches a person.**
    The 3 Business-tier `soon` features (API / ERP·TMS / onboarding) now show `+ coste adicional`
    next to "Próximamente" (kept), no fixed price; `apiDisclaimer` + `integrationsCard.body`
    reworded so nothing implies inclusion in the subscription — all 8 locales.
    `createIntegrationRequest()` now sends a notification email to `Deca@praetoriaabogados.es`
    (before: DB + admin panel only, nobody alerted) with 2-min dedup; form confirmation copy made
    realistic. No schema change. e2e: admin-growth 4/4 (+ new dedup test), plans 10/10.
  - **Part 3 / D-197 — incident system verified E2E + anti-duplicate.** Full flow driven and
    green (create → persist → Mis incidencias → admin reply → user sees it + reply); notification
    emails confirmed firing to `Deca@praetoriaabogados.es` and to the user (`mail_provider_error
    401` locally = placeholder Resend key; real inbox delivery needs the user's Resend dashboard).
    Hardening: `createSupportTicket()` de-dupes an identical ticket within 2 min (no duplicate row
    ⇒ no duplicate email); notification body gains company/user id + ISO date. No schema change.
    The UI promise "Recibirás la respuesta por correo y también aquí" is true — no wording change.
  - **Part 2 / D-196 — Help page (`/panel/ayuda`) visual polish only.** Support channels as icon
    actions (`WhatsApp · Soporte técnico`, `Email · Deca@praetoriaabogados.es`), polished ticket
    form, better "Mis incidencias" empty state, small secondary Guías link (no card, no nav item),
    3 new inline-SVG icons, 4 new `t.panel.help` keys ×8 locales. Zero behaviour change — every
    `data-testid` kept, `panel-help.spec.ts` + `support-tickets.spec.ts` pass unmodified. The
    Part 1 "grey box" note is resolved: it was the a11y skip link (`sr-only` until focused —
    correct) leaking into an element screenshot; `scripts/guide-screenshots.mjs` capture is now
    deterministic and all 9 screenshots were re-captured.
  - **Part 1 / D-195 — "Guía de uso de DeCA Profesional" as a CMS `ContentItem` inside `/guias`.**
    Additive Markdown renderer support: typed callouts `::: tip/important/example` + block images
    `![alt](/local.png "pie")` (local paths only), pure helpers unit-tested (8), every existing
    guide/blog renders byte-identically. Full 19-section guide (`prisma/content/guia-de-uso.ts`)
    written against the real app; seed entry; `scripts/guide-screenshots.mjs` + 9 real screenshots
    from synthetic demo data in `public/guia/`. `tests/e2e/guia-uso.spec.ts` (3). Gate: tsc/eslint/
    prettier/keel-verify clean, 394 unit (8 new), e2e 9/9. **Production needs `npm run seed:content`
    after deploy** to publish the guide (seed only creates; later edits via `/admin/guias`).
- **`develop` == `main` == `5f33937` (2026-09-10). Merges since D-193's green CI (`34489395873`):
  D-194 (`bcb3060`, run 34496847612 green), #111 D-195…D-198 (`90cdb48`, run 34524373564 green),
  D-199 (`8183b97`, run 34524564805 green), D-200 (`5f33937`, run 34528245494).**
- **Latest: D-194 — admin step-up re-verification was an unbreakable loop (3rd report of #108).**
  `/admin/2fa/verify` skipped the code challenge on the 12h admin window (`isAdmin2faFresh()`) while
  step-up actions need the 10-min window (`requireStepUp()`) → an admin browsing >10 min could never
  refresh `tv`, so "Marcar como prueba" (and block/deactivate/reactivate) looped on 401 forever
  ("se queda pillado"). Fix: new `isAdminStepUpFresh()`; `/admin/2fa/verify?stepup=1` uses it; both
  admin action components add `&stepup=1` to the "Verificar" link and **auto-replay** the stashed
  reversible action (`sessionStorage`, one-shot) on return (`anonymize` never replayed). No
  "verify a company" feature exists — the report conflated the 2FA re-check link with the `is_test`
  toggle. **No migration.** New e2e drives the REAL endpoint against a 20-min-aged `tv` cookie
  (red→green) + a forced-500 "explicit error, no silent reload" test; `admin-account-lifecycle.spec.ts`
  10/10. tsc / lint / prettier / keel-verify clean.
- **Also this session, merged to `main`:** D-191 (Mi empresa `/panel/empresa` mobile two-column
  overlap → `grid-cols-1 md:grid-cols-2` + `min-w-0` + `break-words`), D-192 (`lib/mailer.ts`
  `AbortSignal.timeout(8000)` on the Resend fetch so a hung provider can't stall
  `POST /api/auth/register`), D-193 (#84 — Google OAuth onboarding `CompleteCompanyForm` now offers
  the same "Oportunidades de carga" opt-in via a shared `<CommercialOptIn>` component +
  `applySignupCommercialOptIn()` helper; unchecked by default, never blocks, same
  `commercial_consent` value; 4 regression tests). **None of D-191…D-194 add a migration** —
  production `prisma migrate status` = "Database schema is up to date!" (39/39).
- **Earlier this session on `main`:** D-185 (version 0.2.0), D-186 (RLS lockdown — migration
  `20260910093000`, **already applied + verified on production**: 39/39 migrations, RLS 41/41,
  anon/authenticated reach 0 tables), D-187 (#110 PDF QR overlap), D-188 (#109 Planes 2027), D-189
  (command palette + Plantillas empty state; a 360px overflow regression was caught by
  `panel-nav.spec.ts:51` and fixed in `0162147`), D-190 (footer hierarchy), and a `format:check`
  cleanup of 2 files unformatted since #106. Full gate green: 386/386 unit; e2e ~296–298/298 per run
  (the 1–3 that vary are the documented `internalPage`/react-pdf-CPU contention flakes —
  `content-cms:60`, `master-data:38`, `driver-delivery:96`, `commercial-intelligence:83` — each
  passes in isolation; CI `retries: 1` absorbs them); tsc / lint / format:check / keel-verify clean.
- **Next action:** confirm the D-194 merge's CI run on `main` is green. Then the standing backlog is
  user-side only: Hostinger redeploy for all front-end changes since the RLS-era build (D-190…D-194),
  Resend delivery fix, Supabase Security Advisor re-scan, DB-password rotation + phase-2 hardening
  (`docs/security/2026-09-10-credential-rotation-and-phase2-hardening.md`), and the decision on the
  `PRUEBA DIAGNOSTICO REGISTRO SL` / `PRUEBA SEGURIDAD RLS SL` test companies on production.
- **Earlier — #109 (D-188): informational "Planes 2027" section on the landing.** New
  `components/site/plans-section.tsx` at `#planes` (between `#incluido` and `#producto`); `PLANS`
  const in `lib/content/landing.ts`; `dict.landing.plans` + `nav.plans` in all 8 locales;
  `header-strings.ts` + sync test; discreet desktop "Planes" nav link. Informational only — no
  billing/Plan model/migrations/limits/flags/forms. Live features only; "Próximamente" on unbuilt
  ones. `integrationsCard` reworded per the issue. Deviation: "IVA no incluido" instead of the
  issue's "Precios sin IVA" (AC-26 forbids "precios" on the landing, D-105). `tests/e2e/plans.spec.ts`
  (9); 382/382 unit; landing/a11y/i18n-header/persona e2e green; no 320–1440 horizontal scroll.
  **Merged to `main`.**
- **Previous: #110 (D-187) — PDF verification URL overlapped the QR, layout fix.** **Merged to
  `main`.** Strict two-column band + `urlLines()` wrapping in
  `lib/pdf/deca-document.tsx` (layout only). New `tests/unit/deca-pdf-verify-block.test.ts` (5,
  red→green). 382/382 unit, R-1…R-13 8/8.
- **ACTIVE SECURITY INCIDENT (D-186) — Supabase Security Advisor: `public` schema exposed to
  PostgREST (`rls_disabled_in_public` + `sensitive_columns_exposed`, ~37 findings).** Read-only
  audit of production **COMPLETE**. Findings: all 41 `public` tables grant `anon`/`authenticated`
  ALL privileges; RLS off on 34 (on/no-policy on 7); Supabase default privileges will re-expose
  future tables. Mitigating: app uses Prisma-only (`postgres`/BYPASSRLS), Supabase JS is Storage-only,
  anon/service keys not in repo or client bundle, no exploitation evidence in `pg_stat_statements`,
  DB password not in git history. Aggravating: **the GitHub repo is PUBLIC**. Full report +
  non-destructive migration plan (revoke grants + enable RLS, no policies) in
  `docs/security/2026-09-10-supabase-rls-exposure-audit.md` (**gitignored — not for the public repo
  until remediated**).
  - **Conservative scope approved by user** (revoke anon/authenticated grants + fix ALTER DEFAULT
    PRIVILEGES + ENABLE RLS on all 41 tables, NO policies; service_role + schema USAGE deferred to a
    phase-2 hardening pass).
  - **Tracked migration prepared:** `prisma/migrations/20260910093000_rls_lockdown_public_schema/`
    (`migration.sql` + `migration.rollback.sql`). Only privilege/RLS metadata; no DML, no
    DROP/TRUNCATE/DELETE.
  - **Verified:** Prisma connects as `postgres` / `rolbypassrls=true` on BOTH poolers (:5432 & :6543);
    all 41 tables + 1 sequence owned by `postgres`; 0 functions/views in `public`; every DeCA
    create/read/version/PDF/QR path is `prisma.*` (68 prisma importers vs 1 supabase, storage-only).
    Pre-deploy gate: prisma validate ✓, tsc ✓, 377/377 unit ✓, keel-verify ✓, `migrate status` clean
    (this migration is the only one pending). e2e/integration NOT run — need Docker Desktop (down).
  - **Backup + restore verification DONE (Option C, 2026-09-10).** Supabase CLI (`supabase db dump`,
    image `supabase/postgres:17.6.1.167`) → schema (55 KB, 41 tables) + data (670 KB, 41 COPY blocks
    incl. `_prisma_migrations`) + roles, SHA-256 manifest, in `coverage/backup/` (gitignored). Restored
    into a throwaway PG 17 container: `prisma migrate status` = identical to production (38 applied,
    only the RLS migration pending); row counts + data integrity match; 0 orphan FKs.
  - **Migration DRY RUN on the restored copy: PASS.** `prisma migrate deploy` applied it cleanly →
    RLS 41/41, anon SELECT 0/41, authenticated 0/41, default privileges fixed, **row counts
    unchanged**, `SET ROLE anon; SELECT FROM company` → `permission denied`, bypass role still reads.
    Scratch container removed; nothing done to production.
  - **DEPLOYED TO PRODUCTION 2026-09-10 ~09:28 UTC** (`prisma migrate deploy`, migration `00565e2`).
    Post-deploy verification ALL PASS: `rls_disabled_in_public` 34→**0**, anon-reachable tables
    41→**0**, authenticated 41→**0**, row counts unchanged; 24/24 `SET ROLE anon/authenticated`
    SELECT+INSERT attempts → `permission denied (42501)`; future-table auto-grant fixed (scratch-
    tested). Live app: `/health` ok db:up; homepage/`/crear`/`/entrar` 200; `/panel` 307;
    `/admin` 404; RSC `/admin/empresas` 5 KB (no leak); **`POST /api/deca` 201** (created test DeCA
    `cmtvbsgbq000d430dd887hhtf`, Prisma multi-table txn + PDF + Storage); **`GET /d/<token>` 200**
    PDF, SHA-256 == API `pdfSha256`; `deca_access_log` write ok.
  - **Deliberately still open (phase-2 hardening):** `anon`/`authenticated` keep schema `USAGE`;
    `service_role` keeps table privileges. Neither internet-reachable without the service key.
  - **User TODO:** re-run Supabase Security Advisor to confirm cleared; note dashboard backup/PITR
    status; copy `coverage/backup/deca-prod-20260910T091012Z.*` off-machine.
  - **NEXT (this incident):** credential-rotation plan (DB password overdue per D-158; Supabase
    anon/service keys) + phase-2 hardening — both to be delivered as `docs/security/` docs.
- **Latest: app version bumped `0.1.0` → `0.2.0` (D-185)** — user instruction, version-only change.
  All touchpoints synced: `package.json`, `package-lock.json`, `lib/version.ts` (`APP_VERSION`),
  plus the two test fixtures carrying a literal `appVersion` string. No `CHANGELOG.md` in this
  project. Historical `0.1.0` mentions in `docs/` (append-only records) left as-is. Gate:
  keel-verify "version in sync (0.2.0)", tsc clean, 377/377 unit green. **Merged to `main`**
  (`db9af1c`) on the user's explicit instruction; `develop` == `main`. No version tag (not requested).
- **Previous: #108 — LIVE BUG fix, "Marcar como prueba" silently failed on a stale step-up (D-184),
  MERGED to `main`.** User report: the button visibly did nothing. Root cause: the endpoint
  (`set_test`) is step-up gated like block/deactivate/reactivate/edit, and `MarkTest` — unlike its
  sibling `AccountActions` — never handled a `step_up_required` 401 at all, so it failed with zero
  on-screen feedback whenever the admin's last TOTP check was >10 min old (normal during ordinary
  browsing). Issue #108 opened before the fix (issue-capture policy). Reproduced red-first via a
  new Playwright test (`admin-account-lifecycle.spec.ts`, `page.route()` forces the exact 401
  without waiting out the real window), then `mark-test.tsx` rewritten to mirror
  `AccountActions`'s error/step-up handling exactly. Gate: typecheck/lint/format clean; 377/377
  unit; R-1…R-13 compliance 8/8; full e2e 287/288 (`--workers=3`) — the 2 apparent failures
  (`commercial-intelligence.spec.ts:83`, `master-data.spec.ts:38`) are both pre-existing,
  already-documented contention flakes, confirmed green together at `--workers=1`.
  - **#108 follow-up, same live testing session:** the "Verificar" re-verify link never set
    `next`, so completing the 2FA challenge always dropped the admin on the generic `/admin`
    dashboard instead of back on the ficha they were on — reported live as "recarga a otra
    pagina... se queda pillado". Same defect in both `MarkTest` and `AccountActions` (identical
    step-up pattern); both now build the link with `` `?next=${encodeURIComponent(pathname)}` ``
    via `usePathname()`, so re-verifying returns the admin to the exact ficha. Confirmed red via
    `git stash` of just the two component files, then green. Full gate: typecheck/lint/format
    clean; 377/377 unit; R-1…R-13 compliance 8/8; full e2e **290 passed, 1 skipped, 0 failures**
    (every previously-documented flake sat quiet this run).
- **Previous: #95–#103 batch (D-161), 7 of 9 done, MERGED to `main` (`bfb9953`).**
  - **#97 [P1 SEO] — internal-linking architecture (D-171).** The issue's own hub/"páginas
    estratégicas" example lists were grounded to real routes in a new pure module,
    `lib/content/internal-linking.ts` (`SEO_HUBS`, `STRATEGIC_ROUTES`, `pickCornerstones`,
    `suggestRelatedByCategory`) — the 7 hubs map onto existing `content/seo/pages.ts` pillar pages,
    no new pillar content was needed. **Real gap found and fixed: the CMS editor saved
    `relatedSlugs` but had NO UI field to set it** — related content could only ever be set by
    seeding/direct DB write. Added a "Contenido relacionado" picker (same-category one-click
    suggestions + a filterable manual multi-select) to `components/admin/content-editor.tsx`.
    `article-layout.tsx`'s hardcoded cornerstone-picking duplicate was refactored onto the shared
    module (behavior-preserving). New `scripts/internal-links-audit.mjs` (`npm run
    seo:links-audit`) — orphan pages, thin strategic-page inbound linking, broken internal links
    (hard-fails), repeated-anchor smell, link-heavy pages, click depth from home — run against the
    live build: 0 broken links, 0 orphans, 2 strategic pages flagged thin (`/deca-gratis`,
    `/deca-empresas-transporte` — editorial follow-up, not a defect).
  - **#98 [P1 SEO] — structured-data audit (D-169):** `Organization`/`Article`/`BlogPosting`/
    `BreadcrumbList` were already solidly built (real `dateModified`, correct PRAETORIA-vs-brand
    `publisher`, visible editorial signals). **Real gap: `FAQPage` removed** — it violated the
    issue's own instruction and current Google guidelines; the visible FAQ content is untouched.
    Added `WebSite`, `Organization.taxID`/`logo` (both already-public data, never invented), and
    `image` on articles when present. Corrected the pre-existing `AC-33` spec line and its two tests
    to match.
  - **#103 SECURITY CORRECTION (D-170), same session, user's explicit follow-up:** company
    anonymization removed ENTIRELY from normal Superadmin — not just hard delete. The web endpoint
    now rejects `anonymize` for companies (422); the underlying function is kept only as a library
    building block for a future out-of-band procedure, never a web button. User anonymization
    (a separate, `kind=usuarios` path) was explicitly left untouched — out of this request's scope,
    flagged to the user rather than assumed.
  - **#102 [P0 Equipo] — the reported membership-corruption bug, root-caused and fixed (D-163).**
    `User.companyId` was a single FK — accepting a second invite silently overwrote it, removing a
    member set `companyId: null` (indistinguishable from "never had an account"). New `Membership`
    model (User↔Company N:M) is the source of truth now; `User.companyId`/`companyRole` stay as an
    "active company" view kept in sync by exactly two choke points, so the ~71 read-only call sites
    needed no change. Plus: "Eliminar acceso" rename+confirm, workspace switcher, Superadmin
    recovery tool, `orphaned`/`duplicate_nif` alerts. Production migration applied and verified
    (D-164).
  - **#101 [P0 Seguridad] — audited; one real gap fixed (D-165):** HSTS `preload` removed (no
    subdomain inventory existed, as the issue warned against) — no-behavior-change.
  - **#95 [P0 SEO] — audited with a real crawl, `npm run seo:audit` (D-166):** 23/23 sitemap URLs
    clean, 8/8 private routes correctly noindex/404. **Found and fixed a live bug while running
    it:** re-inviting the same email created a second, independently-valid invite token — the exact
    shape of the user's "invitation expired" report on a freshly generated link (verified directly
    against production data). Now rotates the pending invite in place.
  - **#99 [P1 SEO] — CI regression suite (D-167):** `tests/e2e/seo-regression.spec.ts`, runs on
    every push via the existing `npm run test:e2e` CI step (no new CI wiring). 23/23 green against
    the critical-route list, OG/JSON-LD validity, sitemap/robots integrity.
  - **#103 [P1 Superadmin] — company lifecycle, scope the user narrowed mid-session (D-168):**
    `Company.isTest` toggle + Activas/Archivadas/TEST/Todas filters on `/admin/empresas` (Activas
    hides TEST/non-active by default, nothing ever deleted from the view). Verified directly that
    no hard-delete action exists at the API (4 destructive action names all rejected 422).
    Archive/deactivate/reactivate reused from #62, not rebuilt.
  - Gate across all six: typecheck + lint + prettier + keel-verify + 347 unit + full e2e
    (255–289 depending on suite growth per slice; only documented `internalPage`-contention flakes,
    all green isolated). Beat-1 comments posted on #95/#99/#101/#102/#103; #97 comment on merge.
  - **Still separately flagged, not code-fixable from here:** invite emails not arriving for a
    brand-new address (`docs/lessons-learned.md` — likely Resend sandbox restriction, needs the
    user's Resend dashboard).
  - **#96 [P0 Performance] — IN PROGRESS, one real finding fixed, one deeper one documented
    (D-172).** Root cause: the whole public site is served `Cache-Control: no-store` (verified
    directly against production AND a local production build; Hostinger CDN reports
    `x-hcdn-cache-status: DYNAMIC`) because `cookies()` (via `getLocale()`, for the language
    switcher) is called somewhere in every request's render tree — and `cookies()` anywhere makes
    the WHOLE route dynamic in Next.js App Router, no per-branch opt-out. User chose (AskUserQuestion):
    static-by-default, locale swaps client-side. **Fixed:** `SiteHeader`'s own `cookies()` read —
    now an optional `locale` prop (static pages pass it, dynamic pages keep the old behaviour),
    with `LanguageSwitcher` correcting the visible text client-side (`lib/i18n/header-strings.ts` +
    `data-i18n-key`), verified end to end. **NOT fixed — a second, independent, deeper cause found
    while verifying:** the ROOT layout (`app/layout.tsx`) ALSO calls `getLocale()` for every route,
    with no exception, and this alone still keeps `Cache-Control: no-store` on every public page
    including the SEO cluster. Not touched: `LocaleProvider`'s dictionary context has 9 real
    `useT()` consumers (wizard, registration form, support forms) that need an accurate locale on
    first paint on pages that are already dynamic anyway (auth) and gain nothing from static
    caching — applying the same client-swap trade-off there would be a pure UX regression with no
    offsetting benefit. Needs a real route-group restructuring or Partial Prerendering — recommended
    as its own scoped follow-up, not a rushed call here.
  - **#96 continued (D-174):** audited every `<img>` on the public site — fixed the one real gap
    (`article-layout.tsx`'s `heroImage` had no reserved box, a CLS risk); everything else was
    already correct (data-URI QR/product images with explicit dimensions). Removed `Inter`
    entirely — declared as a fallback font but never actually rendered (`Archivo` always resolves
    first), a whole extra font family downloaded on every page for zero visual effect; confirmed
    Archivo's 4 weights and Plex Mono's 2 are each genuinely used, no further cut available. New
    `scripts/perf-budget.mjs` (`npm run perf:budget`) — real-build-based JS-weight budgets per
    priority route, 8/8 currently within budget. Traced `/crear`/`/entrar`/`/registro`'s heavier JS
    (~98–107 kB above the shared baseline, vs. ~24 kB for the SEO cluster) to no single culprit —
    documented as an open question needing a real bundle analyzer, not guessed at.
  - **#96 baseline (D-175):** new `scripts/perf-baseline.mjs` (`npm run perf:baseline`) — a real
    browser (Chromium), a real mobile profile (Pixel 5), REAL throttling (Lighthouse's own "Slow
    4G" + 4x CPU, for comparability, not an invented threshold). Run directly against production:
    LCP 1460–1960 ms on every priority route (comfortably under the 2500 ms "good" threshold even
    throttled), CLS 0 everywhere. This is the "after" baseline for this session's fixes — there is
    no equivalent "before" measurement from prior to this session, so it stands as the baseline any
    future #96 work is judged against. #96's own acceptance checklist: baseline ✓ (this), top
    bottlenecks found and mostly fixed ✓ (D-172/D-174 above; the JS-weight one stays open),
    SEO/indexability unaffected ✓ (D-172's regression suite), images/fonts CLS-safe ✓ (D-174),
    static-asset caching already correct ✓ (verified during D-172), budgets added ✓ (D-174),
    verified in production not just local ✓ (this). **Still genuinely open, both explicitly
    flagged rather than rushed:** the root-layout caching architecture (D-172) and the
    `/crear`/`/entrar`/`/registro` JS-weight question (D-174).
  - **#102 URGENT PRODUCTION BUG, reported mid-session (D-173):** every page under `app/panel/**`
    sent a company-less LOGGED-IN user (the normal outcome of being removed from a team) to the full
    new-account signup form, which then correctly rejected their own email as already taken — a
    dead-end loop, no way back in. Fixed: redirect to `/registro/completar-empresa` instead (already
    built, session-aware, no email check — previously wired up only for Google sign-up). Reproduced
    red-first via `git stash` against the pre-fix code. **Shipped to `main` immediately**, ahead of
    and separate from the #96 slice — a live incident, not a scheduled release. Issue #104 opened
    retroactively (already fixed) per this project's "Issue capture: on".
  - **#96 substantially done this session** — baseline ✓, top real bottlenecks found and mostly
    fixed, budgets ✓, verified in production ✓. Two deliberately-scoped follow-ups remain open
    (root-layout caching architecture; the `/crear`/`/entrar`/`/registro` JS-weight question), each
    documented precisely enough for a future session to pick up without re-deriving anything.
  - **#100 — user's explicit call: leave it.** "if its manual we can leave it" — it is (Search
    Console is a one-time operational/dashboard setup, not code). Not started; deliberately, by
    the user's own decision, not a gap.
  - **LIVE PRODUCTION BUG #2, reported mid-session with production credentials for direct
    investigation (D-176):** every team invite link showed "no válida/ha caducado", generating a
    new one changed nothing. Investigated directly against production (real DB rows, a manually
    constructed real token proving the server-side invite logic itself was correct) before finding
    the actual cause: `TeamManager`'s "Reenviar" button rotates the invite's token (#95/D-166's own
    fix) but threw the response away entirely — no way to ever see the current, valid link short of
    the email arriving. Fixed: `resend()` now shows the new link exactly like the main invite form
    does. Reproduced red-first, shipped to `main` immediately. **Separately investigated (not a
    code bug):** emails not arriving to some addresses — sent a real test email through the exact
    same Resend call the app makes; Resend accepted it without error, ruling out an app-code cause.
    Left as a deliverability/domain-configuration question for the user's Resend dashboard, not
    guessed at further.
  - **D-176 follow-up (D-177):** user explicitly corrected the DNS/SPF hypothesis (domain verified
    in Resend, a direct send works) and asked for a precise end-to-end code re-read plus safe
    logging, not more guessing. Re-read `lib/mailer.ts` + the invite API route line by line: every
    piece the user asked about (`from`/`to`, env reads, `await`, `delivered` deriving from the real
    provider response rather than the DB write) was already correct as written. The real gaps:
    `sendMail()` logged failures but NEVER logged a success — the 2xx body (carrying Resend's own
    message id) was never even read; the route's outer catch around the whole mail block had zero
    logging, so an exception there (as opposed to inside `sendMail()` itself) vanished with no
    trace. Fixed: full logging added (`mail_send_attempt`/`mail_provider_accepted` with the real
    provider id/`team_invite_mail_result`/`team_invite_mail_threw`), UI copy reworded to the user's
    exact requested phrasing. **Cannot go further from here:** the session's Resend API key is
    send-only restricted (`GET /domains`/`GET /emails` both 401), so the next real attempt's logged
    provider id needs to be checked against the Resend dashboard directly by the user — that is the
    next diagnostic step, not another code change.
  - **#102 follow-up, multi-membership correctness (D-178):** user asked for a full checklist
    verification (join B without losing A, automatic fallback on removal, no onboarding unless
    truly company-less, Superadmin visibility, etc.) plus specific tests. Verified every item
    against the actual code — all already correct from the earlier #102 rebuild this session,
    including something already fully built that hadn't been mentioned back to the user:
    Superadmin's `/admin/usuarios/[id]` already lists every real membership with an `active` flag.
    Two soft preferences ("last-used" tie-break instead of oldest; a chooser when the pick is
    ambiguous) are flagged as real, deliberately-not-built follow-ups — no scenario reported so far
    ever has more than one remaining candidate, so building either would be unverified speculation.
    Closed a real verification gap: the existing passing #102 test switched back to A BEFORE
    removal, never actually exercising the automatic-fallback code path — added a new test that
    removes the user while B is still active, so the fallback itself has to do the work. 15/15
    team+membership e2e green, 357/357 unit green.
  - **#106 [Emails] — unified transactional email system, deliverability-first (D-179/D-180).**
    Started as "the invite email lands in spam" — investigated DNS (SPF missing Resend's include)
    then the user corrected that with harder evidence (domain verified in Resend, direct sends
    work) and opened #106 with a full spec generalising this to every email the app sends. Built
    `lib/email-template.ts` — one shared, pure, unit-tested HTML shell (plain-text brand header,
    never an `<img>` logo; optional title; optional company/role/expiry info block; one CTA +
    the same link visible as plain text; explicit `<meta charset="utf-8">` — the fix for the
    accents-render-as-"?" correction) — wired into all 8 `sendMail()` call sites in the app
    (verification, resend, change-email, password reset, team invite, DeCA-ready lead email, the
    driver document-share email, all 3 support-ticket notifications), each now sending `html`
    alongside its existing, already-translated `text`. `sendMail()` itself now presents every send
    as `${BRAND.name} <the same unchanged, verified address>`. The invite email specifically got
    #106's exact requested structure: title, info block (Empresa/Rol asignado/Caduca — the role is
    now actually threaded through from the invite form), one CTA, the exact requested footer. 17
    new unit tests; 374/374 unit + 287/288 e2e (1 pre-existing documented flake, unrelated) green.
    A real send of the FINAL template went out to the originally-affected address for the user to
    confirm. **Not done:** per-locale email translations beyond the existing (already-correct)
    `dict.emails.*` text — only CTA labels/titles are Spanish-only for now; Resend's click/open-
    tracking dashboard setting could not be checked (restricted API key) — flagged for the user.
  - **#107 [Design] — editorial redesign of the DeCA PDF, Vignelli-inspired (D-181).** The PDF
    worked but read as "app-generated" — dark generic header, CMR-style numbered cell badges,
    dashboard-style bordered cards, a large artificial empty gap in the lower half. Only
    `lib/pdf/deca-document.tsx` touched (generation logic, legal content, QR/URL, versioning, data
    structure all untouched, per the issue's own "no tocar" list): a light editorial masthead under
    one strong rule; the numbered badges removed entirely; party/route cards replaced by plain
    typographic columns separated by one hairline; goods/vehicle as aligned technical fields; the
    verification block as a full-width tinted band (a closing stamp, not a corner add-on); and the
    root cause of the empty-space complaint fixed — the footer was `position: absolute` at the
    page's physical bottom regardless of content length; it now flows naturally after the content.
    Hit and fixed a real `@react-pdf` bug along the way: a literal `\n` inside one `<Text>` node
    crashes its text-layout engine — fixed with two separate `Text` nodes (the pattern the rest of
    the codebase already used). QA visual per the issue's own request: rendered and READ 4 real
    PDFs directly (short/long/full-trailer/corrected-v2) to compare before vs. after — confirmed
    every complaint addressed, no text cutoff/overlap, corrected-version status renders correctly.
    The existing structural snapshot test's one now-wrong assertion (numbered cells) was rewritten,
    never deleted, to assert their deliberate absence; the "sacred" R-1…R-13 compliance suite run
    unweakened (8/8). Full regression: 376/376 unit, 288/288 e2e, 0 failures.
  - **#107 second iteration (D-182) — a deeper editorial pass, per the user's explicit "not done
    yet" pushback on D-181.** Still only `lib/pdf/deca-document.tsx` (+ its snapshot test) touched.
    New "Identificación del DeCA" module (referencia/versión/emitido/estado as 4 labelled fields in
    a softly tinted zone); status now a bordered "sello técnico" rectangle; masthead brand presence
    increased; route section gets a dashed centre divider + a small accent dot before each
    origin/destination label; goods/vehicle rebuilt as a real bordered 2×2 technical table; QR
    enlarged again (96px) with the reference now also printed in the band and the exact requested
    caption; a very light oversized "D" watermark on every page; the flow-only footer became a
    `flex: 1` spacer so short/medium content now fills the page down to the verification band
    (previously it merely avoided an artificial gap — now it actively anchors the band at the true
    bottom). Real bugs found and fixed via direct visual re-render: adjacent id-field values running
    together (fixed with padding + flex-ratio adjustments), "EMITIDO" wrapping to 2 lines (fixed with
    a wider column + smaller value font), and a genuine 2-page regression on the deliberately
    extreme "long names" stress case (fixed with targeted padding/margin/QR-size trims — the extreme
    case still spans 2 pages but now degrades cleanly; both realistic cases stay single-page).
    `tests/unit/deca-pdf-snapshot.test.ts` — 2 assertions rewritten (never dropped) because the new
    structure changed what they were checking, not because a requirement was removed. Gate:
    typecheck/lint/format clean; 376/376 unit; R-1…R-13 compliance 8/8 unweakened; full e2e 287/288
    (the 1 failure is the pre-existing `commercial-intelligence.spec.ts:83` `--workers=3` contention
    flake, confirmed green at `--workers=1`, unrelated to this slice).
  - **#107 live feedback on D-182's render (D-183) — 3 small PDF corrections + 1 unrelated field
    default.** User reaction to a real render: the bare "VERSIÓN 1" field in the identification
    strip "queda mal" and is redundant with the bottom of the page — removed; the remaining 3
    fields (Referencia/Emitido/Estado) now split the row exactly evenly (`flex: 1` each, was
    1.4/0.7/1.6/1.6). A follow-up clarified the version number should still appear SOMEWHERE, small,
    at the very bottom — added as a 6.5pt footnote ("Versión N del documento") under the existing
    "DeCA Profesional v0.1.0" software-version line in the verification band. Added a real drawn
    brand mark (blue square + white checkmark, via `Svg`/`Rect`/`Path` — never a raster asset) next
    to "DeCA Profesional" at the top. Separately: the weight field now defaults a bare number (no
    unit typed at all) to tonnes (`withDefaultWeightUnit` in `lib/deca/schema.ts`) — mid-thread the
    user changed the requested default from kg to tonnes and asked the form's label/hint to ask for
    tonnes too (`es.ts` only, per the Spanish-only v1 scope); anything already carrying a unit or a
    genuine alternative measure stays exactly as typed (unweakened VERBATIM guarantee, its own test
    still passes unchanged). Gate: typecheck/lint/format clean; 377/377 unit (1 new); R-1…R-13
    compliance 8/8 unweakened; full e2e 287/288 (same pre-existing `commercial-intelligence.spec.ts`
    contention flake, unrelated).
- **Previous: #84 registration opt-in restyled as a compact feature (D-159/D-160) — MERGED to `main`
  (`f41073d`). No production migration needed (UI/i18n only, no schema change).** User-requested
  presentation-only change to the commercial-consent checkbox on `/registro`: RouteIcon +
  "Oportunidades de carga" in a light box, checkbox with a short label, a small hint line, and a
  closed-by-default disclosure ("Qué datos se comparten"). D-159 first added an "Opcional" badge
  (superseding D-146 point 4); D-160, same session, removed the badge again on the user's follow-up
  correction — the checkbox stays functionally optional, just not labelled as such. Every other #84
  constraint verified unchanged: unchecked by default, no pressure, required Terms/Privacy checkbox
  untouched, same storage/legal logic. Gate: typecheck + lint + prettier + keel-verify + 330 unit +
  full e2e 249/249 + `commercial-consent.spec.ts` 14/14 unmodified.
- **Previous: #92 + #93 + #94 (D-156/D-157/D-158) — MERGED to `main` (`9fcba7f`), production
  migration APPLIED.**
  - **#94 [P0 Seguridad] — FIXED (`bf3ce0f`).** Every internal page under `app/admin/(protected)/`
    relied only on the group layout's `requireInternal()`; the App Router renders layout and page in
    parallel, so an anonymous `RSC: 1` request returned the page's full server-rendered payload
    (companies, NIFs, users — up to 7.74 MB) even though a plain navigation correctly 404'd. All 29
    internal pages now guard themselves; `scripts/keel-verify.mjs` fails the build if a future one
    doesn't. **The currently-deployed production build is still exposed until the user redeploys**
    (the flaw predates #69).
  - **#92 saved Histórico views** + **#93 quick accesses on Inicio** — both per-user comfort layers
    over existing functionality, no new filters/screens/modules. New `SavedHistoryView` model +
    `User.quickActions`, migration `20260909075010_saved_history_views_and_quick_actions`
    **APPLIED to production** (36/36, table + `quick_actions` column verified directly).
  - Gate: typecheck + lint + prettier + keel-verify + 330 unit (40 new) + full e2e **249/249**
    (production build). `docs/issues.md` updated (I-092/I-093/I-094), decisions D-156/D-157/D-158,
    `docs/api/INDEX.md` + `docs/05-test-points.md` current. Beat-1 comments posted on #92/#93/#94.
  - **NEXT:** the user redeploys Hostinger — nothing else is pending in code.
- **Previous: #85 pre-launch UX batch (D-148) — MERGED to `main` (`9d4d702`), production migration
  `20260908170252_saved_company_postal_city` APPLIED (31/31, columns verified).** WhatsApp channel
  label, `SavedCompany` postal/city, discreet "Gratis durante 2026" landing message. `develop` ==
  `main`. See the `#85` section near the end of this file. Keel updated to v5.20.0 this session
  (lock stamp kept at v5.19.2 per the user). **Still needs: Hostinger redeploy** so the code runs.
- **Done: BUILD 05–15.** Core anonymous flow (05–09) + registered workspace (10) + acquisition
  tracking (11) + operator dashboard (12) + sharing/versioning/abuse (13) + SEO cluster (14) + launch
  gate (15). All green: 47 unit + 57 e2e (6 compliance R-1…R-13 + axe on every public screen +
  cross-tenant + security headers) + typecheck + lint + format + standalone build + keel-verify.
  - 05 scaffold · 06 landing · 07 `/crear` 3-step creator · 08 compliant PDF+QR+`/d/[token]` +
    `npm run test:compliance` gate · 09 signup+claim (own auth D-021) ·
    10 `/panel` + `/panel/historico` (search + date range) + `/panel/datos` (saved data CRUD) + wizard
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
  "Guardar este DeCA" → `/registro` → `/panel` with the document owned + reusable data.
- **BUILD 13 done** — sharing + corrections/versioning + abuse controls:
  - Sharing: result panel WhatsApp deep link + copy + email via `POST /api/share` (rate-limited,
    templated envelope, mailto fallback when Resend unconfigured), `deca_shared` event.
  - Corrections (R-13): `/app/deca/[id]` detail + version history; `/app/deca/[id]/corregir` reuses
    the wizard in correction mode (required "motivo"); `POST /api/deca/[id]/version` → new
    `deca_version` with a NEW token/URL/QR/PDF, prior versions untouched and still retrievable,
    `deca.currentVersionId` updated, `deca_corrected` event. Non-owner → 401/404.
  - Abuse (F16): `lib/abuse/*` — pure sliding-window `decide()`, signed proof-of-work challenge (plain
    SHA-256, no client secret; hCaptcha when configured), server `checkAbuse()` on anonymous
    `POST /api/deca` + `POST /api/share`. Fingerprinted requests get the tight limit, un-fingerprinted
    a loose IP-only one. `GET /d/[token]` NEVER calls it (inspectors never challenged). Wizard solves
    the PoW invisibly and retries. First-time user is never challenged.
- **BUILD 14 done** — SEO cluster: `content/seo/pages.ts` (10 pages, real Spanish content, BOE/Ministerio/
  CETM citations, last-reviewed date) rendered by one template `app/(seo)/[slug]/page.tsx`
  (`dynamicParams=false` → unknown slug 404s; static generation; FAQPage JSON-LD; canonical; internal
  cluster links; CTA to `/crear`). `/soy-obligado` guided obligation check (SSR query-param form, works
  without JS). `sitemap.ts` extended. SEO technical base (robots/meta/OG) was already done in BUILD 06.
- **BUILD 15 done** — launch gate: `middleware.ts` (CSP + HSTS-in-prod + nosniff + X-Frame-Options DENY
  + Referrer-Policy + Permissions-Policy); cross-tenant authz e2e (company B → 404 on A's document,
  correction, history); token-entropy + failure-path e2e; `.githooks/pre-commit` confidential gate
  (`core.hooksPath` set) + `.claude/settings.json` allow-list + `.github/workflows/ci.yml` +
  `Dockerfile` (Next standalone, non-root, healthcheck) + `.dockerignore`; `docs/07-release.md`
  (compliance matrix with evidence, quality gate, Hostinger+Supabase deploy runbook, sample-DeCA
  instructions, merge-to-main steps).
- **v1 released:** `develop` merged to `main` (946ac88, BUILD 05–15). CI green on main (typecheck, lint,
  format, 47 unit, 57 e2e, 6 compliance, keel-verify, secret scan). No version tag (not
  requested).
- **Post-release hotfixes on `main` (CI green at d200158):**
  - `ff731dd` — Prisma Linux binaryTargets + node:20-slim Dockerfile + lenient `/health` healthcheck.
  - `fbc19ca` — **the first 503**: route segment literally named `app` (`app/app/`) collided with `/`
    in the Next standalone build, so `GET /` 307-redirected to `/registro`. Fixed by
    `git mv app/app app/panel` + updating every link/redirect/robots/test. Verified in Docker.
  - `a653d37` + `7a0b175` — acquisition attribution captured in `middleware.ts` (removed a
    client-hydration race + a cookie double-encoding bug that made two e2e tests flaky in CI).
  - `e088f51` — `docker-compose.prod.yml`: self-contained deploy (app + Postgres + PDF volume), D-024.
  - `d200158` — **the Cloud Startup 503**: LiteSpeed `lsnode.js` does `require(startupFile)`; the ESM
    standalone `server.js` threw `ERR_REQUIRE_ESM`. Removed `"type":"module"` from package.json (Next
    now emits CJS `server.js`) + added `server.cjs` startup file + `scripts/standalone-postbuild.mjs`
    + a CI guard. D-025. Hostinger startup file = `server.cjs`.
- **FIX #16–#19 + LAUNCH #20 (D-026) — merged to `main` at `0272c33`, CI green:** #16 = the Cloud
  Startup 503 above (code-complete, awaiting the user's deploy test). #17 = carrier domicilio now
  required + weight kept verbatim + wizard review step + `docs/legal-data-model.md`. #18 = per-version
  `pdf_sha256` (checked on every download) + `FVD_STORAGE_DIR` persistent path. #19 = version author +
  `docs/retention-policy.md` (claim never resets retention / regenerates). #20 =
  `tests/e2e/launch-happy-path.spec.ts` + `docs/production-smoke-checklist.md`. Migration
  `20260903230000`.
- **Product V2 — #21–#28 (D-027):** brand config ("DeCA Fácil"), premium landing V2, password
  recovery + logout + auth states, workspace filters/mobile, DeCA templates + "usar mi empresa",
  driver-delivery (native share / print / Comprobar QR / re-share reminder), multi-user company
  workspaces + invitations (`/panel/equipo`), and the operator acquisition engine
  (`/operadores/captacion` — prospects, onboarding links, activation funnel). 8 commits on `develop`,
  8 new e2e specs, 4 migrations (`20260904090000`…`_120000`). Merged to `main` — CI status below.
- **Product V3 — #29–#38 (in progress):**
  - **#29 P0 FIX — generation reliability + real failure exposure (D-029), on `develop`:** every
    render/storage/DB failure is now classified into a stage (`validation` / `configuration` /
    `pdf_render` / `pdf_storage` / `database` / `unknown`) and carries a 6-char correlation code the
    user reads out. `lib/deca/generation.ts` (pure classification + code + PII redaction),
    `lib/deca/failures.ts` (structured log line + `generation_failure` row — never the payload),
    `lib/deca/persist.ts` (per-stage wrappers + orphan-object cleanup when the DB write fails after
    upload), `lib/diagnostics.ts` + `GET /api/admin/diagnostics` + `npm run diagnose -- <url>`
    (deploy readiness: env, DB, migrations, PDF render smoke, storage round-trip, HTTPS base URL,
    providers, 24 h generation health), `lib/admin/guard.ts` (internal session or `FVD_ADMIN_TOKEN`
    header; 404 never 403). Wizard shows the code and retries with the SAME idempotency key.
    `POST /api/deca` resolves the idempotency key BEFORE the rate limiter so an idempotent replay is
    never answered with 429. Migration `20260904140000_generation_failure`. Gate green:
    79 unit + 95 e2e + 8 compliance + typecheck + lint + format + keel-verify. **Not done (CREDENTIAL):**
    reproducing the production exception + switching prod to persistent storage — `npm run diagnose`
    names it.
  - **#33 ADMIN V2 — internal command center at `/admin` (D-030), on `develop`:** shell (sidebar +
    mobile drawer, `requireInternal()` → 404, `noindex`, `/admin` in robots.txt) + 11 screens:
    Resumen (KPIs + operational alerts), DeCA (cross-tenant table + detail), Empresas (+ detail),
    Usuarios, Captación (reuses #28), Operadores (reuses #12), Contenido (SEO list; editorial CMS
    blocked on #32), Errores (#29 failures by correlation code + triage), Sistema (`runDiagnostics`).
    Global search API across company/user/DeCA ref/correlation code/prospect. `lib/admin/*`
    (metrics, failures, records, search, range, guard). `PATCH /api/admin/failures/[id]` +
    `GET /api/admin/search`. Gate green: 84 unit + 100 e2e + 8 compliance + typecheck + lint +
    format + standalone build + keel-verify. Deferred (recorded in D-030): internal sub-roles,
    editorial content CMS (#32), axe on admin screens.
  - **#30 AUTH — premium auth card, UI-only (D-031), on `develop`:** `/entrar` + `/registro` now a
    focused centered card on a branded ground (`AuthShell`), no site chrome. Contextual headings,
    "Continuar con Google" button (official 4-colour G; **inert** until `GOOGLE_CLIENT_ID`+SECRET
    set — caption "disponible muy pronto"), "o continúa con email" divider, password show/hide,
    trust line, in-place login⇆register switch. Auth LOGIC untouched — zero regression.
    `components/auth/{auth-shell,google-button,password-field}.tsx` + restyled `register-form.tsx`.
    Gate green: 84 unit + 104 e2e + 8 compliance + build + keel-verify.
    **Deferred to the OAuth slice (D-031):** the real Google handshake (needs OAuth-lib decision vs
    D-021 + Google credentials), account-linking safety, progressive company onboarding (2-step).
  - **#31 UX — creation-flow clarity (D-032), on `develop`:** plain-language progress label
    (`Paso 1 de 3 · Quién contrata…`), focus jumps to the first field to fix, review grouped into
    PDF sections each with `Editar`, visible "Estamos generando tu PDF y QR…" status, human
    microcopy, sticky mobile action bar. Kept at 3 steps + inline review (see D-032). Gate green:
    84 unit + 108 e2e + 8 compliance.
  - **#36 PRODUCT — document cockpit (D-033), on `develop`:** `/crear/[id]` + `/panel/deca/[id]`
    rebuilt via shared `lib/deca/detail.ts` — QR inspection card (real server-rendered QR),
    sectioned data mirroring the PDF, version timeline (badges, per-version PDF link, author in
    workspace), "Qué ha cambiado" field diff for v2+ (`diffVersions` pure + unit-tested),
    technical-details accordion. Gate green: 88 unit + 110 e2e + 8 compliance.
  - **#37 TEAM — role change + resend + status (D-034), on `develop`:** `changeRole()` +
    `PATCH /api/team/members/[id]` (promote/demote, never drop the last admin), per-member role
    select on `/panel/equipo`, join date + "Activo" status, "Reenviar" on pending invites. #27
    already covered most of #37's acceptance. Also folds in a #36 refinement (server QR memoized,
    `qrPngDataUriCached`). Gate green: 88 unit + 111 e2e + 8 compliance.
  - **#35 GROWTH — persona-led landing (D-035), on `develop`:** landing persona section upgraded to
    4 job-to-be-done cards (autónomo / empresa / agencia / cargador), each CTA → its own persona SEO
    page (`/deca-autonomos`, `/deca-empresas-transporte`, `/deca-agencias-transporte`,
    `/deca-cargadores`, auto in sitemap). 4 persona CTA events. No pricing/sales contact. Gate green:
    114 e2e + 8 compliance. Onboarding adaptation deferred to #38.
  - **#34 PRODUCT — competitive feature pack (D-036), on `develop`:** history CSV export
    (`GET /api/export/history`, company-scoped, filter-aware, RFC 4180 + BOM; `historyToCsv` pure +
    unit-tested; "Exportar CSV" on `/panel/historico`), operational workflow status
    (`docWorkflowStatus` — Vigente / Corregida / No disponible, a product state not a legal one),
    integration boundary documented (DecaPayload + createDeca/correctDeca + historyToCsv). **Company
    logo → new issue #39** (touches the compliant PDF); **PWA/offline → new issue #40**. Also capped
    local e2e workers at 3 (react-pdf is CPU-bound; 6 starved the loop). Gate green: 94 unit + 117
    e2e + 8 compliance.
  - **#38 AUTH — business-ready entrypoints, hardened (D-037), on `develop`:** `safeInternalPath()`
    (pure + unit-tested) fixes the post-auth `next` open redirect; `/registro?invite=<bad>` now
    shows an "Invitación no válida" recovery card instead of a new-company form. Most of #38 was
    already in place (#19/#27/#28/#30). **Deferred with the user: Google OAuth handshake + 2-step
    progressive onboarding** — land together in the OAuth slice. Gate green: 98 unit + 120 e2e + 8
    compliance.
  - **#32 SEO — Guides + Blog CMS (D-038), on `develop`:** `ContentItem` model (migration
    `20260904160000_content`) + `/guias/[slug]` + `/blog/[slug]` (SSR, published-only, `?preview=1`
    for internal) + `/guias` + `/blog` indexes + Article/BreadcrumbList JSON-LD + sitemap + slug
    redirects. Safe in-house markdown renderer (no `dangerouslySetInnerHTML`). Admin:
    `/admin/contenido` (+ nuevo / [id] / guias / blog), `ContentEditor` with live editorial warnings,
    draft/publish/unpublish/archive, `POST`+`PATCH`+`DELETE /api/admin/contenido`. Core SEO cluster
    stays in code (not migrated — churn for no gain). Seed content via `npm run seed:content`
    (idempotent). Gate green: 105 unit + 125 e2e + 8 compliance.
  - **Product V3 (#29–#38) MERGED to `main`** (merge commit `f09dde0`, 2026-09-04) on the user's
    explicit instruction. `develop` == `main`. CI running on the `main` push. No version tag (not
    requested). Splits opened: #39 (company logo on PDF), #40 (PWA/offline). Deferred to the OAuth
    slice: Google handshake + 2-step onboarding (part of #30/#38). D-039: no company attribution
    anywhere public.
- **Remaining before public launch (the user's, not code):** RGPD review of anonymous-doc retention
  (D-016); legal/inspection check of a real generated DeCA; provision Postgres/storage + domain +
  Resend + hCaptcha, deploy per `docs/07-release.md`; run `docs/production-smoke-checklist.md`; close
  issues #5–#28.
- **Post-launch code items (tracked in `docs/07-release.md`):** nonce-based CSP;
  `docs/.keel/plan.json` + `scripts/keel-close`/`keel-handoff-verify` (skipped under execution mode
  D-019); local + long-tail SEO pages (`docs/sprints/deferred.md`).
- If work continues: **Phase 6 (Documentation)** — `docs/architecture.md`, `docs/api/` full reference,
  `docs/security.md`, `docs/accessibility.md` (record the guided AT pass), `README.md`, `guide/`
  end-user HTML guide.

## Open items
- Pre-launch only: real domain; RGPD review of anonymous-document retention; legal inspection check of generated DeCA; Hostinger VPS sizing.
- Unverified external steps/assets: Supabase project, Hostinger VPS, DNS, transactional email, hCaptcha, GitHub secrets.
- Forge EPICs: #1 landing, #2 attribution, #3 SEO, #4 compliance. Execution queue #5 onward.
- **#92 + #93 + #94 (D-156/D-158) — MERGED to `main` (`9fcba7f`), production migration
  `20260909075010_saved_history_views_and_quick_actions` APPLIED (36/36, table + column verified).**
  `develop` == `main`. Beat-1 comments posted on #92/#93/#94.
- **BLOCKED ON THE USER, unchanged in kind since D-155:** production still runs a pre-#69 build, so
  NOTHING from #85–#94 or #87–#90 is live yet — the user must redeploy Hostinger, then live-verify
  and close the issues. **#94 is a live P0 until that redeploy happens** — the currently-deployed
  build lets any unauthenticated caller read the whole internal admin area with one RSC header.
- **Security note:** the DB password shared in chat this session is the same one shared in the
  D-155 session — if it was not rotated then, it needs rotating now (D-158).
- **User-reported, tested on LIVE production (pre-redeploy code, not reproducible against today's
  fix locally — 5/5 green on `tests/e2e/membership.spec.ts`'s exact "create invite → follow it
  immediately" scenario):** an invite link shows "invitación no válida / caducada" right after being
  generated. Also: an invite email never arrives for a genuinely new (never-registered) address
  though it arrives for a known/existing one — very likely a Resend sandbox/domain-verification
  restriction, not a code bug (`docs/lessons-learned.md`, 2026-09-09 entry). **Re-check BOTH after
  the Hostinger redeploy** — if either persists against the actually-deployed #102 code, that is a
  real bug to hunt with fresh server-log evidence, not before.
- **Email delivery, general:** every e2e run locally shows `mail_provider_error 401 API key is
  invalid` — expected locally (placeholder Resend key, per the existing lesson). Whether
  production's `RESEND_API_KEY`/`FVD_MAIL_FROM` are correctly configured could not be verified from
  this repo — ties into the invite-email report above.

### Deferred items
- Local SEO pages; long-tail/user-type SEO beyond core launch pages; public API; CSV *file upload*
  for prospect import (paste-import shipped); eCMR interop feature.

## Launch execution (2026-09-04, user directive — "ruthless launch sequence" per #44)
- **DNS resolved.** `https://decaprofesional.es/` now serves HTTP 200 with a
  valid cert and the app's own security headers — confirmed via `curl`.
- **`develop` merged to `main`, pushed, CI green at `04ad0e3`.** `main` now
  includes D-042 (PRODUCT #41 structured goods legal data model), D-043
  (TRUST #42 + GROWTH #46 — Praetoria identity, versioned terms, email
  verification, lead gate) — merge explicitly authorised by the user — plus two
  fixes forwarded the same session: a `format:check` red (prettier) and the
  `directUrl`/connection-pool fix below.
- **BLOCKED — the live app has not been redeployed with `main`'s latest
  commit; production DB was reported down but is now root-caused and fixed in
  code.** Evidence:
  - `GET /health` on `https://decaprofesional.es/health` → `{"status":"degraded",
    "version":"0.1.0","db":"down"}` (unchanged as of the last check — expected,
    since nothing has been redeployed yet).
  - The live site is still serving the PRE-D-042/D-043 build: `/terminos` 404s
    and the homepage carries no Praetoria trust copy, even though both exist on
    `main`. Hostinger deploy is a manual SSH/build step
    (`docs/07-release.md` "Hostinger Cloud Startup") — it does not auto-deploy
    on `git push`.
  - **Root cause of `db: "down"`, diagnosed and fixed:** the user shared the
    production `DATABASE_URL` — Supabase's SESSION pooler (port 5432,
    Supavisor free-tier `pool_size` 15). `npx prisma migrate status` against it
    returned `FATAL: max clients reached in session mode`; the same
    credentials over the TRANSACTION pooler (port 6543, `pgbouncer=true`)
    answered a real query fine. Prisma had no `directUrl`, so the app's
    runtime queries and every migration/tooling connection fought over the
    same 15-connection cap. Fixed on `main` (`04ad0e3`): `directUrl` added to
    `prisma/schema.prisma`; `DATABASE_URL` (app, transaction pooler) split from
    `DIRECT_URL` (migrations, session pooler) in `.env.example`,
    `.env.prod.example`, CI, and `docs/07-release.md`. The credential itself
    was never written to any file — used only as a transient shell env var for
    the connectivity test.
  - **RESOLVED — the user set both env vars and redeployed.** `npm run
    diagnose` then showed every critical check green (config, storage_config
    [Supabase Storage], db, pdf_render, storage_write, base_url) — EXCEPT
    `schema`, which reported OK too but generation itself 500'd with a
    classified `database` failure (`recordGenerationFailure`, correlation
    `4A46LH`): `The column "creator_name" does not exist in the current
    database`. Root cause: the redeploy's `prisma migrate deploy` step never
    actually applied `20260904190634_trust_registration_v2` — almost
    certainly because it also hit the session-pooler connection cap during
    the same build. **Fixed:** the user ran the migration SQL directly in the
    Supabase SQL Editor; this session then resolved Prisma's migration ledger
    (`_prisma_migrations` was missing that row — `prisma migrate resolve` hung
    against the pooled connection, since its advisory-lock step doesn't work
    over pgbouncer transaction mode, so the row was inserted directly via a
    plain `INSERT`, verified against the other 10 migration rows already
    present). Confirmed fixed by generating a real DeCA (below).
- **Phase 9 — real production E2E, done this session (not just code review):**
  - **TEST A (new visitor):** anonymous `POST /api/deca` → 201, real
    `decaId`/`token`/`pdfSha256`. `GET /d/<token>` → 200, `content-type:
    application/pdf`, first 8 bytes `%PDF-`, byte length 20616, SHA-256
    matches the API's `pdfSha256` exactly, no `set-cookie`. PDF text
    (extracted via `pdfjs-dist`) prints the exact same
    `https://decaprofesional.es/d/<token>` URL that serves it (R-5/R-6). The
    ONE thing this cannot prove is a literal camera scanning a screen/printout
    — HARDWARE, not code — but the QR is generated by the same
    already-unit-tested code path as the printed URL. Registered a real test
    account (`launch-test-*@example.com`) with `claim=<claimToken>` → the
    anonymous DeCA is claimed, same token still resolves. `/verificar-email`
    renders correctly for the unverified account. **Blocked, CREDENTIAL:** no
    `RESEND_API_KEY`/`FVD_MAIL_FROM` configured yet, so the verification email
    never actually sends (confirmed via `npm run diagnose`'s `mail: warn`) —
    the soft-gate design means this does NOT block the rest of the flow, but
    the literal "click the link in the inbox" step needs Resend set up.
  - **TEST B (returning user, duplicate):** same session, authenticated
    `POST /api/deca` with different load/unload → new independent `decaId` +
    `token` + `pdfSha256`. `GET /d/<newToken>` → 200 `application/pdf`.
    `GET /panel/historico` shows BOTH documents (Almacén Norte→Sur and
    Almacén Norte→Este).
  - Test data left in production (`launch-test-*@example.com`,
    "Transportes Lanzamiento SL", "Cargador Prueba SL") — flagged to the user,
    not deleted without asking.
  - **Still open:** the panel banner (D-045, below) was merged to `main`
    AFTER this E2E pass, so it hasn't been re-verified live; Resend/hCaptcha
    are unconfigured (mail: warn, Google OAuth: warn — both non-blocking).
  - **Also verified: versioning/corrections (#19) in production.**
    `POST /api/deca/<id>/version` with a real `changeReason` → new version 2,
    NEW independent token/PDF (SHA-256 `333f2d98…`). Version 1's URL re-fetched
    afterward → byte-for-byte identical SHA-256 to before the correction
    (R-13 retention, confirmed live, not just in the local suite). Document
    detail page `/panel/deca/<id>` → 200.
  - **Found and fixed live: double-slash URL bug (SEO-affecting, not
    transactional).** `NEXT_PUBLIC_FVD_BASE_URL` was set on Hostinger WITH a
    trailing slash; most URL call sites build `${baseUrl}/path` without
    stripping it, so canonical tags, OG tags, and every `sitemap.xml` entry
    were double-slashed (`decaprofesional.es//crear`) — confirmed live via
    curl before the fix. The `/d/[token]` and QR URLs were unaffected only
    because that one call site already stripped it defensively. Fixed at the
    source in `lib/env.ts` (`publicEnv.baseUrl` now strips trailing slashes
    once, so no per-call-site patching and no future recurrence regardless of
    how the env var is set) — 2 new unit tests, 108 unit + 27 targeted e2e
    (landing/SEO/compliance) green, merged to `main`. **Still needs a
    redeploy** to actually take effect in production (it's a
    `NEXT_PUBLIC_*` var, baked in at build time — editing the Hostinger env
    var alone won't fix it without a rebuild).
- **D-042 done, on `main`:** PRODUCT #41 goods-only
  slice — structured `loadLocation`/`unloadLocation` (name/address/postalCode/
  city/province/country, all required) replace the loose `origin`/`destination`
  strings; separate `loadDate`/`unloadDate` (unload >= load, same-day allowed)
  replace the single `transportDate`. No DB migration needed (`dataJson` is a
  JSON blob; `Deca.serviceStart`/`serviceEnd` columns already existed and are now
  actually populated, which also activates the previously-dead R-9 deactivation
  window for new documents only). Every consumer updated: PDF, wizard UI, review
  summary, document cockpit + diff, history + CSV export, admin table/search,
  templates, all `/panel/*` + `/crear/*` pages, diagnostics smoke payload.
  `docs/legal-data-model.md` rewritten. **Gate green locally** (Docker Postgres,
  since production access is blocked): 106 unit + 129 e2e + typecheck + lint.
  **Deferred, on the record (D-042):** passenger (`viajeros`) schema (needs its
  own legal-requirement research first, per the issue and the user's explicit
  instruction not to invent passenger fields), the `GOODS|PASSENGERS` type enum
  + company default + `/crear` type picker, structured `SavedAddress` (was
  already dead/unused in the wizard before this slice), admin type filter.
- **D-043 done, on `main`:** #42 + #46 —
  Praetoria legal identity (footer + legal pages + `/terminos` + landing trust
  section), versioned `TermsAcceptance` (required checkbox, team-invite joins
  exempt), company signup fields (contactName/phone/profile picker — logo
  upload deferred), email verification (soft gate — `/verificar-email`
  dedicated screen + resend/change-email, `/panel` never blocked), and the
  lightweight name+email identity gate on the first anonymous DeCA
  (`fvd_lead` cookie → `/crear` shows a "register for your next one" screen;
  the API itself stays lenient — see D-043 for why the abuse-tolerance tests
  forced that scope call). Landing hero repositioned to professional-first
  copy per the issue's exact wording. Migration
  `20260904190634_trust_registration_v2`. New
  `tests/e2e/trust-registration-v2.spec.ts` (5 tests) plus ~17 existing e2e
  files mechanically updated (accept-terms checkbox + /verificar-email
  redirect at every genuine UI registration; lead fields at every anonymous
  wizard-generate). **Gate green locally**: 106 unit + 134 e2e + typecheck +
  lint.
- **Not started:** company logo upload (#46, deferred); passenger transport
  type (#41 §4/§5 — GOODS|PASSENGERS enum, company default, `/crear` picker,
  admin filter — blocked on the passenger legal-requirement research the issue
  itself demands before building).
- **AUTH #30 — Google OAuth ACTIVATED (D-046), on `main`.** The real handshake
  (`lib/auth/google.ts` + `lib/auth/oauth-state.ts`, plain fetch, no SDK),
  `/api/auth/google` + `/api/auth/google/callback`, account linking by email
  (`findOrCreateGoogleUser`), and the 2-step company-completion screen
  (`/registro/completar-empresa` + `completeCompanyForUser`) for a brand-new
  Google sign-up. Migration `20260904225323_google_oauth`. Stays inert
  ("disponible muy pronto") until `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
  are set — the user is adding those the next morning; no further deploy
  needed once they do. 114 unit (6 new) + 134 e2e + 8 compliance green.
- **Investigated: "el botón de entrar no funciona"** — reproduced live in a
  real browser against `https://decaprofesional.es/entrar` with the
  `launch-test-*` test account: filled the form, clicked Entrar, landed on
  `/panel` correctly (session cookie set, history + banner rendered). Could
  not reproduce a failure. One screenshot call timed out mid-navigation
  (tooling hiccup, not a functional failure — the login had already
  succeeded by the time it was retried). No fix applied since nothing
  reproduced; flagged to the user to report exact steps/browser/error if it
  recurs.
- **In-`/panel` unverified-email reminder banner — DONE** (this session):
  `panel-verify-email-banner` shown on `/panel` whenever `user.emailVerifiedAt`
  is null, linking to `/verificar-email?next=/panel`. e2e assertion added to
  `trust-registration-v2.spec.ts` (banner visible right after the soft-gate
  skip, gone after verifying via the token link). **On `develop` only, not yet
  forwarded to `main`** (new scope, not a break-fix — needs the user's OK).
- **Real local verification (Docker started this session, not just CI):**
  at `develop@82bde39` — 106 unit + **134 e2e + 8 compliance (R-1…R-13), all
  passing** against a real local Postgres, including R-7/R-8 (the public
  `/d/[token]` URL serves the exact PDF with no auth/cookie/interstitial —
  Phase 4's requirement, confirmed automated, not just code review). Typecheck
  + lint + format also clean. The one thing this cannot verify is a literal
  second physical device scanning a live QR against a reachable HTTPS
  URL — that needs the real deployment.

## Launch hardening (2026-09-05, user directive — close remaining launch-relevant gaps per issues #20-#47)
- **Issue review done** (code-verified, not just forge state — every one of #20-#47 is still OPEN
  on the forge; none closed yet, pending the closing pass below):
  - **Substantially complete, verified in production or gate-green locally:** #16-20 (launch happy
    path), #21 (brand), #22 (landing V2, superseded/extended by #35/#42/#46), #23 (registration),
    #25 (creator V2 — templates/autofill/autosave), #26 (driver delivery/share/QR verify), #27+#37
    (team/multi-user), #28 (acquisition engine — prospects/invites/operator dashboard), #29
    (generation reliability/diagnostics), #30 (auth UI + real Google OAuth, D-046, inert pending
    credentials), #31 (creator UX), #32 (guides/blog CMS), #33 (admin V2 shell), #34 (CSV export +
    workflow status + integration boundary), #35 (persona landing), #36 (document cockpit), #38
    (auth entrypoints hardened), #41 (goods structured locations/dates — passenger split explicitly
    deferred per the issue's own gate), #42 (Praetoria trust + lightweight lead gate + full onboarding
    on repeat — verified in production TEST A/B), #44 (launch sequence — Phase 0 blockers all met),
    #46 (trust landing + signup + email verification, soft gate).
  - **Gaps found and closed this session:** #24 (panel was plain text/list UI — D-047 icon-led
    visual layer, phase 1; full IA still open), #45 (route data lived only in a JSON blob, no
    commercial-consent model — D-048 added `DecaRouteIntel` + `CommercialConsent`), #47 (admin
    company detail was missing verification/terms/consent/DeCA-rate fields — D-049).
  - **Genuinely not started (deliberate, on the record):** #39 (company logo on PDF — its own
    issue since D-036), passenger transport type (#41 §4/§5, blocked on legal research per the
    issue's own instruction).
  - **Real-UI walkthrough DONE this session (D-050), on local dev, not just code review:**
    registered a real company end-to-end (profile picker, terms, data-protection notice — found and
    fixed a double-period copy bug live), viewed the new icon-led `/panel` + `/panel/datos`,
    toggled commercial consent end-to-end, generated a real goods DeCA, then used "Repetir /
    duplicar" to generate a second one changing only the two dates — new id/token/QR, old document
    untouched, both in `/panel/historico`, confirming second-DeCA speed with a real timed pass. A
    `DecaRouteIntel` row was confirmed written correctly in Postgres for both. This was on
    `develop` locally — **not yet re-verified on decaprofesional.es**, since `develop` hasn't been
    merged to `main`/redeployed this session (production still runs the pre-D-047/048/049 build;
    confirmed healthy: `/health` → `db:up`, D-042/D-043 trust copy live).
- **Not yet actioned this session:** Resend/hCaptcha configuration (external, user's task, D-029
  already names it); a full `/panel` IA rebuild (separate nav pages for Vehículos/Rutas/Mi
  empresa/Configuración — D-047 scope note); route-intelligence dashboard (#45 explicitly defers
  it); closing/commenting the forge issues themselves (queued next — Keel never closes on its own
  code-reading alone, but D-047/048/049 plus the existing gate-green evidence are enough to close
  #24 (phase-1 note), #45 and #47 with an explicit "what remains" comment, and to comment
  what-shipped-where on the others without closing them yet pending the outstanding real-UI pass).

**D-051: `develop` (D-047…D-050) merged to `main` at `a34ec6a`, on the user's explicit request.**
Not yet deployed/migrated on production — see D-051 for what remains (redeploy + `prisma migrate
deploy`).

## Product hardening — PRIORITY 1 (2026-09-05, owner directive: registration gate + email verification)
- **D-052 done, on `develop` (`a21252b`):** `POST /api/deca` now requires an authenticated session
  before validation runs (401 `auth_required`) — a DeCA can no longer be generated anonymously at
  all, superseding D-042/D-043's lightweight anonymous-first design. The wizard still lets a visitor
  fill all 3 steps anonymously (`sessionStorage` draft unchanged); only the final step replaces
  "GENERAR DECA" with an inline auth-gate (`auth-gate` testid) linking to `/registro?next=%2Fcrear` /
  `/entrar?next=%2Fcrear` — same-tab navigation, so the draft survives with zero extra plumbing.
  Removed the superseded one-time lead-gate (`lib/deca/lead.ts` deleted).
- **D-053 done, on `develop` (`a21252b`):** email verification is now ALSO a hard gate on generation
  (403 `email_not_verified`, checked fresh from Postgres every call) — supersedes D-043's "soft
  gate" framing for generation specifically (login/browsing stay unaffected). Fixed the real bug the
  owner reported: "Ya he confirmado mi cuenta" used to navigate unconditionally with no server check
  — it now calls a new `GET /api/auth/verify-email/status` and only proceeds if truly verified,
  else shows "Tu correo todavía no está verificado…" and stays put (negative case has its own e2e
  test, UI + API both asserted blocked). Registration/resend no longer claim an email sent when the
  provider actually failed (both surface real `sent`/`delivery` state now; confirmed the bug is real
  — this session's own e2e runs log `verification_email_not_sent` on every registration, since local
  `.env`'s Resend key/domain are placeholders). Each new verification token invalidates the previous
  one (no unlimited active tokens). Found and fixed a related Next.js client-router-cache staleness
  bug along the way (`router.refresh()` now pairs with every post-auth `router.push(next)`).
  **Blocked on a real credential (not code):** actually receiving the email in a real inbox needs a
  real Resend API key + verified sending domain — production's Resend status is unconfirmed this
  session (ask the user to confirm/provide it; local dev already exercises resend/cooldown/expired/
  used/invalid-token via the `FVD_EXPOSE_RESET_TOKEN` test seam, just not real delivery).
- **D-054 done, on `develop` (`a21252b`):** investigated the user's report that every `/panel/*`
  screen works in production except `/panel/datos`. Root cause: `getCommercialConsent()` (D-048)
  queries a table from migration `20260905095427_route_intel_and_commercial_consent`, which D-051
  explicitly recorded as NOT YET applied to production while the calling code is live — an unguarded
  query crashing the whole page (the same class D-041 already fixed once for /blog+/guias). Fixed to
  fail safe (logs + returns "not granted") instead of crashing. **Still needs**: the user to confirm
  `prisma migrate deploy` has actually run on production for that migration — the code fix prevents
  a crash either way, but the toggle won't persist until the table exists.
- Gate green: 131 e2e (incl. 8 compliance) + 118 unit + typecheck + lint + format + keel-verify.
  ~20 e2e spec files updated for the new hard gates. Pushed to `origin/develop`.

## Product hardening — PRIORITY 2 (2026-09-05, same session, owner directive: #24 real master-data system)
- **D-055 done, on `develop`:** `SavedCompany`/`SavedVehicle` re-scoped from per-user to
  per-COMPANY (shared team resource, TEAM #27) — migration `20260905133820_workspace_saved_master_data`,
  data-preserving (backfills `company_id` from each row's creator, no data lost). `SavedAddress`
  replaced by `SavedLocation` (structured: name/address/postalCode/city/province/country + load|
  unload|both type, matching the DeCA's own location shape exactly) — existing addresses migrated in.
  `SavedCompany` gains `role` (shipper|carrier|both), contact fields, `lastUsedAt`. `SavedVehicle`
  gains `alias`, `lastUsedAt`. Required fields tightened to match the DeCA's own validation (a saved
  record missing postal code/city/province/address could "save" yet still force manual retyping —
  defeats the point).
  Wizard: role/type-filtered `<select>` dropdowns for cargador contractual, transportista efectivo,
  lugar de carga, lugar de descarga, vehículo (native, accessible, matches existing convention) —
  selecting one populates every field immediately; "usar el mismo" quick actions copy shipper⇄carrier;
  "last used" tracked server-side (`usedSaved` in the create payload, best-effort bump, never blocks
  generation). `/panel/datos` UI (`SavedDataManager`) rebuilt for the new fields; also fixed a found
  bug where its add-forms never reset after a successful save.
  Editing/deleting saved data still never mutates a generated DeCA (unchanged BUILD 10 guarantee,
  DeCAs hold their own data copy).
  New `tests/e2e/master-data.spec.ts`: the issue's exact acceptance bar — create records, build a
  DeCA from ONLY the dropdowns, generate, duplicate, change only dates, generate again; "materially
  faster" asserted as a data-entry-action count (2 vs 9), not wall-clock (Playwright fills instantly
  regardless of field count, so timing isn't a meaningful proxy for human typing effort).
  Gate green: 132 e2e (incl. 8 compliance) + 118 unit + typecheck + lint + format + keel-verify.
- **Not done / deferred:** a bespoke type-ahead combobox beyond native `<select>` filtering
  (accessibility risk vs. UX gain judged not worth it — D-055); `docs/reference/endpoints.md` doesn't
  exist at all yet (pre-existing Phase 6 gap, not from this slice — `docs/api/INDEX.md` kept current
  instead, including two previously-undocumented endpoints found along the way).
- **Not yet on `main`** — awaiting the user's explicit merge instruction (this session did not ask).

## Product hardening — PRIORITY 3 + 4 (2026-09-05, same session, owner directive: #49 premium PDF + #39 logo, together)
- **D-056 done, on `develop`:** `lib/pdf/deca-document.tsx` fully redesigned — navy header with
  brand mark + optional customer logo + a document-status pill, two-column party cards (cargador
  contractual / transportista efectivo), two-column route cards with accent-dot kind labels and
  inline dates, a labeled goods/vehicle grid, and a footer with the verification URL + QR in a fixed
  bottom-right quiet zone. Every value is still a real `<Text>` node — the 8-test compliance suite
  (R-3/4/5/6/7/8/11/13 + FIX-18) passed unmodified. Colours stay within the existing brand (navy +
  `BRAND.color`), no new font or dependency.
  `Company.logoDataUri` (new nullable column, migration `20260905141620_company_logo`) — optional
  PDF header logo, validated from the DECODED bytes (`lib/company/logo.ts`: hand-parses real PNG/
  JPEG headers for dimensions, rejects SVG/anything else, size-capped ≈512 KB), never a client-
  claimed MIME type. Read once at generation time in `createDeca`/`correctDeca` and baked into that
  render only — changing/removing the logo later cannot touch a stored PDF, by construction (no
  extra guard needed). New `/panel/empresa` (owner-only upload/preview/remove; a member sees it
  read-only) fills WORKSPACE #24's "Mi empresa" nav slot.
  **Verified with real generated PDFs, not just automated text-extraction** (registered a real
  account, generated several DeCAs via the live API, read the actual rendered pages): confirmed the
  premium layout, a customer logo rendering correctly in the header, long values (company names/
  addresses/goods) wrapping cleanly with no clipping or shrunk text, a correction showing "DOCUMENTO
  CORREGIDO", and — critically — that removing/changing the company logo left an earlier document's
  PDF byte-for-byte identical (same SHA-256) while a brand-new document reflected the change.
  New tests: `tests/e2e/company-logo.spec.ts` (4) + `tests/unit/company-logo.test.ts` (9).
  Gate green: 136 e2e (incl. 8 compliance) + 127 unit + typecheck + lint + format + keel-verify.
- **Closed by D-059:** admin (#33) now surfaces "has a logo" on the company detail page.
- **Still deferred:** the rest of the `/panel` IA (Configuración) beyond the new "Mi empresa"
  (D-047's existing open scope note).
- **Not yet on `main`** — awaiting the user's explicit merge instruction.

## Product hardening — PRIORITY 5 (2026-09-05, same session, owner directive: landing/brand polish, #46)
- **D-057 done, on `develop`:** found and fixed a real accuracy bug — D-052's hard registration
  gate (PRIORITY 1) made several landing/legal/SEO copy claims false ("sin registro"/"sin cuenta"
  for DeCA generation, inherited from before that change). Fixed the hero trust row, a step
  caption, a persona bullet, two SEO FAQ answers, and a registro-page recovery link. **Also fixed
  `app/privacidad/page.tsx` and `app/cookies/page.tsx`**, which still described the "Identidad
  ligera"/"Primer DeCA" lead-gate data-collection mechanism that D-052 deleted — a stale privacy/
  cookie notice describing a removed data practice, not just marketing copy.
  Added a visual product-features showcase (8 icon cards: Generar DeCA, PDF+QR, Histórico,
  Duplicar, Vehículos/Empresas/Lugares habituales, Custodia digital) reusing the workspace's own
  icon set (`components/panel/icons.tsx`, +2 new icons) in place of a plain text checklist —
  answers the issue's "show visually" list and doubles as PRIORITY 6 progress (shared icon
  language between landing and product). Confirmed live in a real browser: the hero already
  matched the owner's exact requested copy word-for-word from earlier work (D-043); the new
  section renders consistent with the panel's visual style.
  **Assessed, not rebuilt:** the landing's overall structure/hero/personas/FAQ were already built
  across #22/#35/#42/#46 in prior sessions and substantially satisfy the issue; a ground-up visual
  redesign was judged unwarranted — this slice's job was the accuracy sweep + the one genuinely
  missing visual element.
  Gate green: 136 e2e (incl. 8 compliance) + 127 unit + typecheck + lint + format + keel-verify.
- **Next up:** PRIORITY 6 (consistent product UI) — largely already advanced by this session's own
  work (D-047's panel icon system now also used on the landing); no further dedicated slice queued
  before this session ends.

## D-058: `develop` (D-052…D-057) merged to `main` at `89e7881`, on the user's explicit request ("push to main" before leaving)
Fast-forwarded from `e7f8745`. Full local gate green immediately before merging (typecheck, lint,
format, 127 unit, 8 compliance, full landing suite). **Not yet deployed/migrated on production** —
two new migrations (`20260905133820_workspace_saved_master_data`, `20260905141620_company_logo`)
need `prisma migrate deploy` on Hostinger after the next redeploy, same as D-051's still-pending
migration. See D-058 for the full pre-merge evidence and what remains.

### If a session resumes this project — read first
- **The user's `/panel/datos` production report (D-054) is fixed in code but NOT deployed.** Confirm
  with the user whether a redeploy + `prisma migrate deploy` has happened since this session; if not,
  that is the very first thing to raise.
- **Google OAuth credentials were set on Hostinger by the user this session** (their message, not yet
  independently verified) — once deployed, the existing D-046 code should activate with no further
  changes; verify live rather than assuming.
- **Real Resend delivery is still unconfirmed** — the user said they will configure it (see D-053).
  Do not close out email-verification-as-tested until a real inbox receipt is confirmed.
- **D-059 done, on `develop` (`main` at merge `89e7881` predates it — see below):** closed D-056's
  deferred admin "has a logo" item, and did a real-browser PRIORITY 6 consistency check across
  `/panel`, `/panel/empresa`, `/crear` — the whole app already shares one CSS-custom-property design
  system from before this session, so 1–5's new components were consistent by construction. No
  further dedicated PRIORITY 6 slice queued.
- **All 6 owner priorities substantively addressed this session** (D-052…D-059). If resumed: verify
  nothing new has come in from the owner before assuming the list is closed — Keel decisions are
  never re-opened on the assistant's own initiative, but a fresh directive supersedes this note.

## D-060: production migration gap fixed live; D-061: lightweight lead gate restored (owner reversal)
- **D-060 — production incident, RESOLVED.** All 3 pending migrations
  (`20260905095427_route_intel_and_commercial_consent`, `20260905133820_workspace_saved_master_data`,
  `20260905141620_company_logo`) are now applied to production — the user ran their DDL directly via
  the Supabase SQL Editor (session-mode pooler was exhausted, blocking `prisma migrate deploy`), this
  session reconciled `_prisma_migrations`. Live "Entrar" and "Crear DeCA" confirmed working again by
  the user. The stale warnings above about undeployed migrations are now HISTORICAL — do not re-raise
  them without checking current production state first.
- **D-061 — owner directive, reverses part of D-052/PRIORITY 1:** a DeCA can once again be generated
  by an anonymous visitor with just a name + email (lightweight lead gate); only a SECOND anonymous
  DeCA from the same browser requires full registration. Authenticated users still need a verified
  email (D-053, unchanged). Implemented in `app/api/deca/route.ts`, `app/crear/page.tsx`,
  `components/deca/wizard.tsx`, `lib/deca/lead.ts` (recreated). Full test suite updated to match
  (see D-061 in `decisions.md` for the file list). Gate green: 137 e2e + 127 unit + typecheck + lint +
  format. Not yet merged to `main` as of this note — see next action.
- **Next action:** merge `develop` → `main` and push once the owner confirms, per standing "push to
  main" authorization pattern this session — then no further code deploy step is needed for D-060
  (deployment-state only), but D-061 IS a real code change and DOES need a `main` merge + redeploy to
  reach production.

## D-062: I18N #50 slice 1 — core i18n architecture + ES/EN translation of the critical path
- Owner filed GitHub issue #50 (full product internationalization) then asked to start on it. Scoped
  to a first slice (owner's explicit choice when asked): build the real i18n engine + language
  switcher + `User.preferredLocale` persistence + locale-aware verification emails, and translate
  exactly the critical QA flow #50 named — landing header/hero, signup/login, email verification,
  panel shell, the full DeCA creator (all fields/gates/result), and history. New migration
  `20260905190509_user_preferred_locale`. Deliberately deferred (documented on the issue, not
  silently dropped): saved-data management screens, document cockpit, admin, blog/guías, legal
  pages, the PDF itself (needs the owner's sign-off on legal terminology first), locale-prefixed
  URLs, and zod validation-error messages.
  Architecture: cookie-based (`fvd_locale`), not URL-prefixed — avoids duplicate-content SEO risk
  and the large mechanical risk of wrapping every route in a `[locale]` segment on a live product.
  Caught and fixed a real bug mid-slice: the locale resolver's `Accept-Language` fallback defaulted
  to English under headless Chromium (and would for a real Spanish user with an English OS), broke
  29 e2e tests; removed — Spanish is now the unconditional default absent an explicit cookie. Gate:
  137 e2e + 127 unit + typecheck + lint + format, plus a real-browser walk (ES→EN→ES, no mixed
  screens on the translated path). See `decisions.md` D-062 for the full file list. Issue #50 stays
  OPEN with this slice's scope commented — most of the epic remains for future sessions.

## D-063: SECURITY #53 P0 block 1 — auth/session hardening
Owner filed #51-#54 (desktop, legal, security incl. mandatory admin 2FA, multilingual UI) with an
explicit execution order and "keep moving, don't ask" instruction. Working through it in priority
order, P0 security first. This block: login/register now rate-limited (previously ZERO — real gap),
mailer logs the real provider error on failure (found the placeholder `RESEND_API_KEY` is why local
delivery doesn't work), password reset invalidates the prior token, sessions are now revocable
(`User.sessionVersion`, migration `20260905204705_user_session_version`) — a stolen cookie or a
session opened before a password reset now actually dies, plus a "log out everywhere" button —
and the password policy is 12+ chars/complexity/no-common/no-email-or-company-name, enforced
identically client + server via one isomorphic module. Gate: 141 e2e + 133 unit, all green
(content-cms.spec.ts reconfirmed as the pre-existing --workers=3-only flake). See `decisions.md`
D-063. **Continuing immediately** to mandatory admin TOTP 2FA (next P0 item) — not stopping to ask.

Last updated: 2026-09-04 — Product V3 (#29–#38) complete, merged to `main`; D-040 nav discoverability;
D-041 fixed the /blog + /guias production crash (unguarded Prisma calls → the generic error
boundary) + the same unclassified-500 class of bug in DeCA generation, rebuilt /blog + /guias as
real pages, rebuilt the footer (4 columns), added 4 legal pages, audited nav (no dead links). Gate:
105 unit + 129 e2e + 8 compliance. `develop` == `main`. No version tag.
D-042 (goods-only structured loading/unloading + separate load/unload dates, PRODUCT #41) done on
`develop`, gate green (106 unit + 129 e2e). D-043 (Praetoria trust identity, versioned terms,
email verification, lightweight lead gate — TRUST #42 + GROWTH #46) done on `develop`, gate green
(106 unit + 134 e2e). Production verification blocked on DNS cutover to decaprofesional.es (user's
infra task, not code).
DNS resolved 2026-09-04 (later same day). `develop` (D-042+D-043) merged to `main`, CI red on
format:check, fixed and re-forwarded (`04ad0e3`) — `main` CI fully green. Root-caused the
production `db: "down"` health check to a Supabase session-pooler connection-limit exhaustion
(no `directUrl` split between app runtime and migrations) — fixed in `prisma/schema.prisma` +
env docs; needs the user to set `DATABASE_URL`(6543,pgbouncer)+`DIRECT_URL`(5432) on Hostinger and
redeploy. Added an unverified-email reminder banner to `/panel` (`a4a28bb`, on `develop` only).

## D-064: SECURITY #53 P0 block 2 — mandatory admin TOTP 2FA
Continuing the owner's #51-#54 execution order right after D-063, no pause. Admin `/admin` access
(pages AND every `/api/admin/*` route) now requires real TOTP 2FA — RFC 6238, no new dependency,
QR + manual-secret enrollment, one-time recovery codes, step-up re-auth for destructive actions.
Found and fixed a real gap while wiring it: every existing admin API route only checked the
`internal` role, never 2FA — a compromised password alone could already reach them. Migration
`20260905211042_admin_2fa_and_audit_log` (also adds the append-only `SecurityAuditLog` table, not
yet wired to real events beyond the 2FA routes themselves — follow-up). Moved the existing admin
pages into an `(protected)` route group (URLs unchanged) so the new 2FA pages don't inherit the
gate they're supposed to satisfy. Gate: 148 e2e + 139 unit, all green — plus a real-browser
enrollment walkthrough (QR, wrong-code rejection, recovery codes, landing on `/admin`). See
`decisions.md` D-064. **Continuing immediately** to step-up wiring for real destructive actions,
audit-log event coverage, backup/recovery review, and a security-headers pass.

## D-065: SECURITY #53 P0 block 3 — audit log wired to real events
Audited what destructive admin actions actually exist before wiring anything (none of
company/user-delete, role-change, security/legal-config, bulk-export exist yet — not a gap, a scope
finding; `requireStepUp()` has no real caller beyond 2FA-code regeneration for now). Wired
`recordAudit()` into what DOES exist: admin login success/failure (admin accounts only), password
reset, and the content-CMS publish/unpublish/archive actions (already a soft archive, never a hard
delete). Gate: 152 e2e + 139 unit, all green. One new documented parallel-only flake (recovery-code
regeneration racing under `--workers=3`, shared seeded admin — passes in isolation, CI's `retries:1`
absorbs it). See `decisions.md` D-065. **Continuing** to backup/recovery review and a
security-headers pass, then #51/#52/#54.

## D-066: SECURITY #53 P0 block 4 — re-authentication required to change primary email
Found and fixed: the email-change endpoint changed the account's email with only an active
session, no password check. Now requires `currentPassword` (constant-time verified), and an
internal-role caller additionally needs a fresh TOTP check (step-up, D-064) — the first real
caller of `requireStepUp()` outside the 2FA routes themselves. Zero prior test coverage on this
flow; added it. Also fixed a genuine flake in D-065's own new admin-login-audit test (rescoped to
the actor's own id instead of an unscoped "2 most recent rows", which another concurrent test could
occupy under `--workers=3`). Gate: 154 e2e (2 pre-existing documented parallel-only flakes,
unrelated) + 139 unit, all green. Session/authorization hardening (owner's P0 item 7) is now
substantively complete — see `decisions.md` D-066 for exactly what remains not applicable (no
idle-timeout distinct from the TOTP-freshness window; no admin-2FA-reset feature exists to
invalidate sessions after). Owner sent #55 (premium product system) + #56 (multi-level control
center: super-admin/company-admin/operator/read-only roles, invitations, route intelligence) —
explicitly queued by the owner for AFTER the current security/legal/auth work; noted, continuing
the P0 queue first per their own stated order.

## D-067: SECURITY #53 P0 blocks 5+6 — backup/recovery, security headers, document-loss protection
All three turned out to be audit findings, not code changes. Backup/recovery: wrote an honest
runbook in `docs/07-release.md` §6 stating plainly what can't be verified from code (Supabase's
actual plan tier / PITR / bucket-versioning settings — dashboard-only, never guessed at), a genuine
independent recovery path that already exists (DeCA PDFs are re-renderable from the `dataJson`
stored alongside them, not just the rendered bytes), a restore procedure, and an explicitly-empty
"restoration-test log" — no claim of a tested backup exists because none has been tested. Security
headers: already solid from an earlier session (CSP/HSTS/Permissions-Policy on pages via
`middleware.ts`, X-Content-Type-Options/Referrer-Policy/X-Frame-Options on EVERY route including
API/PDF via `next.config.ts`, no permissive CORS anywhere) — reviewed against the fuller P0 list,
no gaps found, no changes made. Document-loss protection: grepped the whole API surface for any
delete touching `deca`/`deca_version`/`company`/`user` — none exist; combined with `deca_version`
already being append-only, the owner's requirements are satisfied by the absence of any such
feature, not a gap to close. See `decisions.md` D-067. **Continuing** to #51 (desktop visual
overhaul), #52 (legal identity/liability), #54 (Spanish-first i18n expansion) per the owner's
execution order — #55/#56 remain queued after.

## D-068: LEGAL #52 — real legal identity, custody/liability/jurisdiction framework, GDPR controller/processor split
Real registered address + dedicated support email replace the earlier placeholders in
`lib/legal-entity.ts`/`lib/brand.ts`; fixed two stale-prose bugs found in the sweep (a placeholder-
dependent address sentence, and a false "account always required for first DeCA" claim contradicting
D-061). `app/terminos/page.tsx` rewritten with the substantive content the owner's #52 spec required:
tri-party responsibility split (PRAETORIA/customer/transport parties), explicit custody ≠
certification-of-truth framing, a lawful B2B limitation-of-liability clause with the owner's exact
enumerated non-verified-items list (preserving liability for fraud/gross negligence/non-waivable
duties), a free-launch-phase caveat (promotional/temporary, no perpetual-free promise), and a
Valencia jurisdiction clause qualified against mandatory/consumer rules. `app/privacidad/page.tsx`
gained a GDPR controller (account/auth/security/billing) vs processor (Art. 28, data inside generated
DeCA documents) section. Checked and confirmed adequate without changes: `TermsAcceptance` already
versioned/timestamped/append-only; the landing page's free-launch line already secondary, not
dominant; `app/cookies/page.tsx` accurate as-is. Found and fixed one real regression during the gate:
new GDPR prose made a `trust-registration-v2.spec.ts` `getByText` assertion ambiguous
(case-insensitive substring match hit both a heading and new bold text) — fixed by scoping it to
`getByRole("heading", ...)`. Full gate green: typecheck/lint/prettier clean, 139/139 unit, 151 e2e
passed + the 2 already-documented parallel-only flakes (unrelated to this change) + the one
regression above fixed and re-verified. See `decisions.md` D-068. Pushed to `develop` only.
**Continuing** to #51 (desktop visual overhaul) next, per the owner's execution order.

## D-069: DESIGN #51 slice 1 — fake-QR artwork removed, result screen widened for desktop
Fetched issue #51's full text via `gh issue view 51` for its exact acceptance criteria.
`components/site/deca-preview.tsx` (landing hero/product-proof illustration, not the real result
screen) had its 4×4 fake-QR-style grid replaced with the existing `DocumentIcon` in a tinted badge —
satisfies the explicit "remove the fake QR square" acceptance item. `app/crear/[id]/page.tsx` (the
real `DeCA generado` screen) widened from a centered 680px single column to a 1120px two-column
desktop layout (data + history left, actions + real QR sidebar right, mobile unchanged) with a new
reference/version/status chip row. Gate: typecheck/lint/prettier clean, the 29 e2e tests covering this
screen + landing (incl. 360/768/1280px overflow checks) all passed, plus a real Chrome walkthrough of
the full wizard → result screen at 1440px confirming the visual fix. Landing's broader visual richness
(personas/steps/showcase sections), registration, wizard-step chrome and `/panel` are the rest of #51
and are NOT done yet — deliberately sequenced behind this concrete, testable slice. See `decisions.md`
D-069. **Continuing** with the rest of #51 next.

## D-070: DESIGN #51 slice 2 — `/panel` widened to a two-column desktop layout
`app/panel/page.tsx` widened from a centered 900px single column to a 1200px two-column desktop
split (quick actions + recent documents left, saved-data summary cards as a sidebar right); mobile
unchanged. `AppNav`'s horizontal tab bar (shared by every `/panel/*` route) deliberately left as-is —
a sidebar-nav rework is a separate, larger, higher-risk slice, not silently dropped. Hit and diagnosed
a false-failure flake: a stray `npm run dev` from the prior manual browser check was still on port
3000, causing 8 unrelated e2e failures until killed via `netstat`/`taskkill`; re-ran clean, 16/16
passed incl. the `/panel` a11y check. Verified visually by registering a real throwaway account and
viewing `/panel` at 1440px. See `decisions.md` D-070. **Continuing** with the rest of #51.

## D-071: I18N #54 slice 1 — full English coverage of the landing page
Moved from #51 to #54 after #51's objective/checkable acceptance items were met — its remaining scope
is open-ended aesthetic polish rather than bounded fixes. Closed D-062's named follow-up: translated
every remaining landing section (3 steps, product benefits, all 4 personas, the 8-item daily-use grid,
7 regulation points, all 10 FAQ entries, every heading/CTA) into `lib/i18n/dictionaries/en.ts`,
key-parity enforced by `satisfies Messages` against `es.ts`. Deliberately left untranslated (and
explained inline): PRAETORIA's own legal-identity sentence (`OPERATOR_TRUST.body`) — translating a
legal entity's own wording is legal-review territory, not a landing-copy task — plus the footer and
page metadata (no `generateMetadata` wiring yet). Fixed two real locale bugs found while wiring this:
two CTA buttons were hardcoded to the Spanish `HERO.cta` regardless of locale. Gate: typecheck (the
`satisfies Messages` parity check), lint, prettier, `vitest run` 139/139, and the Spanish-path e2e
specs (`landing.spec.ts`, `auth-entrypoints.spec.ts`, `creator-ux31.spec.ts`) all green and unchanged.
No e2e coverage exists yet for the English locale at all (noted as a gap, not fixed here) — verified
instead by a full manual Chrome walkthrough of the entire English landing page section by section.
See `decisions.md` D-071. **Next:** further #54 language expansion (CA/EU/GL, then FR/DE/IT) is a
much larger and higher-risk effort, especially translating the legal pages accurately — flagged to
the owner rather than started speculatively.

## D-072: I18N #54 slice 2 — Catalan added; landing scales to any locale; legal pages stay Spanish-only (owner decision)
Owner decided (asked via AskUserQuestion): translate product UI into remaining #54 languages
(Catalan, Basque, Galician, French, German, Italian); legal pages (`/terminos`, `/privacidad`,
`/aviso-legal`) stay Spanish in every locale until a professional legal review exists — standing rule
for the rest of #54. Refactored `app/page.tsx` to read the landing unconditionally from
`getDictionary(locale)` instead of D-071's `isEn ? x : y` branching, since `es`'s dictionary content
now matches `lib/content/landing.ts` exactly — adding a locale is now a dictionaries-only change, no
page edits. Discovered `crear`/`panel`/`historico`/`result`/`auth`/`emails` were already fully
bilingual from an earlier session (not just landing) — so a new locale dictionary makes the entire
product UI available in that language immediately. Added `lib/i18n/dictionaries/ca.ts` (Catalan, full
`satisfies Messages` parity), wired into both `DICTS` maps (`lib/i18n/server.ts` AND
`lib/i18n/client.tsx` — two separate maps that must stay in sync) plus `LOCALES`. Found and fixed a
real regression: a 3rd language-switcher button broke the 360px no-overflow test — root cause was
this project's Tailwind `--breakpoint-sm` being redefined to 360px, making `sm:` fire exactly at the
test's viewport rather than acting as a "wider screens" escape hatch (documented as a lesson for next
time). Fixed by dropping the `sm:` variants and shrinking header padding unconditionally. Gate:
typecheck/lint/prettier clean, 139/139 unit, 153/154 e2e (1 pre-existing documented flake). Verified
live: toggled to Catalan, confirmed the landing AND the full `/crear` wizard render correctly with
zero page-level code for the new locale. See `decisions.md` D-072. **Not done, explicitly deferred by
owner's own scope decision:** Basque/Galician/French/German/Italian dictionaries, and all legal-page
translation. Basque flagged as needing extra translation-quality scrutiny (language isolate, lower
confidence than the Romance languages here).

## D-073: I18N #54 slice 3 — Galician added; fixed a keyboard-reachability test that breaks with every new locale
Added `lib/i18n/dictionaries/gl.ts` following the exact Catalan pattern (D-072) — no `app/page.tsx`
changes needed at all, confirming the dictionary-only scaling claim. Found and fixed a structural
regression: `tests/e2e/a11y.spec.ts`'s keyboard-reachability test had a hardcoded 12-Tab-press budget
to reach the header CTA, and each new language switcher button eats one more tab stop — Catalan had
already pushed it to the edge, Galician broke it outright. Raised the budget once to 30 (covers the
full 8-locale target: es/ca/eu/gl/en/fr/de/it) instead of re-tuning it per locale. Gate: typecheck
(parity check), lint, prettier clean, 139/139 unit, 154/154 e2e with zero flakes this run. Verified
live: Galician renders correctly, 4-button switcher fits with no overflow at 1440px. See
`decisions.md` D-073. **Continuing** with Basque next (flagged for extra scrutiny — language isolate,
lower translation confidence than the Romance languages done so far), then French, German, Italian.

## D-074: I18N #54 slice 4 — Basque added (flagged, lower confidence); language switcher fixed permanently
Added `lib/i18n/dictionaries/eu.ts` (Basque), slotted into `LOCALES` between Catalan and Galician per
the owner's specified order. **Explicit caveat, not glossed over:** Basque is a language isolate with
grammar nothing like the Romance languages already done (ergative case, agglutinative morphology) —
this session's translation confidence here is meaningfully lower, and a native-speaker review is
recommended before treating it as equally trustworthy. Also fixed the language-switcher overflow
problem PERMANENTLY instead of patching it a third time: D-072 and D-073 each hit a 360px overflow
regression from one more switcher button; the switcher now has a fixed max-width with internal
horizontal scroll (`overflow-x-auto`), decoupling its width from how many locales exist — French,
German, and Italian can be added later with zero header changes. Gate: typecheck (parity), lint,
prettier clean, 139/139 unit, 153/154 e2e (1 pre-existing flake, unrelated). Verified live: Basque
renders correctly, switcher's internal scroll works at 1440px. See `decisions.md` D-074. **Continuing**
with French, German, Italian next — all well-resourced languages with high translation confidence,
unlike Basque.

## D-075: I18N #54 slice 5 — French added
Added `lib/i18n/dictionaries/fr.ts` following the same pattern as Catalan/Galician. Zero header/page
changes needed for the 6th switcher button — confirms D-074's fixed-width, internally-scrolling
switcher absorbs new locales with no further changes. Gate: typecheck (parity), lint, prettier clean,
139/139 unit, 152/154 e2e (2 pre-existing flakes, unrelated, no new regression). Verified live: French
renders correctly across nav/hero/trust-row/CTA. See `decisions.md` D-075. **Continuing** with German,
then Italian.

## D-076: I18N #54 slice 6 — German added
Added `lib/i18n/dictionaries/de.ts` following the same pattern. Zero header/page changes needed for
the 7th switcher button. Gate: typecheck (parity), lint, prettier clean, 139/139 unit, 153/154 e2e
(1 pre-existing flake, unrelated). Verified live: German renders correctly. See `decisions.md` D-076.
**Continuing** with Italian — the last of the six UI-only languages from the owner's D-072 scope
decision.

## D-077: I18N #54 slice 7 (final) — Italian added, completing the 8-locale set; fixed a WCAG target-size regression
Added `lib/i18n/dictionaries/it.ts`, completing the full es/ca/eu/gl/en/fr/de/it locale set the owner
specified. **Found and fixed a real accessibility regression, not a flake:** the 8th switcher button
pushed individual button touch targets under WCAG 2.2's 24×24px minimum (axe `target-size`/
`target-offset`), caught by 4 a11y test failures across `/`, `/crear`, an SEO page, and `/panel/*`.
Fixed by widening buttons to `px-2` + `min-w-8`, which the D-074 fixed-width/internal-scroll switcher
absorbs without reintroducing the earlier page-overflow problem — width cap solves overflow, size
floor solves touch-target a11y, both now satisfied together. Gate: typecheck (8-locale parity),
lint, prettier clean, 139/139 unit, 153/154 e2e (1 pre-existing flake). Verified live: Italian renders
correctly, 8-button switcher touch targets properly sized. See `decisions.md` D-077.

**I18N #54 status:** product UI (landing, wizard, panel, auth, emails) now available in all 8 target
locales. Legal pages stay Spanish-only everywhere (owner decision, D-072). Basque carries an explicit
lower-confidence caveat pending native-speaker review. No automated i18n smoke test exists yet across
locales (only manual verification per slice) — flagged as a reasonable follow-up, not done this
session to keep slices bounded.

## D-078: PRODUCT #56 slice 1 — `read_only` (Auditor) company role, enforced server-side
Owner said "continue, you set the priority." Reviewed #55 (premium visual/component system — largely
superseded by the #51 work already done this session) vs #56 (multi-level control center: roles,
invitations, super-admin, route intelligence, search) and started #56 as the more foundational,
bounded next step. Audited the existing role model first: platform-level "Super Admin" is already
satisfied by `Role.internal` + mandatory 2FA (#53); company-level `owner`/`member` already map onto
#56's Company Admin/Operator. The one real gap was a Read-only/Auditor role — built it as this slice.

`CompanyRole` enum extended with `read_only` (additive migration, applied to local dev DB). `lib/team.ts`
gained a `canWrite()` helper and widened types. **Found and fixed a real bug** while extending the
"keep ≥1 owner" invariant in `changeRole()` — it only guarded owner→member demotion, not owner→
read_only, which would have silently zeroed out a company's admins. Server-side 403 checks added to
every mutating route a read_only member could reach (DeCA create/correct, saved-data create/delete,
templates create/delete) — the real security boundary. UI: role now selectable at invite time, "Solo
lectura" label added, `/crear` shows a dedicated read-only gate screen (translated into all 8 locales),
`/panel` hides create/duplicate actions for read_only users. Explicitly deferred, not dropped:
`/panel/datos`'s SavedDataManager still shows add/delete UI to read_only users (server rejects it
correctly, just a rougher UX) — noted as a follow-up. The external-carrier-vs-employee invite
distinction from #56 was NOT tackled — no external-invite mechanism exists yet, so there's no current
risk to fix, just a bigger future feature to build carefully.

Gate: typecheck, lint, prettier clean, 139/139 unit. New e2e test in `team.spec.ts` covers the full
flow: invite-time role selection, member-list label, history/detail view still works, `/crear` gate
renders, `/panel` hides create button, and a direct API call returns 403 regardless of any UI gate.
Full suite 154/154 passed. See `decisions.md` D-078.

## D-079: PRODUCT #56 slice 2 — company-scoped global search + Cmd/Ctrl+K command palette
Continued #56's "power-user UX" list. Reused `listHistory`'s existing free-text filter instead of a
second search path — new `lib/data/search.ts` wraps it, capped to top 8 hits. New `GET /api/search`
(company-scoped, available to `read_only` too — viewing isn't a write) backs a new
`components/panel/command-palette.tsx`: Cmd/Ctrl+K modal, debounced search, arrow-key nav, Enter to
navigate. Mounted in `SiteHeader` (gated on `authed && companyName`) rather than a new panel layout
file. Re-verified against the exact 360px-overflow and target-size tests that earlier i18n slices had
already found regressions in — both held with the new icon-only trigger. Found and fixed a real
test-hydration race (not a product bug): `Control+k` pressed before the client component's listener
attached, only visible under parallel workers — fixed with the same `networkidle` wait pattern already
used elsewhere in the suite. Also corrected three stale "owner only" doc claims in `docs/api/INDEX.md`
that predated this session (those routes never actually checked ownership, only company membership).
Gate: typecheck, lint, prettier clean, 139/139 unit, 154/154 e2e (2 pre-existing unrelated flakes). See
`decisions.md` D-079.

## D-080: PRODUCT #56 slice 3 — company-level route intelligence on the panel home
Found the entire data layer already existed from DATA #45 (commercial route-matching): `DecaRouteIntel`
rows have been written on every DeCA creation all along, just never read back for the company's own
use. New `lib/data/route-intel.ts`'s `getTopRoutes()` reads that data (fetch-then-group in JS, same
pattern as `lib/data/history.ts`), tracking each route's count and most-recent DeCA id. `/panel`
sidebar gained a "Rutas frecuentes" section with a real "quick create from route" link
(`/crear?from=<lastDecaId>`, reusing the existing duplicate-prefill path — no new prefill logic).
Respects the D-078 `read_only` gate. Deliberately shipped only this one item from #56's six-item route-
intelligence list (frequent routes + quick-create) rather than a shallow pass across all of them.
Gate: typecheck, lint, prettier clean, 139/139 unit, **157/157 e2e passed with zero flakes this run**.
New e2e test creates two DeCAs on the same route and verifies the count and quick-create prefill.
See `decisions.md` D-080. **Continuing** with the next #56 piece next.

## D-081: DESIGN #55 (landing-only per owner's explicit boundary vs #51/#56) — brand renamed "DeCA Profesional"; language switcher redesigned as a globe dropdown
Owner sent a large #55 directive with an explicit scope boundary: #51 = broad component/visual system,
#55 = landing page only, #56 = control center (already in progress). Renamed the brand from "DeCA
Fácil" to "DeCA Profesional" (owner's explicit current direction, reversing D-039's specific string
choice, not its no-attribution policy) — `lib/brand.ts` plus 3 hardcoded references now derive from
`BRAND.name`. This broke the header's 360px budget again (longer wordmark) — the same regression class
D-072/D-073/D-074 had already hit three times from the switcher growing. Fixed it properly this time by
implementing #55 §4 (language selector) instead of patching padding again: the switcher is now a
`<details>` globe-icon dropdown (reusing `AccountMenu`'s proven pattern) listing all 8 locales by
native name, with a footprint that can't regress regardless of locale count or brand-name length.
Gate: typecheck, lint, prettier clean, 139/139 unit, 155/157 e2e (2 flakes re-ran green in isolation,
confirmed unrelated). **This is the first of several #55 slices** — hero visual, free-value sections,
persona/trust/FAQ/footer polish, and full responsive re-verification remain. See `decisions.md` D-081.
**Continuing** with the #55 hero-visual slice next.

## D-082: DESIGN #55 slice 2 — hero visual richness (real QR, layered cards) + "Sin tarjeta" + footer address
Rebuilt `components/site/deca-preview.tsx` as two overlapping cards (creator behind, generated-result
in front) with a genuinely real server-generated QR (same `lib/pdf/qr.ts` the actual PDF uses, pointing
at the site's base URL) — never a decorative pattern. Added `hero.noCardNote` ("Sin tarjeta · Sin
límite de documentos durante la fase de lanzamiento.") to all 8 dictionaries, placed under the CTA.
Added the full registered address to the footer. Found and fixed two real regressions before shipping:
a WCAG color-contrast failure on the new status badge, and a CSS Grid intrinsic-min-width overflow at
768px (classic `min-width: auto` grid gotcha) — fixed with one `min-w-0`, verified with zero overflow
across all ten widths the owner's directive listed (375–1920px). Gate: typecheck, lint, prettier clean,
139/139 unit, 155/157 e2e (2 pre-existing flakes, unrelated). See `decisions.md` D-082. **Remaining
#55 work** (free-value section, visual storytelling sections, persona/trust/regulation/FAQ/final-CTA
polish) continues in subsequent slices — not attempted in one block.

## D-083: DESIGN #55 slice 3 — "Todo incluido durante el lanzamiento" free-value section
New section right after the "3 steps" section: a checklist grid of 12 features, 10 marked available
(including "Rutas frecuentes", the #56 feature shipped earlier this session) with a green check, 2
explicitly marked "Próximamente" (Modo inspección, Acceso API/ERP) with a dashed/empty-circle
treatment — never presented as if live, per the owner's hard constraint against advertising
unshipped features. `available` is a fact in `lib/content/landing.ts`, never localized; labels come
from a new `freeValueItems` dictionary key across all 8 locales. Hit and fixed the same class of
flex-overflow regression as D-082 (a `flex-1` label needing `min-w-0` to shrink under a badge) —
re-verified across the same 10 widths (375–1920px), zero overflow. Gate: typecheck, lint, prettier
clean, 139/139 unit, 156/157 e2e (1 pre-existing flake). See `decisions.md` D-083. **Continuing**
with the remaining #55 sections (visual storytelling, persona/trust/regulation/FAQ/final-CTA polish)
next.

## D-084: DESIGN #55 slice 4 — "por qué usarlo cada día" reframed; final CTA rebuilt
Two copy-focused sections using the owner's own suggested wording near-verbatim, across all 8
dictionaries. §7: heading → "Cada DeCA te cuesta menos tiempo que el anterior.", subhead → "Guarda
una vez. Reutiliza siempre." (value copy only — the section's existing feature-tile content
unchanged). §11: final CTA rebuilt with "Empieza ahora. Sin tarjeta." + a new supporting subhead + a
new microcopy line under the button ("Gratis durante la fase de lanzamiento · Sin tarjeta").
Found and fixed two real regressions: an e2e test hardcoding the old heading text (legitimate update,
not a weakened assertion), and a third contrast-on-translucent-background failure this session — fixed
by matching the already-passing `/90` opacity instead of the new `/80`. Gate: typecheck, lint, prettier
clean, 139/139 unit, 155/157 e2e (2 pre-existing flakes). See `decisions.md` D-084. **Remaining #55**:
visual storytelling (§5), persona cards (§6), trust/regulation/FAQ polish (§8-§10), micro-interactions
and density pass (§14-§15).

## D-085: LEGAL #52/#54 — legal pages stay Spanish-only; translated disclaimer added
Owner's own message this slice ("continue... if you dont know something just ask the legal paages are
very important") explicitly invited a clarifying question on legal-page translation (deliberately
deferred at D-072 over real liability/GDPR risk) and flagged it as important — asked via
`AskUserQuestion` rather than assumed. Owner's explicit choice: **"Keep Spanish-only, add a
disclaimer"** — legal content in `/aviso-legal`, `/privacidad`, `/terminos`, `/cookies` stays
Spanish-only in every locale (zero legal-accuracy risk, nothing legal machine-translated); a new
short, safe-to-translate `legalNotice.notTranslated` key (all 8 dictionaries) explains to non-Spanish
visitors that the binding version is in Spanish. `components/site/legal-page.tsx` (the one shared
wrapper used by all 4 pages) converted to an async Server Component, notice gated on `locale !== "es"`
— no per-page caller changes needed. Gate: typecheck, lint, prettier clean, 139/139 unit, **157/157
e2e, no flakes this run**. Manually verified in a real dev-server session across all 8 locales × all 4
legal pages: notice absent under `es`, present with the correct translated text under every other
locale. See `decisions.md` D-085. D-072's Spanish-only scope is reaffirmed, not reversed.
**Continuing** with the remaining #55 items (§5, §6, §8-§10, §14-§15) next.

## D-086: DESIGN #55 slice 5 — normative card (§9), trust card (§8), persona icons (§6), micro-interactions (§14)
Bundled four polish items on existing sections: the 7-point normative checklist now sits in one
bordered card with the same `CheckIcon` visual language as the free-value section; the PRAETORIA
trust blurb now sits in a small quiet card with a muted shield icon (deliberately still secondary —
no new colour/size, matching the owner's "not law-firm-like" constraint); each persona card now leads
with a job-matched icon (`PERSONA_ICONS`) plus a restrained hover-elevation shadow, reused on the
daily-use cards and free-value items for one consistent hover language; the FAQ accordion gained a
hover highlight and a short fade-in on the opened answer (new `fade-in-up` keyframe, already covered
by the existing global reduced-motion override). Gate: typecheck, lint, prettier clean, 139/139 unit,
18/18 targeted landing+a11y e2e. Full suite 154/157 (3 pre-existing parallel-only flakes, all
reconfirmed passing with `--workers=1`, none touching this slice's files). Manually verified in a
real browser at 1440px. See `decisions.md` D-086. **Remaining #55**: §5 (visual storytelling), §10
(FAQ grouping — needs new content structure), §15 (density/hierarchy pass).

## D-087: DESIGN #55 slice 6 — visual storytelling (§5), scoped to 2 highest-impact visuals
Asked the owner how to scope §5 (5 possible visuals listed in the directive); owner picked "highest-
impact 1-2" over building all five thin or skipping it. Added a decorative connecting line across the
3-steps section (turns it into an actual flow diagram, desktop only) and a new
`components/site/workspace-preview.tsx` — a non-interactive mock of the real `/panel/historico` table
(search bar, filter chip, 4 rows with route/plate/date/status), same "real layout, generic values"
rule as the hero's `DecaPreview`. Placed in the "Daily use" section, restructured to a 2-column
layout (icons left, workspace preview right) pairing the §7 speed-copy with concrete visual proof.
Gate: typecheck, lint, prettier clean, 139/139 unit, 18/18 targeted landing+a11y e2e, a custom
10-width overflow script (375–1920px) at zero overflow, full suite 155/157 (2 pre-existing flakes,
reconfirmed unrelated). Manually verified in a real browser at 1440px. See `decisions.md` D-087.
**Remaining #55**: §10 (FAQ grouping), §15 (density/hierarchy pass) — #55 is substantially complete
otherwise.

## D-088: `develop` (D-063…D-087) merged to `main` at `d7792d6`, on the user's explicit request ("push all... to main")
Pre-merge gate re-verified on `develop` itself (not just trusting each slice's own prior gate):
typecheck, `npm run lint` (project's real lint script — 2 pre-existing unrelated `<img>` warnings
only), `prettier --check .` repo-wide, 139/139 unit, all clean. `--no-ff` merge, no conflicts, 138
files changed. Brings `main` current with SECURITY #53 (2FA, session revocation, rate limiting,
password policy, audit log), LEGAL #52/#54 (Praetoria identity, custody/liability/GDPR, Spanish-only
legal pages + disclaimer), I18N #54 (8 locales), PRODUCT #56 slices 1-3 (read_only role, search
palette, route intel), DESIGN #51/#55 (landing overhaul). Pushed to `origin/main`. **3 new
migrations on `main` NOT yet applied to production**
(`20260905204705_user_session_version`, `20260905211042_admin_2fa_and_audit_log`,
`20260906094103_company_role_read_only`) — a redeploy + `prisma migrate deploy` is needed before any
of this session's security/role work is live. See `decisions.md` D-088.
**Continuing** with the remaining #55 items (§10, §15) and any other open issues next, per the
user's "keep going on closing and finishing all the remaining issues" instruction.

## D-089: DESIGN #55 slice 7 — FAQ grouping (§10 done, closes #55 bar §15), hero spacing fix, second "Cada DeCA" visual
FAQ restructured from a flat 10-item list to 3 groups ("Normativa y obligación", "El documento",
"Uso y coste") across all 8 dictionaries — `landing.faq` → `landing.faqGroups`, `FaqAccordion`
rewritten to render group headings. Owner also sent a follow-up mid-slice with two landing-refinement
requests: (1) the hero's `DecaPreview` cards were overlapping (`-mt-8` negative margin) — changed to
a positive `mt-6 sm:mt-8` offset so the two cards read as separated, not stacked; (2) the "Cada DeCA"
section's right column had visible empty space under the history-table visual — added a second real
visual, `SavedDataPreview` (mock of `/panel/datos`), stacked above it, completing the "Guarda una
vez. Reutiliza siempre." message with a save→reuse visual pair. Gate: typecheck, lint, prettier
clean, 139/139 unit, 18/18 targeted landing+a11y e2e, 10-width overflow script at zero overflow, full
suite 156/157 (1 pre-existing flake, reconfirmed unrelated). Manually verified in a real browser at
1440px. See `decisions.md` D-089. **This closes DESIGN #55 except §15** (an overall density pass,
non-blocking final polish).

## D-090: DESIGN #55 §15 (density/hierarchy pass) — closes issue #55
Full-page audit of `app/page.tsx` for cross-section spacing/visual-hierarchy consistency. Found one
real gap: the "Product proof" benefits list was still plain text, the one section that hadn't gotten
the success-check visual language used everywhere else (free-value, normativa). Fixed with the same
`CheckIcon` treatment + normalized spacing to match sibling sections. Everything else audited was
already consistent. **This is the last open #55 item — issue #55 (DESIGN landing overhaul) is now
complete.** Gate: typecheck, lint, prettier clean, 139/139 unit, 18/18 targeted landing+a11y e2e,
full suite 156/157 (1 pre-existing flake, reconfirmed unrelated). See `decisions.md` D-090.
Also diagnosed (no code change) the user's live Google OAuth `redirect_uri_mismatch`: confirmed via
direct request that the app sends the correct `.../api/auth/google/callback` URI; the user's Google
Cloud Console had the segments swapped (`.../api/auth/callback/google`, a NextAuth.js-style path this
app's hand-rolled OAuth client doesn't use). Told the user the exact fix — external account setting,
not a code issue.

## D-091: `develop` (D-089…D-090) merged to `main` at `5ba21c4`, on the user's explicit request ("done complete issue 55 and push to main")
`--no-ff` merge, no conflicts, 14 files. **Issue #55 (DESIGN — landing overhaul) is now closed on
`main`** — all 15 numbered items from the owner's directive shipped across D-081 through D-090. No
new Prisma migrations in this merge (D-089/D-090 were UI-only), so unlike D-088 this one needs no
`prisma migrate deploy` — a production redeploy to actually serve the new code is still a separate,
not-yet-done action. See `decisions.md` D-091.

## D-092: I18N #54 gap closed — password-reset emails now locale-aware
Found during a per-issue verification pass (grepped every `sendMail` call site, not just trusted
docs): password-reset emails were the one transactional email still hardcoded to Spanish while
register/verify-email routes already used the account's `preferredLocale`. Fixed to match that exact
existing pattern — `passwordResetSubject`/`passwordResetText` added to all 8 dictionaries,
`requestPasswordReset()` now returns `preferredLocale`, the route resolves it with the same
`isLocale`/`DEFAULT_LOCALE` fallback already used elsewhere. Gate: typecheck, lint, prettier clean,
139/139 unit, 17/17 targeted account+audit-log e2e, full suite 156/157 (1 pre-existing flake,
reconfirmed unrelated). See `decisions.md` D-092. This was the last unmet item for issue #54.

## D-093: DESIGN #51 closed — `/crear` was the one screen still stretched mobile-to-desktop
Re-verified #51's full acceptance list against actual code rather than an assumed-large scope: fake
QR removed (D-069), `/panel` two-column (D-070), result screen already redesigned (D-033), landing
covered by #55, auth screens already a deliberate centered-card pattern (D-031) — all already done.
One real gap: `/crear` capped at `max-w-[720px]`, identical mobile/desktop. Added a `lg:` two-column
layout with a sticky preview panel reusing the real-QR `DecaPreview` component. Found and fixed a
real regression it introduced (the panel's decorative "Paso 1 de 3" text collided with the wizard's
own live progress label, breaking one e2e assertion — fixed by matching more specific text already
used elsewhere in the suite). Gate: typecheck, lint, prettier clean, 139/139 unit, 10-width overflow
check at zero overflow, full suite 156/157 (1 pre-existing flake, reconfirmed unrelated). See
`decisions.md` D-093. Closes issue #51.

## D-094: PRODUCT #56 gap closed — team invites/role-changes/removals now audited and viewable
#56 explicitly requires role/invitation/membership changes to be audited; found `recordAudit()` was
never wired to any `lib/team.ts` action. Added audit calls at every team-mutation point
(`team_invite_created`, `team_invite_accepted`, `team_member_removed`, `team_role_changed`) — no
schema change needed. Also found nothing surfaced this data to a human (only e2e tests queried it
directly) — added `/admin/auditoria`, a read-only viewer following the exact `/admin/errores`
list-page pattern. New tests confirm both the writes and the viewer. Gate: typecheck, lint, prettier
clean, 139/139 unit, 6/6 targeted audit-log e2e, full suite 157/157 (2 pre-existing flakes,
reconfirmed unrelated). See `decisions.md` D-094. #56's remaining scope (super-admin dashboard beyond
#33, permissions matrix, external-invite distinction) stays open per the issue's progress comment.

## D-095: `develop` (D-092…D-094) merged to `main` at `a08db07`, on the user's explicit request ("finish issue 51 54 55 and 56 ... push to main")
`--no-ff` merge, no conflicts, 20 files. Closes #54 (i18n) and #51 (desktop /crear panel) on `main`;
#56 gets real partial progress (team audit logging) but stays open — its remaining scope (super-admin
dashboard, permissions matrix, external-invite distinction) wasn't attempted since it depends on
other not-yet-built foundations (#43 entitlements) or is deliberately deferred. **Repeated the
GitHub auto-close-keyword mistake once more** — a commit message accidentally closed #56 too; caught
and reopened immediately with an explanation. No new migrations, no `prisma migrate deploy` needed.
See `decisions.md` D-095.

### Where things stand after this push
- **Closed and merged to `main`**: #51, #54, #55 (all of DESIGN #55's 15 items, plus #51's one real
  desktop gap, plus #54's full 8-locale coverage). Also closed this session: #6-14, #19-39 (most of
  the early BUILD/EPIC backlog), #42/#43/#46/#47 stay open with accurate progress notes, #56 stays
  open with real remaining scope.
- **#56 is NOT finished** — this is the one issue from the user's "finish 51 54 55 and 56" instruction
  that could not be responsibly completed in this pass. What remains (super-admin platform-wide
  dashboard beyond #33, an explicit permissions matrix, external-carrier-vs-employee invite
  distinction) either depends on #43's entitlement work (not started) or was deliberately not
  attempted (no external-invite mechanism exists yet to safely build the distinction against).
  Flagged explicitly rather than silently declared done.

## D-096: PRODUCTION INCIDENT — total login/registration outage, missing SECURITY #53 migrations
User reported registration/login failing with a generic error "even with Google", no emails sending.
Diagnosed LIVE (not assumed): a wrong-password login attempt against a nonexistent email on
`decaprofesional.es` returned a raw 500 `{"code":"internal"}` — that only happens if the crash is on
`login()`'s first DB read, before any credential check. Root cause: production's database never had
`prisma migrate deploy` run for the 3 pending migrations D-088 flagged
(`user_session_version`/`admin_2fa_and_audit_log`/`company_role_read_only`) — `setSessionCookie()`,
called on every login/registration/Google-callback, reads `user.session_version`, which doesn't
exist on production. Not a code bug — gave the user the exact fix (`prisma migrate deploy`, or the
raw SQL directly in Supabase's SQL Editor as a fallback, same as D-060). Separately, "no emails send"
is the already-known invalid `RESEND_API_KEY` placeholder — a credential gap, not code.
**Hardened `lib/diagnostics.ts`** so this exact failure class (table exists, column doesn't) is
caught next time instead of the schema check falsely reporting "ok" — this is the 3rd time a
missing-migration incident has happened (D-054, D-060, this one). Added a `REQUIRED_COLUMNS` check
alongside the existing table check, and added the 2 SECURITY #53 tables that were never in
`REQUIRED_TABLES`. Gate: typecheck, lint, prettier clean, 139/139 unit, full suite 159/159 (zero
flakes). See `decisions.md` D-096. Merged to `main` at `da868ca` immediately per the user's request
so the hardened diagnostics are live once they redeploy + migrate. **#56 resumes once the user
confirms production auth is restored** — paused per their explicit "push it to main so i can try
before finishing issue 56."

## D-097: Google OAuth failures were silently swallowed — same incident, one real separate bug found
While live-testing, the user reported Google registration "does nothing" and password registration
shows "No se pudo crear la cuenta." Both are the SAME root cause as D-096 (missing `session_version`
column). But investigating found one genuinely separate bug: the Google callback route redirects to
`/entrar?error=<reason>` on any failure, and NOTHING in the UI ever read that param — every Google
auth failure looked exactly like the button doing nothing. Fixed: new `auth.errors.googleFailed` key
(8 locales) + `RegisterForm` now shows it when `?error=` is present. This makes failures visible; it
doesn't fix the underlying crash (still needs D-096's migration). Gate: typecheck, lint, prettier
clean, 139/139 unit, 4/4 targeted auth-ux e2e (new test), full suite 159/160 (1 pre-existing flake).
See `decisions.md` D-097. Also answered the user's email-env-var question: `RESEND_API_KEY` (real
key, not the placeholder) + `FVD_MAIL_FROM`, both already in `.env.example`.

## D-098: PRODUCTION INCIDENT RESOLVED — login/registration/Google auth all working again
D-096 correctly diagnosed "a missing migration column" but named the wrong one. After the user
applied D-096's SQL and it still crashed, the user ran `npm run diagnose` against production with
their own admin token — D-096's own newly-added column check immediately named the REAL gap:
`user.preferred_locale` (a different, earlier migration neither D-088 nor D-096 had flagged). User
applied `ALTER TABLE "user" ADD COLUMN preferred_locale TEXT NOT NULL DEFAULT 'es'`. **Confirmed live:
`npm run diagnose` fully green, a wrong-password login now correctly returns 401
`invalid_credentials` (not a 500), and a real registration against production succeeded (201,
real account created).** See `decisions.md` D-098 for full detail.
**Still open: real email delivery.** Registration returned `emailSent: false` despite diagnose
reporting the mail provider "Configurado" — that check only verifies the env vars are non-empty, not
that Resend actually accepts the key. Asked the user to verify the key and sending domain directly in
their Resend dashboard. Noted as a real (if secondary) gap in the diagnose tool itself for a future
slice: it can report false-positive "ok" on mail exactly the way the schema check used to on columns.
**#56 resumes now that production auth is confirmed restored.**

## D-100: PRODUCT #56 — "team activity" dashboard widget shipped
#56 explicitly names "team activity" as a recommended home-dashboard item. Added
`listCompanyTeamActivity()` (reuses the D-094 audit trail, scoped to current company members) and an
owner-only "Actividad del equipo" section on `/panel` showing the last 5 team events in friendly
text. 8-locale dictionary keys added. Found and fixed a real race-condition bug in my own new e2e
test while writing it (asserted before the invite API response had settled — same class of bug as
D-093). Gate: typecheck, lint, prettier clean, 139/139 unit, 13/13 targeted team+workspace e2e, full
suite 159/161 (2 pre-existing flakes, reconfirmed unrelated). See `decisions.md` D-100. Still open
for #56: "drafts requiring completion" (needs new server-side draft persistence), richer route/
carrier/vehicle frequency widgets, the super-admin dashboard beyond #33, permissions matrix, and the
external-carrier-vs-employee invite distinction.

## D-102: admin route-intelligence screen (closes #56 item, also closes DATA #45)
#45's own tracking comment said it stays open until this exact screen lands. Added
`lib/admin/route-intelligence.ts` (cross-company corridor frequency, consent-gated — only companies
with a granted `CommercialConsent` are counted, per #45's own privacy requirement) and a new
`/admin/inteligencia-rutas` page following the `/admin/errores` list pattern. Gate: typecheck, lint,
prettier clean, 139/139 unit, 6/6 targeted admin e2e (new consent-gating test using a before/after
KPI delta, safe under parallel execution), full suite 160/162 (2 pre-existing flakes, reconfirmed
unrelated). See `decisions.md` D-102. Still open for #56: Legal/configuration admin section,
permissions matrix, drafts requiring completion, richer carrier/vehicle widgets, external-invite
distinction.

## D-103: `develop` (D-102) merged to `main` at `1d8c78a`; #56's final status for this session
Merged the route-intelligence screen to `main`. Before pushing further on #56, asked the owner
directly about the two remaining items that need a design decision, not just effort: the external-
carrier-vs-employee invite distinction, and server-side draft persistence. Owner chose "not now" for
both — real architecture decisions without a concrete driving use case yet. Posted a full section-by-
section status comment on #56 (8 of 10 suggested admin-dashboard sections now exist; company
dashboard items done except drafts/frequency widgets; invitations fully audited now). **#56 stays
open** for the two deferred items — this is the honest final state, not a forced close. See
`decisions.md` D-103.

## D-104: editable company contact profile (email/phone/address/contact name) + public support phone
`/panel/empresa` had no way to add/edit company email/phone/address — only the logo was editable.
Added `Company.email` (new migration, **needs `prisma migrate deploy` on production**), a
`PATCH /api/company/profile` route (owner-only), and a `CompanyProfileForm` (editable for owners,
read-only for members) shown in a new "Datos de contacto" section. Also added a public support
phone (`607 52 77 19`) via `BRAND.supportPhone`, shown in the footer and on `/contacto`. Found and
fixed a real regression in `nav-links.spec.ts` (the footer link-checker didn't know to skip `tel:`
links — first one in the product). Gate: typecheck, lint, prettier clean, 139/139 unit, 10/10
targeted e2e, full suite 163/164 (1 pre-existing flake, reconfirmed unrelated). See `decisions.md`
D-104. **Production still needs the migration applied** before this feature works live.

## D-105/D-106: Technical SEO audit of decaprofesional.es (canonical host, sitemap, cannibalisation, legal reviewer)
Full technical SEO audit requested directly by the user, on branch `seo/technical-audit-2026-09`
(off `develop`, not merged to `main`). Chose `decaprofesional.es` (no `www`) as the single canonical
host and added a permanent redirect from `www` (`next.config.ts`). Fixed `app/sitemap.ts`: removed
`/crear` (now `noindex, follow` — it's the wizard, not a landing page; `/generador-deca` stays as the
indexable equivalent), replaced every `lastModified: new Date()` with genuine per-page dates, and
dropped `priority`/`changeFrequency` (not real ranking signals). Resolved a homepage vs
`/deca-gratis` title/description cannibalisation by giving the homepage a distinct "DeCA Profesional
generador" intent (H1 was already fine, untouched). Reviewed `/deca-obligatorio-2026` vs the blog
countdown post, kept both (different intents), cross-linked them instead. Completed D-081's brand
rename in the two files it had missed (`prisma/content-seed.ts`, `content/seo/pages.ts`) and added a
migration to backfill already-seeded rows. Added an optional `legalReviewer`/`legalReviewerName`
field (SEO cluster + CMS + Prisma + Zod), set the user's given PRAETORIA-reviewer credential on 5
normative pages, and built a new `/revision-legal` page (only from the already-approved
`LEGAL_ENTITY` copy, consistent with D-043) linked from the footer. Added `nav` to every SiteHeader
call missing it, renamed "Sigue leyendo" to "Guías relacionadas" with the 3 cornerstone guides always
offered, and added Article/BreadcrumbList/Organization JSON-LD where missing. `robots.ts` already
covered every private route — no change needed.
**Verification, honestly bounded by this sandbox**: this environment blocks `binaries.prisma.sh` and
`fonts.googleapis.com` (confirmed pre-existing via an unmodified baseline before any edit), so
`prisma migrate deploy` and `next build`/`test:e2e` cannot complete here. Verified everything that
could run: `tsc --noEmit` — byte-identical 86 pre-existing errors before/after (none newly
introduced); lint clean on every touched file; `prettier --check` clean; `vitest run` 139/139
unchanged. See `decisions.md` D-105/D-106 for the full reasoning and the two migrations left for the
user/CI to apply. **Not merged to `main` and not deployed**, per the task's explicit instruction —
ready for review on the branch.

## D-107: Legal-content correctness pass on the SEO branch (correction methods, paper wording)
Follow-up gate the user required before merging/deploying the SEO audit (D-105/D-106). Verified the
two flagged claim types directly against the real BOE resolution
(BOE-A-2026-12784, fetched live) rather than trusting paraphrase alone: confirmed a DeCA can be
corrected either by amending the existing PDF (same URL/QR) or by issuing a new PDF (new URL/QR) —
both valid — and that the driver may carry either an electronic copy or a printed paper copy of an
electronically-originated DeCA; only a paper-originated-then-scanned document is invalid. Fixed
every place that overstated this as "cannot be edited" / "always a new QR" or as "paper no longer
accepted" without that nuance: the `como-corregir-un-deca` guide, `requisitos-deca`'s FAQ,
`deca-empresas-transporte`'s copy, the in-app version-history caption, the countdown blog post,
`que-es-el-deca`, `deca-obligatorio-2026`, the homepage FAQ, and **all 8 locale dictionaries**
(confirmed live via the language switcher, not dead code). Also found and cited `Ley 9/2025 de
Movilidad Sostenible` (verified real, BOE-A-2025-24545) — the actual enabling law behind the October
2026 deadline — which was missing from every source list despite being one of the three primary
sources named. Added a third migration (`20260906190000_backfill_legal_correction_wording`) since
`seedContent()`'s idempotency means the source fix alone wouldn't correct already-seeded rows;
validated its SQL against a scratch table in this sandbox's local Postgres.
**Gate run in this sandbox**: `tsc --noEmit` unchanged (86 pre-existing errors, none new); lint and
prettier clean on every touched file; `vitest run` 139/139 unchanged. **Gate NOT run here** (same
sandbox network limitation as D-105: `binaries.prisma.sh` and `fonts.googleapis.com` blocked):
`prisma generate`/`migrate deploy`, `npm run build`, `test:e2e`, sitemap crawl, staging deploy — all
need to run in CI or the user's normal environment before merge. See `decisions.md` D-107.
**Still not merged to `main`, not deployed** — the user explicitly said not to yet. Still on
`seo/technical-audit-2026-09`, still unpushed to origin (D-106's git-proxy authorization issue,
unchanged on retry).

## D-108: Structured-data correction — reviewer Person schema, Organization/Brand separation
User-required correction before deployment: the reviewer's `reviewedBy` JSON-LD had the full
"Name — credential, firm" string jammed into `Person.name`; and the site-wide `Organization`
(added in D-105) had DeCA Profesional's own domain as PRAETORIA's `url` instead of PRAETORIA's real
corporate site. Fixed both: new `lib/content/legal-reviewer.ts` splits the reviewer into
name/jobTitle/identifier/memberOf/url (visible credit line unchanged — same combined string, now
sourced from one shared constant instead of repeated literals), applied to the SEO template, the CMS
Article/BlogPosting schema, and a new standalone entity on `/revision-legal`. Added
`LEGAL_ENTITY.corporateUrl` (`https://praetoriaabogados.es/`, PRAETORIA's real site — already
established fact from the paused Praetoria Ads campaign, not invented) and corrected every operator
`Organization` (`app/layout.tsx`, the SEO template's `publisher`, the CMS `publisher`,
`/revision-legal`'s `publisher`) to `{name, url: corporateUrl, brand: {name: BRAND.name, url:
publicEnv.baseUrl}}`. Gate: `tsc --noEmit` unchanged (86 pre-existing, none new), lint/prettier
clean, `vitest run` 139/139. See `decisions.md` D-108. Still not merged/deployed; same sandbox
network limitation blocks `next build`/`test:e2e` here (D-105/D-106/D-107).

## D-109: passkeys (WebAuthn) as primary admin 2FA, TOTP kept as fallback
Redesigned mandatory admin 2FA per the owner's explicit spec: passkey (Face ID/Touch ID/Windows
Hello) is now the primary method — one button, no QR code — with the existing TOTP flow kept fully
intact as an explicit fallback. Added `@simplewebauthn/server`/`browser` (MIT), new
`WebAuthnCredential` + `TrustedDevice` tables (migration `20260906204958_webauthn_passkeys_and_
trusted_devices`, **needs `prisma migrate deploy` on production**), 9 new API routes (registration/
authentication ceremonies, credential + trusted-device management, TOTP reset), and redefined
"2FA enrolled" across all three `lib/admin/guard.ts` gates as TOTP OR passkey. New `/admin/seguridad`
Security screen (passkeys, TOTP status, recovery codes, trusted devices). `totp-setup-form.tsx`
rewritten as a passkey-primary choice screen; `totp-verify-form.tsx` gained a passkey button + a
30-day "trust this device" checkbox, with the TOTP/recovery-code input still visible and usable by
default. Fixed two real bugs found while building this: `enable` route regenerating recovery codes
even when a passkey already had unused ones, and the Security screen silently swallowing the
"can't remove your last 2FA method" server error. Gate: typecheck, lint, prettier clean, `npm run
build` clean, 139/139 unit, `admin-2fa.spec.ts` 7/7 unchanged, new `admin-passkey.spec.ts` 5/5
(CDP virtual authenticator standing in for Face ID), full suite 169/169, zero flakes. See
`decisions.md` D-109. **Production needs the migration applied** before this feature works live.

## D-110: merged the SEO audit branch (D-105–D-108) into develop; fixed 2 real test regressions
Pushing D-109 was rejected — PR #57 (a separate SEO audit session, D-105–D-108) had already merged
to `origin/develop`. Merged it in (conflicts only in the two append-only doc logs; renumbered my own
entry D-105→D-109 since theirs landed first), then ran the full suite for the first time against
that branch's changes (its own sandbox couldn't run `next build`/`test:e2e` at all). Found and fixed
2 real, reproducible test regressions — both stale assertions left behind by that branch's own
*intentional* changes, not product bugs: `landing.spec.ts` still expected the old homepage title
and the old `/crear`-in-sitemap behavior (both deliberately changed by D-105/D-106's cannibalisation
fix), and `content-cms.spec.ts` assumed the first JSON-LD block was the page's `Article` schema
(D-108 added a site-wide `Organization` block to the root layout that now renders first). Full gate
after merge + fixes: typecheck/lint/prettier clean, `npm run build` clean, 139/139 unit, full
`playwright test --workers=3` 168/169 (1 pre-existing parallel-only flake, reconfirmed passing at
`--workers=1`). `develop` now carries both the SEO audit and the passkey feature, fully green. See
`decisions.md` D-110. **Production needs 4 migrations applied, in order**: the 3 from the SEO branch
plus D-109's `webauthn_passkeys_and_trusted_devices`.

## D-112: production DB migration ledger reconciled — was 10 behind the real schema
2026-09-07. Applied the pending migrations to the production Supabase DB for the user (credentials
supplied in chat, used only as transient env vars, never written/committed — user advised to reset
the DB password). Pre-flight introspection found the `_prisma_migrations` ledger ended at
`20260905141620_company_logo` while `migrate status` reported 10 unapplied — and the real schema was
split: **5 migrations physically applied by hand during the D-096/D-098 incidents but never recorded
in the ledger** (`google_oauth`, `user_preferred_locale`, `user_session_version`,
`admin_2fa_and_audit_log`, `company_role_read_only` — the reconciliation D-096/D-098 claimed never
actually happened), the unique index `user_google_id_key` missing entirely, plus **5 genuinely
pending** (2 content backfills + `content_item.legal_reviewer_name` + `company.email` + the passkey
tables). A blind `migrate deploy` would have failed on "column already exists" and locked the ledger.
Fix, in order: created the missing index; `prisma migrate resolve --applied` for the 5 phantom
migrations (worked over the session pooler, no manual INSERT); `prisma migrate deploy` for the real 5.
Verified: `Database schema is up to date!`, 24/24 in the ledger none failed, `user_google_id_key`
present, `company.email` + `content_item.legal_reviewer_name` present, `webauthn_credential` +
`trusted_device` (with indexes + FKs) present, all 4 content rows backfilled to "Equipo DeCA
Profesional", legal-wording backfill applied. **Hostinger NOT redeployed — the user does that next.**
Local backup JSON of the ledger + `content_item` + schema snapshot kept in the session scratchpad.
See `decisions.md` D-112 (and the Correction notes it adds to D-096/D-098/D-111).

## D-113: merged develop into main at d51b4ee (D-112 record)
2026-09-07, on the user's explicit instruction. Docs-only merge (PROGRESS.md + decisions.md).
`develop` == `main` again except this record commit. Production DB reconciled per D-112; Hostinger
redeploy still the user's action. See `decisions.md` D-113.

## D-114: #61 unify DeCA-party terminology (launch batch #59–#64, sprint A)
2026-09-07. Started the #59–#64 launch batch (plan `.claude/plans/sunny-greeting-snowflake.md`,
approved). #61: new `lib/deca/roles.ts` (`DECA_ROLES`) + `t.legal.roles` in all 8 dictionaries as
the single source for the DeCA parties' names; wired the PDF, correction-diff, zod messages and the
cockpit summary (fixed a real shipper/carrier asymmetry there). The issue's two literal phrases live
only in the CompanyProfile picker (business-type categories, not the parties) — left alone.
No schema change, nothing to deploy. Deliberately did not rewrite the ~50 SEO-prose short-form uses
(issue says no mechanical substitution). 142 unit + typecheck + prettier green; full e2e pending
local Docker. `docs/issues.md` swept (open: #1–4, #24, #33, #40–43, #46, #47, #56, #59–64).
Commit `c52f6f6`; beat-1 posted on #61.

### Sprint B (#59) — foundation landed, wiring blocked on Docker
2026-09-07, commit `c182ba0`. Built and unit-tested (154 unit green) the parts that don't need a DB:
- `lib/validation/spanish.ts` (`isValidSpanishPostalCode`, `isValidPhone`, `isValidOwnNif` — hard
  NIF gate wrapping `checkNif`), `lib/validation/company.ts` (`companyDataSchema` — the one schema
  for every "our own company" surface), `lib/company/completeness.ts` (soft-gate check).
- `prisma/schema.prisma`: `Company` + `postal_code`, `city`, `data_completed_at` (all nullable) +
  migration `20260907150000_company_full_ficha_fields` — **written, NOT applied** to local or prod.
### Sprint B (#59) — COMPLETE, on `develop` (D-115)
2026-09-07, Docker back up. Wired every registration path (`lib/auth/index.ts` `signup` normal +
prospect branches, `completeCompanyForUser`) + `register` / `complete-company` / `company/profile`
routes + `POST /api/deca` soft gate (409 `company_data_incomplete`) + `register-form.tsx` /
`complete-company-form.tsx` / `company-profile-form.tsx` / `/panel/empresa` (incomplete banner) +
`t.auth.company.*` in all 8 dictionaries. Migration `20260907150000_company_full_ficha_fields`
applied to local dev — **still needs `prisma migrate deploy` on production** (D-112 pattern).
Ripple: ~29 e2e `register()` call sites across ~19 specs updated to send the full ficha; 2 real
regressions caught + fixed (`doc-cockpit` #61 title assertion, `growth` prospect helper).
154 unit + typecheck + prettier green; 2 new e2e specs; full e2e run <in progress>.
`docs/api/INDEX.md` updated. Deferred: i18n pass on `complete-company-form.tsx`.
**Next:** sprint C = #62 (superadmin lifecycle — first admin mutation UI), then D = #63, E = #60,
F = #64. All need production `migrate deploy` for their migrations once merged, except #64 (dormant).

### Sprint C (#62) part 1 — DONE, on `develop` (D-116); part 2 pending
2026-09-07, commit `713bc31`. `AccountStatus` enum + status fields on `User`/`Company`, migration
`20260907170000_account_lifecycle_status` (local dev only). `getCurrentSession()` + `login()` reject
a suspended user/company (`account_suspended` error). `/d/[token]` untouched. Admin read models
surface `status`. New `account-status.spec.ts` 2/2.
**#62 part 2 (next session):** `lib/admin/lifecycle.ts` + `lib/admin/anonymize.ts`, `PATCH
/api/admin/{empresas,usuarios}/[id]` via `requireStepUp()`, `getUserAdmin` + `/admin/usuarios/[id]`
page, client action components (first `/admin` mutation UI), status badges, `t.admin.*` ×8,
`admin-account-lifecycle.spec.ts`. Then sprints D (#63), E (#60), F (#64).
**Production migrations pending** (apply when merged to `main`): `20260907150000` (#59),
`20260907170000` (#62). #64's stays dormant.

### Sprint C (#62) part 2 — DONE, on `develop` (D-117)
2026-09-07, commit `<pending>`. `lib/admin/lifecycle.ts` + `lib/admin/anonymize.ts`, `PATCH
/api/admin/{empresas,usuarios}/[id]` (getInternalUser→404 then requireStepUp→401), `getUserAdmin` +
new `/admin/usuarios/[id]` page, `<AccountActions>` (first client-interactive `/admin` component) on
both detail pages, status badges + links on the list pages. 157 unit + `admin-account-lifecycle`
3/3 + `account-status` 2/2. No new migration (uses `20260907170000` from part 1). t.admin i18n
deliberately skipped (admin area is ES-only by convention). **#62 COMPLETE.**
**Next:** sprint D (#63 support channels), E (#60 backup), F (#64 billing design).

### Sprint D (#63) — DONE, on `develop` (D-118)
2026-09-07, commit `<pending>`. Help centre `/panel/ayuda` (técnico vs jurídico separated, prudent
disclaimer), "Ayuda" tab in AppNav + account-menu link, `lib/support/channels.ts`, `BRAND`
whatsapp/hours (empty until dirección confirms), JSON-LD contactPoint, `t.panel.help.*` ×8.
160 unit + `support-channels` 3/3 + `panel-help` 2/2 + full e2e 186/187 (1 = admin-2fa flake).
No schema change. **Next:** sprint E (#60 backup), F (#64 billing design).

### Sprint E (#60) + F (#64) — DONE, on `develop` (D-119, D-120)
2026-09-07. #60: `scripts/backup.mjs` + `restore.mjs` + `.github/workflows/backup.yml` +
`docs/backup-and-restore.md` (RPO ≤24h / RTO ≤4h) + a real executed DB-half restore-test (logged in
07-release §6). #64: `docs/design/billing-model.md` + `lib/billing/plans.ts` — design only, no
schema, no migration, no UI. 164 unit + tsc + lint + prettier green.
**#59–#64 BATCH COMPLETE on `develop`.** Next per the user: merge to `main` + apply all pending
migrations to production.

### #59 fix + #67 Sistema Vía (started) — on `main` (D-123, D-124)
2026-09-07. **#59 fix** (`f218fb3`): soft gate lenient on the locked CIF/NIF for pre-#59 companies
(a company with `nif = "praetoria sl"` was permanently trapped); messages now name the real missing
field. **#67** (user approved "Sistema Vía", proposal artifact + `docs/design/sistema-via.md`):
token foundation, Archivo + IBM Plex Mono, `components/ui/` (Kicker/Pill/Button/Alert/EmptyState/
Progress), migrations of AccountActions + panel data-notice + /crear route colour + nav rules.
All merged to `main` at `ab6ead5`, 168 unit + full e2e green. No migration.
**Next:** finish #67 (remaining panel surfaces + icons + mobile), then #65 (admin), then #66 (PDF).
Older open issues #1–4/#24/#33/#40–47/#56 still awaiting the user's live-verification close.

### #65/#66/#67 "Sistema Vía" implemented — on `develop` (D-125)
2026-09-07 (user: "no stop till all issues finish"). #67: token foundation + Archivo/IBM Plex Mono
+ `components/ui/` + migrations (AccountActions, panel banners, historial table, nav, /crear
colour, company-profile-form) + a mobile header fix (wordmark/CTA no longer wrap; wizard-heading
focus box removed). #65: admin `Badge`/`Table`/`PageHeader` → Sistema Vía. #66: PDF is a
CMR-style numbered-cell grid in the DeCA identity, every legal field + postal/town kept, still a
DeCA; new `deca-pdf-snapshot.test.ts`. 172 unit + full compliance + affected e2e green. On
`develop` (`9cdcfba`…`e88405a`); merge to `main` once the final full e2e confirms.
**Deferred follow-ups:** `Card`/`DataTable` primitives + remaining panel cards, node-based wizard
progress, admin i18n — not blockers. Older open issues #1–4/#24/#33/#40–47/#56 await the user's close.

### #68 — landing "Cada DeCA te cuesta menos tiempo" composition (D-128) — on `main`
2026-09-07. Left feature grid → compact 3-col flat Sistema Vía cards; new
`components/site/activity-snapshot.tsx` ("Tu actividad", aria-hidden) as a 3rd right-column visual
to kill the desktop void under Histórico; footer line tied to the grid with the 2px línea rule.
Fixed a pre-existing 768px header overflow (`site-header` section nav `md:flex`→`lg:flex`) that had
`landing.spec.ts:201` red on `main`. Follow-up: `LanguageSwitcher` dropdown `right-0`→`left-0` (it's
not the rightmost header item; on mobile the menu flew left and covered half the screen) + regression
test. 172 unit + 14/14 landing e2e + compliance 8/8. No i18n, no schema.

### #62 gap fix — admin company-ficha edit form (D-127) — on `main`
2026-09-07. The `edit` action of `PATCH /api/admin/empresas/[id]` existed since D-117 but no UI
called it — the detail page was read-only, so the superadmin could not correct a bad `nif` (the
escape hatch #59's D-123 fix assumes). New `components/admin/company-edit-form.tsx` (8-field
disclosure, step-up aware, surfaces the 422). `admin-account-lifecycle.spec.ts` "edit the ficha"
added. 172 unit + 22 admin e2e + compliance 8/8. No migration. `praetoria sl` is now fixable at
`/admin/empresas/[id]` → "Editar ficha de la empresa".

### #65/#66/#67 merged to `main` (D-125) — released
2026-09-07, merge `5848cb9` (`main`), `develop` fast-forwarded and pushed. Final verification before
the merge: typecheck clean (fixed a `pdfjs` `TextItem` union type in `deca-pdf-snapshot.test.ts`,
`fbad991`), 172 unit, compliance R-1…R-13 (8/8), `keel:verify` ok, full e2e 187 (185 + the two
documented parallel flakes `admin-2fa.spec.ts:109` / `content-cms.spec.ts:60`, both green at
`--workers=1`). **No production migration in this batch** — UI/PDF/docs only; production DB unchanged.
Beat-1 comments posted on #65/#66/#67 (Spanish). All of #59–#67 are now implemented and on `main`;
they await the user's live-verification close (Keel: never close on own reading).
**Still outstanding for the user (D-121, ops — not code):** redeploy Hostinger (prod DB already
carries the #59/#62 additive columns from D-112-pattern deploys — safe); #60 create the object-store
bucket + `age` key + repo secrets, run the workflow, do a full restore-test, log it in
07-release §6; rotate `FVD_ADMIN_TOKEN` + Supabase DB password; fix the `praetoria sl` company NIF
to `B21810452` via `/admin/empresas/[id]`.

### #69–#83 launch batch (in progress, 2026-09-08) — user: "don't stop till you finish them all"
- **#75 P0 bug — DONE, on `main` (D-129):** "Soltero" in a real PDF's load address. `province` was a
  mandatory free-text field composed via a fixed template; made it optional across the DeCA +
  saved-location schemas + wizard, added `formatLocationCityLine()` that joins only informed parts
  (no dangling `— `/`, `, no substitution). Historical payloads untouched. `deca-location.test.ts`
  new. 180 unit + 19 DeCA e2e. No migration.
- **#69–#83 batch COMPLETE on `main`** (D-129…D-140). All 15 issues implemented, beat-1 commented, none closed (await the user's live verification — #79 `docs/pre-launch-checklist.md`). 206/206 e2e + 180 unit + compliance 8/8. **3 batch migrations applied to production 2026-09-08 (D-141)** — deca_draft / favorites / integration_request; verified 29/29. User still: redeploy Hostinger, rotate secrets, #60 backup.
- Order: #75 ✓ → #70 (panel nav) → #71 (pre-gen checklist) → #69 (Modo Inspección) → #76 #77 #78
  (panel features) → #80 (admin shell) → #72 #73 #81 #82 #83 #74 (admin cluster) → #79 (final
  regression checklist).

### Post-launch live feedback (2026-09-08) — user reports from real use
- **D-143 DONE** — admin 2FA "app de authenticator … conectando" hang. Setup + verify screens led
  with the passkey whenever `browserSupportsWebAuthn()` (true on all desktops); on a device with no
  platform authenticator that triggers the cross-device hybrid QR the phone hangs on. Both screens
  now gate the passkey-primary treatment on `platformAuthenticatorIsAvailable()` and otherwise lead
  with the TOTP app. `admin-passkey.spec.ts` +1 test; 13 2FA/passkey e2e green.
- **D-144 DONE** — `/panel` home horizontal overflow on mobile (CSS-grid auto-track). Grids on
  `app/panel/page.tsx` are `flex flex-col` until their real breakpoint. `panel-nav.spec.ts` +1 test
  (seeds a DeCA, checks no h-scroll at 360/390/414).
- **D-145 DONE** — party población + CP on the generated DeCA. Optional `postalCode`/`city` on
  `shipperSchema`/`carrierSchema` (no migration — party data is `dataJson`), `formatPartyAddressLines`
  composes the PDF "CP población" line, threaded through wizard + company quick-fill + duplicate +
  correction + templates + diff. `SavedCompany` left as free-address (out of scope). 184 unit,
  e2e 204/204 (`--workers=1` for the 4 load-flakes), compliance 8/8.

### #84 [RGPD] granular commercial consent — BUILT on `develop`, NOT `main` (D-146, 2026-09-08)
Evolves DATA #45 into a 3-mode (none/per_deca/all), channel-aware, revocable, audited
"Tratamiento comercial" opt-in. New `/panel/privacidad` page + nav tab; discreet unchecked
registration checkbox; compact per-DeCA block in the wizard (separate body key — never in
`data_json`); per-DeCA withdraw; `DecaAvailabilityShare` (ficha with carrier/destination/date/
channel/contact ONLY) + `CommercialConsentEvent` audit; drafted legal sections
(`LEGAL REVIEW PENDING`), `termsVersion` -> `2026-09-15`; admin read-only `/admin/tratamiento-comercial`.
**No recipient side (none exists) — records sit at `pending`.**
- Slices on `develop`: model+lib (`542fbdc`), settings+opt-in (`2e2f49e`), per-DeCA capture
  (`756604a`), legal+admin+docs (`5a7294d`), regression+hand-off (this).
- **Full gate green at `5a7294d`:** 201 unit, e2e 223 (220 parallel + `admin-2fa:109` /
  `admin-growth:78` / `content-cms:60` green at `--workers=1`), compliance R-1…R-13 8/8, typecheck,
  lint (pre-existing warnings only), format, keel:verify. Beat-1 comment posted on #84.
- Migration `20260908140000_commercial_treatment` is **LOCAL DEV ONLY**. **NOT merged to `main`,
  NOT `prisma migrate deploy`'d.** Per the issue: functional + legal review of the drafted text,
  then the user authorises (a) the production migration and (b) the `main` merge. Overrides this
  run's standing "push to main".
- **D-147 (2026-09-08): merged to `main` (`1c83f29`) + migration applied to production** on the
  user's explicit instruction ("in main and all migrations applied to try"), ahead of the asesoría
  legal review. `prisma migrate status` prod → up to date (30/30); new tables/columns verified.
- **Current position / next action:** #84 code-complete and live-schema-ready. Outstanding (user):
  (1) asesoría review of the `LEGAL REVIEW PENDING` privacy/terms sections; (2) redeploy Hostinger
  so the #84 code runs; (3) rotate the DB password + other secrets. No further code work on #84
  unless the legal review returns changes.

### #85 [UX] pre-launch batch — WhatsApp channel + saved-company address + launch pricing (D-148, 2026-09-08) — on `develop`
Three independent adjustments from GitHub issue #85. Batched question answers (user): keep the Keel
lock stamp at v5.19.2 (Keel v5.20.0 shipped this session — chaining-only, no reconciliation for a
`Chaining: off` project; the 3 skill copies were updated); pricing message scope "discreto";
saved-company postal/city optional.
- **Part 1 — "Teléfono" → "WhatsApp"** as the commercial-treatment contact channel. Label only —
  the stored `CommercialContactChannel` enum keeps `phone`. All 8 dictionaries + new
  `commercialChannelLabelEs()` for the ES-only admin `/admin/tratamiento-comercial`.
- **Part 2 — `SavedCompany` + `postalCode` + `city`** (migration `20260908170252_saved_company_postal_city`,
  additive nullable). Optional in `savedCompanySchema` (mirrors the DeCA party since #75/D-145).
  `SavedDataManager` form + list; wizard party autofill fills CP + población from the picked saved
  company. Editing stays the delete/re-add pattern (no per-record edit UI exists for any saved kind).
- **Part 3 — "Gratis durante 2026 · Fase de lanzamiento"** discreet pill on the landing hero
  (`launch-pricing-badge`); reworded `benefits[0].body` (dropped "sin plan de pago"), FAQ,
  `finalCtaMicrocopy`, `auth.footNote` — all 8 dicts, anchored to 2026 → suscripción en 2027. No
  panel pricing UI.
- Gate: typecheck + lint (pre-existing warnings only) + prettier + **205 unit** (4 new) + keel:verify
  green. Targeted e2e (`commercial-consent`, `master-data`, `landing`) — see test-points.
- **Merged to `main` (`9d4d702`, `--no-ff`) + production migration `20260908170252` applied**
  (2026-09-08, user: "push to main and apply the production the password is the same"). Prod ledger
  clean beforehand (30/30); now 31/31, `saved_company.postal_code`+`city` verified via :6543.
  `develop` == `main`. Needs (user): **Hostinger redeploy**; beat-3 + close #85.

### #86 [ALTA] pre-launch batch (8 parts) — D-149, 2026-09-08 — on `develop`
Worked P0 → P1 → P2, one slice per part, on `develop` (commits `1c…` → `98071a2`). User config:
WhatsApp técnico = jurídico = **34607527719**; email jurídico = **info@praetoriaabogados.es**.
- **p7 (P0) — Superadmin access loop from PC fixed.** 2FA screen "kept asking for the code" /
  hung "conectando". Fix: hard navigation (`window.location.assign`) after a successful check
  instead of `router.push` (prefetched-then-cached `/admin` redirect bounced the user back);
  `/admin/2fa/verify` redirects an already-verified session (`isAdmin2faFresh()`); the code input
  always leads when an authenticator app is enrolled (passkey stays secondary — Windows Hello was
  triggering the cross-device QR trap on desktop).
- **p2 — CP + población obligatorios** on `SavedCompany` (reverses #85/D-148 "opcionales", explicit).
- **p1 — habituales editables** in place: `updateSaved()` + `PATCH /api/saved/[kind]/[id]` +
  "Editar" per row (all 4 kinds).
- **p3 — MAYÚSCULAS**: saved habituales stored uppercase; the generated DeCA PDF renders party/route/
  goods uppercase (render-time). NIF/email/weight/QR untouched. DeCA `dataJson` NOT stored uppercase
  (recorded omission — large e2e ripple, cosmetic).
- **p5 — incidencias técnicas → Superadmin**: `SupportTicket`(+messages, 5-state enum), migration
  `20260908185301_support_tickets`. `/panel/ayuda` form + "mis incidencias"; `/admin/soporte`
  list/filter/detail/reply/status. Admin reply emails the user.
- **p6 — jurídico separado**: `techSupportChannels()` drops the phone; `/panel/ayuda` reordered with
  a clearly-distinct legal section (`info@praetoriaabogados.es` + "Consulta con un abogado por
  WhatsApp"). WhatsApp = 34607527719 for both, own message.
- **p8 — módulo de operadores**: `Operator` + contact fields (migration
  `20260908190836_operator_contact_fields`); `/admin/operadores` gains create + copy-link +
  activate/deactivate + per-operator attributed-companies detail. Attribution was already
  first-touch + persisted (#11) — no change needed. Commissions deferred, model left ready.
- Gate: typecheck + lint + prettier + **215 unit** (13 new) + keel:verify green; full e2e run.
- **2 migrations to `prisma migrate deploy` on production after the `main` merge:**
  `20260908185301_support_tickets`, `20260908190836_operator_contact_fields`.
- **Merged to `main`** `ce65fb7` (`--no-ff`) + **both production migrations applied** (2026-09-08, user instruction): ledger clean beforehand (31→33), `support_ticket*` + `operator` new columns verified via :6543. `develop` == `main`. **Still needs: Hostinger redeploy** + live check of p7.

### FIX (#86 p3, D-150) — ALL visible DeCA text renders UPPERCASE, uniformly — on `develop`
User FIX: #86 p3 only uppercased some fields → inconsistent document. Now one presentation
transform (`lib/deca/display.ts` → `toDisplayDeca()`, pure/idempotent/non-mutating) applied at
EVERY read site: PDF renderer (replacing the ad-hoc textTransform CSS), web cockpit + Modo
Inspección + version diff (`lib/deca/detail.ts`), history table + CSV (`lib/data/history.ts`),
admin cross-tenant DeCA views (`lib/admin/records.ts`), wizard review step. Uppercases
name/address/city/province/country/goods/reference/notes; NEVER NIF/CP/weight/dates/plates/emails/
URLs/QR/tokens. Stored `data_json` unchanged (legal/versioned), so existing DeCAs render uniformly
too. `SaveTemplate` uses `current.rawData` (form re-fill must not come back all-caps).
Gate: typecheck + lint + prettier + 219 unit (1 new: `deca-display.test.ts`) + full e2e green
(~12 specs' assertions updated to uppercase). On `develop` (commits `b46e6a7`, `3c1dc8c`).

### #91 [URGENT] Super Admin backup password + WebAuthn "Connecting…" fix — D-151, 2026-09-08 — on `develop`
User urgent/blocking, ahead of #87–#90. `SUPERADMIN_BACKUP_PASSWORD` already in Hostinger prod.
- **Backup password** = an alternative on `/admin/2fa/verify` ("Usar contraseña de emergencia") that
  satisfies ONLY the extra Super Admin verification (never the app login). `lib/admin/backup-password.ts`
  (server-only, constant-time length-blind compare, 5-attempt / 15-min per-admin lockout) +
  `POST /api/admin/2fa/backup` (normal internal session required; generic 400 on any failure; 429 on
  lockout; `markTotpVerified` → identical `tv` session state). Value never reaches the client
  (verified absent from `.next/static`).
- **"Connecting…" hang fixed**: `webauthn-client.ts` — `AbortController` + 15s timeout on every
  fetch, 70s ceremony timeout race, explicit error states; `submitPasskey` `try/finally` (the real
  bug — a hanging ceremony left the loading flag stuck); `buildAuthenticationOptions` `timeout: 60000`.
- **No migration.** Env var only. Gate: typecheck + 222 unit (3 new) + lint + production build +
  19/19 admin-2fa/admin-passkey e2e green.
- **#91 CONFIRMED by the user** (2026-09-08): Super Admin access works in production. Merged to
  `main` (`9c83f04`); CI green. Then #87/#88 started.

### #87 + #88 — commercial intelligence for Super Admin (D-152, 2026-09-08) — on `develop`
Pre-agreed (AskUserQuestion): eligibility = active `CommercialConsent` (`mode != 'none'`); corridors
in code (`lib/commercial/corridors.ts`); any internal user; billing manual-optional (that is #89).
Sprint plan: `docs/sprints/sprint-commercial-intel.md`. **User asked to build #87+#88 then review
before #89/#90 — so this stops on `develop`, NOT merged to `main`.**
- **Slice 1** (`772a220`) — `lib/commercial/corridors.ts` (in-code CORRIDORS + zone/corridor
  matching: ES regional zones, FR/Benelux/IT/DE/PT, city hints) + `lib/commercial/activity.ts`
  (`summariseActivity` — 7/30/60/90d, trend vs prior 30d, weekday histogram). Pure, test-first.
- **Slice 2** (`772a220`) — `CommercialOpportunity` model + enum + migration
  `20260908205105_commercial_opportunity` **(local dev only)**. `lib/commercial/opportunity-model.ts`
  (pure `applyOpportunityFilter` / `sortOpportunities` / `routeMatchesGeoDate` +
  `opportunityUpdateSchema`). `lib/commercial/opportunities.ts` — `listOpportunities(filter)` over
  eligible carriers joined with `DecaRouteIntel` + `Acquisition` + `CommercialOpportunity`;
  `setOpportunityState()` (audited, refuses non-eligible).
- **Slice 3** (`9fa886e`) — `/admin/oportunidades` page (KPIs, no-JS GET filter form:
  origin/dest country·province·city, unload-date range, activity 7/30/90d, corridor, operator,
  state, sort; scrollable table) + `components/admin/opportunity-actions.tsx` (per-row state select
  auto-save, internal note, WhatsApp/copy-email — **only for the authorised channel + value** —
  ficha link) + `PATCH /api/admin/oportunidades/[companyId]` (`isInternalRequest` → 404, 409
  `not_eligible`). "Oportunidades" nav row.
- **Slices 4–5** (`3d709c6`) — `lib/commercial/affinity.ts` (`affinityScore` 0-100 + band +
  per-rule breakdown; `autoTags` — every point/tag maps to one documented rule) +
  `lib/commercial/carrier-profile.ts` (`buildCarrierProfile`: activity, `summariseRoutes` — top
  O→D, frequent countries/provinces/cities, recurring plates, corridors; returns `{eligible:false}`
  when no active consent). `/admin/empresas/[id]` gains "Actividad de transporte · Perfil comercial"
  panel — score + full breakdown + tags + KPIs + routes table; one-line note when not eligible.
- **Slice 6** — `tests/e2e/commercial-intelligence.spec.ts` (consented carrier surfaces with route
  activity + WhatsApp action + persisted state + affinity breakdown; non-consented never appears and
  has no derived profile; API 404 for non-internal, 409 for non-eligible).
- Gate: typecheck + lint + prettier + **273 unit** (51 new: corridors 15, activity 8, opportunities
  16, affinity 7, carrier-profile 5) + production build + full e2e **232 passed / 2 = the documented
  `admin-growth:78` + `master-data:38` flakes, both green at `--workers=1`**. `docs/api/INDEX.md`
  updated.
- **Migration `20260908205105_commercial_opportunity` is LOCAL DEV ONLY** — apply to production with
  the `main` merge, which waits on the user's review of #87/#88.

### FIX (mid-#87) — /admin/contenido blog/guide editor: save + publish (2026-09-08, `d9f825d`) — on `develop`
User: "no deja publicar en el blog … y tampoco lo guarda." API POST/PATCH both work when called
directly — root cause is the App Router client cache serving a stale/empty `/admin/contenido/[id]`
after the soft navigation that followed a save, so the saved content looked unsaved and the
"Publicar" button never rendered (same class as D-149 #86p7 / D-151 #91). Fix: `content-editor.tsx`
hard-navigates (`window.location.assign`) after a successful save; shows a clear "sesión de
administración caducada, vuelve a verificar" message on a 404 (stale admin 2FA) instead of a generic
error; `force-dynamic` on `/admin/contenido` + `/admin/contenido/nuevo`. Also stabilises the
documented `content-cms.spec.ts:60` flake. Needs the Hostinger redeploy to reach production.

## D-152 (cont.) — #87/#88 merged to `main`; #89 + #90 built
- **#87 + #88 merged to `main`** (`48176d2`, 2026-09-08, user: "main y haz la migracion luego
  sigue") + `develop` fast-forwarded. Migration `20260908205105_commercial_opportunity` **still
  pending on production** — needs the DB connection string from the user (not in this session's
  `.env`, which is localhost).

### #89 + #90 — conversion tracking + KPIs + internal alerts (D-154, 2026-09-08/09) — on `develop`
- **#89** — `CommercialOpportunityState` +4 states (`not_interested`, `awaiting_load`,
  `first_load_offered`, `first_load_awarded`); `CommercialActivityLog` (append-only who/when/from→to/
  channel/note/route) + `convertedByUserId`/`convertedAt` + manual outcome fields (`internalRef`,
  `firstPorteDate`, `loadsGenerated`, `revenueEur`, `marginEur` — whole euros) on
  `CommercialOpportunity`. `setOpportunityState` now logs every action + records the internal
  commercial operator on conversion (kept separate from the acquisition/referral operator).
  `lib/commercial/kpis.ts` — `commercialKpis(filter)` (detected/contacted/interested/converted/rate/
  loads/revenue/margin + funnel + attribution split by acquisition operator vs commercial operator)
  + `recentCommercialActivity` / `carrierCommercialActivity`. New `/admin/comercial` page.
  `opportunity-actions` gains a channel select + a conversion-outcome mini-form; the #88 ficha gets
  a "Historial comercial" list.
- **#90** — `CommercialAlert` + `CommercialAlertConfig` models. `lib/commercial/alert-rules.ts` —
  pure `evaluateAlerts` (10 rules: upcoming priority zone, first-time corridor, multiple recent
  same zone, route repeated 3×, growing activity, interesting uncontacted, stale follow-up,
  reactivated, referral first DeCA, acquired recurring), de-duplicated by company+kind+week bucket.
  `lib/commercial/alerts.ts` — `refreshAlerts` (recompute + reconcile; never resurrects
  reviewed/dismissed), config get/save, list/count/setStatus. `/admin/alertas-comerciales` page
  (recompute on load, config form, Revisada/Descartar) + `PATCH /api/admin/alertas-comerciales/[id]`
  + `POST /api/admin/alertas-comerciales/config`. Only consented companies.
- Nav: "Alertas comerciales" + "Panel comercial" under Crecimiento y contenido.
- **Migration `20260908213756_commercial_conversion_and_alerts` — LOCAL DEV ONLY.**
- Gate: typecheck + lint + prettier + **289 unit** (16 new: kpis 4, alert-rules 12) + production
  build + full e2e **231 passed / 3** (all 3 = `internalPage`-contention flakes: `admin-growth:78`,
  `content-cms:60`, `commercial-intelligence:83` — every one passes isolated / at `--workers=1`).
- **On `develop`** (`5d4e3f3`, `567b5e9`). **NOT merged to `main`** yet — see next action.
- **NEXT:** (1) get the production DB connection string from the user and apply the 2 pending
  migrations (`20260908205105`, `20260908213756`); (2) merge `develop` → `main`; (3) beat-1 comments
  on #87–#90; (4) the user redeploys Hostinger.

## D-155 — #87–#90 merged to `main` + both production migrations applied (2026-09-09)
- `develop` → `main` merge `967f9b4` (`--no-ff`), `develop` fast-forwarded. CI running on `main`.
- **Production migrations applied** (user supplied the Supabase connection strings in chat, used
  only as transient shell env vars — never written/committed; user will rotate the DB password):
  `prisma migrate status` was clean beforehand (33/33, exactly the 2 expected pending), then
  `prisma migrate deploy` applied `20260908205105_commercial_opportunity` and
  `20260908213756_commercial_conversion_and_alerts`. After: "Database schema is up to date!" (35/35).
  Verified via the transaction pooler: `commercial_opportunity` (15 cols incl.
  `converted_by_user_id`/`revenue_eur`/`margin_eur`/`loads_generated`), `commercial_activity_log`,
  `commercial_alert`, `commercial_alert_config` all present; `CommercialOpportunityState` enum has
  all 10 values.
- Beat-1 comments posted on #87 / #88 / #89 / #90 (Spanish, not closed).
- **Still the user's:** redeploy Hostinger (production still runs a pre-#69 build — none of #85–#91
  or #87–#90 is live yet); rotate the DB password; live-verify #85–#91 + #87–#90, then close.
