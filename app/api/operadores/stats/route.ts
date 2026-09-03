import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { operatorStats } from "@/lib/attribution/persist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Per-operator acquisition stats. Internal role only (F13). */
export async function GET() {
  const user = await getCurrentUser();
  // 404, not 403 — don't reveal the route to non-internal users (permissions matrix).
  if (user?.role !== "internal") {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.json(await operatorStats());
}
