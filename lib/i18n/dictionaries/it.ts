import { BRAND } from "@/lib/brand";
import type { Messages } from "./es";

/**
 * Italian string catalog, key-for-key with `es.ts` (I18N #54). `satisfies
 * Messages` pins this to the Spanish dictionary's exact shape, so a key added
 * to one and forgotten in the other is a type error, not a silent blank
 * string in prod. Legal pages (`/terminos`, `/privacidad`, `/aviso-legal`)
 * are NOT translated by this dictionary — they render fixed Spanish JSX and
 * stay that way in every locale until a professional legal review exists
 * (owner decision, see `docs/decisions.md` D-072).
 */
export const it = {
  common: {
    appName: BRAND.name,
    createCta: "CREA UN DECA GRATIS",
    headerCta: "Crea DeCA",
    loginCta: "Accedi",
    panelCta: "Vai al mio pannello",
    skipToContent: "Vai al contenuto",
  },
  nav: {
    howItWorks: "Come funziona",
    regulation: "Normativa",
    guides: "Guide",
    blog: "Blog",
    faq: "Domande",
  },
  language: {
    es: "Español",
    en: "English",
  },
  landing: {
    hero: {
      eyebrow: "Documento Elettronico di Controllo",
      h1: "DeCA professionale, semplice e pronto all'uso.",
      subhead:
        "Genera, gestisci, conserva e condividi i tuoi Documenti Elettronici di Controllo da una piattaforma specializzata nel trasporto.",
      proof:
        "Merci · PDF + QR · Conservazione digitale · Cronologia · Multiutente · Gratis durante la fase di lancio",
      cta: "CREA UN DECA GRATIS",
      ctaSecondary: "ACCEDI",
      noCardNote: "Senza carta · Nessun limite di documenti durante la fase di lancio.",
    },
    trustRow: [
      "Nessuna registrazione per il tuo primo DeCA",
      "PDF + QR",
      "Conservazione digitale",
      "Cronologia",
    ],
    stepsHeading: "Crea il tuo DeCA in 3 passaggi",
    steps: [
      {
        title: "Inserisci i dati",
        body: "Mittente, vettore, origine, destinazione, merce e targa. Senza impegno.",
      },
      {
        title: "Crea il tuo account e genera",
        body: "Registrazione gratuita in pochi secondi — creiamo il PDF nativo con QR e un URL unico di download diretto. Nulla di ciò che hai già scritto va perso.",
      },
      {
        title: "Condividilo con l'autista",
        body: "Link, WhatsApp, e-mail o copia stampata. Pronto per l'ispezione.",
      },
    ],
    freeValueHeading: "Tutto incluso durante il lancio.",
    freeValueSubhead:
      "Multiutente, cronologia, conservazione e riutilizzo dei dati inclusi senza costi durante la fase di lancio — funzioni che altre piattaforme DeCA fanno pagare a parte.",
    freeValueComingSoon: "Prossimamente",
    freeValueItems: [
      { label: "Genera DeCA" },
      { label: "PDF nativo + QR" },
      { label: "Cronologia" },
      { label: "Conservazione digitale" },
      { label: "Multiutente" },
      { label: "Aziende abituali" },
      { label: "Veicoli salvati" },
      { label: "Luoghi abituali" },
      { label: "Duplicazione rapida" },
      { label: "Percorsi frequenti" },
      { label: "Modalità ispezione" },
      { label: "Accesso API / ERP" },
    ],
    productHeading: "Dal modulo al PDF con QR, senza passaggi superflui",
    benefits: [
      {
        title: "Gratis",
        body: "Nessun limite di DeCA durante la fase di lancio. Senza carta, senza piano di pagamento.",
      },
      {
        title: "Veloce",
        body: "Riutilizza i tuoi dati abituali e duplica documenti precedenti con un tocco.",
      },
      {
        title: "Pronto per l'ispezione",
        body: "PDF nativo, QR e URL HTTPS diretto conforme alla risoluzione vigente.",
      },
    ],
    personasHeading: "Pensato per chi muove merci",
    personas: [
      {
        title: "Vettore autonomo",
        jobToBeDone: "Genera il DeCA in pochi minuti e portalo sul cellulare.",
        benefits: [
          "Registrazione gratuita in pochi secondi",
          "Azienda e veicolo salvati dopo la registrazione",
          "Duplicazione rapida dell'ultimo documento",
          "Invio all'autista con un tocco",
        ],
      },
      {
        title: "Azienda di trasporti",
        jobToBeDone: "Uno stesso spazio per tutti i tuoi operatori e documenti.",
        benefits: [
          "Più utenti nella stessa azienda",
          "Cronologia condivisa",
          "Mittenti, veicoli e indirizzi salvati",
          "Verifica di chi ha creato o corretto ogni DeCA",
        ],
      },
      {
        title: "Agenzia / operatore di trasporto",
        jobToBeDone: "Gestisci il documento come mittente contrattuale senza dipendere da terzi.",
        benefits: [
          "Più aziende e vettori",
          "Controparti riutilizzabili",
          "Duplicazione rapida",
          "Spazio di lavoro per il team",
        ],
      },
      {
        title: "Mittente / speditore",
        jobToBeDone: "Genera, conserva e condividi i tuoi DeCA da un unico posto.",
        benefits: [
          "Vettori abituali salvati",
          "Cronologia dei documenti",
          "Percorso di ispezione diretto tramite QR/PDF",
          "Senza dover impostare un nuovo processo nel tuo ERP",
        ],
      },
    ],
    personaCtaPrefix: "Come funziona per",
    dailyUseHeading: "Ogni DeCA ti costa meno tempo del precedente.",
    dailyUseSubhead: "Salva una volta. Riutilizza sempre.",
    dailyUseFooter:
      "Inizia a compilare il tuo DeCA senza impegno; ti chiediamo solo di creare un account gratuito alla fine, per generarlo.",
    dailyUseFooterLink: "la tua azienda",
    dailyUseFooterAfterLink:
      "salva tutto questo così il prossimo DeCA richiederà solo pochi secondi.",
    dailyUse: [
      { label: "Genera DeCA", body: "Modulo guidato in 3 passaggi." },
      { label: "PDF + QR", body: "Documento nativo con QR di verifica." },
      { label: "Cronologia", body: "Tutti i tuoi documenti, sempre a portata di mano." },
      { label: "Duplica", body: "Ripeti un DeCA precedente in pochi secondi." },
      { label: "Veicoli salvati", body: "Trattore e rimorchio con un clic." },
      {
        label: "Aziende abituali",
        body: "Mittenti e vettori riutilizzabili.",
      },
      { label: "Luoghi abituali", body: "Carico e scarico pronti da scegliere." },
      {
        label: "Conservazione digitale",
        body: "Conservazione conforme alla normativa vigente.",
      },
    ],
    regulationHeading: "Cosa richiede la normativa",
    legalPoints: [
      "Obbligatorio dal 5 ottobre 2026 per il trasporto interno di merci su strada.",
      "Il file è un PDF nativo digitale, generato da dati strutturati — una scansione non è valida.",
      "Dimensione massima 5 MB.",
      "Include un codice QR con un URL unico che inizia con https://",
      "L'URL consente il download diretto del PDF, senza registrazione e senza password.",
      "Vengono registrati data e ora di creazione e di qualsiasi modifica.",
      "Conservazione minima di 1 anno da parte del mittente e del vettore.",
    ],
    legalSourceLabel: "Fonte:",
    operatorTrustHeading: "Chi c'è dietro il servizio",
    faqHeading: "Domande frequenti",
    faqGroups: [
      {
        heading: "Normativa e obbligo",
        items: [
          {
            q: "Che cos'è il DeCA?",
            a: "Il Documento Elettronico di Controllo Amministrativo è la versione digitale obbligatoria del documento di controllo del trasporto merci su strada. Sostituisce il documento cartaceo.",
          },
          {
            q: "Quando diventa obbligatorio?",
            a: "Dal 5 ottobre 2026 per il trasporto interno, senza proroghe né periodi transitori: il DeCA deve essere generato in formato elettronico fin dall'origine. L'autista può portarlo in copia elettronica sul cellulare o in copia stampata con il codice QR; un documento creato originariamente su carta e poi scansionato non è un DeCA elettronico valido.",
          },
          {
            q: "Chi deve emetterlo?",
            a: "Il mittente contrattuale e il vettore effettivo del trasporto pubblico di merci su strada, secondo i termini della normativa applicabile.",
          },
          {
            q: "È obbligatorio per le agenzie di trasporto?",
            a: "Sì, quando agiscono come mittente contrattuale o operatore che contratta il trasporto, con gli stessi obblighi di generazione e conservazione.",
          },
        ],
      },
      {
        heading: "Il documento",
        items: [
          {
            q: "Va bene un PDF scansionato?",
            a: "No. Il file deve essere un PDF nativo digitale generato da dati strutturati. Una scansione o un'immagine digitalizzata non è valida.",
          },
          {
            q: "Deve essere firmato?",
            a: "La risoluzione non richiede una firma elettronica. Richiede però un PDF nativo, un QR, un URL HTTPS di download diretto e la registrazione di creazione e modifiche.",
          },
          {
            q: "Quali dati deve contenere?",
            a: "Come minimo: mittente contrattuale (nome o ragione sociale, codice fiscale e indirizzo), vettore effettivo (nome o ragione sociale e codice fiscale), luogo e data di carico, luogo e data di scarico, natura e peso della merce, e targa del veicolo (trattore e rimorchio se si tratta di un complesso articolato).",
          },
        ],
      },
      {
        heading: "Utilizzo e costo",
        items: [
          {
            q: "Come lo porta con sé l'autista?",
            a: "Prima dell'inizio del servizio, come copia elettronica visibile sul cellulare o come copia stampata, sempre con il QR disponibile.",
          },
          {
            q: `${BRAND.name} è gratis?`,
            a: "Sì. Puoi creare e scaricare documenti senza carta e senza limiti fino al 31 dicembre 2026.",
          },
          {
            q: "Posso generare tutti i documenti che voglio?",
            a: "Sì. Non c'è un limite mensile. Applichiamo solo controlli automatici contro usi abusivi che non influiscono sull'uso normale né sull'ispezione.",
          },
        ],
      },
    ],
    finalCtaHeading: "Inizia ora. Senza carta.",
    finalCtaSubhead:
      "Crea il tuo DeCA, salva i tuoi dati abituali e inizia a lavorare da un unico spazio.",
    finalCtaMicrocopy: "Gratis durante la fase di lancio · Senza carta",
  },
  auth: {
    heading: {
      register: "Crea il tuo account gratuito",
      login: "Bentornato",
      joinTeam: "Unisciti al team",
      claim: "Salva questo DeCA",
    },
    subhead: {
      register:
        "Salva i tuoi DeCA, riutilizza i tuoi dati abituali e genera nuovi documenti più velocemente.",
      login:
        "Accedi per vedere i tuoi DeCA, riutilizzare i tuoi dati e generare nuovi documenti più velocemente.",
      joinTeamInvitedBy: (company: string) => `${company} ti ha invitato. `,
      joinTeamSuffix:
        "Crea il tuo accesso e condividerai i loro DeCA e dati abituali. Non è necessario registrare un'altra azienda.",
      claim:
        "Crea un account gratuito per salvare questo documento e riutilizzare i tuoi dati. Non è un modulo commerciale.",
    },
    orContinueWithEmail: "oppure continua con e-mail",
    googleCta: "Continua con Google",
    emailLabel: "E-mail",
    passwordHint: "Minimo 12 caratteri, con maiuscole, minuscole, numeri e un simbolo.",
    company: {
      legend: "La tua azienda",
      name: "Nome o ragione sociale",
      nif: "Partita IVA / Codice fiscale",
      contactName: "Persona di contatto (facoltativo)",
      phone: "Telefono (facoltativo)",
      address: "Indirizzo (facoltativo)",
    },
    profile: {
      legend: "Come userai principalmente la piattaforma?",
      items: {
        carrier_goods: {
          title: "Vettore di merci",
          body: "Effettui il trasporto di merci per conto terzi.",
        },
        shipper: {
          title: "Azienda mittente",
          body: "Contratti trasporti per le tue spedizioni di merci.",
        },
        operator: {
          title: "Operatore di trasporto",
          body: "Organizzi trasporti di merci (operatore logistico o agenzia).",
        },
        carrier_passengers: {
          title: "Vettore di passeggeri",
          body: "Effettui il trasporto di passeggeri su strada.",
        },
      },
    },
    dataProtection: {
      title: "Informazioni di base sulla protezione dei dati",
      responsible: "Responsabile:",
      purpose: "Finalità:",
      purposeBody: "gestire la registrazione e l'erogazione della Piattaforma DeCA.",
      moreInfoPrefix: "Maggiori informazioni nella nostra",
      privacyPolicy: "Informativa sulla Privacy",
    },
    terms: {
      readPrefix: "Ho letto l'",
      privacyPolicy: "Informativa sulla Privacy",
      andAccept: "e accetto i",
      termsAndConditions: "Termini e Condizioni",
    },
    submit: {
      register: "Crea account gratuito",
      login: "Accedi",
      busy: "Un momento…",
    },
    forgotPassword: "Hai dimenticato la password?",
    switchPrompt: {
      toLogin: "Hai già un account? ",
      toRegister: "Non hai un account? ",
    },
    switchCta: {
      toLogin: "Accedi",
      toRegister: "Crea il tuo account gratuito",
    },
    footNote: "Gratis · Senza carta · I tuoi DeCA in un unico posto",
    errors: {
      acceptTerms: "Devi accettare i Termini e Condizioni e l'Informativa sulla Privacy.",
      generic: "Impossibile completare. Riprova.",
      noConnection: "Nessuna connessione. Riprova.",
      googleFailed:
        "Non è stato possibile completare l'accesso con Google. Riprova oppure usa la tua email e password.",
    },
    invalidInvite: {
      title: "Invito non valido",
      body: "Questo link di invito è scaduto, è già stato utilizzato o non è corretto. Chiedi a chi ti ha invitato di inviartene uno nuovo.",
      loginCta: "Ho già un account · Accedi",
      freeStartCta: "Inizia un DeCA gratuito",
    },
    verify: {
      title: "Conferma la tua e-mail",
      sentPrefix: "Ci siamo quasi. Ti abbiamo inviato un'e-mail a",
      sentSuffix: "per attivare il tuo account e iniziare a emettere DeCA.",
      failedPrefix: "Non siamo riusciti a inviare l'e-mail di conferma a",
      failedSuffix: "Premi «Invia di nuovo l'e-mail» per riprovare.",
      whatNext: {
        title: "Cosa succede dopo",
        step1: "1. Confermi la tua e-mail",
        step2: "2. Accedi al tuo account",
        step3: "3. Inizi a emettere DeCA",
      },
      openMail: "Apri la mia posta",
      resend: "Invia di nuovo l'e-mail",
      resendSending: "Invio in corso…",
      resendSent: "E-mail inviata di nuovo. Controlla la tua casella di posta.",
      resendError: "Impossibile inviare di nuovo. Riprova tra qualche minuto.",
      changeEmail: {
        open: "Cambia e-mail",
        label: "Nuova e-mail",
        currentPasswordLabel: "La tua password attuale",
        save: "Salva e invia di nuovo",
        cancel: "Annulla",
        error: "Impossibile cambiare l'e-mail.",
      },
      continueChecking: "Verifica in corso…",
      continueLabel: "Ho già confermato il mio account",
      notYetVerified: "La tua e-mail non è ancora verificata. Apri il link che ti abbiamo inviato.",
      spamHint: "Se non trovi il messaggio, controlla la cartella spam o promozioni.",
    },
    verifyToken: {
      successHeading: "E-mail confermata",
      successBody: "Il tuo account è attivo. Ora puoi emettere DeCA senza limiti.",
      successCtaAuthed: "Vai al mio pannello",
      successCtaAnon: "Accedi",
      errorHeading: "Non siamo riusciti a confermare la tua e-mail",
      errorInvalid: "Questo link di conferma non è valido.",
      errorUsed:
        "Questo link è già stato utilizzato. La tua e-mail potrebbe essere già confermata.",
      errorExpired: "Il link di conferma è scaduto. Richiedine uno nuovo dal tuo account.",
      errorCtaAuthed: "Richiedi un nuovo link",
      errorCtaAnon: "Accedi",
    },
  },
  panel: {
    verifyBanner: {
      text: (email: string) => `Non hai ancora confermato la tua e-mail (${email}).`,
      cta: "Conferma ora",
    },
    myCompanyFallback: "La mia azienda",
    newDeca: "Nuovo DeCA",
    duplicateLast: "Ripeti / duplica ultimo DeCA",
    lastDocuments: "Ultimi documenti",
    viewAllHistory: "Vedi tutta la cronologia",
    noDocumentsYet: "Non hai ancora documenti.",
    createFirst: "Crea il tuo primo DeCA",
    detail: "Dettaglio",
    duplicate: "Duplica",
    pdf: "PDF",
    companiesCard: "Aziende / vettori abituali",
    vehiclesCard: "Veicoli abituali",
    manageData: "Gestisci dati abituali →",
    nav: {
      home: "I miei DeCA",
      historico: "Cronologia",
      plantillas: "Modelli",
      datos: "Dati abituali",
      equipo: "Team",
      empresa: "La mia azienda",
    },
    teamActivity: {
      heading: "Attività del team",
      invited: (actor: string) => `${actor} ha inviato un invito`,
      joined: (actor: string) => `${actor} si è unito al team`,
      roleChanged: (actor: string, target: string, role: string) =>
        `${actor} ha cambiato il ruolo di ${target} in ${role}`,
      removed: (actor: string, target: string) => `${actor} ha rimosso ${target} dal team`,
      roleLabel: { owner: "Amministratore", member: "Operatore", read_only: "Sola lettura" },
    },
  },
  historico: {
    title: "Cronologia",
    search: "Cerca",
    searchPlaceholder: "Riferimento, azienda, targa, origine o destinazione",
    from: "Da",
    to: "A",
    carrier: "Vettore",
    carrierAll: "Tutti",
    plate: "Targa",
    filter: "Filtra",
    clear: "Cancella",
    documentsCountOne: "documento",
    documentsCountMany: "documenti",
    exportCsv: "Esporta CSV",
    colDate: "Data",
    colRoute: "Carico → Scarico",
    colShipper: "Mittente",
    colCarrier: "Vettore",
    colPlate: "Targa",
    colStatus: "Stato",
    colActions: "Azioni",
    statusActive: "Vigente",
    statusCorrected: "Corretto",
    statusUnavailable: "Non disponibile",
    detail: "Dettaglio",
    correct: "Correggi",
    duplicate: "Duplica",
    pdf: "PDF",
    noResults: "Nessun risultato.",
    createOne: "Crea un DeCA",
  },
  crear: {
    previewHeading: "Ecco come sarà il tuo DeCA",
    steps: ["Chi contratta e chi trasporta", "Carico e scarico", "Veicolo, merce e revisione"],
    subheadLeadGate:
      "Completa i dati senza impegno — ti chiederemo nome ed e-mail solo alla fine, senza bisogno di creare un account.",
    correctionIntro:
      "Correzione del DeCA in corso. Verrà generata una nuova versione con un nuovo QR e un nuovo URL; la versione precedente viene conservata.",
    stepOf: (current: number) => `Passaggio ${current} di 3 ·`,
    stepOfAria: (current: number, label: string) => `Passaggio ${current} di 3: ${label}`,
    noConnection: "Nessuna connessione. Controlla la tua rete e riprova.",
    templates: {
      legend: "Inizia da un modello",
      placeholder: "Scegli un modello…",
      hint: "Dovrai comunque rivedere i dati e inserire la data prima di generare.",
    },
    useCompany: {
      shipper: "La mia azienda è il mittente",
      carrier: "La mia azienda è il vettore",
    },
    useSame: {
      shipperIsCarrier: "Il vettore è lo stesso del mittente",
      carrierIsShipper: "Il mittente è lo stesso del vettore",
    },
    legends: {
      shipper: "Mittente contrattuale",
      carrier: "Vettore effettivo",
      loadLocation: "Luogo di carico",
      unloadLocation: "Luogo di scarico",
      vehicleGoods: "Veicolo e merce",
    },
    sectionHints: {
      shipper: "Chi ti ha affidato questo trasporto?",
      carrier: "Quale azienda effettua fisicamente il trasporto?",
      loadLocation: "Dove viene ritirata la merce e in quale giorno.",
      unloadLocation:
        "Dove viene consegnata la merce e in quale giorno. Può essere lo stesso giorno del carico.",
      vehicleGoods: "Il veicolo che effettua il trasporto e cosa viene trasportato.",
    },
    autofill: {
      company: "Cerca o seleziona un'azienda abituale",
      carrier: "Cerca o seleziona un vettore abituale",
      location: "Cerca o seleziona un luogo abituale",
      vehicle: "Cerca o seleziona un veicolo",
      newOption: "Inserisci un nuovo…",
    },
    fields: {
      name: "Nome o ragione sociale",
      nif: "Partita IVA / Codice fiscale",
      address: "Indirizzo",
      locationName: "Azienda o stabilimento",
      locationAddress: "Indirizzo completo",
      postalCode: "CAP",
      city: "Città",
      province: "Provincia",
      country: "Paese",
      loadDate: "Data di carico",
      unloadDate: "Data di scarico",
      goods: "Natura della merce",
      weight: "Peso (o misura alternativa)",
      weightHint:
        "Es.: 12000 kg, o «una piattaforma completa» se il peso esatto non è determinabile.",
      tractorPlate: "Targa del trattore",
      trailerPlate: "Targa del rimorchio / semirimorchio",
      trailerHint: "Se non c'è rimorchio, lascia vuoto.",
      reference: "Riferimento o note (facoltativo)",
    },
    hints: {
      nifForeign: "Puoi usare una partita IVA estera.",
      unloadSameDay: "Può coincidere con la data di carico.",
      plateForeign:
        "Non sembra una targa spagnola (formato 1234 BCD). È valida se il veicolo è straniero.",
    },
    errorSummaryTitle: "Controlla questi campi:",
    lead: {
      title: "Solo un altro passaggio: a chi inviamo il DeCA?",
      body: "Il tuo nome e la tua e-mail, solo per inviarti il link di download. Senza creare un account.",
      name: "Il tuo nome",
      email: "La tua e-mail",
      loginPrompt: "Hai già un account? Accedi",
      loginPromptSuffix: "per usare i tuoi dati salvati.",
    },
    verifyGate: {
      title: "Conferma la tua e-mail per generare il DeCA",
      body: "I tuoi dati sono salvati in questo passaggio. Conferma il link che ti abbiamo inviato per e-mail e torna — generiamo il tuo documento all'istante, senza riscrivere nulla.",
      cta: "Vai a confermare la mia e-mail",
    },
    repeatGate: {
      title: "Hai già creato il tuo primo DeCA",
      body: "Registrati gratis per crearne un altro — riutilizzi i tuoi dati ed è molto più veloce.",
      cta: "Crea account gratuito",
      loginPrompt: "Hai già un account? Accedi",
    },
    readOnlyGate: {
      title: "Il tuo ruolo è di sola lettura",
      body: "Puoi vedere la cronologia e i documenti della tua azienda, ma non creare né correggere DeCA. Chiedi a un amministratore di cambiare il tuo ruolo se necessario.",
      cta: "Vai alla mia cronologia",
    },
    correctionReason: "Motivo della correzione",
    correctionReasonRequired: "Indica il motivo della correzione.",
    correctionSaveFailed: "Impossibile salvare la correzione.",
    checkingChallenge: "Verifica in corso… un momento.",
    generationFailedFallback:
      "Non siamo riusciti a generare il documento. I tuoi dati restano salvati. Riprova tra qualche secondo.",
    generationFailedGeneric: "Impossibile generare il DeCA. Riprova.",
    generatingStatus: "Stiamo generando il tuo PDF e QR… non chiudere questa pagina.",
    notGenerated: "Il DeCA non è stato generato",
    correlationPrefix: "Codice:",
    correlationSuffix: "— faccelo sapere se si ripete e troveremo l'errore esatto.",
    retry: "Riprova la generazione",
    backToReview: "Torna a rivedere i dati",
    review: {
      heading: "Rivedi prima di generare",
      subhead:
        "Questi sono i dati esatti che appariranno nel DeCA e nel PDF. Usa «Modifica» se qualcosa non è corretto.",
      edit: "Modifica",
      shipperTitle: "Azienda che contratta il trasporto",
      carrierTitle: "Vettore che effettua il trasporto",
      loadTitle: "Luogo e data di carico",
      unloadTitle: "Luogo e data di scarico",
      vehicleTitle: "Veicolo e merce",
      name: "Nome o ragione sociale",
      nif: "Partita IVA / Codice fiscale",
      address: "Indirizzo",
      locationName: "Azienda / stabilimento",
      locationAddress: "Indirizzo",
      postalCode: "CAP",
      city: "Città",
      province: "Provincia",
      country: "Paese",
      loadDate: "Data di carico",
      unloadDate: "Data di scarico",
      tractorPlate: "Targa trattore",
      trailerPlate: "Targa rimorchio",
      goods: "Merce",
      weight: "Peso o misura",
      reference: "Riferimento",
    },
    buttons: {
      back: "Indietro",
      next: "Avanti",
      generating: "Generazione…",
      generate: "GENERA DECA",
      saveCorrection: "SALVA CORREZIONE",
    },
  },
  result: {
    heading: "DeCA generato",
    version: "Versione",
    versionGenerated: (v: number, date: string) => `Versione ${v} · generato il ${date}`,
    documentData: "Dati del documento",
    retentionNotice:
      "Documento conservato per almeno 1 anno. L'URL pubblico consente il download diretto del PDF senza registrazione, conformemente alla risoluzione vigente.",
    createAnother: "Crea un altro DeCA",
    downloadPdf: "Apri / scarica PDF",
    sendToDriver: "Invia all'autista",
    share: "Condividi…",
    whatsapp: "Invia con WhatsApp",
    driverEmailLabel: "E-mail dell'autista",
    send: "Invia",
    sent: "Inviato.",
    emailFallback: "L'invio tramite e-mail non è configurato. Apertura del tuo client di posta…",
    emailFailed: "Impossibile inviare. Usa il link o WhatsApp.",
    emailNoConnection: "Nessuna connessione.",
    copyLink: "Copia link",
    linkCopied: "Link copiato",
    print: "Stampa",
    checkQr: "Verifica QR",
    qrLinkLabel: "Questo è il link contenuto nel QR del PDF:",
    openInspectionLink: "Apri il link di ispezione in una nuova scheda",
    verifyHint: "Per la verifica reale, scansiona il QR con un altro cellulare.",
    save: "Salva i miei DeCA creando un account",
    saveHint:
      "Creare l'account salva i tuoi documenti e i tuoi dati abituali. Non è un modulo commerciale.",
    correctedReminder:
      "Questo DeCA è stato corretto. Reinvia all'autista la versione attuale — quella precedente resta nella cronologia e continua a essere accessibile tramite il suo URL.",
    shareTitle: "DeCA del trasporto",
    shareTextPrefix: "Documento di controllo (DeCA) del trasporto:",
  },
  errors: {
    generic: "Qualcosa è andato storto. Riprova tra qualche secondo.",
    notFound: "Non abbiamo trovato questa pagina.",
  },
  legal: {
    roles: {
      shipper: "Mittente contrattuale",
      carrier: "Vettore effettivo",
      shipperShort: "Mittente",
      carrierShort: "Vettore",
    },
  },
  legalNotice: {
    notTranslated:
      "Questo documento ha validità legale solo nella sua versione in spagnolo. Una traduzione in questa lingua non è ancora disponibile.",
  },
  emails: {
    verifySubject: (brand: string) => `Conferma la tua e-mail su ${brand}`,
    verifyTextInitial: (brand: string, link: string) =>
      `Ci siamo quasi. Conferma la tua e-mail per attivare il tuo account ${brand}.\n\nApri questo link (scade tra 24 ore):\n${link}\n\nSe non sei stato tu, ignora questo messaggio.`,
    verifyTextResend: (brand: string, link: string) =>
      `Conferma la tua e-mail per attivare il tuo account ${brand}.\n\nApri questo link (scade tra 24 ore):\n${link}\n\nSe non sei stato tu, ignora questo messaggio.`,
    verifyTextChangeEmail: (brand: string, link: string) =>
      `Conferma la tua nuova e-mail per attivare il tuo account ${brand}.\n\nApri questo link (scade tra 24 ore):\n${link}\n\nSe non sei stato tu, ignora questo messaggio.`,
    passwordResetSubject: (brand: string) => `Recupera l'accesso a ${brand}`,
    passwordResetText: (brand: string, link: string) =>
      `Hai richiesto di reimpostare la tua password ${brand}.\n\nApri questo link (scade tra 1 ora):\n${link}\n\nSe non sei stato tu, ignora questo messaggio.`,
  },
} satisfies Messages;
