"use client";
import { useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics/client";

/**
 * Result-screen actions in priority order (issue #8): view/download PDF, share
 * with the driver, copy link, save by creating an account.
 */
export function ResultActions({
  publicUrl,
  claimToken,
}: {
  publicUrl: string;
  claimToken?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const token = publicUrl.split("/d/")[1] ?? "";
  const waHref = `https://wa.me/?text=${encodeURIComponent(
    `Documento de control (DeCA) del transporte: ${publicUrl}`,
  )}`;
  const mailtoHref = `mailto:?subject=${encodeURIComponent("DeCA del transporte")}&body=${encodeURIComponent(
    `Documento de control (DeCA): ${publicUrl}`,
  )}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      track("deca_shared");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (sending || !emailTo) return;
    setSending(true);
    setEmailMsg(null);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, to: emailTo }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.sent) {
        track("deca_shared");
        setEmailMsg("Enviado.");
      } else if (data.mailtoFallback) {
        setEmailMsg("El envío por email no está configurado. Abriendo tu cliente de correo…");
        window.location.href = mailtoHref;
      } else {
        setEmailMsg("No se pudo enviar. Usa el enlace o WhatsApp.");
      }
    } catch {
      setEmailMsg("Sin conexión.");
    }
    setSending(false);
  }

  return (
    <div className="mt-6 space-y-3">
      <a
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="result-download"
        className="flex min-h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] font-medium text-[var(--color-primary-contrast)] no-underline hover:bg-[var(--color-primary-hover)]"
      >
        Ver / descargar PDF
      </a>

      <button
        type="button"
        onClick={() => setShareOpen((v) => !v)}
        aria-expanded={shareOpen}
        data-testid="result-share-toggle"
        className="flex min-h-12 w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-primary)] font-medium text-[var(--color-primary)]"
      >
        Compartir con el conductor
      </button>
      {shareOpen && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
          <a
            className="block py-2"
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("deca_shared")}
          >
            Enviar por WhatsApp
          </a>
          <form onSubmit={sendEmail} className="mt-1 flex flex-wrap items-end gap-2">
            <label className="flex-1">
              <span className="block text-sm font-medium">Email del conductor</span>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
              />
            </label>
            <button
              type="submit"
              disabled={sending}
              className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
            >
              Enviar
            </button>
          </form>
          {emailMsg && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{emailMsg}</p>}
        </div>
      )}

      <button
        type="button"
        onClick={copy}
        data-testid="result-copy"
        className="flex min-h-12 w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] font-medium"
      >
        {copied ? "Enlace copiado" : "Copiar enlace"}
      </button>

      {claimToken && (
        <Link
          href={`/registro?claim=${encodeURIComponent(claimToken)}`}
          data-testid="result-save"
          className="flex min-h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface)] font-medium no-underline"
        >
          Guardar este DeCA creando una cuenta
        </Link>
      )}
      {claimToken && (
        <p className="text-xs text-[var(--color-text-muted)]">
          Crear la cuenta guarda tus documentos y tus datos habituales. No es un formulario
          comercial.
        </p>
      )}
    </div>
  );
}
