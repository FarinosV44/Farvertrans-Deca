import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { searchCompanyDecas } from "@/lib/data/search";

export const runtime = "nodejs";

/**
 * Company workspace global search (PRODUCT #56 §"power-user UX"). Backs the
 * Cmd/Ctrl+K command palette. Company-scoped, read-only — available to every
 * company role including `read_only` (viewing search results is not a write).
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q") ?? "";
  const hits = await searchCompanyDecas(user.companyId, q);
  return NextResponse.json({ hits });
}
