import { NextResponse } from "next/server";
import { z } from "zod";
import { isInternalRequest } from "@/lib/admin/guard";
import { updateOperator } from "@/lib/admin/operators";

export const runtime = "nodejs";

/** Edit an operator or toggle `active` (#86 part 8 — never deletes history). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isInternalRequest(req.headers))) {
    return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  }
  const { id } = await params;
  try {
    const ok = await updateOperator(id, await req.json().catch(() => ({})));
    return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: { code: "validation" } }, { status: 422 });
    }
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
