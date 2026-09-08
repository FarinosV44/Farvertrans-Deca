import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { withdrawAvailabilityShare } from "@/lib/commercial/availability";

export const runtime = "nodejs";

const schema = z.object({ action: z.literal("withdraw") });

/**
 * Withdraw the commercial availability record prepared for this DeCA (#84).
 * Owner-only, company-scoped. Never deletes the record and never touches the
 * DeCA — it only flips the record's status so nothing further would be
 * communicated.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  if (user.companyRole !== "owner")
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: { code: "validation" } }, { status: 422 });

  const ok = await withdrawAvailabilityShare(id, user.companyId, user.id);
  if (!ok)
    return NextResponse.json(
      { error: { code: "not_found", message: "No hay una ficha de disponibilidad pendiente." } },
      { status: 404 },
    );
  return NextResponse.json({ ok: true });
}
