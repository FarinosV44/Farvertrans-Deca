import { NextResponse } from "next/server";
import { isInternalRequest } from "@/lib/admin/guard";
import { contentInputSchema, updateContent, setStatus, SlugTakenError } from "@/lib/content/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Update a content item, and optionally change its status in the same call
 * (SEO #32). `_action` is `{ publish | unpublish | archive }`. Internal only.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isInternalRequest(req.headers))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const { id } = await params;
  const raw = await req.json().catch(() => null);
  const action = (raw && typeof raw === "object" ? raw._action : null) as {
    publish?: boolean;
    unpublish?: boolean;
    archive?: boolean;
  } | null;

  const parsed = contentInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "validation",
          message: parsed.error.issues[0]?.message ?? "Datos no válidos.",
        },
      },
      { status: 422 },
    );
  }

  try {
    await updateContent(id, parsed.data);
    if (action?.publish) await setStatus(id, "published");
    else if (action?.unpublish) await setStatus(id, "draft");
    else if (action?.archive) await setStatus(id, "archived");
    return NextResponse.json({ id });
  } catch (e) {
    if (e instanceof SlugTakenError)
      return NextResponse.json(
        { error: { code: "slug_taken", message: e.message } },
        { status: 409 },
      );
    if (e instanceof Error && e.message === "not_found")
      return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}

/** Archive a content item (soft — never a hard delete). */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isInternalRequest(req.headers))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const { id } = await params;
  try {
    await setStatus(id, "archived");
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  }
}
