import { NextResponse } from "next/server";
import { bumpSessionVersion, getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * "Cerrar sesión en todos los dispositivos" (SECURITY #53): bumps
 * `sessionVersion`, which invalidates every session token issued before this
 * call — the caller's own browser gets a freshly re-issued cookie so it
 * isn't logged out of its own request.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  }
  await bumpSessionVersion(user.id);
  return NextResponse.json({ ok: true });
}
