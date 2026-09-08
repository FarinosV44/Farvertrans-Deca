import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { setSavedFavorite } from "@/lib/data/saved";
import { setTemplateFavorite } from "@/lib/data/templates";
import { setRouteFavorite } from "@/lib/data/route-intel";

export const runtime = "nodejs";

/**
 * Toggle a company-scoped favourite (#78) on a saved company / vehicle /
 * location, a template, or a route corridor. Company-scoped so the whole team
 * shares it; authorised against the session's companyId, never the row's own
 * ids. Favouriting never creates or duplicates a record.
 */
const schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.enum(["company", "vehicle", "location", "template"]),
    id: z.string().min(1),
    favorite: z.boolean(),
  }),
  z.object({
    kind: z.literal("route"),
    favorite: z.boolean(),
    route: z.object({
      routeKey: z.string().min(1).max(200),
      loadCity: z.string().max(120),
      loadCountry: z.string().max(80).nullable(),
      unloadCity: z.string().max(120),
      unloadCountry: z.string().max(80).nullable(),
    }),
  }),
]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId) return new NextResponse("Unauthorized", { status: 401 });
  // A read_only member can view but not curate the shared workspace.
  if (user.companyRole === "read_only") return new NextResponse("Forbidden", { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new NextResponse("Bad request", { status: 400 });
  const body = parsed.data;

  if (body.kind === "route") {
    await setRouteFavorite(user.companyId, body.route, body.favorite);
    return NextResponse.json({ ok: true });
  }
  if (body.kind === "template") {
    const ok = await setTemplateFavorite(user.companyId, body.id, body.favorite);
    return ok ? NextResponse.json({ ok: true }) : new NextResponse("Not found", { status: 404 });
  }
  const ok = await setSavedFavorite(user.companyId, body.kind, body.id, body.favorite);
  return ok ? NextResponse.json({ ok: true }) : new NextResponse("Not found", { status: 404 });
}
