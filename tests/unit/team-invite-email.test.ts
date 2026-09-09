import { describe, expect, it } from "vitest";
import { buildInviteEmail } from "@/lib/team-invite-email";

const LINK = "https://decaprofesional.es/registro?invite=abc123";

describe("#102/#106/D-179 — team invite email content (pure)", () => {
  it("subject is plain and transactional — no marketing language", () => {
    const { subject } = buildInviteEmail({
      companyName: "Transportes Ejemplo SL",
      role: "member",
      link: LINK,
    });
    expect(subject).toBe("Te han invitado a unirte a Transportes Ejemplo SL en DeCA Profesional");
    // no shouting caps, no emoji, no "gratis"/urgency words
    expect(subject).not.toMatch(/[A-Z]{4,}/); // no ALL-CAPS word
    expect(subject).not.toMatch(/gratis|urgente|últim[oa]|ahora mismo/i);
    expect(subject).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u); // no emoji
  });

  it("falls back to a generic label for an empty/missing company name", () => {
    const { subject, text } = buildInviteEmail({ companyName: "  ", role: "member", link: LINK });
    expect(subject).toContain("Una empresa");
    expect(text).toContain("Una empresa");
  });

  it("the plain-text part carries the real link, and the company + role, informatively", () => {
    const { text } = buildInviteEmail({ companyName: "Acme", role: "owner", link: LINK });
    expect(text).toContain(LINK);
    expect(text).toContain("Empresa: Acme");
    expect(text).toContain("Rol asignado: Administrador");
  });

  it.each([
    ["owner", "Administrador"],
    ["member", "Operador"],
    ["read_only", "Solo lectura"],
  ] as const)("role %s renders as %s in both text and HTML", (role, label) => {
    const { text, html } = buildInviteEmail({ companyName: "Acme", role, link: LINK });
    expect(text).toContain(label);
    expect(html).toContain(label);
  });

  it("the HTML part has a title, a compact company/role/expiry info block, and one CTA link", () => {
    const { html } = buildInviteEmail({ companyName: "Acme", role: "member", link: LINK });
    expect(html).toContain("Te han invitado a unirte a Acme");
    expect(html).toContain("Empresa");
    expect(html).toContain("Rol asignado");
    expect(html).toContain("Caduca");
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs.every((h) => h === LINK)).toBe(true); // every link is the SAME real, direct URL
    expect(html).toContain(">Aceptar invitación<");
    // the raw URL is visible as text too (a fallback for the button)
    expect(html).toContain(`>${LINK}<`);
  });

  it("HTML-escapes an untrusted company name — no injection into the email markup", () => {
    const { html, text } = buildInviteEmail({
      companyName: `<script>alert(1)</script> & "quoted"`,
      role: "member",
      link: LINK,
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;quoted&quot;");
    // the plain-text part is untouched (no HTML entities needed there)
    expect(text).toContain(`<script>alert(1)</script> & "quoted"`);
  });

  it("carries no unsubscribe/newsletter language — this is a one-time transactional notice", () => {
    const { text, html } = buildInviteEmail({ companyName: "Acme", role: "member", link: LINK });
    for (const body of [text, html]) {
      expect(body.toLowerCase()).not.toMatch(/unsubscribe|darse de baja|cancelar suscripci/);
    }
  });

  it("the HTML has no <img> and no external asset — a fully self-contained, lightweight body", () => {
    const { html } = buildInviteEmail({ companyName: "Acme", role: "member", link: LINK });
    expect(html).not.toMatch(/<img/i);
    expect(html).not.toMatch(/src=["']https?:/i);
  });
});
