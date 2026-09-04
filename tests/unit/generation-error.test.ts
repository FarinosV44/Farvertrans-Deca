import { describe, expect, it } from "vitest";
import {
  GENERATION_STAGES,
  GenerationError,
  classifyError,
  newCorrelationId,
  safeErrorSummary,
  stageMessage,
} from "@/lib/deca/generation";
import { DecaValidationError } from "@/lib/deca/validate";
import { StorageError } from "@/lib/storage/errors";

describe("newCorrelationId", () => {
  it("is 6 unambiguous uppercase characters", () => {
    for (let i = 0; i < 50; i++) {
      expect(newCorrelationId()).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
    }
  });

  it("is not repeated across calls", () => {
    const ids = new Set(Array.from({ length: 200 }, () => newCorrelationId()));
    expect(ids.size).toBeGreaterThan(190);
  });
});

describe("GenerationError", () => {
  it("carries the stage and the correlation id, and keeps the cause", () => {
    const cause = new Error("boom");
    const e = new GenerationError("pdf_storage", cause, "ABC234");
    expect(e).toBeInstanceOf(Error);
    expect(e.stage).toBe("pdf_storage");
    expect(e.correlationId).toBe("ABC234");
    expect(e.cause).toBe(cause);
    expect(e.name).toBe("GenerationError");
  });

  it("mints a correlation id when none is given", () => {
    expect(new GenerationError("database", new Error("x")).correlationId).toMatch(/^[A-Z2-9]{6}$/);
  });
});

describe("classifyError", () => {
  it("returns the stage of an already-classified GenerationError", () => {
    expect(classifyError(new GenerationError("pdf_render", new Error("x")))).toBe("pdf_render");
  });

  it("classifies a DeCA validation failure", () => {
    expect(classifyError(new DecaValidationError({}, "no"))).toBe("validation");
  });

  it("classifies a storage failure", () => {
    expect(classifyError(new StorageError("bucket not found"))).toBe("pdf_storage");
  });

  it("classifies an environment/configuration failure", () => {
    expect(classifyError(new Error("Invalid environment configuration:\n  - DATABASE_URL"))).toBe(
      "configuration",
    );
  });

  it("classifies Prisma connectivity and schema failures as database", () => {
    const cannotReach = Object.assign(new Error("Can't reach database server"), {
      name: "PrismaClientInitializationError",
      code: "P1001",
    });
    const missingTable = Object.assign(new Error("The table `public.deca` does not exist"), {
      name: "PrismaClientKnownRequestError",
      code: "P2021",
    });
    expect(classifyError(cannotReach)).toBe("database");
    expect(classifyError(missingTable)).toBe("database");
  });

  it("classifies a PDF/font render failure", () => {
    expect(classifyError(new Error("fontkit: unknown font format"))).toBe("pdf_render");
  });

  it("falls back to unknown", () => {
    expect(classifyError(new Error("something else entirely"))).toBe("unknown");
    expect(classifyError("a string")).toBe("unknown");
    expect(classifyError(undefined)).toBe("unknown");
  });

  it("only ever returns a declared stage", () => {
    for (const e of [new Error("x"), "y", null, 42]) {
      expect(GENERATION_STAGES).toContain(classifyError(e));
    }
  });
});

describe("safeErrorSummary", () => {
  it("reports the error class and a truncated message", () => {
    const s = safeErrorSummary(new StorageError("x".repeat(500)));
    expect(s.errorClass).toBe("StorageError");
    expect(s.message.length).toBeLessThanOrEqual(200);
  });

  it("redacts emails and long identifier runs so no PII is logged", () => {
    const s = safeErrorSummary(new Error("failed for chofer@empresa.es with NIF B12345678"));
    expect(s.message).not.toContain("chofer@empresa.es");
    expect(s.message).not.toContain("B12345678");
    expect(s.message).toContain("[redacted]");
  });

  it("handles non-Error throwables", () => {
    expect(safeErrorSummary("plain string").errorClass).toBe("string");
    expect(safeErrorSummary(null).errorClass).toBe("unknown");
  });
});

describe("stageMessage", () => {
  it("gives a calm Spanish message for every stage, never the raw error", () => {
    for (const stage of GENERATION_STAGES) {
      const m = stageMessage(stage);
      expect(m.length).toBeGreaterThan(10);
      expect(m).not.toMatch(/error:|stack|prisma/i);
    }
  });
});
