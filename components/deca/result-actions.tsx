"use client";
import { useState } from "react";
import Link from "next/link";

/**
 * Result-screen actions in priority order (issue #8): view/download PDF, share
 * with the driver, copy link, save by creating an account.
 * The PDF download + QR become fully real in BUILD 08; this component owns the UI
 * and the share/copy behaviour.
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

  const waHref = `https://wa.me/?text=${encodeURIComponent(
    `Documento de control (DeCA) del transporte: ${publicUrl}`,
  )}`;
  const mailHref = `mailto:?subject=${encodeURIComponent("DeCA del transporte")}&body=${encodeURIComponent(
    `Documento de control (DeCA): ${publicUrl}`,
  )}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
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
        className="flex min-h-12 w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-primary)] font-medium text-[var(--color-primary)]"
      >
        Compartir con el conductor
      </button>
      {shareOpen && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
          <a className="block py-2" href={waHref} target="_blank" rel="noopener noreferrer">
            Enviar por WhatsApp
          </a>
          <a className="block py-2" href={mailHref}>
            Enviar por email
          </a>
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

      <Link
        href={claimToken ? `/registro?claim=${encodeURIComponent(claimToken)}` : "/registro"}
        data-testid="result-save"
        className="flex min-h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface)] font-medium no-underline"
      >
        Guardar este DeCA creando una cuenta
      </Link>
      <p className="text-xs text-[var(--color-text-muted)]">
        Crear la cuenta guarda tus documentos y tus datos habituales. No es un formulario comercial.
      </p>
    </div>
  );
}
