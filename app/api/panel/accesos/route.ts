import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseQuickActions } from "@/lib/panel/quick-actions";

export const runtime = "nodejs";

/**
 * Boundary schema (change map: "New API route"). Deliberately permissive about
 * the array's CONTENT: `parseQuickActions` is the authority that drops unknown
 * keys, repeats and anything past the third, and it is unit tested. Rejecting
 * here instead would turn a stale key from an older catalogue into an error
 * screen rather than into one fewer shortcut.
 */
const schema = z.object({ actions: z.array(z.string().max(64)).max(50) });

/**
 * #93 — this user's up-to-three quick accesses on Inicio. Per-user, so it
 * writes only `User.quickActions` for the caller's own row and can never touch
 * a colleague's Inicio. `parseQuickActions` is what makes the input safe: an
 * unknown key, a repeat or a fourth choice is dropped, never stored.
 */
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "bad_input" } }, { status: 422 });
  const quickActions = parseQuickActions(parsed.data.actions);

  await prisma.user.update({ where: { id: user.id }, data: { quickActions } });
  return NextResponse.json({ ok: true, actions: quickActions });
}
