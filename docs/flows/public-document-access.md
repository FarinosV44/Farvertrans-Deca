# Flow — Public document access via QR/URL (F4, R-6…R-9)

Trigger: an inspector (or anyone) scans the PDF's QR or opens `https://<domain>/d/<token>`.

1. System resolves `token` → `deca_version`.
2. Availability check: service ongoing, OR ≤ 7 natural days after `service_end` (R-9).
3. Within window → stream the PDF from storage:
   - `Content-Type: application/pdf`, `Content-Disposition: inline; filename="DeCA-<ref>.pdf"`, `X-Robots-Tag: noindex`, cache headers permitting inspector re-fetch;
   - no auth, no cookie set, no HTML page, no button, no redirect (R-7, R-8);
   - append `deca_access_log` (hashed IP, timestamp, version id) — R-11, minimal.
4. System → client: HTTP 200, the exact stored PDF bytes.

Branches / failure paths:
- Outside the availability window (deactivation enabled) → HTTP 410, a plain semantic page: document no longer available, owner can re-share; still no auth. Document + PDF still exist in storage (R-10).
- Unknown/invalid token → HTTP 404, generic. Repeated 404s from one IP → rate-limited (enumeration protection, AC-13).
- Storage read error → HTTP 503, retryable, logged; never a partial body.
- Production: HTTP upgraded to HTTPS; HSTS set (R-6).
