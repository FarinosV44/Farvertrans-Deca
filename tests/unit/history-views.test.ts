import { describe, expect, it } from "vitest";
import {
  HISTORY_FILTER_KEYS,
  MAX_HISTORY_VIEWS,
  historyViewName,
  filtersFromParams,
  hasActiveFilters,
  viewQuery,
  viewMatches,
  describeFilters,
} from "@/lib/data/history-views";

/**
 * #92 — saved views over the Histórico filters. The rule the issue is most
 * explicit about is that this feature creates NO new filters: a view is only
 * ever a named combination of the ones `/panel/historico` already has.
 */
describe("#92 the filter set is exactly the existing one", () => {
  it("covers the five filters the Histórico already offers, and nothing else", () => {
    expect([...HISTORY_FILTER_KEYS].sort()).toEqual(["carrier", "from", "plate", "q", "to"]);
  });
});

describe("#92 filtersFromParams", () => {
  it("reads only the known filters and ignores anything else in the URL", () => {
    expect(filtersFromParams({ q: "lyon", plate: "1234ABC", page: "3", evil: "x" })).toEqual({
      q: "lyon",
      plate: "1234ABC",
    });
  });

  it("treats blank and whitespace-only values as absent", () => {
    expect(filtersFromParams({ q: "  ", carrier: "", from: "2026-01-01" })).toEqual({
      from: "2026-01-01",
    });
  });

  it("trims what it keeps", () => {
    expect(filtersFromParams({ q: "  lyon  " })).toEqual({ q: "lyon" });
  });

  it("returns an empty object for no params", () => {
    expect(filtersFromParams({})).toEqual({});
  });
});

describe("#92 hasActiveFilters — the Save button only appears when there is something to save", () => {
  it("is false with no filters", () => {
    expect(hasActiveFilters({})).toBe(false);
  });
  it("is true with any single filter", () => {
    expect(hasActiveFilters({ carrier: "Transportes X" })).toBe(true);
  });
});

describe("#92 viewQuery — applying a view is one click", () => {
  it("builds the same query string the filter form would produce", () => {
    expect(viewQuery({ q: "lyon", plate: "1234ABC" })).toBe("q=lyon&plate=1234ABC");
  });

  it("orders the keys canonically so the same view always yields the same URL", () => {
    expect(viewQuery({ plate: "1234ABC", q: "lyon" })).toBe("q=lyon&plate=1234ABC");
  });

  it("omits absent filters entirely", () => {
    expect(viewQuery({ carrier: "X" })).toBe("carrier=X");
  });

  it("encodes values that need it", () => {
    expect(viewQuery({ carrier: "Transportes & Cía" })).toContain("Transportes+%26+C%C3%ADa");
  });

  it("is empty for an empty view, so 'Limpiar filtros' keeps working", () => {
    expect(viewQuery({})).toBe("");
  });
});

describe("#92 viewMatches — the active view is distinguishable", () => {
  const view = { q: "lyon", plate: "1234ABC" };

  it("matches the params it was saved from", () => {
    expect(viewMatches(view, { q: "lyon", plate: "1234ABC" })).toBe(true);
  });

  it("does not match when a filter differs", () => {
    expect(viewMatches(view, { q: "lyon", plate: "9999ZZZ" })).toBe(false);
  });

  it("does not match when the URL carries an extra filter", () => {
    expect(viewMatches(view, { q: "lyon", plate: "1234ABC", carrier: "X" })).toBe(false);
  });

  it("does not match when a filter is missing from the URL", () => {
    expect(viewMatches(view, { q: "lyon" })).toBe(false);
  });

  it("ignores non-filter params, so pagination never deselects the view", () => {
    expect(viewMatches(view, { q: "lyon", plate: "1234ABC", page: "2" })).toBe(true);
  });

  it("no view is active on the unfiltered Histórico", () => {
    expect(viewMatches(view, {})).toBe(false);
  });
});

describe("#92 historyViewName — validation", () => {
  it("accepts a short name and trims it", () => {
    expect(historyViewName("  Francia  ")).toBe("Francia");
  });

  it("rejects an empty or whitespace-only name", () => {
    expect(historyViewName("")).toBeNull();
    expect(historyViewName("   ")).toBeNull();
  });

  it("rejects a name that is not a string", () => {
    expect(historyViewName(undefined)).toBeNull();
    expect(historyViewName(42)).toBeNull();
  });

  it("caps an over-long name rather than storing it whole", () => {
    const name = historyViewName("x".repeat(200));
    expect(name).not.toBeNull();
    expect(name!.length).toBeLessThanOrEqual(40);
  });

  it("collapses inner whitespace so chips stay one line", () => {
    expect(historyViewName("Valencia    →   Lyon")).toBe("Valencia → Lyon");
  });
});

describe("#92 describeFilters — a chip the user can understand later", () => {
  // Labels come from the locale dictionary; the module stays locale-agnostic.
  const labels = {
    q: "Búsqueda",
    from: "Desde",
    to: "Hasta",
    carrier: "Transportista",
    plate: "Matrícula",
    none: "Sin filtros",
  };

  it("summarises the saved filters using the labels it was given", () => {
    const s = describeFilters({ q: "lyon", carrier: "Transportes X" }, labels);
    expect(s).toContain("Búsqueda: lyon");
    expect(s).toContain("Transportista: Transportes X");
  });

  it("keeps the canonical key order regardless of the object's own order", () => {
    expect(describeFilters({ plate: "1234ABC", q: "lyon" }, labels)).toBe(
      "Búsqueda: lyon · Matrícula: 1234ABC",
    );
  });

  it("says so plainly when a view saves no filters", () => {
    expect(describeFilters({}, labels)).toBe("Sin filtros");
  });
});

describe("#92 limits", () => {
  it("caps how many views one user can keep, so the screen cannot be flooded", () => {
    expect(MAX_HISTORY_VIEWS).toBeGreaterThan(0);
    expect(MAX_HISTORY_VIEWS).toBeLessThanOrEqual(20);
  });
});
