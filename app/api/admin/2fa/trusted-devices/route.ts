import { NextResponse } from "next/server";
import { isInternalRequest } from "@/lib/admin/guard";
import { getCurrentUser } from "@/lib/auth";
import { listTrustedDevices } from "@/lib/auth/trusted-device";

export const runtime = "nodejs";

/** List the current admin's own trusted devices, for the Security screen. */
export async function GET(req: Request) {
  if (!(await isInternalRequest(req.headers))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Not found", { status: 404 });

  const devices = await listTrustedDevices(user.id);
  return NextResponse.json({ devices });
}
