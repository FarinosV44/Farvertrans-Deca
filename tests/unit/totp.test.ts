import { describe, expect, it, vi, afterEach } from "vitest";
import { generateTotpSecret, totpAt, verifyTotp, otpauthUri } from "@/lib/auth/totp";

describe("TOTP (SECURITY #53, RFC 6238)", () => {
  afterEach(() => vi.useRealTimers());

  it("generates a valid-looking base32 secret", () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
    expect(secret.length).toBeGreaterThanOrEqual(32); // 160 bits, base32
  });

  it("produces a 6-digit code deterministically for a given secret + time", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    const t = Date.UTC(2026, 0, 1, 0, 0, 0);
    expect(totpAt(secret, t)).toMatch(/^\d{6}$/);
    expect(totpAt(secret, t)).toBe(totpAt(secret, t)); // deterministic
  });

  it("verifies the current code and rejects a wrong one", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2026, 0, 1, 0, 0, 0));
    const secret = generateTotpSecret();
    const code = totpAt(secret);
    expect(verifyTotp(secret, code)).toBe(true);
    expect(verifyTotp(secret, "000000")).toBe(false);
  });

  it("tolerates ±1 step (30s) of clock drift but rejects ±2 steps", () => {
    const secret = generateTotpSecret();
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2026, 0, 1, 0, 0, 0));
    const codeAtT0 = totpAt(secret);

    vi.setSystemTime(Date.UTC(2026, 0, 1, 0, 0, 31)); // +31s = next 30s step
    expect(verifyTotp(secret, codeAtT0)).toBe(true);

    vi.setSystemTime(Date.UTC(2026, 0, 1, 0, 1, 5)); // +65s = 2 steps later
    expect(verifyTotp(secret, codeAtT0)).toBe(false);
  });

  it("rejects malformed codes without throwing", () => {
    const secret = generateTotpSecret();
    expect(verifyTotp(secret, "abcdef")).toBe(false);
    expect(verifyTotp(secret, "12345")).toBe(false);
    expect(verifyTotp(secret, "")).toBe(false);
  });

  it("builds a standard otpauth:// enrollment URI", () => {
    const uri = otpauthUri("JBSWY3DPEHPK3PXP", "admin@example.com", "DeCA Fácil");
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain("secret=JBSWY3DPEHPK3PXP");
    expect(uri).toContain("algorithm=SHA1");
    expect(uri).toContain("digits=6");
    expect(uri).toContain("period=30");
  });
});
