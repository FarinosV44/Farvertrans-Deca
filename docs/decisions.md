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
