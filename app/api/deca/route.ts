import { NextResponse } from "next/server";
import { validateDeca, DecaValidationError } from "@/lib/deca/validate";

export const runtime = "nodejs";

/**
 * Create a DeCA (F1). Validates the payload against R-2, persists the document
 * and its first version, and returns the ids + public token + (for anonymous
 * callers) the 30-day claim token.
 *
 * Fails closed: any validation, persistence or (BUILD 08) render/storage failure
 * returns an error and creates nothing usable.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "bad_request", message: "Cuerpo de la petición no válido." } },
      { status: 400 },
    );
  }

  let validated;
  try {
    validated = validateDeca(body);
  } catch (e) {
    if (e instanceof DecaValidationError) {
      return NextResponse.json(
        { error: { code: "validation", message: e.message, fields: e.fieldErrors } },
        { status: 422 },
      );
    }
    return NextResponse.json(
      { error: { code: "internal", message: "No se pudo generar el DeCA. Inténtalo de nuevo." } },
      { status: 500 },
    );
  }

  const idempotencyKey = req.headers.get("idempotency-key") ?? undefined;

  try {
    const { createDeca } = await import("@/lib/deca/persist");
    const created = await createDeca(validated, { idempotencyKey });
    return NextResponse.json(
      {
        decaId: created.decaId,
        token: created.token,
        claimToken: created.claimToken || undefined,
        claimExpiresAt: created.claimToken ? created.claimExpiresAt.toISOString() : undefined,
        warnings: validated.warnings,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("[deca] generation failed", e);
    return NextResponse.json(
      { error: { code: "internal", message: "No se pudo generar el DeCA. Inténtalo de nuevo." } },
      { status: 500 },
    );
  }
}
