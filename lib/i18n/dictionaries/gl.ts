import { BRAND } from "@/lib/brand";
import type { Messages } from "./es";

/**
 * Galician string catalog, key-for-key with `es.ts` (I18N #54). `satisfies
 * Messages` pins this to the Spanish dictionary's exact shape, so a key added
 * to one and forgotten in the other is a type error, not a silent blank
 * string in prod. Legal pages (`/terminos`, `/privacidad`, `/aviso-legal`)
 * are NOT translated by this dictionary — they render fixed Spanish JSX and
 * stay that way in every locale until a professional legal review exists
 * (owner decision, see `docs/decisions.md` D-072).
 */
export const gl = {
  common: {
    appName: BRAND.name,
    createCta: "CREAR DECA GRATIS",
    headerCta: "Crear DeCA",
    loginCta: "Entrar",
    panelCta: "Ir ao meu panel",
    skipToContent: "Saltar ao contido",
  },
  nav: {
    howItWorks: "Como funciona",
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
      h1: "DeCA profesional, sinxelo e listo para traballar.",
      subhead:
        "Xera, xestiona, custodia e comparte os teus Documentos Electrónicos de Control desde unha plataforma especializada en transporte.",
      proof:
        "Mercadorías · PDF + QR · Custodia dixital · Historial · Multiusuario · Gratis durante a fase de lanzamento",
      cta: "CREAR DECA GRATIS",
      ctaSecondary: "ENTRAR",
      noCardNote: "Sen tarxeta · Sen límite de documentos durante a fase de lanzamento.",
    },
    trustRow: [
      "Sen rexistro para o teu primeiro DeCA",
      "PDF + QR",
      "Custodia dixital",
      "Historial",
    ],
    stepsHeading: "Crea o teu DeCA en 3 pasos",
    steps: [
      {
        title: "Introduce os datos",
        body: "Cargador, transportista, orixe, destino, mercadoría e matrícula. Sen compromiso.",
      },
      {
        title: "Crea a túa conta e xérao",
        body: "Rexistro gratuíto en segundos — creamos o PDF nativo con QR e unha URL única de descarga directa. Non se perde nada do que xa escribiches.",
      },
      {
        title: "Compárteo co condutor",
        body: "Enlace, WhatsApp, correo ou copia impresa. Listo para inspección.",
      },
    ],
    freeValueHeading: "Todo incluído durante o lanzamento.",
    freeValueSubhead:
      "Multiusuario, historial, custodia e reutilización de datos incluídos sen custo durante a fase de lanzamento — funcións que outras plataformas de DeCA cobran á parte.",
    freeValueComingSoon: "Proximamente",
    freeValueItems: [
      { label: "Xerar DeCA" },
      { label: "PDF nativo + QR" },
      { label: "Historial" },
      { label: "Custodia dixital" },
      { label: "Multiusuario" },
      { label: "Empresas habituais" },
      { label: "Vehículos gardados" },
      { label: "Lugares habituais" },
      { label: "Duplicado rápido" },
      { label: "Rutas frecuentes" },
      { label: "Modo inspección" },
      { label: "Acceso API / ERP" },
    ],
    productHeading: "Do formulario ao PDF con QR, sen pasos de máis",
    benefits: [
      {
        title: "Gratis",
        body: "Sen límite de DeCA durante a fase de captación. Sen tarxeta, sen plan de pagamento.",
      },
      {
        title: "Rápido",
        body: "Reutiliza os teus datos habituais e duplica documentos anteriores nun toque.",
      },
      {
        title: "Preparado para inspección",
        body: "PDF nativo, QR e URL HTTPS directa de acordo coa resolución vixente.",
      },
    ],
    personasHeading: "Feito para quen move mercadoría",
    personas: [
      {
        title: "Transportista autónomo",
        jobToBeDone: "Xera o DeCA en minutos e lévao no móbil.",
        benefits: [
          "Rexistro gratuíto en segundos",
          "Empresa e vehículo gardados despois de rexistrarte",
          "Duplicado rápido do último documento",
          "Envío ao condutor nun toque",
        ],
      },
      {
        title: "Empresa de transporte",
        jobToBeDone: "Un mesmo espazo para todos os teus operadores e documentos.",
        benefits: [
          "Varios usuarios na mesma empresa",
          "Historial compartido",
          "Cargadores, vehículos e enderezos gardados",
          "Auditoría de quen creou ou corrixiu cada DeCA",
        ],
      },
      {
        title: "Axencia / operador de transporte",
        jobToBeDone: "Xestiona o documento como cargador contractual sen depender de terceiros.",
        benefits: [
          "Varias empresas e transportistas",
          "Contrapartes reutilizables",
          "Duplicado rápido",
          "Espazo de traballo para o equipo",
        ],
      },
      {
        title: "Cargador / expedidor",
        jobToBeDone: "Xera, conserva e comparte os teus DeCA desde un único sitio.",
        benefits: [
          "Transportistas habituais gardados",
          "Historial de documentos",
          "Ruta de inspección directa por QR/PDF",
          "Sen montar un proceso novo no teu ERP",
        ],
      },
    ],
    personaCtaPrefix: "Como funciona para",
    dailyUseHeading: "Cada DeCA cústache menos tempo có anterior.",
    dailyUseSubhead: "Garda unha vez. Reutiliza sempre.",
    dailyUseFooter:
      "Comeza a encher o teu DeCA sen compromiso; só che pedimos crear unha conta gratuíta ao final, para xeralo.",
    dailyUseFooterLink: "a túa empresa",
    dailyUseFooterAfterLink: "garda todo isto para que o seguinte DeCA sexa cuestión de segundos.",
    dailyUse: [
      { label: "Xerar DeCA", body: "Formulario guiado en 3 pasos." },
      { label: "PDF + QR", body: "Documento nativo con QR de verificación." },
      { label: "Historial", body: "Todos os teus documentos, sempre a man." },
      { label: "Duplicar", body: "Repite un DeCA anterior en segundos." },
      { label: "Vehículos gardados", body: "Tractora e remolque nun clic." },
      {
        label: "Empresas habituais",
        body: "Cargadores e transportistas reutilizables.",
      },
      { label: "Lugares habituais", body: "Carga e descarga listos para elixir." },
      {
        label: "Custodia dixital",
        body: "Conservación de acordo coa normativa vixente.",
      },
    ],
    regulationHeading: "Que esixe a normativa",
    legalPoints: [
      "Obrigatorio desde o 5 de outubro de 2026 para o transporte interior de mercadorías por estrada.",
      "O ficheiro é un PDF nativo dixital, xerado a partir de datos estruturados — non vale un escaneo.",
      "Tamaño máximo 5 MB.",
      "Inclúe un código QR cunha URL única que comeza por https://",
      "A URL permite a descarga directa do PDF, sen rexistro e sen contrasinal.",
      "Rexístrase a data e a hora de creación e de calquera modificación.",
      "Conservación mínima de 1 ano por parte do cargador e do transportista.",
    ],
    legalSourceLabel: "Fonte:",
    operatorTrustHeading: "Quen hai detrás do servizo",
    faqHeading: "Preguntas frecuentes",
    faqGroups: [
      {
        heading: "Normativa e obriga",
        items: [
          {
            q: "Que é o DeCA?",
            a: "O Documento Electrónico de Control Administrativo é a versión dixital obrigatoria do documento de control do transporte de mercadorías por estrada. Substitúe o documento en papel.",
          },
          {
            q: "Cando é obrigatorio?",
            a: "Desde o 5 de outubro de 2026 para o transporte interior, sen prórroga nin período transitorio: o DeCA debe xerarse en formato electrónico desde a orixe. O condutor pode levalo en copia electrónica no móbil ou en copia impresa co código QR; un documento creado orixinalmente en papel e escaneado despois non é un DeCA electrónico válido.",
          },
          {
            q: "Quen o ten que facer?",
            a: "O cargador contractual e o transportista efectivo do transporte público de mercadorías por estrada, nos termos da normativa aplicable.",
          },
          {
            q: "É obrigatorio para axencias de transporte?",
            a: "Si, cando actúan como cargador contractual ou operador que contrata o transporte, coas mesmas obrigas de xeración e conservación.",
          },
        ],
      },
      {
        heading: "O documento",
        items: [
          {
            q: "Serve un PDF escaneado?",
            a: "Non. O ficheiro debe ser un PDF nativo dixital xerado a partir de datos estruturados. Un escaneo ou unha imaxe dixitalizada non é válido.",
          },
          {
            q: "Ten que asinarse?",
            a: "A resolución non esixe sinatura electrónica. Si que esixe PDF nativo, QR, URL HTTPS de descarga directa e rexistro de creación e modificacións.",
          },
          {
            q: "Que datos debe conter?",
            a: "Como mínimo: cargador contractual (nome ou razón social, NIF e domicilio), transportista efectivo (nome ou razón social e NIF), lugar e data de carga, lugar e data de descarga, natureza e peso da mercadoría, e matrícula do vehículo (tractora e remolque se é un conxunto articulado).",
          },
        ],
      },
      {
        heading: "Uso e custo",
        items: [
          {
            q: "Como o leva o condutor?",
            a: "Antes do inicio do servizo, en copia electrónica visible no móbil ou en copia impresa, sempre co QR dispoñible.",
          },
          {
            q: `É gratis ${BRAND.name}?`,
            a: "Si. Podes crear e descargar documentos sen tarxeta e sen límite ata o 31 de decembro de 2026.",
          },
          {
            q: "Podo xerar todos os documentos que queira?",
            a: "Si. Non hai límite mensual. Só aplicamos controis automáticos fronte a usos abusivos que non afectan o uso normal nin a inspección.",
          },
        ],
      },
    ],
    finalCtaHeading: "Comeza agora. Sen tarxeta.",
    finalCtaSubhead:
      "Crea o teu DeCA, garda os teus datos habituais e comeza a traballar desde un único espazo.",
    finalCtaMicrocopy: "Gratis durante a fase de lanzamento · Sen tarxeta",
  },
  auth: {
    heading: {
      register: "Crea a túa conta gratis",
      login: "Benvido de novo",
      joinTeam: "Únete ao equipo",
      claim: "Garda este DeCA",
    },
    subhead: {
      register:
        "Garda os teus DeCA, reutiliza os teus datos habituais e xera documentos novos máis rápido.",
      login:
        "Entra para ver os teus DeCA, reutilizar os teus datos e xerar novos documentos máis rápido.",
      joinTeamInvitedBy: (company: string) => `${company} convidoute. `,
      joinTeamSuffix:
        "Crea o teu acceso e compartirás os seus DeCA e datos habituais. Non fai falla dar de alta outra empresa.",
      claim:
        "Crea unha conta gratuíta para gardar este documento e reutilizar os teus datos. Non é un formulario comercial.",
    },
    orContinueWithEmail: "ou continúa con correo",
    googleCta: "Continuar con Google",
    emailLabel: "Correo electrónico",
    passwordHint: "Mínimo 12 caracteres, con maiúsculas, minúsculas, números e un símbolo.",
    company: {
      legend: "A túa empresa",
      name: "Nome ou razón social",
      nif: "CIF / NIF",
      contactName: "Persoa de contacto (opcional)",
      phone: "Teléfono (opcional)",
      address: "Domicilio (opcional)",
    },
    profile: {
      legend: "Como usarás principalmente a plataforma?",
      items: {
        carrier_goods: {
          title: "Transportista de mercadorías",
          body: "Realizas o transporte de mercadorías por conta allea.",
        },
        shipper: {
          title: "Empresa cargadora",
          body: "Contratas transporte para os teus propios envíos de mercadorías.",
        },
        operator: {
          title: "Operador de transporte",
          body: "Organizas transportes de mercadorías (operador loxístico ou axencia).",
        },
        carrier_passengers: {
          title: "Transportista de viaxeiros",
          body: "Realizas transporte de viaxeiros por estrada.",
        },
      },
    },
    dataProtection: {
      title: "Información básica sobre protección de datos",
      responsible: "Responsable:",
      purpose: "Finalidade:",
      purposeBody: "xestionar a alta e a prestación da Plataforma DeCA.",
      moreInfoPrefix: "Máis información na nosa",
      privacyPolicy: "Política de Privacidade",
    },
    terms: {
      readPrefix: "Lin a",
      privacyPolicy: "Política de Privacidade",
      andAccept: "e acepto os",
      termsAndConditions: "Termos e Condicións",
    },
    submit: {
      register: "Crear conta gratis",
      login: "Entrar",
      busy: "Un momento…",
    },
    forgotPassword: "Esqueciches o contrasinal?",
    switchPrompt: {
      toLogin: "Xa tes conta? ",
      toRegister: "Non tes conta? ",
    },
    switchCta: {
      toLogin: "Inicia sesión",
      toRegister: "Crea a túa conta gratis",
    },
    footNote: "Gratis · Sen tarxeta · Os teus DeCA nun só lugar",
    errors: {
      acceptTerms: "Debes aceptar os Termos e Condicións e a Política de Privacidade.",
      generic: "Non se puido completar. Téntao de novo.",
      noConnection: "Sen conexión. Téntao de novo.",
      googleFailed:
        "Non se puido completar o acceso con Google. Téntao de novo ou usa o teu email e contrasinal.",
    },
    invalidInvite: {
      title: "Invitación non válida",
      body: "Esta ligazón de invitación caducou, xa se utilizou ou non é correcta. Pídelle a quen te convidou que che envíe unha nova.",
      loginCta: "Xa teño conta · Entrar",
      freeStartCta: "Comezar un DeCA gratis",
    },
    verify: {
      title: "Confirma o teu correo electrónico",
      sentPrefix: "Xa case está. Enviámosche un correo a",
      sentSuffix: "para activar a túa conta e comezar a emitir DeCA.",
      failedPrefix: "Non puidemos enviar o correo de confirmación a",
      failedSuffix: "Preme «Reenviar correo» para tentalo de novo.",
      whatNext: {
        title: "Que ocorre despois",
        step1: "1. Confirmas o teu correo",
        step2: "2. Accedes á túa conta",
        step3: "3. Comezas a emitir DeCA",
      },
      openMail: "Abrir o meu correo",
      resend: "Reenviar correo",
      resendSending: "Enviando…",
      resendSent: "Correo reenviado. Revisa a túa caixa de entrada.",
      resendError: "Non se puido reenviar. Téntao de novo nuns minutos.",
      changeEmail: {
        open: "Cambiar correo electrónico",
        label: "Novo correo electrónico",
        currentPasswordLabel: "O teu contrasinal actual",
        save: "Gardar e reenviar",
        cancel: "Cancelar",
        error: "Non se puido cambiar o correo.",
      },
      continueChecking: "Comprobando…",
      continueLabel: "Xa confirmei a miña conta",
      notYetVerified: "O teu correo aínda non está verificado. Abre a ligazón que che enviamos.",
      spamHint: "Se non atopas a mensaxe, revisa o cartafol de correo lixo ou promocións.",
    },
    verifyToken: {
      successHeading: "Correo confirmado",
      successBody: "A túa conta está activa. Xa podes emitir DeCA sen límites.",
      successCtaAuthed: "Ir ao meu panel",
      successCtaAnon: "Entrar",
      errorHeading: "Non puidemos confirmar o teu correo",
      errorInvalid: "Esta ligazón de confirmación non é válida.",
      errorUsed: "Esta ligazón xa se utilizou. O teu correo podería estar xa confirmado.",
      errorExpired: "A ligazón de confirmación caducou. Pide unha nova desde a túa conta.",
      errorCtaAuthed: "Pedir unha ligazón nova",
      errorCtaAnon: "Entrar",
    },
  },
  panel: {
    verifyBanner: {
      text: (email: string) => `Aínda non confirmaches o teu correo (${email}).`,
      cta: "Confirmar agora",
    },
    myCompanyFallback: "A miña empresa",
    newDeca: "Novo DeCA",
    duplicateLast: "Repetir / duplicar último DeCA",
    lastDocuments: "Últimos documentos",
    viewAllHistory: "Ver todo o historial",
    noDocumentsYet: "Aínda non tes documentos.",
    createFirst: "Crea o teu primeiro DeCA",
    detail: "Detalle",
    duplicate: "Duplicar",
    pdf: "PDF",
    companiesCard: "Empresas / transportistas habituais",
    vehiclesCard: "Vehículos habituais",
    manageData: "Xestionar datos habituais →",
    nav: {
      home: "Os meus DeCA",
      historico: "Historial",
      plantillas: "Modelos",
      datos: "Datos habituais",
      equipo: "Equipo",
      empresa: "A miña empresa",
    },
    teamActivity: {
      heading: "Actividade do equipo",
      invited: (actor: string) => `${actor} enviou unha invitación`,
      joined: (actor: string) => `${actor} uniuse ao equipo`,
      roleChanged: (actor: string, target: string, role: string) =>
        `${actor} cambiou o rol de ${target} a ${role}`,
      removed: (actor: string, target: string) => `${actor} eliminou a ${target} do equipo`,
      roleLabel: { owner: "Administrador", member: "Operador", read_only: "Só lectura" },
    },
  },
  historico: {
    title: "Historial",
    search: "Buscar",
    searchPlaceholder: "Referencia, empresa, matrícula, orixe ou destino",
    from: "Desde",
    to: "Ata",
    carrier: "Transportista",
    carrierAll: "Todos",
    plate: "Matrícula",
    filter: "Filtrar",
    clear: "Limpar",
    documentsCountOne: "documento",
    documentsCountMany: "documentos",
    exportCsv: "Exportar CSV",
    colDate: "Data",
    colRoute: "Carga → Descarga",
    colShipper: "Cargador",
    colCarrier: "Transportista",
    colPlate: "Matrícula",
    colStatus: "Estado",
    colActions: "Accións",
    statusActive: "Vixente",
    statusCorrected: "Corrixida",
    statusUnavailable: "Non dispoñible",
    detail: "Detalle",
    correct: "Corrixir",
    duplicate: "Duplicar",
    pdf: "PDF",
    noResults: "Sen resultados.",
    createOne: "Crear un DeCA",
  },
  crear: {
    previewHeading: "Así quedará o teu DeCA",
    steps: [
      "Quen contrata e quen transporta",
      "Carga e descarga",
      "Vehículo, mercadoría e revisión",
    ],
    subheadLeadGate:
      "Completa os datos sen compromiso — só che pediremos o nome e o correo ao final, sen necesidade de crear unha conta.",
    correctionIntro:
      "Corrixindo o DeCA. Xerarase unha versión nova cun QR e unha URL novos; a versión anterior consérvase.",
    stepOf: (current: number) => `Paso ${current} de 3 ·`,
    stepOfAria: (current: number, label: string) => `Paso ${current} de 3: ${label}`,
    noConnection: "Sen conexión. Revisa a túa rede e téntao de novo.",
    templates: {
      legend: "Comezar desde un modelo",
      placeholder: "Escolle un modelo…",
      hint: "Aínda terás que revisar os datos e poñer a data antes de xerar.",
    },
    useCompany: {
      shipper: "A miña empresa é o cargador",
      carrier: "A miña empresa é o transportista",
    },
    useSame: {
      shipperIsCarrier: "O transportista é o mesmo que o cargador",
      carrierIsShipper: "O cargador é o mesmo que o transportista",
    },
    legends: {
      shipper: "Cargador contractual",
      carrier: "Transportista efectivo",
      loadLocation: "Lugar de carga",
      unloadLocation: "Lugar de descarga",
      vehicleGoods: "Vehículo e mercadoría",
    },
    sectionHints: {
      shipper: "Quen te contratou este transporte?",
      carrier: "Que empresa realiza fisicamente o transporte?",
      loadLocation: "Onde se recolle a mercadoría e que día.",
      unloadLocation: "Onde se entrega a mercadoría e que día. Pode ser o mesmo día que a carga.",
      vehicleGoods: "O vehículo que fai o transporte e que se transporta.",
    },
    autofill: {
      company: "Buscar ou seleccionar empresa habitual",
      carrier: "Buscar ou seleccionar transportista habitual",
      location: "Buscar ou seleccionar lugar habitual",
      vehicle: "Buscar ou seleccionar vehículo",
      newOption: "Introducir un novo…",
    },
    fields: {
      name: "Nome ou razón social",
      nif: "NIF / VAT",
      address: "Domicilio",
      locationName: "Empresa ou establecemento",
      locationAddress: "Enderezo completo",
      postalCode: "Código postal",
      city: "Localidade",
      province: "Provincia",
      country: "País",
      loadDate: "Data de carga",
      unloadDate: "Data de descarga",
      goods: "Natureza da mercadoría",
      weight: "Peso (ou medida alternativa)",
      weightHint:
        "Ex.: 12000 kg, ou «unha plataforma completa» se o peso exacto non é determinable.",
      tractorPlate: "Matrícula da tractora",
      trailerPlate: "Matrícula do remolque / semirremolque",
      trailerHint: "Se non hai remolque, déixao baleiro.",
      reference: "Referencia ou notas (opcional)",
    },
    hints: {
      nifForeign: "Podes usar un NIF/VAT estranxeiro.",
      unloadSameDay: "Pode coincidir coa data de carga.",
      plateForeign:
        "Non parece unha matrícula española (formato 1234 BCD). É válida se o vehículo é estranxeiro.",
    },
    errorSummaryTitle: "Revisa estes campos:",
    lead: {
      title: "Só un paso máis: a quen enviamos o DeCA?",
      body: "O teu nome e correo, só para enviarche a ligazón de descarga. Sen crear conta.",
      name: "O teu nome",
      email: "O teu correo",
      loginPrompt: "Xa tes conta? Entra",
      loginPromptSuffix: "para usar os teus datos gardados.",
    },
    verifyGate: {
      title: "Verifica o teu correo para xerar o DeCA",
      body: "Os teus datos están gardados neste paso. Confirma a ligazón que che enviamos por correo e volve — xeramos o teu documento ao instante, sen volver escribir nada.",
      cta: "Ir a verificar o meu correo",
    },
    repeatGate: {
      title: "Xa creaches o teu primeiro DeCA",
      body: "Rexístrate gratis para crear o seguinte — reutilizas os teus datos e é moito máis rápido.",
      cta: "Crear conta gratis",
      loginPrompt: "Xa tes conta? Entra",
    },
    readOnlyGate: {
      title: "O teu rol é de só lectura",
      body: "Podes ver o historial e os documentos da túa empresa, pero non crear nin corrixir DeCA. Pídelle a un administrador que cambie o teu rol se o necesitas.",
      cta: "Ir ao meu historial",
    },
    correctionReason: "Motivo da corrección",
    correctionReasonRequired: "Indica o motivo da corrección.",
    correctionSaveFailed: "Non se puido gardar a corrección.",
    checkingChallenge: "Comprobando… un momento.",
    generationFailedFallback:
      "Non puidemos xerar o documento. Os teus datos seguen gardados. Téntao de novo nuns segundos.",
    generationFailedGeneric: "Non se puido xerar o DeCA. Téntao de novo.",
    generatingStatus: "Estamos xerando o teu PDF e QR… non peches esta páxina.",
    notGenerated: "Non se xerou o DeCA",
    correlationPrefix: "Código:",
    correlationSuffix: "— dinolo se volve pasar e localizaremos o fallo exacto.",
    retry: "Reintentar xeración",
    backToReview: "Volver revisar datos",
    review: {
      heading: "Revisa antes de xerar",
      subhead:
        "Estes son os datos exactos que aparecerán no DeCA e no PDF. Usa «Editar» se algo non é correcto.",
      edit: "Editar",
      shipperTitle: "Empresa que contrata o transporte",
      carrierTitle: "Transportista que realiza o transporte",
      loadTitle: "Lugar e data de carga",
      unloadTitle: "Lugar e data de descarga",
      vehicleTitle: "Vehículo e mercadoría",
      name: "Nome ou razón social",
      nif: "NIF / VAT",
      address: "Domicilio",
      locationName: "Empresa / establecemento",
      locationAddress: "Enderezo",
      postalCode: "Código postal",
      city: "Localidade",
      province: "Provincia",
      country: "País",
      loadDate: "Data de carga",
      unloadDate: "Data de descarga",
      tractorPlate: "Matrícula tractora",
      trailerPlate: "Matrícula remolque",
      goods: "Mercadoría",
      weight: "Peso ou medida",
      reference: "Referencia",
    },
    buttons: {
      back: "Atrás",
      next: "Seguinte",
      generating: "Xerando…",
      generate: "XERAR DECA",
      saveCorrection: "GARDAR CORRECCIÓN",
    },
  },
  result: {
    heading: "DeCA xerado",
    version: "Versión",
    versionGenerated: (v: number, date: string) => `Versión ${v} · xerado ${date}`,
    documentData: "Datos do documento",
    retentionNotice:
      "Documento conservado durante polo menos 1 ano. A URL pública permite a descarga directa do PDF sen rexistro, de acordo coa resolución vixente.",
    createAnother: "Crear outro DeCA",
    downloadPdf: "Abrir / descargar PDF",
    sendToDriver: "Enviar ao condutor",
    share: "Compartir…",
    whatsapp: "Enviar por WhatsApp",
    driverEmailLabel: "Correo do condutor",
    send: "Enviar",
    sent: "Enviado.",
    emailFallback: "O envío por correo non está configurado. Abrindo o teu cliente de correo…",
    emailFailed: "Non se puido enviar. Usa a ligazón ou WhatsApp.",
    emailNoConnection: "Sen conexión.",
    copyLink: "Copiar ligazón",
    linkCopied: "Ligazón copiada",
    print: "Imprimir",
    checkQr: "Comprobar QR",
    qrLinkLabel: "Esta é a ligazón que leva o QR do PDF:",
    openInspectionLink: "Abrir a ligazón de inspección nunha pestana nova",
    verifyHint: "Para a comprobación real, escanea o QR con outro móbil.",
    save: "Gardar os meus DeCA creando unha conta",
    saveHint:
      "Crear a conta garda os teus documentos e os teus datos habituais. Non é un formulario comercial.",
    correctedReminder:
      "Este DeCA corrixiuse. Reenvía ao condutor a versión actual — a anterior queda como historial e segue accesible pola súa URL.",
    shareTitle: "DeCA do transporte",
    shareTextPrefix: "Documento de control (DeCA) do transporte:",
  },
  errors: {
    generic: "Algo non foi ben. Téntao de novo nuns segundos.",
    notFound: "Non atopamos esta páxina.",
  },
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
      "Este documento só ten validez legal na súa versión en español. Aínda non hai unha tradución dispoñible neste idioma.",
  },
  emails: {
    verifySubject: (brand: string) => `Confirma o teu correo en ${brand}`,
    verifyTextInitial: (brand: string, link: string) =>
      `Xa case está. Confirma o teu correo para activar a túa conta de ${brand}.\n\nAbre esta ligazón (caduca en 24 horas):\n${link}\n\nSe non fuches ti, ignora esta mensaxe.`,
    verifyTextResend: (brand: string, link: string) =>
      `Confirma o teu correo para activar a túa conta de ${brand}.\n\nAbre esta ligazón (caduca en 24 horas):\n${link}\n\nSe non fuches ti, ignora esta mensaxe.`,
    verifyTextChangeEmail: (brand: string, link: string) =>
      `Confirma o teu novo correo para activar a túa conta de ${brand}.\n\nAbre esta ligazón (caduca en 24 horas):\n${link}\n\nSe non fuches ti, ignora esta mensaxe.`,
    passwordResetSubject: (brand: string) => `Recupera o acceso a ${brand}`,
    passwordResetText: (brand: string, link: string) =>
      `Solicitaches restablecer o teu contrasinal de ${brand}.\n\nAbre esta ligazón (caduca en 1 hora):\n${link}\n\nSe non fuches ti, ignora esta mensaxe.`,
  },
} satisfies Messages;
