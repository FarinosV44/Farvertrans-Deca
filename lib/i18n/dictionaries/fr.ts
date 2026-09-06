import { BRAND } from "@/lib/brand";
import type { Messages } from "./es";

/**
 * French string catalog, key-for-key with `es.ts` (I18N #54). `satisfies
 * Messages` pins this to the Spanish dictionary's exact shape, so a key added
 * to one and forgotten in the other is a type error, not a silent blank
 * string in prod. Legal pages (`/terminos`, `/privacidad`, `/aviso-legal`)
 * are NOT translated by this dictionary — they render fixed Spanish JSX and
 * stay that way in every locale until a professional legal review exists
 * (owner decision, see `docs/decisions.md` D-072).
 */
export const fr = {
  common: {
    appName: BRAND.name,
    createCta: "CRÉER UN DECA GRATUIT",
    headerCta: "Créer un DeCA",
    loginCta: "Connexion",
    panelCta: "Aller à mon espace",
    skipToContent: "Aller au contenu",
  },
  nav: {
    howItWorks: "Comment ça marche",
    regulation: "Réglementation",
    guides: "Guides",
    blog: "Blog",
    faq: "Questions",
  },
  language: {
    es: "Español",
    en: "English",
  },
  landing: {
    hero: {
      eyebrow: "Document Électronique de Contrôle",
      h1: "DeCA professionnel, simple et prêt à l'emploi.",
      subhead:
        "Générez, gérez, conservez et partagez vos Documents Électroniques de Contrôle depuis une plateforme spécialisée dans le transport.",
      proof:
        "Marchandises · PDF + QR · Conservation numérique · Historique · Multi-utilisateur · Gratuit pendant la phase de lancement",
      cta: "CRÉER UN DECA GRATUIT",
      ctaSecondary: "CONNEXION",
      noCardNote: "Sans carte · Sans limite de documents pendant la phase de lancement.",
    },
    trustRow: [
      "Sans inscription pour votre premier DeCA",
      "PDF + QR",
      "Conservation numérique",
      "Historique",
    ],
    stepsHeading: "Créez votre DeCA en 3 étapes",
    steps: [
      {
        title: "Saisissez les données",
        body: "Chargeur, transporteur, origine, destination, marchandise et immatriculation. Sans engagement.",
      },
      {
        title: "Créez votre compte et générez-le",
        body: "Inscription gratuite en quelques secondes — nous créons le PDF natif avec QR et une URL unique de téléchargement direct. Rien de ce que vous avez déjà saisi n'est perdu.",
      },
      {
        title: "Partagez-le avec le conducteur",
        body: "Lien, WhatsApp, e-mail ou copie imprimée. Prêt pour l'inspection.",
      },
    ],
    freeValueHeading: "Tout inclus pendant le lancement.",
    freeValueSubhead:
      "Multi-utilisateur, historique, conservation et réutilisation des données inclus sans frais pendant la phase de lancement — des fonctionnalités que d'autres plateformes DeCA facturent en supplément.",
    freeValueComingSoon: "Bientôt disponible",
    freeValueItems: [
      { label: "Générer un DeCA" },
      { label: "PDF natif + QR" },
      { label: "Historique" },
      { label: "Conservation numérique" },
      { label: "Multi-utilisateur" },
      { label: "Entreprises habituelles" },
      { label: "Véhicules enregistrés" },
      { label: "Lieux habituels" },
      { label: "Duplication rapide" },
      { label: "Itinéraires fréquents" },
      { label: "Mode inspection" },
      { label: "Accès API / ERP" },
    ],
    productHeading: "Du formulaire au PDF avec QR, sans étapes superflues",
    benefits: [
      {
        title: "Gratuit",
        body: "Aucune limite de DeCA pendant la phase de lancement. Sans carte, sans abonnement.",
      },
      {
        title: "Rapide",
        body: "Réutilisez vos données habituelles et dupliquez un document précédent en un instant.",
      },
      {
        title: "Prêt pour l'inspection",
        body: "PDF natif, QR et URL HTTPS directe conformes à la résolution en vigueur.",
      },
    ],
    personasHeading: "Conçu pour ceux qui déplacent des marchandises",
    personas: [
      {
        title: "Transporteur indépendant",
        jobToBeDone: "Générez le DeCA en quelques minutes et emportez-le sur votre mobile.",
        benefits: [
          "Inscription gratuite en quelques secondes",
          "Entreprise et véhicule enregistrés après inscription",
          "Duplication rapide du dernier document",
          "Envoi au conducteur en un instant",
        ],
      },
      {
        title: "Entreprise de transport",
        jobToBeDone: "Un même espace pour tous vos opérateurs et documents.",
        benefits: [
          "Plusieurs utilisateurs dans la même entreprise",
          "Historique partagé",
          "Chargeurs, véhicules et adresses enregistrés",
          "Audit de qui a créé ou corrigé chaque DeCA",
        ],
      },
      {
        title: "Agence / opérateur de transport",
        jobToBeDone: "Gérez le document en tant que chargeur contractuel sans dépendre de tiers.",
        benefits: [
          "Plusieurs entreprises et transporteurs",
          "Contreparties réutilisables",
          "Duplication rapide",
          "Espace de travail pour l'équipe",
        ],
      },
      {
        title: "Chargeur / expéditeur",
        jobToBeDone: "Générez, conservez et partagez vos DeCA depuis un seul endroit.",
        benefits: [
          "Transporteurs habituels enregistrés",
          "Historique des documents",
          "Parcours d'inspection direct par QR/PDF",
          "Sans mettre en place un nouveau processus dans votre ERP",
        ],
      },
    ],
    personaCtaPrefix: "Comment ça marche pour",
    dailyUseHeading: "Chaque DeCA vous prend moins de temps que le précédent.",
    dailyUseSubhead: "Enregistrez une fois. Réutilisez toujours.",
    dailyUseFooter:
      "Commencez à remplir votre DeCA sans engagement ; nous ne vous demandons qu'un compte gratuit à la fin, pour le générer.",
    dailyUseFooterLink: "votre entreprise",
    dailyUseFooterAfterLink:
      "conserve tout cela pour que le prochain DeCA ne prenne que quelques secondes.",
    dailyUse: [
      { label: "Générer un DeCA", body: "Formulaire guidé en 3 étapes." },
      { label: "PDF + QR", body: "Document natif avec QR de vérification." },
      { label: "Historique", body: "Tous vos documents, toujours à portée de main." },
      { label: "Dupliquer", body: "Répétez un DeCA précédent en quelques secondes." },
      { label: "Véhicules enregistrés", body: "Tracteur et remorque en un clic." },
      {
        label: "Entreprises habituelles",
        body: "Chargeurs et transporteurs réutilisables.",
      },
      { label: "Lieux habituels", body: "Chargement et déchargement prêts à choisir." },
      {
        label: "Conservation numérique",
        body: "Conservation conforme à la réglementation en vigueur.",
      },
    ],
    regulationHeading: "Ce que la réglementation exige",
    legalPoints: [
      "Obligatoire à partir du 5 octobre 2026 pour le transport intérieur de marchandises par route.",
      "Le fichier est un PDF natif numérique, généré à partir de données structurées — un scan ne suffit pas.",
      "Taille maximale 5 Mo.",
      "Inclut un code QR avec une URL unique commençant par https://",
      "L'URL permet le téléchargement direct du PDF, sans inscription ni mot de passe.",
      "La date et l'heure de création et de toute modification sont enregistrées.",
      "Conservation minimale d'un an par le chargeur et par le transporteur.",
    ],
    legalSourceLabel: "Source :",
    operatorTrustHeading: "Qui se trouve derrière le service",
    faqHeading: "Questions fréquentes",
    faq: [
      {
        q: "Qu'est-ce que le DeCA ?",
        a: "Le Document Électronique de Contrôle Administratif est la version numérique obligatoire du document de contrôle du transport de marchandises par route. Il remplace le document papier.",
      },
      {
        q: "Quand devient-il obligatoire ?",
        a: "À partir du 5 octobre 2026 pour le transport intérieur. Il n'y a ni prorogation ni période transitoire : le papier ne sera plus accepté.",
      },
      {
        q: "Qui doit l'établir ?",
        a: "Le chargeur contractuel et le transporteur effectif du transport public de marchandises par route, selon les termes de la réglementation applicable.",
      },
      {
        q: "Est-il obligatoire pour les agences de transport ?",
        a: "Oui, lorsqu'elles agissent en tant que chargeur contractuel ou opérateur contractant le transport, avec les mêmes obligations de génération et de conservation.",
      },
      {
        q: "Un PDF scanné convient-il ?",
        a: "Non. Le fichier doit être un PDF natif numérique généré à partir de données structurées. Un scan ou une image numérisée n'est pas valide.",
      },
      {
        q: "Doit-il être signé ?",
        a: "La résolution n'exige pas de signature électronique. Elle exige un PDF natif, un QR, une URL HTTPS de téléchargement direct et un enregistrement de la création et des modifications.",
      },
      {
        q: "Quelles données doit-il contenir ?",
        a: "Au minimum : le chargeur contractuel (nom ou raison sociale, numéro fiscal et adresse), le transporteur effectif (nom ou raison sociale et numéro fiscal), le lieu et la date de chargement, le lieu et la date de déchargement, la nature et le poids de la marchandise, et l'immatriculation du véhicule (tracteur et remorque s'il s'agit d'un ensemble articulé).",
      },
      {
        q: "Comment le conducteur le transporte-t-il ?",
        a: "Avant le début du service, sous forme de copie électronique visible sur le mobile ou de copie imprimée, avec le QR toujours disponible.",
      },
      {
        q: `${BRAND.name} est-il gratuit ?`,
        a: "Oui. Vous pouvez créer et télécharger des documents sans carte et sans limite jusqu'au 31 décembre 2026.",
      },
      {
        q: "Puis-je générer autant de documents que je le souhaite ?",
        a: "Oui. Il n'y a pas de limite mensuelle. Nous n'appliquons que des contrôles automatiques contre les usages abusifs qui n'affectent ni l'usage normal ni l'inspection.",
      },
    ],
    finalCtaHeading: "Commencez maintenant. Sans carte.",
    finalCtaSubhead:
      "Créez votre DeCA, enregistrez vos données habituelles et commencez à travailler depuis un seul espace.",
    finalCtaMicrocopy: "Gratuit pendant la phase de lancement · Sans carte",
  },
  auth: {
    heading: {
      register: "Créez votre compte gratuit",
      login: "Bon retour parmi nous",
      joinTeam: "Rejoindre l'équipe",
      claim: "Enregistrer ce DeCA",
    },
    subhead: {
      register:
        "Enregistrez vos DeCA, réutilisez vos données habituelles et générez de nouveaux documents plus rapidement.",
      login:
        "Connectez-vous pour voir vos DeCA, réutiliser vos données et générer de nouveaux documents plus rapidement.",
      joinTeamInvitedBy: (company: string) => `${company} vous a invité. `,
      joinTeamSuffix:
        "Créez votre accès et vous partagerez leurs DeCA et données habituelles. Inutile de créer une autre entreprise.",
      claim:
        "Créez un compte gratuit pour enregistrer ce document et réutiliser vos données. Ce n'est pas un formulaire commercial.",
    },
    orContinueWithEmail: "ou continuez avec l'e-mail",
    googleCta: "Continuer avec Google",
    emailLabel: "E-mail",
    passwordHint: "Minimum 12 caractères, avec majuscules, minuscules, chiffres et un symbole.",
    company: {
      legend: "Votre entreprise",
      name: "Nom ou raison sociale",
      nif: "Numéro fiscal",
      contactName: "Personne de contact (facultatif)",
      phone: "Téléphone (facultatif)",
      address: "Adresse (facultatif)",
    },
    profile: {
      legend: "Comment allez-vous principalement utiliser la plateforme ?",
      items: {
        carrier_goods: {
          title: "Transporteur de marchandises",
          body: "Vous effectuez le transport de marchandises pour le compte d'autrui.",
        },
        shipper: {
          title: "Entreprise chargeuse",
          body: "Vous faites appel à un transporteur pour vos propres envois de marchandises.",
        },
        operator: {
          title: "Opérateur de transport",
          body: "Vous organisez des transports de marchandises (opérateur logistique ou agence).",
        },
        carrier_passengers: {
          title: "Transporteur de voyageurs",
          body: "Vous effectuez le transport de voyageurs par route.",
        },
      },
    },
    dataProtection: {
      title: "Informations de base sur la protection des données",
      responsible: "Responsable :",
      purpose: "Finalité :",
      purposeBody: "gérer l'inscription et la fourniture de la Plateforme DeCA.",
      moreInfoPrefix: "Plus d'informations dans notre",
      privacyPolicy: "Politique de Confidentialité",
    },
    terms: {
      readPrefix: "J'ai lu la",
      privacyPolicy: "Politique de Confidentialité",
      andAccept: "et j'accepte les",
      termsAndConditions: "Conditions Générales",
    },
    submit: {
      register: "Créer un compte gratuit",
      login: "Connexion",
      busy: "Un instant…",
    },
    forgotPassword: "Mot de passe oublié ?",
    switchPrompt: {
      toLogin: "Vous avez déjà un compte ? ",
      toRegister: "Vous n'avez pas de compte ? ",
    },
    switchCta: {
      toLogin: "Connectez-vous",
      toRegister: "Créez votre compte gratuit",
    },
    footNote: "Gratuit · Sans carte · Vos DeCA au même endroit",
    errors: {
      acceptTerms:
        "Vous devez accepter les Conditions Générales et la Politique de Confidentialité.",
      generic: "Impossible de terminer. Réessayez.",
      noConnection: "Pas de connexion. Réessayez.",
    },
    invalidInvite: {
      title: "Invitation non valide",
      body: "Ce lien d'invitation a expiré, a déjà été utilisé ou n'est pas correct. Demandez à la personne qui vous a invité de vous en envoyer un nouveau.",
      loginCta: "J'ai déjà un compte · Connexion",
      freeStartCta: "Commencer un DeCA gratuit",
    },
    verify: {
      title: "Confirmez votre e-mail",
      sentPrefix: "C'est presque terminé. Nous vous avons envoyé un e-mail à",
      sentSuffix: "pour activer votre compte et commencer à émettre des DeCA.",
      failedPrefix: "Nous n'avons pas pu envoyer l'e-mail de confirmation à",
      failedSuffix: "Cliquez sur « Renvoyer l'e-mail » pour réessayer.",
      whatNext: {
        title: "Ce qui se passe ensuite",
        step1: "1. Vous confirmez votre e-mail",
        step2: "2. Vous accédez à votre compte",
        step3: "3. Vous commencez à émettre des DeCA",
      },
      openMail: "Ouvrir ma messagerie",
      resend: "Renvoyer l'e-mail",
      resendSending: "Envoi en cours…",
      resendSent: "E-mail renvoyé. Vérifiez votre boîte de réception.",
      resendError: "Impossible de renvoyer. Réessayez dans quelques minutes.",
      changeEmail: {
        open: "Changer d'e-mail",
        label: "Nouvel e-mail",
        currentPasswordLabel: "Votre mot de passe actuel",
        save: "Enregistrer et renvoyer",
        cancel: "Annuler",
        error: "Impossible de changer l'e-mail.",
      },
      continueChecking: "Vérification…",
      continueLabel: "J'ai déjà confirmé mon compte",
      notYetVerified:
        "Votre e-mail n'est pas encore vérifié. Ouvrez le lien que nous vous avons envoyé.",
      spamHint: "Si vous ne trouvez pas le message, vérifiez votre dossier spam ou promotions.",
    },
    verifyToken: {
      successHeading: "E-mail confirmé",
      successBody: "Votre compte est actif. Vous pouvez désormais émettre des DeCA sans limite.",
      successCtaAuthed: "Aller à mon espace",
      successCtaAnon: "Connexion",
      errorHeading: "Nous n'avons pas pu confirmer votre e-mail",
      errorInvalid: "Ce lien de confirmation n'est pas valide.",
      errorUsed: "Ce lien a déjà été utilisé. Votre e-mail est peut-être déjà confirmé.",
      errorExpired: "Le lien de confirmation a expiré. Demandez-en un nouveau depuis votre compte.",
      errorCtaAuthed: "Demander un nouveau lien",
      errorCtaAnon: "Connexion",
    },
  },
  panel: {
    verifyBanner: {
      text: (email: string) => `Vous n'avez pas encore confirmé votre e-mail (${email}).`,
      cta: "Confirmer maintenant",
    },
    myCompanyFallback: "Mon entreprise",
    newDeca: "Nouveau DeCA",
    duplicateLast: "Répéter / dupliquer le dernier DeCA",
    lastDocuments: "Derniers documents",
    viewAllHistory: "Voir tout l'historique",
    noDocumentsYet: "Vous n'avez pas encore de documents.",
    createFirst: "Créez votre premier DeCA",
    detail: "Détail",
    duplicate: "Dupliquer",
    pdf: "PDF",
    companiesCard: "Entreprises / transporteurs habituels",
    vehiclesCard: "Véhicules habituels",
    manageData: "Gérer les données habituelles →",
    nav: {
      home: "Mes DeCA",
      historico: "Historique",
      plantillas: "Modèles",
      datos: "Données habituelles",
      equipo: "Équipe",
      empresa: "Mon entreprise",
    },
  },
  historico: {
    title: "Historique",
    search: "Rechercher",
    searchPlaceholder: "Référence, entreprise, immatriculation, origine ou destination",
    from: "Du",
    to: "Au",
    carrier: "Transporteur",
    carrierAll: "Tous",
    plate: "Immatriculation",
    filter: "Filtrer",
    clear: "Effacer",
    documentsCountOne: "document",
    documentsCountMany: "documents",
    exportCsv: "Exporter en CSV",
    colDate: "Date",
    colRoute: "Chargement → Déchargement",
    colShipper: "Chargeur",
    colCarrier: "Transporteur",
    colPlate: "Immatriculation",
    colStatus: "Statut",
    colActions: "Actions",
    statusActive: "En vigueur",
    statusCorrected: "Corrigé",
    statusUnavailable: "Non disponible",
    detail: "Détail",
    correct: "Corriger",
    duplicate: "Dupliquer",
    pdf: "PDF",
    noResults: "Aucun résultat.",
    createOne: "Créer un DeCA",
  },
  crear: {
    steps: [
      "Qui contracte et qui transporte",
      "Chargement et déchargement",
      "Véhicule, marchandise et révision",
    ],
    subheadLeadGate:
      "Complétez les données sans engagement — nous ne vous demanderons votre nom et votre e-mail qu'à la fin, sans nécessité de créer un compte.",
    correctionIntro:
      "Correction du DeCA en cours. Une nouvelle version sera générée avec un nouveau QR et une nouvelle URL ; la version précédente est conservée.",
    stepOf: (current: number) => `Étape ${current} sur 3 ·`,
    stepOfAria: (current: number, label: string) => `Étape ${current} sur 3 : ${label}`,
    noConnection: "Pas de connexion. Vérifiez votre réseau et réessayez.",
    templates: {
      legend: "Commencer à partir d'un modèle",
      placeholder: "Choisissez un modèle…",
      hint: "Vous devrez encore vérifier les données et indiquer la date avant de générer.",
    },
    useCompany: {
      shipper: "Mon entreprise est le chargeur",
      carrier: "Mon entreprise est le transporteur",
    },
    useSame: {
      shipperIsCarrier: "Le transporteur est le même que le chargeur",
      carrierIsShipper: "Le chargeur est le même que le transporteur",
    },
    legends: {
      shipper: "Chargeur contractuel",
      carrier: "Transporteur effectif",
      loadLocation: "Lieu de chargement",
      unloadLocation: "Lieu de déchargement",
      vehicleGoods: "Véhicule et marchandise",
    },
    sectionHints: {
      shipper: "Qui vous a fait appel pour ce transport ?",
      carrier: "Quelle entreprise effectue physiquement le transport ?",
      loadLocation: "Où la marchandise est-elle collectée et quel jour.",
      unloadLocation:
        "Où la marchandise est-elle livrée et quel jour. Cela peut être le même jour que le chargement.",
      vehicleGoods: "Le véhicule qui effectue le transport et ce qui est transporté.",
    },
    autofill: {
      company: "Rechercher ou sélectionner une entreprise habituelle",
      carrier: "Rechercher ou sélectionner un transporteur habituel",
      location: "Rechercher ou sélectionner un lieu habituel",
      vehicle: "Rechercher ou sélectionner un véhicule",
      newOption: "Saisir un nouveau…",
    },
    fields: {
      name: "Nom ou raison sociale",
      nif: "Numéro fiscal / TVA",
      address: "Adresse",
      locationName: "Entreprise ou établissement",
      locationAddress: "Adresse complète",
      postalCode: "Code postal",
      city: "Ville",
      province: "Province",
      country: "Pays",
      loadDate: "Date de chargement",
      unloadDate: "Date de déchargement",
      goods: "Nature de la marchandise",
      weight: "Poids (ou mesure alternative)",
      weightHint:
        "Ex. : 12000 kg, ou « une plateforme complète » si le poids exact n'est pas déterminable.",
      tractorPlate: "Immatriculation du tracteur",
      trailerPlate: "Immatriculation de la remorque / semi-remorque",
      trailerHint: "S'il n'y a pas de remorque, laissez vide.",
      reference: "Référence ou notes (facultatif)",
    },
    hints: {
      nifForeign: "Vous pouvez utiliser un numéro fiscal étranger.",
      unloadSameDay: "Peut coïncider avec la date de chargement.",
      plateForeign:
        "Cela ne ressemble pas à une immatriculation espagnole (format 1234 BCD). Elle est valide si le véhicule est étranger.",
    },
    errorSummaryTitle: "Vérifiez ces champs :",
    lead: {
      title: "Plus qu'une étape : à qui envoyons-nous le DeCA ?",
      body: "Votre nom et votre e-mail, uniquement pour vous envoyer le lien de téléchargement. Sans créer de compte.",
      name: "Votre nom",
      email: "Votre e-mail",
      loginPrompt: "Vous avez déjà un compte ? Connexion",
      loginPromptSuffix: "pour utiliser vos données enregistrées.",
    },
    verifyGate: {
      title: "Confirmez votre e-mail pour générer le DeCA",
      body: "Vos données sont enregistrées à cette étape. Confirmez le lien que nous vous avons envoyé par e-mail et revenez — nous générons votre document instantanément, sans rien ressaisir.",
      cta: "Aller confirmer mon e-mail",
    },
    repeatGate: {
      title: "Vous avez déjà créé votre premier DeCA",
      body: "Inscrivez-vous gratuitement pour créer le suivant — vous réutilisez vos données et c'est bien plus rapide.",
      cta: "Créer un compte gratuit",
      loginPrompt: "Vous avez déjà un compte ? Connexion",
    },
    readOnlyGate: {
      title: "Votre rôle est en lecture seule",
      body: "Vous pouvez consulter l'historique et les documents de votre entreprise, mais pas créer ni corriger de DeCA. Demandez à un administrateur de modifier votre rôle si nécessaire.",
      cta: "Aller à mon historique",
    },
    correctionReason: "Motif de la correction",
    correctionReasonRequired: "Indiquez le motif de la correction.",
    correctionSaveFailed: "Impossible d'enregistrer la correction.",
    checkingChallenge: "Vérification… un instant.",
    generationFailedFallback:
      "Nous n'avons pas pu générer le document. Vos données restent enregistrées. Réessayez dans quelques secondes.",
    generationFailedGeneric: "Impossible de générer le DeCA. Réessayez.",
    generatingStatus: "Nous générons votre PDF et votre QR… ne fermez pas cette page.",
    notGenerated: "Le DeCA n'a pas été généré",
    correlationPrefix: "Code :",
    correlationSuffix:
      "— signalez-le-nous si cela se reproduit et nous localiserons l'erreur exacte.",
    retry: "Réessayer la génération",
    backToReview: "Revenir à la vérification des données",
    review: {
      heading: "Vérifiez avant de générer",
      subhead:
        "Voici les données exactes qui apparaîtront dans le DeCA et dans le PDF. Utilisez « Modifier » si quelque chose n'est pas correct.",
      edit: "Modifier",
      shipperTitle: "Entreprise qui contracte le transport",
      carrierTitle: "Transporteur qui effectue le transport",
      loadTitle: "Lieu et date de chargement",
      unloadTitle: "Lieu et date de déchargement",
      vehicleTitle: "Véhicule et marchandise",
      name: "Nom ou raison sociale",
      nif: "Numéro fiscal / TVA",
      address: "Adresse",
      locationName: "Entreprise / établissement",
      locationAddress: "Adresse",
      postalCode: "Code postal",
      city: "Ville",
      province: "Province",
      country: "Pays",
      loadDate: "Date de chargement",
      unloadDate: "Date de déchargement",
      tractorPlate: "Immatriculation tracteur",
      trailerPlate: "Immatriculation remorque",
      goods: "Marchandise",
      weight: "Poids ou mesure",
      reference: "Référence",
    },
    buttons: {
      back: "Retour",
      next: "Suivant",
      generating: "Génération…",
      generate: "GÉNÉRER LE DECA",
      saveCorrection: "ENREGISTRER LA CORRECTION",
    },
  },
  result: {
    heading: "DeCA généré",
    version: "Version",
    versionGenerated: (v: number, date: string) => `Version ${v} · généré le ${date}`,
    documentData: "Données du document",
    retentionNotice:
      "Document conservé pendant au moins 1 an. L'URL publique permet le téléchargement direct du PDF sans inscription, conformément à la résolution en vigueur.",
    createAnother: "Créer un autre DeCA",
    downloadPdf: "Ouvrir / télécharger le PDF",
    sendToDriver: "Envoyer au conducteur",
    share: "Partager…",
    whatsapp: "Envoyer par WhatsApp",
    driverEmailLabel: "E-mail du conducteur",
    send: "Envoyer",
    sent: "Envoyé.",
    emailFallback:
      "L'envoi par e-mail n'est pas configuré. Ouverture de votre client de messagerie…",
    emailFailed: "Impossible d'envoyer. Utilisez le lien ou WhatsApp.",
    emailNoConnection: "Pas de connexion.",
    copyLink: "Copier le lien",
    linkCopied: "Lien copié",
    print: "Imprimer",
    checkQr: "Vérifier le QR",
    qrLinkLabel: "Voici le lien porté par le QR du PDF :",
    openInspectionLink: "Ouvrir le lien d'inspection dans un nouvel onglet",
    verifyHint: "Pour une vérification réelle, scannez le QR avec un autre mobile.",
    save: "Enregistrer mes DeCA en créant un compte",
    saveHint:
      "Créer un compte enregistre vos documents et vos données habituelles. Ce n'est pas un formulaire commercial.",
    correctedReminder:
      "Ce DeCA a été corrigé. Renvoyez au conducteur la version actuelle — la précédente reste dans l'historique et demeure accessible via son URL.",
    shareTitle: "DeCA du transport",
    shareTextPrefix: "Document de contrôle (DeCA) du transport :",
  },
  errors: {
    generic: "Une erreur s'est produite. Réessayez dans quelques secondes.",
    notFound: "Nous n'avons pas trouvé cette page.",
  },
  legalNotice: {
    notTranslated:
      "Ce document n'a de valeur juridique que dans sa version espagnole. Une traduction dans cette langue n'est pas encore disponible.",
  },
  emails: {
    verifySubject: (brand: string) => `Confirmez votre e-mail sur ${brand}`,
    verifyTextInitial: (brand: string, link: string) =>
      `C'est presque terminé. Confirmez votre e-mail pour activer votre compte ${brand}.\n\nOuvrez ce lien (expire dans 24 heures) :\n${link}\n\nSi ce n'était pas vous, ignorez ce message.`,
    verifyTextResend: (brand: string, link: string) =>
      `Confirmez votre e-mail pour activer votre compte ${brand}.\n\nOuvrez ce lien (expire dans 24 heures) :\n${link}\n\nSi ce n'était pas vous, ignorez ce message.`,
    verifyTextChangeEmail: (brand: string, link: string) =>
      `Confirmez votre nouvel e-mail pour activer votre compte ${brand}.\n\nOuvrez ce lien (expire dans 24 heures) :\n${link}\n\nSi ce n'était pas vous, ignorez ce message.`,
  },
} satisfies Messages;
