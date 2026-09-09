import { NextResponse } from "next/server";
import { z } from "zod";
import { getInternalUser, requireStepUp, StepUpRequiredError } from "@/lib/admin/guard";
import { setUserStatus, reassignUserToCompany, LifecycleError } from "@/lib/admin/lifecycle";
import { anonymizeUser, AnonymizeError } from "@/lib/admin/anonymize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.enum(["block", "deactivate", "reactivate"]),
    reason: z.string().trim().max(300).optional(),
  }),
  z.object({ action: z.literal("anonymize"), confirm: z.string() }),
  // #102 recovery tool: reassociate an existing user to an existing company,
  // audited — for the case Membership was already the right fix for, and any
  // future one shaped like it. Never creates a company, never touches any
  // OTHER membership the user holds.
  z.object({
    action: z.literal("reassign"),
    companyId: z.string().min(1),
    role: z.enum(["owner", "member", "read_only"]),
    reason: z.string().trim().min(1).max(300),
  }),
]);

/**
 * Superadmin user-lifecycle actions (#62). Step-up gated: needs a TOTP check
 * from the last few minutes even inside a live admin session. Non-internal →
 * 404 (the area does not exist for them).
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Non-internal → the area does not exist (404). Internal but stale 2FA →
  // step-up (401). Only then do we have an actor.
  if (!(await getInternalUser())) return new NextResponse("Not found", { status: 404 });
  let actor;
  try {
    actor = await requireStepUp();
  } catch (e) {
    if (e instanceof StepUpRequiredError)
      return NextResponse.json(
        { error: { code: "step_up_required", message: e.message } },
        { status: 401 },
      );
    return new NextResponse("Not found", { status: 404 });
  }

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: { code: "bad_input", message: "Acción no válida." } },
      { status: 422 },
    );
  const body = parsed.data;

  try {
    if (body.action === "anonymize") {
      if (body.confirm !== "ANONIMIZAR")
        return NextResponse.json(
          { error: { code: "confirm_required", message: 'Escribe "ANONIMIZAR" para confirmar.' } },
          { status: 422 },
        );
      await anonymizeUser({ actorId: actor.id, userId: id, headers: req.headers });
      return NextResponse.json({ ok: true, status: "anonymized" });
    }

    if (body.action === "reassign") {
      await reassignUserToCompany({
        actorId: actor.id,
        userId: id,
        companyId: body.companyId,
        role: body.role,
        reason: body.reason,
        headers: req.headers,
      });
      return NextResponse.json({ ok: true });
    }

    const status = ({ block: "blocked", deactivate: "deactivated", reactivate: "active" } as const)[
      body.action
    ];
    await setUserStatus({
      actorId: actor.id,
      userId: id,
      status,
      reason: body.reason,
      headers: req.headers,
    });
    return NextResponse.json({ ok: true, status });
  } catch (e) {
    if (e instanceof LifecycleError || e instanceof AnonymizeError) {
      const status = e.code === "not_found" ? 404 : 409;
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status });
    }
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
