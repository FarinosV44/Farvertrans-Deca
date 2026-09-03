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
- Decision mode chosen by the user: _pending_.
- Table: see `docs/01a-confrontation.md` (kept separate for length).
- Scope impact: _pending user decisions_.
- Honest assessment revisited after the confrontation: _pending_.

## Scope
- v1: _pending confrontation decisions_.
- Later: _pending_.
- Never: _pending_.

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

- User decision: _pending_.

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
- Founding interview: _pending user answers (batched below)_.

## Environment & test drivers (step 5a preflight)
- This session can run commands where the repo lives: **yes** (Windows 11, PowerShell + Git Bash, git + gh present).
- Environment restrictions found: none blocking. Platform is Windows — Playwright/Node tooling runs headless; no Apple/Windows-native UI surface in scope.
- `claude` on PATH: _to verify if chaining is enabled_ — n/a so far (Chaining not yet set).
- Machines in play: single machine (user + repo + test runner).
- Present: git, gh (authenticated — issues readable). Node/PDF tooling: to be installed at the Phase 5 scaffold (or offered at Phase 2 §4d).
- Impossible on this machine: none (web-only project).
- Screen-stealing verdict: none — web/API/CLI all headless.

## Preliminary estimate (AI-time based)
- Recorded in `docs/estimate.md` (Estimate v1). Token ledger: `docs/token-ledger.md`.
- Client budget: **no** (internal product, no client to bill) — pending user confirmation in the batch.
- Chaining: _pending user answer_.

## Open questions for the user
1. Founding brand interview (logo, colours, typography, personality, references, dark mode, iconography, vetoes).
2. Domain for the site.
3. Confrontation decision mode + per-row scope decisions.
4. Client budget yes/no; chaining off/prefill/start; embed Keel skill in repo yes/no; assistant-config package.
5. Confirm the sequencing (EPIC 04+01+02 to launch, EPIC 03 core-then-longtail).
