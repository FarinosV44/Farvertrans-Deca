"use client";

import { useMemo, useState } from "react";
import { contentWarnings, type ContentInput } from "@/lib/content/schema";
import { suggestRelatedByCategory, type RelatedCandidate } from "@/lib/content/internal-linking";

type Values = ContentInput & { sourcesText: string; tagsText: string };

const EMPTY: Values = {
  type: "guide",
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  category: "",
  tags: [],
  tagsText: "",
  heroImage: "",
  authorName: "",
  focusKeyword: "",
  seoTitle: "",
  metaDescription: "",
  canonicalOverride: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  robotsIndex: true,
  sources: [],
  sourcesText: "",
  relatedSlugs: [],
  ctaLabel: "",
  lastReviewedAt: "",
};

function parseSources(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.lastIndexOf("|");
      return i > 0
        ? { label: l.slice(0, i).trim(), url: l.slice(i + 1).trim() }
        : { label: l, url: l };
    });
}

export function ContentEditor({
  initial,
  id,
  status,
  candidates = [],
}: {
  initial?: Partial<Values>;
  id?: string;
  status?: string;
  /** Other published guides/blog posts, for the related-content picker (#97). */
  candidates?: RelatedCandidate[];
}) {
  const [v, setV] = useState<Values>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [relatedFilter, setRelatedFilter] = useState("");

  const set =
    <K extends keyof Values>(k: K) =>
    (val: Values[K]) =>
      setV((s) => ({ ...s, [k]: val }));

  const warnings = useMemo(
    () =>
      contentWarnings({
        title: v.title,
        seoTitle: v.seoTitle || "",
        metaDescription: v.metaDescription || "",
        body: v.body,
        sources: parseSources(v.sourcesText),
        category: v.category || "",
        type: v.type,
      }),
    [v],
  );

  // #97 — related-content picker: same-category suggestions (excluding this
  // item itself once it has an id) plus a filterable manual list. Both draw
  // from the same `candidates` prop; the suggestions are just a filtered
  // subset, so "add" and the manual checkbox always agree.
  const otherCandidates = useMemo(() => candidates.filter((c) => c.id !== id), [candidates, id]);
  const suggested = useMemo(
    () =>
      suggestRelatedByCategory(otherCandidates, { id: id ?? "", category: v.category || null }, 5),
    [otherCandidates, id, v.category],
  );
  const filteredCandidates = useMemo(() => {
    const q = relatedFilter.trim().toLowerCase();
    if (!q) return otherCandidates;
    return otherCandidates.filter(
      (c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [otherCandidates, relatedFilter]);

  function toggleRelated(slug: string) {
    setV((s) => ({
      ...s,
      relatedSlugs: s.relatedSlugs.includes(slug)
        ? s.relatedSlugs.filter((x) => x !== slug)
        : [...s.relatedSlugs, slug],
    }));
  }
  function addRelated(slug: string) {
    setV((s) =>
      s.relatedSlugs.includes(slug) ? s : { ...s, relatedSlugs: [...s.relatedSlugs, slug] },
    );
  }

  function payload() {
    return {
      type: v.type,
      slug: v.slug,
      title: v.title,
      excerpt: v.excerpt,
      body: v.body,
      category: v.category,
      tags: v.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      heroImage: v.heroImage,
      authorName: v.authorName,
      focusKeyword: v.focusKeyword,
      seoTitle: v.seoTitle,
      metaDescription: v.metaDescription,
      canonicalOverride: v.canonicalOverride,
      ogTitle: v.ogTitle,
      ogDescription: v.ogDescription,
      ogImage: v.ogImage,
      robotsIndex: v.robotsIndex,
      sources: parseSources(v.sourcesText),
      relatedSlugs: v.relatedSlugs,
      ctaLabel: v.ctaLabel,
      lastReviewedAt: v.lastReviewedAt,
    };
  }

  async function save(next?: { publish?: boolean; unpublish?: boolean; archive?: boolean }) {
    setSaving(true);
    setError(null);
    try {
      const url = id ? `/api/admin/contenido/${id}` : "/api/admin/contenido";
      const res = await fetch(url, {
        method: id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload(), _action: next }),
      });
      const data = await res
        .json()
        .catch(() => ({}) as { id?: string; error?: { message?: string } });
      if (!res.ok || !data?.id) {
        setError(
          data?.error?.message ??
            (res.status === 404
              ? "Tu sesión de administración ha caducado. Vuelve a verificar el código y reintenta."
              : "No se pudo guardar."),
        );
        return;
      }
      // Hard navigation (not router.push): in production the App Router client
      // cache can serve a stale/empty version of the destination after a soft
      // navigation, so the freshly-saved content looked unsaved and the
      // Publicar button never appeared (same class as D-149 / D-151).
      const dest = `/admin/contenido/${data.id}`;
      if (typeof window !== "undefined") window.location.assign(dest);
    } catch {
      setError("Sin conexión.");
    } finally {
      setSaving(false);
    }
  }

  const field = (
    label: string,
    key: keyof Values,
    opts: { textarea?: boolean; rows?: number; placeholder?: string; hint?: string } = {},
  ) => (
    <label className="mt-3 block text-sm">
      <span className="font-medium">{label}</span>
      {opts.hint && (
        <span className="ml-2 text-xs text-[var(--color-text-muted)]">{opts.hint}</span>
      )}
      {opts.textarea ? (
        <textarea
          value={String(v[key] ?? "")}
          data-testid={`ce-${String(key)}`}
          onChange={(e) => set(key)(e.target.value as never)}
          rows={opts.rows ?? 4}
          placeholder={opts.placeholder}
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] p-2 font-mono text-sm"
        />
      ) : (
        <input
          value={String(v[key] ?? "")}
          data-testid={`ce-${String(key)}`}
          onChange={(e) => set(key)(e.target.value as never)}
          placeholder={opts.placeholder}
          className="mt-1 min-h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm"
        />
      )}
    </label>
  );

  return (
    <div className="max-w-3xl space-y-4">
      {error && (
        <p
          role="alert"
          data-testid="ce-error"
          className="rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] p-2 text-sm text-[var(--color-danger)]"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">
          <span className="font-medium">Tipo</span>
          <select
            value={v.type}
            data-testid="ce-type"
            onChange={(e) => set("type")(e.target.value as "guide" | "blog")}
            disabled={!!id}
            className="ml-2 min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
          >
            <option value="guide">Guía</option>
            <option value="blog">Blog</option>
          </select>
        </label>
        {status && <span className="text-xs text-[var(--color-text-muted)]">Estado: {status}</span>}
      </div>

      {field("Título", "title")}
      {field("Slug", "slug", {
        hint: "minúsculas y guiones",
        placeholder: "como-corregir-un-deca",
      })}
      {field("Extracto", "excerpt", { textarea: true, rows: 2 })}
      {field("Cuerpo (Markdown)", "body", {
        textarea: true,
        rows: 16,
        hint: "## títulos · - listas · > callout · | tablas | · [[cta]] · ::: faq",
      })}
      {field("Categoría", "category")}
      {field("Etiquetas (coma)", "tagsText")}
      {field("Autor / editor", "authorName")}
      {field("Última revisión (YYYY-MM-DD)", "lastReviewedAt")}
      {field("Imagen de portada (URL)", "heroImage")}
      {field("Fuentes (una por línea: Etiqueta | URL)", "sourcesText", { textarea: true, rows: 3 })}
      {field("Texto del CTA final", "ctaLabel", { placeholder: "Crea tu DeCA ahora" })}

      <fieldset className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
        <legend className="px-1 text-sm font-bold">Contenido relacionado</legend>
        <p className="text-xs text-[var(--color-text-muted)]">
          Se muestra en el bloque &ldquo;Sigue leyendo&rdquo; del artículo público (#97).
        </p>

        {v.relatedSlugs.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2" data-testid="ce-related-selected">
            {v.relatedSlugs.map((slug) => {
              const c = otherCandidates.find((x) => x.slug === slug);
              return (
                <li key={slug}>
                  <button
                    type="button"
                    onClick={() => toggleRelated(slug)}
                    data-testid={`ce-related-remove-${slug}`}
                    className="min-h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
                    title="Quitar"
                  >
                    {c?.title ?? slug} ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {suggested.length > 0 && (
          <div className="mt-3" data-testid="ce-related-suggested">
            <p className="text-xs font-medium">Sugerencias (misma categoría)</p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {suggested.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => addRelated(c.slug)}
                    disabled={v.relatedSlugs.includes(c.slug)}
                    data-testid={`ce-related-suggest-${c.slug}`}
                    className="min-h-8 rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border)] px-2 text-xs disabled:opacity-40"
                  >
                    + {c.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <label className="mt-3 block text-sm">
          <span className="font-medium">Buscar contenido publicado</span>
          <input
            value={relatedFilter}
            data-testid="ce-related-filter"
            onChange={(e) => setRelatedFilter(e.target.value)}
            placeholder="Filtrar por título o slug…"
            className="mt-1 min-h-9 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm"
          />
        </label>
        <ul
          className="mt-2 max-h-48 space-y-1 overflow-y-auto text-sm"
          data-testid="ce-related-list"
        >
          {filteredCandidates.length === 0 && (
            <li className="text-xs text-[var(--color-text-muted)]">Sin resultados.</li>
          )}
          {filteredCandidates.map((c) => (
            <li key={c.id}>
              <label className="flex items-center gap-2 py-0.5">
                <input
                  type="checkbox"
                  checked={v.relatedSlugs.includes(c.slug)}
                  onChange={() => toggleRelated(c.slug)}
                  data-testid={`ce-related-item-${c.slug}`}
                />
                <span>{c.title}</span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  /{c.type === "guide" ? "guias" : "blog"}/{c.slug}
                  {c.category ? ` · ${c.category}` : ""}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
        <legend className="px-1 text-sm font-bold">SEO</legend>
        {field("Título SEO", "seoTitle", { hint: "≤ 60 caracteres" })}
        {field("Meta descripción", "metaDescription", { textarea: true, rows: 2, hint: "70–160" })}
        {field("Canonical (solo si difiere)", "canonicalOverride")}
        {field("OG título", "ogTitle")}
        {field("OG descripción", "ogDescription", { textarea: true, rows: 2 })}
        {field("OG imagen (URL)", "ogImage")}
        {field("Palabra clave (guía editorial)", "focusKeyword")}
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={v.robotsIndex}
            data-testid="ce-robotsIndex"
            onChange={(e) => set("robotsIndex")(e.target.checked)}
          />
          Indexable (robots index/follow)
        </label>
      </fieldset>

      {warnings.length > 0 && (
        <div
          data-testid="ce-warnings"
          className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,#b26a00_40%,transparent)] bg-[color-mix(in_srgb,#b26a00_10%,transparent)] p-3 text-sm"
        >
          <p className="font-bold text-[#8a5200]">Avisos editoriales</p>
          <ul className="mt-1 list-disc pl-5">
            {warnings.map((w, i) => (
              <li key={i}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          data-testid="ce-preview-toggle"
          className="text-sm underline"
        >
          {preview ? "Ocultar vista previa" : "Vista previa"}
        </button>
        {preview && (
          <div className="mt-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <h3 className="text-xl font-bold">{v.title || "Sin título"}</h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{v.excerpt}</p>
            <pre className="mt-3 whitespace-pre-wrap text-sm">{v.body}</pre>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 border-t border-[var(--color-border)] pt-4">
        <button
          type="button"
          onClick={() => save()}
          disabled={saving}
          data-testid="ce-save-draft"
          className="min-h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 text-sm font-medium disabled:opacity-55"
        >
          {saving ? "Guardando…" : id ? "Guardar cambios" : "Guardar borrador"}
        </button>
        {id && status !== "published" && (
          <button
            type="button"
            onClick={() => save({ publish: true })}
            disabled={saving}
            data-testid="ce-publish"
            className="min-h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
          >
            Publicar
          </button>
        )}
        {id && status === "published" && (
          <button
            type="button"
            onClick={() => save({ unpublish: true })}
            disabled={saving}
            data-testid="ce-unpublish"
            className="min-h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 text-sm font-medium"
          >
            Despublicar
          </button>
        )}
        {id && (
          <button
            type="button"
            onClick={() => save({ archive: true })}
            disabled={saving}
            data-testid="ce-archive"
            className="min-h-10 rounded-[var(--radius-sm)] px-4 text-sm font-medium text-[var(--color-danger)]"
          >
            Archivar
          </button>
        )}
        {id && (
          <a
            href={`/${v.type === "guide" ? "guias" : "blog"}/${v.slug}?preview=1`}
            target="_blank"
            rel="noreferrer"
            className="min-h-10 self-center text-sm underline"
          >
            Ver vista previa pública →
          </a>
        )}
      </div>
    </div>
  );
}
