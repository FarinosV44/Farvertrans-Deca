/**
 * Strip email addresses and long identifier-looking digit runs (NIF/CIF,
 * phone numbers, tokens) from free text before it is logged. Shared by every
 * log call site that might see third-party personal data (RGPD, T-14, T-15)
 * — never each duplicating its own regex (#127).
 */
export function redactPii(text: string): string {
  return text
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[redacted]")
    .replace(/\b[A-Za-z]?\d{7,}[A-Za-z]?\b/g, "[redacted]");
}
