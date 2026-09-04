import { NextResponse } from "next/server";
import { isInternalRequest } from "@/lib/admin/guard";
import { runDiagnostics } from "@/lib/diagnostics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Production readiness report (P0 FIX #29 §4 / ADMIN #33 §8). Internal session
 * or `x-fvd-admin-token` only — 404 for everyone else, so the route is not
 * discoverable. Returns no secret: only whether each dependency answers.
 */
export async function GET(req: Request) {
  if (!(await isInternalRequest(req.headers))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const report = await runDiagnostics();
  return NextResponse.json(report, { status: report.ok ? 200 : 503 });
}
