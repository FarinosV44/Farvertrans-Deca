import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Fresh, server-side read of whether the current session's email is verified
 * (D-053). Backs "Ya he confirmado mi cuenta" — that button never marks the
 * account verified itself; it only asks this endpoint what the database
 * actually says, so a click with no real verification never lets the user in.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Inicia sesión." } },
      { status: 401 },
    );
  }
  return NextResponse.json({ verified: !!user.emailVerifiedAt });
}
