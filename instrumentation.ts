/**
 * Next.js instrumentation hook — runs once when a new server instance boots.
 *
 * `lib/env.ts`'s `getEnv()` has always documented "fail fast on boot" for the
 * server env schema, but nothing ever actually called it at startup (#123) —
 * it was only invoked lazily inside `lib/supabase/server.ts`'s Storage
 * helpers, so a missing/malformed required var (most critically
 * `FVD_HASH_SECRET`, which signs the session cookie itself) went unnoticed
 * until whichever request path happened to touch it, or — before this fix —
 * silently fell back to a hardcoded, publicly-known default instead of
 * failing at all. This hook makes that promise real: a misconfigured
 * deployment now crashes on boot instead of serving traffic insecurely.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getEnv } = await import("@/lib/env");
    getEnv();
  }
}
