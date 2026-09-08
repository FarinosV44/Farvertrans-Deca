import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveDraft, discardDraft } from "@/lib/deca/draft";

export const runtime = "nodejs";

/**
 * The user's single in-progress DeCA draft (#76). Auth + company required;
 * anonymous visitors keep their draft in the browser only.
 *   PUT    — upsert the current form state (empty → the draft is removed).
 *   DELETE — discard it (also called on successful generation).
 */
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return new NextResponse("Bad request", { status: 400 });
  try {
    await saveDraft(user.id, user.companyId, body);
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user?.companyId) return new NextResponse("Unauthorized", { status: 401 });
  await discardDraft(user.id);
  return NextResponse.json({ ok: true });
}
