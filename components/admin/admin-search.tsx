"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SearchHit } from "@/lib/admin/search";

/**
 * Admin global search (ADMIN #33 §9). Debounced lookup against
 * `GET /api/admin/search`; every hit is a link to its detail page.
 */
export function AdminSearch() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.trim().length < 2) {
        setHits([]);
        return;
      }
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q.trim())}`);
        if (res.ok) {
          const data = (await res.json()) as { hits: SearchHit[] };
          setHits(data.hits);
          setOpen(true);
        }
      } catch {
        /* transient — the box just shows nothing */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const KIND_LABEL: Record<SearchHit["kind"], string> = {
    empresa: "Empresa",
    usuario: "Usuario",
    deca: "DeCA",
    error: "Error",
    prospecto: "Prospecto",
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        placeholder="Buscar empresa, usuario, referencia DeCA, código de error…"
        data-testid="admin-search-input"
        aria-label="Buscar en administración"
        className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
      />
      {open && hits.length > 0 && (
        <ul
          data-testid="admin-search-results"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg"
        >
          {hits.map((h, i) => (
            <li key={i}>
              <Link
                href={h.href}
                onClick={() => {
                  setOpen(false);
                  setQ("");
                }}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm no-underline hover:bg-[var(--color-surface)]"
              >
                <span className="truncate">
                  <span className="text-[var(--color-text)]">{h.label}</span>{" "}
                  <span className="text-xs text-[var(--color-text-muted)]">{h.sub}</span>
                </span>
                <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
                  {KIND_LABEL[h.kind]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
