import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { removeMember, TeamError } from "@/lib/team";

export const runtime = "nodejs";

/** Admin removes a member from the workspace (TEAM #27). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  const { id } = await params;
  try {
    await removeMember(user.companyId, user.id, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof TeamError) {
      const status = e.code === "forbidden" ? 403 : e.code === "not_found" ? 404 : 422;
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status });
    }
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
