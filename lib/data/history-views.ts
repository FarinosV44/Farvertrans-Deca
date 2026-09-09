/**
 * #92 — saved views over the Histórico filters.
 *
 * A view is only ever a NAMED COMBINATION of the filters `/panel/historico`
 * already has. The issue is explicit that the feature creates no new filters
 * and changes no architecture, so `HISTORY_FILTER_KEYS` is deliberately the
 * exact set the page's own form submits, and a unit test pins it there: adding
 * a filter to this module without adding it to the page (or the reverse) fails
 * the suite rather than silently producing views nobody can reproduce by hand.
 *
 * Everything here is pure — the page, the API route and the chips all read the
 * same answers, so an applied view and a hand-built URL can never disagree.
 */

/** Exactly the filters the Histórico form already submits. Order is canonical. */
export const HISTORY_FILTER_KEYS = ["q", "from", "to", "carrier", "plate"] as const;

export type HistoryFilterKey = (typeof HISTORY_FILTER_KEYS)[number];
export type HistoryFilters = Partial<Record<HistoryFilterKey, string>>;

/** One user may keep this many views before the chip row stops being scannable. */
export const MAX_HISTORY_VIEWS = 12;

/** Chips have to stay one line; longer names are cut rather than stored whole. */
const MAX_NAME_LENGTH = 40;

type Params = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

/**
 * The filters actually present in a set of search params. Unknown params are
 * ignored (so pagination or a tracking parameter never becomes part of a view)
 * and blank values are treated as absent, exactly as the page treats them.
 */
export function filtersFromParams(params: Params): HistoryFilters {
  const out: HistoryFilters = {};
  for (const k of HISTORY_FILTER_KEYS) {
    const v = one(params[k])?.trim();
    if (v) out[k] = v;
  }
  return out;
}

/** True when there is something worth saving — what gates the "Guardar vista" button. */
export function hasActiveFilters(filters: HistoryFilters): boolean {
  return HISTORY_FILTER_KEYS.some((k) => !!filters[k]);
}

/**
 * The query string that applies a view — identical to what the filter form
 * would have produced, in the canonical key order, so the same view always
 * yields the same URL and `viewMatches()` can compare them.
 */
export function viewQuery(filters: HistoryFilters): string {
  const sp = new URLSearchParams();
  for (const k of HISTORY_FILTER_KEYS) {
    const v = filters[k];
    if (v) sp.set(k, v);
  }
  return sp.toString();
}

/**
 * Whether a view is the one currently applied, so the active chip can be marked.
 * Compares only the filter keys: an extra non-filter param in the URL must not
 * deselect the view the user just clicked.
 */
export function viewMatches(filters: HistoryFilters, params: Params): boolean {
  const current = filtersFromParams(params);
  return HISTORY_FILTER_KEYS.every((k) => (filters[k] ?? "") === (current[k] ?? ""));
}

/**
 * A valid, storable view name, or null when the input cannot be one. Inner
 * whitespace is collapsed so a pasted name cannot break the chip row.
 */
export function historyViewName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const name = input.trim().replace(/\s+/g, " ");
  if (!name) return null;
  return name.slice(0, MAX_NAME_LENGTH);
}

/**
 * The labels this module needs, supplied by the caller from the locale
 * dictionary. Never inlined here: user-facing strings live in `lib/i18n`
 * (code-style rule), and this module has to stay pure and locale-agnostic.
 */
export type FilterLabels = Record<HistoryFilterKey, string> & { none: string };

/**
 * A short human summary of what a view holds, shown as the chip's title so a
 * name like "Francia" is still explainable six months later.
 */
export function describeFilters(filters: HistoryFilters, labels: FilterLabels): string {
  const parts = HISTORY_FILTER_KEYS.filter((k) => filters[k]).map(
    (k) => `${labels[k]}: ${filters[k]}`,
  );
  return parts.length ? parts.join(" · ") : labels.none;
}
