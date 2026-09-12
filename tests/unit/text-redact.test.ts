import { describe, expect, it } from "vitest";
import { redactPii } from "@/lib/text/redact";

describe("redactPii (#127 — shared log-redaction helper)", () => {
  it("redacts an email address", () => {
    expect(redactPii("failed for chofer@empresa.es")).toBe("failed for [redacted]");
  });

  it("redacts a long digit run (NIF/CIF/phone/token-shaped)", () => {
    expect(redactPii("NIF B12345678 rejected")).toBe("NIF [redacted] rejected");
  });

  it("redacts multiple occurrences of both kinds in one string", () => {
    expect(redactPii("user chofer@empresa.es phone 612345678 nif B12345678")).toBe(
      "user [redacted] phone [redacted] nif [redacted]",
    );
  });

  it("leaves ordinary short text untouched", () => {
    expect(redactPii("Documento no encontrado.")).toBe("Documento no encontrado.");
  });
});
