import { NextResponse } from "next/server";
import { z } from "zod";
import { isInternalRequest } from "@/lib/admin/guard";
import { getCurrentUser } from "@/lib/auth";
import {
  createTrustedDevice,
  TRUSTED_DEVICE_COOKIE,
  TRUSTED_DEVICE_COOKIE_OPTIONS,
} from "@/lib/auth/trusted-device";
import { recordAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";

const schema = z.object({ label: z.string().trim().max(200).optional() });

/**
 * "Trust this device" for ~30 days (SECURITY #53 passkey follow-up, brief
 * item 4) — only callable right after a genuinely fresh 2FA check
 * (`isInternalRequest` already demands that), never as a way to grant trust
 * on its own.
 */
export async function POST(req: Request) {
  if (!(await isInternalRequest(req.headers))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Not found", { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  const label = parsed.success ? parsed.data.label : undefined;

  const token = await createTrustedDevice(
    user.id,
    label ?? req.headers.get("user-agent")?.slice(0, 200),
  );
  await recordAudit({
    actorId: user.id,
    action: "admin_device_trusted",
    result: "success",
    headers: req.headers,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(TRUSTED_DEVICE_COOKIE, token, TRUSTED_DEVICE_COOKIE_OPTIONS);
  return res;
}
