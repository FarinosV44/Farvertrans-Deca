import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { changeRole, removeMember, TeamError } from "@/lib/team";

export const runtime = "nodejs";

const teamErrorStatus = (code: TeamError["code"]) =>
  code === "forbidden" ? 403 : code === "not_found" ? 404 : 422;

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
    if (e instanceof TeamError)
      return NextResponse.json(
        { error: { code: e.code, message: e.message } },
        { status: teamErrorStatus(e.code) },
      );
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}

const roleSchema = z.object({ role: z.enum(["owner", "member"]) });

/** Admin changes a member's workspace role (TEAM #37). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  const parsed = roleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: { code: "bad_input", message: "Rol no válido." } },
      { status: 422 },
    );
  const { id } = await params;
  try {
    await changeRole(user.companyId, user.id, id, parsed.data.role);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof TeamError)
      return NextResponse.json(
        { error: { code: e.code, message: e.message } },
        { status: teamErrorStatus(e.code) },
      );
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
