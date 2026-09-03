import { describe, expect, it } from "vitest";
import { z } from "zod";

// Mirrors lib/env.ts serverSchema shape for isolated testing of the parsing rules.
const schema = z.object({
  NEXT_PUBLIC_FVD_BASE_URL: z.string().url(),
  FVD_HASH_SECRET: z.string().min(16),
  FVD_DEBUG: z
    .string()
    .optional()
    .default("0")
    .transform((v) => v === "1" || v === "true"),
});

describe("environment parsing rules", () => {
  it("rejects a non-URL base url", () => {
    const r = schema.safeParse({ NEXT_PUBLIC_FVD_BASE_URL: "not-a-url", FVD_HASH_SECRET: "x".repeat(16) });
    expect(r.success).toBe(false);
  });

  it("rejects a short hash secret", () => {
    const r = schema.safeParse({
      NEXT_PUBLIC_FVD_BASE_URL: "https://deca.example.es",
      FVD_HASH_SECRET: "tooshort",
    });
    expect(r.success).toBe(false);
  });

  it("coerces FVD_DEBUG to a boolean and defaults it off", () => {
    const on = schema.parse({
      NEXT_PUBLIC_FVD_BASE_URL: "https://deca.example.es",
      FVD_HASH_SECRET: "x".repeat(16),
      FVD_DEBUG: "1",
    });
    const off = schema.parse({
      NEXT_PUBLIC_FVD_BASE_URL: "https://deca.example.es",
      FVD_HASH_SECRET: "x".repeat(16),
    });
    expect(on.FVD_DEBUG).toBe(true);
    expect(off.FVD_DEBUG).toBe(false);
  });
});
