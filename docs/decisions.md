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
