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
        className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        <SearchIcon width={18} height={18} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buscador"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh]"
          onClick={close}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
              <SearchIcon
                width={18}
                height={18}
                className="shrink-0 text-[var(--color-text-muted)]"
              />
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Buscar por referencia, transportista, matrícula, ruta…"
                data-testid="command-palette-input"
                aria-label="Buscar DeCA"
                className="min-h-8 w-full border-0 bg-transparent text-sm outline-none"
              />
              <kbd className="shrink-0 rounded-[4px] border border-[var(--color-border)] px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
                Esc
              </kbd>
            </div>

            {hits.length > 0 && (
              <ul data-testid="command-palette-results" className="max-h-80 overflow-y-auto py-1">
                {hits.map((h, i) => (
                  <li key={h.href}>
                    <button
                      type="button"
                      onClick={() => go(h)}
                      onMouseEnter={() => setActive(i)}
                      className={`flex w-full flex-col items-start gap-0.5 px-4 py-2 text-left text-sm ${
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
              <p className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                Sin resultados para «{q.trim()}».
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
