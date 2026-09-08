/**
 * Corridors of commercial interest for Farvertrans (#87 / #88).
 *
 * Deliberately a plain in-code table, not a database or an admin screen — the
 * pre-agreed decision for this first version (see `docs/sprints/sprint-commercial-
 * intel.md`). Editing the list is a one-line code change and a deploy.
 *
 * Pure module: no I/O, no `server-only`, no Prisma. Safe to unit-test and to
 * import from a client component. Everything here is transparent and auditable —
 * a route either matches a named corridor or it does not, by documented rules.
 */

/** Coarse geographic zone a load/unload point falls into. */
export type Zone =
  | "es-levante"
  | "es-cataluna"
  | "es-madrid"
  | "es-norte"
  | "es-andalucia"
  | "es-noroeste"
  | "es-otras"
  | "pt"
  | "fr"
  | "benelux"
  | "it"
  | "de"
  | "otros-ue"
  | "resto";

export const ZONE_LABEL: Record<Zone, string> = {
  "es-levante": "Levante",
  "es-cataluna": "Cataluña",
  "es-madrid": "Madrid / centro",
  "es-norte": "Norte peninsular",
  "es-andalucia": "Andalucía",
  "es-noroeste": "Noroeste",
  "es-otras": "España (otras zonas)",
  pt: "Portugal",
  fr: "Francia",
  benelux: "Benelux",
  it: "Italia",
  de: "Alemania",
  "otros-ue": "Otros (UE)",
  resto: "Otros",
};

const ES_ZONES: Zone[] = [
  "es-levante",
  "es-cataluna",
  "es-madrid",
  "es-norte",
  "es-andalucia",
  "es-noroeste",
  "es-otras",
];

export type RouteFacts = {
  loadCountry?: string | null;
  loadProvince?: string | null;
  loadCity?: string | null;
  unloadCountry?: string | null;
  unloadProvince?: string | null;
  unloadCity?: string | null;
};

export type CorridorDef = {
  id: string;
  label: string;
  from: Zone[];
  to: Zone[];
  /** Both directions count unless a corridor sets this false. */
  bidirectional?: boolean;
};

/**
 * The corridors Farvertrans watches. A route matches when its endpoints fall in
 * a corridor's `from`/`to` zone sets (either direction, unless `bidirectional`
 * is false).
 */
export const CORRIDORS: CorridorDef[] = [
  { id: "es-francia", label: "España ↔ Francia", from: ES_ZONES, to: ["fr"] },
  { id: "es-benelux", label: "España ↔ Benelux", from: ES_ZONES, to: ["benelux"] },
  { id: "es-italia", label: "España ↔ Italia", from: ES_ZONES, to: ["it"] },
  { id: "es-alemania", label: "España ↔ Alemania", from: ES_ZONES, to: ["de"] },
  { id: "es-portugal", label: "España ↔ Portugal", from: ES_ZONES, to: ["pt"] },
  {
    id: "levante-cataluna",
    label: "Levante ↔ Cataluña",
    from: ["es-levante"],
    to: ["es-cataluna"],
  },
  { id: "levante-madrid", label: "Levante ↔ Madrid", from: ["es-levante"], to: ["es-madrid"] },
  {
    id: "peninsula-norte",
    label: "Levante/Centro/Sur ↔ Norte peninsular",
    from: ["es-levante", "es-madrid", "es-andalucia"],
    to: ["es-norte"],
  },
];

function fold(s: string | null | undefined): string {
  return (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toUpperCase();
}

const COUNTRY_ALIASES: Record<string, string> = {
  ESPANA: "ES",
  SPAIN: "ES",
  ES: "ES",
  E: "ES",
  FRANCIA: "FR",
  FRANCE: "FR",
  FR: "FR",
  PORTUGAL: "PT",
  PT: "PT",
  BELGICA: "BE",
  BELGIQUE: "BE",
  BELGIUM: "BE",
  BE: "BE",
  "PAISES BAJOS": "NL",
  HOLANDA: "NL",
  NETHERLANDS: "NL",
  NEDERLAND: "NL",
  NL: "NL",
  LUXEMBURGO: "LU",
  LUXEMBOURG: "LU",
  LU: "LU",
  ITALIA: "IT",
  ITALY: "IT",
  IT: "IT",
  ALEMANIA: "DE",
  GERMANY: "DE",
  DEUTSCHLAND: "DE",
  DE: "DE",
  "REINO UNIDO": "GB",
  "UNITED KINGDOM": "GB",
  GB: "GB",
  UK: "GB",
  SUIZA: "CH",
  SWITZERLAND: "CH",
  CH: "CH",
  AUSTRIA: "AT",
  AT: "AT",
  POLONIA: "PL",
  POLAND: "PL",
  PL: "PL",
};

/** ISO-ish country code for a free-text country field, or null. */
export function countryCode(country: string | null | undefined): string | null {
  const f = fold(country);
  if (!f) return null;
  return COUNTRY_ALIASES[f] ?? (f.length === 2 ? f : null);
}

const ES_PROVINCE_ZONE: Record<string, Zone> = {
  VALENCIA: "es-levante",
  VALENCIA_VALENCIA: "es-levante",
  CASTELLON: "es-levante",
  CASTELLO: "es-levante",
  ALICANTE: "es-levante",
  ALACANT: "es-levante",
  MURCIA: "es-levante",
  BARCELONA: "es-cataluna",
  TARRAGONA: "es-cataluna",
  GIRONA: "es-cataluna",
  GERONA: "es-cataluna",
  LLEIDA: "es-cataluna",
  LERIDA: "es-cataluna",
  MADRID: "es-madrid",
  TOLEDO: "es-madrid",
  GUADALAJARA: "es-madrid",
  "CIUDAD REAL": "es-madrid",
  VIZCAYA: "es-norte",
  BIZKAIA: "es-norte",
  GIPUZKOA: "es-norte",
  GUIPUZCOA: "es-norte",
  ALAVA: "es-norte",
  ARABA: "es-norte",
  NAVARRA: "es-norte",
  NAFARROA: "es-norte",
  CANTABRIA: "es-norte",
  "LA RIOJA": "es-norte",
  RIOJA: "es-norte",
  BURGOS: "es-norte",
  SEVILLA: "es-andalucia",
  MALAGA: "es-andalucia",
  CADIZ: "es-andalucia",
  CORDOBA: "es-andalucia",
  GRANADA: "es-andalucia",
  ALMERIA: "es-andalucia",
  HUELVA: "es-andalucia",
  JAEN: "es-andalucia",
  "A CORUNA": "es-noroeste",
  CORUNA: "es-noroeste",
  "LA CORUNA": "es-noroeste",
  LUGO: "es-noroeste",
  OURENSE: "es-noroeste",
  ORENSE: "es-noroeste",
  PONTEVEDRA: "es-noroeste",
  ASTURIAS: "es-noroeste",
  LEON: "es-noroeste",
};

/** Well-known freight cities, used only when the country field is blank. */
const CITY_ZONE_HINT: Record<string, Zone> = {
  LYON: "fr",
  PARIS: "fr",
  MARSEILLE: "fr",
  MARSELLA: "fr",
  LILLE: "fr",
  BORDEAUX: "fr",
  BURDEOS: "fr",
  TOULOUSE: "fr",
  PERPIGNAN: "fr",
  PERPINAN: "fr",
  STRASBOURG: "fr",
  ESTRASBURGO: "fr",
  MILANO: "it",
  MILAN: "it",
  TORINO: "it",
  TURIN: "it",
  ROMA: "it",
  BOLOGNA: "it",
  BOLONIA: "it",
  VERONA: "it",
  NAPOLI: "it",
  BRUXELLES: "benelux",
  BRUSELAS: "benelux",
  BRUSSEL: "benelux",
  ANTWERPEN: "benelux",
  AMBERES: "benelux",
  ROTTERDAM: "benelux",
  AMSTERDAM: "benelux",
  EINDHOVEN: "benelux",
  LIEGE: "benelux",
  VENLO: "benelux",
  TILBURG: "benelux",
  FRANKFURT: "de",
  MUNCHEN: "de",
  MUNICH: "de",
  KOLN: "de",
  COLONIA: "de",
  HAMBURG: "de",
  HAMBURGO: "de",
  STUTTGART: "de",
  BERLIN: "de",
  DUSSELDORF: "de",
  LISBOA: "pt",
  LISBON: "pt",
  PORTO: "pt",
  OPORTO: "pt",
};

function zoneFromCountryCode(code: string): Zone {
  switch (code) {
    case "PT":
      return "pt";
    case "FR":
      return "fr";
    case "BE":
    case "NL":
    case "LU":
      return "benelux";
    case "IT":
      return "it";
    case "DE":
      return "de";
    case "GB":
    case "CH":
    case "AT":
    case "PL":
      return "otros-ue";
    default:
      return "resto";
  }
}

/**
 * The zone a single point (country/province/city) belongs to, or null when
 * nothing in the input is recognisable.
 */
export function zoneOf(
  country: string | null | undefined,
  province: string | null | undefined,
  city?: string | null,
): Zone | null {
  const code = countryCode(country);
  const prov = fold(province);
  const cityFolded = fold(city);

  if (code === "ES" || (!code && ES_PROVINCE_ZONE[prov])) {
    return ES_PROVINCE_ZONE[prov] ?? "es-otras";
  }
  if (code && code !== "ES") return zoneFromCountryCode(code);
  if (!code && CITY_ZONE_HINT[cityFolded]) return CITY_ZONE_HINT[cityFolded];
  return null;
}

/** The zone in which the movement presumably ends (the unload point). */
export function endZone(route: RouteFacts): Zone | null {
  return zoneOf(route.unloadCountry, route.unloadProvince, route.unloadCity);
}

export type CorridorMatch = { id: string; label: string };

/** Every named corridor a route matches (usually zero or one). */
export function matchCorridors(route: RouteFacts): CorridorMatch[] {
  const a = zoneOf(route.loadCountry, route.loadProvince, route.loadCity);
  const b = zoneOf(route.unloadCountry, route.unloadProvince, route.unloadCity);
  if (!a || !b) return [];
  const out: CorridorMatch[] = [];
  for (const c of CORRIDORS) {
    const forward = c.from.includes(a) && c.to.includes(b);
    const backward = c.bidirectional === false ? false : c.from.includes(b) && c.to.includes(a);
    if (forward || backward) out.push({ id: c.id, label: c.label });
  }
  return out;
}

/** True when a route touches any watched corridor. */
export function isCorridorRoute(route: RouteFacts): boolean {
  return matchCorridors(route).length > 0;
}
