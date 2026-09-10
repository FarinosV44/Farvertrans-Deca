import { BRAND } from "@/lib/brand";

/**
 * es-ES string catalog (D-002). Every user-facing string on the translated
 * critical path lives here by key — see `en.ts` for the English counterpart
 * and `docs/decisions.md` (D-062) for what is and isn't covered yet. Never
 * inline or concatenate user-facing text at a translated call site.
 */
export const es = {
  common: {
    appName: BRAND.name,
    createCta: "CREAR DECA GRATIS",
    headerCta: "Crear DeCA",
    loginCta: "Entrar",
    panelCta: "Ir a mi panel",
    skipToContent: "Saltar al contenido",
  },
  nav: {
    howItWorks: "Cómo funciona",
    plans: "Planes",
    regulation: "Normativa",
    guides: "Guías",
    blog: "Blog",
    faq: "Preguntas",
  },
  language: {
    es: "Español",
    en: "English",
  },
  landing: {
    hero: {
      eyebrow: "Documento Electrónico de Control",
      h1: "DeCA profesional, sencillo y listo para trabajar.",
      subhead:
        "Genera, gestiona, custodia y comparte tus Documentos Electrónicos de Control desde una plataforma especializada en transporte.",
      proof:
        "Mercancías · PDF + QR · Custodia digital · Histórico · Multiusuario · Gratis durante la fase de lanzamiento",
      cta: "CREAR DECA GRATIS",
      ctaSecondary: "ENTRAR",
      noCardNote: "Sin tarjeta · Sin límite de documentos durante la fase de lanzamiento.",
      launchBadge: "Gratis durante 2026 · Fase de lanzamiento",
    },
    trustRow: ["Sin registro para tu primer DeCA", "PDF + QR", "Custodia digital", "Histórico"],
    stepsHeading: "Crea tu DeCA en 3 pasos",
    steps: [
      {
        title: "Introduce los datos",
        body: "Cargador, transportista, origen, destino, mercancía y matrícula. Sin compromiso.",
      },
      {
        title: "Crea tu cuenta y genera",
        body: "Registro gratuito en segundos — creamos el PDF nativo con QR y una URL única de descarga directa. Nada de lo que ya escribiste se pierde.",
      },
      {
        title: "Compártelo con el conductor",
        body: "Enlace, WhatsApp, email o copia impresa. Listo para inspección.",
      },
    ],
    freeValueHeading: "Todo incluido durante el lanzamiento.",
    freeValueSubhead:
      "Multiusuario, histórico, custodia y reutilización de datos incluidos sin coste durante la fase de lanzamiento — funciones que otras plataformas de DeCA cobran aparte.",
    freeValueComingSoon: "Próximamente",
    integrationsCard: {
      heading: "API e integraciones ERP/TMS",
      body: "Estamos preparando integraciones para empresas que necesitan conectar DeCA Profesional con sus sistemas. Son un servicio adicional, sujeto a valoración técnica y presupuesto según el proyecto; no están incluidas en el precio de la suscripción.",
      cta: "Me interesa la integración",
    },
    plans: {
      eyebrow: "PLANES 2027",
      heading: "Un plan para cada volumen de trabajo.",
      subhead:
        "DeCA Profesional es gratuito hasta el 31 de diciembre de 2026. A partir de enero podrás elegir el plan que mejor se adapte a tu empresa.",
      launchBadge: "Gratis hasta el 31/12/2026",
      reassurance:
        "No tienes que elegir ningún plan ahora. Durante el lanzamiento puedes seguir utilizando DeCA Profesional gratuitamente.",
      authedNote: "Tu cuenta sigue siendo gratuita durante el lanzamiento.",
      amountSuffix: "€/mes",
      terms: "IVA no incluido · Facturación mensual · Sin permanencia",
      footnote:
        "Los límites y funcionalidades indicados corresponden a los planes previstos para 2027. Hasta entonces, las cuentas del periodo de lanzamiento mantienen su acceso actual.",
      recommendedLabel: "Recomendado",
      comingSoonLabel: "Próximamente",
      extraCostLabel: "+ coste adicional",
      decaPerMonthLabel: "DeCA / mes",
      usersLabel: "usuarios",
      guestCta: "Empezar gratis",
      apiDisclaimer:
        "API e integraciones ERP/TMS sujetas a disponibilidad técnica y compatibilidad con el sistema del cliente. No están incluidas en el precio de la suscripción: se presupuestan según las necesidades y la complejidad de cada integración.",
      tiers: [
        {
          name: "Starter",
          target: "Autónomos y pequeñas empresas de transporte.",
          tagline: "Todo lo necesario para trabajar con DeCA sin complicaciones.",
          inherits: "",
          features: [
            { label: "Generación de DeCA", soon: false },
            { label: "PDF nativo + QR", soon: false },
            { label: "URL pública de verificación", soon: false },
            { label: "Histórico", soon: false },
            { label: "Custodia digital", soon: false },
            { label: "Empresas habituales", soon: false },
            { label: "Vehículos guardados", soon: false },
            { label: "Lugares habituales", soon: false },
            { label: "Duplicado rápido", soon: false },
            { label: "Rutas frecuentes", soon: false },
            { label: "Favoritos", soon: false },
            { label: "Borradores automáticos", soon: false },
            { label: "Modo inspección", soon: false },
            { label: "Soporte por email", soon: false },
            { label: "Conservación documental 1 año", soon: false },
          ],
        },
        {
          name: "Professional",
          target: "Pymes, agencias de transporte y equipos con mayor actividad.",
          tagline: "Para equipos que gestionan más tráfico y necesitan trabajar más rápido.",
          inherits: "Todo lo incluido en Starter, más:",
          features: [
            { label: "Exportación del histórico a CSV", soon: false },
            { label: "Búsqueda avanzada en el histórico", soon: false },
            { label: "Vistas guardadas en el histórico", soon: false },
            { label: "Accesos rápidos personalizados en Inicio", soon: false },
            { label: "Conservación documental 2 años", soon: false },
            { label: "Soporte prioritario por email", soon: false },
          ],
        },
        {
          name: "Business",
          target: "Agencias, operadores y grupos empresariales de mayor tamaño.",
          tagline: "Para empresas con mayor volumen e integración con sus sistemas.",
          inherits: "Todo lo incluido en Professional, más:",
          features: [
            { label: "API", soon: true, extraCost: true },
            { label: "Integraciones ERP / TMS", soon: true, extraCost: true },
            { label: "Onboarding técnico de integración", soon: true, extraCost: true },
            { label: "Soporte técnico prioritario", soon: false },
            { label: "Soporte telefónico", soon: false },
            { label: "Mayor volumen y capacidad multiusuario", soon: false },
          ],
        },
      ],
    },
    freeValueItems: [
      { label: "Generar DeCA" },
      { label: "PDF nativo + QR" },
      { label: "Histórico" },
      { label: "Custodia digital" },
      { label: "Multiusuario" },
      { label: "Empresas habituales" },
      { label: "Vehículos guardados" },
      { label: "Lugares habituales" },
      { label: "Duplicado rápido" },
      { label: "Rutas frecuentes" },
      { label: "Favoritos" },
      { label: "Borradores automáticos" },
      { label: "Modo inspección" },
    ],
    productHeading: "Del formulario al PDF con QR, sin pasos de más",
    benefits: [
      {
        title: "Gratis",
        body: "Sin límite de DeCA durante la fase de lanzamiento de 2026. Sin tarjeta. A partir de 2027, mediante suscripción.",
      },
      {
        title: "Rápido",
        body: "Reutiliza tus datos habituales y duplica documentos anteriores en un toque.",
      },
      {
        title: "Preparado para inspección",
        body: "PDF nativo, QR y URL HTTPS directa conforme a la resolución vigente.",
      },
    ],
    personasHeading: "Hecho para quien mueve mercancía",
    personas: [
      {
        title: "Transportista autónomo",
        jobToBeDone: "Genera el DeCA en minutos y llévalo en el móvil.",
        benefits: [
          "Registro gratuito en segundos",
          "Empresa y vehículo guardados tras registrarte",
          "Duplicado rápido del último documento",
          "Envío al conductor en un toque",
        ],
      },
      {
        title: "Empresa de transporte",
        jobToBeDone: "Un mismo espacio para todos tus operadores y documentos.",
        benefits: [
          "Varios usuarios en la misma empresa",
          "Historial compartido",
          "Cargadores, vehículos y direcciones guardados",
          "Auditoría de quién creó o corrigió cada DeCA",
        ],
      },
      {
        title: "Agencia / operador de transporte",
        jobToBeDone: "Gestiona el documento como cargador contractual sin depender de terceros.",
        benefits: [
          "Varias empresas y transportistas",
          "Contrapartes reutilizables",
          "Duplicado rápido",
          "Espacio de trabajo para el equipo",
        ],
      },
      {
        title: "Cargador / expedidor",
        jobToBeDone: "Genera, conserva y comparte tus DeCA desde un único sitio.",
        benefits: [
          "Transportistas habituales guardados",
          "Historial de documentos",
          "Ruta de inspección directa por QR/PDF",
          "Sin montar un proceso nuevo en tu ERP",
        ],
      },
    ],
    personaCtaPrefix: "Cómo funciona para",
    dailyUseHeading: "Cada DeCA te cuesta menos tiempo que el anterior.",
    dailyUseSubhead: "Guarda una vez. Reutiliza siempre.",
    dailyUseFooter:
      "Empieza a rellenar tu DeCA sin compromiso; solo pedimos crear una cuenta gratuita al final, para generarlo.",
    dailyUseFooterLink: "tu empresa",
    dailyUseFooterAfterLink:
      "guarda todo esto para que el siguiente DeCA sea cuestión de segundos.",
    dailyUse: [
      { label: "Generar DeCA", body: "Formulario guiado en 3 pasos." },
      { label: "PDF + QR", body: "Documento nativo con QR de verificación." },
      { label: "Histórico", body: "Todos tus documentos, siempre a mano." },
      { label: "Duplicar", body: "Repite un DeCA anterior en segundos." },
      { label: "Vehículos guardados", body: "Tractora y remolque en un clic." },
      {
        label: "Empresas habituales",
        body: "Cargadores y transportistas reutilizables.",
      },
      { label: "Lugares habituales", body: "Carga y descarga listos para elegir." },
      {
        label: "Custodia digital",
        body: "Conservación conforme a la normativa vigente.",
      },
    ],
    regulationHeading: "Qué exige la normativa",
    legalPoints: [
      "Obligatorio desde el 5 de octubre de 2026 para el transporte interior de mercancías por carretera.",
      "El fichero es un PDF nativo digital, generado a partir de datos estructurados — no vale un escaneo.",
      "Tamaño máximo 5 MB.",
      "Incluye un código QR con una URL única que empieza por https://",
      "La URL permite la descarga directa del PDF, sin registro y sin contraseña.",
      "Se registra la fecha y hora de creación y de cualquier modificación.",
      "Conservación mínima de 1 año por el cargador y por el transportista.",
    ],
    legalSourceLabel: "Fuente:",
    operatorTrustHeading: "Quién está detrás del servicio",
    faqHeading: "Preguntas frecuentes",
    faqGroups: [
      {
        heading: "Normativa y obligación",
        items: [
          {
            q: "¿Qué es el DeCA?",
            a: "El Documento Electrónico de Control Administrativo es la versión digital obligatoria del documento de control del transporte de mercancías por carretera. Sustituye al documento en papel.",
          },
          {
            q: "¿Cuándo es obligatorio?",
            a: "Desde el 5 de octubre de 2026 para el transporte interior, sin prórroga ni periodo transitorio: el DeCA debe generarse en formato electrónico desde el origen. El conductor puede llevarlo en copia electrónica en el móvil o en copia impresa con el código QR; un documento creado originalmente en papel y escaneado después no es un DeCA electrónico válido.",
          },
          {
            q: "¿Quién tiene que hacerlo?",
            a: "El cargador contractual y el transportista efectivo del transporte público de mercancías por carretera, en los términos de la normativa aplicable.",
          },
          {
            q: "¿Es obligatorio para agencias de transporte?",
            a: "Sí, cuando actúan como cargador contractual u operador que contrata el transporte, con las mismas obligaciones de generación y conservación.",
          },
        ],
      },
      {
        heading: "El documento",
        items: [
          {
            q: "¿Sirve un PDF escaneado?",
            a: "No. El fichero debe ser un PDF nativo digital generado a partir de datos estructurados. Un escaneo o una imagen digitalizada no es válido.",
          },
          {
            q: "¿Tiene que firmarse?",
            a: "La resolución no exige firma electrónica. Sí exige PDF nativo, QR, URL HTTPS de descarga directa y registro de creación y modificaciones.",
          },
          {
            q: "¿Qué datos debe contener?",
            a: "Como mínimo: cargador contractual (nombre o razón social, NIF y domicilio), transportista efectivo (nombre o razón social y NIF), lugar y fecha de carga, lugar y fecha de descarga, naturaleza y peso de la mercancía, y matrícula del vehículo (tractora y remolque si es un conjunto articulado).",
          },
        ],
      },
      {
        heading: "Uso y coste",
        items: [
          {
            q: "¿Cómo lo lleva el conductor?",
            a: "Antes del inicio del servicio, en copia electrónica visible en el móvil o en copia impresa, siempre con el QR disponible.",
          },
          {
            q: `¿Es gratis ${BRAND.name}?`,
            a: "Sí. Puedes crear y descargar documentos sin tarjeta y sin límite hasta el 31 de diciembre de 2026. A partir de 2027, DeCA Profesional funcionará mediante suscripción.",
          },
          {
            q: "¿Puedo generar todos los documentos que quiera?",
            a: "Sí. No hay límite mensual. Solo aplicamos controles automáticos frente a usos abusivos que no afectan al uso normal ni a la inspección.",
          },
        ],
      },
    ],
    finalCtaHeading: "Empieza ahora. Sin tarjeta.",
    finalCtaSubhead:
      "Crea tu DeCA, guarda tus datos habituales y empieza a trabajar desde un único espacio.",
    finalCtaMicrocopy: "Gratis durante 2026 · Fase de lanzamiento · Sin tarjeta",
  },
  auth: {
    heading: {
      register: "Crea tu cuenta gratis",
      login: "Bienvenido de nuevo",
      joinTeam: "Únete al equipo",
      claim: "Guarda este DeCA",
    },
    subhead: {
      register:
        "Guarda tus DeCA, reutiliza tus datos habituales y genera documentos nuevos más rápido.",
      login:
        "Entra para ver tus DeCA, reutilizar tus datos y generar nuevos documentos más rápido.",
      joinTeamInvitedBy: (company: string) => `${company} te ha invitado. `,
      joinTeamSuffix:
        "Crea tu acceso y compartirás sus DeCA y datos habituales. No hace falta dar de alta otra empresa.",
      claim:
        "Crea una cuenta gratuita para guardar este documento y reutilizar tus datos. No es un formulario comercial.",
    },
    orContinueWithEmail: "o continúa con email",
    googleCta: "Continuar con Google",
    emailLabel: "Email",
    passwordHint: "Mínimo 12 caracteres, con mayúsculas, minúsculas, números y un símbolo.",
    company: {
      legend: "Tu empresa",
      name: "Nombre o razón social",
      nif: "CIF / NIF",
      contactName: "Persona de contacto",
      phone: "Teléfono",
      email: "Correo electrónico de la empresa",
      address: "Dirección",
      postalCode: "Código postal",
      city: "Población",
    },
    profile: {
      legend: "¿Cómo utilizarás principalmente la plataforma?",
      items: {
        carrier_goods: {
          title: "Transportista de mercancías",
          body: "Realizas el transporte de mercancías por cuenta ajena.",
        },
        shipper: {
          title: "Empresa cargadora",
          body: "Contratas transporte para tus propios envíos de mercancías.",
        },
        operator: {
          title: "Operador de transporte",
          body: "Organizas transportes de mercancías (operador logístico o agencia).",
        },
        carrier_passengers: {
          title: "Transportista de viajeros",
          body: "Realizas transporte de viajeros por carretera.",
        },
      },
    },
    dataProtection: {
      title: "Información básica sobre protección de datos",
      responsible: "Responsable:",
      purpose: "Finalidad:",
      purposeBody: "gestionar el alta y la prestación de la Plataforma DeCA.",
      moreInfoPrefix: "Más información en nuestra",
      privacyPolicy: "Política de Privacidad",
    },
    terms: {
      readPrefix: "He leído la",
      privacyPolicy: "Política de Privacidad",
      andAccept: "y acepto los",
      termsAndConditions: "Términos y Condiciones",
    },
    /**
     * #84 registration opt-in, restyled as a compact product feature rather
     * than a legal clause (2026-09 request) — supersedes D-146 point 4's "no
     * 'opcional' label" only for THIS badge; every other #84 constraint holds:
     * unchecked by default, never names Farvertrans, no pressure. The deeper
     * explanation lives behind `moreInfo`/`moreInfoBody`, never open by default.
     */
    commercialOptIn: {
      title: "Oportunidades de carga",
      label: "Avísame si aparece un porte compatible con mis rutas",
      hint: "Puedes desactivarlo cuando quieras.",
      moreInfo: "Qué datos se comparten",
      moreInfoBody:
        "Solo se compartirán los datos mínimos necesarios para proponerte oportunidades: destino del vehículo, fecha prevista y los datos de contacto que hayas autorizado.",
    },
    submit: {
      register: "Crear cuenta gratis",
      login: "Entrar",
      busy: "Un momento…",
    },
    forgotPassword: "¿Has olvidado tu contraseña?",
    switchPrompt: {
      toLogin: "¿Ya tienes cuenta? ",
      toRegister: "¿No tienes cuenta? ",
    },
    switchCta: {
      toLogin: "Inicia sesión",
      toRegister: "Crea tu cuenta gratis",
    },
    footNote: "Gratis durante 2026 · Sin tarjeta · Tus DeCA en un solo lugar",
    errors: {
      acceptTerms: "Debes aceptar los Términos y Condiciones y la Política de Privacidad.",
      generic: "No se pudo completar. Inténtalo de nuevo.",
      noConnection: "Sin conexión. Inténtalo de nuevo.",
      googleFailed:
        "No se pudo completar el acceso con Google. Inténtalo de nuevo o usa tu email y contraseña.",
    },
    invalidInvite: {
      title: "Invitación no válida",
      body: "Este enlace de invitación ha caducado, ya se ha utilizado o no es correcto. Pide a quien te invitó que te envíe uno nuevo.",
      loginCta: "Ya tengo cuenta · Entrar",
      freeStartCta: "Empezar un DeCA gratis",
    },
    verify: {
      title: "Confirma tu correo electrónico",
      sentPrefix: "Ya casi está. Te hemos enviado un correo a",
      sentSuffix: "para activar tu cuenta y empezar a emitir DeCA.",
      failedPrefix: "No hemos podido enviar el correo de confirmación a",
      failedSuffix: "Pulsa «Reenviar correo» para intentarlo de nuevo.",
      whatNext: {
        title: "Qué ocurre después",
        step1: "1. Confirmas tu email",
        step2: "2. Accedes a tu cuenta",
        step3: "3. Empiezas a emitir DeCA",
      },
      openMail: "Abrir mi correo",
      resend: "Reenviar correo",
      resendSending: "Enviando…",
      resendSent: "Correo reenviado. Revisa tu bandeja de entrada.",
      resendError: "No se pudo reenviar. Inténtalo de nuevo en unos minutos.",
      changeEmail: {
        open: "Cambiar correo electrónico",
        label: "Nuevo correo electrónico",
        currentPasswordLabel: "Tu contraseña actual",
        save: "Guardar y reenviar",
        cancel: "Cancelar",
        error: "No se pudo cambiar el correo.",
      },
      continueChecking: "Comprobando…",
      continueLabel: "Ya he confirmado mi cuenta",
      notYetVerified: "Tu correo todavía no está verificado. Abre el enlace que te hemos enviado.",
      spamHint: "Si no encuentras el mensaje, revisa tu carpeta de spam o promociones.",
    },
    verifyToken: {
      successHeading: "Correo confirmado",
      successBody: "Tu cuenta está activa. Ya puedes emitir DeCA sin límites.",
      successCtaAuthed: "Ir a mi panel",
      successCtaAnon: "Entrar",
      errorHeading: "No hemos podido confirmar tu correo",
      errorInvalid: "Este enlace de confirmación no es válido.",
      errorUsed: "Este enlace ya se ha utilizado. Tu correo ya podría estar confirmado.",
      errorExpired: "El enlace de confirmación ha caducado. Pide uno nuevo desde tu cuenta.",
      errorCtaAuthed: "Pedir un enlace nuevo",
      errorCtaAnon: "Entrar",
    },
  },
  panel: {
    verifyBanner: {
      text: (email: string) => `Aún no has confirmado tu correo (${email}).`,
      cta: "Confirmar ahora",
    },
    myCompanyFallback: "Mi empresa",
    newDeca: "Nuevo DeCA",
    duplicateLast: "Repetir / duplicar último DeCA",
    lastDocuments: "Últimos documentos",
    viewAllHistory: "Ver todo el historial",
    noDocumentsYet: "Aún no tienes documentos.",
    draft: {
      title: "Borrador pendiente",
      edited: (s: string) => `editado ${s}`,
      continue: "Continuar",
      discard: "Descartar",
      confirm: "¿Descartar este borrador? No afecta a ningún documento generado.",
    },
    createFirst: "Crea tu primer DeCA",
    detail: "Detalle",
    duplicate: "Duplicar",
    pdf: "PDF",
    companiesCard: "Empresas / transportistas habituales",
    vehiclesCard: "Vehículos habituales",
    manageData: "Gestionar datos habituales →",
    nav: {
      home: "Mis DeCA",
      historico: "Historial",
      plantillas: "Plantillas",
      datos: "Datos habituales",
      equipo: "Equipo",
      empresa: "Mi empresa",
      privacidad: "Privacidad",
      ayuda: "Ayuda",
    },
    /** #93 — up to three per-user quick accesses on Inicio. */
    quickActions: {
      title: "Accesos rápidos",
      customise: "Personalizar",
      save: "Guardar",
      cancel: "Cancelar",
      restore: "Restaurar predeterminados",
      hint: (max: number) => `Elige hasta ${max} accesos a funciones que ya usas.`,
      limit: (max: number) =>
        `Has elegido el máximo de ${max} accesos. Desmarca uno para cambiarlo.`,
      options: {
        crear: "Nuevo DeCA",
        historico: "Historial",
        plantillas: "Plantillas",
        empresas: "Empresas habituales",
        vehiculos: "Vehículos",
        lugares: "Lugares de carga/descarga",
        equipo: "Equipo",
        empresa: "Mi empresa",
        ayuda: "Ayuda",
      },
    },
    privacy: {
      title: "Privacidad y comunicaciones",
      intro:
        "Aquí decides si DeCA Profesional puede comunicar unos pocos datos de disponibilidad de tus portes a cargadores interesados en ofrecerte propuestas comerciales personalizadas y preferentes de carga. Es voluntario y puedes cambiarlo cuando quieras.",
      freeUseNote:
        "No autorizar esta comunicación no afecta en nada al uso gratuito de DeCA Profesional.",
      sectionTitle: "Tratamiento comercial",
      modeLegend: "¿Cuándo quieres compartir la disponibilidad de tus portes?",
      modes: {
        none: "No compartir en ningún porte",
        noneHint: "Ningún dato comercial sale de tus DeCA. Es la opción por defecto.",
        perDeca: "Preguntarme en cada DeCA",
        perDecaHint:
          "Lo decides porte a porte al crear cada DeCA. El control estará desactivado por defecto.",
        all: "Compartir en todos los portes, salvo que lo desactive",
        allHint:
          "Se prepara la ficha de disponibilidad para cada nuevo DeCA. Puedes desactivarlo en un porte concreto antes de emitirlo.",
      },
      channelLegend: "Canal de contacto autorizado",
      channels: { email: "Correo electrónico", phone: "WhatsApp", both: "Correo y WhatsApp" },
      channelEmailLabel: "Correo para propuestas",
      channelPhoneLabel: "WhatsApp para propuestas",
      previewTitle: "Datos que se compartirán",
      previewFields: {
        carrierName: "Empresa o nombre del transportista",
        destination: "Destino o zona de disponibilidad del vehículo",
        availabilityDate: "Fecha estimada de llegada o disponibilidad",
        contactEmail: "Correo electrónico autorizado",
        contactPhone: "WhatsApp autorizado",
      },
      previewNever:
        "Nunca se comparte el origen, el cargador, la dirección de carga, la mercancía, el precio, las matrículas, el conductor ni el documento, la URL o el QR del DeCA.",
      moreInfo: "Más información",
      moreInfoBody:
        "El receptor solo recibe una ficha de disponibilidad con los campos anteriores; no accede a tu cuenta ni al DeCA. Puedes retirar la autorización en cualquier momento: la retirada es inmediata para las comunicaciones futuras y no afecta a las ya realizadas lícitamente ni a ningún DeCA.",
      acceptedAt: (s: string) => `Autorización registrada el ${s}`,
      notAuthorized: "Sin autorización activa",
      revoke: "Retirar autorización",
      revokeConfirm:
        "¿Retirar la autorización? Dejará de prepararse la ficha de disponibilidad para tus próximos portes. No afecta a ningún DeCA.",
      save: "Guardar",
      saved: "Preferencia guardada.",
      error: "No se pudo guardar tu preferencia.",
      ownerOnly: "Solo el administrador de la empresa puede cambiar esta preferencia.",
    },
    help: {
      title: "Ayuda y soporte",
      intro:
        "Elige el canal que necesites. El soporte técnico y la asistencia jurídica son servicios distintos.",
      techHeading: "Soporte técnico",
      techIntro: "Para incidencias con la plataforma, la generación del DeCA o tu cuenta.",
      legalHeading: "Asistencia jurídica en transporte y logística",
      legalIntro:
        "Abogados con experiencia en transporte y logística, útiles ante inspecciones, sanciones, reclamaciones, conflictos contractuales y procedimientos judiciales.",
      legalDisclaimer:
        "Servicio prestado por PRAETORIA, S.L. No sustituye al soporte técnico y no garantiza ningún resultado.",
      phoneLabel: "Teléfono",
      emailLabel: "Correo de soporte",
      whatsappTech: "WhatsApp · soporte técnico",
      whatsappLegal: "Consulta con un abogado por WhatsApp",
      hoursLabel: "Horario de atención",
      openHeading: "Abrir una incidencia técnica",
      openIntro:
        "Cuéntanos qué ocurre y lo revisamos. Recibirás la respuesta por correo y también aquí.",
      category: "Categoría",
      subject: "Asunto",
      message: "Descripción",
      send: "Enviar incidencia",
      sending: "Enviando…",
      sent: "Incidencia enviada. Te responderemos lo antes posible.",
      myHeading: "Mis incidencias",
      none: "No tienes incidencias abiertas.",
      noneHint: "Cuando abras una incidencia podrás consultar aquí su estado y las respuestas.",
      guidesPrompt: "¿Buscas instrucciones de uso? Consulta nuestras",
      guidesLink: "Guías",
      view: "Ver",
      replyLabel: "Tu respuesta",
      replyPlaceholder: "Escribe tu respuesta…",
      replySend: "Enviar respuesta",
      you: "Tú",
      team: "Soporte",
      opened: (d: string) => `Abierta el ${d}`,
      statuses: {
        new: "Nueva",
        in_review: "En revisión",
        awaiting_user: "Pendiente de tu respuesta",
        resolved: "Resuelta",
        closed: "Cerrada",
      },
      categories: {
        generacion: "Generación de DeCA",
        cuenta: "Cuenta y acceso",
        empresa_equipo: "Empresa y equipo",
        documento: "Un documento concreto",
        otro: "Otro",
      },
    },
    teamActivity: {
      heading: "Actividad del equipo",
      invited: (actor: string) => `${actor} envió una invitación`,
      joined: (actor: string) => `${actor} se unió al equipo`,
      roleChanged: (actor: string, target: string, role: string) =>
        `${actor} cambió el rol de ${target} a ${role}`,
      removed: (actor: string, target: string) => `${actor} eliminó a ${target} del equipo`,
      roleLabel: { owner: "Administrador", member: "Operador", read_only: "Solo lectura" },
    },
  },
  historico: {
    title: "Historial",
    search: "Buscar",
    searchPlaceholder: "Referencia, empresa, matrícula, origen o destino",
    from: "Desde",
    to: "Hasta",
    carrier: "Transportista",
    carrierAll: "Todos",
    plate: "Matrícula",
    filter: "Filtrar",
    clear: "Limpiar",
    /** #92 — saved views over the filters this page already has. */
    views: {
      myViews: "Mis vistas",
      save: "Guardar vista",
      namePrompt: "Nombre de la vista (por ejemplo: Francia, Esta semana, Valencia → Lyon)",
      rename: "Renombrar",
      remove: "Eliminar",
      removeConfirm: (name: string) => `¿Eliminar la vista "${name}"?`,
      apply: "Aplicar vista",
      duplicate: "Ya tienes una vista con ese nombre.",
      limit: (max: number) => `Has alcanzado el máximo de ${max} vistas guardadas.`,
      error: "No se pudo guardar la vista. Inténtalo de nuevo.",
      /** The same five filter names this page already shows above the table. */
      filterLabels: {
        q: "Buscar",
        from: "Desde",
        to: "Hasta",
        carrier: "Transportista",
        plate: "Matrícula",
        none: "Sin filtros",
      },
    },
    documentsCountOne: "documento",
    documentsCountMany: "documentos",
    exportCsv: "Exportar CSV",
    colDate: "Fecha",
    colRoute: "Carga → Descarga",
    colShipper: "Cargador",
    colCarrier: "Transportista",
    colPlate: "Matrícula",
    colStatus: "Estado",
    colActions: "Acciones",
    statusActive: "Vigente",
    statusCorrected: "Corregida",
    statusUnavailable: "No disponible",
    detail: "Detalle",
    correct: "Corregir",
    duplicate: "Duplicar",
    pdf: "PDF",
    inspection: "Inspección",
    share: "Compartir",
    noResults: "Sin resultados.",
    createOne: "Crear un DeCA",
  },
  crear: {
    previewHeading: "Así quedará tu DeCA",
    steps: [
      "Quién contrata y quién transporta",
      "Carga y descarga",
      "Vehículo, mercancía y revisión",
    ],
    subheadLeadGate:
      "Completa los datos sin compromiso — solo te pediremos tu nombre y email al final, sin necesidad de crear una cuenta.",
    correctionIntro:
      "Corrigiendo el DeCA. Se generará una nueva versión con un QR y una URL nuevos; la versión anterior se conserva.",
    stepOf: (current: number) => `Paso ${current} de 3 ·`,
    stepOfAria: (current: number, label: string) => `Paso ${current} de 3: ${label}`,
    noConnection: "Sin conexión. Revisa tu red e inténtalo de nuevo.",
    templates: {
      legend: "Empezar desde una plantilla",
      placeholder: "Elige una plantilla…",
      hint: "Aún tendrás que revisar los datos y poner la fecha antes de generar.",
    },
    useCompany: {
      shipper: "Mi empresa es el cargador",
      carrier: "Mi empresa es el transportista",
    },
    useSame: {
      shipperIsCarrier: "El transportista es el mismo que el cargador",
      carrierIsShipper: "El cargador es el mismo que el transportista",
    },
    legends: {
      shipper: "Cargador contractual",
      carrier: "Transportista efectivo",
      loadLocation: "Lugar de carga",
      unloadLocation: "Lugar de descarga",
      vehicleGoods: "Vehículo y mercancía",
    },
    sectionHints: {
      shipper: "¿Quién te ha contratado este transporte?",
      carrier: "¿Qué empresa realiza físicamente el transporte?",
      loadLocation: "Dónde se recoge la mercancía y qué día.",
      unloadLocation:
        "Dónde se entrega la mercancía y qué día. Puede ser el mismo día que la carga.",
      vehicleGoods: "El vehículo que hace el porte y qué se transporta.",
    },
    autofill: {
      company: "Buscar o seleccionar empresa habitual",
      carrier: "Buscar o seleccionar transportista habitual",
      location: "Buscar o seleccionar lugar habitual",
      vehicle: "Buscar o seleccionar vehículo",
      newOption: "Introducir uno nuevo…",
    },
    fields: {
      name: "Nombre o razón social",
      nif: "NIF / VAT",
      address: "Domicilio",
      locationName: "Empresa o establecimiento",
      locationAddress: "Dirección completa",
      postalCode: "Código postal",
      city: "Localidad",
      province: "Provincia",
      country: "País",
      loadDate: "Fecha de carga",
      unloadDate: "Fecha de descarga",
      goods: "Naturaleza de la mercancía",
      weight: "Peso en toneladas (o medida alternativa)",
      weightHint:
        "Ej.: 12 (se añade «t» automáticamente), o «una plataforma completa» si el peso exacto no es determinable.",
      tractorPlate: "Matrícula de la tractora",
      trailerPlate: "Matrícula del remolque / semirremolque",
      trailerHint: "Si no hay remolque, déjalo vacío.",
      reference: "Referencia o notas (opcional)",
    },
    hints: {
      nifForeign: "Puedes usar un NIF/VAT extranjero.",
      unloadSameDay: "Puede coincidir con la fecha de carga.",
      plateForeign:
        "No parece una matrícula española (formato 1234 BCD). Es válida si el vehículo es extranjero.",
    },
    errorSummaryTitle: "Revisa estos campos:",
    lead: {
      title: "Solo un paso más: ¿a quién enviamos el DeCA?",
      body: "Tu nombre y email, solo para enviarte el enlace de descarga. Sin crear cuenta.",
      name: "Tu nombre",
      email: "Tu email",
      loginPrompt: "¿Ya tienes cuenta? Entra",
      loginPromptSuffix: "para usar tus datos guardados.",
    },
    verifyGate: {
      title: "Verifica tu correo para generar el DeCA",
      body: "Tus datos están guardados en este paso. Confirma el enlace que te enviamos por email y vuelve — generamos tu documento al instante, sin volver a escribir nada.",
      cta: "Ir a verificar mi correo",
    },
    repeatGate: {
      title: "Ya has creado tu primer DeCA",
      body: "Regístrate gratis para crear el siguiente — reutilizas tus datos y es mucho más rápido.",
      cta: "Crear cuenta gratis",
      loginPrompt: "¿Ya tienes cuenta? Entra",
    },
    readOnlyGate: {
      title: "Tu rol es de solo lectura",
      body: "Puedes ver el historial y los documentos de tu empresa, pero no crear ni corregir DeCA. Pide a un administrador que cambie tu rol si lo necesitas.",
      cta: "Ir a mi historial",
    },
    correctionReason: "Motivo de la corrección",
    correctionReasonRequired: "Indica el motivo de la corrección.",
    correctionSaveFailed: "No se pudo guardar la corrección.",
    checkingChallenge: "Comprobando… un momento.",
    generationFailedFallback:
      "No hemos podido generar el documento. Tus datos siguen guardados. Reintenta en unos segundos.",
    generationFailedGeneric: "No se pudo generar el DeCA. Inténtalo de nuevo.",
    generatingStatus: "Estamos generando tu PDF y QR… no cierres esta página.",
    notGenerated: "No se ha generado el DeCA",
    correlationPrefix: "Código:",
    correlationSuffix: "— dínoslo si vuelve a ocurrir y localizaremos el fallo exacto.",
    retry: "Reintentar generación",
    backToReview: "Volver a revisar datos",
    review: {
      heading: "Revisa antes de generar",
      subhead:
        "Estos son los datos exactos que aparecerán en el DeCA y en el PDF. Usa «Editar» si algo no es correcto.",
      edit: "Editar",
      shipperTitle: "Empresa que contrata el transporte",
      carrierTitle: "Transportista que realiza el transporte",
      loadTitle: "Lugar y fecha de carga",
      unloadTitle: "Lugar y fecha de descarga",
      vehicleTitle: "Vehículo y mercancía",
      name: "Nombre o razón social",
      nif: "NIF / VAT",
      address: "Domicilio",
      locationName: "Empresa / establecimiento",
      locationAddress: "Dirección",
      postalCode: "Código postal",
      city: "Localidad",
      province: "Provincia",
      country: "País",
      loadDate: "Fecha de carga",
      unloadDate: "Fecha de descarga",
      tractorPlate: "Matrícula tractora",
      trailerPlate: "Matrícula remolque",
      goods: "Mercancía",
      weight: "Peso o medida",
      reference: "Referencia",
      commercialShare: "Propuestas de carga",
      commercialShareOn: "Sí — se prepara la ficha de disponibilidad",
      commercialShareOff: "No",
    },
    commercialShare: {
      legend: "Tratamiento comercial (opcional)",
      hint: "Si quieres, autoriza el envío de los datos mínimos de disponibilidad de este porte para recibir propuestas personalizadas de carga. No autorizarlo no afecta al uso gratuito de DeCA Profesional.",
      enable: "Quiero recibir ofertas personalizadas al finalizar este porte",
      destination: "Destino o zona de disponibilidad",
      date: "Fecha estimada de disponibilidad",
      channel: "Canal de contacto",
      channels: { email: "Correo electrónico", phone: "WhatsApp", both: "Correo y WhatsApp" },
      previewTitle: "Se enviará únicamente:",
      manage: "Cambiar mi preferencia general en Privacidad",
    },
    buttons: {
      back: "Atrás",
      next: "Siguiente",
      generating: "Generando…",
      generate: "GENERAR DECA",
      saveCorrection: "GUARDAR CORRECCIÓN",
    },
    check: {
      title: "Comprobación del DeCA",
      ready: "Listo para generar",
      review: "Revisar datos",
      missing: "Faltan datos obligatorios",
      fix: "Corregir",
      disclaimer:
        "Comprueba que los datos obligatorios están completos antes de generar. No es una validación jurídica del transporte.",
      items: {
        shipper: "Cargador contractual identificado",
        carrier: "Transportista efectivo identificado",
        route: "Carga y descarga completas",
        dates: "Fechas de carga y descarga informadas",
        goods: "Mercancía y peso o medida informados",
        tractor: "Matrícula de la tractora informada",
      },
    },
  },
  result: {
    heading: "DeCA generado",
    version: "Versión",
    versionGenerated: (v: number, date: string) => `Versión ${v} · generado ${date}`,
    documentData: "Datos del documento",
    retentionNotice:
      "Documento conservado durante al menos 1 año. La URL pública permite la descarga directa del PDF sin registro, conforme a la resolución vigente.",
    createAnother: "Crear otro DeCA",
    downloadPdf: "Abrir / descargar PDF",
    sendToDriver: "Enviar al conductor",
    share: "Compartir…",
    whatsapp: "Enviar por WhatsApp",
    driverEmailLabel: "Email del conductor",
    send: "Enviar",
    sent: "Enviado.",
    emailFallback: "El envío por email no está configurado. Abriendo tu cliente de correo…",
    emailFailed: "No se pudo enviar. Usa el enlace o WhatsApp.",
    emailNoConnection: "Sin conexión.",
    copyLink: "Copiar enlace",
    linkCopied: "Enlace copiado",
    print: "Imprimir",
    checkQr: "Comprobar QR",
    qrLinkLabel: "Este es el enlace que lleva el QR del PDF:",
    openInspectionLink: "Abrir el enlace de inspección en una pestaña nueva",
    verifyHint: "Para la comprobación real, escanea el QR con otro móvil.",
    save: "Guardar mis DeCA creando una cuenta",
    saveHint:
      "Crear la cuenta guarda tus documentos y tus datos habituales. No es un formulario comercial.",
    correctedReminder:
      "Este DeCA se ha corregido. Reenvía al conductor la versión actual — la anterior queda como histórico y sigue accesible por su URL.",
    shareTitle: "DeCA del transporte",
    shareTextPrefix: "Documento de control (DeCA) del transporte:",
  },
  errors: {
    generic: "Algo no ha ido bien. Vuelve a intentarlo en unos segundos.",
    notFound: "No hemos encontrado esta página.",
  },
  /**
   * LEGAL #52/#54: the legal pages themselves (aviso legal, privacidad,
   * términos, cookies) are deliberately Spanish-only in every locale — a
   * mistranslated liability/GDPR clause carries real legal risk, and no
   * translation of that content has had a professional legal review (owner
   * decision, D-072, reaffirmed by the owner directly per D-085). This ONE
   * string is the exception: a short, non-technical notice — safe to
   * translate — shown on those pages in every non-Spanish locale so a visitor
   * knows why the page in front of them is in Spanish.
   */
  /**
   * Canonical names for the two DeCA parties (LEGAL #61). Kept in lockstep
   * with `lib/deca/roles.ts` (which serves the Spanish-only PDF / diff / zod
   * surfaces); the `es` values here are the source of truth for the wording.
   * `*Short` = the bare form for tight table headers only.
   */
  legal: {
    roles: {
      shipper: "Cargador contractual",
      carrier: "Transportista efectivo",
      shipperShort: "Cargador",
      carrierShort: "Transportista",
    },
  },
  legalNotice: {
    notTranslated:
      "Este documento solo tiene validez legal en su versión en español. Aún no hay una traducción disponible en este idioma.",
  },
  emails: {
    verifySubject: (brand: string) => `Confirma tu correo en ${brand}`,
    verifyTextInitial: (brand: string, link: string) =>
      `Ya casi está. Confirma tu correo para activar tu cuenta de ${brand}.\n\nAbre este enlace (caduca en 24 horas):\n${link}\n\nSi no has sido tú, ignora este mensaje.`,
    verifyTextResend: (brand: string, link: string) =>
      `Confirma tu correo para activar tu cuenta de ${brand}.\n\nAbre este enlace (caduca en 24 horas):\n${link}\n\nSi no has sido tú, ignora este mensaje.`,
    verifyTextChangeEmail: (brand: string, link: string) =>
      `Confirma tu nuevo correo para activar tu cuenta de ${brand}.\n\nAbre este enlace (caduca en 24 horas):\n${link}\n\nSi no has sido tú, ignora este mensaje.`,
    passwordResetSubject: (brand: string) => `Recupera el acceso a ${brand}`,
    passwordResetText: (brand: string, link: string) =>
      `Has pedido restablecer tu contraseña de ${brand}.\n\nAbre este enlace (caduca en 1 hora):\n${link}\n\nSi no has sido tú, ignora este mensaje.`,
  },
};

export type Messages = typeof es;
