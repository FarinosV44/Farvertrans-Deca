import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createView, listViews } from "@/lib/data/saved-views";
import { filtersFromParams, HISTORY_FILTER_KEYS } from "@/lib/data/history-views";

export const runtime = "nodejs";

/**
 * Boundary schema (change map: "New API route" — zod input schema). It shapes
 * the payload only; `historyViewName` and `filtersFromParams` remain the
 * authority on what a name and a filter set may be, and both are unit tested.
 * Unknown filter keys are dropped rather than rejected, so a future page or
 * tracking param can never turn a save into a 422.
 */
const createSchema = z.object({
  name: z.string().max(200),
  filters: z
    .object(Object.fromEntries(HISTORY_FILTER_KEYS.map((k) => [k, z.string().max(200).optional()])))
    .partial()
    .optional(),
});

/**
 * #92 — the current user's saved Histórico views. USER-scoped, not
 * company-scoped: a `read_only` (Auditor) member may keep their own views,
 * because a view changes nothing anyone else can see. The row is always
 * addressed by `(id, userId)` in the data layer, so there is no id to guess.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  return NextResponse.json({ views: await listViews(user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "bad_input" } }, { status: 422 });
  const body = parsed.data;

  // Never store what the client sends verbatim: only the filters the Histórico
  // actually has survive `filtersFromParams` (#92 adds no new filter).
  const result = await createView(user.id, body.name, filtersFromParams(body.filters ?? {}));
  if (!result.ok) {
    const status = result.reason === "invalid_name" ? 422 : 409;
    return NextResponse.json({ error: { code: result.reason } }, { status });
  }
  return NextResponse.json({ view: result.view }, { status: 201 });
}
