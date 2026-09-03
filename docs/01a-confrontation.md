# Competitive confrontation — v1 scope decisions

> Every functionality from the unified feature list + the external-demand list, side by side with the
> proposed v1. Cost = **AI working hours + your supervision hours** (never human-team time); rough, for
> relative magnitude. Decision column filled after the user chooses.

## A. Table-stakes (category baseline — proposed IN v1)

| # | Functionality | Who has it | Demand evidence | Proposed | Est. cost (AI h + your h) | Recommendation | DECISION |
|---|---|---|---|---|---|---|---|
| 1 | 3-step guided DeCA creation (shipper/carrier → origin/destination → plate/goods/weight → generate) | DecaDoc, DeCAtrans, DCDT | 3 of 3 tools | v1 | 6–10 + 1–2 | include — this is the product | |
| 2 | Native compliant PDF (structured data → text PDF, ≤5 MB, metadata R-3/R-4/R-11) | all (forced) | regulatory R-3/R-4 | v1 | 8–14 + 2–3 | include — non-negotiable, hardest part | |
| 3 | QR in PDF → unique HTTPS no-auth URL, direct download (R-5…R-8) | all (forced) | regulatory | v1 | 5–9 + 1–2 | include — non-negotiable | |
| 4 | Public document URL: direct PDF download, no login, no interstitial, resists enumeration, 7-day post-service deactivation option (R-8/R-9) | all (forced) | regulatory | v1 | 4–7 + 1 | include — non-negotiable | |
| 5 | Document history / archive, ≥ 12 months, retrievable (R-10) | DecaDoc 12m, DCDT 24m | regulatory + 2 tools | v1 | 3–5 + 1 | include | |
| 6 | Traceable versions on correction — new version keeps prior, records reason/date/time, delivers current to driver (R-13) | DecaDoc, DCDT | regulatory R-13 | v1 | 5–8 + 1–2 | include | |
| 7 | Saved frequent data: companies, vehicles, addresses (autofill) | DecaDoc | 1 tool; core to "rápido" promise | v1 | 4–6 + 1 | include — the reuse promise in EPIC 01 | |
| 8 | Duplicate a previous DeCA into a new one | DecaDoc, Truckio (rep.) | 2 tools; core to "rápido" | v1 | 2–3 + 0.5 | include | |
| 9 | Share with driver by link | DecaDoc, DeCAtrans, DCDT | 3 tools + regulatory R-12 | v1 | 2–3 + 0.5 | include | |
| 10 | Account + auth (email, passwordless or password), company profile | all | needed for history/retention | v1 | 5–8 + 1–2 | include | |
| 11 | Mobile-first responsive, no install, works en route & at inspection | all | 3 tools + regulatory | v1 | included in design/build | include | |
| 12 | Landing (EPIC 01): hero, live demo, 3 benefits, how-it-works, legal/trust block, FAQ, final CTA | DeCAtrans (partial) | EPIC 01 | v1 | 8–14 + 2–3 | include | |
| 13 | Acquisition tracking (EPIC 02): `?ref=` + full UTMs, first-touch + last-touch, persisted to user/company, operators table, DB-queryable | none DeCA-specific | EPIC 02 (time-sensitive) | v1 | 6–10 + 1–2 | include — cheap, dated, strategic | |
| 14 | Analytics events (landing_view, click_crear_deca, signup_started/completed, deca_started/generated) | — | EPIC 01/02 | v1 | 2–4 + 0.5 | include | |
| 15 | SEO technical base: SSR, one H1, titles/meta/canonical/OG, sitemap.xml, robots.txt, schema.org (SoftwareApplication + FAQPage), clean URLs, no PDF indexing | partial (DeCAtrans) | EPIC 01/03 | v1 | 3–5 + 0.5 | include | |
| 16 | SEO core pages (EPIC 03): ~10 priority intent pages, each ending in CREAR DECA GRATIS, internal linking, E-E-A-T/BOE citations, last-reviewed date | CETM/Develoop (info only) | EPIC 03 | v1-core | 10–18 + 3–5 | include the 10 core pages; long tail later | |

## B. Differentiators / extras (proposed status varies — DECIDE)

| # | Functionality | Who has it | Demand evidence | Proposed | Est. cost (AI h + your h) | Recommendation | DECISION |
|---|---|---|---|---|---|---|---|
| 17 | Truly **unlimited** free generation (no monthly cap) | none (all cap or charge) | low confidence; EPIC 01 thesis | v1 | 0 extra (it's a policy) + abuse controls in #19 | include — it's the positioning; costs nothing but #19 | |
| 18 | **First DeCA with zero signup** (create, then optionally save by registering) | DecaDoc partial (20/mo) | medium | v1 | 4–7 + 1 | include — biggest friction cut vs competitors; needs anti-abuse | |
| 19 | Abuse controls: rate limiting, bot mitigation, URL-enumeration protection, per-IP/soft limits — invisible to legitimate users & inspectors | — (DCDT/DecaDoc rely on caps/payment) | required by "unlimited free" | v1 | 5–9 + 1–2 | include — mandatory companion to #17/#18 | |
| 20 | Driver delivery by **WhatsApp** (deep link) + **email**, included free | DCDT (paid add-on), Truckio (rep.) | medium | v1 (WhatsApp deep link + email) | 2–4 + 0.5 | include the free deep-link/email form; skip paid WhatsApp Business API | |
| 21 | "Am I obligated?" interactive guidance fused into the tool / a page | none (info pages only) | medium | v1 (simple guided page) | 2–4 + 0.5 | include as one guided page in the SEO cluster | |
| 22 | Printable driver copy (A4, QR prominent) | implied by all | regulatory R-12 | v1 | 1–2 + 0.5 | include — trivial, regulatory | |
| 23 | Internal operator dashboard (EPIC 02 panel): per-operator visits/signups/companies/first-DeCA/total-DeCA/active-companies, conversions | none | EPIC 02 ("mínimo desde V1 si es sencillo") | v1-lite | 4–7 + 1 | include a read-only internal table; defer charts/cohorts | |
| 24 | Local SEO pages (/deca-en-valencia, …) | — | EPIC 03 (only if differentiated) | Later | 6–12 + 2–4 for a real version | defer — thin-content risk, no pre-mandate payoff | |
| 25 | SEO long-tail / user-type pages beyond the 10 core (autónomos, agencias, cargadores, operadores…) | — | EPIC 03 | Later | 8–15 + 3–5 | defer — post-launch | |
| 26 | Multi-user / team accounts | DecaDoc (paid), DCDT | 2 tools | Later | 5–9 + 1–2 | defer — not needed for capture; add when monetising | |
| 27 | Public REST API | DecaDoc (paid) | 1 tool | Later | 8–14 + 2–3 | defer — power-user feature, post-capture | |
| 28 | Bulk import / CSV / templates beyond saved data | DecaDoc (paid) | 1 tool | Later | 5–10 + 1–2 | defer | |
| 29 | eCMR / CMR interop, ADR fields, DeCA-vs-CMR handling | bluecmr, others | EPIC 03 topic list | Later (content page now, feature later) | feature 10–20 + 3–5 | defer the feature; cover as an SEO page now | |
| 30 | Paid WhatsApp Business API delivery | DCDT | 1 tool | Never (v1) | — | drop for v1 — contradicts "gratis, sin coste"; deep link covers it | |
| 31 | AI/LLM assistant (FAQ bot, data extraction) | — | none | Never (v1) | — | drop — forced filler, legal-accuracy risk on a defined document | |
| 32 | Pricing page / plans / checkout | DeCAtrans, Surtia, DecaDoc | — | Never (v1) | — | drop — explicitly forbidden by EPIC 01 | |

## DECISIONS (recorded 2026-09-03 — D-007; mode: "accept recommendations", default accepted)
- **v1:** rows 1–23 (all recommendations followed).
- **Later:** row 24 (local SEO), 25 (long-tail/user-type SEO), 26 (multi-user), 27 (public API), 28 (bulk import), 29 (eCMR feature — SEO page now).
- **Never (v1):** row 30 (paid WhatsApp API), 31 (AI assistant), 32 (pricing/checkout).
- **Launch subset (D-008):** rows 1–14, 17–20, 22 + SEO technical base (#15). Rows 16, 21, 23 land right after launch.

## Notes
- Rows 1–16 are the launch product; removing any of 1–11 breaks compliance or the core promise.
- Rows 17–23 are what makes the product win rather than merely exist; all are cheap except #19 (which is mandatory if #17 stays).
- Rows 24–29 are real "Later" — visible, not lost.
- Rows 30–32 are recorded "Never (v1)" so they are not re-proposed.
