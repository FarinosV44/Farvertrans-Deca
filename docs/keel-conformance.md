# Keel conformance sweep — Farvertrans DeCA

> Derived from `MANIFEST.md` Table 1 at Keel v5.19.2. One row per applicable requirement.
> State: present / missing (phase named) / declined (+ D-entry) / n/a (+ condition).
> Position: Phase 1 Discovery, in progress.

| # | Requirement | Required from | State |
|---|---|---|---|
| 1 | `docs/PROGRESS.md` | P1 s0a | present |
| 2 | `docs/decisions.md` | P1 s0a | present |
| 3 | `docs/lessons-learned.md` | P1 s0a | present |
| 4 | Off-machine durability record | P1 s0a | present — `Durability:` = git remote origin (D-006) |
| 5 | Clean working tree at block close | P1 s0a | present — committing this batch; `develop` created from `main` |
| 6 | `CLAUDE.md` + `AGENTS.md` portability lock (v5.19.2 stamp) | P1 s0a | present |
| 7 | `GEMINI.md` / `.gemini` context pick | P1 s0a | n/a — condition: "only if the user works with Gemini CLI" (not indicated) |
| 8 | `.claude/skills/keel/` + `.agents/skills/keel/` embedded copy | P1 s0a | missing — pending user answer in discovery batch (embed question) |
| 9 | `docs/00-competitive-landscape.md` | P1 s0 | present |
| 10 | `docs/01-discovery.md` incl. `## Environment & test drivers` | P1 | present (verdict recorded; user decision pending — closes with the batch) |
| 11 | `docs/estimate.md` | P1 close | present (v1 preliminary) |
| 12 | `docs/token-ledger.md` | P1 close | present |
| 13 | `docs/keel-conformance.md` | P1 s0a | present (this file) |
| 14 | `docs/02-functional-spec.md` (AC-nn IDs) | P2 | missing — Phase 2 |
| 15 | `docs/03-technical-plan.md` (code map, change map, `## Environment requirements`) | P2 | missing — Phase 2 |
| 16 | `docs/threat-model.md` | P2 | missing — Phase 2 |
| 17 | `docs/flows/` | P2 | missing — Phase 2 |
| 18 | `docs/budget.md` | P2 close | n/a expected — condition: "only if `Client budget: yes`" (expected no; confirm in batch) |
| 19 | `docs/spec-references/` | P2 | n/a — condition: "only if the spec records any" |
| 20 | `docs/rubrics/` | P2 | n/a — condition: "only if a rubric domain was accepted" |
| 21 | `docs/design/references/` | P2 | n/a unless the user holds visual references |
| 22 | Assistant rules containers | P2 close | missing — pending assistant-config answer in batch |
| 23 | Assistant subagents | P2 close | missing — pending assistant-config answer in batch |
| 24 | `docs/design/DESIGN-BRIEF.md` | P3 | missing — Phase 3 (UI project) |
| 25 | `docs/design/design-handoff/` | P4 | missing — Phase 4 |
| 26 | `docs/BUILD-SPEC.md` | P4 | missing — Phase 4 |
| 27 | `docs/design/design-requests/` | P4 | n/a — condition: "when the first Design Request appears" |
| 28 | `.gitignore` + `.gitattributes` | P5 scaffold | partial — `.gitignore` present with mandated entries; `.gitattributes` at Phase 5/7 |
| 29 | `docs/sprints/` | P5 | missing — Phase 5 |
| 30 | `docs/sprints/deferred.md` | P5 | missing — Phase 5 |
| 31 | `docs/.keel/plan.json` | P5 | missing — Phase 5 |
| 32 | `docs/05-test-points.md` | P5 | missing — Phase 5 |
| 33 | `docs/api/INDEX.md` | P5 first slice | missing — Phase 5 |
| 34 | `docs/playground.md` | P5 scaffold | missing — Phase 5 (project can be run) |
| 35 | `scripts/keel-verify` | P5 scaffold | missing — Phase 5 |
| 36 | `scripts/keel-doctor` | P5 scaffold | missing — Phase 5 |
| 37 | build/minify script | P5 scaffold | missing — Phase 5 (ships front-end JS/CSS) |
| 38 | `scripts/keel-handoff-verify` | P5 scaffold | missing — Phase 5 |
| 39 | Single-lane lock | P5 scaffold | n/a unless `Chaining: start` (pending) |
| 40 | `scripts/keel-continue` | P5 scaffold | n/a unless chaining not off/supervised (pending) |
| 41 | `scripts/keel-close` | P5 scaffold | missing — Phase 5 |
| 42 | `.githooks/post-commit` + `core.hooksPath` | P5 scaffold | missing — Phase 5 |
| 43 | `scripts/keel-stop-hook` + Stop hook | P5 scaffold | missing — Phase 5 |
| 44 | `scripts/keel-session-pid.sh` | P5 scaffold | missing — Phase 5 |
| 45 | `scripts/keel-chain-check` | P5 scaffold | n/a unless chaining not off/supervised (pending) |
| 46 | `Chaining model:` card line | P1 s0a | pending — set with the chaining answer in the batch |
| 47 | `Chain verified:` card line | P5 scaffold | n/a unless chaining not off/supervised (pending) |
| 48 | `.githooks/pre-commit` confidential gate | P5 scaffold | missing/pending — condition: "only if assistant-config accepted" |
| 49 | Permission allow-lists per tool | P5 scaffold | n/a unless assistant-config accepted (pending) |
| 50 | CI workflow | P5 scaffold | pending — condition: assistant-config accepted + forge has CI (GitHub has CI) |
| 51 | MCP registration | P5 scaffold | n/a — condition: "only if the technical plan defines dev MCP servers" |
| 52 | `docs/architecture.md` | P6 | missing — Phase 6 |
| 53 | `docs/api/`, `docs/usage/`, `docs/reference/` | P6 | missing — Phase 6 |
| 54 | `docs/security.md` | P6 | missing — Phase 6 |
| 55 | `docs/accessibility.md` | P6 | missing — Phase 6 |
| 56 | `README.md` | P6 | missing — Phase 6 |
| 57 | `guide/` end-user HTML guide | P6 | missing — Phase 6 (unless declined) |
| 58 | `guide/_theme/` + brand layer | P6 | missing — Phase 6 |
| 59 | `docs/07-release.md` | P7 | missing — Phase 7 |
| 60 | Phase 8 site set | P8 | n/a — condition: site is in the main codebase, no separate Phase 8 (see D-001 / discovery) |
| 61 | `docs/.keel/e2e-status.json` + history | P5+ | n/a — condition: "only if the project card carries an `E2E:` line" (E2E: absent) |
| 62 | `docs/.keel/slices/<n>.json` | P5 kickoff | n/a — condition: "only if the project fans work out over git worktrees" |
| 63 | `docs/issues.md` | first forge contact | missing — create at Phase 1 close (issues #1–#4 are the source EPICs; capture is on) |
| 64 | `docs/old/` | first sprint close | n/a — condition: "when archiving starts" |
| 65 | `docs/04-adoption-audit.md` | adoption | n/a — condition: "adopted projects only" (this is greenfield) |

## Phase 1 close update (2026-09-03)
- Row 8 (embedded skill): **present** — `.claude/skills/keel/` + `.agents/skills/keel/`, 41 files each, verified identical to source (D-010).
- Row 13 (keel-conformance.md): present (this file).
- Row 18 (budget.md): **n/a** — `Client budget: no` confirmed (D-005 batch).
- Rows 22–23 (assistant rules + subagents): **missing — Phase 2 close** (full package accepted, D-010).
- Rows 39/40/45/47 (chaining scripts + Chain verified): **n/a** — `Chaining: off` (D-009).
- Row 46 (Chaining model card line): **n/a** — `Chaining: off`.
- Row 48 (pre-commit gate): **missing — Phase 5 scaffold** (assistant-config full accepted).
- Row 49 (permission allow-lists): **missing — Phase 5 scaffold**.
- Row 50 (CI workflow): **missing — Phase 5 scaffold** — `CI runs on: main` (D-010); GitHub has CI.
- Row 60 (Phase 8 site set): **n/a** — site is in the main codebase (D-001), Website intent recorded, no separate Phase 8.
- Row 63 (issues.md): **present** — inventory of #1–#4 + one entry each.
- All other Phase 1 rows: present. Phase 2+ rows remain missing with their phase named.
