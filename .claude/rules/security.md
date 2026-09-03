---
paths:
  - "app/**/*.ts"
  - "app/**/*.tsx"
  - "lib/**/*.ts"
  - "prisma/**/*.prisma"
---

# Security — Farvertrans DeCA

DO / DON'T core (reminder, not the standard):

- **Authorize every state-changing and every owner-scoped call server-side** against the session. Check ownership on every `deca` / `deca_version` / `saved_*` read and write. Client checks are UX only (T-1).
- **`/d/[token]` never requires auth, a cookie, an interstitial, or a button** (R-7/R-8) — but tokens are ≥128-bit random, there are no sequential public ids, and repeated 404s per IP are rate-limited (T-2).
- **Validate every input with `zod`** at the boundary before it reaches `lib/`. Never trust query params, headers, or body shape.
- **Secrets are server-side only.** Never put a Supabase service key, Resend key, or hCaptcha secret in `NEXT_PUBLIC_*` or client code (T-6). No secret, credential, key, or real personal data in any committed file.
- **`deca_version` is append-only.** Corrections create a new version; never mutate a stored version or its timestamps (T-4).
- **No `dangerouslySetInnerHTML`** with user or document data. Rely on React escaping. Set a CSP header (T-5).
- **Prisma parameterized queries only** — never string-concatenate SQL.
- **Analytics rows carry no PII** — no names, NIF, emails; only session id + path + ref/UTM snapshot + app version (T-14).
- **Fail open for `/d/` on challenge-provider outage** (inspectors must always get the document); fail to a longer delay for creation (F16, T-3).
- **RGPD:** PDFs and `data_json` hold third-party personal data — minimise logs, respect the 1-year retention (R-10), and the anonymous-document retention question (D-016) is unresolved until a pre-launch review.

Full profile: `references/security/web-app.md` + `references/security/website.md` govern; this file is the reminder.
