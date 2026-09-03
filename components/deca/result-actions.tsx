"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics/client";

/**
 * Driver-delivery actions (OPS #26), in priority order: open/download PDF →
 * send to driver (native share / WhatsApp / email) → copy link → print →
 * save (anonymous). Plus a "Comprobar QR" confidence tool. No PII in analytics.
 */
export function ResultActions({
  publicUrl,
  claimToken,
  versionNo = 1,
  pdfSha256,
  correctedReminder = false,
}: {
  publicUrl: string;
  claimToken?: string;
  versionNo?: number;
  pdfSha256?: string;
  correctedReminder?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const token = publicUrl.split("/d/")[1] ?? "";
  const shareText = `Documento de control (DeCA) del transporte: ${publicUrl}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const mailtoHref = `mailto:?subject=${encodeURIComponent("DeCA del transporte")}&body=${encodeURIComponent(
    `Documento de control (DeCA): ${publicUrl}`,
  )}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      track("public_link_copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "DeCA del transporte", text: shareText, url: publicUrl });
      track("share_native");
    } catch {
      /* user cancelled — no-op */
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
      {correctedReminder && (
        <p
          role="status"
          data-testid="reshare-reminder"
          className="rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-3 text-sm font-medium"
        >
          Este DeCA se ha corregido. Reenvía al conductor la versión actual — la anterior queda como
          histórico y sigue accesible por su URL.
        </p>
      )}

      <a
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="result-download"
        onClick={() => track("pdf_opened")}
        className="flex min-h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] font-medium text-[var(--color-primary-contrast)] no-underline hover:bg-[var(--color-primary-hover)]"
      >
        Abrir / descargar PDF
      </a>

      <button
        type="button"
        onClick={() => {
          setShareOpen((v) => !v);
          if (!shareOpen) track("share_opened");
        }}
        aria-expanded={shareOpen}
        data-testid="result-share-toggle"
        className="flex min-h-12 w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-primary)] font-medium text-[var(--color-primary)]"
      >
        Enviar al conductor
      </button>
      {shareOpen && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
          {canNativeShare && (
            <button
              type="button"
              onClick={nativeShare}
              data-testid="share-native"
              className="block w-full py-2 text-left"
            >
              Compartir…
            </button>
          )}
          <a
            className="block py-2"
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="share-whatsapp"
            onClick={() => {
              track("share_whatsapp");
              track("deca_shared");
            }}
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

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copy}
          data-testid="result-copy"
          className="flex min-h-12 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] font-medium"
        >
          {copied ? "Enlace copiado" : "Copiar enlace"}
        </button>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="result-print"
          onClick={() => track("print_clicked")}
          className="flex min-h-12 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] font-medium no-underline"
        >
          Imprimir
        </a>
      </div>

      <button
        type="button"
        onClick={() => {
          setVerifyOpen((v) => !v);
          if (!verifyOpen) track("qr_verify_opened");
        }}
        aria-expanded={verifyOpen}
        data-testid="qr-verify-toggle"
        className="text-sm underline"
      >
        Comprobar QR
      </button>
      {verifyOpen && (
        <div
          data-testid="qr-verify-panel"
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm"
        >
          <p className="font-medium">Este es el enlace que lleva el QR del PDF:</p>
          <p className="mt-1 break-all font-mono text-xs">{publicUrl}</p>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Versión {versionNo}
            {pdfSha256 ? ` · SHA-256 ${pdfSha256.slice(0, 16)}…` : ""}
          </p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block"
          >
            Abrir el enlace de inspección en una pestaña nueva
          </a>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Para la comprobación real, escanea el QR con otro móvil.
          </p>
        </div>
      )}

      {claimToken && (
        <Link
          href={`/registro?claim=${encodeURIComponent(claimToken)}`}
          data-testid="result-save"
          className="flex min-h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface)] font-medium no-underline"
        >
          Guardar mis DeCA creando una cuenta
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
