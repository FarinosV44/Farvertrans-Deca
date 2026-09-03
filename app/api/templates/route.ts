import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createTemplate, listTemplates } from "@/lib/data/templates";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  return NextResponse.json({ templates: await listTemplates(user.companyId) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  try {
    const row = await createTemplate(user.companyId, await req.json().catch(() => ({})));
    return NextResponse.json({ template: row }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "bad_input", message: "Revisa el nombre de la plantilla." } },
      { status: 422 },
    );
  }
}
