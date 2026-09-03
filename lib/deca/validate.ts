import { decaPayloadSchema, type DecaPayload } from "./schema";
import { checkNif } from "./nif";

/** Raised when a DeCA payload does not satisfy R-2. Generation must fail closed. */
export class DecaValidationError extends Error {
  constructor(
    public readonly fieldErrors: Record<string, string[]>,
    message = "El DeCA no cumple los requisitos obligatorios",
  ) {
    super(message);
    this.name = "DecaValidationError";
  }
}

export type ValidatedDeca = {
  data: DecaPayload;
  /** Soft, non-blocking notices (e.g. a NIF that does not match the Spanish format). */
  warnings: string[];
};

/**
 * Full compliance validation (R-2). Throws {@link DecaValidationError} on any
 * missing/invalid mandatory field. NIF format issues are returned as warnings,
 * never as errors — foreign operators are valid.
 */
export function validateDeca(input: unknown): ValidatedDeca {
  const parsed = decaPayloadSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    throw new DecaValidationError(fieldErrors);
  }

  const data = parsed.data;
  const warnings: string[] = [];

  for (const [label, nif] of [
    ["cargador", data.shipper.nif],
    ["transportista", data.carrier.nif],
  ] as const) {
    const c = checkNif(nif);
    if (!c.valid) {
      warnings.push(
        `El NIF del ${label} (${c.normalized}) no tiene el formato español habitual. Es válido si el operador es extranjero.`,
      );
    }
  }

  // If a trailer plate is given it should not equal the tractor plate.
  if (data.trailerPlate && data.trailerPlate === data.tractorPlate) {
    warnings.push("La matrícula del remolque coincide con la de la tractora.");
  }

  return { data, warnings };
}
