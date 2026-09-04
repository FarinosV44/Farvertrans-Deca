import { NextResponse } from "next/server";
import { isInternalRequest } from "@/lib/admin/guard";
import { adminSearch } from "@/lib/admin/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin global search (ADMIN #33 §9). Internal session or `x-fvd-admin-token`
 * only — 404 otherwise. Read-only; returns links to admin detail pages.
 */
export async function GET(req: Request) {
  if (!(await isInternalRequest(req.headers))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (q.trim().length < 2) return NextResponse.json({ hits: [] });
  const hits = await adminSearch(q);
  return NextResponse.json({ hits });
}
