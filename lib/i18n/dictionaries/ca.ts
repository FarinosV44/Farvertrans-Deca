import { BRAND } from "@/lib/brand";
import type { Messages } from "./es";

/**
 * Catalan string catalog, key-for-key with `es.ts` (I18N #54). `satisfies
 * Messages` pins this to the Spanish dictionary's exact shape, so a key added
 * to one and forgotten in the other is a type error, not a silent blank
 * string in prod. Legal pages (`/terminos`, `/privacidad`, `/aviso-legal`)
 * are NOT translated by this dictionary — they render fixed Spanish JSX and
 * stay that way in every locale until a professional legal review exists
 * (owner decision, see `docs/decisions.md`).
 */
export const ca = {
  common: {
    appName: BRAND.name,
    createCta: "CREA UN DECA GRATIS",
    headerCta: "Crear DeCA",
    loginCta: "Entra",
    panelCta: "Anar al meu panell",
    skipToContent: "Salta al contingut",
  },
  nav: {
    howItWorks: "Com funciona",
    regulation: "Normativa",
    guides: "Guies",
    blog: "Blog",
    faq: "Preguntes",
  },
  language: {
    es: "Español",
    en: "English",
  },
  landing: {
    hero: {
      eyebrow: "Document Electrònic de Control",
      h1: "DeCA professional, senzill i llest per treballar.",
      subhead:
        "Genera, gestiona, custodia i comparteix els teus Documents Electrònics de Control des d'una plataforma especialitzada en transport.",
      proof:
        "Mercaderies · PDF + QR · Custòdia digital · Historial · Multiusuari · Gratis durant la fase de llançament",
      cta: "CREA UN DECA GRATIS",
      ctaSecondary: "ENTRA",
      noCardNote: "Sense targeta · Sense límit de documents durant la fase de llançament.",
    },
    trustRow: [
      "Sense registre per al teu primer DeCA",
      "PDF + QR",
      "Custòdia digital",
      "Historial",
    ],
    stepsHeading: "Crea el teu DeCA en 3 passos",
    steps: [
      {
        title: "Introdueix les dades",
        body: "Carregador, transportista, origen, destí, mercaderia i matrícula. Sense compromís.",
      },
      {
        title: "Crea el teu compte i genera'l",
        body: "Registre gratuït en segons — creem el PDF natiu amb QR i una URL única de descàrrega directa. No es perd res del que ja has escrit.",
      },
      {
        title: "Comparteix-lo amb el conductor",
        body: "Enllaç, WhatsApp, correu o còpia impresa. Llest per a la inspecció.",
      },
    ],
    freeValueHeading: "Tot inclòs durant el llançament.",
    freeValueSubhead:
      "Multiusuari, historial, custòdia i reutilització de dades inclosos sense cost durant la fase de llançament — funcions que altres plataformes de DeCA cobren a part.",
    freeValueComingSoon: "Properament",
    freeValueItems: [
      { label: "Generar DeCA" },
      { label: "PDF natiu + QR" },
      { label: "Historial" },
      { label: "Custòdia digital" },
      { label: "Multiusuari" },
      { label: "Empreses habituals" },
      { label: "Vehicles desats" },
      { label: "Llocs habituals" },
      { label: "Duplicat ràpid" },
      { label: "Rutes freqüents" },
      { label: "Mode inspecció" },
      { label: "Accés API / ERP" },
    ],
    productHeading: "Del formulari al PDF amb QR, sense passos de més",
    benefits: [
      {
        title: "Gratis",
        body: "Sense límit de DeCA durant la fase de captació. Sense targeta, sense pla de pagament.",
      },
      {
        title: "Ràpid",
        body: "Reutilitza les teves dades habituals i duplica documents anteriors amb un toc.",
      },
      {
        title: "Preparat per a inspecció",
        body: "PDF natiu, QR i URL HTTPS directa d'acord amb la resolució vigent.",
      },
    ],
    personasHeading: "Fet per a qui mou mercaderia",
    personas: [
      {
        title: "Transportista autònom",
        jobToBeDone: "Genera el DeCA en minuts i porta'l al mòbil.",
        benefits: [
          "Registre gratuït en segons",
          "Empresa i vehicle desats després de registrar-te",
          "Duplicat ràpid de l'últim document",
          "Enviament al conductor amb un toc",
        ],
      },
      {
        title: "Empresa de transport",
        jobToBeDone: "Un mateix espai per a tots els teus operadors i documents.",
        benefits: [
          "Diversos usuaris a la mateixa empresa",
          "Historial compartit",
          "Carregadors, vehicles i adreces desats",
          "Auditoria de qui ha creat o corregit cada DeCA",
        ],
      },
      {
        title: "Agència / operador de transport",
        jobToBeDone: "Gestiona el document com a carregador contractual sense dependre de tercers.",
        benefits: [
          "Diverses empreses i transportistes",
          "Contraparts reutilitzables",
          "Duplicat ràpid",
          "Espai de treball per a l'equip",
        ],
      },
      {
        title: "Carregador / expedidor",
        jobToBeDone: "Genera, conserva i comparteix els teus DeCA des d'un únic lloc.",
        benefits: [
          "Transportistes habituals desats",
          "Historial de documents",
          "Ruta d'inspecció directa per QR/PDF",
          "Sense muntar un procés nou al teu ERP",
        ],
      },
    ],
    personaCtaPrefix: "Com funciona per a",
    dailyUseHeading: "Cada DeCA et costa menys temps que l'anterior.",
    dailyUseSubhead: "Desa-ho un cop. Reutilitza-ho sempre.",
    dailyUseFooter:
      "Comença a omplir el teu DeCA sense compromís; només et demanem crear un compte gratuït al final, per generar-lo.",
    dailyUseFooterLink: "la teva empresa",
    dailyUseFooterAfterLink: "desa tot això perquè el següent DeCA sigui qüestió de segons.",
    dailyUse: [
      { label: "Generar DeCA", body: "Formulari guiat en 3 passos." },
      { label: "PDF + QR", body: "Document natiu amb QR de verificació." },
      { label: "Historial", body: "Tots els teus documents, sempre a mà." },
      { label: "Duplicar", body: "Repeteix un DeCA anterior en segons." },
      { label: "Vehicles desats", body: "Tractora i remolc en un clic." },
      {
        label: "Empreses habituals",
        body: "Carregadors i transportistes reutilitzables.",
      },
      { label: "Llocs habituals", body: "Càrrega i descàrrega a punt per triar." },
      {
        label: "Custòdia digital",
        body: "Conservació d'acord amb la normativa vigent.",
      },
    ],
    regulationHeading: "Què exigeix la normativa",
    legalPoints: [
      "Obligatori des del 5 d'octubre de 2026 per al transport interior de mercaderies per carretera.",
      "El fitxer és un PDF natiu digital, generat a partir de dades estructurades — no val un escaneig.",
      "Mida màxima 5 MB.",
      "Inclou un codi QR amb una URL única que comença per https://",
      "La URL permet la descàrrega directa del PDF, sense registre i sense contrasenya.",
      "Es registra la data i l'hora de creació i de qualsevol modificació.",
      "Conservació mínima d'1 any per part del carregador i del transportista.",
    ],
    legalSourceLabel: "Font:",
    operatorTrustHeading: "Qui hi ha darrere del servei",
    faqHeading: "Preguntes freqüents",
    faqGroups: [
      {
        heading: "Normativa i obligació",
        items: [
          {
            q: "Què és el DeCA?",
            a: "El Document Electrònic de Control Administratiu és la versió digital obligatòria del document de control del transport de mercaderies per carretera. Substitueix el document en paper.",
          },
          {
            q: "Quan és obligatori?",
            a: "Des del 5 d'octubre de 2026 per al transport interior, sense pròrroga ni període transitori: el DeCA s'ha de generar en format electrònic des de l'origen. El conductor el pot portar en còpia electrònica al mòbil o en còpia impresa amb el codi QR; un document creat originalment en paper i escanejat després no és un DeCA electrònic vàlid.",
          },
          {
            q: "Qui l'ha de fer?",
            a: "El carregador contractual i el transportista efectiu del transport públic de mercaderies per carretera, en els termes de la normativa aplicable.",
          },
          {
            q: "És obligatori per a agències de transport?",
            a: "Sí, quan actuen com a carregador contractual o operador que contracta el transport, amb les mateixes obligacions de generació i conservació.",
          },
        ],
      },
      {
        heading: "El document",
        items: [
          {
            q: "Serveix un PDF escanejat?",
            a: "No. El fitxer ha de ser un PDF natiu digital generat a partir de dades estructurades. Un escaneig o una imatge digitalitzada no és vàlid.",
          },
          {
            q: "S'ha de signar?",
            a: "La resolució no exigeix signatura electrònica. Sí que exigeix PDF natiu, QR, URL HTTPS de descàrrega directa i registre de creació i modificacions.",
          },
          {
            q: "Quines dades ha de contenir?",
            a: "Com a mínim: carregador contractual (nom o raó social, NIF i domicili), transportista efectiu (nom o raó social i NIF), lloc i data de càrrega, lloc i data de descàrrega, naturalesa i pes de la mercaderia, i matrícula del vehicle (tractora i remolc si és un conjunt articulat).",
          },
        ],
      },
      {
        heading: "Ús i cost",
        items: [
          {
            q: "Com el porta el conductor?",
            a: "Abans de l'inici del servei, en còpia electrònica visible al mòbil o en còpia impresa, sempre amb el QR disponible.",
          },
          {
            q: `És gratis ${BRAND.name}?`,
            a: "Sí. Pots crear i descarregar documents sense targeta i sense límit fins al 31 de desembre de 2026.",
          },
          {
            q: "Puc generar tots els documents que vulgui?",
            a: "Sí. No hi ha límit mensual. Només apliquem controls automàtics contra usos abusius que no afecten l'ús normal ni la inspecció.",
          },
        ],
      },
    ],
    finalCtaHeading: "Comença ara. Sense targeta.",
    finalCtaSubhead:
      "Crea el teu DeCA, desa les teves dades habituals i comença a treballar des d'un únic espai.",
    finalCtaMicrocopy: "Gratis durant la fase de llançament · Sense targeta",
  },
  auth: {
    heading: {
      register: "Crea el teu compte gratis",
      login: "Benvingut de nou",
      joinTeam: "Uneix-te a l'equip",
      claim: "Desa aquest DeCA",
    },
    subhead: {
      register:
        "Desa els teus DeCA, reutilitza les teves dades habituals i genera documents nous més ràpid.",
      login:
        "Entra per veure els teus DeCA, reutilitzar les teves dades i generar documents nous més ràpid.",
      joinTeamInvitedBy: (company: string) => `${company} t'ha convidat. `,
      joinTeamSuffix:
        "Crea el teu accés i compartiràs els seus DeCA i dades habituals. No cal donar d'alta una altra empresa.",
      claim:
        "Crea un compte gratuït per desar aquest document i reutilitzar les teves dades. No és un formulari comercial.",
    },
    orContinueWithEmail: "o continua amb correu",
    googleCta: "Continua amb Google",
    emailLabel: "Correu electrònic",
    passwordHint: "Mínim 12 caràcters, amb majúscules, minúscules, números i un símbol.",
    company: {
      legend: "La teva empresa",
      name: "Nom o raó social",
      nif: "CIF / NIF",
      contactName: "Persona de contacte",
      phone: "Telèfon",
      email: "Correu electrònic de l'empresa",
      address: "Adreça",
      postalCode: "Codi postal",
      city: "Població",
    },
    profile: {
      legend: "Com faràs servir principalment la plataforma?",
      items: {
        carrier_goods: {
          title: "Transportista de mercaderies",
          body: "Realitzes el transport de mercaderies per compte d'altri.",
        },
        shipper: {
          title: "Empresa carregadora",
          body: "Contractes transport per als teus propis enviaments de mercaderies.",
        },
        operator: {
          title: "Operador de transport",
          body: "Organitzes transports de mercaderies (operador logístic o agència).",
        },
        carrier_passengers: {
          title: "Transportista de viatgers",
          body: "Realitzes transport de viatgers per carretera.",
        },
      },
    },
    dataProtection: {
      title: "Informació bàsica sobre protecció de dades",
      responsible: "Responsable:",
      purpose: "Finalitat:",
      purposeBody: "gestionar l'alta i la prestació de la Plataforma DeCA.",
      moreInfoPrefix: "Més informació a la nostra",
      privacyPolicy: "Política de Privacitat",
    },
    terms: {
      readPrefix: "He llegit la",
      privacyPolicy: "Política de Privacitat",
      andAccept: "i accepto els",
      termsAndConditions: "Termes i Condicions",
    },
    submit: {
      register: "Crear compte gratis",
      login: "Entra",
      busy: "Un moment…",
    },
    forgotPassword: "Has oblidat la contrasenya?",
    switchPrompt: {
      toLogin: "Ja tens compte? ",
      toRegister: "No tens compte? ",
    },
    switchCta: {
      toLogin: "Inicia sessió",
      toRegister: "Crea el teu compte gratis",
    },
    footNote: "Gratis · Sense targeta · Els teus DeCA en un sol lloc",
    errors: {
      acceptTerms: "Has d'acceptar els Termes i Condicions i la Política de Privacitat.",
      generic: "No s'ha pogut completar. Torna-ho a intentar.",
      noConnection: "Sense connexió. Torna-ho a intentar.",
      googleFailed:
        "No s'ha pogut completar l'accés amb Google. Torna-ho a intentar o utilitza el teu email i contrasenya.",
    },
    invalidInvite: {
      title: "Invitació no vàlida",
      body: "Aquest enllaç d'invitació ha caducat, ja s'ha utilitzat o no és correcte. Demana a qui t'ha convidat que te n'enviï un de nou.",
      loginCta: "Ja tinc compte · Entra",
      freeStartCta: "Comença un DeCA gratis",
    },
    verify: {
      title: "Confirma el teu correu electrònic",
      sentPrefix: "Ja gairebé hi és. T'hem enviat un correu a",
      sentSuffix: "per activar el teu compte i començar a emetre DeCA.",
      failedPrefix: "No hem pogut enviar el correu de confirmació a",
      failedSuffix: "Prem «Reenviar correu» per tornar-ho a intentar.",
      whatNext: {
        title: "Què passa després",
        step1: "1. Confirmes el teu correu",
        step2: "2. Accedeixes al teu compte",
        step3: "3. Comences a emetre DeCA",
      },
      openMail: "Obre el meu correu",
      resend: "Reenviar correu",
      resendSending: "Enviant…",
      resendSent: "Correu reenviat. Revisa la teva safata d'entrada.",
      resendError: "No s'ha pogut reenviar. Torna-ho a intentar d'aquí uns minuts.",
      changeEmail: {
        open: "Canviar correu electrònic",
        label: "Nou correu electrònic",
        currentPasswordLabel: "La teva contrasenya actual",
        save: "Desar i reenviar",
        cancel: "Cancel·lar",
        error: "No s'ha pogut canviar el correu.",
      },
      continueChecking: "Comprovant…",
      continueLabel: "Ja he confirmat el meu compte",
      notYetVerified: "El teu correu encara no està verificat. Obre l'enllaç que t'hem enviat.",
      spamHint: "Si no trobes el missatge, revisa la carpeta de correu brossa o promocions.",
    },
    verifyToken: {
      successHeading: "Correu confirmat",
      successBody: "El teu compte està actiu. Ja pots emetre DeCA sense límits.",
      successCtaAuthed: "Anar al meu panell",
      successCtaAnon: "Entra",
      errorHeading: "No hem pogut confirmar el teu correu",
      errorInvalid: "Aquest enllaç de confirmació no és vàlid.",
      errorUsed: "Aquest enllaç ja s'ha utilitzat. El teu correu podria estar ja confirmat.",
      errorExpired: "L'enllaç de confirmació ha caducat. Demana'n un de nou des del teu compte.",
      errorCtaAuthed: "Demanar un enllaç nou",
      errorCtaAnon: "Entra",
    },
  },
  panel: {
    verifyBanner: {
      text: (email: string) => `Encara no has confirmat el teu correu (${email}).`,
      cta: "Confirmar ara",
    },
    myCompanyFallback: "La meva empresa",
    newDeca: "Nou DeCA",
    duplicateLast: "Repetir / duplicar últim DeCA",
    lastDocuments: "Últims documents",
    viewAllHistory: "Veure tot l'historial",
    noDocumentsYet: "Encara no tens documents.",
    createFirst: "Crea el teu primer DeCA",
    detail: "Detall",
    duplicate: "Duplicar",
    pdf: "PDF",
    companiesCard: "Empreses / transportistes habituals",
    vehiclesCard: "Vehicles habituals",
    manageData: "Gestionar dades habituals →",
    nav: {
      home: "Els meus DeCA",
      historico: "Historial",
      plantillas: "Plantilles",
      datos: "Dades habituals",
      equipo: "Equip",
      empresa: "La meva empresa",
      ayuda: "Ajuda",
    },
    help: {
      title: "Ajuda i suport",
      intro:
        "Tria el canal que necessitis. El suport tècnic i l'assistència jurídica són serveis diferents.",
      techHeading: "Suport tècnic",
      techIntro: "Per a incidències amb la plataforma, la generació del DeCA o el teu compte.",
      legalHeading: "Assistència jurídica en transport i logística",
      legalIntro:
        "Advocats amb experiència en transport i logística, útils davant inspeccions, sancions, reclamacions, conflictes contractuals i procediments judicials.",
      legalDisclaimer:
        "Servei prestat per PRAETORIA, S.L. No substitueix el suport tècnic i no garanteix cap resultat.",
      phoneLabel: "Telèfon",
      emailLabel: "Correu de suport",
      whatsappTech: "WhatsApp · suport tècnic",
      whatsappLegal: "WhatsApp · assistència jurídica",
      hoursLabel: "Horari d'atenció",
    },
    teamActivity: {
      heading: "Activitat de l'equip",
      invited: (actor: string) => `${actor} ha enviat una invitació`,
      joined: (actor: string) => `${actor} s'ha unit a l'equip`,
      roleChanged: (actor: string, target: string, role: string) =>
        `${actor} ha canviat el rol de ${target} a ${role}`,
      removed: (actor: string, target: string) => `${actor} ha eliminat ${target} de l'equip`,
      roleLabel: { owner: "Administrador", member: "Operador", read_only: "Només lectura" },
    },
  },
  historico: {
    title: "Historial",
    search: "Cercar",
    searchPlaceholder: "Referència, empresa, matrícula, origen o destí",
    from: "Des de",
    to: "Fins a",
    carrier: "Transportista",
    carrierAll: "Tots",
    plate: "Matrícula",
    filter: "Filtrar",
    clear: "Netejar",
    documentsCountOne: "document",
    documentsCountMany: "documents",
    exportCsv: "Exportar CSV",
    colDate: "Data",
    colRoute: "Càrrega → Descàrrega",
    colShipper: "Carregador",
    colCarrier: "Transportista",
    colPlate: "Matrícula",
    colStatus: "Estat",
    colActions: "Accions",
    statusActive: "Vigent",
    statusCorrected: "Corregida",
    statusUnavailable: "No disponible",
    detail: "Detall",
    correct: "Corregir",
    duplicate: "Duplicar",
    pdf: "PDF",
    inspection: "Inspecció",
    noResults: "Sense resultats.",
    createOne: "Crear un DeCA",
  },
  crear: {
    previewHeading: "Així quedarà el teu DeCA",
    steps: [
      "Qui contracta i qui transporta",
      "Càrrega i descàrrega",
      "Vehicle, mercaderia i revisió",
    ],
    subheadLeadGate:
      "Completa les dades sense compromís — només et demanarem el nom i el correu al final, sense necessitat de crear un compte.",
    correctionIntro:
      "Corregint el DeCA. Es generarà una versió nova amb un QR i una URL nous; la versió anterior es conserva.",
    stepOf: (current: number) => `Pas ${current} de 3 ·`,
    stepOfAria: (current: number, label: string) => `Pas ${current} de 3: ${label}`,
    noConnection: "Sense connexió. Revisa la teva xarxa i torna-ho a intentar.",
    templates: {
      legend: "Començar des d'una plantilla",
      placeholder: "Tria una plantilla…",
      hint: "Encara hauràs de revisar les dades i posar la data abans de generar.",
    },
    useCompany: {
      shipper: "La meva empresa és el carregador",
      carrier: "La meva empresa és el transportista",
    },
    useSame: {
      shipperIsCarrier: "El transportista és el mateix que el carregador",
      carrierIsShipper: "El carregador és el mateix que el transportista",
    },
    legends: {
      shipper: "Carregador contractual",
      carrier: "Transportista efectiu",
      loadLocation: "Lloc de càrrega",
      unloadLocation: "Lloc de descàrrega",
      vehicleGoods: "Vehicle i mercaderia",
    },
    sectionHints: {
      shipper: "Qui t'ha contractat aquest transport?",
      carrier: "Quina empresa fa físicament el transport?",
      loadLocation: "On es recull la mercaderia i quin dia.",
      unloadLocation:
        "On es lliura la mercaderia i quin dia. Pot ser el mateix dia que la càrrega.",
      vehicleGoods: "El vehicle que fa el transport i què es transporta.",
    },
    autofill: {
      company: "Cercar o seleccionar empresa habitual",
      carrier: "Cercar o seleccionar transportista habitual",
      location: "Cercar o seleccionar lloc habitual",
      vehicle: "Cercar o seleccionar vehicle",
      newOption: "Introduir-ne un de nou…",
    },
    fields: {
      name: "Nom o raó social",
      nif: "NIF / VAT",
      address: "Domicili",
      locationName: "Empresa o establiment",
      locationAddress: "Adreça completa",
      postalCode: "Codi postal",
      city: "Localitat",
      province: "Província",
      country: "País",
      loadDate: "Data de càrrega",
      unloadDate: "Data de descàrrega",
      goods: "Naturalesa de la mercaderia",
      weight: "Pes (o mesura alternativa)",
      weightHint: "Ex.: 12000 kg, o «una plataforma completa» si el pes exacte no és determinable.",
      tractorPlate: "Matrícula de la tractora",
      trailerPlate: "Matrícula del remolc / semiremolc",
      trailerHint: "Si no hi ha remolc, deixa-ho buit.",
      reference: "Referència o notes (opcional)",
    },
    hints: {
      nifForeign: "Pots fer servir un NIF/VAT estranger.",
      unloadSameDay: "Pot coincidir amb la data de càrrega.",
      plateForeign:
        "No sembla una matrícula espanyola (format 1234 BCD). És vàlida si el vehicle és estranger.",
    },
    errorSummaryTitle: "Revisa aquests camps:",
    lead: {
      title: "Només un pas més: a qui enviem el DeCA?",
      body: "El teu nom i correu, només per enviar-te l'enllaç de descàrrega. Sense crear compte.",
      name: "El teu nom",
      email: "El teu correu",
      loginPrompt: "Ja tens compte? Entra",
      loginPromptSuffix: "per fer servir les teves dades desades.",
    },
    verifyGate: {
      title: "Verifica el teu correu per generar el DeCA",
      body: "Les teves dades estan desades en aquest pas. Confirma l'enllaç que t'hem enviat per correu i torna — generem el teu document a l'instant, sense tornar a escriure res.",
      cta: "Anar a verificar el meu correu",
    },
    repeatGate: {
      title: "Ja has creat el teu primer DeCA",
      body: "Registra't gratis per crear el següent — reutilitzes les teves dades i és molt més ràpid.",
      cta: "Crear compte gratis",
      loginPrompt: "Ja tens compte? Entra",
    },
    readOnlyGate: {
      title: "El teu rol és de només lectura",
      body: "Pots veure l'historial i els documents de la teva empresa, però no crear ni corregir DeCA. Demana a un administrador que canviï el teu rol si ho necessites.",
      cta: "Anar al meu historial",
    },
    correctionReason: "Motiu de la correcció",
    correctionReasonRequired: "Indica el motiu de la correcció.",
    correctionSaveFailed: "No s'ha pogut desar la correcció.",
    checkingChallenge: "Comprovant… un moment.",
    generationFailedFallback:
      "No hem pogut generar el document. Les teves dades continuen desades. Torna-ho a intentar d'aquí uns segons.",
    generationFailedGeneric: "No s'ha pogut generar el DeCA. Torna-ho a intentar.",
    generatingStatus: "Estem generant el teu PDF i QR… no tanquis aquesta pàgina.",
    notGenerated: "No s'ha generat el DeCA",
    correlationPrefix: "Codi:",
    correlationSuffix: "— digues-nos-ho si torna a passar i localitzarem la fallada exacta.",
    retry: "Reintentar generació",
    backToReview: "Tornar a revisar les dades",
    review: {
      heading: "Revisa abans de generar",
      subhead:
        "Aquestes són les dades exactes que apareixeran al DeCA i al PDF. Fes servir «Editar» si alguna cosa no és correcta.",
      edit: "Editar",
      shipperTitle: "Empresa que contracta el transport",
      carrierTitle: "Transportista que realitza el transport",
      loadTitle: "Lloc i data de càrrega",
      unloadTitle: "Lloc i data de descàrrega",
      vehicleTitle: "Vehicle i mercaderia",
      name: "Nom o raó social",
      nif: "NIF / VAT",
      address: "Domicili",
      locationName: "Empresa / establiment",
      locationAddress: "Adreça",
      postalCode: "Codi postal",
      city: "Localitat",
      province: "Província",
      country: "País",
      loadDate: "Data de càrrega",
      unloadDate: "Data de descàrrega",
      tractorPlate: "Matrícula tractora",
      trailerPlate: "Matrícula remolc",
      goods: "Mercaderia",
      weight: "Pes o mesura",
      reference: "Referència",
    },
    buttons: {
      back: "Enrere",
      next: "Següent",
      generating: "Generant…",
      generate: "GENERAR DECA",
      saveCorrection: "DESAR CORRECCIÓ",
    },
    check: {
      title: "Comprovació del DeCA",
      ready: "A punt per generar",
      review: "Revisa les dades",
      missing: "Falten dades obligatòries",
      fix: "Corregeix",
      disclaimer:
        "Comprova que les dades obligatòries estan completes abans de generar. No és una validació jurídica del transport.",
      items: {
        shipper: "Carregador contractual identificat",
        carrier: "Transportista efectiu identificat",
        route: "Càrrega i descàrrega completes",
        dates: "Dates de càrrega i descàrrega informades",
        goods: "Mercaderia i pes o mesura informats",
        tractor: "Matrícula de la tractora informada",
      },
    },
  },
  result: {
    heading: "DeCA generat",
    version: "Versió",
    versionGenerated: (v: number, date: string) => `Versió ${v} · generat ${date}`,
    documentData: "Dades del document",
    retentionNotice:
      "Document conservat durant almenys 1 any. La URL pública permet la descàrrega directa del PDF sense registre, d'acord amb la resolució vigent.",
    createAnother: "Crear un altre DeCA",
    downloadPdf: "Obrir / descarregar PDF",
    sendToDriver: "Enviar al conductor",
    share: "Compartir…",
    whatsapp: "Enviar per WhatsApp",
    driverEmailLabel: "Correu del conductor",
    send: "Enviar",
    sent: "Enviat.",
    emailFallback: "L'enviament per correu no està configurat. Obrint el teu client de correu…",
    emailFailed: "No s'ha pogut enviar. Fes servir l'enllaç o WhatsApp.",
    emailNoConnection: "Sense connexió.",
    copyLink: "Copiar enllaç",
    linkCopied: "Enllaç copiat",
    print: "Imprimir",
    checkQr: "Comprovar QR",
    qrLinkLabel: "Aquest és l'enllaç que porta el QR del PDF:",
    openInspectionLink: "Obrir l'enllaç d'inspecció en una pestanya nova",
    verifyHint: "Per a la comprovació real, escaneja el QR amb un altre mòbil.",
    save: "Desar els meus DeCA creant un compte",
    saveHint:
      "Crear el compte desa els teus documents i les teves dades habituals. No és un formulari comercial.",
    correctedReminder:
      "Aquest DeCA s'ha corregit. Reenvia al conductor la versió actual — l'anterior queda com a historial i continua accessible per la seva URL.",
    shareTitle: "DeCA del transport",
    shareTextPrefix: "Document de control (DeCA) del transport:",
  },
  errors: {
    generic: "Alguna cosa no ha anat bé. Torna-ho a intentar d'aquí uns segons.",
    notFound: "No hem trobat aquesta pàgina.",
  },
  legal: {
    roles: {
      shipper: "Carregador contractual",
      carrier: "Transportista efectiu",
      shipperShort: "Carregador",
      carrierShort: "Transportista",
    },
  },
  legalNotice: {
    notTranslated:
      "Aquest document només té validesa legal en la seva versió en espanyol. Encara no hi ha una traducció disponible en aquest idioma.",
  },
  emails: {
    verifySubject: (brand: string) => `Confirma el teu correu a ${brand}`,
    verifyTextInitial: (brand: string, link: string) =>
      `Ja gairebé hi és. Confirma el teu correu per activar el teu compte de ${brand}.\n\nObre aquest enllaç (caduca en 24 hores):\n${link}\n\nSi no has estat tu, ignora aquest missatge.`,
    verifyTextResend: (brand: string, link: string) =>
      `Confirma el teu correu per activar el teu compte de ${brand}.\n\nObre aquest enllaç (caduca en 24 hores):\n${link}\n\nSi no has estat tu, ignora aquest missatge.`,
    verifyTextChangeEmail: (brand: string, link: string) =>
      `Confirma el teu nou correu per activar el teu compte de ${brand}.\n\nObre aquest enllaç (caduca en 24 hores):\n${link}\n\nSi no has estat tu, ignora aquest missatge.`,
    passwordResetSubject: (brand: string) => `Recupera l'accés a ${brand}`,
    passwordResetText: (brand: string, link: string) =>
      `Has demanat restablir la teva contrasenya de ${brand}.\n\nObre aquest enllaç (caduca en 1 hora):\n${link}\n\nSi no has estat tu, ignora aquest missatge.`,
  },
} satisfies Messages;
