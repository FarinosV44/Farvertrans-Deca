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

---

## Estimate v2 — FIRM (Phase 2 close). Unit: AI working hours + your supervision hours.

Scope now fixed by `docs/02-functional-spec.md` (F1–F18, AC-01…AC-37), `docs/03-technical-plan.md`
(Next.js + Supabase on Hostinger), `docs/threat-model.md` (T-1…T-15). Adversarial spec self-review done
(double-submit gap found and closed → AC-04b). No client budget (`Client budget: no`).

### AI working hours by phase (firm)
| Phase | AI h | Notes |
|---|---|---|
| 1 Discovery | 4 (actual) | done |
| 2 Functional spec + technical plan + threat model + flows + assistant config | 7 (actual ~6, +1 for assistant-config materialisation) | done at this commit |
| 3 Design handoff (founding brand + all screens in the design split) | 5–8 | brief + founding interview consolidation + open-questions |
| 4 Faithful build audit + BUILD-SPEC + guided external setup (Supabase, Hostinger, DNS, Resend, hCaptcha) | 5–9 | the external setup walkthrough is real work |
| 5 Development | 78–120 | see breakdown |
| 6 Documentation (API + architecture + security + a11y + README + guide/) | 7–11 | |
| 7 Release (compliance-suite gate, perf gate, packaging, deploy runbook) | 5–8 | |
| **Total AI** | **~111–162 h** | across ~15–22 sessions |

### Phase 5 breakdown (firm)
| Slice group | AI h |
|---|---|
| Scaffold (Next+TS, Prisma schema, Supabase wiring, keel-doctor/verify/close/hooks, playground, CI, seed) | 8–12 |
| DeCA engine `lib/deca` (validate R-2, assemble, version R-13, token, deactivation) — test-first | 12–18 |
| PDF `lib/pdf` (@react-pdf compliant layout, QR, metadata, size guard) + compliance suite R-1…R-13 | 12–18 |
| Creation flow F1 + result + duplicate F8 + saved entities F7 | 12–17 |
| Public URL `/d/[token]` F4 + storage adapter + 410 page | 5–8 |
| Auth F10 + anonymous claim F6 + attribution engine F12 (test-first) + acquisition table | 10–15 |
| Landing F11 + SEO base F15 (sitemap/robots/schema/meta) | 9–14 |
| Abuse controls F16 (limiter test-first + challenge) | 6–9 |
| Operator dashboard F13 + analytics F14 | 5–8 |
| Driver share F9 + email + printable copy | 3–5 |
| 10 SEO content pages F18 + "am I obligated?" F17 (post-launch subset) | 10–16 |
| a11y passes, read-back wiring, perf tuning, bug fixes | included above + ~5 |
| **Phase 5 total** | **~78–120 h** |

### Your (vibe-coder) supervision hours (firm)
| Segment | Your h |
|---|---|
| Spec/plan sign-off (this phase) | 2–3 |
| Design review rounds (founding brand — divergence round + screens) | 4–7 |
| External setup you must do (Supabase project + RLS, Hostinger VPS + Docker + reverse proxy + TLS, DNS, Resend domain verify, hCaptcha keys, GitHub secrets) | 5–9 |
| Real-device testing (phone QR scan of a generated PDF, WhatsApp/email delivery, PDF opens on typical inspector setups) | 5–9 |
| Legal check that a generated DeCA is inspection-valid + RGPD review of anonymous-doc retention (D-016) | 3–6 |
| Spanish content review (landing + 10 SEO pages + legal/FAQ copy) | 4–8 |
| Deploy + launch supervision + smoke test in prod | 2–4 |
| **Total your time** | **~25–46 h** |

### Contingency
+30% on the AI total → **~144–211 AI h** all-in. New-stack integration (Supabase Storage headers for R-7/R-8,
`@react-pdf` layout precision), abuse-control tuning, and deadline pressure justify it.

### AI cost mode
Subscription (Claude Code) → marginal token cost ≈ €0. `docs/token-ledger.md` tracks actuals; Phase 7 reconciles.

### Calendar note (not effort)
~4 weeks to 2026-10-05. Launch-first subset (F1–F8, F11–F16 core + SEO technical base) is the critical path;
F17, F18 and the operator dashboard (F13) can land in the days after launch without blocking it.
