import { companyDataSchema, COMPANY_DATA_FIELDS } from "@/lib/validation/company";
import { isValidSpanishPostalCode, isValidPhone } from "@/lib/validation/spanish";

type CompanyLike = Partial<Record<(typeof COMPANY_DATA_FIELDS)[number], string | null | undefined>>;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * True when a company row carries every mandatory ficha field (#59).
 *
 * `strict` (default) runs the full `companyDataSchema`, including the CIF/NIF
 * checksum — this is the bar for a company registering ITSELF.
 *
 * The SOFT GATE for existing companies passes `strict: false`: it requires all
 * eight fields present and a well-formed postal code / email / phone, but
 * accepts any non-empty `name` / `nif`. A company created before #59 can have
 * a malformed identifier the owner CANNOT edit (it is locked, #59) — trapping
 * them behind a checksum they can't fix would be a defect. The superadmin
 * still corrects a bad identifier via `/admin/empresas/[id]` (#62).
 */
export function companyDataComplete(
  company: CompanyLike | null | undefined,
  strict = true,
): boolean {
  if (!company) return false;
  for (const key of COMPANY_DATA_FIELDS) {
    const v = company[key];
    if (v == null || String(v).trim() === "") return false;
  }
  if (strict) {
    return companyDataSchema.safeParse({ ...company }).success;
  }
  return (
    isValidSpanishPostalCode(String(company.postalCode)) &&
    isValidPhone(String(company.phone)) &&
    EMAIL_RE.test(String(company.email).trim())
  );
}

/** The mandatory fields still missing or malformed, for the "completa tus datos" UI. */
export function missingCompanyFields(
  company: CompanyLike | null | undefined,
  strict = true,
): string[] {
  if (!company) return [...COMPANY_DATA_FIELDS];
  const missing = new Set<string>();
  for (const key of COMPANY_DATA_FIELDS) {
    const v = company[key];
    if (v == null || String(v).trim() === "") missing.add(key);
  }
  const has = (k: string) => !missing.has(k);
  if (strict) {
    const parsed = companyDataSchema.safeParse({ ...company });
    if (!parsed.success) for (const i of parsed.error.issues) missing.add(String(i.path[0]));
  } else {
    if (has("postalCode") && !isValidSpanishPostalCode(String(company.postalCode)))
      missing.add("postalCode");
    if (has("phone") && !isValidPhone(String(company.phone))) missing.add("phone");
    if (has("email") && !EMAIL_RE.test(String(company.email).trim())) missing.add("email");
  }
  return [...missing];
}

/** Spanish labels for the mandatory-field keys — for user-facing messages. */
export const COMPANY_FIELD_LABELS: Record<string, string> = {
  name: "razón social",
  nif: "CIF/NIF",
  contactName: "persona de contacto",
  phone: "teléfono",
  email: "correo electrónico",
  address: "dirección",
  postalCode: "código postal",
  city: "población",
};

/** "código postal, población y teléfono" from a list of field keys. */
export function describeMissingFields(keys: string[]): string {
  const labels = keys.map((k) => COMPANY_FIELD_LABELS[k] ?? k);
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;
}
