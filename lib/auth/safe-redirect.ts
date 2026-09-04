/**
 * Post-auth redirect safety (AUTH #38 §"Context preservation"). A `next` value
 * arriving in the URL is attacker-controlled; only a same-origin *path* may be
 * followed, never an absolute URL, a protocol-relative `//host`, a backslash
 * trick or anything that is not a plain internal route.
 *
 * Pure — safe to unit-test and to use on the client.
 */
export function safeInternalPath(next: string | null | undefined, fallback = "/panel"): string {
  if (typeof next !== "string" || next.length === 0) return fallback;
  const value = next.trim();
  // Must be an absolute path, not protocol-relative, not a backslash escape.
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  // No scheme and no backslash (browsers treat "\" like "/" in URLs).
  if (value.includes(":") || value.includes("\\")) return fallback;
  // No whitespace or control characters.
  if (value.length !== next.length || /\s/.test(value)) return fallback;
  // Never bounce back into an auth screen or the API.
  if (/^\/(entrar|registro|recuperar|api)(\/|$|\?|#)/.test(value)) return fallback;
  return value;
}
