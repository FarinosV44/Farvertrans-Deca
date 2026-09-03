# Threat Model — Farvertrans DeCA

Profiles: `references/security/web-app.md` + `references/security/website.md`. Kept current through Phase 5,
re-verified at the Phase 7 gate. Only `IN PLACE` controls are written in the present tense.

## 1. Assumptions

- **Public by construction:** the marketing/SEO pages, the client JS bundle, every API route shape, and — necessarily — every generated DeCA PDF at its unguessable public URL (R-7: no auth). Obscurity is never a control.
- **The PDFs contain third-party personal data** — names, NIF, addresses of contractual shippers, effective carriers and (implicitly) drivers. RGPD/LOPDGDD applies. A leaked or enumerated document exposes that data.
- **Adversaries & goals:**
  - Bots / abusers wanting free document generation at scale (storage cost, fake-paperwork risk, reputational damage).
  - Someone trying to enumerate `/d/` tokens to harvest documents / personal data.
  - A competitor or scraper hammering the SEO pages.
  - An attacker targeting an operator's or company's account (the attribution and history data).
  - A user trying to forge or tamper with a document's audit trail to claim it was created earlier.
- **Trusted:** Supabase as the managed DB/storage/auth provider; Hostinger as the host; the maintainer with production access.

## 2. Defended

| # | Threat | Control | Delivery state |
|---|---|---|---|
| T-1 | Unauthorized data access / IDOR on documents, history, saved data | Every API call authorized server-side against the session; ownership checked on every `deca`/`saved_*` read & write; client validation is UX only | TO BUILD — P5 auth + create + versioning slices |
| T-2 | `/d/` token enumeration → mass document harvest | ≥128-bit URL-safe random tokens per version; no sequential ids anywhere public; per-IP 404 rate limiting on `/d/`; `X-Robots-Tag: noindex` + robots disallow so search engines never index them | TO BUILD — P5 public-url + abuse slices |
| T-3 | Bot-driven mass document generation | Sliding-window rate limit per hashed IP + hashed fingerprint; challenge (PoW/hCaptcha) above a soft threshold, never below, never on `/d/` fetches | TO BUILD — P5 abuse slice |
| T-4 | Audit-trail tampering (backdating, silent edits) | `deca_version` is append-only; corrections create a new version, never mutate; creation/modification timestamps server-set (UTC), never client-supplied; prior versions never deleted (R-13) | TO BUILD — P5 versioning slice; VERIFY in the compliance suite |
| T-5 | Injection (SQL, XSS) | Prisma parameterized queries only; React auto-escaping; `zod` validation on every input; no `dangerouslySetInnerHTML` with user data; CSP header | TO BUILD — P5 scaffold (CSP) + every slice (zod) |
| T-6 | Secret exposure | All service keys server-side only; never in `NEXT_PUBLIC_*`; `.githooks/pre-commit` confidential-data gate; `.env` gitignored; CI secret scan | TO BUILD — P5 scaffold |
| T-7 | Session hijack / CSRF | Supabase SSR httpOnly + Secure + SameSite cookies; state-changing routes require the session cookie + same-origin / CSRF token; short-lived access tokens | TO BUILD — P5 auth slice |
| T-8 | Transport security | HTTPS enforced, HTTP→HTTPS upgrade, HSTS; TLS 1.2+ at the reverse proxy (R-6) | MANUAL — Hostinger reverse proxy + cert; VERIFY in prod |
| T-9 | Non-compliant document emitted (legal risk) | The engine fails closed: validation (R-2), render (R-3/R-4) or storage failure → no document; the `tests/compliance/` suite gates the release on R-1…R-13 | TO BUILD — P5 deca + pdf slices; gate at P7 |
| T-10 | Email-based abuse (claim link / driver share as spam relay) | `/api/share` and claim emails rate-limited per account/IP; templated content only, no user free-text in the envelope; SPF/DKIM via Resend | TO BUILD — P5 share slice; MANUAL — Resend domain verification |
| T-11 | Scraper / volumetric load on public pages | SSG/ISR caching; per-IP request rate limiting; static asset CDN caching headers | TO BUILD — P5 SEO base slice; partial |
| T-12 | Supply chain | Dependencies pinned; `npm audit` in CI; permissive-license-only rule (D-003); lockfile committed | TO BUILD — P5 scaffold |
| T-13 | RLS misconfiguration exposing Supabase tables directly | App tables accessed only via the server (service key); Supabase anon key has no table read grants; RLS deny-by-default on any table the client could reach | MANUAL — Supabase policy config; VERIFY |
| T-14 | Personal-data over-collection in analytics | `event` rows carry no PII (no names, NIF, emails); only session id + path + ref/UTM snapshot | TO BUILD — P5 tracking slice |
| T-15 | Log leakage of personal data / tokens | `pino` redaction list; `/d/` access log stores only hashed IP + timestamp + doc id | TO BUILD — P5 scaffold |

## 3. Not defended — and what to do if it matters

| Not defended | Consequence | If you need it |
|---|---|---|
| A determined user on their own client | They can read the bundle, extract their own session token and call the API directly; client-side validation is UX, never enforcement | Nothing client-side — every call is already authorized server-side |
| Volumetric / distributed denial of service | App and Hostinger limits turn a flood into downtime rather than an unbounded bill, but the site can be taken down | Put Cloudflare (or another CDN/WAF) in front — recommended before a big campaign push |
| Account takeover via the user's own email provider | Passwordless OTP and password reset are only as strong as the user's inbox | Offer/enforce MFA (post-v1) |
| Supply-chain provenance (SBOM, artifact signing) | Deps are pinned and `npm audit`ed; build artifacts are not attested | Add SBOM generation + image signing to CI |
| A malicious insider with production/Supabase access | Least privilege + audit logs reduce it; an owner can still read or alter anything | Separate duties, require review on prod changes, restrict Supabase service-role access |
| Application-level encryption of the personal data in PDFs / `data_json` | Only the provider's at-rest encryption applies; a Supabase-side compromise exposes plaintext | Encrypt `data_json` and stored PDFs with an app-held key + rotation (adds ops burden; weigh against RGPD exposure before launch) |
| Long-term integrity proof of a document (qualified timestamp / signature) | The audit trail is DB-internal; it is not cryptographically provable to a third party that a PDF is unmodified since creation | The BOE resolution does not require an e-signature (confirmed in the scan); add a qualified timestamp only if a client or inspection practice later demands it |
| Deletion / RGPD erasure requests vs the 1-year retention obligation | A data subject's erasure request conflicts with R-10; v1 has no self-service erasure and no documented legal-basis balance | Document the retention legal basis and an erasure-request procedure (manual) before launch — pre-launch open item (D-016) |
| Abuse via many distinct IPs / residential proxies | Per-IP + per-fingerprint limits raise the cost; a distributed abuser with fresh IPs still gets through at a slower rate | Device attestation / stricter challenge, or require signup for volume — both cost the zero-friction differentiator |
