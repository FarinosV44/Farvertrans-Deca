import { z } from "zod";
import { isValidPostalCode, isValidPhone, isValidOwnNif } from "./spanish";

/**
 * The one schema for a complete company ficha (#59). Every "our own company"
 * surface validates against this: the registration route, the Google
 * complete-company route, the owner's `/panel/empresa` edit, and the
 * superadmin edit. Before #59 each of those redefined its own partial rules.
 *
 * The DB columns stay nullable (existing rows) — "mandatory" is enforced
 * here, in the app, and existing companies are brought up to date through the
 * soft gate (`lib/company/completeness.ts`), not a destructive migration.
 */

const trimmed = (min: number, max: number, msg: string) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(min, msg).max(max));

export const companyDataSchema = z.object({
  name: trimmed(2, 200, "Indica el nombre o razón social"),
  nif: trimmed(3, 20, "Indica el CIF/NIF").refine(isValidOwnNif, "El CIF/NIF no es válido"),
  contactName: trimmed(2, 120, "Indica la persona de contacto"),
  phone: trimmed(7, 20, "Indica el teléfono").refine(
    isValidPhone,
    "El teléfono no tiene un formato válido",
  ),
  email: z.string().trim().max(160).email("El correo electrónico no es válido"),
  address: trimmed(4, 300, "Indica la dirección"),
  postalCode: trimmed(3, 12, "Indica el código postal").refine(
    isValidPostalCode,
    "El código postal no es válido",
  ),
  city: trimmed(2, 120, "Indica la población"),
});

export type CompanyData = z.infer<typeof companyDataSchema>;

/** The field keys a complete ficha needs — used by the soft-gate check. */
export const COMPANY_DATA_FIELDS = [
  "name",
  "nif",
  "contactName",
  "phone",
  "email",
  "address",
  "postalCode",
  "city",
] as const;
