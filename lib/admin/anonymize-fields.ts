/**
 * The columns each entity's anonymisation clears (#62). A plain module so the
 * contract can be unit-tested without pulling in the server-only data layer.
 * NOTHING here may name a `Deca` / `DecaVersion` / `SecurityAuditLog` field —
 * the legal document trail and the audit trail are never destroyed (D-067).
 */
export const ANONYMIZED_USER_FIELDS = ["email", "passwordHash", "googleId"] as const;

export const ANONYMIZED_COMPANY_FIELDS = [
  "name",
  "nif",
  "address",
  "postalCode",
  "city",
  "contactName",
  "phone",
  "email",
  "logoDataUri",
] as const;
