import { describe, expect, it } from "vitest";
import { looksLikeProduction, restoreAllowed } from "@/lib/backup/target.mjs";

describe("restore target guard (#60)", () => {
  it("flags a Supabase pooler / production host", () => {
    expect(
      looksLikeProduction("postgresql://x:y@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"),
    ).toBe(true);
    expect(looksLikeProduction("postgresql://x:y@db.abc.supabase.co:5432/postgres")).toBe(true);
  });

  it("does not flag a local / scratch host", () => {
    expect(looksLikeProduction("postgresql://postgres:postgres@localhost:5432/scratch")).toBe(
      false,
    );
    expect(looksLikeProduction("postgresql://u:p@127.0.0.1:5433/deca_restore_test")).toBe(false);
  });

  it("refuses a production restore unless BOTH the flag and the env acknowledgement are set", () => {
    const prod = "postgresql://x@pooler.supabase.com/postgres";
    expect(restoreAllowed(prod, {}).allowed).toBe(false);
    expect(restoreAllowed(prod, { forceFlag: true }).allowed).toBe(false);
    expect(restoreAllowed(prod, { understand: "overwrite-production" }).allowed).toBe(false);
    expect(
      restoreAllowed(prod, { forceFlag: true, understand: "overwrite-production" }).allowed,
    ).toBe(true);
  });

  it("always allows a scratch target", () => {
    expect(restoreAllowed("postgresql://postgres@localhost/scratch", {}).allowed).toBe(true);
  });
});
