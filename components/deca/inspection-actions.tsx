"use client";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics/client";

/**
 * Modo Inspección actions (#69) — two big, unambiguous buttons: open the PDF of
 * the version currently in force, and share / copy its public link. The public
 * URL is passed in from the server (the stored current version), never built
 * from anything client-side. No effect on the legal `/d/[token]` flow.
 */
export function InspectionActions({
  publicUrl,
  reference,
}: {
  publicUrl: string;
  reference: string;
}) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const shareText = `DeCA ${reference} · Documento vigente: ${publicUrl}`;

  async function share() {
    try {
      await navigator.share({ title: `DeCA ${reference}`, text: shareText, url: publicUrl });
      track("inspection_shared");
    } catch {
      /* cancelled */
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      track("inspection_link_copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-5 flex flex-col gap-3">
      <a
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="inspection-open-pdf"
        onClick={() => track("inspection_pdf_opened")}
        className="flex min-h-14 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-base font-semibold text-[var(--color-primary-contrast)] no-underline hover:bg-[var(--color-primary-hover)]"
      >
        Abrir PDF vigente
      </a>
      <button
        type="button"
        onClick={canShare ? share : copy}
        data-testid="inspection-share"
        className="flex min-h-14 items-center justify-center rounded-[var(--radius-md)] border-2 border-[var(--color-primary)] text-base font-semibold text-[var(--color-primary)]"
      >
        {canShare ? "Compartir enlace" : copied ? "Enlace copiado" : "Copiar enlace"}
      </button>
      {canShare && (
        <button
          type="button"
          onClick={copy}
          data-testid="inspection-copy"
          className="text-sm font-medium text-[var(--color-text-muted)] underline"
        >
          {copied ? "Enlace copiado" : "o copiar enlace"}
        </button>
      )}
    </div>
  );
}
