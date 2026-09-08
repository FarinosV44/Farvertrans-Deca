import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createIntegrationRequest, setIntegrationRequestStatus } from "@/lib/integrations";
import { getInternalUser } from "@/lib/admin/guard";
import { z } from "zod";

export const runtime = "nodejs";

/** #74 — a company records interest in a TMS/ERP integration. Auth + company. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json().catch(() => null);
  try {
    await createIntegrationRequest(user.companyId, user.id, body);
  } catch (e) {
    const msg =
      e instanceof z.ZodError ? (e.issues[0]?.message ?? "Datos no válidos") : "Datos no válidos";
    return NextResponse.json({ error: { message: msg } }, { status: 422 });
  }
  return NextResponse.json({ ok: true });
}

/** Internal triage: move a request through new → reviewed → contact → discarded. */
const patchSchema = z.object({ id: z.string().min(1), status: z.string() });
export async function PATCH(req: Request) {
  if (!(await getInternalUser())) return new NextResponse("Not found", { status: 404 });
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new NextResponse("Bad request", { status: 400 });
  const ok = await setIntegrationRequestStatus(parsed.data.id, parsed.data.status);
  return ok ? NextResponse.json({ ok: true }) : new NextResponse("Bad status", { status: 400 });
}
