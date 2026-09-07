import { describe, expect, it } from "vitest";
import { companyDataSchema } from "@/lib/validation/company";
import {
  companyDataComplete,
  missingCompanyFields,
  describeMissingFields,
} from "@/lib/company/completeness";

const valid = {
  name: "Transportes Ejemplo SL",
  nif: "B21810452",
  contactName: "Ana García",
  phone: "607527719",
  email: "ana@ejemplo.es",
  address: "Calle Mayor 1",
  postalCode: "46540",
  city: "El Puig",
};

describe("companyDataSchema (#59)", () => {
  it("accepts a complete, well-formed ficha and trims whitespace", () => {
    const r = companyDataSchema.safeParse({ ...valid, name: "  Transportes Ejemplo SL  " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe("Transportes Ejemplo SL");
  });
  it("rejects each mandatory field when missing", () => {
    for (const k of Object.keys(valid)) {
      const r = companyDataSchema.safeParse({ ...valid, [k]: "" });
      expect(r.success, k).toBe(false);
    }
  });
  it("rejects an invalid CIF, postal code, phone and email", () => {
    expect(companyDataSchema.safeParse({ ...valid, nif: "B21810453" }).success).toBe(false);
    expect(companyDataSchema.safeParse({ ...valid, postalCode: "99999" }).success).toBe(false);
    expect(companyDataSchema.safeParse({ ...valid, phone: "123" }).success).toBe(false);
    expect(companyDataSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });
});

describe("companyDataComplete / missingCompanyFields (#59 soft gate)", () => {
  it("is true only for a fully valid company", () => {
    expect(companyDataComplete(valid)).toBe(true);
    expect(missingCompanyFields(valid)).toEqual([]);
  });
  it("is false and lists the gaps for a legacy row", () => {
    const legacy = { name: "Vieja SL", nif: "B21810452" };
    expect(companyDataComplete(legacy)).toBe(false);
    expect(missingCompanyFields(legacy).sort()).toEqual(
      ["address", "city", "contactName", "email", "phone", "postalCode"].sort(),
    );
  });
  it("is false for null / undefined", () => {
    expect(companyDataComplete(null)).toBe(false);
    expect(companyDataComplete(undefined)).toBe(false);
  });
});

describe("soft gate is lenient on a locked, pre-#59 identifier (#59 bug fix)", () => {
  // A company created before #59 with a garbage NIF the owner CANNOT edit.
  const preExisting = { ...valid, nif: "praetoria sl" };

  it("strict still rejects the invalid NIF (new-registration bar)", () => {
    expect(companyDataComplete(preExisting, true)).toBe(false);
    expect(missingCompanyFields(preExisting, true)).toContain("nif");
  });

  it("the soft gate (strict:false) passes once every editable field is filled", () => {
    expect(companyDataComplete(preExisting, false)).toBe(true);
    expect(missingCompanyFields(preExisting, false)).toEqual([]);
  });

  it("the soft gate still catches a genuinely missing / malformed editable field", () => {
    expect(companyDataComplete({ ...preExisting, postalCode: "99999" }, false)).toBe(false);
    expect(missingCompanyFields({ ...preExisting, phone: "" }, false)).toContain("phone");
    expect(missingCompanyFields({ ...preExisting, city: "" }, false)).toContain("city");
  });

  it("describeMissingFields is a readable Spanish list, not a fixed string", () => {
    expect(describeMissingFields(["postalCode"])).toBe("código postal");
    expect(describeMissingFields(["postalCode", "city"])).toBe("código postal y población");
    expect(describeMissingFields(["phone", "email", "city"])).toBe(
      "teléfono, correo electrónico y población",
    );
  });
});
