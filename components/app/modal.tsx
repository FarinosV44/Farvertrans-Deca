"use client";
import { useEffect, useRef } from "react";

/**
 * Generic focus-managed overlay (#113 §7 — replaces the old `<details>`
 * "Añadir" disclosure). Same pattern already used by `command-palette.tsx`:
 * fixed backdrop, `role="dialog"` + `aria-modal`, Escape/backdrop-click to
 * close, first focusable field focused on open.
 */
export function Modal({
  open,
  onClose,
  titleId,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** id of the element (usually an <h2>) that labels this dialog for a11y. */
  titleId: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const first = panelRef.current?.querySelector<HTMLElement>("input, select, textarea, button");
    first?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 px-4 py-[8vh]"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="w-full max-w-[520px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-[0_8px_24px_rgba(15,23,32,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
