"use client";

import { useState } from "react";
import { track } from "@/lib/analytics/client";

/**
 * The QR / public-inspection card (PRODUCT #36 §3). Shows the REAL current-version
 * QR (rendered server-side from the same URL that goes in the PDF), the exact
 * HTTPS URL, and copy / open / download actions. Never a decorative placeholder.
 */
export function QrCard({
  qrDataUri,
  publicUrl,
  versionNo,
}: {
  qrDataUri: string;
  publicUrl: string;
  versionNo: number;
}) {
  const [copied, setCopied] = useState(false);

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

  return (
    <section
      data-testid="qr-card"
      aria-labelledby="qr-card-h"
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
    >
      <h3 id="qr-card-h" className="text-sm font-bold">
        Inspección pública
      </h3>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Escanéalo para abrir directamente el PDF vigente. Es el mismo QR que lleva el documento.
      </p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUri}
          alt={`Código QR de inspección del DeCA, versión ${versionNo}`}
          width={148}
          height={148}
          className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white p-1"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[var(--color-text-muted)]">URL pública (HTTPS)</p>
          <p data-testid="qr-card-url" className="mt-0.5 break-all font-mono text-xs">
            {publicUrl}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("pdf_opened")}
              className="min-h-10 rounded-[var(--radius-sm)] border border-[var(--color-primary)] px-3 py-2 text-sm font-medium text-[var(--color-primary)] no-underline"
            >
              Abrir URL pública
            </a>
            <button
              type="button"
              onClick={copy}
              data-testid="qr-card-copy"
              className="min-h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm font-medium"
            >
              {copied ? "Copiada" : "Copiar URL"}
            </button>
            <a
              href={qrDataUri}
              download={`deca-qr-v${versionNo}.png`}
              className="min-h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm font-medium no-underline"
            >
              Descargar QR
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
