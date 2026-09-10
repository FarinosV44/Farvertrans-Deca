"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/panel/icons";

type Hit = { label: string; sub: string; href: string };

/**
 * Company workspace command palette (PRODUCT #56 — power-user UX). Cmd/Ctrl+K
 * opens a modal, debounced search against `GET /api/search`, arrow keys +
 * Enter to navigate, Escape to close. Backend is company-scoped and read-only
 * (safe for every role, including `read_only`) — see `lib/data/search.ts`.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setHits([]);
    setActive(0);
  }, []);

  // Global shortcut: Cmd+K (Mac) / Ctrl+K (Windows/Linux) opens the palette
  // from anywhere in the workspace; Escape closes it.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        close();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        if (res.ok) {
          const data = (await res.json()) as { hits: Hit[] };
          setHits(data.hits);
          setActive(0);
        }
      } catch {
        /* transient — the palette just shows no results */
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  function go(hit: Hit) {
    close();
    router.push(hit.href);
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      go(hits[active]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="command-palette-trigger"
        aria-label="Buscar (Ctrl+K)"
        title="Buscar (Ctrl+K)"
        // hidden on a narrow phone (Ctrl+K still works); keeps the authed header
        // within a 360px viewport (#70)
        className="hidden min-h-10 min-w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] min-[520px]:inline-flex"
      >
        <SearchIcon width={18} height={18} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buscador"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[12vh]"
          onClick={close}
        >
          <div
            // Sized and styled to read as part of the workspace, not a generic
            // external command palette: app radius/border/surface, the same
            // elevated-panel shadow used by cards, a compact ~600px cap.
            className="w-full max-w-[560px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[0_8px_24px_rgba(15,23,32,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-3.5 py-2.5">
              <SearchIcon
                width={16}
                height={16}
                className="shrink-0 text-[var(--color-text-muted)]"
              />
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Buscar DeCA, transportista, matrícula o ruta…"
                data-testid="command-palette-input"
                aria-label="Buscar DeCA"
                className="min-h-7 w-full border-0 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
              />
              <kbd className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
                Esc
              </kbd>
            </div>

            {hits.length > 0 && (
              <ul data-testid="command-palette-results" className="max-h-72 overflow-y-auto py-1">
                {hits.map((h, i) => (
                  <li key={h.href}>
                    <button
                      type="button"
                      onClick={() => go(h)}
                      onMouseEnter={() => setActive(i)}
                      className={`flex w-full flex-col items-start gap-0.5 px-3.5 py-2 text-left text-sm ${
                        i === active ? "bg-[var(--color-surface)]" : ""
                      }`}
                    >
                      <span className="font-medium">{h.label}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{h.sub}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {q.trim().length >= 2 && hits.length === 0 && (
              <p className="px-3.5 py-5 text-center text-sm text-[var(--color-text-muted)]">
                Sin resultados para «{q.trim()}».
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
