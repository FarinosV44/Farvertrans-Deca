import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createInvite, TeamError } from "@/lib/team";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "member", "read_only"]).default("member"),
});

/** Admin creates a workspace invite (TEAM #27). Emails the link and returns it. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: { code: "bad_input", message: "Indica un email válido." } },
      { status: 422 },
    );

  try {
    const { token, email, inviteId } = await createInvite(
      user.companyId,
      user.id,
      parsed.data.email,
      parsed.data.role,
    );
    const link = `${publicEnv.baseUrl.replace(/\/$/, "")}/registro?invite=${encodeURIComponent(token)}`;

    // D-177: the invite is created regardless — that half never depended on
    // email. This block is ONLY about whether the email itself was actually
    // handed to the provider; `delivered` must never be true just because
    // the DB write above succeeded. The try/catch here used to swallow
    // anything the dynamic import or the call itself threw with NO log line
    // at all (`/* mailer best-effort */`) — the one gap `sendMail()`'s own
    // logging couldn't cover, since it never runs if the import itself
    // fails. Logged now, same redaction convention as `lib/mailer.ts`.
    let delivered = false;
    try {
      const { sendMail } = await import("@/lib/mailer");
      const mail = await sendMail({
        to: email,
        subject: `Te han invitado a ${BRAND.name}`,
        text: `${user.company?.name ?? "Una empresa"} te ha invitado a su cuenta de ${BRAND.name}.\n\nÚnete con este enlace (caduca en 14 días):\n${link}\n\nSi ya tienes cuenta, inicia sesión desde ese mismo enlace.`,
      });
      delivered = mail.sent;
      console.log(
        JSON.stringify({
          event: "team_invite_mail_result",
          inviteId,
          delivered,
          providerId: mail.providerId,
        }),
      );
    } catch (mailErr) {
      console.error(
        JSON.stringify({
          event: "team_invite_mail_threw",
          inviteId,
          error: mailErr instanceof Error ? mailErr.message : String(mailErr),
        }),
      );
    }

    return NextResponse.json({ ok: true, link, email, delivered }, { status: 201 });
  } catch (e) {
    if (e instanceof TeamError) {
      const status = e.code === "forbidden" ? 403 : e.code === "already_member" ? 409 : 422;
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status });
    }
    return NextResponse.json(
      { error: { code: "internal", message: "No se pudo crear la invitación." } },
      { status: 500 },
    );
  }
}
