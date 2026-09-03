import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteSaved, savedKinds, type SavedKind } from "@/lib/data/saved";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const { kind, id } = await params;
  if (!(savedKinds as readonly string[]).includes(kind)) {
    return NextResponse.json({ error: { code: "bad_kind" } }, { status: 404 });
  }

  const ok = await deleteSaved(user.id, kind as SavedKind, id);
  // Deleting a saved entity never touches any generated DeCA — those hold copies.
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
