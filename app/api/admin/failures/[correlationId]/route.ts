import { NextResponse } from "next/server";
import { isInternalRequest } from "@/lib/admin/guard";
import { failureTriageSchema, triageFailure } from "@/lib/admin/failures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Triage a classified generation failure (ADMIN #33 §7): toggle resolved, add an
 * internal note. Internal session or `x-fvd-admin-token` only — 404 otherwise,
 * so the route is not discoverable. Never edits the failure record itself.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ correlationId: string }> },
) {
  if (!(await isInternalRequest(req.headers))) {
    return new NextResponse("Not found", { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "bad_request", message: "Cuerpo no válido." } },
      { status: 400 },
    );
  }

  const parsed = failureTriageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "validation", message: "Datos de triaje no válidos." } },
      { status: 422 },
    );
  }

  const { correlationId } = await params;
  const updated = await triageFailure(correlationId, parsed.data);
  if (!updated) {
    return NextResponse.json(
      { error: { code: "not_found", message: "No existe ese código de correlación." } },
      { status: 404 },
    );
  }

  return NextResponse.json({
    correlationId: updated.correlationId,
    resolved: !!updated.resolvedAt,
    note: updated.note ?? "",
  });
}
