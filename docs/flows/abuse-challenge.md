# Flow — Abuse challenge (F16, confrontation row 19)

Trigger: any anonymous create, share send, or auth attempt.

1. `lib/abuse/limiter` checks the sliding-window count for hashed(IP) + hashed(fingerprint).
2. Below the soft threshold → allow silently (the normal case — AC-34).
3. At/above the soft threshold → return a challenge (proof-of-work or hCaptcha):
   - user solves it → the action proceeds (AC-35);
   - repeated failures / far above threshold → temporary block with a Spanish message and a retry time.
4. `GET /d/<token>` is NEVER challenged and NEVER blocked by the challenge provider being down (fail open — AC-36): inspectors must always get the document.

Rules:
- No incrementing public ids anywhere; `/d/` 404s are per-IP rate-limited (enumeration).
- Challenge provider down → creation falls back to a longer forced delay rather than a hard block.
