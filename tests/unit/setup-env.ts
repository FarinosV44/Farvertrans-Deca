// Global unit-test environment defaults. Vitest does not load `.env` (only
// Next.js's own runtime does), so anything `lib/env.ts` requires with no
// insecure fallback (#123) needs an explicit, valid test value here — or every
// test touching session/OAuth-state/WebAuthn-challenge/backup-password/PoW
// signing would have to stub it individually.
process.env.FVD_HASH_SECRET ??= "vitest-unit-test-hash-secret-not-for-real-use";
