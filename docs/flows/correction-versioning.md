# Flow — Correction & versioning (F5, R-13)

Trigger: an authed owner opens `/app/deca/[id]` and chooses "Corregir".

1. System pre-fills the form with the current version's data.
2. User edits fields; enters a change reason (required).
3. User → "Guardar corrección". System:
   - creates `deca_version` v(n+1) with a NEW token/URL, renders a NEW PDF with a NEW QR, records the reason + modification timestamp (R-11);
   - keeps v(n) and its PDF intact and retrievable (R-13) — never deleted;
   - sets `deca.current_version_id` = v(n+1).
4. System → user: detail view shows the full version history; the current version is what the driver receives. Emits `deca_corrected`.

Branches:
- Non-owner → 403 (AC-16).
- Missing reason → 422, cannot save.
- (Config) Non-substantive typo before first share → default is still a new version for a clean audit; in-place edit is a recorded option, off by default.

Failure paths:
- Render/store fails → the correction is not applied, v(n) stays current, Spanish error, retry.
