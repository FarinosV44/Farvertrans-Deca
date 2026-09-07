import { describe, expect, it } from "vitest";
import { ANONYMIZED_USER_FIELDS, ANONYMIZED_COMPANY_FIELDS } from "@/lib/admin/anonymize-fields";

/**
 * #62 — the anonymisation field lists are a contract. It must clear every PII
 * column and NOTHING that belongs to the immutable legal record (a DeCA
 * version's `dataJson`, a `Deca`'s historical creator snapshot, an audit row).
 */
describe("anonymisation field contract (#62)", () => {
  it("clears the user's identifying/auth columns", () => {
    expect([...ANONYMIZED_USER_FIELDS].sort()).toEqual(
      ["email", "googleId", "passwordHash"].sort(),
    );
  });

  it("clears every company ficha PII column", () => {
    expect([...ANONYMIZED_COMPANY_FIELDS].sort()).toEqual(
      [
        "address",
        "city",
        "contactName",
        "email",
        "logoDataUri",
        "name",
        "nif",
        "phone",
        "postalCode",
      ].sort(),
    );
  });

  it("never lists a DeCA / audit / version field", () => {
    const all = [...ANONYMIZED_USER_FIELDS, ...ANONYMIZED_COMPANY_FIELDS];
    for (const forbidden of ["dataJson", "creatorName", "creatorEmail", "pdfSha256", "token"]) {
      expect(all).not.toContain(forbidden);
    }
  });
});
