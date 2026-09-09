/**
 * #93 — up to three quick accesses on Inicio, chosen by each USER.
 *
 * Everything that decides lives here and is pure, so the page renders an answer
 * instead of computing one: the catalogue of destinations, what a submitted
 * selection is allowed to become, and what an unconfigured user sees.
 *
 * Two rules from the issue are encoded rather than described:
 *  - the catalogue only contains routes the product ALREADY has ("No crear
 *    nuevas funciones para llenar este bloque"), and
 *  - no two entries share a destination, so three slots can never end up as
 *    three shortcuts to the same page.
 *
 * DELIBERATE OMISSION (D-156): the issue lists "Rutas habituales", and there is
 * no such destination in the product — recurring routes are surfaced as the
 * "Rutas frecuentes" block on Inicio itself and as saved templates. Offering it
 * would mean inventing a screen, which this issue explicitly forbids. Plantillas
 * ("Guarda las rutas que repites") is offered instead and covers the intent.
 */
export const MAX_QUICK_ACTIONS = 3;

/** The i18n key under `t.panel.quickActions.options` for each entry's label. */
export type QuickActionKey =
  | "crear"
  | "historico"
  | "plantillas"
  | "empresas"
  | "vehiculos"
  | "lugares"
  | "equipo"
  | "empresa"
  | "ayuda";

export type QuickAction = {
  key: QuickActionKey;
  /** Resolved against `t.panel.quickActions.options[key]` — never a literal. */
  labelKey: QuickActionKey;
  href: string;
  /** Which `components/panel/icons` export renders it. */
  icon:
    | "plus"
    | "history"
    | "copy"
    | "building"
    | "truck"
    | "mapPin"
    | "users"
    | "gear"
    | "lifebuoy";
};

export const QUICK_ACTIONS: readonly QuickAction[] = [
  { key: "crear", labelKey: "crear", href: "/crear", icon: "plus" },
  { key: "historico", labelKey: "historico", href: "/panel/historico", icon: "history" },
  { key: "plantillas", labelKey: "plantillas", href: "/panel/plantillas", icon: "copy" },
  // The three `datos` entries are the SAME existing screen, addressed at its
  // three existing sections — hence the anchors, which is why they are distinct
  // destinations rather than three copies of one.
  { key: "empresas", labelKey: "empresas", href: "/panel/datos#empresas", icon: "building" },
  { key: "vehiculos", labelKey: "vehiculos", href: "/panel/datos#vehiculos", icon: "truck" },
  { key: "lugares", labelKey: "lugares", href: "/panel/datos#lugares", icon: "mapPin" },
  { key: "equipo", labelKey: "equipo", href: "/panel/equipo", icon: "users" },
  { key: "empresa", labelKey: "empresa", href: "/panel/empresa", icon: "gear" },
  { key: "ayuda", labelKey: "ayuda", href: "/panel/ayuda", icon: "lifebuoy" },
] as const;

export const QUICK_ACTION_KEYS: readonly QuickActionKey[] = QUICK_ACTIONS.map((a) => a.key);

/** What Inicio shows for a user who has never opened "Personalizar". */
export const DEFAULT_QUICK_ACTIONS: readonly QuickActionKey[] = [
  "crear",
  "historico",
  "plantillas",
];

function isKey(v: unknown): v is QuickActionKey {
  return typeof v === "string" && (QUICK_ACTION_KEYS as readonly string[]).includes(v);
}

/**
 * Normalise a submitted selection: keep only catalogue keys, in the order they
 * arrived, without repeats, capped at three. Never throws — a form post is
 * untrusted input, and an unusable selection must degrade to fewer shortcuts
 * rather than to an error screen.
 */
export function parseQuickActions(input: unknown): QuickActionKey[] {
  const raw = Array.isArray(input) ? input : input === undefined || input === null ? [] : [input];
  const out: QuickActionKey[] = [];
  for (const v of raw) {
    if (!isKey(v) || out.includes(v)) continue;
    out.push(v);
    if (out.length === MAX_QUICK_ACTIONS) break;
  }
  return out;
}

/**
 * The catalogue entries Inicio renders. An empty stored selection means "never
 * configured" and yields the defaults; a stored key that has since left the
 * catalogue is dropped rather than blanking the block.
 */
export function resolveQuickActions(stored: unknown): QuickAction[] {
  const keys = parseQuickActions(stored);
  const chosen = keys.length > 0 ? keys : DEFAULT_QUICK_ACTIONS;
  return chosen
    .map((k) => QUICK_ACTIONS.find((a) => a.key === k))
    .filter((a): a is QuickAction => !!a);
}
