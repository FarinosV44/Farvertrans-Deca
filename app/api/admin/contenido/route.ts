import { NextResponse } from "next/server";
import { isInternalRequest } from "@/lib/admin/guard";
import { contentInputSchema, createContent, SlugTakenError } from "@/lib/content/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Create a content item as a draft (SEO #32). Internal only — 404 otherwise. */
export async function POST(req: Request) {
  if (!(await isInternalRequest(req.headers))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const body = await req.json().catch(() => null);
  const parsed = contentInputSchema.safeParse(body);
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
    const item = await createContent(parsed.data);
    return NextResponse.json({ id: item.id }, { status: 201 });
  } catch (e) {
    if (e instanceof SlugTakenError) {
      return NextResponse.json(
        { error: { code: "slug_taken", message: e.message } },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
