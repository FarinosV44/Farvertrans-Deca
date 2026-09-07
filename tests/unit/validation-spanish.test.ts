import { describe, expect, it } from "vitest";
import { isValidSpanishPostalCode, isValidPhone, isValidOwnNif } from "@/lib/validation/spanish";

describe("isValidSpanishPostalCode (#59)", () => {
  it("accepts a real 5-digit code with a province prefix 01–52", () => {
    for (const cp of ["28001", "08015", "46540", "01001", "52001"]) {
      expect(isValidSpanishPostalCode(cp), cp).toBe(true);
    }
  });
  it("rejects wrong length, non-digits and out-of-range provinces", () => {
    for (const cp of ["2801", "280012", "abcde", "00123", "53001", "99999", ""]) {
      expect(isValidSpanishPostalCode(cp), cp).toBe(false);
    }
  });
});

describe("isValidPhone (#59)", () => {
  it("accepts Spanish national numbers and explicit international form", () => {
    for (const p of ["607527719", "607 52 77 19", "911234567", "+34607527719", "+441632960961"]) {
      expect(isValidPhone(p), p).toBe(true);
    }
  });
  it("rejects too short, letters, and national numbers with a bad leading digit", () => {
    for (const p of ["12345", "60752771", "6075277199", "123456789", "phone", ""]) {
      expect(isValidPhone(p), p).toBe(false);
    }
  });
});

describe("isValidOwnNif (#59 — hard gate for our own company)", () => {
  it("accepts a valid CIF / DNI / NIE with a correct control character", () => {
    expect(isValidOwnNif("B21810452")).toBe(true); // PRAETORIA, S.L. (lib/legal-entity.ts)
    expect(isValidOwnNif("12345678Z")).toBe(true);
    expect(isValidOwnNif("X1234567L")).toBe(true);
  });
  it("rejects a bad checksum and an unrecognised shape (unlike the wizard's soft warning)", () => {
    expect(isValidOwnNif("B21810453")).toBe(false); // wrong control
    expect(isValidOwnNif("12345678A")).toBe(false); // wrong DNI letter
    expect(isValidOwnNif("NOTANIF")).toBe(false);
    expect(isValidOwnNif("")).toBe(false);
  });
});
