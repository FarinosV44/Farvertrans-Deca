import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { operatorLink, operatorSchema } from "@/lib/admin/operators";

describe("operators (#86 part 8)", () => {
  it("builds the individual acquisition link", () => {
    expect(operatorLink("ADRIAN9K")).toContain("/registro?ref=ADRIAN9K");
  });

  it("requires a name, accepts optional contact fields, rejects a bad email", () => {
    expect(operatorSchema.safeParse({ name: "Adrián" }).success).toBe(true);
    expect(operatorSchema.safeParse({ name: "A" }).success).toBe(false);
    expect(operatorSchema.safeParse({ name: "Adrián", email: "nope" }).success).toBe(false);
    expect(
      operatorSchema.safeParse({ name: "Adrián", email: "a@b.example", phone: "600 11 22 33" })
        .success,
    ).toBe(true);
  });
});
