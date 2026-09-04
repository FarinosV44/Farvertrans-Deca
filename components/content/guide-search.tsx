"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArticleCard } from "@/components/content/article-card";
import type { ContentItem } from "@/lib/content/cms";

type Guide = Pick<
  ContentItem,
  "id" | "slug" | "title" | "excerpt" | "category" | "publishedAt" | "body"
>;

/**
 * Simple client-side search/filter over the (small, server-fetched) guide list
 * — no separate API route needed while the catalog is this size (SEO #32
 * follow-up). Filters by free text and by category.
 */
export function GuideSearch({ guides }: { guides: Guide[] }) {
  const [q, setQ] = useState("");
  const categories = useMemo(
    () => [...new Set(guides.map((g) => g.category).filter((c): c is string => !!c))].sort(),
    [guides],
  );
  const [category, setCategory] = useState<string>("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return guides.filter((g) => {
      if (category && g.category !== category) return false;
      if (!needle) return true;
      return `${g.title} ${g.excerpt}`.toLowerCase().includes(needle);
    });
  }, [guides, q, category]);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[220px] flex-1 text-sm">
          <span className="block font-medium">Buscar en las guías</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="p. ej. corregir, remolque, NIF…"
            data-testid="guide-search-input"
            className="mt-1 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
          />
        </label>
        {categories.length > 1 && (
          <label className="text-sm">
            <span className="block font-medium">Tema</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              data-testid="guide-category-filter"
              className="mt-1 min-h-11 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
            >
              <option value="">Todos</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--color-text-muted)]" data-testid="guide-search-empty">
          Ninguna guía coincide con «{q}». Prueba con otra palabra o consulta{" "}
          <Link href="/soy-obligado" className="underline">
            ¿Estoy obligado?
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2" data-testid="guide-search-results">
          {filtered.map((g) => (
            <ArticleCard key={g.id} item={g} href={`/guias/${g.slug}`} />
          ))}
        </div>
      )}
    </div>
  );
}
