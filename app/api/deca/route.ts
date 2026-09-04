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
    const { recordGenerationFailure } = await import("@/lib/deca/failures");
    const recorded = await recordGenerationFailure(e, {
      route: "POST /api/deca (validation)",
      authenticated: false,
    });
    return NextResponse.json(
      {
        error: {
          code: "generation_failed",
          message: recorded.message,
          correlationId: recorded.correlationId,
          retryable: true,
        },
      },
      { status: 500 },
    );
  }

  const idempotencyKey = req.headers.get("idempotency-key") ?? undefined;

  // An authenticated caller owns the DeCA directly (no claim token needed).
  let owner: { createdByUserId: string; companyId: string } | undefined;
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (user?.companyId) owner = { createdByUserId: user.id, companyId: user.companyId };
  } catch {
    // not authed — anonymous path
  }

  // An idempotent replay (the wizard retries a failed generation with the SAME
  // key, D-029) must never be rate-limited: it creates nothing, it only returns
  // the document that already exists. Checking it before the abuse gate means a
  // user recovering from a transient failure can't be thrown a 429 (#29).
  let idempotentReplay = false;
  if (idempotencyKey) {
    const { prisma } = await import("@/lib/prisma");
    idempotentReplay = !!(await prisma.deca.findUnique({
      where: { idempotencyKey },
      select: { id: true },
    }));
  }

  // Abuse controls apply to ANONYMOUS creation only — a signed-in company is
  // already accountable. A first-time user never crosses the soft threshold.
  if (!owner && !idempotentReplay) {
    const { checkAbuse } = await import("@/lib/abuse");
    const { abuseResponse } = await import("@/lib/abuse/response");
    const decision = await checkAbuse("anon_create", req.headers, {
      fingerprint: req.headers.get("x-fvd-fp"),
      challengeToken: req.headers.get("x-fvd-challenge"),
    });
    const blocked = abuseResponse(decision);
    if (blocked) return blocked;
  }

  try {
    const { createDeca } = await import("@/lib/deca/persist");
    const created = await createDeca(validated, { idempotencyKey, ...owner });
    return NextResponse.json(
      {
        decaId: created.decaId,
        token: created.token,
        pdfSha256: created.pdfSha256,
        firstForCompany: created.firstForCompany,
        claimToken: created.claimToken || undefined,
        claimExpiresAt: created.claimToken ? created.claimExpiresAt.toISOString() : undefined,
        warnings: validated.warnings,
      },
      { status: 201 },
    );
  } catch (e) {
    // Stage-aware failure (#29): the client gets a calm message plus a short
    // correlation code; the stage itself is exposed only when FVD_DEBUG is on.
    const { recordGenerationFailure } = await import("@/lib/deca/failures");
    const recorded = await recordGenerationFailure(e, {
      route: "POST /api/deca",
      authenticated: !!owner,
      companyId: owner?.companyId,
    });
    return NextResponse.json(
      {
        error: {
          code: "generation_failed",
          message: recorded.message,
          correlationId: recorded.correlationId,
          retryable: true,
          ...(process.env.FVD_DEBUG === "1" ? { stage: recorded.stage } : {}),
        },
      },
      { status: 500 },
    );
  }
}
