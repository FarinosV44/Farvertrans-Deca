/**
 * es-ES string catalog (D-002). Every user-facing string lives here by key.
 * Never inline or concatenate user-facing text at the use site.
 */
export const es = {
  common: {
    appName: "Farvertrans DeCA",
    createCta: "CREAR DECA GRATIS",
    skipToContent: "Saltar al contenido",
  },
  landing: {
    h1: "DeCA GRATIS",
    subhead:
      "Crea tu Documento Electrónico de Control en segundos. PDF nativo, QR y conservación online.",
    trust: "Sin tarjeta · Sin límite · Gratis al menos hasta el 31/12/2026",
  },
  errors: {
    generic: "Algo no ha ido bien. Vuelve a intentarlo en unos segundos.",
    notFound: "No hemos encontrado esta página.",
  },
} as const;

export type Messages = typeof es;
