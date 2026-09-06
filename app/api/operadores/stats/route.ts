import { NextResponse } from "next/server";
import { isInternalRequest } from "@/lib/admin/guard";
import { operatorStats } from "@/lib/attribution/persist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Per-operator acquisition stats. Internal role + fresh admin 2FA only (F13, SECURITY #53). */
export async function GET(req: Request) {
  // 404, not 403 — don't reveal the route to non-internal users (permissions matrix).
  if (!(await isInternalRequest(req.headers))) {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.json(await operatorStats());
}
