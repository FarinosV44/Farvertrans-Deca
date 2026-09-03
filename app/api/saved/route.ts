import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listSaved } from "@/lib/data/saved";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The current user's saved companies / vehicles / addresses (for wizard autofill). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ companies: [], vehicles: [], addresses: [] }, { status: 200 });
  return NextResponse.json(await listSaved(user.id));
}
