# Functional Spec — Farvertrans DeCA

Scope: v1 = confrontation rows 1–23 (D-007). Launch-first subset (D-008): F1–F8, F11–F14, F16. Regulatory
requirements R-1…R-13 in `docs/00-competitive-landscape.md` are binding on F2/F3/F4.

## Functional requirements

### F1 — 3-step guided DeCA creation
- **Inputs:** step 1 contractual shipper (name/razón social, NIF, address) + effective carrier (name/razón social, NIF); step 2 origin, destination, date of transport; step 3 goods nature, weight (or alternative measure), vehicle plate(s) (tractor + trailer if articulated). Optional: reference/notes.
- **Processing:** each step validated on advance (`zod` + R-2 completeness). Autofill offered from saved entities (F7) for authed users. On final "Generar": assemble (F2) → render PDF (F3) → persist → store.
- **Outputs:** a DeCA record + version 1 + a stored PDF + the public URL + QR; redirect to the document detail (authed) or the result page with the claim link (anonymous, F6).
- **Preconditions:** none for anonymous (subject to F16 limits); authed users always allowed.
- **Postconditions:** `deca` + `deca_version` rows exist; PDF in the private bucket; creation timestamp recorded (R-11); analytics `deca_generated` emitted.
- **Errors:** invalid/incomplete step → inline field errors, cannot advance. Weight non-numeric and no alternative measure given → error. Generation failure (render/storage) → fail closed, no document, Spanish error, `deca_started` not counted as generated, nothing persisted as valid. **Double submit** — the "Generar" button disables on click and the request carries an idempotency key; a repeated submit within the window returns the same document, never a duplicate.

### F2 — DeCA data model & compliance validation (R-2)
- **Inputs:** the assembled DeCA payload.
- **Processing:** `lib/deca/validate.ts` asserts every Art. 6 FOM/2861/2012 field present and well-formed; NIF format check (warn, not block, on unusual formats — inspectors accept foreign operators); plate format normalised.
- **Outputs:** a validated immutable DeCA value object, or a `DecaValidationError` listing missing/invalid fields.
- **Pre/Post:** pre — payload parsed by zod. Post — a valid object is the only thing that can proceed to F3.
- **Errors:** any missing mandatory field blocks generation.

### F3 — Native compliant PDF (R-3, R-4, R-5, R-11)
- **Inputs:** validated DeCA object + its public URL + version metadata.
- **Processing:** `@react-pdf/renderer` composes a text-based A4 PDF (all fields as selectable text), embeds a subset font, embeds the QR (R-5) encoding the public URL, writes PDF metadata: title, creation date/time, last-modification date/time, producer = app+version (R-11). Asserts output ≤ 5 MB (R-4); target < 300 KB.
- **Outputs:** a PDF byte buffer.
- **Pre/Post:** pre — F2 passed. Post — buffer is native (text extractable, not a single rasterised image) and ≤ 5 MB.
- **Errors:** render throws → fail closed. Size > 5 MB (should never happen) → hard error, no document.

### F4 — Public document URL & direct download (R-6, R-7, R-8, R-9)
- **Inputs:** a request to `GET /d/[token]` where `token` is a ≥ 128-bit URL-safe random string unique to the document version.
- **Processing:** look up the document version by token; if within the availability window (service ongoing, or ≤ 7 natural days after service end — R-9) stream the PDF from storage with `Content-Type: application/pdf`, `Content-Disposition: inline; filename="DeCA-<ref>.pdf"`, `X-Robots-Tag: noindex`, cache headers allowing inspector re-fetch; record a minimal access log row (hashed IP, timestamp, document id — R-11). No auth, no cookie, no HTML interstitial, no button (R-7, R-8).
- **Outputs:** the PDF, HTTP 200. Deactivated/expired → HTTP 410 with a short plain page explaining the document is no longer available and how the owner can re-share (still no auth). Unknown token → HTTP 404, generic.
- **Pre/Post:** pre — HTTPS enforced in prod (redirect/UPGRADE; HSTS). Post — the response body is exactly the stored PDF bytes.
- **Errors:** storage read fails → 503, retryable, logged; never a partial body.

### F5 — Corrections & versioning (R-13)
- **Inputs:** an authed owner edits a DeCA; a change reason (free text, required for a new version).
- **Processing:** substantive change → create `deca_version` n+1 with a **new token/URL/QR and a new PDF**; keep version n intact and retrievable; record reason + timestamp (R-11). The current version is the one delivered to the driver (F9). Non-substantive typo fixes before first share may update in place (configurable; default = always new version for a clean audit — D per the issue's recommended option).
- **Outputs:** the new current version; the document detail shows the full version list.
- **Pre/Post:** pre — caller owns the document. Post — no prior version deleted; `deca.current_version` points to n+1.
- **Errors:** non-owner → 403. Missing reason → 422.

### F6 — Anonymous creation + 30-day claim (D-016)
- **Inputs:** an anonymous "Generar"; later, `POST /api/claim/[token]` with a session (new signup or existing login).
- **Processing:** the DeCA is created fully valid and retained 1 year. A `claim_token` (≥128-bit, 30-day TTL) is issued and shown + emailable. Claiming attaches the document (and its versions) to the account and voids the claim token.
- **Outputs:** the result page with: download, QR, driver-share, "Guarda este documento — crea una cuenta" with the claim link.
- **Pre/Post:** pre — F16 limits not exceeded. Post — document exists ownerless; claim token valid 30 days.
- **Errors:** expired/used claim token → clear message, document stays valid but unlinkable via UI; limit exceeded → challenge (F16).

### F7 — Saved entities (companies, vehicles, addresses)
- **Inputs:** authed user saves/edits/deletes a company, vehicle or address; or opts to save one used in F1.
- **Processing:** CRUD scoped to the user's account; autofill suggestions in F1 by prefix match.
- **Outputs:** the saved list; faster F1.
- **Pre/Post:** pre — authed. Post — entities reusable; deleting one never alters DeCA already generated.
- **Errors:** duplicate (same NIF/plate) → offered as "update existing?".

### F8 — Duplicate a DeCA
- **Inputs:** authed user picks "Duplicar" on an existing DeCA.
- **Processing:** pre-fills F1 with that document's data, date reset to today, as a brand-new DeCA (new id/token on generate).
- **Outputs:** the F1 flow pre-filled.
- **Errors:** source not owned → 403.

### F9 — Driver sharing (link, WhatsApp deep link, email, printable copy) (R-12)
- **Inputs:** a document + a share channel choice.
- **Processing:** link = the public URL. WhatsApp = `https://wa.me/?text=<encoded message + URL>`. Email = `POST /api/share` sends a templated message with the URL (rate-limited). Printable = a print-optimised A4 view with the QR prominent.
- **Outputs:** the share action; `deca_shared` event.
- **Pre/Post:** pre — document exists and is within availability. Post — nothing about the document changes.
- **Errors:** email send fails → user told, link still copyable.

### F10 — Account & auth
- **Inputs:** email (OTP) or email+password; company name on first signup.
- **Processing:** Supabase Auth; on signup, capture the persisted attribution (F12) onto the new `user`/`company` row (first-touch + last-touch). SSR session cookies.
- **Outputs:** an authed session; a `company` record.
- **Pre/Post:** post — `acquisition` row written once, first-touch never overwritten thereafter (AC-20).
- **Errors:** OTP wrong/expired → retry; rate-limited.

### F11 — Landing (EPIC 01)
- **Inputs:** a GET to `/` (optionally with `ref`/UTM query).
- **Processing:** SSR render: hero (H1 "DeCA GRATIS", subhead, CTA "CREAR DECA GRATIS" → F1, microcopy "Sin tarjeta · Sin límite · Gratis al menos hasta el 31/12/2026"), an inline visual of the real form/result, 3 benefits, 3-step how-it-works, legal/trust block with BOE link, FAQ (visible), final CTA. Persistent non-intrusive mobile CTA. No pricing, no "solicitar información", no demo, no popups. Capture `ref`/UTM into first-party storage (F12). Emit `landing_view`.
- **Outputs:** the page; CTA clicks emit `click_crear_deca`.
- **Pre/Post:** the primary CTA links to the creation flow, never to contact.
- **Errors:** JS disabled → content and CTA still work (SSR).

### F12 — Acquisition attribution (EPIC 02)
- **Inputs:** any page load with `?ref=<code>` and/or `utm_*`; the referrer.
- **Processing:** `lib/attribution/parse.ts` extracts `ref` + all five UTMs; `merge.ts` applies: first-touch stored once and never overwritten; last-touch updated on each new qualifying visit before signup; no `ref` and no UTM → attribution = organic/direct from referrer. Persist to a first-party cookie + `localStorage` + server session. On signup/company creation, copy into the `acquisition` table.
- **Outputs:** an `acquisition` row per user/company with first/last `ref_code`, first/last UTMs, first landing URL, `first_seen_at`, `signup_at`, `first_deca_at`.
- **Pre/Post:** the user never sees or types operator names (AC-18). Attribution survives navigation and signup within a reasonable window (AC-19).
- **Errors:** unknown `ref` code → stored as-is (still attributable), flagged in the dashboard as "unknown operator".

### F13 — Operators & internal dashboard (row 23)
- **Inputs:** an `operator` table (id, name, `ref_code` unique, active) seeded/managed by an internal admin; a request to `/operadores` by an internal-role user.
- **Processing:** aggregate per operator: visits, signups, companies, first-DeCA count, total DeCA, companies active (≥1 DeCA in 7d / 30d); conversions visit→signup, signup→first-DeCA.
- **Outputs:** a read-only table. (Charts/cohorts deferred — Later.)
- **Pre/Post:** pre — internal role. Post — read-only.
- **Errors:** non-internal user → 404 (not 403 — don't reveal the route).

### F14 — Analytics events
- **Events (closed set — `lib/analytics/events.ts`):** funnel — `landing_view`, `click_crear_deca`, `deca_started`, `deca_generated`, `deca_shared`, `deca_corrected`, `claim_completed`; landing conversion (#22) — `hero_cta`, `header_cta`, `login_click`, `persona_section_cta`, `product_demo_cta`, `faq_open`, `final_cta`; persona-led landing (#35) — `persona_autonomo_cta`, `persona_transport_company_cta`, `persona_agency_cta`, `persona_shipper_cta`; CMS content (#32) — `content_view`, `content_cta_click`; account (#23) — `signup_started`, `signup_completed`, `company_created`, `anonymous_deca_claimed`, `login_completed`, `first_authenticated_deca`; driver delivery (#26) — `pdf_opened`, `pdf_downloaded`, `share_opened`, `share_whatsapp`, `share_native`, `public_link_copied`, `print_clicked`, `qr_verify_opened`. Each row: event, timestamp, session id (first-party), path, `ref`/UTM snapshot, app version. **No PII in any event payload** (no names, NIF, emails, tokens or document content).
- **Processing:** `POST /api/events` (batched beacon), rate-limited, schema-validated; dropped silently if malformed (never 5xx a beacon).
- **Errors:** ingestion down → events lost, no user impact.

### F15 — SEO technical base
- SSR/SSG for every public page; exactly one `<h1>`; per-page `<title>`, meta description, canonical, OpenGraph; `app/sitemap.ts` (all public pages, no app routes, no PDFs); `app/robots.ts` (allow site, disallow `/d/`, `/app`, `/api`); `X-Robots-Tag: noindex` on PDF responses; schema.org `SoftwareApplication` on the landing and `FAQPage` where an FAQ is visible; clean URLs; no core content dependent on client JS.
- **Errors:** a page missing a required meta tag fails an e2e SEO assertion.

### F16 — Abuse controls (row 19)
- **Inputs:** every anonymous create, every public share send, every auth attempt, every `/d/` fetch.
- **Processing:** sliding-window limits per hashed IP + hashed fingerprint; a soft threshold triggers a challenge (proof-of-work or hCaptcha) — never shown below the threshold, never to `/d/` fetches (inspectors must not be challenged); `/d/` token enumeration protected by 128-bit tokens + per-IP 404 rate limiting + no incrementing ids anywhere public.
- **Outputs:** allowed / challenged / temporarily blocked (with a Spanish explanation + when to retry).
- **Pre/Post:** legitimate single-document users and inspectors never see a challenge.
- **Errors:** challenge provider down → fail open for `/d/` (legal access wins), fail to a longer delay for creation.

### F17 — "Am I obligated?" guided page (row 21, post-launch subset)
- A short SSR page: 3–4 guided questions (transport type, national/international, own-account vs public, exemptions) → a plain-language answer + the BOE citation + CTA to F1. No data stored. Part of the SEO cluster.

### F18 — 10 core SEO pages (row 16, post-launch subset)
- `/deca-gratis`, `/que-es-el-deca`, `/deca-obligatorio-2026`, `/como-hacer-un-deca`, `/requisitos-deca`, `/datos-obligatorios-deca`, `/deca-pdf-qr`, `/quien-esta-obligado-deca`, `/deca-vs-cmr`, `/generador-deca`. Each: one intent, real answer, BOE/Ministerio/CETM citations, last-reviewed date, internal links to landing + requisitos + FAQ + generador, ends in "CREAR DECA GRATIS". No thin content.

## Reference artifacts
None — the spec is carried by prose + the regulatory table R-1…R-13.

## Data model
- **operator**(id, name, ref_code unique, active, created_at)
- **company**(id, name, nif, address, created_at) — the account's own company
- **user**(id ↔ Supabase auth.uid, company_id, role[user|internal], created_at)
- **acquisition**(id, user_id, company_id, first_ref_code, last_ref_code, first_landing_url, first_utm_{source,medium,campaign,content,term}, last_utm_*, first_seen_at, signup_at, first_deca_at)
- **deca**(id, company_id nullable, created_by_user_id nullable, current_version_id, service_start, service_end nullable, created_at)
- **deca_version**(id, deca_id, version_no, token unique, pdf_path, data_json, change_reason nullable, created_at) — append-only, never updated after creation except pdf_path on first write
- **claim_token**(token pk, deca_id, expires_at, used_at nullable)
- **saved_company / saved_vehicle / saved_address**(id, user_id, …fields, created_at)
- **event**(id, name, ts, session_id, path, ref_snapshot_json, app_version)
- **deca_access_log**(id, deca_version_id, ip_hash, ts)
- **abuse_counter**(key_hash, window_start, count)
- Retention: `deca` + `deca_version` + `pdf_path` kept ≥ 1 year (R-10); a scheduled job may deactivate public access 7 natural days post `service_end` (R-9) without deleting anything.

## Integrations
| Service | Auth | Use | Limits | Failure handling |
|---|---|---|---|---|
| Supabase Postgres | service key (server only) | all app data | connection pool | fail closed on writes; read retries |
| Supabase Storage | service key (server only) | PDF put/get, private bucket | object size | put fails → no document emitted; get fails → 503 |
| Supabase Auth | anon + service keys | OTP/password, sessions | OTP send rate | OTP failure → retry UI |
| Resend (email) | API key (server only) | claim link, driver email share | monthly quota | send fails → surfaced, link still usable |
| hCaptcha (challenge) | site + secret key | abuse challenge only | — | provider down → fail open for `/d/`, longer delay for create |

All keys server-side only; never in `NEXT_PUBLIC_*`.

## Permissions matrix
| Action | Anonymous | Authed user | Internal role |
|---|---|---|---|
| Create DeCA | yes (F16 limited) | yes | yes |
| Download via `/d/[token]` | yes (no auth ever) | yes | yes |
| See own history / saved data | no | yes | yes |
| Correct / duplicate a DeCA | no (must claim first) | yes (own only) | yes (own only) |
| Claim an anonymous DeCA | via token | via token | via token |
| Operator dashboard `/operadores` | no (404) | no (404) | yes |
| Manage operators | no | no | yes |

## Flows index
- `docs/flows/create-deca.md` · `docs/flows/anonymous-claim.md` · `docs/flows/correction-versioning.md` · `docs/flows/public-document-access.md` · `docs/flows/signup-attribution.md` · `docs/flows/driver-share.md` · `docs/flows/abuse-challenge.md`

## Technical plan
See `docs/03-technical-plan.md`.

## Design split
- **Needs design:** landing (F11); creation flow steps 1–3 + result (F1/F6) [template-reuse: the 3 steps share one shell]; document detail + version list (F5); history list (F7-adjacent); saved-data screens (F7) [template-reuse: company/vehicle/address share one form pattern]; driver-share sheet (F9); printable A4 DeCA copy + the PDF visual layout (F3) [these two share the document layout]; public `/d/` 410 page (F4); auth screens (F10); operator dashboard (F13); SEO page template (F18) [one template, 10 instances]; "am I obligated?" page (F17); the generic error / challenge page (F16).
- **No design:** the DeCA engine, attribution engine, API handlers, sitemap/robots, analytics ingest, abuse limiter, migrations, seed scripts.
- **External manual setup:** Supabase project (DB + Storage bucket + Auth providers + RLS), Hostinger VPS + Docker + reverse proxy + TLS, DNS for the real domain, Resend account + domain verification, hCaptcha keys, GitHub repo secrets for CI.
- **Foreseen external assets (Design likely can't produce):** none photographic required — the design brief explicitly avoids stock truck photos (EPIC 01). The logo is a founding deliverable for Design. Favicon/OG image derived from the logo.
- **Per-screen accessibility requirements:** every screen — semantic landmarks + correct heading order (one h1); full keyboard operability + visible focus; form fields with programmatic labels, error text tied via `aria-describedby`, errors not colour-only; contrast ≥ 4.5:1 (AA); target size ≥ 24px (AAA 44px where feasible); reduced-motion honored; the persistent mobile CTA must not trap focus or obscure content; the multi-step form announces step changes to assistive tech; the public `/d/` route is a direct file download (no a11y surface) and its 410 page is plain semantic HTML.
- **Rich references held by the user:** none.
- **Target devices/viewports and exact breakpoints:** all screens serve mobile-first. Breakpoints: 360 (small phone), 768 (tablet), 1280 (desktop). The landing and creation flow are verified at all three; app/dashboard screens at 768 and 1280 primarily, usable at 360.

## Acceptance criteria

**F1 creation**
- AC-01 Given valid data for all 3 steps, when the user generates, then a DeCA record + version 1 + a stored PDF + a public URL exist and the user lands on the result/detail.
- AC-02 Given a mandatory Art. 6 field is empty, when the user tries to advance, then an inline error names the field and the step does not advance.
- AC-03 Given generation fails at render or storage, then no DeCA row is persisted as valid, no partial PDF is stored, and the user sees a Spanish error.
- AC-04 (a11y) The 3-step form is fully keyboard operable, each field has a programmatic label, step changes are announced, and validation errors are linked to their field and not colour-only.
- AC-04b Submitting "Generar" twice in quick succession (double-click, retry) produces exactly one DeCA, not two (idempotency key).

**F2/F3 compliance**
- AC-05 The generated PDF is ≤ 5 MB. (R-4)
- AC-06 The generated PDF is native: text of every field is extractable and the file is not a single rasterised image. (R-3)
- AC-07 The PDF embeds a QR that decodes exactly to the document's public URL. (R-5)
- AC-08 The PDF metadata records creation date/time; after a correction the new version's metadata records the modification date/time. (R-11)
- AC-09 Every Art. 6 FOM/2861/2012 field is present in the PDF. (R-2)

**F4 public URL**
- AC-10 `GET /d/[token]` returns the PDF with `Content-Type: application/pdf`, no auth, no cookie, no HTML interstitial, no button. (R-7, R-8)
- AC-11 In the production configuration the URL is HTTPS and HTTP is upgraded. (R-6)
- AC-12 More than 7 natural days after `service_end`, `GET /d/[token]` returns 410 (if deactivation is enabled) while the document and PDF still exist in storage. (R-9, R-10)
- AC-13 An incorrect or guessed token returns 404, and repeated 404s from one IP are rate-limited. (R-8 enumeration)

**F5 versioning**
- AC-14 A substantive correction creates version n+1 with a new token/URL/QR/PDF and version n remains retrievable unchanged. (R-13)
- AC-15 A correction records a reason and a modification timestamp. (R-11, R-13)
- AC-16 A non-owner cannot correct a document (403).

**F6 anonymous + claim**
- AC-17 An anonymous DeCA is fully valid, downloadable via its URL, and retained; the creator gets a 30-day claim link; claiming attaches it (and its versions) to the account.

**F12/F10 attribution**
- AC-18 The user is never shown, and never types, an operator's name.
- AC-19 Visiting `/?ref=adrian` then navigating other pages then signing up within a session results in `first_ref_code = adrian` on the account.
- AC-20 Returning via `/?ref=maria` before signup sets `last_ref_code = maria` while `first_ref_code` stays `adrian`; after signup `first_ref_code` is never overwritten.
- AC-21 All five UTM params present in the entry URL are stored (first and last).
- AC-22 A visit with no `ref` and no UTM is attributed organic/direct from the referrer.
- AC-23 A DB query returns, per `ref_code`, the count of companies and of DeCA generated.

**F9 driver share**
- AC-24 Each share channel (link, WhatsApp deep link, email) delivers the working public URL; the printable copy shows the QR prominently on A4.

**F11 landing**
- AC-25 The landing renders server-side with exactly one `<h1>` containing "DeCA GRATIS" and its primary CTA links to the creation flow, not to any contact/demo/pricing route.
- AC-26 There is no pricing, checkout, "solicitar información", demo request or pre-comprehension popup anywhere on the landing.
- AC-27 With JavaScript disabled, the landing content and the primary CTA still work.
- AC-28 (perf) The landing meets the mobile budgets: LCP < 2.0 s, INP < 200 ms, CLS < 0.1 (Lighthouse CI p75 proxy).
- AC-29 (a11y) The landing passes axe with no serious/critical violations in default, and the persistent mobile CTA does not obscure content or trap focus.

**F13 dashboard**
- AC-30 `/operadores` shows, per operator, visits / signups / companies / first-DeCA / total-DeCA / active-companies (7d, 30d) and the two conversion rates; a non-internal user gets 404.

**F14/F15 analytics & SEO**
- AC-31 `landing_view`, `click_crear_deca`, `signup_started`, `signup_completed`, `deca_started`, `deca_generated` are emitted at their moments and carry the `ref`/UTM snapshot; no event contains personal data.
- AC-32 Every public page has a unique title, meta description, canonical and OG tags, exactly one h1, and appears in `sitemap.xml`; `/d/`, `/app`, `/api` are disallowed in robots and PDF responses carry `X-Robots-Tag: noindex`.
- AC-33 `SoftwareApplication` schema is on the landing and `FAQPage` schema is present wherever an FAQ is visible and valid.

**F16 abuse**
- AC-34 A single user creating one DeCA, and an inspector fetching one `/d/` URL, are never shown a challenge.
- AC-35 Crossing the anonymous-creation soft threshold from one IP/fingerprint triggers a challenge; passing it allows creation to continue.
- AC-36 Public document fetches are never blocked by the challenge provider being unavailable (fail open for `/d/`).

**F17/F18 SEO content**
- AC-37 Each of the 10 core pages has one intent, a BOE/Ministerio/CETM citation, a last-reviewed date, internal links to landing/requisitos/FAQ/generador, and ends with the "CREAR DECA GRATIS" CTA; none is thin content (min substantive length + unique value check).

## Estimate & budget
See `docs/estimate.md` (Estimate v2 firm). `Client budget: no` — no `docs/budget.md`.

## Open questions for the user
_None blocking Phase 3._ Pre-launch open items (tracked in PROGRESS.md deferred): real domain; RGPD review of anonymous-document retention (D-016); Hostinger VPS sizing; whether in-place typo edits before first share are allowed (default: always new version).
