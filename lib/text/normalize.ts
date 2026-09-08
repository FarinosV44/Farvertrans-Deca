/**
 * Visual normalisation of operator-entered operational data (#86 part 3):
 * names, addresses, localities, provinces, plates and equivalent descriptive
 * fields are stored and shown in UPPERCASE for a clean, uniform read across the
 * workspace and the generated DeCA.
 *
 * NEVER apply this to a value whose meaning is case-sensitive — an email, a
 * URL, a password, an API token or any other technical identifier. Those keep
 * their exact casing.
 */

/** Uppercase (Spanish locale — accents and ñ preserved) and collapse surrounding whitespace. */
export function upperText(input: string): string {
  return input.trim().toLocaleUpperCase("es-ES");
}

/** Uppercase when non-empty; pass an empty/whitespace-only string through unchanged. */
export function upperTextOrEmpty(input: string): string {
  const t = input.trim();
  return t === "" ? "" : t.toLocaleUpperCase("es-ES");
}
