import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getInternalUser, requireStepUp, StepUpRequiredError } from "@/lib/admin/guard";
import { recordAudit } from "@/lib/admin/audit";
import { setCompanyStatus, setCompanyTest, LifecycleError } from "@/lib/admin/lifecycle";
import { anonymizeCompany, AnonymizeError } from "@/lib/admin/anonymize";
import { companyDataSchema } from "@/lib/validation/company";
import { companyDataComplete } from "@/lib/company/completeness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.enum(["block", "deactivate", "reactivate"]),
    reason: z.string().trim().max(300).optional(),
  }),
  z.object({ action: z.literal("anonymize"), confirm: z.string() }),
  z.object({ action: z.literal("edit"), data: companyDataSchema }),
  // #103 — "Marcar como prueba": visibility/metrics only, never access or data.
  z.object({ action: z.literal("set_test"), isTest: z.boolean() }),
]);

/**
 * Superadmin company-lifecycle + ficha actions (#62). The superadmin is the
 * only actor that may correct `name`/`nif` (locked for the company's own
 * users). Step-up gated; non-internal → 404.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
      {
        error: {
          code: "bad_input",
          message: parsed.error.issues[0]?.message ?? "Datos no válidos.",
        },
      },
      { status: 422 },
    );
  const body = parsed.data;

  try {
    if (body.action === "set_test") {
      await setCompanyTest({
        actorId: actor.id,
        companyId: id,
        isTest: body.isTest,
        headers: req.headers,
      });
      return NextResponse.json({ ok: true, isTest: body.isTest });
    }

    if (body.action === "edit") {
      const d = body.data;
      const company = await prisma.company.update({
        where: { id },
        data: {
          ...d,
          ...(companyDataComplete(d) ? { dataCompletedAt: new Date() } : {}),
        },
        select: { id: true },
      });
      await recordAudit({
        actorId: actor.id,
        action: "admin_edited_company",
        targetType: "company",
        targetId: company.id,
        result: "success",
        headers: req.headers,
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "anonymize") {
      if (body.confirm !== "ANONIMIZAR")
        return NextResponse.json(
          { error: { code: "confirm_required", message: 'Escribe "ANONIMIZAR" para confirmar.' } },
          { status: 422 },
        );
      await anonymizeCompany({ actorId: actor.id, companyId: id, headers: req.headers });
      return NextResponse.json({ ok: true, status: "anonymized" });
    }

    const status = ({ block: "blocked", deactivate: "deactivated", reactivate: "active" } as const)[
      body.action
    ];
    await setCompanyStatus({
      actorId: actor.id,
      companyId: id,
      status,
      reason: body.reason,
      headers: req.headers,
    });
    return NextResponse.json({ ok: true, status });
  } catch (e) {
    if (e instanceof LifecycleError || e instanceof AnonymizeError) {
      const s = e.code === "not_found" ? 404 : 409;
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: s });
    }
    if (e instanceof Error && "code" in e && (e as { code?: string }).code === "P2025")
      return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
