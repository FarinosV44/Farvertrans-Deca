# Flow — Anonymous DeCA + 30-day claim (F6, D-016)

Trigger: an anonymous user generates a DeCA (create-deca flow, anon branch).

1. System issues a `claim_token` (≥128-bit, 30-day TTL), shows it on the result page, offers "Enviármelo por email".
2. The DeCA is fully valid and retained 1 year regardless of claiming (R-10).
3. Later, user opens `/claim/[token]`:
   - Not logged in → prompted to sign up (email OTP) or log in. On signup, attribution is captured (signup-attribution flow).
   - Authed → `POST /api/claim/[token]`: attach `deca` (+ all versions) to the account's `company`, set `claim_token.used_at`, emit `claim_completed`.
4. System → user: the document now appears in `/app/historial`; corrections & duplication unlocked.

Branches:
- Token expired (>30 days) or already used → message: the document is still valid and downloadable via its public URL, but can no longer be linked from the UI.

Failure paths:
- User signs up but abandons before claiming → the claim token stays valid until TTL; the result-page email contains the link.
