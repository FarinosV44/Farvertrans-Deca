import { describe, expect, it } from "vitest";
import { escapeHtml, renderTransactionalHtml } from "@/lib/email-template";

describe("#96/D-179/D-180 — shared transactional email HTML shell", () => {
  it("declares UTF-8 explicitly — the fix for accents showing as mojibake/?", () => {
    const html = renderTransactionalHtml({ text: "Hola, confirma tu correo." });
    expect(html).toContain('<meta charset="utf-8">');
  });

  it("renders accented Spanish text byte-for-byte, not escaped/mangled", () => {
    const html = renderTransactionalHtml({
      text: "Confirmación de código de área — ñoño, corazón, á é í ó ú.",
    });
    expect(html).toContain("Confirmación de código de área");
    expect(html).toContain("ñoño, corazón, á é í ó ú");
  });

  it("with a link + ctaLabel: one button, and the same link visible as plain text too", () => {
    const link = "https://decaprofesional.es/verificar-email/abc123";
    const html = renderTransactionalHtml({
      text: `Confirma tu correo.\n\nAbre este enlace:\n${link}\n\nSi no has sido tú, ignora este mensaje.`,
      link,
      ctaLabel: "Confirmar correo",
    });
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs.every((h) => h === link)).toBe(true);
    expect(hrefs.length).toBeGreaterThanOrEqual(2); // the button + the inline linkified occurrence
    expect(html).toContain(">Confirmar correo<");
    expect(html).toContain(`>${link}<`);
  });

  it("without a link: no button, just the escaped paragraphs", () => {
    const html = renderTransactionalHtml({ text: "Aviso simple, sin enlace." });
    expect(html).not.toMatch(/<a /);
    expect(html).toContain("Aviso simple, sin enlace.");
  });

  it("footerText renders, escaped, with no unsubscribe language required or added", () => {
    const html = renderTransactionalHtml({
      text: "Cuerpo.",
      footerText: "Recibes este correo porque tienes una cuenta en DeCA Profesional.",
    });
    expect(html).toContain("Recibes este correo porque tienes una cuenta en DeCA Profesional.");
    expect(html.toLowerCase()).not.toMatch(/unsubscribe|darse de baja/);
  });

  it("has no <img> and no external asset — self-contained, lightweight", () => {
    const html = renderTransactionalHtml({ text: "Cuerpo." });
    expect(html).not.toMatch(/<img/i);
    expect(html).not.toMatch(/src=["']https?:/i);
  });

  it("escapeHtml neutralises markup and quotes", () => {
    expect(escapeHtml(`<b>${"&"}</b> "x" 'y'`)).toBe(
      "&lt;b&gt;&amp;&lt;/b&gt; &quot;x&quot; &#39;y&#39;",
    );
  });
});
