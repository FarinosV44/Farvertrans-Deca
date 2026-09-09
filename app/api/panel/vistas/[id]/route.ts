import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { deleteView, renameView } from "@/lib/data/saved-views";

export const runtime = "nodejs";

/** Boundary schema; `historyViewName` stays the authority on a valid name. */
const renameSchema = z.object({ name: z.string().max(200) });

/**
 * #92 — rename or delete one saved view. Both operations are scoped by
 * `(id, userId)` inside the data layer, so another user's id resolves to
 * "not found" instead of reaching a check that could be forgotten — the
 * anti-IDOR shape #94 asked for, applied to a new surface from line one.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const { id } = await params;
  const parsed = renameSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: { code: "invalid_name" } }, { status: 422 });
  const result = await renameView(user.id, id, parsed.data.name);
  if (!result.ok) {
    const status =
      result.reason === "not_found" ? 404 : result.reason === "invalid_name" ? 422 : 409;
    return NextResponse.json({ error: { code: result.reason } }, { status });
  }
  return NextResponse.json({ view: result.view });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const { id } = await params;
  if (!(await deleteView(user.id, id)))
    return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  return NextResponse.json({ ok: true });
}
