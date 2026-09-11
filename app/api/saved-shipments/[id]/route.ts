import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  deleteSavedShipment,
  SavedLocationOwnershipError,
  updateSavedShipment,
} from "@/lib/data/saved-shipments";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  // PRODUCT #56: a read_only (Auditor) member can view but never delete.
  if (user.companyRole === "read_only")
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });

  const { id } = await params;
  const ok = await deleteSavedShipment(user.companyId, id);
  // Deleting a saved shipment never touches any generated DeCA — those hold copies.
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}

/** Edit an existing saved shipment in place. Same schema/validation as create. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  if (user.companyRole === "read_only")
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });

  const { id } = await params;
  try {
    const ok = await updateSavedShipment(user.companyId, id, await req.json().catch(() => ({})));
    return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "validation",
            message: "Revisa los datos.",
            fields: e.flatten().fieldErrors,
          },
        },
        { status: 422 },
      );
    }
    if (e instanceof SavedLocationOwnershipError) {
      return NextResponse.json({ error: { code: "bad_location" } }, { status: 422 });
    }
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
