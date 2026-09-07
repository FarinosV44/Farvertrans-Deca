import { companyDataSchema, COMPANY_DATA_FIELDS } from "@/lib/validation/company";

type CompanyLike = Partial<Record<(typeof COMPANY_DATA_FIELDS)[number], string | null | undefined>>;

/**
 * True when a company row carries every mandatory ficha field AND they are
 * well-formed (#59). Drives the soft gate: an existing company with gaps is
 * asked to complete its data before it can create a new DeCA, but is never
 * blocked from logging in or from its already-issued documents.
 */
export function companyDataComplete(company: CompanyLike | null | undefined): boolean {
  if (!company) return false;
  const candidate: Record<string, unknown> = {};
  for (const key of COMPANY_DATA_FIELDS) {
    const value = company[key];
    if (value == null || value === "") return false;
    candidate[key] = value;
  }
  return companyDataSchema.safeParse(candidate).success;
}

/** The mandatory fields that are missing or malformed, for the "completa tus datos" UI. */
export function missingCompanyFields(company: CompanyLike | null | undefined): string[] {
  if (!company) return [...COMPANY_DATA_FIELDS];
  const candidate: Record<string, unknown> = {};
  for (const key of COMPANY_DATA_FIELDS) candidate[key] = company[key] ?? "";
  const parsed = companyDataSchema.safeParse(candidate);
  if (parsed.success) return [];
  return [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
}
