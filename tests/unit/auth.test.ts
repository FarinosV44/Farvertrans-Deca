import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword, isStrongEnough } from "@/lib/auth/password";
import { checkPasswordStrength } from "@/lib/auth/password-policy";
import { signSession, verifySession } from "@/lib/auth/session";

describe("password hashing", () => {
  it("verifies the correct password and rejects the wrong one", () => {
    const stored = hashPassword("correct horse battery");
    expect(verifyPassword("correct horse battery", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });
  it("produces a different salt each time", () => {
    expect(hashPassword("x").split("$")[1]).not.toBe(hashPassword("x").split("$")[1]);
  });
  it("rejects a malformed stored value without throwing", () => {
    expect(verifyPassword("x", "garbage")).toBe(false);
    expect(verifyPassword("x", "")).toBe(false);
  });
  it("enforces a minimum length", () => {
    expect(isStrongEnough("short")).toBe(false);
    expect(isStrongEnough("Longenough123!")).toBe(true);
  });
});

describe("password strength policy (SECURITY #53)", () => {
  it("requires at least 12 characters", () => {
    expect(checkPasswordStrength("Ab1!Ab1!Ab1").ok).toBe(false); // 11 chars
    expect(checkPasswordStrength("Ab1!Ab1!Ab1!").ok).toBe(true); // 12 chars
  });
  it("requires upper, lower, digit and a special character", () => {
    expect(checkPasswordStrength("alllowercase123!").ok).toBe(false);
    expect(checkPasswordStrength("ALLUPPERCASE123!").ok).toBe(false);
    expect(checkPasswordStrength("NoDigitsHere!!!!").ok).toBe(false);
    expect(checkPasswordStrength("NoSpecialChar1234").ok).toBe(false);
    expect(checkPasswordStrength("ValidPassw0rd!").ok).toBe(true);
  });
  it("accepts a long passphrase with no artificially low maximum", () => {
    const passphrase = "Correct-Horse-Battery-Staple-9!".repeat(3); // 96 chars
    expect(checkPasswordStrength(passphrase).ok).toBe(true);
  });
  it("rejects a common padded password", () => {
    expect(checkPasswordStrength("Passw0rd!2025").ok).toBe(false);
  });
  it("rejects a password equal to the account's email or company name (even if otherwise strong)", () => {
    // Passes length/complexity on its own — must be rejected only because it
    // matches the email/company, proving that branch (not just the earlier ones) runs.
    expect(checkPasswordStrength("Str0ng!Value", { email: "Str0ng!Value" }).ok).toBe(false);
    expect(checkPasswordStrength("Str0ng!Value", { companyName: "str0ng!value" }).ok).toBe(false);
    expect(checkPasswordStrength("Str0ng!Value", { email: "someone@else.com" }).ok).toBe(true);
  });
});

describe("session token", () => {
  it("round-trips a uid and session version", () => {
    const t = signSession("user-123", 1);
    expect(verifySession(t)).toEqual(expect.objectContaining({ uid: "user-123", sv: 1 }));
  });
  it("rejects a tampered token", () => {
    const t = signSession("user-123", 1);
    const tampered = t.slice(0, -2) + "xy";
    expect(verifySession(tampered)).toBe(null);
  });
  it("rejects junk", () => {
    expect(verifySession(undefined)).toBe(null);
    expect(verifySession("not-a-token")).toBe(null);
    expect(verifySession("a.b")).toBe(null);
  });
  it("a token signed at an older session version is still well-formed (caller compares sv itself)", () => {
    const t = signSession("user-123", 3);
    const payload = verifySession(t);
    expect(payload?.sv).toBe(3);
  });
});
