/**
 * Normalise a vehicle plate for storage/display: uppercase, strip spaces, hyphens
 * and dots. Purely cosmetic — never rejects, since foreign plates vary widely.
 */
export function normalizePlate(input: string): string {
  return input
    .toUpperCase()
    .replace(/[\s.\-_]/g, "")
    .trim();
}

/** True for the current Spanish format (NNNN LLL). Used only to decide whether to show a soft hint. */
export function looksLikeSpanishPlate(input: string): boolean {
  return /^\d{4}[A-Z]{3}$/.test(normalizePlate(input));
}
