import { BRAND } from "@/lib/brand";

/**
 * #106 (D-179/D-180) — a single, shared, minimal HTML shell for every
 * transactional email the app sends (verification, password reset, team
 * invites, DeCA links, support). Deliberately NOT marketing: a plain-text
 * brand header (never an `<img>` logo — #106 explicitly asks to avoid
 * relying on images to understand the message, and a heavy/blocked image is
 * itself a spam-filter signal), an optional title, an optional compact
 * "info block" (key/value rows — company/role/expiry, etc.), ONE
 * inline-styled CTA button with the same real link shown again as visible
 * plain text right underneath, no tracked/shortened links, an explicit
 * UTF-8 declaration (a missing `<meta charset>` is exactly what turns
 * "á/é/í/ó/ú/ñ" into "?"/mojibake in some clients). Reuses each email's
 * EXISTING, already-translated plain-text copy (no new per-locale strings
 * needed) — this only adds a matching, better-formatted HTML rendering of
 * the same words, per #106's "Branding: centralizar... no hardcodear estos
 * datos en cada template" and "Consistencia técnica: header, CTA button,
 * info block, footer" requirements.
 */

/** Escape user- or dictionary-supplied text before it goes into an HTML email body. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const BLUE = "#0a3d91";
const INK = "#16181d";
const MUTED = "#5c5f66";
const BORDER = "#d8d4cb";
const SURFACE = "#f1efe9";

// Matches a raw https:// URL as it appears in the ALREADY-ESCAPED text (so it
// never matches inside an HTML attribute this function itself wrote).
const RAW_URL_RE = /https:\/\/[^\s<]+/g;

function paragraphsHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const escaped = escapeHtml(block).replace(/\n/g, "<br>");
      // Any raw https:// URL in the body — not just the one CTA link — is
      // made clickable too (e.g. a second, secondary link in the same
      // email), never left as inert plain text.
      const linked = escaped.replace(
        RAW_URL_RE,
        (url) => `<a href="${url}" style="color:${BLUE};word-break:break-all;">${url}</a>`,
      );
      return `<p style="font-size:15px;line-height:1.5;margin:0 0 16px;">${linked}</p>`;
    })
    .join("\n");
}

function infoBlockHtml(rows: { label: string; value: string }[]): string {
  if (rows.length === 0) return "";
  const cells = rows
    .map(
      (r) =>
        `<tr><td style="padding:4px 0;font-size:13px;color:${MUTED};">${escapeHtml(r.label)}</td><td style="padding:4px 0;font-size:13px;color:${INK};font-weight:bold;text-align:right;">${escapeHtml(r.value)}</td></tr>`,
    )
    .join("\n");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SURFACE};border-radius:4px;margin:0 0 20px;">
                  <tr><td style="padding:12px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${cells}</table>
                  </td></tr>
                </table>`;
}

/**
 * Renders a plain-text transactional email's `text` (already localized,
 * already correct) into a matching, clean HTML part.
 */
export function renderTransactionalHtml(opts: {
  text: string;
  title?: string;
  infoRows?: { label: string; value: string }[];
  link?: string;
  ctaLabel?: string;
  footerText?: string;
}): string {
  const title = opts.title
    ? `<h1 style="font-size:20px;line-height:1.3;margin:0 0 16px;color:${INK};">${escapeHtml(opts.title)}</h1>`
    : "";
  const infoBlock = infoBlockHtml(opts.infoRows ?? []);
  const cta =
    opts.ctaLabel && opts.link
      ? `<p style="margin:4px 0 12px;"><a href="${escapeHtml(opts.link)}" style="display:inline-block;background:${BLUE};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:15px;font-weight:bold;">${escapeHtml(opts.ctaLabel)}</a></p>
                <p style="font-size:13px;line-height:1.5;color:${MUTED};margin:0 0 20px;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br><a href="${escapeHtml(opts.link)}" style="color:${BLUE};word-break:break-all;">${escapeHtml(opts.link)}</a></p>`
      : "";
  const footer = opts.footerText
    ? `<hr style="border:none;border-top:1px solid ${BORDER};margin:24px 0;">
                <p style="font-size:12px;line-height:1.5;color:${MUTED};margin:0;">${escapeHtml(opts.footerText).replace(/\n/g, "<br>")}</p>`
    : "";
  return `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8"></head>
  <body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:${INK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:32px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;">
            <tr>
              <td>
                <p style="font-size:13px;font-weight:bold;letter-spacing:0.02em;color:${BLUE};margin:0 0 24px;">${escapeHtml(BRAND.name)}</p>
                ${title}
                ${paragraphsHtml(opts.text)}
                ${infoBlock}
                ${cta}
                ${footer}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
