import { describe, expect, it } from "vitest";
import { safeInternalPath } from "@/lib/auth/safe-redirect";

describe("safeInternalPath (AUTH #38 — post-auth redirect safety)", () => {
  it("keeps a plain internal path", () => {
    expect(safeInternalPath("/panel")).toBe("/panel");
    expect(safeInternalPath("/panel/historico?from=2026-01-01")).toBe(
      "/panel/historico?from=2026-01-01",
    );
    expect(safeInternalPath("/panel/deca/abc123")).toBe("/panel/deca/abc123");
  });

  it("falls back when absent or empty", () => {
    expect(safeInternalPath(null)).toBe("/panel");
    expect(safeInternalPath(undefined)).toBe("/panel");
    expect(safeInternalPath("")).toBe("/panel");
    expect(safeInternalPath("  ", "/x")).toBe("/x");
  });

  it("rejects open-redirect and injection attempts", () => {
    for (const bad of [
      "//evil.com",
      "https://evil.com",
      "http://evil.com",
      "/\\evil.com",
      "/\tevil",
      "/ /evil",
      "javascript:alert(1)",
      "/panel\\@evil.com",
      "//evil.com/panel",
      "relative/path",
      " /panel/../../etc",
    ]) {
      expect(safeInternalPath(bad), bad).toBe("/panel");
    }
  });

  it("never bounces back into an auth screen or the API", () => {
    expect(safeInternalPath("/entrar")).toBe("/panel");
    expect(safeInternalPath("/registro?invite=x")).toBe("/panel");
    expect(safeInternalPath("/recuperar")).toBe("/panel");
    expect(safeInternalPath("/api/auth/logout")).toBe("/panel");
  });
});
