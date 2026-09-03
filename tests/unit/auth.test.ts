import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword, isStrongEnough } from "@/lib/auth/password";
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
    expect(isStrongEnough("longenough")).toBe(true);
  });
});

describe("session token", () => {
  it("round-trips a uid", () => {
    const t = signSession("user-123");
    expect(verifySession(t)).toBe("user-123");
  });
  it("rejects a tampered token", () => {
    const t = signSession("user-123");
    const tampered = t.slice(0, -2) + "xy";
    expect(verifySession(tampered)).toBe(null);
  });
  it("rejects junk", () => {
    expect(verifySession(undefined)).toBe(null);
    expect(verifySession("not-a-token")).toBe(null);
    expect(verifySession("a.b")).toBe(null);
  });
});
