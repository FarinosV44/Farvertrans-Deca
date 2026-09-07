"use client";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics/client";
import { useT } from "@/lib/i18n/client";

/**
 * #77 — one-tap share of the DeCA version in force straight from a list row
 * (history, dashboard). Native Web Share when available, otherwise an inline
 * WhatsApp + copy-link menu. `publicUrl` always comes from the row's
 * `currentVersion` token, so a corrected/superseded version is never the
 * default. Compact — the actions fit a 360px row with no horizontal scroll.
 */
export function RowShare({ publicUrl, reference }: { publicUrl: string; reference: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const shareText = `DeCA ${reference} · ${t.result.shareTextPrefix} ${publicUrl}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  async function primary() {
    if (canShare) {
      try {
        await navigator.share({ title: `DeCA ${reference}`, text: shareText, url: publicUrl });
        track("deca_shared");
        track("share_native");
      } catch {
        /* cancelled */
      }
      return;
    }
    setOpen((v) => !v);
  }

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
    <span className="relative inline-block">
      <button
        type="button"
        onClick={primary}
        aria-expanded={canShare ? undefined : open}
        data-testid="row-share"
        className="text-[var(--color-primary)] underline"
      >
        {t.historico.share}
      </button>
      {!canShare && open && (
        <span
          className="absolute right-0 z-20 mt-1 flex w-40 flex-col rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-1 text-sm shadow-[0_8px_24px_rgba(15,23,32,0.12)]"
          data-testid="row-share-menu"
        >
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              track("share_whatsapp");
              track("deca_shared");
            }}
            className="rounded-[6px] px-2 py-1.5 no-underline hover:bg-[var(--color-surface)]"
          >
            {t.result.whatsapp}
          </a>
          <button
            type="button"
            onClick={copy}
            className="rounded-[6px] px-2 py-1.5 text-left hover:bg-[var(--color-surface)]"
          >
            {copied ? t.result.linkCopied : t.result.copyLink}
          </button>
        </span>
      )}
    </span>
  );
}
