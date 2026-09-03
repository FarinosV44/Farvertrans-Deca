import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createSaved, savedKinds, type SavedKind } from "@/lib/data/saved";

export const runtime = "nodejs";

function parseKind(k: string): SavedKind | null {
  return (savedKinds as readonly string[]).includes(k) ? (k as SavedKind) : null;
}

export async function POST(req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const kind = parseKind((await params).kind);
  if (!kind) return NextResponse.json({ error: { code: "bad_kind" } }, { status: 404 });

  try {
    const created = await createSaved(user.id, kind, await req.json().catch(() => ({})));
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: "validation", message: "Revisa los datos.", fields: e.flatten().fieldErrors } },
        { status: 422 },
      );
    }
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
