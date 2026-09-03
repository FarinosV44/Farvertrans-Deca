import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createProspect, importProspects, issueProspectInvite } from "@/lib/growth";
import { publicEnv } from "@/lib/env";

export const runtime = "nodejs";

function notFound() {
  return new NextResponse("Not found", { status: 404 });
}

const createSchema = z.object({
  action: z.literal("create"),
  name: z.string(),
  nif: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  refCode: z.string(),
  source: z.string().optional(),
});
const inviteSchema = z.object({ action: z.literal("invite"), prospectId: z.string() });
const importSchema = z.object({
  action: z.literal("import"),
  text: z.string().max(20000),
  fallbackRef: z.string().optional(),
});

/** Internal-only prospect management (GROWTH #28). */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "internal") return notFound();

  const body = await req.json().catch(() => ({}));

  if (body?.action === "invite") {
    const p = inviteSchema.parse(body);
    const r = await issueProspectInvite(p.prospectId);
    if (!r) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
    const link = `${publicEnv.baseUrl.replace(/\/$/, "")}/registro?invite=${encodeURIComponent(r.token)}`;
    return NextResponse.json({ ok: true, link });
  }

  if (body?.action === "import") {
    const p = importSchema.parse(body);
    return NextResponse.json({ ok: true, ...(await importProspects(p.text, p.fallbackRef)) });
  }

  try {
    const p = createSchema.parse(body);
    const row = await createProspect(p);
    return NextResponse.json(
      { ok: true, prospect: { id: row.id, name: row.name } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: { code: "bad_input", message: "Revisa el nombre y el código de operador." } },
      { status: 422 },
    );
  }
}
