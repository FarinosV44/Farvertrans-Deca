# Discovery — Farvertrans DeCA

## Problem & outcome
From 2026-10-05 every national road-freight movement in Spain needs a **DeCA** — a native-digital PDF
control document with an embedded QR pointing to a unique, no-auth HTTPS URL, retained ≥ 1 year, with a
change audit trail. Paper stops being accepted with no transitional period.

Farvertrans wants to **capture the maximum number of companies and recurring users** before and after the
mandate, not to monetise before 2026-12-31. The single value proposition is **DeCA GRATIS** — free, no card,
no document limit — with the product experienced immediately (no demo, no sales contact, no pricing wall).

Most important outcome: a visitor from an operator's link creates their first compliant DeCA in under a
minute, and comes back to create more.

Source issues: GitHub #1 (EPIC 01 Landing), #2 (EPIC 02 Tracking), #3 (EPIC 03 SEO), #4 (EPIC 04 Compliance).

## Competitive landscape & opportunity
- Scan status: **done** (some free-tier details for Truckio / DecaHub / Pretium not determined — noted).
- Source: `docs/00-competitive-landscape.md` (per-competitor inventory, regulatory baseline R-1…R-13, unified
  feature list, external-demand list).
- Table-stakes features the product must include: 3-step guided creation; native compliant PDF; QR → unique
  no-auth HTTPS URL with direct download; document history (≥ 12 months); traceable versions on correction;
  saved frequent data (companies, vehicles, addresses); duplicate a previous DeCA; share with driver by link;
  works on any device with no install.
- Differentiator candidates (grounded, low–medium confidence): truly unlimited free tier; first document with
  zero signup; driver delivery (link + WhatsApp/email) included not paid; "am I obligated?" guidance fused
  with the tool; no pricing/checkout anywhere in v1; faster correction flow.
- AI / MCP / agentic layer: **none warranted for v1** — forced filler. The product is a fast form + a
  compliant document engine; an LLM adds latency, cost and a legal-accuracy risk to a legally-defined
  document. Revisit later only for a support/FAQ assistant, explicitly out of scope now.

## Project type
- Primary: Web app (SSR/SSG public pages + API + hosted service).   Secondary: Website (marketing + SEO cluster).
- Security profiles loaded: `references/security/web-app.md`, `references/security/website.md`.

## Feature list (proposed v1 — assistant's proposal, to be confronted in 3a)
See the confrontation table below; the agreed v1 scope is recorded under `## Scope` after the user decides.

## Competitive confrontation (step 3a)
- Decision mode chosen by the user: **accept the assistant's recommendations** (recorded as default accepted — D-007).
- Table: see `docs/01a-confrontation.md` (32 rows, decisions recorded there).
- Scope impact vs the step 3 proposal: none material — the proposal already reflected the confrontation. Rows 24–29 confirmed as Later, 30–32 as Never.
- Honest assessment revisited after the confrontation: not required — scope did not change materially.

## Scope
- v1: confrontation rows 1–23 — compliance engine (native PDF ≤5 MB, QR→unique no-auth HTTPS URL, direct download, 7-day deactivation option, audit trail, versioning R-1…R-13), 3-step creation flow, public document URL, document history ≥12 months, saved companies/vehicles/addresses, duplicate a DeCA, driver share by link + WhatsApp deep link + email, printable driver copy, account/auth, first-DeCA-without-signup, unlimited free, abuse controls, landing (EPIC 01 full structure), acquisition tracking (EPIC 02: ref + UTMs, first/last touch, operators table, DB-queryable, lite internal dashboard), analytics events, SEO technical base, 10 core SEO pages, "am I obligated?" guided page.
- Launch-first subset (D-008): rows 1–14, 17–20, 22 + SEO technical base. Rows 16 (10 SEO pages), 21 (obligation page), 23 (operator dashboard) land immediately after launch.
- Later: local SEO pages (#24), long-tail/user-type SEO pages (#25), multi-user/team (#26), public API (#27), bulk import (#28), eCMR/CMR/ADR interop feature (#29 — SEO content page in v1, feature later).
- Never (v1): paid WhatsApp Business API (#30), AI/LLM assistant (#31), pricing/plans/checkout (#32) — each a D-entry (D-007) so it is not re-proposed.

## Honest assessment
The mandate creates a real, dated, non-optional demand from a large, non-technical audience — a strong
foundation. But:
- **"Gratis" is not a moat.** DecaDoc already gives 50/month free plus 20/month with no signup; Truckio
  reportedly offers free DeCA too. The landing's own EPIC text admits this. The moat has to be *unlimited +
  instant + simpler UX + better SEO + legal confidence + speed*, and each of those is a real build, not a
  tagline.
- **EPIC 04 is the whole product and the hard part.** A non-compliant generator is worthless: native PDF
  (not HTML-print-to-image), ≤ 5 MB, unguessable no-auth URLs that still resist enumeration, TLS 1.2+,
  direct download with no interstitial, 1-year retention, immutable audit trail, versioning on correction.
  This is where the effort goes; the landing is comparatively cheap.
- **Free-with-no-limit + a capture push invites abuse** — bots minting documents, storage cost, and
  reputational/legal risk if the tool is used to fabricate paperwork. v1 needs rate limiting and abuse
  controls that do not add user friction (EPIC 04 already asks for this).
- **SEO programmatic (EPIC 03) is a slow-burn** — it will not deliver before the mandate. The pre-mandate
  capture spike will come from operator links (EPIC 02) and paid/owned channels, not organic. Sequence
  accordingly: EPIC 04 + EPIC 01 + EPIC 02 first, EPIC 03 core pages next, the long tail after launch.
- **Deadline risk.** ~4 weeks to 2026-10-05. A compliant generator + landing + tracking is achievable in
  AI-time; the full 10-page SEO cluster + local pages is not, and should not block launch.

**Verdict: proceed — adjust sequencing.** Build EPIC 04 (compliance core) and EPIC 01 (landing) to a
launchable state first, EPIC 02 (tracking) alongside since it is cheap and time-sensitive, and EPIC 03 as a
core-pages-now / long-tail-later effort. Do not gate launch on the full SEO architecture.

- User decision: **proceed** with the adjusted sequencing (D-008 confirmed by the user).

## Constraints & non-negotiables
- **Regulatory**: every generated DeCA must satisfy R-1…R-13 (`docs/00-competitive-landscape.md`). This is a
  Phase 5 test-suite gate and a Phase 7 release gate.
- **Deadline**: 2026-10-05 mandate. Launchable core before then.
- **No pricing / checkout / "solicitar información" / demo / commercial CTA anywhere in v1** (EPIC 01).
- **SEO**: public content must render server-side and be indexable without client JS. One H1 per page.
- **Performance**: excellent Core Web Vitals, mobile-first.
- **Abuse**: unlimited free generation must be protected against bots and mass enumeration without adding
  visible friction for legitimate users or inspectors.
- **Privacy**: the tracking layer (EPIC 02) collects only what attribution/own-analytics needs; first-party
  cookies/storage; cookie & privacy notices reflect it; RGPD/LOPDGDD applies (personal data of shippers,
  carriers, drivers in every document).

## License
- License: proprietary / UNLICENSED (D-003). Dependencies: permissive only.

## Installed base / upgrade
- Fresh v1. No installed base, no migration obligation yet.

## External dependencies (fixed versions)
_To be finalised in Phase 2 §technical plan._ Candidates: a Node LTS runtime; a server-side PDF generator
producing genuine text-based PDF/A-ish output (not headless-screenshot); a QR encoder; an S3-compatible
object store for PDFs; PostgreSQL for data + audit log. Fail-safe rule: if the PDF engine or object store is
unavailable, generation fails closed with a clear user error — never emits a non-compliant document.

## Internationalization & output language
- Multi-language? No for v1 (i18n-ready code, additive later).
- Base/output language of the built product: Spanish (recorded departure from English default — D-002; Spain-only regulatory product).
- Target output locales: es-ES.
- Mechanism: centralised string catalog (keys + es-ES values); no user-facing text hardcoded at the use site.
- Docs language: English (token economy — D-002).

## Accessibility (non-negotiable)
- Target platform: web / HTML.
- References loaded: `references/accessibility.md`, `references/anti-patterns.md`.
- Targeted level: WCAG 2.2 AA floor + AAA where feasible; EN 301 549 / EAA in scope (D-004).

## Project website intent
- The marketing landing + SEO cluster IS the public site, same codebase, own domain (domain TBD with user).
- No separate Phase 8 site is needed; the "site" is in scope as the secondary project type.

## Design needed?
- Yes. Phases 3–4 mandatory: landing, the DeCA creation flow, the document result screen, the dashboard/history,
  the public document URL page behaviour, SEO page templates.

## Design system / brand identity
- Status: **founding** — no existing brand system found; this project creates the canonical one.
- Canonical home: this project's `design-handoff/ SPEC/design-tokens.md` + `artifacts/styles/` + logo assets.
- Target surfaces: web/HTML only (landing, app, SEO pages, the generated PDF's visual layout, email).
- Founding interview: the user chose "assistant proposes, user reviews in Phase 3" (D-012). Direction: modern SaaS, sober, conversion- and legal-trust-oriented, mobile-first. Open items (exact colours, typeface + licensing, dark mode, iconography, vetoes, any existing Farvertrans brand elements) → `SPEC/open-questions.md` at Phase 3.

## Environment & test drivers (step 5a preflight)
- This session can run commands where the repo lives: **yes** (Windows 11, PowerShell + Git Bash, git + gh present).
- Environment restrictions found: none blocking. Platform is Windows — Playwright/Node tooling runs headless; no Apple/Windows-native UI surface in scope.
- `claude` on PATH: n/a — Chaining: off (D-009), no fan-out planned.
- Machines in play: single machine (user + repo + test runner).
- Present: git, gh (authenticated — issues readable). Node/PDF tooling: to be installed at the Phase 5 scaffold (or offered at Phase 2 §4d).
- Impossible on this machine: none (web-only project).
- Screen-stealing verdict: none — web/API/CLI all headless.

## Preliminary estimate (AI-time based)
- Recorded in `docs/estimate.md` (Estimate v1). Token ledger: `docs/token-ledger.md`.
- Client budget: **no** — internal Farvertrans product, no client to bill (D-005 batch; user confirmed). No `docs/budget.md`.
- Chaining: **off** (D-009). `docs/continuation-prompt.md` written every session; the user opens the next chat.
- Keel portability: **lock + embedded** (D-010). Assistant config: **full** + CI on `main` (D-010).

## Open questions for the user
_All Phase 1 questions resolved._ Deferred to Phase 3: the founding brand interview open items (exact colours, typeface licensing, dark mode, iconography, vetoes, existing Farvertrans brand elements) — `SPEC/open-questions.md`. Deferred to pre-launch: the real domain (placeholder `deca.farvertrans.es` — D-011).
