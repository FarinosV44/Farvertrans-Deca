# DeCA retention & versioning policy

Implementation evidence for FIX #19. **Legal basis:** the DeCA must be kept for at
least **one year** by the obligated parties (shipper and carrier); the 2026
resolution allows corrections to be handled by preserving traceability and/or
issuing a new PDF/URL/QR. Farvertrans DeCA uses **append-only versioning** and
never destroys a generated document.

## What is retained, and for how long

| Object | Retention | Where |
|---|---|---|
| `deca` row | Indefinite (never deleted in v1) | Postgres |
| `deca_version` rows (every version) | Indefinite — append-only, never updated after creation | Postgres |
| Generated PDF bytes (one per version) | Indefinite — `FVD_STORAGE` (`FVD_STORAGE_DIR` persistent path, or Supabase Storage) | PDF store |
| `pdf_sha256` per version | With the version row | Postgres |
| `deca_access_log` (hashed IP + timestamp) | Indefinite in v1 (audit minimalism — no PII) | Postgres |
| `claim_token` | 30 days TTL, then inert (the DeCA itself is unaffected) | Postgres |

**Minimum guarantee:** every generated DeCA and every version's PDF is retained
for **at least one year** while Farvertrans acts as the repository holding the
document for the obligated parties. v1 keeps them indefinitely; any future
retention job MUST keep each version ≥ 1 year from its `created_at` and MUST NOT
delete PDF bytes that a `deca_version` still references.

## Rules enforced in code

1. **Append-only.** A correction calls `correctDeca()` which creates version _N+1_
   with a **new token, new URL, new QR and a new PDF**; version _N_ is untouched.
   `deca_version` is never `UPDATE`d after creation (except the one-time `pdf_path`
   write inside the same generation transaction).
   - Test: `build13.spec.ts` — v1 stays retrievable with its original data and its
     PDF hash is unchanged after a correction; `launch-happy-path.spec.ts`.
2. **Old PDFs are never overwritten.** The storage key is derived from the version
   token (`<token>.pdf`), unique per version, so a new version never writes over an
   older version's object.
3. **Correction reason is required** (`min 3` chars) and stored on the version, with
   its `created_at` and `created_by_user_id` (the correcting user).
   - Test: `build13.spec.ts` "intento" with empty/short reason → 422.
4. **A claim never resets the retention clock and never regenerates the document.**
   `claimDeca()` only sets `deca.company_id` / `deca.created_by_user_id`. It does
   **not** touch any `deca_version`, token, `pdf_path`, `pdf_sha256` or `created_at`.
   The public inspection URL that existed before the claim keeps working, byte-for-byte.
   - Test: `registro.spec.ts` — "an auth failure never orphans/deletes the DeCA; the
     public URL still works"; `launch-happy-path.spec.ts` step 12.
5. **No anonymous cleanup job deletes retained PDFs.** There is no scheduled deletion
   in v1. `isPubliclyAvailable()` (R-9) only flips *public* availability 7 natural
   days after a marked service end — the document and PDF are still stored and the
   owner can re-share.
6. **Integrity anchor.** `pdf_sha256` is written at generation and re-checked on every
   public download (`/d/[token]`); a mismatch is logged as repository corruption but
   the document is still served (an inspector must always get something).

## Audit view (owner only)

`/panel/deca/[id]` shows the full version list: version number, UTC timestamp,
change reason and (when known) the correcting user's email, plus a per-version
"Ver PDF" link. This private history is **never** reachable through a public
inspection token — `/d/[token]` resolves exactly one version and returns only its
PDF bytes.

## Open items (post-v1, tracked in `docs/07-release.md`)

- A formal retention job that enforces "≥ 1 year, then eligible for deletion only
  if no legal hold" rather than "keep forever".
- Owner-initiated export of a DeCA + all its versions (RGPD portability).
- The anonymous-document retention vs. RGPD review (D-016) — still required before
  public launch.
