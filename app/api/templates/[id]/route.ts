import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteTemplate } from "@/lib/data/templates";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  const { id } = await params;
  await deleteTemplate(user.companyId, id);
  return NextResponse.json({ ok: true });
}
