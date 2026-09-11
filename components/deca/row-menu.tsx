"use client";
import { useEffect, useRef, useState } from "react";

/**
 * #114 §4/§13 — the overflow "···" menu for a Historial row's less-frequent
 * actions (Corregir/Duplicar/PDF), replacing the old flat "Detalle ·
 * Inspección · Compartir · Corregir · Duplicar · PDF" link chain. Mirrors
 * `RowShare`'s popover mechanics (absolute panel, backdrop-less, click-away)
 * plus keyboard support RowShare doesn't have: Escape closes and returns
 * focus to the trigger, matching this project's a11y bar (WCAG 2.2 AA).
 */
export function RowMenu({
  label,
  children,
}: {
  /** Accessible name for the trigger button (icon/glyph-only, so this is the only label). */
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node) && e.target !== triggerRef.current) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onDocClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onDocClick);
    };
  }, [open]);

  return (
    <span className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        data-testid="row-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
      >
        <span aria-hidden>···</span>
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={label}
          data-testid="row-menu"
          className="absolute right-0 z-20 mt-1 flex w-44 flex-col rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-1 text-sm shadow-[0_8px_24px_rgba(15,23,32,0.12)]"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </span>
  );
}
