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
 * A postal code for OUR OWN company (#59 + live incident: a Portuguese
 * company could not self-register — `NNNN-NNN` fails the Spanish-only rule
 * above outright). Spanish format is still validated strictly; anything else
 * is accepted as a plausible foreign postal code, mirroring the "foreign
 * counterparty" leniency `checkNif` already applies to NIF (R-2).
 */
export function isValidPostalCode(input: string): boolean {
  const s = input.trim();
  if (isValidSpanishPostalCode(s)) return true;
  const n = s.replace(/\s/g, "");
  return n.length >= 3 && n.length <= 10 && /\d/.test(n) && /^[A-Z0-9-]+$/i.test(n);
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
 * NIF/CIF/NIE gate for the app's OWN company. Wraps `checkNif()`
 * (`lib/deca/nif.ts`) — reused, not reimplemented. A recognisably Spanish
 * shape (DNI/NIE/CIF) must pass its checksum, exactly as before.
 *
 * Live incident: a Portuguese company could not self-register — its NIPC
 * (9 plain digits) is `kind: "unknown"` here and was flatly rejected, even
 * though R-2 already treats an unrecognised shape as a legitimate foreign
 * operator everywhere else in the app. An unrecognised shape is now accepted
 * as a plausible foreign tax id (has a digit, 5–20 chars) rather than
 * rejected outright — nonsense with no digits ("NOTANIF") still fails.
 */
export function isValidOwnNif(input: string): boolean {
  const c = checkNif(input);
  if (c.kind !== "unknown") return c.valid;
  const n = input.trim().replace(/[\s.-]/g, "");
  return n.length >= 5 && n.length <= 20 && /\d/.test(n) && /^[A-Z0-9]+$/i.test(n);
}
