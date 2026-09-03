import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { pdfSha256 } from "@/lib/storage/hash";

describe("pdfSha256", () => {
  it("is the lowercase-hex SHA-256 of the bytes", () => {
    const bytes = Buffer.from("%PDF-1.3 fake");
    const expected = createHash("sha256").update(bytes).digest("hex");
    expect(pdfSha256(bytes)).toBe(expected);
    expect(pdfSha256(bytes)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic and content-addressed (different bytes → different hash)", () => {
    const a = pdfSha256(Buffer.from("version 1"));
    const b = pdfSha256(Buffer.from("version 2"));
    expect(a).not.toBe(b);
    expect(pdfSha256(Buffer.from("version 1"))).toBe(a);
  });

  it("accepts a Uint8Array too", () => {
    const u8 = new Uint8Array([1, 2, 3, 4]);
    expect(pdfSha256(u8)).toBe(pdfSha256(Buffer.from(u8)));
  });
});
