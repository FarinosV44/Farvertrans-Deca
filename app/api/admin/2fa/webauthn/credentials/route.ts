import { NextResponse } from "next/server";
import { isInternalRequest } from "@/lib/admin/guard";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** List the current admin's own registered passkeys, for the Security screen. */
export async function GET(req: Request) {
  if (!(await isInternalRequest(req.headers))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Not found", { status: 404 });

  const credentials = await prisma.webAuthnCredential.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      deviceType: true,
      backedUp: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });
  return NextResponse.json({ credentials });
}
