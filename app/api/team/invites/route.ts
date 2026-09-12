import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createInvite, TeamError } from "@/lib/team";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import { buildInviteEmail } from "@/lib/team-invite-email";
import { checkAbuse } from "@/lib/abuse";
import { abuseResponse } from "@/lib/abuse/response";

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

  // #129: an authenticated member could otherwise send unlimited invite
  // emails to arbitrary addresses — an email-bombing vector via a
  // compromised or throwaway account. Same policy/pattern as /api/support.
  const decision = await checkAbuse("share", req.headers, {
    fingerprint: req.headers.get("x-fvd-fp"),
    challengeToken: req.headers.get("x-fvd-challenge"),
  });
  const blocked = abuseResponse(decision);
  if (blocked) return blocked;

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
      // D-179 (deliverability review): transactional, not marketing —
      // simple subject, minimal HTML + plain-text parts, the real
      // decaprofesional.es link shown twice (button + visible plain text),
      // no images, no tracked/shortened links, a short legitimate footer,
      // no unsubscribe language. See lib/team-invite-email.ts.
      const { subject, text, html } = buildInviteEmail({
        companyName: user.company?.name ?? "Una empresa",
        role: parsed.data.role,
        link,
      });
      const mail = await sendMail({ to: email, subject, text, html, replyTo: BRAND.supportEmail });
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
