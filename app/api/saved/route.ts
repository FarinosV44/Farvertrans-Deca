import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listSaved } from "@/lib/data/saved";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The company's saved companies / vehicles / locations (for wizard autofill, WORKSPACE #24). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ companies: [], vehicles: [], locations: [] }, { status: 200 });
  return NextResponse.json(await listSaved(user.companyId));
}
