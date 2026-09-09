import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { listUserMemberships, switchActiveCompany, TeamError } from "@/lib/team";

export const runtime = "nodejs";

/** #102 — every company this user has a membership in, for a workspace switcher. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  return NextResponse.json({
    active: user.companyId,
    companies: await listUserMemberships(user.id),
  });
}

const schema = z.object({ companyId: z.string().min(1) });

/** #102 — switch which membership is active. Refuses a company the user has no membership in. */
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "bad_input" } }, { status: 422 });

  try {
    await switchActiveCompany(user.id, parsed.data.companyId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof TeamError)
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: 404 });
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
