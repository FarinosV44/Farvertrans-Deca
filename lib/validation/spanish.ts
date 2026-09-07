import { checkNif } from "@/lib/deca/nif";

/**
 * Spanish-market field validators shared by every "our own company" form
 * (#59). These are stricter than the DeCA wizard's counterparty checks: a
 * company registering *itself* must give well-formed data, whereas a
 * counterparty on a document may legitimately be foreign (R-2).
 */

/** ES postal code: exactly 5 digits, province prefix 01–52. */
export function isValidSpanishPostalCode(input: string): boolean {
  const s = input.trim();
  if (!/^\d{5}$/.test(s)) return false;
  const province = Number(s.slice(0, 2));
  return province >= 1 && province <= 52;
}

/**
 * A plausible phone number. Accepts an explicit international form
 * (`+` then 8–15 digits) or a Spanish national number (9 digits starting
 * 6/7/8/9). Spaces, dots, hyphens and parentheses are ignored.
 */
export function isValidPhone(input: string): boolean {
  const s = input.trim().replace(/[\s.\-()]/g, "");
  if (/^\+\d{8,15}$/.test(s)) return true;
  return /^[6789]\d{8}$/.test(s);
}

/**
 * Hard NIF/CIF/NIE gate for the app's OWN company. Wraps `checkNif()`
 * (`lib/deca/nif.ts`) — reused, not reimplemented — and, unlike every other
 * caller of it, treats an unrecognised shape or a failed checksum as invalid
 * rather than a soft warning.
 */
export function isValidOwnNif(input: string): boolean {
  const c = checkNif(input);
  return c.kind !== "unknown" && c.valid;
}
