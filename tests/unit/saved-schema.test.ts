import { describe, expect, it } from "vitest";
import { savedCompanySchema } from "@/lib/data/saved-schema";

describe("savedCompanySchema — postal code + city (#85 added, #86 made mandatory)", () => {
  const base = { name: "Cargas del Turia SL", nif: "B96789011", address: "Av. del Puerto 120" };

  it("accepts, trims and uppercases postalCode + city (#86 p3)", () => {
    const d = savedCompanySchema.parse({ ...base, postalCode: " 46023 ", city: " Valencia " });
    expect(d.postalCode).toBe("46023");
    expect(d.city).toBe("VALENCIA");
    expect(d.name).toBe("CARGAS DEL TURIA SL");
  });

  it("rejects a company with no postal code (#86 part 2 — mandatory)", () => {
    const r = savedCompanySchema.safeParse({ ...base, city: "Valencia" });
    expect(r.success).toBe(false);
  });

  it("rejects a company with no city (#86 part 2 — mandatory)", () => {
    const r = savedCompanySchema.safeParse({ ...base, postalCode: "46023" });
    expect(r.success).toBe(false);
  });

  it("rejects an over-long postal code", () => {
    expect(
      savedCompanySchema.safeParse({ ...base, postalCode: "x".repeat(13), city: "Valencia" })
        .success,
    ).toBe(false);
  });
});
