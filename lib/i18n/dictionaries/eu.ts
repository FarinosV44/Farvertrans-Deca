import { BRAND } from "@/lib/brand";
import type { Messages } from "./es";

/**
 * Basque (Euskera) string catalog, key-for-key with `es.ts` (I18N #54).
 * `satisfies Messages` pins this to the Spanish dictionary's exact shape, so
 * a key added to one and forgotten in the other is a type error, not a
 * silent blank string in prod. Legal pages (`/terminos`, `/privacidad`,
 * `/aviso-legal`) are NOT translated by this dictionary — they render fixed
 * Spanish JSX and stay that way in every locale until a professional legal
 * review exists (owner decision, see `docs/decisions.md` D-072).
 *
 * TRANSLATION-QUALITY CAVEAT (see D-074): Basque is a language isolate with
 * no genetic relation to Spanish/Catalan/Galician — ergative-absolutive
 * case marking, agglutinative morphology, verb agreement with up to three
 * arguments. This dictionary was produced with meaningfully lower confidence
 * than the Romance-language dictionaries in this same directory and should
 * get a native-speaker review before being relied on the same way.
 */
export const eu = {
  common: {
    appName: BRAND.name,
    createCta: "SORTU DECA DOAN",
    headerCta: "Sortu DeCA",
    loginCta: "Sartu",
    panelCta: "Joan nire panelera",
    skipToContent: "Salto edukira",
  },
  nav: {
    howItWorks: "Nola funtzionatzen duen",
    regulation: "Araudia",
    guides: "Gidak",
    blog: "Bloga",
    faq: "Galderak",
  },
  language: {
    es: "Español",
    en: "English",
  },
  landing: {
    hero: {
      eyebrow: "Kontrolerako Dokumentu Elektronikoa",
      h1: "DeCA profesionala, erraza eta lanerako prest.",
      subhead:
        "Sortu, kudeatu, zaindu eta partekatu zure Kontrolerako Dokumentu Elektronikoak garraiorako plataforma espezializatu batetik.",
      proof:
        "Salgaiak · PDF + QR · Zaintza digitala · Historiala · Erabiltzaile anitz · Doan abiaraztearen fasean",
      cta: "SORTU DECA DOAN",
      ctaSecondary: "SARTU",
      noCardNote: "Txartelik gabe · Dokumentu-mugarik gabe abiaraztearen fasean zehar.",
    },
    trustRow: [
      "Erregistrorik gabe zure lehen DeCArako",
      "PDF + QR",
      "Zaintza digitala",
      "Historiala",
    ],
    stepsHeading: "Sortu zure DeCA 3 urratsetan",
    steps: [
      {
        title: "Sartu datuak",
        body: "Bidaltzailea, garraiolaria, jatorria, helmuga, salgaia eta matrikula. Konpromisorik gabe.",
      },
      {
        title: "Sortu zure kontua eta sortu dokumentua",
        body: "Erregistro doakoa segundo gutxitan — PDF natiboa sortzen dugu QR eta deskarga zuzeneko URL bakar batekin. Idatzitakoa ez da galtzen.",
      },
      {
        title: "Partekatu gidariarekin",
        body: "Esteka, WhatsApp, posta elektronikoa edo kopia inprimatua. Ikuskapenerako prest.",
      },
    ],
    freeValueHeading: "Guztia barne abioaldian.",
    freeValueSubhead:
      "Erabiltzaile anitz, historiala, zaintza eta datuen berrerabilera kostu gabe abioaldian — beste DeCA plataformek aparte kobratzen dituzten funtzioak.",
    freeValueComingSoon: "Laster",
    freeValueItems: [
      { label: "Sortu DeCA" },
      { label: "PDF natiboa + QR" },
      { label: "Historiala" },
      { label: "Zaintza digitala" },
      { label: "Erabiltzaile anitz" },
      { label: "Ohiko enpresak" },
      { label: "Gordetako ibilgailuak" },
      { label: "Ohiko lekuak" },
      { label: "Bikoizte azkarra" },
      { label: "Ohiko ibilbideak" },
      { label: "Ikuskapen modua" },
      { label: "API / ERP sarbidea" },
    ],
    productHeading: "Formulariotik QR duen PDFra, urrats gehiagorik gabe",
    benefits: [
      {
        title: "Doan",
        body: "DeCA mugarik gabe erakartze-fasean zehar. Txartelik gabe, ordainketa-planik gabe.",
      },
      {
        title: "Azkarra",
        body: "Berrerabili ohiko datuak eta bikoiztu aurreko dokumentuak ukitu batean.",
      },
      {
        title: "Ikuskapenerako prest",
        body: "PDF natiboa, QR eta zuzeneko URL HTTPS indarrean dagoen ebazpenaren arabera.",
      },
    ],
    personasHeading: "Salgaiak mugitzen dituenarentzat egina",
    personas: [
      {
        title: "Garraiolari autonomoa",
        jobToBeDone: "Sortu DeCA minutu gutxitan eta eraman mugikorrean.",
        benefits: [
          "Erregistro doakoa segundo gutxitan",
          "Enpresa eta ibilgailua gordeta erregistratu ondoren",
          "Azken dokumentuaren bikoizte azkarra",
          "Bidali gidariari ukitu batean",
        ],
      },
      {
        title: "Garraio-enpresa",
        jobToBeDone: "Espazio bera zure eragile eta dokumentu guztientzat.",
        benefits: [
          "Erabiltzaile bat baino gehiago enpresa berean",
          "Historial partekatua",
          "Bidaltzaile, ibilgailu eta helbide gordeak",
          "Nork sortu edo zuzendu duen auditatzeko aukera",
        ],
      },
      {
        title: "Garraio-agentzia / operadorea",
        jobToBeDone:
          "Kudeatu dokumentua bidaltzaile kontratugile gisa, hirugarrenen mende egon gabe.",
        benefits: [
          "Enpresa eta garraiolari ugari",
          "Berrerabil daitezkeen kontrapartidak",
          "Bikoizte azkarra",
          "Taldearentzako lan-espazioa",
        ],
      },
      {
        title: "Bidaltzailea / igorlea",
        jobToBeDone: "Sortu, gorde eta partekatu zure DeCAak leku bakar batetik.",
        benefits: [
          "Ohiko garraiolariak gordeak",
          "Dokumentuen historiala",
          "Ikuskapenerako zuzeneko bidea QR/PDF bidez",
          "Zure ERPan prozesu berririk montatu gabe",
        ],
      },
    ],
    personaCtaPrefix: "Nola funtzionatzen duen",
    dailyUseHeading: "DeCA bakoitzak aurrekoak baino denbora gutxiago behar du.",
    dailyUseSubhead: "Gorde behin. Berrerabili beti.",
    dailyUseFooter:
      "Hasi zure DeCA betetzen konpromisorik gabe; azkenean kontu doako bat sortzea baino ez dizugu eskatzen, sortzeko.",
    dailyUseFooterLink: "zure enpresak",
    dailyUseFooterAfterLink: "dena gordetzen du, hurrengo DeCA segundo kontua izan dadin.",
    dailyUse: [
      { label: "Sortu DeCA", body: "Gidatutako formularioa 3 urratsetan." },
      { label: "PDF + QR", body: "Egiaztatzeko QR duen dokumentu natiboa." },
      { label: "Historiala", body: "Zure dokumentu guztiak, beti eskura." },
      { label: "Bikoiztu", body: "Errepikatu aurreko DeCA bat segundotan." },
      { label: "Gordetako ibilgailuak", body: "Traktorea eta atoia klik batean." },
      {
        label: "Ohiko enpresak",
        body: "Berrerabil daitezkeen bidaltzaile eta garraiolariak.",
      },
      { label: "Ohiko lekuak", body: "Karga eta deskarga aukeratzeko prest." },
      {
        label: "Zaintza digitala",
        body: "Indarrean dagoen araudiaren araberako kontserbazioa.",
      },
    ],
    regulationHeading: "Araudiak eskatzen duena",
    legalPoints: [
      "2026ko urriaren 5etik aurrera nahitaezkoa errepideko barne-garraiorako.",
      "Fitxategia PDF natibo digitala da, datu egituratuetatik sortua — eskaneatu batek ez du balio.",
      "Gehienezko tamaina 5 MB.",
      "https://-rekin hasten den URL bakarra duen QR kodea dauka.",
      "URLak PDFaren deskarga zuzena ahalbidetzen du, erregistrorik eta pasahitzik gabe.",
      "Sorreraren eta edozein aldaketaren data eta ordua erregistratzen dira.",
      "Gutxienez urtebeteko kontserbazioa bidaltzailearen eta garraiolariaren aldetik.",
    ],
    legalSourceLabel: "Iturria:",
    operatorTrustHeading: "Nor dago zerbitzuaren atzean",
    faqHeading: "Ohiko galderak",
    faqGroups: [
      {
        heading: "Araudia eta betebeharra",
        items: [
          {
            q: "Zer da DeCA?",
            a: "Kontrolerako Dokumentu Administratibo Elektronikoa errepideko salgai-garraioaren kontrol-dokumentuaren nahitaezko bertsio digitala da. Paperezko dokumentua ordezten du.",
          },
          {
            q: "Noiz da nahitaezkoa?",
            a: "2026ko urriaren 5etik aurrera barne-garraiorako, luzapenik edo trantsizio-epealdirik gabe: DeCA jatorritik formatu elektronikoan sortu behar da. Gidariak kopia elektronikoa mugikorrean edo QR kodea daukan kopia inprimatua eraman ditzake; jatorriz paperean sortu eta gero eskaneatutako dokumentua ez da baliozko DeCA elektronikoa.",
          },
          {
            q: "Nork egin behar du?",
            a: "Bidaltzaile kontratugileak eta errepideko salgai-garraio publikoaren garraiolari eragileak, aplikagarri den araudiaren arabera.",
          },
          {
            q: "Nahitaezkoa al da garraio-agentzientzat?",
            a: "Bai, bidaltzaile kontratugile edo garraioa kontratatzen duen operadore gisa jarduten dutenean, sortze- eta kontserbazio-betebehar berekin.",
          },
        ],
      },
      {
        heading: "Dokumentua",
        items: [
          {
            q: "PDF eskaneatu batek balio al du?",
            a: "Ez. Fitxategia datu egituratuetatik sortutako PDF natibo digitala izan behar da. Eskaneatu bat edo irudi digitalizatu bat ez da baliozkoa.",
          },
          {
            q: "Sinatu behar al da?",
            a: "Ebazpenak ez du sinadura elektronikorik eskatzen. Bai eskatzen ditu PDF natiboa, QR kodea, deskarga zuzeneko URL HTTPSa eta sorrera eta aldaketen erregistroa.",
          },
          {
            q: "Zer datu izan behar ditu?",
            a: "Gutxienez: bidaltzaile kontratugilea (izena edo sozietate-izena, IFZ eta helbidea), garraiolari eragilea (izena edo sozietate-izena eta IFZ), karga-lekua eta -data, deskarga-lekua eta -data, salgaiaren izaera eta pisua, eta ibilgailuaren matrikula (traktorea eta atoia, atoi artikulatua bada).",
          },
        ],
      },
      {
        heading: "Erabilera eta kostua",
        items: [
          {
            q: "Nola eramaten du gidariak?",
            a: "Zerbitzua hasi aurretik, mugikorrean ikusgai dagoen kopia elektronikoan edo kopia inprimatuan, QR-a beti eskuragarri dutela.",
          },
          {
            q: `Doakoa al da ${BRAND.name}?`,
            a: "Bai. Dokumentuak sortu eta deskargatu ditzakezu txartelik eta mugarik gabe 2026ko abenduaren 31ra arte.",
          },
          {
            q: "Nahi ditudan dokumentu guztiak sortu ditzaket?",
            a: "Bai. Ez dago hileroko muga. Erabilera normala edo ikuskapena eragozten ez duten erabilera abusiboen aurkako kontrol automatikoak baino ez ditugu aplikatzen.",
          },
        ],
      },
    ],
    finalCtaHeading: "Hasi orain. Txartelik gabe.",
    finalCtaSubhead:
      "Sortu zure DeCA, gorde zure ohiko datuak eta hasi lanean espazio bakar batetik.",
    finalCtaMicrocopy: "Doan abiaraztearen fasean · Txartelik gabe",
  },
  auth: {
    heading: {
      register: "Sortu zure kontu doakoa",
      login: "Ongi etorri berriro",
      joinTeam: "Elkartu taldera",
      claim: "Gorde DeCA hau",
    },
    subhead: {
      register:
        "Gorde zure DeCAak, berrerabili ohiko datuak eta sortu dokumentu berriak azkarrago.",
      login:
        "Sartu zure DeCAak ikusteko, zure datuak berrerabiltzeko eta dokumentu berriak azkarrago sortzeko.",
      joinTeamInvitedBy: (company: string) => `${company} enpresak gonbidatu zaitu. `,
      joinTeamSuffix:
        "Sortu zure sarbidea eta haien DeCAak eta ohiko datuak partekatuko dituzu. Ez da beharrezkoa beste enpresa bat alta ematea.",
      claim:
        "Sortu kontu doako bat dokumentu hau gordetzeko eta zure datuak berrerabiltzeko. Ez da salmenta-formulario bat.",
    },
    orContinueWithEmail: "edo jarraitu posta elektronikoarekin",
    googleCta: "Jarraitu Google-rekin",
    emailLabel: "Posta elektronikoa",
    passwordHint: "Gutxienez 12 karaktere, maiuskulak, minuskulak, zenbakiak eta ikur bat dituela.",
    company: {
      legend: "Zure enpresa",
      name: "Izena edo sozietate-izena",
      nif: "IFK / IFZ",
      contactName: "Harremanetarako pertsona",
      phone: "Telefonoa",
      email: "Enpresaren helbide elektronikoa",
      address: "Helbidea",
      postalCode: "Posta-kodea",
      city: "Herria",
    },
    profile: {
      legend: "Nola erabiliko duzu batez ere plataforma?",
      items: {
        carrier_goods: {
          title: "Salgai-garraiolaria",
          body: "Beste baten kontura salgaien garraioa egiten duzu.",
        },
        shipper: {
          title: "Bidaltzaile-enpresa",
          body: "Zure salgai-bidalketetarako garraioa kontratatzen duzu.",
        },
        operator: {
          title: "Garraio-operadorea",
          body: "Salgai-garraioak antolatzen dituzu (operadore logistikoa edo agentzia).",
        },
        carrier_passengers: {
          title: "Bidaiari-garraiolaria",
          body: "Errepideko bidaiari-garraioa egiten duzu.",
        },
      },
    },
    dataProtection: {
      title: "Datuen babesari buruzko oinarrizko informazioa",
      responsible: "Arduraduna:",
      purpose: "Xedea:",
      purposeBody: "DeCA Plataformaren alta eta prestazioa kudeatzea.",
      moreInfoPrefix: "Informazio gehiago gure",
      privacyPolicy: "Pribatutasun Politikan",
    },
    terms: {
      readPrefix: "Irakurri dut",
      privacyPolicy: "Pribatutasun Politika",
      andAccept: "eta onartzen ditut",
      termsAndConditions: "Baldintzak eta Erabilera Baldintzak",
    },
    submit: {
      register: "Sortu kontu doakoa",
      login: "Sartu",
      busy: "Momentu bat…",
    },
    forgotPassword: "Pasahitza ahaztu duzu?",
    switchPrompt: {
      toLogin: "Kontua duzu jada? ",
      toRegister: "Ez duzu konturik? ",
    },
    switchCta: {
      toLogin: "Hasi saioa",
      toRegister: "Sortu zure kontu doakoa",
    },
    footNote: "Doakoa · Txartelik gabe · Zure DeCAak leku bakarrean",
    errors: {
      acceptTerms:
        "Baldintzak eta Erabilera Baldintzak eta Pribatutasun Politika onartu behar dituzu.",
      generic: "Ezin izan da osatu. Saiatu berriro.",
      noConnection: "Konexiorik gabe. Saiatu berriro.",
      googleFailed:
        "Ezin izan da Google bidezko sarrera osatu. Saiatu berriro edo erabili zure emaila eta pasahitza.",
    },
    invalidInvite: {
      title: "Gonbidapena ez da baliozkoa",
      body: "Gonbidapen-esteka hau iraungi da, jada erabili da edo ez da zuzena. Eskatu gonbidatu zintuenari berri bat bidaltzeko.",
      loginCta: "Kontua badut · Sartu",
      freeStartCta: "Hasi DeCA doako bat",
    },
    verify: {
      title: "Berretsi zure posta elektronikoa",
      sentPrefix: "Ia prest dago. Posta bat bidali dizugu",
      sentSuffix: "helbidera zure kontua aktibatzeko eta DeCAak igortzen hasteko.",
      failedPrefix: "Ezin izan dugu berrespen-posta bidali",
      failedSuffix: "helbidera. Sakatu «Bidali berriro» berriro saiatzeko.",
      whatNext: {
        title: "Zer gertatzen da ondoren",
        step1: "1. Zure posta berresten duzu",
        step2: "2. Zure kontura sartzen zara",
        step3: "3. DeCAak igortzen hasten zara",
      },
      openMail: "Ireki nire posta",
      resend: "Bidali berriro",
      resendSending: "Bidaltzen…",
      resendSent: "Posta berriro bidalita. Egiaztatu zure sarrera-ontzia.",
      resendError: "Ezin izan da berriro bidali. Saiatu berriro minutu batzuen buruan.",
      changeEmail: {
        open: "Aldatu posta elektronikoa",
        label: "Posta elektroniko berria",
        currentPasswordLabel: "Zure oraingo pasahitza",
        save: "Gorde eta bidali berriro",
        cancel: "Utzi",
        error: "Ezin izan da posta aldatu.",
      },
      continueChecking: "Egiaztatzen…",
      continueLabel: "Dagoeneko berretsi dut nire kontua",
      notYetVerified: "Zure posta oraindik ez dago egiaztatuta. Ireki bidali dizugun esteka.",
      spamHint: "Mezua aurkitzen ez baduzu, begiratu zabor-posta edo promozioen karpeta.",
    },
    verifyToken: {
      successHeading: "Posta berretsita",
      successBody: "Zure kontua aktibo dago. Dagoeneko DeCAak muga barik igorri ditzakezu.",
      successCtaAuthed: "Joan nire panelera",
      successCtaAnon: "Sartu",
      errorHeading: "Ezin izan dugu zure posta berretsi",
      errorInvalid: "Berrespen-esteka hau ez da baliozkoa.",
      errorUsed: "Esteka hau jada erabili da. Zure posta jada berretsita egon liteke.",
      errorExpired: "Berrespen-esteka iraungi da. Eskatu berri bat zure kontutik.",
      errorCtaAuthed: "Eskatu esteka berria",
      errorCtaAnon: "Sartu",
    },
  },
  panel: {
    verifyBanner: {
      text: (email: string) => `Oraindik ez duzu zure posta berretsi (${email}).`,
      cta: "Berretsi orain",
    },
    myCompanyFallback: "Nire enpresa",
    newDeca: "DeCA berria",
    duplicateLast: "Errepikatu / bikoiztu azken DeCA",
    lastDocuments: "Azken dokumentuak",
    viewAllHistory: "Ikusi historial osoa",
    noDocumentsYet: "Oraindik ez duzu dokumenturik.",
    createFirst: "Sortu zure lehen DeCA",
    detail: "Xehetasuna",
    duplicate: "Bikoiztu",
    pdf: "PDF",
    companiesCard: "Ohiko enpresak / garraiolariak",
    vehiclesCard: "Ohiko ibilgailuak",
    manageData: "Kudeatu ohiko datuak →",
    nav: {
      home: "Nire DeCAak",
      historico: "Historiala",
      plantillas: "Txantiloiak",
      datos: "Ohiko datuak",
      equipo: "Taldea",
      empresa: "Nire enpresa",
      ayuda: "Laguntza",
    },
    help: {
      title: "Laguntza eta arreta",
      intro:
        "Aukeratu behar duzun kanala. Laguntza teknikoa eta lege-laguntza zerbitzu desberdinak dira.",
      techHeading: "Laguntza teknikoa",
      techIntro: "Plataformarekin, DeCA sortzearekin edo zure kontuarekin gorabeherak izanez gero.",
      legalHeading: "Garraioko eta logistikako lege-laguntza",
      legalIntro:
        "Garraioan eta logistikan eskarmentua duten abokatuak: ikuskapenak, zehapenak, erreklamazioak, kontratu-gatazkak eta prozedura judizialak.",
      legalDisclaimer:
        "PRAETORIA, S.L.-k emandako zerbitzua. Ez du laguntza teknikoa ordezkatzen eta ez du emaitzarik bermatzen.",
      phoneLabel: "Telefonoa",
      emailLabel: "Laguntza-helbidea",
      whatsappTech: "WhatsApp · laguntza teknikoa",
      whatsappLegal: "WhatsApp · lege-laguntza",
      hoursLabel: "Arreta-ordutegia",
    },
    teamActivity: {
      heading: "Taldearen jarduera",
      invited: (actor: string) => `${actor}(e)k gonbidapena bidali du`,
      joined: (actor: string) => `${actor} taldera batu da`,
      roleChanged: (actor: string, target: string, role: string) =>
        `${actor}(e)k ${target}(r)en rola ${role} izatera aldatu du`,
      removed: (actor: string, target: string) => `${actor}(e)k ${target} taldetik kendu du`,
      roleLabel: {
        owner: "Administratzailea",
        member: "Operadorea",
        read_only: "Irakurtzeko soilik",
      },
    },
  },
  historico: {
    title: "Historiala",
    search: "Bilatu",
    searchPlaceholder: "Erreferentzia, enpresa, matrikula, jatorria edo helmuga",
    from: "Hemendik",
    to: "Hona",
    carrier: "Garraiolaria",
    carrierAll: "Guztiak",
    plate: "Matrikula",
    filter: "Iragazi",
    clear: "Garbitu",
    documentsCountOne: "dokumentu",
    documentsCountMany: "dokumentu",
    exportCsv: "Esportatu CSV",
    colDate: "Data",
    colRoute: "Karga → Deskarga",
    colShipper: "Bidaltzailea",
    colCarrier: "Garraiolaria",
    colPlate: "Matrikula",
    colStatus: "Egoera",
    colActions: "Ekintzak",
    statusActive: "Indarrean",
    statusCorrected: "Zuzenduta",
    statusUnavailable: "Ez dago eskuragarri",
    detail: "Xehetasuna",
    correct: "Zuzendu",
    duplicate: "Bikoiztu",
    pdf: "PDF",
    noResults: "Emaitzarik ez.",
    createOne: "Sortu DeCA bat",
  },
  crear: {
    previewHeading: "Horrela geratuko da zure DeCA",
    steps: [
      "Nork kontratatzen eta nork garraiatzen duen",
      "Karga eta deskarga",
      "Ibilgailua, salgaia eta berrikuspena",
    ],
    subheadLeadGate:
      "Bete datuak konpromisorik gabe — izena eta posta elektronikoa baino ez dizugu eskatuko amaieran, konturik sortu behar gabe.",
    correctionIntro:
      "DeCA zuzentzen. Bertsio berri bat sortuko da QR eta URL berriekin; aurreko bertsioa gordeko da.",
    stepOf: (current: number) => `${current}. urratsa 3tik ·`,
    stepOfAria: (current: number, label: string) => `${current}. urratsa 3tik: ${label}`,
    noConnection: "Konexiorik gabe. Egiaztatu zure sarea eta saiatu berriro.",
    templates: {
      legend: "Hasi txantiloi batetik",
      placeholder: "Aukeratu txantiloi bat…",
      hint: "Datuak berrikusi eta data jarri beharko duzu oraindik, sortu aurretik.",
    },
    useCompany: {
      shipper: "Nire enpresa da bidaltzailea",
      carrier: "Nire enpresa da garraiolaria",
    },
    useSame: {
      shipperIsCarrier: "Garraiolaria bidaltzaile bera da",
      carrierIsShipper: "Bidaltzailea garraiolari bera da",
    },
    legends: {
      shipper: "Bidaltzaile kontratugilea",
      carrier: "Garraiolari eragilea",
      loadLocation: "Karga-lekua",
      unloadLocation: "Deskarga-lekua",
      vehicleGoods: "Ibilgailua eta salgaia",
    },
    sectionHints: {
      shipper: "Nork kontratatu dizu garraio hau?",
      carrier: "Zein enpresak egiten du garraioa fisikoki?",
      loadLocation: "Non jasotzen da salgaia eta zein egunetan.",
      unloadLocation: "Non entregatzen da salgaia eta zein egunetan. Karga-egun bera izan daiteke.",
      vehicleGoods: "Garraioa egiten duen ibilgailua eta zer garraiatzen den.",
    },
    autofill: {
      company: "Bilatu edo hautatu ohiko enpresa",
      carrier: "Bilatu edo hautatu ohiko garraiolaria",
      location: "Bilatu edo hautatu ohiko lekua",
      vehicle: "Bilatu edo hautatu ibilgailua",
      newOption: "Sartu berri bat…",
    },
    fields: {
      name: "Izena edo sozietate-izena",
      nif: "IFZ / VAT",
      address: "Helbidea",
      locationName: "Enpresa edo establezimendua",
      locationAddress: "Helbide osoa",
      postalCode: "Posta-kodea",
      city: "Herria",
      province: "Probintzia",
      country: "Herrialdea",
      loadDate: "Karga-data",
      unloadDate: "Deskarga-data",
      goods: "Salgaiaren izaera",
      weight: "Pisua (edo bestelako neurria)",
      weightHint: "Adib.: 12000 kg, edo «plataforma oso bat» pisu zehatza determinatu ezin bada.",
      tractorPlate: "Traktorearen matrikula",
      trailerPlate: "Atoiaren / erdiatoiaren matrikula",
      trailerHint: "Atoirik ez badago, utzi hutsik.",
      reference: "Erreferentzia edo oharrak (aukerakoa)",
    },
    hints: {
      nifForeign: "Atzerriko IFZ/VAT bat erabil dezakezu.",
      unloadSameDay: "Karga-data berarekin bat etor daiteke.",
      plateForeign:
        "Ez dirudi Espainiako matrikula bat (1234 BCD formatua). Baliozkoa da ibilgailua atzerrikoa bada.",
    },
    errorSummaryTitle: "Berrikusi eremu hauek:",
    lead: {
      title: "Urrats bat besterik ez: nori bidaliko diogu DeCA?",
      body: "Zure izena eta posta elektronikoa, deskarga-esteka bidaltzeko baino ez. Konturik sortu gabe.",
      name: "Zure izena",
      email: "Zure posta elektronikoa",
      loginPrompt: "Kontua duzu jada? Sartu",
      loginPromptSuffix: "zure datu gordeak erabiltzeko.",
    },
    verifyGate: {
      title: "Berretsi zure posta DeCA sortzeko",
      body: "Zure datuak gordeta daude urrats honetan. Berretsi posta elektronikoz bidali dizugun esteka eta itzuli — zure dokumentua berehala sortuko dugu, ezer berriro idatzi gabe.",
      cta: "Joan nire posta berresteko",
    },
    repeatGate: {
      title: "Dagoeneko sortu duzu zure lehen DeCA",
      body: "Erregistratu doan hurrengoa sortzeko — zure datuak berrerabiltzen dituzu eta askoz azkarragoa da.",
      cta: "Sortu kontu doakoa",
      loginPrompt: "Kontua duzu jada? Sartu",
    },
    readOnlyGate: {
      title: "Zure rola irakurtzeko soilik da",
      body: "Zure enpresaren historiala eta dokumentuak ikus ditzakezu, baina ezin duzu DeCArik sortu edo zuzendu. Eskatu administratzaile bati zure rola aldatzeko behar baduzu.",
      cta: "Joan nire historialera",
    },
    correctionReason: "Zuzenketaren arrazoia",
    correctionReasonRequired: "Adierazi zuzenketaren arrazoia.",
    correctionSaveFailed: "Ezin izan da zuzenketa gorde.",
    checkingChallenge: "Egiaztatzen… momentu bat.",
    generationFailedFallback:
      "Ezin izan dugu dokumentua sortu. Zure datuak gordeta jarraitzen dute. Saiatu berriro segundo batzuen buruan.",
    generationFailedGeneric: "Ezin izan da DeCA sortu. Saiatu berriro.",
    generatingStatus: "Zure PDFa eta QR sortzen ari gara… ez itxi orri hau.",
    notGenerated: "Ez da DeCA sortu",
    correlationPrefix: "Kodea:",
    correlationSuffix: "— esan iezaguzu berriro gertatzen bada, akats zehatza aurkituko dugu.",
    retry: "Berriro saiatu sortzen",
    backToReview: "Itzuli datuak berrikustera",
    review: {
      heading: "Berrikusi sortu aurretik",
      subhead:
        "Hauek dira DeCAn eta PDFan agertuko diren datu zehatzak. Erabili «Editatu» zerbait zuzena ez bada.",
      edit: "Editatu",
      shipperTitle: "Garraioa kontratatzen duen enpresa",
      carrierTitle: "Garraioa egiten duen garraiolaria",
      loadTitle: "Karga-lekua eta -data",
      unloadTitle: "Deskarga-lekua eta -data",
      vehicleTitle: "Ibilgailua eta salgaia",
      name: "Izena edo sozietate-izena",
      nif: "IFZ / VAT",
      address: "Helbidea",
      locationName: "Enpresa / establezimendua",
      locationAddress: "Helbidea",
      postalCode: "Posta-kodea",
      city: "Herria",
      province: "Probintzia",
      country: "Herrialdea",
      loadDate: "Karga-data",
      unloadDate: "Deskarga-data",
      tractorPlate: "Traktorearen matrikula",
      trailerPlate: "Atoiaren matrikula",
      goods: "Salgaia",
      weight: "Pisua edo neurria",
      reference: "Erreferentzia",
    },
    buttons: {
      back: "Atzera",
      next: "Hurrengoa",
      generating: "Sortzen…",
      generate: "SORTU DECA",
      saveCorrection: "GORDE ZUZENKETA",
    },
    check: {
      title: "DeCA egiaztapena",
      ready: "Sortzeko prest",
      review: "Berrikusi datuak",
      missing: "Nahitaezko datuak falta dira",
      fix: "Zuzendu",
      disclaimer:
        "Egiaztatu nahitaezko datuak osatuta daudela sortu aurretik. Ez da garraioaren balidazio juridikoa.",
      items: {
        shipper: "Kontratuko kargatzailea identifikatuta",
        carrier: "Benetako garraiolaria identifikatuta",
        route: "Karga eta deskarga osatuta",
        dates: "Karga- eta deskarga-datak adierazita",
        goods: "Salgaia eta pisua edo neurria adierazita",
        tractor: "Traktorearen matrikula adierazita",
      },
    },
  },
  result: {
    heading: "DeCA sortuta",
    version: "Bertsioa",
    versionGenerated: (v: number, date: string) => `${v}. bertsioa · sortua ${date}`,
    documentData: "Dokumentuaren datuak",
    retentionNotice:
      "Dokumentua gutxienez urtebetez gordeta. URL publikoak PDFaren deskarga zuzena ahalbidetzen du erregistrorik gabe, indarrean dagoen ebazpenaren arabera.",
    createAnother: "Sortu beste DeCA bat",
    downloadPdf: "Ireki / deskargatu PDFa",
    sendToDriver: "Bidali gidariari",
    share: "Partekatu…",
    whatsapp: "Bidali WhatsAppez",
    driverEmailLabel: "Gidariaren posta elektronikoa",
    send: "Bidali",
    sent: "Bidalita.",
    emailFallback: "Posta bidezko bidalketa ez dago konfiguratuta. Zure posta-bezeroa irekitzen…",
    emailFailed: "Ezin izan da bidali. Erabili esteka edo WhatsApp.",
    emailNoConnection: "Konexiorik gabe.",
    copyLink: "Kopiatu esteka",
    linkCopied: "Esteka kopiatuta",
    print: "Inprimatu",
    checkQr: "Egiaztatu QR",
    qrLinkLabel: "Hau da PDFaren QRak daraman esteka:",
    openInspectionLink: "Ireki ikuskapen-esteka fitxa berri batean",
    verifyHint: "Benetako egiaztapenerako, eskaneatu QRa beste mugikor batekin.",
    save: "Gorde nire DeCAak kontu bat sortuz",
    saveHint:
      "Kontua sortzeak zure dokumentuak eta ohiko datuak gordetzen ditu. Ez da salmenta-formulario bat.",
    correctedReminder:
      "DeCA hau zuzendu da. Bidali gidariari oraingo bertsioa — aurrekoa historial gisa geratzen da eta bere URLtik eskuragarri jarraitzen du.",
    shareTitle: "Garraioaren DeCA",
    shareTextPrefix: "Garraioaren kontrol-dokumentua (DeCA):",
  },
  errors: {
    generic: "Zerbait ez da ondo joan. Saiatu berriro segundo batzuen buruan.",
    notFound: "Ez dugu orri hau aurkitu.",
  },
  legal: {
    roles: {
      shipper: "Bidaltzaile kontratugilea",
      carrier: "Garraiolari eragilea",
      shipperShort: "Bidaltzailea",
      carrierShort: "Garraiolaria",
    },
  },
  legalNotice: {
    notTranslated:
      "Dokumentu honek balio legala du soilik gaztelaniazko bertsioan. Hizkuntza honetarako itzulpena oraindik ez dago eskuragarri.",
  },
  emails: {
    verifySubject: (brand: string) => `Berretsi zure posta ${brand}-n`,
    verifyTextInitial: (brand: string, link: string) =>
      `Ia prest dago. Berretsi zure posta ${brand}-ko zure kontua aktibatzeko.\n\nIreki esteka hau (24 orduan iraungitzen da):\n${link}\n\nZu ez bazina izan, ez ikusi mezu hau.`,
    verifyTextResend: (brand: string, link: string) =>
      `Berretsi zure posta ${brand}-ko zure kontua aktibatzeko.\n\nIreki esteka hau (24 orduan iraungitzen da):\n${link}\n\nZu ez bazina izan, ez ikusi mezu hau.`,
    verifyTextChangeEmail: (brand: string, link: string) =>
      `Berretsi zure posta berria ${brand}-ko zure kontua aktibatzeko.\n\nIreki esteka hau (24 orduan iraungitzen da):\n${link}\n\nZu ez bazina izan, ez ikusi mezu hau.`,
    passwordResetSubject: (brand: string) => `Berreskuratu ${brand}(e)rako sarbidea`,
    passwordResetText: (brand: string, link: string) =>
      `${brand}(e)ko zure pasahitza berrezartzeko eskatu duzu.\n\nIreki esteka hau (1 orduan iraungitzen da):\n${link}\n\nZu ez bazina izan, ez ikusi mezu hau.`,
  },
} satisfies Messages;
