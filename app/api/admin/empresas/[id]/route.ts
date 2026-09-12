import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getInternalUser, requireStepUp, StepUpRequiredError } from "@/lib/admin/guard";
import { recordAudit } from "@/lib/admin/audit";
import { setCompanyStatus, setCompanyTest, LifecycleError } from "@/lib/admin/lifecycle";
import { companyDataSchema } from "@/lib/validation/company";
import { companyDataComplete } from "@/lib/company/completeness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * #103 follow-up (D-170): NO irreversible action is reachable from normal
 * Superadmin for a company — `anonymize` (and any hard delete, which never
 * existed here) is deliberately NOT in this union. A compromised Superadmin
 * session, a human mistake, or a permissions bug can therefore never trigger
 * an irreversible change to a company through this endpoint. If anonymizing
 * a company is ever genuinely needed, it happens outside this route, through
 * a controlled, exceptional technical procedure — never a web button.
 */
const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.enum(["block", "deactivate", "reactivate"]),
    reason: z.string().trim().max(300).optional(),
  }),
  z.object({
    action: z.literal("edit"),
    data: companyDataSchema,
    // Set only on a resubmit after the client has already shown the
    // duplicate-CIF/NIF warning and the superadmin chose to proceed anyway
    // (D-162's existing "warn, never hard-block" philosophy for a duplicate
    // NIF — the same one `lib/admin/segments.ts`'s `duplicate_nif` tag
    // already applies passively; this just surfaces it BEFORE saving too).
    confirmDuplicateNif: z.boolean().optional(),
  }),
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
      const before = await prisma.company.findUnique({
        where: { id },
        select: { name: true, nif: true },
      });
      if (!before) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });

      // Name/NIF are the two fields this ticket cares about most — a
      // sensitive company identifier, so a collision is surfaced BEFORE
      // saving rather than only passively afterward (D-162 already tags a
      // duplicate NIF for review; this just moves the same warning earlier).
      // Never a hard block — the superadmin can always confirm and proceed,
      // matching D-162's own "warn, don't block" choice for this exact case.
      if (d.nif !== before.nif && !body.confirmDuplicateNif) {
        const conflict = await prisma.company.findFirst({
          where: { nif: d.nif, id: { not: id } },
          select: { id: true, name: true },
        });
        if (conflict) {
          return NextResponse.json(
            {
              error: {
                code: "duplicate_nif",
                message: `Ya existe la empresa «${conflict.name}» con este CIF/NIF.`,
                conflictingCompanyName: conflict.name,
              },
            },
            { status: 409 },
          );
        }
      }

      const company = await prisma.company.update({
        where: { id },
        data: {
          ...d,
          ...(companyDataComplete(d) ? { dataCompletedAt: new Date() } : {}),
        },
        select: { id: true },
      });
      // Old→new for the two fields a customer-support correction is most
      // likely to touch — the audit row's actor/timestamp already come from
      // `recordAudit()` itself.
      const changes: string[] = [];
      if (d.name !== before.name) changes.push(`Nombre: "${before.name}" → "${d.name}"`);
      if (d.nif !== before.nif) changes.push(`CIF/NIF: "${before.nif}" → "${d.nif}"`);
      await recordAudit({
        actorId: actor.id,
        action: "admin_edited_company",
        targetType: "company",
        targetId: company.id,
        detail: changes.length > 0 ? changes.join("; ") : undefined,
        result: "success",
        headers: req.headers,
      });
      return NextResponse.json({ ok: true });
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
    if (e instanceof LifecycleError) {
      const s = e.code === "not_found" ? 404 : 409;
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: s });
    }
    if (e instanceof Error && "code" in e && (e as { code?: string }).code === "P2025")
      return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
