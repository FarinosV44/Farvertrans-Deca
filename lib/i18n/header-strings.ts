import { BRAND } from "@/lib/brand";
import type { Locale } from "./locale";

/**
 * #96 — Core Web Vitals: the site-wide header's translated strings, as a
 * small standalone table safe to import from a CLIENT component (unlike the
 * full per-locale dictionaries in `lib/i18n/dictionaries/`, which carry the
 * entire landing page's copy and would bloat the client bundle for the sake
 * of ~8 short strings).
 *
 * Values are copied verbatim from each locale's `common`/`nav` keys in
 * `lib/i18n/dictionaries/*.ts` — this file does not retranslate anything, it
 * only re-exposes a slice of what already exists there for client use. Kept
 * in sync by the `tests/unit/header-strings.test.ts` check against the full
 * dictionaries.
 */
export type HeaderStrings = {
  headerCta: string;
  loginCta: string;
  panelCta: string;
  howItWorks: string;
  plans: string;
  regulation: string;
  guides: string;
  blog: string;
  faq: string;
};

/** `appName` is `BRAND.name` in every locale (never translated) — no swap needed for it. */
export const HEADER_APP_NAME = BRAND.name;

export const HEADER_STRINGS: Record<Locale, HeaderStrings> = {
  es: {
    headerCta: "Crear DeCA",
    loginCta: "Entrar",
    panelCta: "Ir a mi panel",
    howItWorks: "Cómo funciona",
    plans: "Planes",
    regulation: "Normativa",
    guides: "Guías",
    blog: "Blog",
    faq: "Preguntas",
  },
  ca: {
    headerCta: "Crear DeCA",
    loginCta: "Entra",
    panelCta: "Anar al meu panell",
    howItWorks: "Com funciona",
    plans: "Plans",
    regulation: "Normativa",
    guides: "Guies",
    blog: "Blog",
    faq: "Preguntes",
  },
  eu: {
    headerCta: "Sortu DeCA",
    loginCta: "Sartu",
    panelCta: "Joan nire panelera",
    howItWorks: "Nola funtzionatzen duen",
    plans: "Planak",
    regulation: "Araudia",
    guides: "Gidak",
    blog: "Bloga",
    faq: "Galderak",
  },
  gl: {
    headerCta: "Crear DeCA",
    loginCta: "Entrar",
    panelCta: "Ir ao meu panel",
    howItWorks: "Como funciona",
    plans: "Plans",
    regulation: "Normativa",
    guides: "Guías",
    blog: "Blog",
    faq: "Preguntas",
  },
  en: {
    headerCta: "Create DeCA",
    loginCta: "Log in",
    panelCta: "Go to my dashboard",
    howItWorks: "How it works",
    plans: "Plans",
    regulation: "Regulation",
    guides: "Guides",
    blog: "Blog",
    faq: "FAQ",
  },
  fr: {
    headerCta: "Créer un DeCA",
    loginCta: "Connexion",
    panelCta: "Aller à mon espace",
    howItWorks: "Comment ça marche",
    plans: "Formules",
    regulation: "Réglementation",
    guides: "Guides",
    blog: "Blog",
    faq: "Questions",
  },
  de: {
    headerCta: "DeCA erstellen",
    loginCta: "Anmelden",
    panelCta: "Zu meinem Bereich",
    howItWorks: "So funktioniert's",
    plans: "Tarife",
    regulation: "Vorschriften",
    guides: "Anleitungen",
    blog: "Blog",
    faq: "Fragen",
  },
  it: {
    headerCta: "Crea DeCA",
    loginCta: "Accedi",
    panelCta: "Vai al mio pannello",
    howItWorks: "Come funziona",
    plans: "Piani",
    regulation: "Normativa",
    guides: "Guide",
    blog: "Blog",
    faq: "Domande",
  },
};
