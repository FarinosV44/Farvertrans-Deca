# Estimate — Farvertrans DeCA

> Unit throughout: **AI working hours + vibe-coder (your) supervision hours.** NEVER human-team time.
> "Session wall-clock" = elapsed time of an AI working session, not developer effort.

## Estimate v1 — PRELIMINARY (Phase 1 close). Wide ranges. Recompute at Phase 2 close.

### Assumptions
- Scope = confrontation rows 1–23 (launch product + differentiators) + 10 core SEO pages. Rows 24–32 excluded.
- Stack picked in Phase 2; assumes a mainstream SSR framework + PostgreSQL + S3-compatible storage + a
  server-side text-PDF library that needs integration work but not authoring from scratch.
- One founding design pass (Phase 3–4), no design-system to reuse.
- Single developer supervising; automatic mode; chaining on.
- The compliance test suite (R-1…R-13) is built as part of Phase 5, not added later.

### AI working hours by phase
| Phase | Range (AI h) | Notes |
|---|---|---|
| 1 Discovery | 3–5 | mostly done |
| 2 Functional spec + technical plan | 5–9 | flows, AC, stack, code map, threat model, playground recipe |
| 3 Design handoff (founding) | 4–7 | brief + interview consolidation |
| 4 Faithful build audit + BUILD-SPEC | 4–7 | |
| 5 Development | 70–115 | compliance engine 20–30, creation flow 12–18, public URL + storage 8–12, history/versions 10–15, tracking 8–12, landing 10–16, SEO base + 10 pages 14–24, auth 6–10, abuse controls 6–10, accessibility passes, test points |
| 6 Documentation | 6–10 | API/architecture + end-user guide |
| 7 Release | 4–7 | gate, packaging, deploy runbook |
| **Total AI** | **~100–167 h** | across many sessions |

### Vibe-coder (your) supervision hours
| Segment | Range (your h) | What you do |
|---|---|---|
| Discovery decisions + brand interview | 2–3 | answering batches |
| Spec review + sign-off | 2–4 | reading flows/AC, deciding |
| Design review rounds | 3–6 | reacting to the design, divergence round |
| Real-world testing the AI cannot do | 6–12 | scanning a real QR with a phone, testing WhatsApp/email delivery on real devices, checking the PDF opens on inspectors' typical setups, domain/DNS/TLS, deploy credentials, hosting + object-store + DB provisioning |
| Legal check of the generated DeCA vs BOE | 2–4 | you or an adviser confirming a real generated document is accepted |
| Content review (landing + 10 SEO pages, Spanish) | 4–8 | reading copy, checking legal claims |
| Deploy + launch supervision | 2–4 | |
| **Total your time** | **~23–41 h** | |

### Contingency
+30% on the AI total (new stack integration, PDF-compliance edge cases, abuse-control tuning, deadline pressure).

### AI cost mode
- Subscription (Claude Code) → marginal token cost ≈ €0. Tracked in `docs/token-ledger.md`.
- If ever run on API pricing, recompute per `references/estimation-budget.md` with verified per-token rates.

### Calendar note (not an effort figure)
The 2026-10-05 mandate is ~4 weeks out. Launchable core (rows 1–14, 17–20, 22 + SEO technical base) is the
priority; the 10 SEO content pages and row 21/23 can land in the days after launch without blocking it.

## Estimate v2 — FIRM
_Produced at Phase 2 close._
