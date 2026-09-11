import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  createSavedShipment,
  listSavedShipments,
  SavedLocationOwnershipError,
} from "@/lib/data/saved-shipments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The company's saved shipments ("rutas/envíos habituales", #113) for wizard autofill. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user?.companyId) return NextResponse.json({ items: [] }, { status: 200 });
  return NextResponse.json({ items: await listSavedShipments(user.companyId) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  // PRODUCT #56: a read_only (Auditor) member can view but never create.
  if (user.companyRole === "read_only")
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });

  try {
    const created = await createSavedShipment(
      user.id,
      user.companyId,
      await req.json().catch(() => ({})),
    );
    return NextResponse.json({ item: created }, { status: 201 });
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
