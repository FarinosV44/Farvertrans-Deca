# Sprint — Commercial intelligence for Super Admin (#87 + #88)

> Phase 5 execution mode (D-019). On `develop`. Batch: build both, then STOP for the
> user's review before #89/#90 (user: "#87 + #88 ahora, luego reviso").

## Pre-agreed decisions (AskUserQuestion, this project)
- Eligibility for any commercial view = the company has an active `CommercialConsent`
  (`mode != 'none'`; a revocation sets `mode = 'none'`, so that one check is enough).
- Corridors of interest live in code for now (`lib/commercial/corridors.ts`), not a table/UI.
- Any `internal`-role user reaches these screens — no extra "commercial use" sub-role.
- Billing/margin (for #89 later) = manual optional input. Not in this sprint.

## Slices

### 1 — shared commercial foundation (pure logic, test-first per D-014)
- `lib/commercial/corridors.ts` — `CORRIDORS` constant + `matchCorridors(route)` + `zoneFor(country, province)`.
- `lib/commercial/activity.ts` — pure `summariseActivity(dates, now)` → counts 7/30/60/90d, first/last,
  previous-30d, trend, weekday histogram + busiest weekday.
- Tests: `commercial-corridors.test.ts`, `commercial-activity.test.ts`.

### 2 — `CommercialOpportunity` model + opportunities query
- Schema: `CommercialOpportunity` (companyId @unique, `state` enum, `note`, `updatedByUserId`,
  `contactedAt`, timestamps) + enum `review|contacted|interested|unavailable|discarded|converted`.
- Migration `2026…_commercial_opportunity`.
- `lib/commercial/opportunities.ts` — `listOpportunities(filter)` from eligible companies' `DecaRouteIntel`
  + `CommercialConsent` + `Acquisition` + `CommercialOpportunity` + `Company`. Pure `filterOpportunities`
  / `sortOpportunities` extracted for unit tests. `setOpportunityState()`.
- Tests: `commercial-opportunities.test.ts`.

### 3 — `/admin/oportunidades` page + actions + API + nav
- `app/admin/(protected)/oportunidades/page.tsx` (filters via searchParams, table).
- `components/admin/opportunity-actions.tsx` (state select + note + WhatsApp/email/ficha links).
- `PATCH /api/admin/oportunidades/[companyId]` (`isInternalRequest` → 404).
- Nav row under "Crecimiento y contenido". `docs/api/INDEX.md`.

### 4 — #88 carrier profile + affinity (pure logic, test-first)
- `lib/commercial/carrier-profile.ts` — `buildCarrierProfile(companyId)`: activity, top O→D routes,
  frequent countries/provinces/cities, per-route last-seen + repeat frequency, recurring plates.
- `lib/commercial/affinity.ts` — pure `affinityScore(inputs)` → `{ score 0-100, band, breakdown[] }`
  + `autoTags(inputs)`. Every point is a labelled rule; nothing opaque.
- Tests: `commercial-affinity.test.ts`, `commercial-carrier-profile.test.ts`.

### 5 — #88 UI on `/admin/empresas/[id]`
- New `Panel` "Actividad de transporte · Perfil comercial" — shown only when the company is eligible
  (`CommercialConsent.mode != 'none'`); otherwise a one-line muted note. Affinity score + full
  breakdown + auto-tags + routes/activity tables.

### 6 — e2e + full regression + docs + hand-off
- `tests/e2e/commercial-intelligence.spec.ts`.
- Full gate: typecheck, lint, prettier, unit, e2e, production build, keel:verify.
- `docs/PROGRESS.md`, `docs/decisions.md` (D-152), `docs/issues.md`, `docs/token-ledger.md`,
  `docs/05-test-points.md`, `docs/api/INDEX.md`.
- STOP for the user's review (do not merge to `main` without instruction).

## Privacy invariants (issue #87/#88 + `.claude/rules/security.md`)
- A company with no active `CommercialConsent` never appears as an opportunity and shows no
  commercial-profile tab.
- WhatsApp action only when `channel` includes phone AND a `contactPhone` is authorised; email
  action only when `channel` includes email AND a `contactEmail` is authorised.
- No new PII in analytics rows. No document content (goods, plates, price, token, URL) on these
  screens beyond what `DecaRouteIntel` already holds for internal route views.
- No external services, no geocoding, no paid AI — DB queries over existing rows only.

---

## Follow-up: #89 + #90 (D-154, 2026-09-08/09)

After the user approved #87/#88 ("main y haz la migracion luego sigue"), continued straight into
#89 + #90 — no separate review gate.

### #89 — conversion tracking + KPIs
- `CommercialOpportunityState` +4 states; `CommercialActivityLog` append-only trail;
  `convertedByUserId`/`convertedAt` + manual outcome fields on `CommercialOpportunity`.
- `lib/commercial/kpis.ts` — `commercialKpis(filter)` (funnel + double attribution) + activity
  trail readers. Pure `rollupFunnel` / `maxProgress` unit-tested.
- `/admin/comercial` page; `opportunity-actions` channel select + outcome form; #88 ficha
  "Historial comercial".

### #90 — internal alerts
- `lib/commercial/alert-rules.ts` — pure `evaluateAlerts` (10 rules, dedupe by company+kind+week).
- `lib/commercial/alerts.ts` — `refreshAlerts` (reconcile, never resurrect reviewed/dismissed) +
  config + list/status.
- `/admin/alertas-comerciales` page + PATCH `[id]` + POST `config`. Consented companies only.

### Migrations pending for production (apply with the `main` merge)
1. `20260908205105_commercial_opportunity` (#87)
2. `20260908213756_commercial_conversion_and_alerts` (#89/#90)

### Status
On `develop` (`5d4e3f3`, `567b5e9`). Full gate green (289 unit + build + e2e 231/3-flakes). NOT on
`main` — the 2 migrations need the production DB connection string from the user first, then merge +
beat-1 comments on #87–#90 + Hostinger redeploy.
