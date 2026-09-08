import { describe, expect, it } from "vitest";
import {
  createTicketSchema,
  adminTicketUpdateSchema,
  SUPPORT_STATUSES,
} from "@/lib/support/schema";

describe("support ticket schema (#86 part 5)", () => {
  it("accepts a well-formed ticket", () => {
    const r = createTicketSchema.safeParse({
      category: "generacion",
      subject: "No genera el PDF",
      body: "Al pulsar GENERAR sale un error y no descarga nada.",
    });
    expect(r.success).toBe(true);
  });

  it("rejects a too-short subject or body, and an unknown category", () => {
    expect(
      createTicketSchema.safeParse({ category: "generacion", subject: "x", body: "x".repeat(20) })
        .success,
    ).toBe(false);
    expect(
      createTicketSchema.safeParse({ category: "generacion", subject: "Asunto ok", body: "corto" })
        .success,
    ).toBe(false);
    expect(
      createTicketSchema.safeParse({ category: "nope", subject: "Asunto ok", body: "x".repeat(20) })
        .success,
    ).toBe(false);
  });

  it("admin update needs at least a body or a status", () => {
    expect(adminTicketUpdateSchema.safeParse({}).success).toBe(false);
    expect(adminTicketUpdateSchema.safeParse({ status: "resolved" }).success).toBe(true);
    expect(adminTicketUpdateSchema.safeParse({ body: "hecho" }).success).toBe(true);
  });

  it("has the five states the issue asks for", () => {
    expect([...SUPPORT_STATUSES]).toEqual([
      "new",
      "in_review",
      "awaiting_user",
      "resolved",
      "closed",
    ]);
  });
});
