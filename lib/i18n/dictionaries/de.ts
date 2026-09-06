import { BRAND } from "@/lib/brand";
import type { Messages } from "./es";

/**
 * German string catalog, key-for-key with `es.ts` (I18N #54). `satisfies
 * Messages` pins this to the Spanish dictionary's exact shape, so a key added
 * to one and forgotten in the other is a type error, not a silent blank
 * string in prod. Legal pages (`/terminos`, `/privacidad`, `/aviso-legal`)
 * are NOT translated by this dictionary — they render fixed Spanish JSX and
 * stay that way in every locale until a professional legal review exists
 * (owner decision, see `docs/decisions.md` D-072).
 */
export const de = {
  common: {
    appName: BRAND.name,
    createCta: "DECA KOSTENLOS ERSTELLEN",
    headerCta: "DeCA erstellen",
    loginCta: "Anmelden",
    panelCta: "Zu meinem Bereich",
    skipToContent: "Zum Inhalt springen",
  },
  nav: {
    howItWorks: "So funktioniert's",
    regulation: "Vorschriften",
    guides: "Anleitungen",
    blog: "Blog",
    faq: "Fragen",
  },
  language: {
    es: "Español",
    en: "English",
  },
  landing: {
    hero: {
      eyebrow: "Elektronisches Kontrolldokument",
      h1: "DeCA professionell, einfach und einsatzbereit.",
      subhead:
        "Erstellen, verwalten, sichern und teilen Sie Ihre Elektronischen Kontrolldokumente über eine spezialisierte Transportplattform.",
      proof:
        "Güter · PDF + QR · Digitale Aufbewahrung · Verlauf · Mehrere Nutzer · Kostenlos während der Startphase",
      cta: "DECA KOSTENLOS ERSTELLEN",
      ctaSecondary: "ANMELDEN",
    },
    trustRow: [
      "Keine Registrierung für Ihr erstes DeCA",
      "PDF + QR",
      "Digitale Aufbewahrung",
      "Verlauf",
    ],
    stepsHeading: "Erstellen Sie Ihr DeCA in 3 Schritten",
    steps: [
      {
        title: "Daten eingeben",
        body: "Verlader, Frachtführer, Herkunft, Ziel, Ware und Kennzeichen. Unverbindlich.",
      },
      {
        title: "Konto erstellen und generieren",
        body: "Kostenlose Registrierung in Sekunden — wir erstellen das native PDF mit QR-Code und einer eindeutigen Direkt-Download-URL. Nichts von dem, was Sie bereits eingegeben haben, geht verloren.",
      },
      {
        title: "Mit dem Fahrer teilen",
        body: "Link, WhatsApp, E-Mail oder Ausdruck. Bereit für die Kontrolle.",
      },
    ],
    productHeading: "Vom Formular zum PDF mit QR-Code, ohne unnötige Schritte",
    benefits: [
      {
        title: "Kostenlos",
        body: "Kein Limit für DeCA während der Einführungsphase. Ohne Kreditkarte, ohne Zahlungsplan.",
      },
      {
        title: "Schnell",
        body: "Nutzen Sie Ihre gewohnten Daten erneut und duplizieren Sie frühere Dokumente mit einem Tipp.",
      },
      {
        title: "Kontrollbereit",
        body: "Natives PDF, QR-Code und direkte HTTPS-URL gemäß der geltenden Verordnung.",
      },
    ],
    personasHeading: "Gemacht für alle, die Güter bewegen",
    personas: [
      {
        title: "Selbstständiger Frachtführer",
        jobToBeDone:
          "Erstellen Sie das DeCA in wenigen Minuten und nehmen Sie es auf dem Handy mit.",
        benefits: [
          "Kostenlose Registrierung in Sekunden",
          "Unternehmen und Fahrzeug nach der Registrierung gespeichert",
          "Schnelle Duplizierung des letzten Dokuments",
          "Versand an den Fahrer mit einem Tipp",
        ],
      },
      {
        title: "Transportunternehmen",
        jobToBeDone: "Ein gemeinsamer Bereich für alle Ihre Mitarbeiter und Dokumente.",
        benefits: [
          "Mehrere Nutzer im selben Unternehmen",
          "Gemeinsamer Verlauf",
          "Gespeicherte Verlader, Fahrzeuge und Adressen",
          "Prüfbarkeit, wer jedes DeCA erstellt oder korrigiert hat",
        ],
      },
      {
        title: "Agentur / Transportbetreiber",
        jobToBeDone:
          "Verwalten Sie das Dokument als vertraglicher Verlader, ohne von Dritten abhängig zu sein.",
        benefits: [
          "Mehrere Unternehmen und Frachtführer",
          "Wiederverwendbare Gegenparteien",
          "Schnelle Duplizierung",
          "Arbeitsbereich für das Team",
        ],
      },
      {
        title: "Verlader / Versender",
        jobToBeDone: "Erstellen, sichern und teilen Sie Ihre DeCA von einem einzigen Ort aus.",
        benefits: [
          "Gespeicherte übliche Frachtführer",
          "Dokumentenverlauf",
          "Direkter Kontrollweg per QR/PDF",
          "Ohne neuen Prozess in Ihrem ERP einzurichten",
        ],
      },
    ],
    personaCtaPrefix: "So funktioniert's für",
    dailyUseHeading: "Warum es täglich nutzen",
    dailyUseSubhead: "Alles, was Sie brauchen, um dieselben Daten nie wieder eingeben zu müssen.",
    dailyUseFooter:
      "Beginnen Sie, Ihr DeCA unverbindlich auszufüllen; wir bitten Sie erst am Ende um ein kostenloses Konto, um es zu erstellen.",
    dailyUseFooterLink: "Ihr Unternehmen",
    dailyUseFooterAfterLink: "speichert all dies, damit das nächste DeCA nur noch Sekunden dauert.",
    dailyUse: [
      { label: "DeCA erstellen", body: "Geführtes Formular in 3 Schritten." },
      { label: "PDF + QR", body: "Natives Dokument mit Prüf-QR-Code." },
      { label: "Verlauf", body: "Alle Ihre Dokumente, immer griffbereit." },
      { label: "Duplizieren", body: "Wiederholen Sie ein früheres DeCA in Sekunden." },
      { label: "Gespeicherte Fahrzeuge", body: "Zugmaschine und Anhänger mit einem Klick." },
      {
        label: "Übliche Unternehmen",
        body: "Wiederverwendbare Verlader und Frachtführer.",
      },
      { label: "Übliche Orte", body: "Be- und Entladung bereit zur Auswahl." },
      {
        label: "Digitale Aufbewahrung",
        body: "Aufbewahrung gemäß geltender Verordnung.",
      },
    ],
    regulationHeading: "Was die Vorschrift verlangt",
    legalPoints: [
      "Verpflichtend ab dem 5. Oktober 2026 für den innerstaatlichen Güterkraftverkehr.",
      "Die Datei ist ein natives digitales PDF, erstellt aus strukturierten Daten — ein Scan reicht nicht aus.",
      "Maximale Größe 5 MB.",
      "Enthält einen QR-Code mit einer eindeutigen URL, die mit https:// beginnt.",
      "Die URL ermöglicht den direkten Download des PDFs, ohne Registrierung und ohne Passwort.",
      "Datum und Uhrzeit der Erstellung und jeder Änderung werden erfasst.",
      "Mindestaufbewahrung von 1 Jahr durch Verlader und Frachtführer.",
    ],
    legalSourceLabel: "Quelle:",
    operatorTrustHeading: "Wer hinter dem Dienst steht",
    faqHeading: "Häufige Fragen",
    faq: [
      {
        q: "Was ist das DeCA?",
        a: "Das Elektronische Verwaltungskontrolldokument ist die verpflichtende digitale Version des Kontrolldokuments für den Güterkraftverkehr auf der Straße. Es ersetzt das Papierdokument.",
      },
      {
        q: "Wann wird es verpflichtend?",
        a: "Ab dem 5. Oktober 2026 für den innerstaatlichen Verkehr. Es gibt weder eine Verlängerung noch eine Übergangsfrist: Papier wird nicht mehr akzeptiert.",
      },
      {
        q: "Wer muss es ausstellen?",
        a: "Der vertragliche Verlader und der tatsächliche Frachtführer des öffentlichen Güterkraftverkehrs, gemäß der geltenden Vorschrift.",
      },
      {
        q: "Ist es für Transportagenturen verpflichtend?",
        a: "Ja, wenn sie als vertraglicher Verlader oder als Betreiber auftreten, der den Transport beauftragt, mit denselben Erstellungs- und Aufbewahrungspflichten.",
      },
      {
        q: "Reicht ein gescanntes PDF aus?",
        a: "Nein. Die Datei muss ein natives digitales PDF sein, das aus strukturierten Daten erstellt wurde. Ein Scan oder ein digitalisiertes Bild ist nicht gültig.",
      },
      {
        q: "Muss es signiert werden?",
        a: "Die Verordnung verlangt keine elektronische Signatur. Sie verlangt jedoch ein natives PDF, einen QR-Code, eine direkte Download-URL über HTTPS sowie eine Erfassung der Erstellung und Änderungen.",
      },
      {
        q: "Welche Daten muss es enthalten?",
        a: "Mindestens: der vertragliche Verlader (Name oder Firmenname, Steuernummer und Adresse), der tatsächliche Frachtführer (Name oder Firmenname und Steuernummer), Ort und Datum der Beladung, Ort und Datum der Entladung, Art und Gewicht der Ware sowie das Kennzeichen des Fahrzeugs (Zugmaschine und Anhänger bei einem Sattelzug).",
      },
      {
        q: "Wie führt der Fahrer es mit sich?",
        a: "Vor Beginn der Fahrt, als sichtbare elektronische Kopie auf dem Mobiltelefon oder als Ausdruck, immer mit verfügbarem QR-Code.",
      },
      {
        q: `Ist ${BRAND.name} kostenlos?`,
        a: "Ja. Sie können bis zum 31. Dezember 2026 Dokumente ohne Kreditkarte und ohne Limit erstellen und herunterladen.",
      },
      {
        q: "Kann ich beliebig viele Dokumente erstellen?",
        a: "Ja. Es gibt kein monatliches Limit. Wir wenden nur automatische Kontrollen gegen missbräuchliche Nutzung an, die die normale Nutzung oder Kontrolle nicht beeinträchtigen.",
      },
    ],
    finalCtaHeading: "Erstellen Sie Ihr erstes DeCA kostenlos",
    finalCtaSubhead: "Keine Demo. Kein Verkaufsgespräch. Keine Kreditkarte.",
  },
  auth: {
    heading: {
      register: "Erstellen Sie Ihr kostenloses Konto",
      login: "Willkommen zurück",
      joinTeam: "Team beitreten",
      claim: "Dieses DeCA speichern",
    },
    subhead: {
      register:
        "Speichern Sie Ihre DeCA, nutzen Sie Ihre gewohnten Daten erneut und erstellen Sie neue Dokumente schneller.",
      login:
        "Melden Sie sich an, um Ihre DeCA zu sehen, Ihre Daten wiederzuverwenden und neue Dokumente schneller zu erstellen.",
      joinTeamInvitedBy: (company: string) => `${company} hat Sie eingeladen. `,
      joinTeamSuffix:
        "Erstellen Sie Ihren Zugang und Sie teilen deren DeCA und gewohnte Daten. Es ist nicht nötig, ein weiteres Unternehmen anzulegen.",
      claim:
        "Erstellen Sie ein kostenloses Konto, um dieses Dokument zu speichern und Ihre Daten wiederzuverwenden. Es ist kein Verkaufsformular.",
    },
    orContinueWithEmail: "oder mit E-Mail fortfahren",
    googleCta: "Mit Google fortfahren",
    emailLabel: "E-Mail",
    passwordHint: "Mindestens 12 Zeichen, mit Groß- und Kleinbuchstaben, Zahlen und einem Symbol.",
    company: {
      legend: "Ihr Unternehmen",
      name: "Name oder Firmenname",
      nif: "Steuernummer",
      contactName: "Ansprechpartner (optional)",
      phone: "Telefon (optional)",
      address: "Adresse (optional)",
    },
    profile: {
      legend: "Wie werden Sie die Plattform hauptsächlich nutzen?",
      items: {
        carrier_goods: {
          title: "Güterfrachtführer",
          body: "Sie führen den Gütertransport im Auftrag Dritter durch.",
        },
        shipper: {
          title: "Versendendes Unternehmen",
          body: "Sie beauftragen Transporte für Ihre eigenen Güterversendungen.",
        },
        operator: {
          title: "Transportbetreiber",
          body: "Sie organisieren Gütertransporte (Logistikbetreiber oder Agentur).",
        },
        carrier_passengers: {
          title: "Personenbeförderer",
          body: "Sie führen den Personenverkehr auf der Straße durch.",
        },
      },
    },
    dataProtection: {
      title: "Grundlegende Informationen zum Datenschutz",
      responsible: "Verantwortlicher:",
      purpose: "Zweck:",
      purposeBody: "die Registrierung und Bereitstellung der DeCA-Plattform verwalten.",
      moreInfoPrefix: "Weitere Informationen in unserer",
      privacyPolicy: "Datenschutzerklärung",
    },
    terms: {
      readPrefix: "Ich habe die",
      privacyPolicy: "Datenschutzerklärung",
      andAccept: "gelesen und akzeptiere die",
      termsAndConditions: "Allgemeinen Geschäftsbedingungen",
    },
    submit: {
      register: "Kostenloses Konto erstellen",
      login: "Anmelden",
      busy: "Einen Moment…",
    },
    forgotPassword: "Passwort vergessen?",
    switchPrompt: {
      toLogin: "Haben Sie bereits ein Konto? ",
      toRegister: "Haben Sie noch kein Konto? ",
    },
    switchCta: {
      toLogin: "Anmelden",
      toRegister: "Kostenloses Konto erstellen",
    },
    footNote: "Kostenlos · Ohne Kreditkarte · Ihre DeCA an einem Ort",
    errors: {
      acceptTerms:
        "Sie müssen die Allgemeinen Geschäftsbedingungen und die Datenschutzerklärung akzeptieren.",
      generic: "Konnte nicht abgeschlossen werden. Versuchen Sie es erneut.",
      noConnection: "Keine Verbindung. Versuchen Sie es erneut.",
    },
    invalidInvite: {
      title: "Einladung ungültig",
      body: "Dieser Einladungslink ist abgelaufen, wurde bereits verwendet oder ist nicht korrekt. Bitten Sie die einladende Person um einen neuen Link.",
      loginCta: "Ich habe bereits ein Konto · Anmelden",
      freeStartCta: "Kostenloses DeCA starten",
    },
    verify: {
      title: "Bestätigen Sie Ihre E-Mail-Adresse",
      sentPrefix: "Fast geschafft. Wir haben Ihnen eine E-Mail gesendet an",
      sentSuffix: "um Ihr Konto zu aktivieren und mit der Ausstellung von DeCA zu beginnen.",
      failedPrefix: "Wir konnten die Bestätigungs-E-Mail nicht senden an",
      failedSuffix: "Klicken Sie auf „E-Mail erneut senden“, um es erneut zu versuchen.",
      whatNext: {
        title: "Was als Nächstes passiert",
        step1: "1. Sie bestätigen Ihre E-Mail",
        step2: "2. Sie greifen auf Ihr Konto zu",
        step3: "3. Sie beginnen, DeCA auszustellen",
      },
      openMail: "Meine E-Mails öffnen",
      resend: "E-Mail erneut senden",
      resendSending: "Wird gesendet…",
      resendSent: "E-Mail erneut gesendet. Überprüfen Sie Ihren Posteingang.",
      resendError:
        "Konnte nicht erneut gesendet werden. Versuchen Sie es in einigen Minuten erneut.",
      changeEmail: {
        open: "E-Mail-Adresse ändern",
        label: "Neue E-Mail-Adresse",
        currentPasswordLabel: "Ihr aktuelles Passwort",
        save: "Speichern und erneut senden",
        cancel: "Abbrechen",
        error: "E-Mail-Adresse konnte nicht geändert werden.",
      },
      continueChecking: "Wird überprüft…",
      continueLabel: "Ich habe mein Konto bereits bestätigt",
      notYetVerified:
        "Ihre E-Mail-Adresse ist noch nicht bestätigt. Öffnen Sie den Link, den wir Ihnen gesendet haben.",
      spamHint: "Wenn Sie die Nachricht nicht finden, überprüfen Sie Ihren Spam- oder Werbeordner.",
    },
    verifyToken: {
      successHeading: "E-Mail bestätigt",
      successBody: "Ihr Konto ist aktiv. Sie können jetzt uneingeschränkt DeCA ausstellen.",
      successCtaAuthed: "Zu meinem Bereich",
      successCtaAnon: "Anmelden",
      errorHeading: "Wir konnten Ihre E-Mail nicht bestätigen",
      errorInvalid: "Dieser Bestätigungslink ist nicht gültig.",
      errorUsed: "Dieser Link wurde bereits verwendet. Ihre E-Mail könnte bereits bestätigt sein.",
      errorExpired:
        "Der Bestätigungslink ist abgelaufen. Fordern Sie einen neuen von Ihrem Konto aus an.",
      errorCtaAuthed: "Neuen Link anfordern",
      errorCtaAnon: "Anmelden",
    },
  },
  panel: {
    verifyBanner: {
      text: (email: string) => `Sie haben Ihre E-Mail-Adresse noch nicht bestätigt (${email}).`,
      cta: "Jetzt bestätigen",
    },
    myCompanyFallback: "Mein Unternehmen",
    newDeca: "Neues DeCA",
    duplicateLast: "Letztes DeCA wiederholen / duplizieren",
    lastDocuments: "Letzte Dokumente",
    viewAllHistory: "Gesamten Verlauf anzeigen",
    noDocumentsYet: "Sie haben noch keine Dokumente.",
    createFirst: "Erstellen Sie Ihr erstes DeCA",
    detail: "Detail",
    duplicate: "Duplizieren",
    pdf: "PDF",
    companiesCard: "Übliche Unternehmen / Frachtführer",
    vehiclesCard: "Übliche Fahrzeuge",
    manageData: "Übliche Daten verwalten →",
    nav: {
      home: "Meine DeCA",
      historico: "Verlauf",
      plantillas: "Vorlagen",
      datos: "Übliche Daten",
      equipo: "Team",
      empresa: "Mein Unternehmen",
    },
  },
  historico: {
    title: "Verlauf",
    search: "Suchen",
    searchPlaceholder: "Referenz, Unternehmen, Kennzeichen, Herkunft oder Ziel",
    from: "Von",
    to: "Bis",
    carrier: "Frachtführer",
    carrierAll: "Alle",
    plate: "Kennzeichen",
    filter: "Filtern",
    clear: "Löschen",
    documentsCountOne: "Dokument",
    documentsCountMany: "Dokumente",
    exportCsv: "CSV exportieren",
    colDate: "Datum",
    colRoute: "Beladung → Entladung",
    colShipper: "Verlader",
    colCarrier: "Frachtführer",
    colPlate: "Kennzeichen",
    colStatus: "Status",
    colActions: "Aktionen",
    statusActive: "Gültig",
    statusCorrected: "Korrigiert",
    statusUnavailable: "Nicht verfügbar",
    detail: "Detail",
    correct: "Korrigieren",
    duplicate: "Duplizieren",
    pdf: "PDF",
    noResults: "Keine Ergebnisse.",
    createOne: "DeCA erstellen",
  },
  crear: {
    steps: [
      "Wer beauftragt und wer transportiert",
      "Be- und Entladung",
      "Fahrzeug, Ware und Überprüfung",
    ],
    subheadLeadGate:
      "Füllen Sie die Daten unverbindlich aus — wir bitten Sie erst am Ende um Ihren Namen und Ihre E-Mail-Adresse, ohne dass ein Konto erforderlich ist.",
    correctionIntro:
      "DeCA wird korrigiert. Es wird eine neue Version mit neuem QR-Code und neuer URL erstellt; die vorherige Version bleibt erhalten.",
    stepOf: (current: number) => `Schritt ${current} von 3 ·`,
    stepOfAria: (current: number, label: string) => `Schritt ${current} von 3: ${label}`,
    noConnection: "Keine Verbindung. Überprüfen Sie Ihr Netzwerk und versuchen Sie es erneut.",
    templates: {
      legend: "Mit einer Vorlage beginnen",
      placeholder: "Wählen Sie eine Vorlage…",
      hint: "Sie müssen die Daten noch überprüfen und das Datum eingeben, bevor Sie generieren.",
    },
    useCompany: {
      shipper: "Mein Unternehmen ist der Verlader",
      carrier: "Mein Unternehmen ist der Frachtführer",
    },
    useSame: {
      shipperIsCarrier: "Der Frachtführer ist derselbe wie der Verlader",
      carrierIsShipper: "Der Verlader ist derselbe wie der Frachtführer",
    },
    legends: {
      shipper: "Vertraglicher Verlader",
      carrier: "Tatsächlicher Frachtführer",
      loadLocation: "Beladeort",
      unloadLocation: "Entladeort",
      vehicleGoods: "Fahrzeug und Ware",
    },
    sectionHints: {
      shipper: "Wer hat Sie mit diesem Transport beauftragt?",
      carrier: "Welches Unternehmen führt den Transport physisch durch?",
      loadLocation: "Wo wird die Ware abgeholt und an welchem Tag.",
      unloadLocation:
        "Wo wird die Ware geliefert und an welchem Tag. Kann derselbe Tag wie die Beladung sein.",
      vehicleGoods: "Das Fahrzeug, das den Transport durchführt, und was transportiert wird.",
    },
    autofill: {
      company: "Übliches Unternehmen suchen oder auswählen",
      carrier: "Üblichen Frachtführer suchen oder auswählen",
      location: "Üblichen Ort suchen oder auswählen",
      vehicle: "Fahrzeug suchen oder auswählen",
      newOption: "Neues eingeben…",
    },
    fields: {
      name: "Name oder Firmenname",
      nif: "Steuernummer / USt-IdNr.",
      address: "Adresse",
      locationName: "Unternehmen oder Einrichtung",
      locationAddress: "Vollständige Adresse",
      postalCode: "Postleitzahl",
      city: "Ort",
      province: "Provinz",
      country: "Land",
      loadDate: "Beladedatum",
      unloadDate: "Entladedatum",
      goods: "Art der Ware",
      weight: "Gewicht (oder alternative Maßeinheit)",
      weightHint:
        "Z. B.: 12000 kg, oder „eine vollständige Ladefläche“, wenn das genaue Gewicht nicht bestimmbar ist.",
      tractorPlate: "Kennzeichen der Zugmaschine",
      trailerPlate: "Kennzeichen des Anhängers / Sattelanhängers",
      trailerHint: "Wenn kein Anhänger vorhanden ist, lassen Sie das Feld leer.",
      reference: "Referenz oder Anmerkungen (optional)",
    },
    hints: {
      nifForeign: "Sie können eine ausländische Steuernummer/USt-IdNr. verwenden.",
      unloadSameDay: "Kann mit dem Beladedatum übereinstimmen.",
      plateForeign:
        "Dies sieht nicht wie ein spanisches Kennzeichen aus (Format 1234 BCD). Es ist gültig, wenn das Fahrzeug ausländisch ist.",
    },
    errorSummaryTitle: "Überprüfen Sie diese Felder:",
    lead: {
      title: "Nur noch ein Schritt: An wen senden wir das DeCA?",
      body: "Ihr Name und Ihre E-Mail-Adresse, nur um Ihnen den Download-Link zu senden. Ohne ein Konto zu erstellen.",
      name: "Ihr Name",
      email: "Ihre E-Mail-Adresse",
      loginPrompt: "Haben Sie bereits ein Konto? Anmelden",
      loginPromptSuffix: "um Ihre gespeicherten Daten zu verwenden.",
    },
    verifyGate: {
      title: "Bestätigen Sie Ihre E-Mail, um das DeCA zu erstellen",
      body: "Ihre Daten sind in diesem Schritt gespeichert. Bestätigen Sie den Link, den wir Ihnen per E-Mail gesendet haben, und kommen Sie zurück — wir erstellen Ihr Dokument sofort, ohne dass Sie etwas erneut eingeben müssen.",
      cta: "Zur Bestätigung meiner E-Mail",
    },
    repeatGate: {
      title: "Sie haben bereits Ihr erstes DeCA erstellt",
      body: "Registrieren Sie sich kostenlos, um das nächste zu erstellen — Sie nutzen Ihre Daten erneut und es ist viel schneller.",
      cta: "Kostenloses Konto erstellen",
      loginPrompt: "Haben Sie bereits ein Konto? Anmelden",
    },
    correctionReason: "Grund der Korrektur",
    correctionReasonRequired: "Geben Sie den Grund der Korrektur an.",
    correctionSaveFailed: "Die Korrektur konnte nicht gespeichert werden.",
    checkingChallenge: "Wird überprüft… einen Moment.",
    generationFailedFallback:
      "Wir konnten das Dokument nicht erstellen. Ihre Daten sind weiterhin gespeichert. Versuchen Sie es in wenigen Sekunden erneut.",
    generationFailedGeneric: "Das DeCA konnte nicht erstellt werden. Versuchen Sie es erneut.",
    generatingStatus: "Wir erstellen Ihr PDF und Ihren QR-Code… schließen Sie diese Seite nicht.",
    notGenerated: "Das DeCA wurde nicht erstellt",
    correlationPrefix: "Code:",
    correlationSuffix:
      "— teilen Sie es uns mit, falls dies erneut geschieht, und wir finden den genauen Fehler.",
    retry: "Erstellung erneut versuchen",
    backToReview: "Zurück zur Datenüberprüfung",
    review: {
      heading: "Vor der Erstellung überprüfen",
      subhead:
        "Dies sind die genauen Daten, die im DeCA und im PDF erscheinen. Verwenden Sie „Bearbeiten“, wenn etwas nicht korrekt ist.",
      edit: "Bearbeiten",
      shipperTitle: "Unternehmen, das den Transport beauftragt",
      carrierTitle: "Frachtführer, der den Transport durchführt",
      loadTitle: "Ort und Datum der Beladung",
      unloadTitle: "Ort und Datum der Entladung",
      vehicleTitle: "Fahrzeug und Ware",
      name: "Name oder Firmenname",
      nif: "Steuernummer / USt-IdNr.",
      address: "Adresse",
      locationName: "Unternehmen / Einrichtung",
      locationAddress: "Adresse",
      postalCode: "Postleitzahl",
      city: "Ort",
      province: "Provinz",
      country: "Land",
      loadDate: "Beladedatum",
      unloadDate: "Entladedatum",
      tractorPlate: "Kennzeichen Zugmaschine",
      trailerPlate: "Kennzeichen Anhänger",
      goods: "Ware",
      weight: "Gewicht oder Maß",
      reference: "Referenz",
    },
    buttons: {
      back: "Zurück",
      next: "Weiter",
      generating: "Wird erstellt…",
      generate: "DECA ERSTELLEN",
      saveCorrection: "KORREKTUR SPEICHERN",
    },
  },
  result: {
    heading: "DeCA erstellt",
    version: "Version",
    versionGenerated: (v: number, date: string) => `Version ${v} · erstellt am ${date}`,
    documentData: "Dokumentdaten",
    retentionNotice:
      "Dokument mindestens 1 Jahr aufbewahrt. Die öffentliche URL ermöglicht den direkten Download des PDFs ohne Registrierung, gemäß der geltenden Verordnung.",
    createAnother: "Weiteres DeCA erstellen",
    downloadPdf: "PDF öffnen / herunterladen",
    sendToDriver: "An den Fahrer senden",
    share: "Teilen…",
    whatsapp: "Per WhatsApp senden",
    driverEmailLabel: "E-Mail-Adresse des Fahrers",
    send: "Senden",
    sent: "Gesendet.",
    emailFallback: "Der E-Mail-Versand ist nicht konfiguriert. Ihr E-Mail-Programm wird geöffnet…",
    emailFailed: "Konnte nicht gesendet werden. Verwenden Sie den Link oder WhatsApp.",
    emailNoConnection: "Keine Verbindung.",
    copyLink: "Link kopieren",
    linkCopied: "Link kopiert",
    print: "Drucken",
    checkQr: "QR-Code prüfen",
    qrLinkLabel: "Dies ist der Link, den der QR-Code des PDFs enthält:",
    openInspectionLink: "Kontroll-Link in neuem Tab öffnen",
    verifyHint:
      "Für eine echte Überprüfung scannen Sie den QR-Code mit einem anderen Mobiltelefon.",
    save: "Meine DeCA durch Kontoerstellung speichern",
    saveHint:
      "Die Kontoerstellung speichert Ihre Dokumente und gewohnten Daten. Es ist kein Verkaufsformular.",
    correctedReminder:
      "Dieses DeCA wurde korrigiert. Senden Sie dem Fahrer die aktuelle Version erneut — die vorherige bleibt im Verlauf und ist weiterhin über ihre URL zugänglich.",
    shareTitle: "DeCA des Transports",
    shareTextPrefix: "Kontrolldokument (DeCA) des Transports:",
  },
  errors: {
    generic: "Etwas ist schiefgelaufen. Versuchen Sie es in wenigen Sekunden erneut.",
    notFound: "Wir haben diese Seite nicht gefunden.",
  },
  emails: {
    verifySubject: (brand: string) => `Bestätigen Sie Ihre E-Mail-Adresse bei ${brand}`,
    verifyTextInitial: (brand: string, link: string) =>
      `Fast geschafft. Bestätigen Sie Ihre E-Mail-Adresse, um Ihr ${brand}-Konto zu aktivieren.\n\nÖffnen Sie diesen Link (läuft in 24 Stunden ab):\n${link}\n\nWenn Sie das nicht waren, ignorieren Sie diese Nachricht.`,
    verifyTextResend: (brand: string, link: string) =>
      `Bestätigen Sie Ihre E-Mail-Adresse, um Ihr ${brand}-Konto zu aktivieren.\n\nÖffnen Sie diesen Link (läuft in 24 Stunden ab):\n${link}\n\nWenn Sie das nicht waren, ignorieren Sie diese Nachricht.`,
    verifyTextChangeEmail: (brand: string, link: string) =>
      `Bestätigen Sie Ihre neue E-Mail-Adresse, um Ihr ${brand}-Konto zu aktivieren.\n\nÖffnen Sie diesen Link (läuft in 24 Stunden ab):\n${link}\n\nWenn Sie das nicht waren, ignorieren Sie diese Nachricht.`,
  },
} satisfies Messages;
