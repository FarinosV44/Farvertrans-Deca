# Issues — Farvertrans DeCA

> Living log of forge issues (GitHub: https://github.com/FarinosV44/Farvertrans-Deca/issues).
> Inventory first, one entry per issue worked. Updated the moment an issue is triaged, worked, or closed.
> Last inbound sweep: 2026-09-09 12:53Z — 9 new since the previous sweep: **#95–#101** (SEO/perf/
> security batch, P0/P1) and **#102, #103** (P0 Equipo / P1 Superadmin), all opened by the user, no
> third-party comments. #102 worked and merged to `main` this sweep (D-163/D-164); #103's own
> title/body was edited by the user mid-session (re-fetched before starting it — narrower scope, no
> hard-delete UI). #95, #96, #97, #98, #99, #100, #101, #103 queued next (D-161 order: #101 → #95 →
> #99 → #103 → #96/#97/#98/#100). No new comments on any existing issue; nothing sitting in
> `awaiting reporter`.
>
> Previous sweep: 2026-09-09 07:20Z — 3 new since the previous sweep: **#92, #93** (P2 UX) and
> **#94** (P0 security), all opened by the user, no third-party comments anywhere. All three worked
> in D-156/D-157 (this sweep's sprint). No new comments on any existing issue; nothing sitting in
> `awaiting reporter`. Everything else unchanged from the 2026-09-08 sweep below.
>
> Previous sweep: 2026-09-08 — open on the forge: #1–#4, #24, #33, #40–#43, #46, #47, #56
> (worked in D-042…D-111, awaiting the user's close), the launch batches **#59–#68** (all
> implemented + on `main`, awaiting the user's close) and **#69–#84** (implemented; #84 on `main`),
> plus **#85** (D-148, on `main`), **#86** (D-149, on `main`) + the p3 FIX (D-150) on `main`,
> **#91** (D-151, on `main` — user CONFIRMED Superadmin access works in prod), and **#87 + #88**
> (D-152) + the /admin/contenido editor fix (D-153) **built on `develop`, NOT on `main`** —
> the user reviews #87/#88 before #89/#90 and before the merge. No third-party
> comments on any issue. #29–#38 closed.
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
| 92 | [P2 UX] Vistas guardadas en Histórico | feat | medium | on `main`, awaiting deploy | E-092 |
| 93 | [P2 UX] 3 accesos rápidos personalizados en Inicio | feat | medium | on `main`, awaiting deploy | E-092 |
| 94 | [P0 Seguridad] Vulnerabilidad en rutas internas | fix | **critical** | **fixed**, on `main`, awaiting deploy | E-094 |
| 95 | [P0 SEO] Auditoría técnica de indexación | audit | high | **audited, script + fix on `main`** | E-095 |
| 96 | [P0 SEO/Performance] Core Web Vitals móvil | perf | high | queued | E-096 |
| 97 | [P1 SEO] Enlazado interno / autoridad temática | feat | medium | queued | E-097 |
| 98 | [P1 SEO] Datos estructurados y señales de entidad | feat | medium | **audited, fix on `main`** | E-098 |
| 99 | [P1 SEO] Tests de regresión SEO | test | medium | **suite en `main`, corre en CI** | E-099 |
| 100 | [P1 SEO] Search Console operativo | ops | medium | queued | E-100 |
| 101 | [P0 Seguridad/Confianza] HTTPS/headers sin perjudicar SEO | audit | high | **audited, fix on `main`** | E-101 |
| 102 | [P0 Equipo] Corregir membresías | fix | **critical** | **fixed**, on `main`, migration applied | E-102 |
| 103 | [P1 Superadmin] Archivar/marcar empresas de prueba | feat | medium | **implementado, on `main`** | E-103 |

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

### I-070 — #70 P0 UX: panel nav horizontal scroll · **DONE, on `main`** (D-130)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/70
- `app-nav.tsx` rewritten: grouped (work / company / help), wrap-safe pill row ≥768px, `<details>`
  disclosure <768px — no `overflow-x-auto` anywhere. Authed header made to fit 360px (AccountMenu
  name hidden <460px, command-palette button hidden <520px; Ctrl+K unaffected). New
  `panel-nav.spec.ts` (360/768/1280/1440 × 7 pages, ≤2 actions). No schema/i18n.

### I-079 — #79 P0 final regression checklist · **automated part done, on `main`** (D-140)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/79
- `docs/pre-launch-checklist.md` — automated coverage summary (all green) + the live-walk checklist
  the user runs on the deployed site + blocking ops items. Not closed: needs the live walk.

### I-081 — #81 Customer 360 · **DONE, on `main`** (D-139)
- `/admin/empresas/[id]` rebuilt: header + 6-KPI strip + collapsible panels + separated admin zone.
- Follow-up (5f6da74): "← Empresas" preserves the list's search + segment filters (`?from=`).

### I-083 — #83 company activity timeline + opportunity signals · **DONE, on `main`** (D-139/D-136)
- `lib/admin/timeline.ts` companyTimeline (milestones only) on the Actividad panel; opportunitySignals
  on the Resumen. No schema.

### I-084 — #84 [RGPD] granular commercial consent · **BUILT on `develop`, NOT on `main`** (D-146)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/84
- Evolves DATA #45 `CommercialConsent` → 3 modes (none/per_deca/all) + channel + append-only
  `CommercialConsentEvent` + `DecaAvailabilityShare` (the ficha de disponibilidad — carrier/
  destination/date/channel/contact ONLY, no column for any excluded field). Settings on a new
  `/panel/privacidad` page + nav tab; a discreet unchecked registration opt-in; a compact per-DeCA
  block in the wizard's last step (separate body key, never in `data_json`); per-DeCA withdraw.
  Legal sections drafted in privacidad/terminos (`LEGAL REVIEW PENDING`), `termsVersion` →
  `2026-09-15`. Admin read-only `/admin/tratamiento-comercial`.
- **No recipient side is built** (none exists) — records sit at `pending`.
- **Migration `20260908140000_commercial_treatment` is LOCAL DEV ONLY. NOT merged to `main`, NOT
  applied to production.** Per the issue: functional + legal review, then the user authorises the
  migration-apply and the merge.
- 5 slices on `develop` (`542fbdc` … ). Tests: 2 unit files + `commercial-consent.spec.ts` (the 8
  minimum cases + settings + opt-in + withdraw).

### I-082 — #82 segmentation + filters · **DONE, on `main`** (D-138)
- `/admin/empresas` — segment Badges per row + chip filters (?seg=) combining with search; documented
  `SEGMENT_RULES`, no scoring. Limpiar filtros. No schema.

### I-073 — #73 system health + incidents · **DONE, on `main`** (D-137)
- `generationHealth()` (last success + rate 24h/7d + consecutive failures) + "Incidencias recientes"
  table on /admin/sistema. text+badge, no false green. No schema.

### I-080 — #80 admin shell + lean Resumen · **DONE, on `main`** (D-136)
- `ADMIN_GROUPS` (Operación/Crecimiento/Seguridad); Resumen = 6-KPI strip + funnel + Empresas a
  contactar + Alertas + Señales; rest behind Más métricas. `/admin/activacion` new.

### I-072 — #72 activation funnel + Empresas a contactar · **DONE, on `main`** (D-136)
- `lib/admin/segments.ts` — rule-based per-company tags + funnel + companiesToContact + opportunitySignals.

### I-074 — #74 integration requests · **DONE, on `main`** (D-136)
- `IntegrationRequest` model (migration `20260908002549` — needs migrate deploy). `/panel/integraciones`
  form + `/admin/integraciones` triage. Landing "Próximamente" removed → active "Solicitar integración" card.

### I-078 — #78 P2 UX: favourites · **DONE, on `main`** (D-135)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/78
- company-scoped `favorite` flag on saved company/vehicle/location + template + new `favorite_route`
  table. `favorite desc` first in listSaved/listTemplates/getTopRoutes → wizard dropdowns too.
  `components/deca/favorite-star.tsx` in /panel/datos + template list + Rutas frecuentes.
  Migration `20260908000514` — **needs migrate deploy on prod**. `favorites.spec.ts` new.

### I-076 — #76 P1 UX: visible drafts + auto-recovery · **DONE, on `main`** (D-134)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/76
- `DecaDraft` (one per user) + `/api/deca/draft` PUT/DELETE; wizard debounced autosave + resume;
  panel "Borrador pendiente" strip. Migration `20260907235352` — **needs migrate deploy on prod**
  (Hostinger build runs it). `deca-draft.spec.ts` new. `t.panel.draft` x8.

### I-077 — #77 P1 UX: one-tap share from history · **DONE, on `main`** (D-133)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/77
- `components/deca/row-share.tsx` — compact Web Share / WhatsApp + copy; publicUrl from currentVersion
  token. Added to historico table + cards + panel recent rows. `t.historico.share` x8.
  `row-share.spec.ts` new. No schema.

### I-069 — #69 P0: Modo Inspección · **DONE, on `main`** (D-132)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/69
- `/panel/deca/[id]/inspeccion` — clean card of the version in force (VIGENTE/CORREGIDO), real QR,
  "Abrir PDF vigente" → current version's URL, no internal data. Entry points: detail, historico
  (table + mobile), result page (authed). `/d/[token]` untouched. `inspection.spec.ts` new.
  `t.historico.inspection` ×8. No schema.

### I-071 — #71 P0 Quality: pre-generation check · **DONE, on `main`** (D-131)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/71
- `DecaCheck` on the review step: re-runs the same `step1/2/3Schema` + `validateDeca()` client-side.
  Six rows, "Corregir" jumps to the field. Status `missing`/`review`/`ready`; disclaimer says it is
  not a legal validation. `t.crear.check` ×8. `deca-check.spec.ts` new. No schema.

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

## I-085 — #85 Ajustes UX: tratamiento comercial, datos de empresa/contacto, gratuidad 2026 · P1 · **DONE, on `develop`** (D-148)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/85
- **Diagnosis:** three independent pre-launch adjustments in one issue.
- **Resolution (D-148):**
  1. **Tratamiento comercial "Teléfono" → "WhatsApp".** Label-only across all 8 i18n dictionaries
     (`panel.privacy.channels`, `channelPhoneLabel`, `previewFields.contactPhone`, wizard
     `commercialShare.channels`); stored `CommercialContactChannel` enum keeps `phone` (issue
     permits it — avoids a production enum rename). New `commercialChannelLabelEs()` helper feeds
     the ES-only admin `/admin/tratamiento-comercial` (previously showed the raw enum).
  2. **Empresas/contactos habituales — código postal + población.** Migration
     `20260908170252_saved_company_postal_city` (additive nullable). `savedCompanySchema` +
     optional `postalCode`/`city`; `SavedDataManager` company form + list; wizard party autofill
     now carries CP + población from the picked saved company into the DeCA. Editing = existing
     delete/re-add pattern (consistent with all saved-data kinds; no per-record edit UI exists).
  3. **Gratuidad 2026 (discreto).** `landing.hero.launchBadge` pill in `app/page.tsx`; reworded
     `benefits[0].body` (dropped "sin plan de pago"), FAQ answer, `finalCtaMicrocopy`, `auth.footNote`
     — all anchored to "durante 2026 / a partir de 2027 mediante suscripción". No panel pricing UI.
- **Verification:** typecheck + lint + prettier + 205 unit (4 new: `commercial-availability`,
  `saved-schema`) + keel:verify green. e2e: `commercial-consent.spec.ts` (+WhatsApp assertion),
  `master-data.spec.ts` (+CP/población carry-through), `landing.spec.ts`.
- **Merged to `main`** `9d4d702` (2026-09-08, user instruction) + **production migration
  `20260908170252_saved_company_postal_city` applied** (ledger clean beforehand, 31/31, columns
  verified via :6543). `develop` == `main`.
- **Pending:** Hostinger redeploy so the code runs; then beat 3 + the user closes #85 (Keel never
  closes on its own reading).
- **Replies:** beat-1 posted 2026-09-08 (comment 5589051332, ES). Beat-3 after the user's redeploy.

## I-086 — #86 [ALTA] Datos habituales editables, soporte técnico/jurídico, acceso Superadmin, operadores · P0/P1/P2 · **DONE, on `develop`** (D-149)
- Link: https://github.com/FarinosV44/Farvertrans-Deca/issues/86
- **8 parts, worked in the issue's own priority order:**
  1. **p7 (P0) — acceso Superadmin desde PC.** Reported symptom: the 2FA screen loops / hangs
     "conectando". Fixed with a hard navigation after the check, a redirect-if-already-verified on
     `/admin/2fa/verify`, and code-leads-over-passkey when an authenticator app is enrolled. Cannot
     reproduce a server error in the flow — the fix targets the App-Router prefetch-cache class of
     bug plus the desktop passkey trap. **Needs the user to confirm live after redeploy.**
  2. **p1/p2 — habituales editables + CP/población obligatorios** (`updateSaved` + `PATCH`, "Editar"
     per row; `savedCompanySchema` requires CP + población, front + back).
  3. **p3 — MAYÚSCULAS**: saved habituales stored uppercase, DeCA PDF rendered uppercase (weight and
     emails/NIF left verbatim). The DeCA `dataJson` itself is not stored uppercase — recorded
     omission (D-149).
  4. **p5 — incidencias técnicas + sección Superadmin**: `SupportTicket` model, `/panel/ayuda` form,
     `/admin/soporte` (list/filter/detail/reply/status, 5 states), user notified by email.
  5. **p4/p6 — WhatsApp + jurídico separado**: no conventional phone as primary; WhatsApp 34607527719
     (técnico + jurídico, own message); `/panel/ayuda` legal section clearly separate,
     `info@praetoriaabogados.es`, "Consulta con un abogado por WhatsApp".
  6. **p8 — módulo de operadores**: create + individual `/registro?ref=` link + copy + attributed
     companies + activate/deactivate. Attribution already permanent/first-touch (#11). Commissions
     not built; model left ready.
- **Verification:** typecheck + lint + prettier + 215 unit (13 new) + keel:verify + full e2e.
- **Merged to `main`** `ce65fb7` + **both production migrations applied** (2026-09-08, user
  instruction; ledger clean beforehand, 31→33, verified via :6543). `develop` == `main`.
- **Replies:** beat-1 posted 2026-09-08 (comment 5590619965, ES). Beat-3 after the Hostinger redeploy.
- **Pending:** redeploy Hostinger; the user confirms p7 (Superadmin from PC) live; rotate secrets;
  then beat 3 + close #86.

## I-087 / I-088 — #87 Radar de oportunidades + #88 Perfil de transportista con afinidad · P1 Comercial · **BUILT on `develop`, NOT on `main`** (D-152)
- 2026-09-08, after the user confirmed #91 (Superadmin access) works in production. User: build
  #87 + #88, then review before #89/#90.
- Pre-agreed: eligibility = active `CommercialConsent`; corridors in code; any internal user;
  billing manual (that is #89).
- **#87** — `Super Admin > Oportunidades` (`/admin/oportunidades`): every carrier with an active
  commercial consent + its observed route activity from `DecaRouteIntel`; filters (origin/dest
  country·province·city, unload-date range, activity 7/30/90d, corridor, operator, state, sort);
  per-row manual state (`Revisar`/`Contactado`/`Interesado`/`No disponible`/`Descartado`/
  `Convertido`) + WhatsApp/copy-email **only for the authorised channel + value** + ficha link.
  New `CommercialOpportunity` model + migration `20260908205105` (local dev only).
- **#88** — `/admin/empresas/[id]` "Actividad de transporte · Perfil comercial": activity 7/30/60/90d
  + trend + busiest weekday, top routes with repeat frequency, frequent zones, recurring plates, and
  a transparent rule-based "Afinidad Farvertrans" score with its full breakdown + objective
  auto-tags. Rendered only when the company has an active consent.
- Deliberately out of scope: #89 (conversion/KPIs/manual billing) + #90 (alerts) — reviewed next;
  `tipo de vehículo` filter (data not stored). No automatic messaging.
- Gate: typecheck + lint + prettier + 273 unit (51 new) + production build + full e2e 232 passed
  (2 documented flakes, green at `--workers=1`).
- **NOT merged to `main`** — the user reviews #87/#88 first; the migration goes to production with
  that merge. No forge beat comment yet (posted after the review).

## I-CMS-FIX — /admin/contenido editor could not save/publish a blog post (D-153)
- 2026-09-08, user report mid-#87: "no deja publicar en el blog … y tampoco lo guarda."
- Root cause: API save/publish both work; the App Router client cache served a stale/empty
  `/admin/contenido/[id]` after the post-save soft navigation, so the saved content looked unsaved
  and the "Publicar" button never appeared (same class as #86 p7 / #91).
- Fix (`d9f825d`, on `develop`): hard navigation after save; clear "sesión caducada" message on a
  404; `force-dynamic` on the list + nuevo pages. Also stabilises `content-cms.spec.ts:60`.
- **Pending:** the Hostinger redeploy to reach production.

## I-089 / I-090 — #89 Seguimiento de contacto/conversión/negocio + #90 Alertas internas · P1/P2 Comercial · **BUILT on `develop`, NOT on `main`** (D-154)
- 2026-09-08/09. User: "main y haz la migracion luego sigue" — merged #87/#88, then continued
  straight into #89 + #90 (no review gate this time).
- **#89** — +4 opportunity states (No interesado / Pendiente de carga adecuada / Primera carga
  ofrecida / Primera carga adjudicada); `CommercialActivityLog` (quién, cuándo, estado anterior→
  nuevo, canal, nota, ruta); operador comercial que convierte guardado aparte del operador de
  captación; resultado económico manual opcional (referencia, primer porte, cargas, facturación,
  margen); `/admin/comercial` con KPIs (detectadas/contactadas/interesadas/convertidas/tasa/cargas/
  facturación/margen), embudo y doble atribución; filtros periodo/operador/país/corredor.
- **#90** — `/admin/alertas-comerciales`: 10 reglas simples sobre datos propios (descarga próxima en
  zona prioritaria, primera vez en corredor, varias descargas misma zona, ruta 3×, actividad
  creciente, interesante sin contactar, sin seguimiento, reactivación tras pausa, primer DeCA por
  referido, empresa captada recurrente), sin duplicados (dedupeKey empresa+regla+semana), acciones
  Revisada/Descartar (nunca se resucita una descartada), config simple. Solo empresas con
  consentimiento comercial activo. Nada se envía automáticamente.
- Fuera de alcance: detección de patrón semanal (#90 — datos insuficientes en `DecaRouteIntel`);
  cualquier mensajería/notificación automática; integración ERP/TMS.
- Migración `20260908213756_commercial_conversion_and_alerts` (local dev only) — junto con
  `20260908205105` (#87) son las 2 migraciones pendientes de aplicar a producción.
- Gate: typecheck + lint + prettier + 289 unit (16 nuevos) + build de producción + full e2e
  231 passed / 3 flakes de contención `internalPage` (verdes aislados).
- **NO fusionado a `main`** — antes hay que aplicar las 2 migraciones a producción (falta la cadena
  de conexión de la BD del usuario), luego merge + beat-1 en #87–#90.

## I-094 — #94 [P0 Seguridad] Vulnerabilidad en rutas internas · **FIXED, on `main`** (D-156)
- 2026-09-09. User report: "podría existir una vulnerabilidad accesible desde alguna ruta relacionada
  con operadores o con paneles internos" — no vector given, treated as P0 and reproduced before any
  code changed, per the issue's own diagnosis-first instructions.
- **Root cause, reproduced on a local production build:** every page under `app/admin/(protected)/`
  had no guard of its own — only the group layout's `requireInternal()`. The App Router renders
  layout and page in parallel, so the page's Flight payload was streamed even when the layout aborted
  with `notFound()`. `curl -H "RSC: 1" <url>/admin/empresas`, unauthenticated, returned HTTP 200 with
  478 KB of real company data (NIFs included); `/admin/activacion` returned 7.74 MB / 6080
  company-name hits. A plain `page.goto()` correctly 404'd throughout, which is why the existing
  `admin.spec.ts:79` stayed green the whole time.
- **Fix:** `await requireInternal()` is now the first statement of all 29 internal pages (28 changed;
  `/admin/seguridad` already had it). Not middleware — `verifySession` uses `node:crypto` (not
  edge-capable) and the token carries no `role`.
- **The class cannot reopen:** `scripts/keel-verify.mjs` now fails any `(protected)/**/page.tsx`
  without its own guard call.
- **Scope confirmed by enumeration, not assumption:** all 28 `/api/admin/*` routes and every
  company-scoped `/api/*` route already had a real guard — no IDOR found elsewhere.
- Regression: `tests/e2e/admin-rsc-authz.spec.ts` (3 RSC transports × anon/normal-customer/internal,
  6 tests) — written first, observed failing on the real leak.
- Gate: typecheck + lint + prettier + keel-verify + 16/16 targeted e2e (admin, admin-account-
  lifecycle, admin-rsc-authz).
- **On `main`** (`9fcba7f`). **The currently-DEPLOYED build is still exposed until the user
  redeploys Hostinger** — the `(protected)` layout predates #69, so production has this flaw live
  right now even though `main` itself is fixed. Beat-1 comment posted on the issue.

## I-092 — #92 [P2 UX] Vistas guardadas en Histórico · **implemented, on `main`** (D-157)
- 2026-09-09. Saved combinations of the Histórico's existing filters (`q`, `from`, `to`, `carrier`,
  `plate` — no new filter, pinned by a unit test), private per user (not per company).
- `SavedHistoryView` model, migration `20260909075010_saved_history_views_and_quick_actions`
  (local dev only), max 12 views/user, `@@unique([userId, name])`. Every read/write scoped by
  `(id, userId)` — another user's id resolves 404, never a permission check that could be forgotten
  (verified by an IDOR test, applying #94's lesson to a new surface).
- `GET/POST /api/panel/vistas`, `PATCH/DELETE /api/panel/vistas/[id]` — zod at the boundary.
- Chip row above the Histórico filters: save (only when filters are active)/apply-in-one-click/
  rename/delete, active chip marked, "Limpiar filtros" untouched.
- i18n: `historico.views` added key-for-key to all 8 catalogues.
- Gate: typecheck + lint + prettier + keel-verify + 26 new unit (pure logic, test-first, observed
  red before `lib/data/history-views.ts` existed) + 5 e2e (own suite) + full e2e 249/249.
- **On `main`** (`9fcba7f`). Beat-1 comment posted on the issue.

## I-093 — #93 [P2 UX] 3 accesos rápidos personalizados en Inicio · **implemented, on `main`** (D-157)
- 2026-09-09. Up to 3 shortcuts on Inicio to functions that already exist, chosen per user
  (`User.quickActions String[]`, same migration as #92). Catalogue of 9 existing destinations
  (`lib/panel/quick-actions.ts`), no duplicates, no widget builder (no drag&drop/colours/sizes —
  the issue rules those out explicitly).
- **Deliberate omission, on the record:** the issue's example list includes "Rutas habituales", which
  is not a real destination in the product — offering it would mean inventing a screen, which the
  issue forbids. "Plantillas" ("Guarda las rutas que repites") is offered instead and covers the
  intent.
- `PUT /api/panel/accesos` — zod at the boundary; `parseQuickActions` is the real authority
  (drops unknown keys/repeats/4th choice, never rejects with a 422 for a stale catalogue key).
- `/panel/datos`'s three existing sections gained stable anchors (`#empresas`/`#vehiculos`/
  `#lugares`) so the 3 data shortcuts address distinct destinations rather than 3 copies of one page.
- i18n: `panel.quickActions` added key-for-key to all 8 catalogues.
- Gate: typecheck + lint + prettier + keel-verify + 14 new unit (pure logic, test-first, observed
  red before the module existed) + 4 e2e (own suite) + full e2e 249/249.
- **On `main`** (`9fcba7f`). Beat-1 comment posted on the issue.

## I-102 — #102 [P0 Equipo] Corregir membresías · **FIXED, on `main`, migration applied** (D-163/D-164)
- 2026-09-09. Reproduced the exact reported sequence before writing any fix: own company A →
  invited to and accepted company B → A silently overwritten (no `Membership` table existed,
  `User.companyId` was the only record) → removed from B → `companyId: null`, indistinguishable
  from an account that never had a company (the "Crear cuenta gratis" symptom + Superadmin showing
  0 members on the original company).
- New `Membership` model (User↔Company N:M), migration
  `20260909125838_membership_model_and_company_is_test`, backfilled 1:1 from every existing
  `User.companyId` in the same migration (verified: 10/10 on production). `User.companyId`/
  `companyRole` kept as an "active company" denormalization, written from exactly two choke points
  (`joinCompany`/`leaveCompany` in `lib/team.ts`) — the ~71 files that only read them needed no
  change.
- UX per the issue's own spec: "Quitar" → "Eliminar acceso" with a confirm naming the company;
  workspace switcher in the account menu; invite-link WhatsApp/copy fallback with prominent styling
  when email delivery fails (raised by the user mid-session); Superadmin recovery tool
  (`reassignUserToCompany`, audited, mandatory reason); `orphaned` alert + `duplicate_nif` segment
  tag (passive — D-162, a hard duplicate-NIF block was tried and reverted: 42 e2e specs share one
  placeholder NIF, proving the collision is legitimate in real use too).
- Regression: `tests/e2e/membership.spec.ts` (5/5) reproduces the exact bug then proves it fixed;
  `team.spec.ts` (7/7) needed only one change (accept the new confirm dialog).
- Gate: typecheck + lint + prettier + keel-verify + 335 unit (5 new) + full e2e 253/254 (1 =
  documented `master-data.spec.ts:38` flake, green isolated).
- **AC checklist:** 7/8 items directly verified by the automated suite above. The 8th
  ("Flujo probado manualmente con dos cuentas reales de prueba y dos workspaces") was not run as a
  literal manual click-through — `tests/e2e/membership.spec.ts` drives the equivalent scenario
  (two real accounts, two real workspaces, invite/accept/remove) end to end instead, which is the
  stronger, repeatable form of the same check.
- **On `main`** (`48f9415`). Production migrations applied and verified directly (36→38, exact
  backfill match). **Production is not yet running this build** — needs the Hostinger redeploy
  (unchanged blocking item from D-155/D-158). Beat-1 comment posted on the issue.

## I-101 — #101 [P0 Seguridad/Confianza] HTTPS/headers · **audited, fix on `main`** (D-165)
- 2026-09-09. Audited: CSP, cookie flags, error-page leakage, robots-not-as-access-control — all
  already correctly built from earlier security work. One real gap fixed: HSTS `preload` removed
  (no subdomain inventory existed, exactly what the issue warns against); no-behavior-change since
  the domain was never submitted to hstspreload.org. TLS termination/HTTP redirect and WAF rules
  are Hostinger's own layer, documented as such in `docs/production-smoke-checklist.md` §7 rather
  than claimed as verified. Regression: `tests/e2e/launch-gate.spec.ts` extended.
- **On `main`** (`0eb75cb`). Beat-1 comment posted.

## I-095 — #95 [P0 SEO] Auditoría técnica de indexación · **audited, script + fix on `main`** (D-166)
- 2026-09-09. Real crawl against a production build (`npm run seo:audit`, new script): 23/23
  sitemap URLs clean, 8/8 private routes correctly noindex/404. Deliverable matches the issue's own
  "Entregable" spec exactly; wired into `docs/production-smoke-checklist.md` §6a.
- **Live bug found and fixed while running this audit:** re-inviting the same email created a
  second, independently-valid `CompanyInvite` token — reproduces the user's "invitation expired"
  report on a freshly generated link (confirmed via direct production DB query: the reported token
  matched zero rows; the real invites in the table had a correct 14-day expiry). `createInvite()`
  now rotates the pending invite in place. Regression: `tests/e2e/team.spec.ts`.
- **On `main`** (`0eb75cb`). Beat-1 comment posted.

## I-099 — #99 [P1 SEO] Tests de regresión SEO · **suite en `main`, corre en CI** (D-167)
- 2026-09-09. `tests/e2e/seo-regression.spec.ts` — no un script aparte: este proyecto ya ejecuta
  todo lo que hay en `tests/e2e/` en CI (`npm run test:e2e`), así que cumple "ejecutable en CI" sin
  añadir nada al workflow. Complementa el script de #95 (pensado para correr contra un entorno ya
  desplegado): esta suite corre en cada commit contra la lista de rutas críticas del issue, y añade
  OG tags + validez de JSON-LD, que el script de #95 no cubre.
- Cada comprobación corresponde a una regresión que el propio issue marca como "debe bloquear"
  (noindex accidental, canonical ausente/incorrecto, 404 en página core, JSON-LD inválido, sitemap
  con URL privada o que no da 200, robots.txt bloqueando todo el sitio) — nunca un umbral cosmético.
- 23/23 en verde sin relajar ninguna comprobación.
- **On `main`** (`d7e6ace`). Beat-1 comment posted.

## I-103 — #103 [P1 Superadmin] Archivar/marcar empresas de prueba · **implementado, on `main`** (D-168)
- 2026-09-09. Construido según el alcance reducido que el usuario editó a mitad de sesión (re-leído
  antes de empezar): **sin ninguna vía de borrado destructivo en Superadmin**, ni siquiera protegida.
- Archivar/desactivar/reactivar YA existía de #62 (`setCompanyStatus`, auditado, cierre de sesión) —
  reutilizado, no reconstruido. Nuevo: `Company.isTest` + toggle "Marcar como prueba" (reversible,
  auditado, nunca toca acceso ni datos); pestañas Activas/Archivadas/TEST/Todas en
  `/admin/empresas` (Activas oculta TEST/no-activas por defecto, todo sigue a un clic); KPIs de
  negocio excluyen empresas TEST.
- **Verificado directamente:** `delete`/`hard_delete`/`remove`/`purge` enviados al endpoint de
  administración de empresas — las cuatro rechazadas (422), empresa y DeCA intactos.
- **On `main`** (`7ceea98`, sin migración nueva — la columna `isTest` ya se aplicó con #102). Beat-1
  comment posted.

## I-098 — #98 [P1 SEO] Datos estructurados y señales de entidad · **audited, fix on `main`** (D-169)
- 2026-09-09. Auditado antes de tocar nada: `Organization`, `Article`/`BlogPosting` + `BreadcrumbList`
  en blog/guías/páginas SEO ya estaban bien construidos — `dateModified` real (de la base de datos,
  nunca del build), `publisher` distinguiendo correctamente PRAETORIA de la marca del producto,
  `reviewedBy` solo con revisor real, señales editoriales también visibles en pantalla (no solo en
  JSON-LD). `sameAs` correctamente ausente (no hay perfiles sociales reales aún, verificado).
- **Hueco real encontrado y corregido:** `FAQPage` se emitía sin condición en la portada —
  violación directa de la propia instrucción del issue. Retirado (contenido visible intacto).
  Añadido `WebSite` (faltaba), CIF y logo en `Organization` (datos ya públicos, nunca inventados),
  `image` en artículos cuando existe.
- `AC-33` en `docs/02-functional-spec.md` corregido para reflejar la nueva realidad; los dos tests
  existentes que afirmaban `FAQPage` reescritos para afirmar su ausencia.
- **On `main`** (`3b1465f`). Beat-1 comment posted.

## D-170 (Superadmin correction) — user's explicit follow-up on #103, same session
- 2026-09-09. Tras el beat-1 de #103, el usuario pidió expresamente eliminar TAMBIÉN la acción
  "Anonimizar definitivamente" de la gestión de empresas en Superadmin — ninguna acción irreversible
  debe ser alcanzable desde la interfaz web normal. `anonymize` eliminado del endpoint
  `PATCH /api/admin/empresas/[id]` (422 si se solicita); la función queda como base para un
  procedimiento técnico excepcional fuera de Superadmin, nunca como botón web. Anonimización de
  usuarios (`kind=usuarios`, función distinta) no se tocó — fuera del alcance de esta petición,
  señalado al usuario en vez de asumido.
- **On `main`** (`3b1465f`). Comentario de corrección posted en #103.

## I-097 — #97 [P1 SEO] Enlazado interno inteligente y arquitectura de autoridad temática · **built, D-171**
- 2026-09-09. El issue da sus listas de hubs y "páginas estratégicas" como ejemplo y pide
  expresamente ajustarlas a las URLs reales — los 8 hubs de ejemplo se mapearon a las 15 páginas
  `content/seo/pages.ts` ya existentes (`lib/content/internal-linking.ts`, `SEO_HUBS`), sin crear
  páginas pilar nuevas porque ya cubrían casi 1:1 la lista del issue.
- **Hueco real encontrado y corregido:** el editor de contenido guardaba `relatedSlugs` pero no
  tenía ningún campo para editarlo — solo se podía fijar por seed o escritura directa en BD. Añadido
  un selector "Contenido relacionado" en `components/admin/content-editor.tsx`: sugerencias de la
  misma categoría con un clic, más una lista manual filtrable — cubre a la vez el "sugerir 3-5" y el
  "permitir selección manual" del issue.
- Nuevo `scripts/internal-links-audit.mjs` (`npm run seo:links-audit`): huérfanas, páginas
  estratégicas con poco enlazado entrante, enlaces rotos (el único fallo duro), anchors repetidos,
  páginas con exceso de enlaces, profundidad de clic desde home. Ejecutado contra un build real: 0
  enlaces rotos, 0 huérfanas, 2 páginas estratégicas señaladas para refuerzo editorial
  (`/deca-gratis`, `/deca-empresas-transporte`).
- No se han construido páginas pilar nuevas ni un motor de similitud más allá de "misma categoría" —
  el issue no lo exige y ya existía infraestructura suficiente; ver D-171.
- **On `main`** (see PROGRESS.md). Beat-1 comment posted.

## I-096 — #96 [P0 SEO/Performance] Core Web Vitals · **in progress, D-172**
- 2026-09-09. Causa raíz confirmada directamente (producción real + un build de producción local):
  todo el sitio público se sirve `Cache-Control: no-store` — el CDN de Hostinger lo confirma
  (`x-hcdn-cache-status: DYNAMIC`) — porque `cookies()` (vía `getLocale()`, para el selector de
  idioma) se llama en algún punto del árbol de render de CADA página, y en Next.js App Router eso
  vuelve dinámica TODA la ruta, sin excepción por rama.
- Pregunta al usuario (AskUserQuestion) sobre cómo resolverlo: eligió que el servidor renderice
  siempre español (por defecto, D-002) y el selector de idioma corrija el texto en cliente tras la
  hidratación.
- **Corregido:** la lectura de `cookies()` propia de `SiteHeader` — ahora recibe un `locale`
  opcional (las páginas estáticas lo pasan; las páginas ya dinámicas mantienen el comportamiento
  anterior), con `LanguageSwitcher` corrigiendo el texto visible en cliente
  (`lib/i18n/header-strings.ts` + `data-i18n-key`). Verificado de extremo a extremo.
- **NO corregido — una segunda causa independiente y más profunda, encontrada al verificar:** el
  layout raíz (`app/layout.tsx`) también llama a `getLocale()` para CADA ruta, sin excepción, y por
  sí solo mantiene `Cache-Control: no-store` en todo el sitio incluido el clúster SEO. No se tocó
  porque `LocaleProvider` tiene 9 consumidores reales (`useT()` en el asistente de creación, el
  formulario de registro, soporte) que necesitan el idioma correcto en el primer pintado en páginas
  que YA son dinámicas por otros motivos (sesión) y no ganan nada con el caché estático — aplicar el
  mismo intercambio en cliente ahí sería una regresión pura sin beneficio. Necesita una
  reestructuración real por grupos de rutas o Partial Prerendering — recomendado como un seguimiento
  propio, no una decisión apresurada al final de esta investigación.
- 2026-09-09, continuación (D-174): imágenes auditadas — un hueco real corregido (`heroImage` sin
  caja reservada, riesgo de CLS), el resto ya estaba bien. `Inter` eliminado por completo — se
  declaraba como fallback pero nunca se renderizaba (`Archivo` siempre resuelve primero), una
  familia de fuente entera descargada en cada página sin ningún efecto visual. Nuevo
  `scripts/perf-budget.mjs` (`npm run perf:budget`): presupuestos de peso JS por ruta prioritaria
  contra un build real, 8/8 dentro de presupuesto ahora mismo. El peso mayor de
  `/crear`/`/entrar`/`/registro` se investigó sin encontrar una causa única — documentado como
  pregunta abierta, no arreglado a ciegas.
- 2026-09-09, cierre (D-175): nuevo `scripts/perf-baseline.mjs` (`npm run perf:baseline`) — navegador
  real (Chromium), perfil móvil real (Pixel 5), throttling real (perfil "Slow 4G" + 4x CPU de
  Lighthouse, para que sea comparable, no un umbral inventado). Ejecutado directamente contra
  producción: LCP 1460-1960 ms en todas las rutas prioritarias (bien por debajo del umbral "good"
  de 2500 ms incluso con throttling), CLS 0 en todas. Es el baseline "después" de esta sesión — no
  existe un "antes" equivalente de antes de esta sesión, así que sirve como referencia para
  cualquier trabajo futuro de #96.
- **Checklist de aceptación del propio issue frente a lo hecho esta sesión:** baseline ✓, cuellos
  de botella principales encontrados y en su mayoría corregidos ✓ (el peso JS de
  `/crear`/`/entrar`/`/registro` queda como pregunta abierta), SEO/indexabilidad sin degradar ✓,
  imágenes/fuentes sin CLS evitable ✓, caché/compresión de assets estáticos ya correcta ✓,
  presupuestos añadidos ✓, verificado en producción ✓. **Sigue abierto, ambos documentados como
  seguimiento propio en vez de decidido de prisa:** la arquitectura de caché del layout raíz
  (D-172) y la pregunta del peso JS de `/crear`/`/entrar`/`/registro` (D-174).
- **On `main`** (see PROGRESS.md).

## I-104 (D-173, urgent) — company-less logged-in user stuck in a dead-end loop
- 2026-09-09. Reportado en directo por el usuario mid-sesión: su padre, tras ser eliminado del
  equipo, se quedaba sin poder ni iniciar sesión ni registrarse — `/panel` lo enviaba al formulario
  completo de alta, que rechazaba correctamente su propio correo por ya existir. Causa: las 13
  páginas bajo `app/panel/**` redirigían a `/registro` en vez de a `/registro/completar-empresa`
  (ya existente, pensado exactamente para esto, pero solo conectado al alta con Google). Reproducido
  en rojo con `git stash` contra el código previo, luego verde. **On `main`** de inmediato, antes y
  aparte del resto de #96 — incidente en vivo, no una entrega programada. Issue #104 abierto
  retroactivamente (ya corregido) por la política "Issue capture: on" de este proyecto.

## I-112 — Múltiples envíos (varios lugares de carga/descarga) en un único DeCA
- 2026-09-11. Issue del usuario, triaged al empezar a trabajarla (no requirió apertura por Keel — ya
  existía en el forge). Feature grande, con base normativa detallada (Resolución de 5 de junio de
  2026, apdos. Quinto y Sexto; Ley 15/2009 art. 7.2/7.3; Orden FOM/2861/2012 art. 6.c/d). Requiere
  planificación de sprint antes de tocar código — no es un fix puntual: toca el modelo de datos del
  DeCA, el wizard de creación, la plantilla del PDF, y la validación de corrección/versionado.
- **Hallazgo clave de la investigación previa a planificar:** `DecaVersion.dataJson` ya es un JSON
  libre por versión (no columnas relacionales) — modelar `shipments: Shipment[]` dentro de ese JSON,
  en vez de una tabla `Envio` nueva, evita una migración relacional y hace la compatibilidad hacia
  atrás casi automática (un DeCA antiguo es, conceptualmente, `shipments: [ese único envío]`).
  Además, el sistema de corrección/versionado (R-13, `POST /api/deca/[id]/version`,
  `changeReason` obligatorio, versión anterior conservada, nueva URL/QR) YA CUMPLE la mayor parte del
  requisito "modificación trazable" del issue — reutiliza el mismo `validateDeca()`/`decaPayloadSchema`
  que la creación, así que extender el payload beneficia a ambos flujos a la vez.
- **Sprint 1 (creación) — HECHO en `develop`, sin fusionar a `main` (D-205).** Modelo de datos tal
  como lo especificó el usuario: cargador/transportista solo a nivel de DeCA (sin campo por envío —
  "no se pueden mezclar" es cierto por construcción, no una regla añadida); origen/destino/mercancía/
  peso/`recipient` (nuevo, ligero: solo nombre, sin NIF/domicilio) siempre explícitos por envío;
  fecha/matrícula/notas son valores por defecto a nivel de DeCA que un envío puede sobrescribir.
  `decaPayloadSchema` acepta el cuerpo plano de antes de #112 O el nuevo `{..., shipments: [...]}` —
  cero cambios en ningún llamador existente. PDF: un bloque ENVÍO N por envío resuelto; con 1 solo
  envío el PDF es byte-idéntico a antes de #112; con 2+, insignia "ENVÍO N", PESO TOTAL (solo si
  todos los pesos son numéricos) y el aviso de que la numeración no implica orden de ejecución.
  Wizard: apagado por defecto (flujo de un solo envío sin cambios), interruptor "+ Añadir otro envío"
  con bloques de entrada manual; oculto durante la corrección de un DeCA existente (hueco real,
  Sprint 2). **Fallo real encontrado y corregido en la propia sesión** (ver
  `docs/lessons-learned.md`): el mirror de compatibilidad hacia atrás (`legacyMirrorFields`) se
  escribió y se probó en unitarios, pero nunca se llamó realmente desde `createDeca`/`correctDeca` —
  lo detectaron 5 tests e2e reales (no los unitarios) al leer los datos guardados. Corregido
  (`toDataJson()`); de paso se corrigió también la ventana de disponibilidad pública R-9
  (`serviceStart`/`serviceEnd`), que antes solo cubría las fechas por defecto del DeCA y no las de
  cada envío resuelto. Nuevo `tests/e2e/deca-multi-shipment.spec.ts` (el ejemplo del propio issue,
  Valencia→Madrid + Castellón→Madrid) descarga y lee el PDF real generado. Gate: 413/413 unitarios,
  tsc/eslint/prettier/keel-verify limpios, y el conjunto de regresión dirigido (38 tests, los ficheros
  afectados por el fallo del mirror) en verde. **Un SEGUNDO fallo real de la misma clase** apareció al
  correr la suite completa: `app/api/deca/route.ts` pasaba `validated.data` directamente a
  `recordAvailabilityShare()` (#84) — otro consumidor directo del formato plano que el primer barrido
  no detectó. Corregido igual que `route-intel.ts`. Confirmado completo con un grep exhaustivo de todo
  el código. **Suite e2e completa confirmada, dos veces, en verde** (321-323/323, 1 skip; el único
  fallo, `content-cms.spec.ts`, es un flake de contención ya documentado en el proyecto, no relacionado
  con #112 — confirmado 6/6 en verde en aislamiento). Ver `docs/lessons-learned.md` para el desvío de
  infraestructura (OOM, reinicio de Docker Desktop, servidor huérfano por `reuseExistingServer`) que
  retrasó confirmar el segundo fallo.
- **Sprint 2 (D-206) — HECHO, misma sesión inmediatamente después de D-205.** La revisión previa a
  generar ya muestra un bloque por cada envío adicional (antes era invisible del todo). `diffVersions`
  es consciente de los envíos: uno añadido/eliminado/editado más allá del primero es su propia fila
  "Envío N"; el envío 1 gana también una fila de `recipient` (el único campo que nunca se reflejó
  arriba). Insignia "+N envíos" en Historial (tabla + móvil), Inicio, buscador Ctrl+K, exportación CSV
  (columna real `envios_totales`) y el panel admin. Corregir un DeCA que ya tiene varios envíos ya no
  los pierde en silencio — se precargan en el formulario. **Fallo real adyacente encontrado y
  corregido:** `toDisplayDeca()` no recorría `shipments[]` — el envío 1 salía en MAYÚSCULAS en el PDF
  (según #86p3) pero cualquier envío posterior salía tal cual lo escribió el operador. Corregido con
  test primero. Nuevos e2e: la insignia de Historial, y un ciclo completo de corrección (precarga →
  editar → guardar con motivo → el diff nombra "Envío 2" y el valor nuevo). Gate confirmado completo:
  420/420 unitarios, tsc/eslint/prettier/keel-verify limpios, suite e2e completa 321/324 + 1 omitido
  (los 2 fallos, `admin-2fa.spec.ts` y `content-cms.spec.ts`, no relacionados con #112, confirmados
  19/19 en verde juntos en aislamiento).
- **Cola después de #112:** #113 (rediseño de Datos habituales), #114 (rediseño de Historial), #115
  (subir versión 0.2.0→0.3.0 + cierre de documentación) — ninguno investigado todavía.

## I-113 — Rediseñar Datos habituales y adaptarlo a DeCA con múltiples envíos
- 2026-09-11. Issue del usuario, ya existía en el forge (18 secciones: rediseño visual completo +
  nuevo concepto de dato reutilizable + integración con el wizard + deduplicación + móvil en 8
  anchos). El propio issue pide responder, antes de tocar código, 5 preguntas de investigación —
  respondidas en sesión de plan mode con el usuario (documentado en detalle en `docs/decisions.md`
  D-207): cómo se guardan hoy empresas/vehículos/lugares (`SavedCompany/Vehicle/Location`, ya
  existen, con `favorite`/`lastUsedAt` ya conectados); si carga/descarga usan modelos separados (NO —
  `SavedLocation` ya los unifica con un `type: load|unload|both`, la preocupación del §12 del issue
  ya estaba resuelta); cómo debe integrarse un "SavedShipment" con el modelo multi-envío de #112
  (nuevo, un único tramo reutilizable, siempre por `loadLocationId`/`unloadLocationId` a lugares ya
  guardados, nunca texto libre); qué responsabilidad queda en Plantillas para no duplicar el concepto
  (Plantillas sigue siendo dueña de la ruta compuesta completa — `DecaTemplate.shipments[]`); cómo se
  preservan los habituales existentes (aditivo puro, nada existente se toca).
- **Fase 1 (creación del concepto + integración con el wizard) — HECHA en `develop`, sin fusionar a
  `main` (D-207).** El usuario eligió fasear el issue (igual que #112): Fase 1 = el nuevo concepto
  "Ruta/envío habitual" + su integración en el wizard; Fase 2 (sesión futura) = el rediseño visual
  completo de la propia pantalla Datos habituales (pestañas, buscador global, empty states, móvil).
  Nuevo modelo `SavedShipment` (migración aditiva, sin tocar nada existente, con RLS habilitado) +
  CRUD (`lib/data/saved-shipments.ts`) + `POST/GET /api/saved-shipments` +
  `PATCH/DELETE /api/saved-shipments/[id]`. En el wizard: selector "Usar ruta/envío habitual" en el
  envío 1 Y en cada bloque ENVÍO N adicional (antes NINGÚN bloque adicional tenía selectores de datos
  habituales — el hueco concreto que el §10 del issue señala), más "☆ Guardar como envío habitual" en
  línea durante la creación (§11), visible solo cuando ambos lugares ya son `SavedLocation`.
  Plantillas (`DecaTemplate`) extendida con `shipments[]` opcional para la ruta compuesta completa
  (§5); `templates.ts` partido en un fichero de esquema puro (`template-schema.ts`) para que sea
  testeable, mismo patrón que `saved-schema.ts`/`saved.ts`. **Hueco adyacente preexistente
  encontrado y corregido de paso:** la página de corrección pasaba un `saved` vacío a mano — los
  selectores de datos habituales llevaban muertos ahí desde siempre, no solo para envíos; ahora carga
  los datos reales. Gate: 429/429 unitarios (+9 nuevos), tsc/eslint/prettier limpios, barrido de
  regresión e2e dirigido 21/21 en verde (`saved-shipments.spec.ts` nuevo 2/2,
  `deca-multi-shipment.spec.ts` 4/4, `crear.spec.ts` 9/9, `creator-v2.spec.ts` 5/5,
  `favorites.spec.ts` 1/1).
- **Pendiente (Fase 2, sesión futura):** el rediseño visual de la propia pantalla Datos habituales —
  hoy no existe ninguna pestaña ni listado para ver/gestionar las rutas guardadas, solo crearlas
  (desde el wizard) y consumirlas (el selector).

- 2026-09-10. Abierto por Keel antes de empezar (política "Issue capture: on"). Un issue paraguas,
  4 partes, un sprint cada una. Plan: `~/.claude/plans/stateful-puzzling-sunrise.md`.
- **Parte 1 — Guía de uso (D-195): HECHA en `develop`, sin fusionar a `main`.**
  - Nuevo `ContentItem` `guia-de-uso-deca-profesional` (tipo `guide`, publicado, indexable),
    renderizado por el `ArticleLayout` existente — mismo aspecto que las demás guías.
  - Renderer Markdown compartido, solo añadidos: callouts tipados `::: tip/important/example` y
    imágenes de bloque `![alt](/local.png "pie")` (solo rutas locales). Helpers puros con
    tests (`tests/unit/markdown-blocks.test.ts`, 8). Sin regresión (content-cms.spec 6/6).
  - Contenido: `prisma/content/guia-de-uso.ts`, 19 secciones redactadas contra la app real.
  - 9 capturas reales con datos sintéticos (`scripts/guide-screenshots.mjs`) en `public/guia/`.
  - `tests/e2e/guia-uso.spec.ts` (3). Gate verde: tsc/eslint/prettier/keel-verify; 394 unit; e2e 9/9.
  - **Producción:** ejecutar `npm run seed:content` tras el despliegue para publicar la guía; las
    correcciones posteriores se hacen en `/admin/guias` (el seed solo crea, no actualiza).
- **Parte 2 — Pulido de Ayuda (D-196): HECHA en `develop`, sin fusionar a `main`.** Solo visual:
  canales de soporte como acciones con icono, formulario pulido, mejor estado vacío de "Mis
  incidencias", enlace secundario a Guías (sin tarjeta, sin ítem de menú), 3 iconos SVG nuevos,
  4 claves i18n ×8 locales. Sin cambio de comportamiento — todos los `data-testid` intactos,
  `panel-help.spec.ts` + `support-tickets.spec.ts` pasan sin modificar. Captura de pantallas hecha
  determinista y las 9 recapturadas. Gate verde (394 unit, e2e 13/13).
- **Parte 3 — Verificación E2E de incidencias (D-197): HECHA en `develop`, sin fusionar a `main`.**
  Flujo completo verificado y verde; notificaciones confirmadas hacia `Deca@praetoriaabogados.es`
  y hacia el usuario (`mail_provider_error 401` en local = clave Resend de marcador; la entrega
  real al buzón necesita el panel de Resend del usuario). Anti-duplicado: `createSupportTicket()`
  descarta una incidencia idéntica en 2 min (sin fila duplicada ⇒ sin email duplicado); el cuerpo
  de la notificación añade id de empresa/usuario + fecha ISO. Sin cambio de esquema. El texto
  "Recibirás la respuesta por correo y también aquí" es cierto — no se cambia.
- **Parte 4 — Claridad API/ERP + "Solicitar integración" (D-198): HECHA en `develop`, sin fusionar
  a `main`.** Las 3 funciones `soon` del plan Business muestran "+ coste adicional" junto a
  "Próximamente" (intacto), sin precio fijo; `apiDisclaimer` + `integrationsCard.body` reescritos
  para que nada implique inclusión en la suscripción — 8 locales. `createIntegrationRequest()`
  ahora envía email de notificación a `Deca@praetoriaabogados.es` (antes: solo BD + panel admin,
  nadie avisado) con anti-duplicado de 2 min; copia de confirmación realista. Sin cambio de
  esquema. e2e: admin-growth 4/4 (+ test nuevo de duplicado), plans 10/10.
- **Estado global de #111: las 4 partes HECHAS en `develop` (D-195…D-198), listas para `main`.**
  El merge `develop`→`main` y cualquier despliegue son decisión del usuario.
- **Sin cerrar** (política de 3 tiempos): al fusionar se comenta el avance; el usuario confirma
  tras el despliegue (incluye ejecutar `npm run seed:content` para publicar la guía, y comprobar
  en el panel de Resend que los correos a `deca@praetoriaabogados.es` se entregan).
