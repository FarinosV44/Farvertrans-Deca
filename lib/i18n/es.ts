import { BRAND } from "@/lib/brand";

/**
 * es-ES string catalog (D-002). Every user-facing string lives here by key.
 * Never inline or concatenate user-facing text at the use site. The product
 * name comes from `lib/brand.ts` (BRAND #21).
 */
export const es = {
  common: {
    appName: BRAND.name,
    attribution: BRAND.attribution,
    createCta: "CREAR DECA GRATIS",
    loginCta: "Entrar",
    panelCta: "Ir a mi panel",
    skipToContent: "Saltar al contenido",
  },
  landing: {
    h1: "DeCA GRATIS",
    subhead: `${BRAND.tagline} PDF nativo, QR válido para inspección y conservación online.`,
    trust: "Sin tarjeta · Sin límite · Gratis al menos hasta el 31/12/2026",
  },
  errors: {
    generic: "Algo no ha ido bien. Vuelve a intentarlo en unos segundos.",
    notFound: "No hemos encontrado esta página.",
  },
} as const;

export type Messages = typeof es;
