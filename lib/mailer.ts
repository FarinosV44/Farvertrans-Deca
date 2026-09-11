import "server-only";
import { BRAND } from "@/lib/brand";

export type MailResult = { sent: boolean; reason?: "unconfigured" | "error"; providerId?: string };

/** Redact everything but the first character of the local part — never log a full address. */
const redact = (to: string) => to.replace(/^(.).*(@.*)$/, "$1***$2");

/**
 * Synchronous, no-I/O check: will `sendMail()` even attempt a send? Lets a
 * caller give an honest answer about whether mail is going out at all
 * WITHOUT waiting for the network call itself — used by registration (D-204)
 * to decide its immediate `emailSent` response while the actual send runs
 * after the response, via `after()`.
 */
export function isMailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.FVD_MAIL_FROM);
}

/**
 * Send a transactional email via Resend. Returns `{ sent: false, reason:
 * "unconfigured" }` when no API key is set — callers fall back to a mailto link.
 *
 * D-177: logs EVERY outcome (attempt, success incl. the Resend message id,
 * provider error, network exception) — never keys, never a full recipient
 * address. Before this, a successful call returned nothing observable at
 * all (the response body, which carries Resend's own `id`, was never even
 * read on the 2xx path) — "the app says it sent it, but did it really, and
 * with what id to check against Resend's own dashboard?" had no answer.
 *
 * D-179 (deliverability, not a logic change): every send now goes out with a
 * recognisable display name — `${BRAND.name} <the verified address>` —
 * rather than a bare address, and an optional `html`/`replyTo` for a proper
 * multipart send. The verified address/domain itself is UNCHANGED
 * (`FVD_MAIL_FROM`, already Resend-verified) — only how it presents.
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  const rawFrom = process.env.FVD_MAIL_FROM;
  if (!key || !rawFrom) {
    console.error(JSON.stringify({ event: "mail_unconfigured", to: redact(opts.to) }));
    return { sent: false, reason: "unconfigured" };
  }
  const from = `${BRAND.name} <${rawFrom}>`;

  console.log(
    JSON.stringify({
      event: "mail_send_attempt",
      to: redact(opts.to),
      from,
      subject: opts.subject,
    }),
  );

  try {
    // Hard timeout: this runs inside the request path (registration, password
    // reset, team invites…). Node's fetch has NO default timeout, so a slow or
    // unreachable provider would hang the whole request until the browser gives
    // up — which looks to the user like "registration is broken / the verify
    // screen never appears". A timeout makes those flows fall back to the
    // honest `sent: false` state instead of stalling.
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        ...(opts.html ? { html: opts.html } : {}),
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    const body = await res.text().catch(() => "");
    if (!res.ok) {
      // SECURITY #53 P0: never swallow the provider's own error — this is
      // what makes "why didn't the email arrive" diagnosable in production.
      console.error(
        JSON.stringify({
          event: "mail_provider_error",
          status: res.status,
          body: body.slice(0, 2000),
          to: redact(opts.to),
        }),
      );
      return { sent: false, reason: "error" };
    }
    const providerId = (() => {
      try {
        return JSON.parse(body)?.id as string | undefined;
      } catch {
        return undefined;
      }
    })();
    console.log(
      JSON.stringify({ event: "mail_provider_accepted", providerId, to: redact(opts.to) }),
    );
    return { sent: true, providerId };
  } catch (e) {
    console.error(
      JSON.stringify({
        event: "mail_provider_exception",
        error: e instanceof Error ? e.message : String(e),
        to: redact(opts.to),
      }),
    );
    return { sent: false, reason: "error" };
  }
}
