# Token Ledger — Farvertrans DeCA

> One row per working session. Measured where the environment exposes usage, else honestly estimated.
> Final reconciliation (total tokens by model, cost at verified prices, deviation vs estimate) at Phase 7.

| Date | Session / phase | Model | Tokens (approx) | Notes |
|---|---|---|---|---|
| 2026-09-03 | Phase 1 Discovery — setup, competitive scan, state files, scope | claude-sonnet-5 | ~0.3M | new project scaffolding + web scan + Phase 1 artifacts + skill embed |
| 2026-09-03 | Phase 2 Functional spec — spec, technical plan, threat model, flows, firm estimate, assistant config | claude-sonnet-5 | ~0.3M | F1–F18 + AC + T-1…T-15 + 7 flows + rules/agents |
| 2026-09-03 | Phase 5 — BUILD 05-09 (scaffold, landing, creator, PDF/QR/URL, signup+claim) | claude-sonnet-5 | ~1.3M | full landing→create→PDF→share→register flow; 31 unit + 32 e2e |

AI cost mode: subscription (Claude Code) — marginal cost ≈ €0.
| 2026-09-03 | Phase 5 — BUILD 10 (registered workspace: history, saved data, duplicate, autofill) | claude-sonnet-5 | ~0.4M | 36 unit + 37 e2e |
| 2026-09-03 | Phase 5 — BUILD 11 (ref+UTM attribution) + BUILD 12 (operator dashboard) | claude-sonnet-5 | ~0.5M | 43 unit + 43 e2e |
| 2026-09-03 | Phase 5 — BUILD 13 (sharing + corrections/versioning R-13 + abuse controls F16) | claude-sonnet-5 | ~0.6M | 47 unit + 48 e2e |
| 2026-09-03 | Phase 5 — BUILD 14 (SEO base + 10 core pages + "¿Estoy obligado?") | claude-sonnet-5 | ~0.5M | 47 unit + 53 e2e |
| 2026-09-03 | Phase 5 — BUILD 15 (launch gate: CSP+headers, cross-tenant tests, pre-commit, CI, Dockerfile, release runbook) + merge to main | claude-sonnet-5 | ~0.7M | 47 unit + 57 e2e; v1 release |
| 2026-09-04 | Phase 5 — Product V3 #29 recovery: fixed broken typecheck in an uncommitted WIP tree, found+fixed an idempotent-replay 429 bug, verified the full gate, committed + pushed + beat-1 comment | claude-sonnet-5 | ~0.25M | 79 unit + 95 e2e + 8 compliance green; D-029 |
| 2026-09-04 | Phase 5 — Product V3 #33: Admin V2 command center (shell + 11 screens + global search + `lib/admin/*` + 2 API routes) | claude-sonnet-5 | ~0.6M | 84 unit + 100 e2e + 8 compliance green; D-030 |
| 2026-09-04 | Phase 5 — Product V3 #30 (UI-only): premium auth card (AuthShell, Google button inert, password show/hide, restyled register-form) | claude-sonnet-5 | ~0.2M | 84 unit + 104 e2e + 8 compliance green; D-031 |
| 2026-09-04 | Phase 5 — Product V3 #31 (UX): creation-flow clarity — named progress, focus-first-invalid, sectioned review + Editar, generating status, microcopy | claude-sonnet-5 | ~0.2M | 84 unit + 108 e2e + 8 compliance green; D-032 |
| 2026-09-04 | Phase 5 — Product V3 #36 (PRODUCT): post-generation document cockpit — shared lib/deca/detail.ts, QR card, sectioned summary, version timeline, "what changed" diff | claude-sonnet-5 | ~0.4M | 88 unit + 110 e2e + 8 compliance green; D-033 |
| 2026-09-04 | Phase 5 — Product V3 #37 (TEAM): role change + resend + member status delta vs #27; #36 QR memoization refinement | claude-sonnet-5 | ~0.3M | 88 unit + 111 e2e + 8 compliance green; D-034 |
| 2026-09-04 | Phase 5 — Product V3 #35 (GROWTH): persona-led landing cards + 4 persona SEO pages + persona CTA events | claude-sonnet-5 | ~0.35M | unit + 114 e2e + 8 compliance green; D-035 |
| 2026-09-04 | Phase 5 — Product V3 #34 (PRODUCT): history CSV export + workflow status + integration boundary; logo→#39, PWA→#40; e2e workers capped at 3 locally | claude-sonnet-5 | ~0.35M | 94 unit + 117 e2e + 8 compliance green; D-036 |
| 2026-09-04 | Phase 5 — Product V3 #38 (AUTH, minus OAuth): safeInternalPath open-redirect guard + invalid-invite recovery state | claude-sonnet-5 | ~0.25M | 98 unit + 120 e2e + 8 compliance green; D-037 |
| 2026-09-04 | Phase 5 — Product V3 #32 (SEO): DB-backed Guides + Blog CMS — ContentItem model + /guias + /blog + admin editor + safe markdown renderer + seed content | claude-sonnet-5 | ~1.0M | 105 unit + 125 e2e + 8 compliance green; D-038 |
| 2026-09-04 | Product V3 — remove company attribution from every public surface (footer, auth card, PDF, SEO copy); D-039 | claude-sonnet-5 | ~0.1M | 105 unit + 125 e2e + 8 compliance green |
| 2026-09-04 | Post-V3 hardening: fixed the /blog + /guias production crash (defensive DB wrappers), the same unclassified-500 bug in DeCA generation, rebuilt /blog + /guias + footer, added 4 legal pages, nav audit | claude-sonnet-5 | ~0.6M | 105 unit + 129 e2e + 8 compliance green; D-041 |
