"use client";
import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/**
 * Generic focus-managed overlay (#113 §7 — replaces the old `<details>`
 * "Añadir" disclosure). Same pattern already used by `command-palette.tsx`:
 * fixed backdrop, `role="dialog"` + `aria-modal`, Escape/backdrop-click to
 * close, first focusable field focused on open. WCAG 2.2 AA (2.4.3) also
 * requires trapping Tab/Shift+Tab inside the dialog while it's open, and
 * restoring focus to whatever opened it once it closes — neither existed
 * before (a full pass on Tab moved focus into the page behind the backdrop).
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
    const openerFocused = document.activeElement as HTMLElement | null;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      // Cycle inside the dialog — a plain Tab pass must never reach the page
      // behind the backdrop while it's open.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    first?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Return focus to whatever opened the dialog (e.g. the "Añadir" button)
      // rather than leaving it on `<body>` or wherever the last Tab landed.
      openerFocused?.focus();
    };
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
