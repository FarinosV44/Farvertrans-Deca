import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { withdrawAvailabilityShare, updateAvailabilityShare } from "@/lib/commercial/availability";

export const runtime = "nodejs";

const withdrawSchema = z.object({ action: z.literal("withdraw") });

/** #119 — edit an already-prepared record. Capacity fields are required
 *  together only when `capacityMode` is "partial" (checked in
 *  `updateAvailabilityShare`, not here — the same "never a fabricated value"
 *  discipline as the rest of this feature). */
const updateSchema = z.object({
  action: z.literal("update"),
  destination: z.string().trim().min(1),
  availabilityDate: z.string().trim().min(1),
  preferredDestination: z.string().trim().max(200).optional().or(z.literal("")),
  capacityMode: z.enum(["full", "partial"]),
  linearMeters: z.number().positive().optional(),
  maxWeightKg: z.number().positive().optional(),
  vehicleType: z.enum(["lona", "frigorifico"]).optional(),
});

const schema = z.discriminatedUnion("action", [withdrawSchema, updateSchema]);

/**
 * Manage the commercial availability record prepared for this DeCA (#84,
 * expanded #119 with "update"). Owner-only, company-scoped. Never deletes
 * the record and never touches the DeCA itself.
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

  if (parsed.data.action === "withdraw") {
    const ok = await withdrawAvailabilityShare(id, user.companyId, user.id);
    if (!ok)
      return NextResponse.json(
        { error: { code: "not_found", message: "No hay una ficha de disponibilidad pendiente." } },
        { status: 404 },
      );
    return NextResponse.json({ ok: true });
  }

  const data = parsed.data;
  const ok = await updateAvailabilityShare(id, user.companyId, user.id, {
    destination: data.destination,
    availabilityDate: data.availabilityDate,
    preferredDestination: data.preferredDestination || undefined,
    capacityMode: data.capacityMode,
    linearMeters: data.linearMeters,
    maxWeightKg: data.maxWeightKg,
    vehicleType: data.vehicleType,
  });
  if (!ok)
    return NextResponse.json(
      {
        error: {
          code: "validation",
          message: "No se pudo actualizar la disponibilidad. Revisa los datos.",
        },
      },
      { status: 422 },
    );
  return NextResponse.json({ ok: true });
}
