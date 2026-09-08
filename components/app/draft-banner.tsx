"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useT } from "@/lib/i18n/client";

/**
 * #76 — a discreet "you have a draft" strip on the panel home. Visually
 * distinct from an issued document (dashed border, "Borrador" label, no
 * status/PDF/QR). Continue resumes it at /crear; Discard asks first and only
 * removes the draft — never a generated DeCA.
 */
export function DraftBanner({ label, edited }: { label: string; edited: string }) {
  const t = useT();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function discard() {
    setBusy(true);
    try {
      await fetch("/api/deca/draft", { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      data-testid="draft-banner"
      className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 text-sm"
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
          {t.panel.draft.title}
        </p>
        <p className="mt-0.5 truncate font-medium">
          {label} <span className="font-normal text-[var(--color-text-muted)]">· {edited}</span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {confirming ? (
          <>
            <span className="text-xs text-[var(--color-text-muted)]">{t.panel.draft.confirm}</span>
            <button
              type="button"
              onClick={discard}
              disabled={busy}
              data-testid="draft-discard-confirm"
              className="font-medium text-[var(--color-danger)] underline disabled:opacity-55"
            >
              {t.panel.draft.discard}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            data-testid="draft-discard"
            className="text-[var(--color-text-muted)] underline"
          >
            {t.panel.draft.discard}
          </button>
        )}
        <Link
          href="/crear"
          data-testid="draft-continue"
          className="inline-flex min-h-9 items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 font-medium text-[var(--color-primary-contrast)] no-underline"
        >
          {t.panel.draft.continue}
        </Link>
      </div>
    </div>
  );
}
