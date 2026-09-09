"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MAX_HISTORY_VIEWS,
  describeFilters,
  viewMatches,
  viewQuery,
  type FilterLabels,
  type HistoryFilters,
} from "@/lib/data/history-views";

export type ViewRow = { id: string; name: string; filters: HistoryFilters };

/**
 * #92 — saved views for the Histórico, as a compact chip row above the filters
 * the page already has.
 *
 * It is a comfort layer, not a new section: nothing here changes the filter
 * form, the table, "Limpiar filtros", or how a URL is built — applying a view
 * is a plain navigation to the same query string the form would have produced.
 * A user who never saves one sees a single "Guardar vista" button when they
 * have filters active, and nothing at all when they do not.
 */
export function SavedViews({
  views: initial,
  current,
  params,
  canSave,
  t,
}: {
  views: ViewRow[];
  /** The filters currently applied, i.e. what "Guardar vista" would store. */
  current: HistoryFilters;
  /** The raw search params, so the active chip survives non-filter params. */
  params: Record<string, string | string[] | undefined>;
  canSave: boolean;
  t: {
    myViews: string;
    save: string;
    namePrompt: string;
    rename: string;
    remove: string;
    /** Carries a literal `{name}` placeholder, substituted here. */
    removeConfirm: string;
    apply: string;
    duplicate: string;
    limit: string;
    error: string;
    /** Filter labels for the chip's title (never inlined here). */
    filterLabels: FilterLabels;
  };
}) {
  const router = useRouter();
  const [views, setViews] = useState<ViewRow[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const atLimit = views.length >= MAX_HISTORY_VIEWS;

  function fail(code: string | undefined) {
    setError(code === "duplicate_name" ? t.duplicate : t.error);
  }

  async function save() {
    const name = window.prompt(t.namePrompt);
    if (name === null) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/panel/vistas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, filters: current }),
    });
    setBusy(false);
    if (!res.ok) return fail((await res.json().catch(() => ({}))).error?.code);
    const { view } = (await res.json()) as { view: ViewRow };
    setViews((v) => [...v, view]);
  }

  async function rename(view: ViewRow) {
    const name = window.prompt(t.namePrompt, view.name);
    if (name === null) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/panel/vistas/${view.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setBusy(false);
    if (!res.ok) return fail((await res.json().catch(() => ({}))).error?.code);
    const { view: updated } = (await res.json()) as { view: ViewRow };
    setViews((v) => v.map((x) => (x.id === updated.id ? updated : x)));
  }

  async function remove(view: ViewRow) {
    if (!window.confirm(t.removeConfirm.replace("{name}", view.name))) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/panel/vistas/${view.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) return fail(undefined);
    setViews((v) => v.filter((x) => x.id !== view.id));
  }

  if (views.length === 0 && !canSave) return null;

  return (
    <div className="mt-4" data-testid="saved-views">
      <div className="flex flex-wrap items-center gap-2">
        {views.length > 0 && (
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
            {t.myViews}
          </span>
        )}
        {views.map((v) => {
          const active = viewMatches(v.filters, params);
          const q = viewQuery(v.filters);
          return (
            <span
              key={v.id}
              data-testid={`saved-view-${v.id}`}
              data-active={active ? "true" : "false"}
              className={`flex items-center gap-1 rounded-[var(--radius-sm)] border px-1 text-sm ${
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)] font-semibold text-[var(--color-primary)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]"
              }`}
            >
              <button
                type="button"
                title={describeFilters(v.filters, t.filterLabels)}
                aria-current={active ? "true" : undefined}
                aria-label={`${t.apply}: ${v.name}`}
                onClick={() => router.push(q ? `/panel/historico?${q}` : "/panel/historico")}
                className="min-h-9 px-1.5 font-inherit"
              >
                {v.name}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => rename(v)}
                aria-label={`${t.rename}: ${v.name}`}
                data-testid={`saved-view-rename-${v.id}`}
                className="min-h-9 px-1 text-xs text-[var(--color-text-muted)] underline"
              >
                {t.rename}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove(v)}
                aria-label={`${t.remove}: ${v.name}`}
                data-testid={`saved-view-remove-${v.id}`}
                className="min-h-9 px-1 text-xs text-[var(--color-text-muted)] underline"
              >
                {t.remove}
              </button>
            </span>
          );
        })}

        {canSave && !atLimit && (
          <button
            type="button"
            disabled={busy}
            onClick={save}
            data-testid="saved-view-save"
            className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm font-medium"
          >
            {t.save}
          </button>
        )}
        {canSave && atLimit && (
          <span className="text-sm text-[var(--color-text-muted)]">{t.limit}</span>
        )}
      </div>
      {error && (
        <p
          role="alert"
          data-testid="saved-views-error"
          className="mt-2 text-sm text-[var(--color-danger)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
