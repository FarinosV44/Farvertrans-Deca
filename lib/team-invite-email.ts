import { BRAND } from "@/lib/brand";
import { renderTransactionalHtml } from "@/lib/email-template";

export type InviteRole = "owner" | "member" | "read_only";

const ROLE_LABEL: Record<InviteRole, string> = {
  owner: "Administrador",
  member: "Operador",
  read_only: "Solo lectura",
};

/**
 * #106/D-179 — the team-invite email's content, kept out of the API route
 * and pure (no DB, no fetch) so it's directly unit-testable. Deliberately
 * "transactional", not "marketing": a simple subject (no ALL CAPS, no
 * emoji, no "gratis"/urgency), a plain-text part AND a minimal HTML part
 * (shared shell, `lib/email-template.ts`) with a compact company/role/
 * expiry info block (#106's own requested structure), one CTA button, no
 * images, explicit UTF-8. No unsubscribe language — a one-time
 * transactional notice a person received by being invited, not a newsletter.
 */
export function buildInviteEmail(opts: {
  companyName: string;
  role: InviteRole;
  link: string;
}): { subject: string; text: string; html: string } {
  const company = opts.companyName.trim() || "Una empresa";
  const roleLabel = ROLE_LABEL[opts.role];
  const subject = `Te han invitado a unirte a ${company} en ${BRAND.name}`;
  const title = `Te han invitado a unirte a ${company}`;

  const text = [
    `${company} te ha invitado a unirte a su equipo en ${BRAND.name}.`,
    "",
    `Empresa: ${company}`,
    `Rol asignado: ${roleLabel}`,
    "",
    "Acepta la invitación aquí:",
    opts.link,
    "",
    "Este enlace es válido durante 14 días.",
  ].join("\n");

  const footerText = [
    `Has recibido este correo porque ${company} te ha invitado a su equipo en ${BRAND.name}.`,
    "Si no esperabas esta invitación, puedes ignorar este mensaje.",
  ].join("\n");

  const html = renderTransactionalHtml({
    title,
    text: `${company} te ha invitado a unirte a su equipo en ${BRAND.name}.`,
    infoRows: [
      { label: "Empresa", value: company },
      { label: "Rol asignado", value: roleLabel },
      { label: "Caduca", value: "en 14 días" },
    ],
    link: opts.link,
    ctaLabel: "Aceptar invitación",
    footerText,
  });

  return {
    subject,
    text: `${text}\n\n${footerText}`,
    html,
  };
}
