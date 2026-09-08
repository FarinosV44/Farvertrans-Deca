import { describe, expect, it } from "vitest";
import { savedCompanySchema } from "@/lib/data/saved-schema";

describe("savedCompanySchema — #85 postal code + city", () => {
  const base = { name: "Cargas del Turia SL", nif: "B96789011", address: "Av. del Puerto 120" };

  it("accepts and keeps postalCode + city", () => {
    const d = savedCompanySchema.parse({ ...base, postalCode: " 46023 ", city: " Valencia " });
    expect(d.postalCode).toBe("46023");
    expect(d.city).toBe("Valencia");
  });

  it("leaves them empty when omitted (optional, like the DeCA party)", () => {
    const d = savedCompanySchema.parse(base);
    expect(d.postalCode).toBe("");
    expect(d.city).toBe("");
  });

  it("rejects an over-long postal code", () => {
    expect(savedCompanySchema.safeParse({ ...base, postalCode: "x".repeat(13) }).success).toBe(
      false,
    );
  });
});
