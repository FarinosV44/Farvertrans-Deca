# Decisions — Farvertrans DeCA

> Append-only. A session NEVER re-opens a decision recorded here on its own initiative;
> only the user reverses a decision (append the reversal as a new entry).

## D-001 — Project type: web app + marketing/SEO site
- Date / phase: 2026-09-03 / Phase 1
- Decision: Primary type = Web app (SPA/SSR + API backend + hosted service). Secondary = Website (marketing landing + programmatic SEO cluster). Security profiles loaded: `references/security/web-app.md` and `references/security/website.md`.
- Why: EPIC 04 needs authenticated document generation, storage, unique public URLs and an audit trail (an app); EPIC 01 and EPIC 03 need fast, indexable SSR/SSG public pages (a site). They share one codebase and one design system.
- Alternatives rejected: pure static site (cannot generate/store compliant documents); WordPress (heavier, worse fit for the document engine and tracking).

## D-002 — Product output language: Spanish only (v1); docs language: English
- Date / phase: 2026-09-03 / Phase 1
- Decision: The user-facing product ships in **Spanish only** for v1. Code is written i18n-ready (no hardcoded user-facing strings at the use site, strings centralised) so a second locale is additive, but no second locale is built now. All `docs/` artifacts, code comments, commit messages and internal prompts are in **English** (Keel token-economy default).
- Why: The product targets the Spanish national DeCA mandate exclusively; every SEO keyword, legal reference and user is Spanish. English base would add cost with zero v1 value. This is a deliberate, recorded departure from Keel's English-output default (SKILL.md permits it with a recorded reason).
- Alternatives rejected: English base + Spanish locale (pure overhead for a Spain-only regulatory product); multi-language v1 (no demand, delays launch before 2026-10-05).

## D-003 — License: proprietary / UNLICENSED
- Date / phase: 2026-09-03 / Phase 1
- Decision: Closed-source proprietary SaaS. `package.json` `"private": true`, `"license": "UNLICENSED"`, no LICENSE file granting rights. Third-party dependencies must be permissively licensed (MIT/BSD/Apache-2.0/ISC); copyleft (GPL/AGPL) runtime dependencies are not adopted without an explicit decision.
- Why: Commercial SaaS, not distributed as source. No marketplace GPL requirement applies.
- Alternatives rejected: open-source (no reason to; would expose the compliance engine and tracking logic).

## D-004 — Accessibility target: WCAG 2.2 AA + EAA
- Date / phase: 2026-09-03 / Phase 1
- Decision: WCAG 2.2 AA as the floor (AAA where feasible), EN 301 549 / European Accessibility Act in scope (EU digital service, applies since 2025-06-28). Target platform: web/HTML. Built accessible from the first slice.
- Why: Legal exposure in the EU market; the audience includes older drivers and small-operator staff on phones. Non-negotiable per SKILL.md.

## D-005 — Session setup: automatic, after-sprint issues, capture on, push notifications
- Date / phase: 2026-09-03 / Phase 1
- Decision: `Autonomy: automatic` — Keel commits and pushes to `develop` without asking; never merges to `main`, never tags, never releases without explicit instruction. Forge issue duty: review at every sprint close, sweep interval 24h. Issue capture: on — a defect the user reports becomes a GitHub issue before the fix starts. Notification channel: Claude Code PushNotification (delivers to terminal + phone via Remote Control) — recipient: the user.
- Why: User chose all recommended options in the session-start batch.

## D-006 — Durability: GitHub remote
- Date / phase: 2026-09-03 / Phase 1
- Decision: Work survives off this machine via `origin` = https://github.com/FarinosV44/Farvertrans-Deca.git. Integration branch `develop` created from `main`.
- Why: Repo already had a GitHub remote at session start. Satisfies SKILL.md "Work never lives only on this machine".

## D-007 — v1 scope: confrontation rows 1–23 in, 24–29 Later, 30–32 Never
- Date / phase: 2026-09-03 / Phase 1
- Decision: v1 = rows 1–23 of `docs/01a-confrontation.md`. Later = 24 (local SEO pages), 25 (long-tail/user-type SEO pages), 26 (multi-user/team), 27 (public API), 28 (bulk import), 29 (eCMR/CMR/ADR interop feature — SEO page now, feature later). Never in v1 = 30 (paid WhatsApp Business API), 31 (AI/LLM assistant), 32 (pricing/plans/checkout).
- Why: User chose "accept my recommendations" as the decision mode; recorded as default accepted. Rows 1–16 are the launch product, 17–23 are the differentiators that make it win, all cheap except row 19 (abuse controls, mandatory companion to unlimited-free row 17).
- Alternatives rejected: "add everything" (drags in local SEO thin-content risk, multi-user, API — none needed for capture, all delay launch); row-by-row (user delegated to the recommendation column).
- Not checked: whether Truckio/DecaHub free tiers are genuinely capped (search inconclusive) — does not change the decision, unlimited-free is our positioning regardless.

## D-008 — Build sequence: EPIC 04 + 01 + 02 to launch, SEO content after
- Date / phase: 2026-09-03 / Phase 1
- Decision: Compliance engine (EPIC 04) + landing (EPIC 01) + acquisition tracking (EPIC 02) + SEO technical base built to a launchable state before 2026-10-05. The 10 core SEO content pages (EPIC 03) land immediately after launch; local + long-tail pages post-launch. Launch is NOT gated on the full SEO architecture.
- Why: Organic SEO will not pay off before the mandate; the pre-mandate capture spike comes from operator links. The compliance engine is the hard part and must be solid. User confirmed.

## D-009 — Chaining: off
- Date / phase: 2026-09-03 / Phase 1
- Decision: `Chaining: off`. Every session writes `docs/continuation-prompt.md` and shows the prompt; the user opens the next chat. `Chaining model: n/a`. `start` was not available anyway (Windows; macOS-verified only).
- Why: User chose off — simple, no unattended development, no surprises.

## D-010 — Portability: embed skill; Assistant config: full + CI on main
- Date / phase: 2026-09-03 / Phase 1
- Decision: Embed the Keel skill in the repo (`.claude/skills/keel/` + `.agents/skills/keel/`). Assistant config package = full: path-scoped rules + reviewer/verifier subagents + permission allow-lists + `.githooks/pre-commit` confidential-data gate + CI workflow. `CI runs on: main` (push to main, version tags, PRs targeting main) — not every develop push, since Keel drives the full suite locally before each commit. Tools: claude (primary); AGENTS.md covers codex/copilot/cursor/windsurf.
- Why: User chose all recommended. Repo becomes self-sufficient in any environment.

## D-011 — Domain: placeholder until the user decides
- Date / phase: 2026-09-03 / Phase 1
- Decision: Use `deca.farvertrans.es` as a configurable placeholder for canonical URLs, sitemap, OG tags, the DeCA QR base URL and each document's public URL. A single config value; the user sets the real domain before launch. Public document URLs must be domain-portable (no hardcoded host).
- Why: User does not have the domain decided yet; it does not block development.

## D-012 — Brand: assistant founds the identity, user reviews in Phase 3
- Date / phase: 2026-09-03 / Phase 1
- Decision: No prior brand system. The assistant proposes the founding identity (palette, typography, logo, personality — direction: modern SaaS, sober, conversion- and legal-trust-oriented, mobile-first) and the user reacts to it on real design in Phase 3. Open interview items (exact colours, typeface licensing, dark mode, iconography, vetoes, whether Farvertrans has existing brand elements) go to `SPEC/open-questions.md` for Design/Phase 3.
- Why: User chose "you propose and show me in Phase 3".

## D-013 — Stack: Next.js + Supabase, hosted on Hostinger
- Date / phase: 2026-09-03 / Phase 2
- Decision: Next.js (App Router, SSR/SSG) on Node 20 LTS, TypeScript. Supabase for PostgreSQL, object storage (PDFs), and authentication (passwordless email OTP + optional password). ORM: Prisma against the Supabase Postgres (or Supabase client where RLS is the better fit — decided per module in the technical plan). PDF: `@react-pdf/renderer` (genuine text-based PDF from React components, embedded fonts, small output — NOT headless-browser screenshot). QR: `qrcode`. Rate limiting / abuse: Postgres-backed limiter + a hashed IP/fingerprint counter (Upstash Redis optional later). Hosting: Hostinger VPS running the Next.js server via Docker (Node SSR needs a running process; Hostinger shared/cloud web hosting is not sufficient). Email: a transactional provider (Resend / Postmark — pinned in Phase 5).
- Why: User chose "Hostinger y Supabase". Supabase collapses Postgres + storage + auth + RLS into one managed service, which fits the deadline and a solo maintainer. Next.js gives SSR/SSG for the SEO requirement (EPIC 01/03) in one codebase with the app.
- Alternatives rejected: Vercel + Neon (user prefers Hostinger/Supabase); VPS + self-hosted Postgres/MinIO (more ops burden, no benefit here); WordPress (poor fit for the document engine).
- Not checked: whether Hostinger's specific VPS tier limits (RAM, bandwidth) suffice at peak capture volume — to size in Phase 5 with the user; does not change the architecture.

## D-014 — Test-first policy: pure-logic
- Date / phase: 2026-09-03 / Phase 2 §4e
- Decision: `Test-first policy: pure-logic`. Pure functions of their inputs — DeCA data validation against R-2, public URL/token generation, 7-day deactivation logic, version/correction rules (R-13), abuse-limit calculations, attribution first-touch/last-touch rules (EPIC 02) — get their test written and seen failing before the implementation. Markup, framework glue and third-party integration are exempt. Two rules hold regardless: every bug fix starts from a failing reproduction test; a test derived from an AC-nn or a reproduced bug is never edited to pass.
- Why: User chose the recommended default. The compliance engine and the attribution engine are logic-dense — exactly where test-first pays.

## D-015 — No quality rubric for this project
- Date / phase: 2026-09-03 / Phase 2 §6a
- Decision: No `docs/rubrics/` domain. The adversarial spec review uses the standard mechanical checklist only.
- Why: User chose "no for this project" — it is a web app, not an extensible library/plugin/MCP whose extension surface locks on release.

## D-016 — Anonymous DeCA: valid document + 30-day claim link
- Date / phase: 2026-09-03 / Phase 2
- Decision: A DeCA created without an account is generated complete, legally valid, and retained 1 year (R-10) like any other. The creator receives a claim link (high-entropy token, valid 30 days) to attach the document to a new or existing account. Unclaimed after 30 days: the document remains valid and retained (legal obligation) but becomes unrecoverable by the creator through the UI (no account link). Anonymous creation is rate-limited per hashed IP + browser fingerprint (abuse control, confrontation row 19). Registering unlocks history, saved data (companies/vehicles/addresses), duplication and corrections.
- Why: User chose the recommended option — preserves the zero-friction differentiator vs DecaDoc while keeping legal validity and bounding abuse.
- Not checked: the RGPD retention basis for orphaned anonymous documents containing third-party personal data (shipper/carrier/driver) — to confirm with a data-protection review before launch; recorded as a pre-launch open item.

## D-017 — Assistant subagent model binding
- Date / phase: 2026-09-03 / Phase 2 close
- Decision: Role→model map (Claude Code): orchestrator = the session model the user launches with (Keel does not set it); reviewer = `sonnet` (`code-reviewer`, `security-auditor`, `design-fidelity-auditor`); mechanical = `haiku` (`docs-verifier`, `playground-qa`, `a11y-auditor`, `test-driver`, `launch-verifier`). Applied as the tool default without interrogating the user (recommend-don't-interrogate).
- Why: On a flat Claude Code subscription the marginal token cost is ≈ €0, so cheaper models buy speed and rate-limit headroom, not money — `test-driver` is the most repeated Phase 5 invocation and benefits most. Reviewers need real judgment; `sonnet` handles it.
- Materialised in: `.claude/agents/*.md` `model:` fields; project card `Models:` line.

## D-018 — Assistant config rules + agents materialised (Phase 2 close)
- Date / phase: 2026-09-03 / Phase 2 close
- Decision: `.claude/rules/` (code-style, security, docs-discipline — path-scoped to `app/**`, `lib/**`, `prisma/**`, `content/**`) and `.claude/agents/` (code-reviewer, security-auditor, docs-verifier, design-fidelity-auditor, playground-qa, a11y-auditor, test-driver, launch-verifier) generated. `guide-qa` deferred to Phase 6 (guide decision not yet made). Permission allow-list (`.claude/settings.json`), `.githooks/pre-commit` gate, and CI workflow deferred to the Phase 5 scaffold (their sources — verified tooling commands — do not exist yet).
- Why: Sources (§Conventions, threat model, code map globs) are fixed at Phase 2 close per `references/assistant-config.md`.

## D-019 — Implementation-first acceleration after Phase 2 (execution mode)
- Date / phase: 2026-09-03 / entering build
- Decision: The user explicitly prioritised a working product over further speculative documentation ("I want execution, not more discovery or speculative documentation"). The formal Keel Phase 3 (design-tool handoff) and Phase 4 (faithful-build audit) are folded into a single lean `docs/design/IMPLEMENTATION-BRIEF.md` — screen list + primary journey + concrete design tokens, type scale and component conventions the build follows directly. No external design-tool round-trip for v1. Work proceeds in vertical executable slices on the BUILD backlog (#5→#15) on `develop`; each issue ends with browser-verifiable functionality + tests. Discovery is not expanded unless implementation evidence reveals a genuine gap.
- Why: Discovery, confrontation, functional spec, technical plan and threat model already exist; the acquisition window before 2026-10-05 rewards shipping.
- Guardrail: D-001…D-018, regulatory R-1…R-13 and EPICs #1–#4 remain binding — an execution-sequencing change, not permission to bypass compliance or quality gates.
- Scope guard (user-stated): NO ERP, TMS, invoicing, fleet tracking, Stripe, pricing, checkout, sales/lead forms, or unrelated logistics features. Signup is never required before the first DeCA (D-016 reinforced).
- Alternatives rejected: full Phase 3 design-tool handoff (too slow for the deadline; the user vetoed it).

## D-020 — Pinned stack versions at BUILD 05; postcss advisory accepted (tracked)
- Date / phase: 2026-09-03 / BUILD 05
- Decision: Next 15.5.25, React 19.0.0, Tailwind 4.3.3 (`@tailwindcss/postcss` aligned to 4.3.3 — 4.0.0 threw "Missing field `negated` on ScannerOptions.sources"), Prisma 6.1.0, @react-pdf/renderer 4.1.6, @supabase/ssr 0.5.2, Playwright 1.55.1, Vitest 3.2.7 (bumped from 2.1.8 to clear a critical RCE advisory in the vitest/vite/esbuild dev chain), zod 3.24.1.
- `npm audit` residual after this work: 0 critical, 1 high (`postcss <=8.5.22`, reached only through Next's own bundled build toolchain — a build-time source-map path-traversal class, not a runtime exposure of the deployed app). Fix requires Next 16 (semver-major). **Accepted as a tracked risk** for now; revisit with a deliberate Next 16 upgrade after launch. 3 moderate + 4 low are all dev-only toolchain.
- This environment's npm blocks package install scripts by default (`allowScripts`); prisma/@prisma/*, esbuild, sharp, unrs-resolver are explicitly approved in `package.json` `allowScripts`.
- Why: get a green, runnable scaffold under the 2026-10-05 deadline without a major-version upgrade mid-build.
- Not checked: whether a later dependency (e.g. `@react-pdf` fonts, hCaptcha SDK) forces a version change — treated as normal maintenance.
