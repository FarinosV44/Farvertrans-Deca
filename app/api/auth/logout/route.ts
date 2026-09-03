import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

/** End the session (ACCOUNT #23). */
export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true }, { status: 200 });
}
