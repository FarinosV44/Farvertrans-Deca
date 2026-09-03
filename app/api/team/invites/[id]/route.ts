import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { revokeInvite, TeamError } from "@/lib/team";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  const { id } = await params;
  try {
    await revokeInvite(user.companyId, user.id, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof TeamError)
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: 403 });
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
