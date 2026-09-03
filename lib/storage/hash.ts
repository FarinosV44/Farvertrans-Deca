import { createHash } from "node:crypto";

/**
 * SHA-256 of a PDF buffer, lowercase hex — the per-version integrity anchor
 * (R-10 / FIX #18). Kept in its own module (no `server-only`) so it is unit-testable.
 */
export function pdfSha256(body: Buffer | Uint8Array): string {
  return createHash("sha256").update(body).digest("hex");
}
