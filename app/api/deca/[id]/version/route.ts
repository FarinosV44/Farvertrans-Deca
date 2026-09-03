import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { validateDeca, DecaValidationError } from "@/lib/deca/validate";
import { correctDeca, DecaCorrectionError } from "@/lib/deca/persist";

export const runtime = "nodejs";

const schema = z.object({
  changeReason: z.string().trim().min(3).max(500),
  payload: z.unknown(),
});

/** Correct a DeCA → new version (R-13). Authenticated owner only. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "bad_input", message: "Falta el motivo o los datos de la corrección." } },
      { status: 422 },
    );
  }

  let validated;
  try {
    validated = validateDeca(parsed.data.payload);
  } catch (e) {
    if (e instanceof DecaValidationError) {
      return NextResponse.json(
        { error: { code: "validation", message: e.message, fields: e.fieldErrors } },
        { status: 422 },
      );
    }
    throw e;
  }

  try {
    const r = await correctDeca(id, user.companyId, validated, parsed.data.changeReason);
    return NextResponse.json({ ...r, warnings: validated.warnings }, { status: 201 });
  } catch (e) {
    if (e instanceof DecaCorrectionError) {
      const status = e.code === "not_found" ? 404 : e.code === "forbidden" ? 403 : 422;
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status });
    }
    console.error("[deca] correction failed", e);
    return NextResponse.json(
      {
        error: {
          code: "internal",
          message: "No se pudo guardar la corrección. Inténtalo de nuevo.",
        },
      },
      { status: 500 },
    );
  }
}
