import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

/**
 * #123 — FVD_HASH_SECRET must never fall back to a hardcoded, publicly-known
 * value ("insecure-dev-secret"). Every secret-derived function below signs or
 * verifies something security-critical (the session cookie itself, OAuth CSRF
 * state, a WebAuthn challenge, the PoW abuse-challenge prefix, the superadmin
 * backup password) and must refuse to run when the secret is missing or too
 * short, rather than silently keying off a value visible in this public repo.
 */
describe("#123 — no insecure fallback for FVD_HASH_SECRET", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("lib/hash.ts hashIdentifier throws when FVD_HASH_SECRET is unset", async () => {
    vi.stubEnv("FVD_HASH_SECRET", "");
    vi.resetModules();
    const { hashIdentifier } = await import("@/lib/hash");
    expect(() => hashIdentifier("1.2.3.4")).toThrow();
  });

  it("lib/auth/session.ts signSession throws when FVD_HASH_SECRET is unset", async () => {
    vi.stubEnv("FVD_HASH_SECRET", "");
    vi.resetModules();
    const { signSession } = await import("@/lib/auth/session");
    expect(() => signSession("user-1", 1)).toThrow();
  });

  it("lib/auth/oauth-state.ts createOAuthState throws when FVD_HASH_SECRET is unset", async () => {
    vi.stubEnv("FVD_HASH_SECRET", "");
    vi.resetModules();
    const { createOAuthState } = await import("@/lib/auth/oauth-state");
    expect(() => createOAuthState()).toThrow();
  });

  it("lib/auth/webauthn-challenge.ts createWebAuthnChallenge throws when FVD_HASH_SECRET is unset", async () => {
    vi.stubEnv("FVD_HASH_SECRET", "");
    vi.resetModules();
    const { createWebAuthnChallenge } = await import("@/lib/auth/webauthn-challenge");
    expect(() => createWebAuthnChallenge("chal", "user-1")).toThrow();
  });

  it("lib/abuse/challenge.ts challengePrefix throws when FVD_HASH_SECRET is unset", async () => {
    vi.stubEnv("FVD_HASH_SECRET", "");
    vi.resetModules();
    const { challengePrefix } = await import("@/lib/abuse/challenge");
    expect(() => challengePrefix("anon_create")).toThrow();
  });

  it("lib/admin/backup-password.ts checkBackupPassword throws when FVD_HASH_SECRET is unset", async () => {
    vi.stubEnv("FVD_HASH_SECRET", "");
    vi.stubEnv("SUPERADMIN_BACKUP_PASSWORD", "some-backup-password");
    vi.resetModules();
    const { checkBackupPassword } = await import("@/lib/admin/backup-password");
    expect(() => checkBackupPassword("some-backup-password")).toThrow();
  });

  it("also rejects a too-short secret, not just an absent one", async () => {
    vi.stubEnv("FVD_HASH_SECRET", "short");
    vi.resetModules();
    const { hashIdentifier } = await import("@/lib/hash");
    expect(() => hashIdentifier("1.2.3.4")).toThrow();
  });

  it("accepts a real secret without throwing (control case)", async () => {
    vi.stubEnv("FVD_HASH_SECRET", "a-real-test-secret-at-least-16-chars");
    vi.resetModules();
    const { hashIdentifier } = await import("@/lib/hash");
    expect(() => hashIdentifier("1.2.3.4")).not.toThrow();
  });
});
