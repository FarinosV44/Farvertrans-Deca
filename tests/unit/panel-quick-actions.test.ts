import { describe, expect, it } from "vitest";
import {
  QUICK_ACTIONS,
  QUICK_ACTION_KEYS,
  DEFAULT_QUICK_ACTIONS,
  MAX_QUICK_ACTIONS,
  parseQuickActions,
  resolveQuickActions,
} from "@/lib/panel/quick-actions";

/**
 * #93 — up to three quick accesses on Inicio, chosen per USER from functions
 * that already exist. All of the deciding is pure: what the catalogue contains,
 * what a submitted selection is allowed to be, and what an unconfigured user
 * sees. The page only renders the answer.
 */
describe("#93 quick-access catalogue", () => {
  it("only offers destinations that already exist in the product", () => {
    // The issue's rule: "No crear nuevas funciones para llenar este bloque."
    for (const a of QUICK_ACTIONS) {
      expect(a.href.startsWith("/"), `${a.key} must be an in-app route`).toBe(true);
      expect(a.labelKey.length).toBeGreaterThan(0);
    }
  });

  it("has no two entries pointing at the same destination", () => {
    // Three slots that can all be filled with the same page is a broken picker.
    const hrefs = QUICK_ACTIONS.map((a) => a.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("keys are unique and match the catalogue", () => {
    expect(new Set(QUICK_ACTION_KEYS).size).toBe(QUICK_ACTION_KEYS.length);
    expect(QUICK_ACTION_KEYS).toEqual(QUICK_ACTIONS.map((a) => a.key));
  });

  it("ships exactly three sensible defaults, all of them real keys", () => {
    expect(DEFAULT_QUICK_ACTIONS).toHaveLength(MAX_QUICK_ACTIONS);
    for (const k of DEFAULT_QUICK_ACTIONS) expect(QUICK_ACTION_KEYS).toContain(k);
  });
});

describe("#93 parseQuickActions — never trusts what was submitted", () => {
  it("keeps a valid selection in the order it was given", () => {
    expect(parseQuickActions(["historico", "plantillas"])).toEqual(["historico", "plantillas"]);
  });

  it("drops keys that are not in the catalogue", () => {
    expect(parseQuickActions(["historico", "/admin/empresas", "nope"])).toEqual(["historico"]);
  });

  it("de-duplicates rather than filling slots with the same shortcut", () => {
    expect(parseQuickActions(["historico", "historico", "plantillas"])).toEqual([
      "historico",
      "plantillas",
    ]);
  });

  it(`caps the selection at ${MAX_QUICK_ACTIONS}`, () => {
    const tooMany = QUICK_ACTION_KEYS.slice(0, MAX_QUICK_ACTIONS + 2);
    expect(parseQuickActions(tooMany)).toHaveLength(MAX_QUICK_ACTIONS);
  });

  it("accepts an empty selection — the block is opt-out, not mandatory", () => {
    expect(parseQuickActions([])).toEqual([]);
  });

  it("survives junk without throwing", () => {
    expect(parseQuickActions(undefined)).toEqual([]);
    expect(parseQuickActions(null)).toEqual([]);
    expect(parseQuickActions("historico")).toEqual(["historico"]);
    expect(parseQuickActions([1, {}, null, "plantillas"])).toEqual(["plantillas"]);
  });
});

describe("#93 resolveQuickActions — what Inicio actually renders", () => {
  it("falls back to the defaults for a user who never configured anything", () => {
    expect(resolveQuickActions([]).map((a) => a.key)).toEqual(DEFAULT_QUICK_ACTIONS);
  });

  it("honours a stored selection", () => {
    expect(resolveQuickActions(["equipo", "ayuda"]).map((a) => a.key)).toEqual(["equipo", "ayuda"]);
  });

  it("repairs a stored selection that references a retired key", () => {
    // A key removed from the catalogue must not blank the block or crash Inicio.
    expect(resolveQuickActions(["equipo", "retired-key"]).map((a) => a.key)).toEqual(["equipo"]);
  });

  it("returns the catalogue entry, so the page never re-derives href or icon", () => {
    const [first] = resolveQuickActions(["historico"]);
    expect(first.href).toBe("/panel/historico");
  });
});
