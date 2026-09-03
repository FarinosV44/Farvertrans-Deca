import "server-only";

export type MailResult = { sent: boolean; reason?: "unconfigured" | "error" };

/**
 * Send a transactional email via Resend. Returns `{ sent: false, reason:
 * "unconfigured" }` when no API key is set — callers fall back to a mailto link.
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.FVD_MAIL_FROM;
  if (!key || !from) return { sent: false, reason: "unconfigured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, text: opts.text }),
    });
    return { sent: res.ok, reason: res.ok ? undefined : "error" };
  } catch {
    return { sent: false, reason: "error" };
  }
}
