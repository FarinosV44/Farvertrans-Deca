import { describe, expect, it } from "vitest";
import { upperText, upperTextOrEmpty } from "@/lib/text/normalize";

describe("upperText / upperTextOrEmpty (#86 part 3)", () => {
  it("uppercases and trims, preserving Spanish accents and ñ", () => {
    expect(upperText("  Logística Peñaranda s.l.  ")).toBe("LOGÍSTICA PEÑARANDA S.L.");
    expect(upperText("camión")).toBe("CAMIÓN");
  });

  it("upperTextOrEmpty passes an empty / whitespace-only value through unchanged", () => {
    expect(upperTextOrEmpty("")).toBe("");
    expect(upperTextOrEmpty("   ")).toBe("");
    expect(upperTextOrEmpty(" ana ")).toBe("ANA");
  });

  it("is a no-op on an already-uppercase value", () => {
    expect(upperText("MADRID")).toBe("MADRID");
  });
});
