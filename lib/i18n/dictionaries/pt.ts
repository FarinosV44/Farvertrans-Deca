import { BRAND } from "@/lib/brand";
import type { Messages } from "./es";

/**
 * European Portuguese (pt-PT) string catalog, key-for-key with `es.ts`
 * (I18N #54). `satisfies Messages` pins this to the Spanish dictionary's
 * exact shape, so a key added to one and forgotten in the other is a type
 * error, not a silent blank string in prod. Legal pages (`/terminos`,
 * `/privacidad`, `/aviso-legal`) are NOT translated by this dictionary —
 * they render fixed Spanish JSX and stay that way in every locale until a
 * professional legal review exists (owner decision, see `docs/decisions.md`
 * D-072).
 */
export const pt = {
  common: {
    appName: BRAND.name,
    createCta: "CRIAR DECA GRÁTIS",
    headerCta: "Criar DeCA",
    loginCta: "Entrar",
    panelCta: "Ir para o meu painel",
    skipToContent: "Saltar para o conteúdo",
    /** #112 — "+N envíos" badge shared by every list surface (Historial,
     *  Inicio, buscador, panel admin) that shows one row per DeCA: the row
     *  itself always describes shipment 1; `extra` is the count BEYOND it. */
    shipmentsBadge: (extra: number) => (extra === 1 ? "+1 envio" : `+${extra} envios`),
  },
  nav: {
    howItWorks: "Como funciona",
    plans: "Planos",
    regulation: "Regulamentação",
    guides: "Guias",
    blog: "Blog",
    faq: "Perguntas",
  },
  language: {
    es: "Español",
    en: "English",
  },
  landing: {
    hero: {
      eyebrow: "Documento Eletrónico de Controlo",
      h1: "DeCA profissional, simples e pronto a trabalhar.",
      subhead:
        "Gere, gira, conserva e partilha os seus Documentos Eletrónicos de Controlo a partir de uma plataforma especializada em transporte.",
      proof:
        "Mercadorias · PDF + QR · Custódia digital · Histórico · Multiutilizador · Grátis durante a fase de lançamento",
      cta: "CRIAR DECA GRÁTIS",
      ctaSecondary: "ENTRAR",
      noCardNote: "Sem cartão · Sem limite de documentos durante a fase de lançamento.",
      launchBadge: "Grátis durante 2026 · Fase de lançamento",
    },
    trustRow: ["Sem registo para o seu primeiro DeCA", "PDF + QR", "Custódia digital", "Histórico"],
    stepsHeading: "Crie o seu DeCA em 3 passos",
    steps: [
      {
        title: "Introduza os dados",
        body: "Carregador, transportador, origem, destino, mercadoria e matrícula. Sem compromisso.",
      },
      {
        title: "Crie a sua conta e gere",
        body: "Registo gratuito em segundos — criamos o PDF nativo com QR e um URL único de download direto. Nada do que já escreveu se perde.",
      },
      {
        title: "Partilhe-o com o motorista",
        body: "Link, WhatsApp, e-mail ou cópia impressa. Pronto para inspeção.",
      },
    ],
    freeValueHeading: "Tudo incluído durante o lançamento.",
    freeValueSubhead:
      "Multiutilizador, histórico, custódia e reutilização de dados incluídos sem custo durante a fase de lançamento — funcionalidades que outras plataformas de DeCA cobram à parte.",
    freeValueComingSoon: "Brevemente",
    integrationsCard: {
      heading: "API e integrações ERP/TMS",
      body: "Estamos a preparar integrações para empresas que precisam de ligar o DeCA Profesional aos seus sistemas. São um serviço adicional, sujeito a avaliação técnica e orçamento consoante o projeto; não estão incluídas no preço da subscrição.",
      cta: "Tenho interesse na integração",
    },
    plans: {
      eyebrow: "PLANOS 2027",
      heading: "Um plano para cada volume de trabalho.",
      subhead:
        "O DeCA Profesional é gratuito até 31 de dezembro de 2026. A partir de janeiro poderá escolher o plano que melhor se adapta à sua empresa.",
      launchBadge: "Grátis até 31/12/2026",
      reassurance:
        "Não precisa de escolher nenhum plano agora. Durante o lançamento pode continuar a utilizar o DeCA Profesional gratuitamente.",
      authedNote: "A sua conta continua gratuita durante o lançamento.",
      amountSuffix: "€/mês",
      terms: "IVA não incluído · Faturação mensal · Sem fidelização",
      footnote:
        "Os limites e funcionalidades indicados correspondem aos planos previstos para 2027. Até lá, as contas do período de lançamento mantêm o seu acesso atual.",
      recommendedLabel: "Recomendado",
      comingSoonLabel: "Brevemente",
      extraCostLabel: "+ custo adicional",
      decaPerMonthLabel: "DeCA / mês",
      usersLabel: "utilizadores",
      guestCta: "Começar grátis",
      apiDisclaimer:
        "API e integrações ERP/TMS sujeitas a disponibilidade técnica e compatibilidade com o sistema do cliente. Não estão incluídas no preço da subscrição: são orçamentadas de acordo com as necessidades e a complexidade de cada integração.",
      tiers: [
        {
          name: "Starter",
          target: "Trabalhadores independentes e pequenas empresas de transporte.",
          tagline: "Tudo o que é necessário para trabalhar com o DeCA sem complicações.",
          inherits: "",
          features: [
            { label: "Geração de DeCA", soon: false },
            { label: "PDF nativo + QR", soon: false },
            { label: "URL pública de verificação", soon: false },
            { label: "Histórico", soon: false },
            { label: "Custódia digital", soon: false },
            { label: "Empresas habituais", soon: false },
            { label: "Veículos guardados", soon: false },
            { label: "Locais habituais", soon: false },
            { label: "Duplicação rápida", soon: false },
            { label: "Rotas frequentes", soon: false },
            { label: "Favoritos", soon: false },
            { label: "Rascunhos automáticos", soon: false },
            { label: "Modo de inspeção", soon: false },
            { label: "Suporte por e-mail", soon: false },
            { label: "Conservação documental 1 ano", soon: false },
          ],
        },
        {
          name: "Professional",
          target: "PME, agências de transporte e equipas com maior atividade.",
          tagline: "Para equipas que gerem mais tráfego e precisam de trabalhar mais depressa.",
          inherits: "Tudo o que está incluído no Starter, mais:",
          features: [
            { label: "Exportação do histórico para CSV", soon: false },
            { label: "Pesquisa avançada no histórico", soon: false },
            { label: "Vistas guardadas no histórico", soon: false },
            { label: "Acessos rápidos personalizados no Início", soon: false },
            { label: "Conservação documental 2 anos", soon: false },
            { label: "Suporte prioritário por e-mail", soon: false },
          ],
        },
        {
          name: "Business",
          target: "Agências, operadores e grupos empresariais de maior dimensão.",
          tagline: "Para empresas com maior volume e integração com os seus sistemas.",
          inherits: "Tudo o que está incluído no Professional, mais:",
          features: [
            { label: "API", soon: true, extraCost: true },
            { label: "Integrações ERP / TMS", soon: true, extraCost: true },
            { label: "Onboarding técnico de integração", soon: true, extraCost: true },
            { label: "Suporte técnico prioritário", soon: false },
            { label: "Suporte telefónico", soon: false },
            { label: "Maior volume e capacidade multiutilizador", soon: false },
          ],
        },
      ],
    },
    freeValueItems: [
      { label: "Gerar DeCA" },
      { label: "PDF nativo + QR" },
      { label: "Histórico" },
      { label: "Custódia digital" },
      { label: "Multiutilizador" },
      { label: "Empresas habituais" },
      { label: "Veículos guardados" },
      { label: "Locais habituais" },
      { label: "Duplicação rápida" },
      { label: "Rotas frequentes" },
      { label: "Favoritos" },
      { label: "Rascunhos automáticos" },
      { label: "Modo de inspeção" },
    ],
    productHeading: "Do formulário ao PDF com QR, sem passos a mais",
    benefits: [
      {
        title: "Grátis",
        body: "Sem limite de DeCA durante a fase de lançamento de 2026. Sem cartão. A partir de 2027, mediante subscrição.",
      },
      {
        title: "Rápido",
        body: "Reutilize os seus dados habituais e duplique documentos anteriores num toque.",
      },
      {
        title: "Preparado para inspeção",
        body: "PDF nativo, QR e URL HTTPS direto, em conformidade com a resolução em vigor.",
      },
    ],
    personasHeading: "Feito para quem movimenta mercadoria",
    personas: [
      {
        title: "Transportador independente",
        jobToBeDone: "Gere o DeCA em minutos e leve-o no telemóvel.",
        benefits: [
          "Registo gratuito em segundos",
          "Empresa e veículo guardados após o registo",
          "Duplicação rápida do último documento",
          "Envio ao motorista num toque",
        ],
      },
      {
        title: "Empresa de transporte",
        jobToBeDone: "Um único espaço para todos os seus operadores e documentos.",
        benefits: [
          "Vários utilizadores na mesma empresa",
          "Histórico partilhado",
          "Carregadores, veículos e moradas guardados",
          "Auditoria de quem criou ou corrigiu cada DeCA",
        ],
      },
      {
        title: "Agência / operador de transporte",
        jobToBeDone: "Gere o documento como carregador contratual sem depender de terceiros.",
        benefits: [
          "Várias empresas e transportadores",
          "Contrapartes reutilizáveis",
          "Duplicação rápida",
          "Espaço de trabalho para a equipa",
        ],
      },
      {
        title: "Carregador / expedidor",
        jobToBeDone: "Gere, conserve e partilhe os seus DeCA a partir de um único sítio.",
        benefits: [
          "Transportadores habituais guardados",
          "Histórico de documentos",
          "Percurso de inspeção direto por QR/PDF",
          "Sem montar um novo processo no seu ERP",
        ],
      },
    ],
    personaCtaPrefix: "Como funciona para",
    dailyUseHeading: "Cada DeCA custa-lhe menos tempo do que o anterior.",
    dailyUseSubhead: "Guarde uma vez. Reutilize sempre.",
    dailyUseFooter:
      "Comece a preencher o seu DeCA sem compromisso; só pedimos para criar uma conta gratuita no final, para o gerar.",
    dailyUseFooterLink: "a sua empresa",
    dailyUseFooterAfterLink: "guarda tudo isto para que o próximo DeCA seja questão de segundos.",
    dailyUse: [
      { label: "Gerar DeCA", body: "Formulário guiado em 3 passos." },
      { label: "PDF + QR", body: "Documento nativo com QR de verificação." },
      { label: "Histórico", body: "Todos os seus documentos, sempre à mão." },
      { label: "Duplicar", body: "Repita um DeCA anterior em segundos." },
      { label: "Veículos guardados", body: "Trator e reboque num clique." },
      {
        label: "Empresas habituais",
        body: "Carregadores e transportadores reutilizáveis.",
      },
      { label: "Locais habituais", body: "Carga e descarga prontos a escolher." },
      {
        label: "Custódia digital",
        body: "Conservação em conformidade com a regulamentação em vigor.",
      },
    ],
    regulationHeading: "O que exige a regulamentação",
    legalPoints: [
      "Obrigatório a partir de 5 de outubro de 2026 para o transporte interno de mercadorias por estrada.",
      "O ficheiro é um PDF nativo digital, gerado a partir de dados estruturados — uma digitalização não é válida.",
      "Tamanho máximo de 5 MB.",
      "Inclui um código QR com um URL único que começa por https://",
      "O URL permite o download direto do PDF, sem registo e sem palavra-passe.",
      "Regista-se a data e hora de criação e de qualquer modificação.",
      "Conservação mínima de 1 ano por parte do carregador e do transportador.",
    ],
    legalSourceLabel: "Fonte:",
    operatorTrustHeading: "Quem está por detrás do serviço",
    faqHeading: "Perguntas frequentes",
    faqGroups: [
      {
        heading: "Regulamentação e obrigação",
        items: [
          {
            q: "O que é o DeCA?",
            a: "O Documento Eletrónico de Controlo Administrativo é a versão digital obrigatória do documento de controlo do transporte de mercadorias por estrada. Substitui o documento em papel.",
          },
          {
            q: "Quando é obrigatório?",
            a: "Desde 5 de outubro de 2026 para o transporte interno, sem prorrogação nem período transitório: o DeCA deve ser gerado em formato eletrónico desde a origem. O motorista pode levá-lo em cópia eletrónica no telemóvel ou em cópia impressa com o código QR; um documento criado originalmente em papel e depois digitalizado não é um DeCA eletrónico válido.",
          },
          {
            q: "Quem tem de o emitir?",
            a: "O carregador contratual e o transportador efetivo do transporte público de mercadorias por estrada, nos termos da regulamentação aplicável.",
          },
          {
            q: "É obrigatório para agências de transporte?",
            a: "Sim, quando atuam como carregador contratual ou operador que contrata o transporte, com as mesmas obrigações de geração e conservação.",
          },
        ],
      },
      {
        heading: "O documento",
        items: [
          {
            q: "Serve um PDF digitalizado?",
            a: "Não. O ficheiro deve ser um PDF nativo digital gerado a partir de dados estruturados. Uma digitalização ou uma imagem digitalizada não é válida.",
          },
          {
            q: "Tem de ser assinado?",
            a: "A resolução não exige assinatura eletrónica. Exige, sim, PDF nativo, QR, URL HTTPS de download direto e registo de criação e modificações.",
          },
          {
            q: "Que dados deve conter?",
            a: "No mínimo: carregador contratual (nome ou denominação social, NIF e morada), transportador efetivo (nome ou denominação social e NIF), local e data de carga, local e data de descarga, natureza e peso da mercadoria, e matrícula do veículo (trator e reboque, caso se trate de um conjunto articulado).",
          },
        ],
      },
      {
        heading: "Utilização e custo",
        items: [
          {
            q: "Como é que o motorista o transporta?",
            a: "Antes do início do serviço, em cópia eletrónica visível no telemóvel ou em cópia impressa, sempre com o QR disponível.",
          },
          {
            q: `O ${BRAND.name} é grátis?`,
            a: "Sim. Pode criar e descarregar documentos sem cartão e sem limite até 31 de dezembro de 2026. A partir de 2027, o DeCA Profesional funcionará mediante subscrição.",
          },
          {
            q: "Posso gerar todos os documentos que quiser?",
            a: "Sim. Não há limite mensal. Aplicamos apenas controlos automáticos contra usos abusivos que não afetam o uso normal nem a inspeção.",
          },
        ],
      },
    ],
    finalCtaHeading: "Comece agora. Sem cartão.",
    finalCtaSubhead:
      "Crie o seu DeCA, guarde os seus dados habituais e comece a trabalhar a partir de um único espaço.",
    finalCtaMicrocopy: "Grátis durante 2026 · Fase de lançamento · Sem cartão",
  },
  auth: {
    heading: {
      register: "Crie a sua conta grátis",
      login: "Bem-vindo de volta",
      joinTeam: "Junte-se à equipa",
      claim: "Guarde este DeCA",
    },
    subhead: {
      register:
        "Guarde os seus DeCA, reutilize os seus dados habituais e gere novos documentos mais depressa.",
      login:
        "Entre para ver os seus DeCA, reutilizar os seus dados e gerar novos documentos mais depressa.",
      joinTeamInvitedBy: (company: string) => `${company} convidou-o. `,
      joinTeamSuffix:
        "Crie o seu acesso e vai partilhar os DeCA e os dados habituais da empresa. Não é preciso registar outra empresa.",
      claim:
        "Crie uma conta gratuita para guardar este documento e reutilizar os seus dados. Não é um formulário comercial.",
    },
    orContinueWithEmail: "ou continue com e-mail",
    googleCta: "Continuar com o Google",
    emailLabel: "E-mail",
    passwordHint: "Mínimo de 12 carateres, com maiúsculas, minúsculas, números e um símbolo.",
    company: {
      legend: "A sua empresa",
      name: "Nome ou denominação social",
      nif: "NIF",
      contactName: "Pessoa de contacto",
      phone: "Telefone",
      email: "E-mail da empresa",
      address: "Morada",
      postalCode: "Código postal",
      city: "Cidade",
    },
    profile: {
      legend: "Como vai utilizar principalmente a plataforma?",
      items: {
        carrier_goods: {
          title: "Transportador de mercadorias",
          body: "Realiza o transporte de mercadorias por conta de outrem.",
        },
        shipper: {
          title: "Empresa carregadora",
          body: "Contrata transporte para os seus próprios envios de mercadorias.",
        },
        operator: {
          title: "Operador de transporte",
          body: "Organiza transportes de mercadorias (operador logístico ou agência).",
        },
        carrier_passengers: {
          title: "Transportador de passageiros",
          body: "Realiza transporte de passageiros por estrada.",
        },
      },
    },
    dataProtection: {
      title: "Informação básica sobre proteção de dados",
      responsible: "Responsável:",
      purpose: "Finalidade:",
      purposeBody: "gerir o registo e a prestação da Plataforma DeCA.",
      moreInfoPrefix: "Mais informação na nossa",
      privacyPolicy: "Política de Privacidade",
    },
    terms: {
      readPrefix: "Li a",
      privacyPolicy: "Política de Privacidade",
      andAccept: "e aceito os",
      termsAndConditions: "Termos e Condições",
    },
    /**
     * #84 registration opt-in, restyled as a compact product feature rather
     * than a legal clause (2026-09 request) — supersedes D-146 point 4's "no
     * 'opcional' label" only for THIS badge; every other #84 constraint holds:
     * unchecked by default, never names Farvertrans, no pressure. The deeper
     * explanation lives behind `moreInfo`/`moreInfoBody`, never open by default.
     */
    commercialOptIn: {
      brand: "DECA Conecta",
      tagline: "O seu destino pode ligá-lo à sua próxima carga.",
      label: "Avise-me se surgir uma oportunidade de carga compatível com as minhas rotas",
      hint: "Ao ativá-lo, autoriza a utilização do destino e da data dos seus transportes para receber propostas comerciais personalizadas. Não partilhamos o seu DeCA completo nem realizamos localização GPS. Pode alterar esta decisão quando quiser.",
      moreInfo: "Como funciona o DECA Conecta e que dados são utilizados",
      articleLink: "Descubra como funciona o DECA Conecta",
      info: {
        howTitle: "Como funciona?",
        howBody:
          "Quando gera um DeCA, a plataforma conhece o destino e a data prevista do transporte. Se autorizar, o DECA Conecta pode utilizar esses dados para identificar oportunidades de carga compatíveis e permitir que carregadores interessados lhe enviem uma proposta comercial personalizada.",
        matchTitle: "Dados utilizados para encontrar oportunidades",
        matchItems: [
          "Local de destino do camião.",
          "Data do transporte ou de disponibilidade prevista.",
        ],
        contactTitle: "Dados utilizados para o contactar",
        contactItems: ["Empresa ou nome autorizado.", "E-mail ou telefone que tenha autorizado."],
        neverTitle: "Não partilhamos",
        neverItems: [
          "O DeCA completo.",
          "A origem do transporte.",
          "A mercadoria nem o seu peso.",
          "A identidade do cliente do transporte.",
          "O preço nem as condições do serviço.",
          "Documentos associados.",
          "A localização GPS nem o acompanhamento em tempo real.",
        ],
        controlTitle: "Mantém o controlo",
        controlBody:
          "Receber uma proposta não obriga a aceitá-la. Pode desativar o DECA Conecta ou alterar as suas preferências quando quiser, sem perder o acesso ao gerador de DeCA.",
      },
    },
    submit: {
      register: "Criar conta grátis",
      login: "Entrar",
      busy: "Um momento…",
      /** D-204: shown on the register button specifically — more concrete
       *  than the generic `busy` so a slow response doesn't read as broken. */
      busyRegister: "A criar a sua conta…",
    },
    forgotPassword: "Esqueceu-se da palavra-passe?",
    switchPrompt: {
      toLogin: "Já tem conta? ",
      toRegister: "Não tem conta? ",
    },
    switchCta: {
      toLogin: "Iniciar sessão",
      toRegister: "Crie a sua conta grátis",
    },
    footNote: "Grátis durante 2026 · Sem cartão · Os seus DeCA num só lugar",
    errors: {
      acceptTerms: "Tem de aceitar os Termos e Condições e a Política de Privacidade.",
      generic: "Não foi possível concluir. Tente novamente.",
      noConnection: "Sem ligação. Tente novamente.",
      googleFailed:
        "Não foi possível concluir o acesso com o Google. Tente novamente ou utilize o seu e-mail e palavra-passe.",
    },
    invalidInvite: {
      title: "Convite inválido",
      body: "Este link de convite expirou, já foi utilizado ou não está correto. Peça a quem o convidou que lhe envie um novo.",
      loginCta: "Já tenho conta · Entrar",
      freeStartCta: "Começar um DeCA grátis",
    },
    verify: {
      title: "Confirme o seu e-mail",
      sentPrefix: "Já está quase. Enviámos-lhe um e-mail para",
      sentSuffix: "para ativar a sua conta e começar a emitir DeCA.",
      failedPrefix: "Não conseguimos enviar o e-mail de confirmação para",
      failedSuffix: "Clique em «Reenviar e-mail» para tentar novamente.",
      whatNext: {
        title: "O que acontece a seguir",
        step1: "1. Confirma o seu e-mail",
        step2: "2. Acede à sua conta",
        step3: "3. Começa a emitir DeCA",
      },
      openMail: "Abrir o meu e-mail",
      resend: "Reenviar e-mail",
      resendSending: "A enviar…",
      resendSent: "E-mail reenviado. Verifique a sua caixa de entrada.",
      resendError: "Não foi possível reenviar. Tente novamente dentro de alguns minutos.",
      changeEmail: {
        open: "Alterar e-mail",
        label: "Novo e-mail",
        currentPasswordLabel: "A sua palavra-passe atual",
        save: "Guardar e reenviar",
        cancel: "Cancelar",
        error: "Não foi possível alterar o e-mail.",
      },
      continueChecking: "A verificar…",
      continueLabel: "Já confirmei a minha conta",
      notYetVerified: "O seu e-mail ainda não está verificado. Abra o link que lhe enviámos.",
      spamHint: "Se não encontrar a mensagem, verifique a pasta de spam ou promoções.",
    },
    verifyToken: {
      successHeading: "E-mail confirmado",
      successBody: "A sua conta está ativa. Já pode emitir DeCA sem limites.",
      successCtaAuthed: "Ir para o meu painel",
      successCtaAnon: "Entrar",
      errorHeading: "Não conseguimos confirmar o seu e-mail",
      errorInvalid: "Este link de confirmação não é válido.",
      errorUsed: "Este link já foi utilizado. O seu e-mail já poderá estar confirmado.",
      errorExpired: "O link de confirmação expirou. Peça um novo a partir da sua conta.",
      errorCtaAuthed: "Pedir um novo link",
      errorCtaAnon: "Entrar",
    },
  },
  panel: {
    verifyBanner: {
      text: (email: string) => `Ainda não confirmou o seu e-mail (${email}).`,
      cta: "Confirmar agora",
    },
    myCompanyFallback: "A minha empresa",
    newDeca: "Novo DeCA",
    duplicateLast: "Repetir / duplicar último DeCA",
    lastDocuments: "Últimos documentos",
    viewAllHistory: "Ver todo o histórico",
    noDocumentsYet: "Ainda não tem documentos.",
    draft: {
      title: "Rascunho pendente",
      edited: (s: string) => `editado ${s}`,
      continue: "Continuar",
      discard: "Descartar",
      confirm: "Descartar este rascunho? Não afeta nenhum documento gerado.",
    },
    createFirst: "Crie o seu primeiro DeCA",
    detail: "Detalhe",
    duplicate: "Duplicar",
    pdf: "PDF",
    companiesCard: "Empresas / transportadores habituais",
    vehiclesCard: "Veículos habituais",
    manageData: "Gerir dados habituais →",
    nav: {
      home: "Os meus DeCA",
      historico: "Histórico",
      plantillas: "Modelos",
      datos: "Dados habituais",
      equipo: "Equipa",
      empresa: "A minha empresa",
      privacidad: "Privacidade",
      ayuda: "Ajuda",
    },
    /** #93 — up to three per-user quick accesses on Inicio. */
    quickActions: {
      title: "Acessos rápidos",
      customise: "Personalizar",
      save: "Guardar",
      cancel: "Cancelar",
      restore: "Restaurar predefinições",
      hint: (max: number) => `Escolha até ${max} acessos a funções que já utiliza.`,
      limit: (max: number) => `Escolheu o máximo de ${max} acessos. Desmarque um para o alterar.`,
      options: {
        crear: "Novo DeCA",
        historico: "Histórico",
        plantillas: "Modelos",
        empresas: "Empresas habituais",
        vehiculos: "Veículos",
        lugares: "Locais de carga/descarga",
        rutas: "Rotas habituais",
        equipo: "Equipa",
        empresa: "A minha empresa",
        ayuda: "Ajuda",
      },
    },
    privacy: {
      title: "Privacidade",
      intro:
        "O DECA Conecta permite-lhe receber oportunidades de carga com base no destino e na data dos seus transportes. É um serviço opcional: não o ativar não afeta a criação, gestão ou conservação dos seus DeCA nem o uso gratuito da plataforma.",
      freeUseNote:
        "Recusar ou retirar o consentimento não afeta em nada o uso gratuito do DeCA Profesional.",
      tagline: "O seu destino pode ligá-lo à sua próxima carga.",
      supporting:
        "É você quem decide se o DeCA Profesional pode comunicar determinados dados de disponibilidade a carregadores interessados em enviar-lhe propostas comerciais personalizadas e preferenciais de carga. Pode alterar esta decisão quando quiser.",
      articleLink: "Descubra como funciona o DECA Conecta",
      sectionTitle: "DECA Conecta",
      modeLegend: "Quando quer ativar o DECA Conecta?",
      modes: {
        none: "Não partilhar em nenhum transporte",
        noneHint: "Nenhum dado comercial sai dos seus DeCA. É a opção predefinida.",
        perDeca: "Perguntar-me em cada DeCA",
        perDecaHint:
          "Decide transporte a transporte ao criar cada DeCA. A opção aparecerá desativada por defeito.",
        all: "Partilhar em todos os transportes, salvo se desativar",
        allHint:
          "A disponibilidade será preparada para cada novo DeCA. Poderá desativá-la em qualquer transporte concreto antes de o emitir.",
      },
      disclosureTitle: "Que dados são utilizados e quem os pode receber",
      disclosure: {
        howTitle: "Como funciona?",
        howBody:
          "Quando gera um DeCA, a plataforma conhece o destino e a data prevista do transporte. Se autorizar, o DECA Conecta pode utilizar esses dados para identificar oportunidades de carga compatíveis e permitir que carregadores interessados lhe enviem uma proposta comercial personalizada.",
        matchTitle: "Dados utilizados para encontrar oportunidades",
        matchItems: [
          "Local de destino do camião.",
          "Data do transporte ou de disponibilidade prevista.",
        ],
        contactTitle: "Dados utilizados para o contactar",
        contactItems: ["Empresa ou nome autorizado.", "E-mail ou telefone que tenha autorizado."],
        neverTitle: "Não partilhamos",
        neverItems: [
          "O DeCA completo.",
          "A origem do transporte.",
          "A mercadoria nem o seu peso.",
          "A identidade do cliente do transporte.",
          "O preço nem as condições do serviço.",
          "Documentos associados.",
          "A localização GPS nem o acompanhamento em tempo real.",
        ],
        recipients:
          "Destinatários: carregadores interessados em oferecer uma proposta comercial personalizada e preferencial de carga.",
        purpose:
          "Finalidade: identificar oportunidades de carga compatíveis com o destino e a data previstos e permitir que o transportador receba a correspondente proposta comercial.",
        revocation:
          "Revogação: o utilizador pode alterar a preferência para usos futuros a qualquer momento. Revogar o consentimento não elimina nem invalida os DeCA já gerados.",
      },
      channelLegend: "Canal de contacto autorizado",
      channels: { email: "E-mail", phone: "WhatsApp", both: "E-mail e WhatsApp" },
      channelEmailLabel: "E-mail para propostas",
      channelPhoneLabel: "WhatsApp para propostas",
      previewTitle: "Dados que serão partilhados",
      previewFields: {
        carrierName: "Empresa ou nome do transportador",
        destination: "Destino ou zona de disponibilidade do veículo",
        availabilityDate: "Data estimada de chegada ou disponibilidade",
        contactEmail: "E-mail autorizado",
        contactPhone: "WhatsApp autorizado",
      },
      previewNever:
        "Nunca se partilha a origem, o carregador, a morada de carga, a mercadoria, o preço, as matrículas, o motorista nem o documento, o URL ou o QR do DeCA.",
      acceptedAt: (s: string) => `Autorização registada em ${s}`,
      notAuthorized: "Sem autorização ativa",
      revoke: "Retirar autorização",
      revokeConfirm:
        "Retirar a autorização? Deixará de ser preparada a ficha de disponibilidade para os seus próximos transportes. Não afeta nenhum DeCA.",
      save: "Guardar",
      saved: "Preferência guardada.",
      error: "Não foi possível guardar a sua preferência.",
      ownerOnly: "Apenas o administrador da empresa pode alterar esta preferência.",
    },
    help: {
      title: "Ajuda e suporte",
      intro:
        "Escolha o canal de que precisa. O suporte técnico e a assistência jurídica são serviços distintos.",
      techHeading: "Suporte técnico",
      techIntro: "Para problemas com a plataforma, a geração do DeCA ou a sua conta.",
      legalHeading: "Assistência jurídica em transporte e logística",
      legalIntro:
        "Advogados com experiência em transporte e logística, úteis perante inspeções, sanções, reclamações, conflitos contratuais e processos judiciais.",
      legalDisclaimer:
        "Serviço prestado pela PRAETORIA, S.L. Não substitui o suporte técnico nem garante qualquer resultado.",
      phoneLabel: "Telefone",
      emailLabel: "E-mail de suporte",
      whatsappTech: "WhatsApp · suporte técnico",
      whatsappLegal: "Fale com um advogado pelo WhatsApp",
      hoursLabel: "Horário de atendimento",
      openHeading: "Abrir uma ocorrência técnica",
      openIntro:
        "Conte-nos o que se passa e vamos analisar. Vai receber a resposta por e-mail e também aqui.",
      category: "Categoria",
      subject: "Assunto",
      message: "Descrição",
      send: "Enviar ocorrência",
      sending: "A enviar…",
      sent: "Ocorrência enviada. Responderemos assim que possível.",
      myHeading: "As minhas ocorrências",
      none: "Não tem ocorrências abertas.",
      noneHint: "Quando abrir uma ocorrência, poderá consultar aqui o seu estado e as respostas.",
      guidesPrompt: "Procura instruções de utilização? Consulte os nossos",
      guidesLink: "Guias",
      view: "Ver",
      replyLabel: "A sua resposta",
      replyPlaceholder: "Escreva a sua resposta…",
      replySend: "Enviar resposta",
      you: "Você",
      team: "Suporte",
      opened: (d: string) => `Aberta em ${d}`,
      statuses: {
        new: "Nova",
        in_review: "Em análise",
        awaiting_user: "Pendente da sua resposta",
        resolved: "Resolvida",
        closed: "Fechada",
      },
      categories: {
        generacion: "Geração de DeCA",
        cuenta: "Conta e acesso",
        empresa_equipo: "Empresa e equipa",
        documento: "Um documento específico",
        otro: "Outro",
      },
    },
    teamActivity: {
      heading: "Atividade da equipa",
      invited: (actor: string) => `${actor} enviou um convite`,
      joined: (actor: string) => `${actor} juntou-se à equipa`,
      roleChanged: (actor: string, target: string, role: string) =>
        `${actor} alterou o cargo de ${target} para ${role}`,
      removed: (actor: string, target: string) => `${actor} removeu ${target} da equipa`,
      roleLabel: { owner: "Administrador", member: "Operador", read_only: "Só leitura" },
    },
  },
  historico: {
    title: "Histórico",
    search: "Pesquisar",
    searchPlaceholder: "Referência, empresa, matrícula, origem ou destino",
    from: "De",
    to: "Até",
    carrier: "Transportador",
    carrierAll: "Todos",
    plate: "Matrícula",
    filter: "Filtrar",
    clear: "Limpar",
    /** #92 — saved views over the filters this page already has. */
    views: {
      myViews: "As minhas vistas",
      save: "Guardar vista",
      namePrompt: "Nome da vista (por exemplo: França, Esta semana, Valência → Lyon)",
      rename: "Renomear",
      remove: "Eliminar",
      removeConfirm: (name: string) => `Eliminar a vista "${name}"?`,
      apply: "Aplicar vista",
      duplicate: "Já tem uma vista com esse nome.",
      limit: (max: number) => `Atingiu o máximo de ${max} vistas guardadas.`,
      error: "Não foi possível guardar a vista. Tente novamente.",
      /** The same five filter names this page already shows above the table. */
      filterLabels: {
        q: "Pesquisar",
        from: "De",
        to: "Até",
        carrier: "Transportador",
        plate: "Matrícula",
        none: "Sem filtros",
      },
    },
    documentsCountOne: "documento",
    documentsCountMany: "documentos",
    exportCsv: "Exportar CSV",
    colDate: "Data",
    colRoute: "Carga → Descarga",
    colShipper: "Carregador",
    colCarrier: "Transportador",
    colPlate: "Matrícula",
    colStatus: "Estado",
    colActions: "Ações",
    statusActive: "Vigente",
    statusCorrected: "Corrigida",
    statusUnavailable: "Não disponível",
    detail: "Ver detalhe",
    correct: "Corrigir",
    duplicate: "Duplicar",
    pdf: "PDF",
    inspection: "Inspeção",
    share: "Partilhar",
    moreActions: "Mais ações",
    noResults: "Sem resultados.",
    createOne: "Criar um DeCA",
    noResultsFiltered: "Não foram encontrados DeCA",
    noResultsFilteredHint: "Tente alterar os filtros ou remover algum critério de pesquisa.",
    clearFilters: "Limpar filtros",
  },
  crear: {
    previewHeading: "É assim que ficará o seu DeCA",
    steps: ["Quem contrata e quem transporta", "Carga e descarga", "Veículo, mercadoria e revisão"],
    subheadLeadGate:
      "Complete os dados sem compromisso — só lhe pediremos o nome e o e-mail no final, sem necessidade de criar uma conta.",
    correctionIntro:
      "A corrigir o DeCA. Será gerada uma nova versão com um QR e um URL novos; a versão anterior é conservada.",
    stepOf: (current: number) => `Passo ${current} de 3 ·`,
    stepOfAria: (current: number, label: string) => `Passo ${current} de 3: ${label}`,
    noConnection: "Sem ligação. Verifique a sua rede e tente novamente.",
    templates: {
      legend: "Começar a partir de um modelo",
      placeholder: "Escolha um modelo…",
      hint: "Ainda terá de rever os dados e indicar a data antes de gerar.",
    },
    useCompany: {
      shipper: "A minha empresa é o carregador",
      carrier: "A minha empresa é o transportador",
    },
    useSame: {
      shipperIsCarrier: "O transportador é o mesmo que o carregador",
      carrierIsShipper: "O carregador é o mesmo que o transportador",
    },
    legends: {
      shipper: "Carregador contratual",
      carrier: "Transportador efetivo",
      loadLocation: "Local de carga",
      unloadLocation: "Local de descarga",
      vehicleGoods: "Veículo e mercadoria",
    },
    sectionHints: {
      shipper: "Quem lhe contratou este transporte?",
      carrier: "Que empresa realiza fisicamente o transporte?",
      loadLocation: "Onde é recolhida a mercadoria e em que dia.",
      unloadLocation: "Onde é entregue a mercadoria e em que dia. Pode ser o mesmo dia da carga.",
      vehicleGoods: "O veículo que faz o transporte e o que é transportado.",
    },
    autofill: {
      company: "Procurar ou selecionar empresa habitual",
      carrier: "Procurar ou selecionar transportador habitual",
      location: "Procurar ou selecionar local habitual",
      vehicle: "Procurar ou selecionar veículo",
      shipment: "Procurar ou selecionar rota/envio habitual",
      newOption: "Introduzir um novo…",
    },
    fields: {
      name: "Nome ou denominação social",
      nif: "NIF / IVA",
      address: "Morada",
      locationName: "Empresa ou estabelecimento",
      locationAddress: "Morada completa",
      postalCode: "Código postal",
      city: "Cidade",
      province: "Província",
      country: "País",
      loadDate: "Data de carga",
      unloadDate: "Data de descarga",
      goods: "Natureza da mercadoria",
      weight: "Peso em kg (ou medida alternativa)",
      weightHint:
        "Ex.: 12000 (é acrescentado «kg» automaticamente), ou «uma plataforma completa» se o peso exato não for determinável.",
      tractorPlate: "Matrícula do trator",
      trailerPlate: "Matrícula do reboque / semirreboque",
      trailerHint: "Se não houver reboque, deixe em branco.",
      reference: "Referência ou notas (opcional)",
    },
    hints: {
      nifForeign: "Pode utilizar um NIF/IVA estrangeiro.",
      unloadSameDay: "Pode coincidir com a data de carga.",
      plateForeign:
        "Não parece uma matrícula espanhola (formato 1234 BCD). É válida se o veículo for estrangeiro.",
    },
    // #112 — vários envios (locais de carga/descarga) num mesmo DeCA.
    shipments: {
      addLoadAria: "Adicionar outro local de carga",
      addUnloadAria: "Adicionar outro local de descarga",
      duplicate: "Duplicar este envio",
      remove: "Eliminar este envio",
      heading: (n: number) => `Envio ${n}`,
      ownFieldsHint: "A origem, o destino, a mercadoria e o peso são próprios deste envio.",
      overridesHint: "A data e as notas utilizam os valores gerais, salvo se os alterar aqui.",
      recipient: "Destinatário (opcional)",
      notes: "Informação especial (opcional)",
      removeConfirm: (n: number) =>
        `O Envio ${n} já tem dados introduzidos. Tem a certeza de que quer eliminá-lo?`,
      orderNote:
        "A numeração dos envios é meramente identificativa e não determina a sua ordem de execução.",
      linkPanelHeading: "Vincular um local de carga e de descarga",
      linkPanelHint:
        "Quando há vários locais de carga e de descarga, indique qual combinação forma um envio real.",
      linkLoadLabel: "Origem",
      linkUnloadLabel: "Destino",
      linkPlaceholder: "Selecionar…",
      linkCreate: "Vincular",
    },
    errorSummaryTitle: "Reveja estes campos:",
    lead: {
      title: "Só mais um passo: para quem enviamos o DeCA?",
      body: "O seu nome e e-mail, apenas para lhe enviar o link de download. Sem criar conta.",
      name: "O seu nome",
      email: "O seu e-mail",
      loginPrompt: "Já tem conta? Entre",
      loginPromptSuffix: "para utilizar os seus dados guardados.",
    },
    verifyGate: {
      title: "Verifique o seu e-mail para gerar o DeCA",
      body: "Os seus dados estão guardados nesta etapa. Confirme o link que lhe enviámos por e-mail e volte — geramos o seu documento de imediato, sem voltar a escrever nada.",
      cta: "Ir verificar o meu e-mail",
    },
    repeatGate: {
      title: "Já criou o seu primeiro DeCA",
      body: "Registe-se gratuitamente para criar o seguinte — reutiliza os seus dados e é muito mais rápido.",
      cta: "Criar conta grátis",
      loginPrompt: "Já tem conta? Entre",
    },
    readOnlyGate: {
      title: "O seu perfil é apenas de leitura",
      body: "Pode ver o histórico e os documentos da sua empresa, mas não criar nem corrigir DeCA. Peça a um administrador que altere o seu perfil, se necessário.",
      cta: "Ir para o meu histórico",
    },
    correctionReason: "Motivo da correção",
    correctionReasonRequired: "Indique o motivo da correção.",
    correctionSaveFailed: "Não foi possível guardar a correção.",
    checkingChallenge: "A verificar… um momento.",
    generationFailedFallback:
      "Não conseguimos gerar o documento. Os seus dados continuam guardados. Tente novamente dentro de alguns segundos.",
    generationFailedGeneric: "Não foi possível gerar o DeCA. Tente novamente.",
    generatingStatus: "Estamos a gerar o seu PDF e QR… não feche esta página.",
    notGenerated: "O DeCA não foi gerado",
    correlationPrefix: "Código:",
    correlationSuffix: "— diga-nos se voltar a acontecer e localizaremos a falha exata.",
    retry: "Tentar gerar novamente",
    backToReview: "Voltar a rever os dados",
    review: {
      heading: "Reveja antes de gerar",
      subhead:
        "Estes são os dados exatos que aparecerão no DeCA e no PDF. Utilize «Editar» se algo não estiver correto.",
      edit: "Editar",
      shipperTitle: "Empresa que contrata o transporte",
      carrierTitle: "Transportador que realiza o transporte",
      loadTitle: "Local e data de carga",
      unloadTitle: "Local e data de descarga",
      vehicleTitle: "Veículo e mercadoria",
      totalWeightTitle: "Peso total",
      name: "Nome ou denominação social",
      nif: "NIF / IVA",
      address: "Morada",
      locationName: "Empresa / estabelecimento",
      locationAddress: "Morada",
      postalCode: "Código postal",
      city: "Cidade",
      province: "Província",
      country: "País",
      loadDate: "Data de carga",
      unloadDate: "Data de descarga",
      tractorPlate: "Matrícula do trator",
      trailerPlate: "Matrícula do reboque",
      goods: "Mercadoria",
      weight: "Peso ou medida",
      reference: "Referência",
      commercialShare: "Propostas de carga",
      commercialShareOn: "Sim — é preparada a ficha de disponibilidade",
      commercialShareOff: "Não",
    },
    commercialShare: {
      legend: "DECA Conecta (opcional)",
      hint: "Se quiser, autorize o envio dos dados mínimos de disponibilidade deste transporte para receber propostas personalizadas de carga. Não autorizar não afeta o uso gratuito do DeCA Profesional.",
      enable: "Quero receber ofertas personalizadas ao terminar este transporte",
      destination: "Zona de disponibilidade",
      destinationHint: "Local onde o veículo ficará livre após a descarga.",
      finalShipmentLabel: "Qual é a descarga final?",
      finalShipmentHint:
        "Apenas para calcular a disponibilidade comercial — não altera a ordem nem a numeração jurídica dos envios.",
      date: "Data estimada de disponibilidade",
      channel: "Canal de contacto",
      channels: { email: "E-mail", phone: "WhatsApp", both: "E-mail e WhatsApp" },
      preferredDestination: "Destino preferencial",
      preferredDestinationHint: "Para que cidade ou zona tem interesse em receber ofertas?",
      capacityLegend: "Disponibilidade de carga",
      capacityFull: "Camião completo",
      capacityFullHint: "O veículo ficará completamente disponível.",
      capacityPartial: "Grupagem",
      capacityPartialHint: "Só tem parte do espaço disponível.",
      linearMeters: "Metros lineares disponíveis",
      maxWeightKg: "Peso máximo disponível (kg)",
      vehicleTypeLegend: "Tipo de veículo",
      vehicleTypeLona: "Lona",
      vehicleTypeFrigorifico: "Frigorífico",
      privacyTitle: "A sua informação comercial mantém-se privada.",
      privacyBody:
        "O DECA Conecta reutiliza apenas do DeCA a zona e a data em que o veículo ficará disponível. Nunca partilha empresas, clientes, carregadores, destinatários, mercadoria, peso do DeCA, matrículas, preço, PDF, QR nem localização GPS.",
      privacyVoluntary:
        "O destino preferencial, o tipo de veículo e a capacidade disponível são dados que indica voluntariamente para receber ofertas compatíveis.",
      previewTitle: "Será enviado apenas:",
      manage: "Alterar a minha preferência geral em Privacidade",
    },
    buttons: {
      back: "Anterior",
      next: "Seguinte",
      generating: "A gerar…",
      generate: "GERAR DECA",
      saveCorrection: "GUARDAR CORREÇÃO",
    },
    check: {
      title: "Verificação do DeCA",
      ready: "Pronto para gerar",
      review: "Rever dados",
      missing: "Faltam dados obrigatórios",
      fix: "Corrigir",
      disclaimer:
        "Verifique se os dados obrigatórios estão completos antes de gerar. Não é uma validação jurídica do transporte.",
      items: {
        shipper: "Carregador contratual identificado",
        carrier: "Transportador efetivo identificado",
        route: "Carga e descarga completas",
        dates: "Datas de carga e descarga indicadas",
        goods: "Mercadoria e peso ou medida indicados",
        tractor: "Matrícula do trator indicada",
      },
    },
  },
  result: {
    heading: "DeCA gerado",
    version: "Versão",
    versionGenerated: (v: number, date: string) => `Versão ${v} · gerado ${date}`,
    documentData: "Dados do documento",
    retentionNotice:
      "Documento conservado durante, pelo menos, 1 ano. O URL público permite o download direto do PDF sem registo, em conformidade com a resolução em vigor.",
    createAnother: "Criar outro DeCA",
    downloadPdf: "Abrir / descarregar PDF",
    sendToDriver: "Enviar ao motorista",
    share: "Partilhar…",
    whatsapp: "Enviar por WhatsApp",
    driverEmailLabel: "E-mail do motorista",
    send: "Enviar",
    sent: "Enviado.",
    emailFallback: "O envio por e-mail não está configurado. A abrir o seu cliente de e-mail…",
    emailFailed: "Não foi possível enviar. Utilize o link ou o WhatsApp.",
    emailNoConnection: "Sem ligação.",
    copyLink: "Copiar link",
    linkCopied: "Link copiado",
    print: "Imprimir",
    checkQr: "Verificar QR",
    qrLinkLabel: "Este é o link contido no QR do PDF:",
    openInspectionLink: "Abrir o link de inspeção num novo separador",
    verifyHint: "Para a verificação real, digitalize o QR com outro telemóvel.",
    save: "Guardar os meus DeCA criando uma conta",
    saveHint:
      "Criar a conta guarda os seus documentos e os seus dados habituais. Não é um formulário comercial.",
    correctedReminder:
      "Este DeCA foi corrigido. Reenvie ao motorista a versão atual — a anterior fica no histórico e continua acessível pelo seu URL.",
    shareTitle: "DeCA do transporte",
    shareTextPrefix: "Documento de controlo (DeCA) do transporte:",
  },
  errors: {
    generic: "Algo correu mal. Tente novamente dentro de alguns segundos.",
    notFound: "Não encontrámos esta página.",
    incidentTitle: "Lamentamos",
    incidentMessage:
      "Ocorreu uma incidência temporária e o DeCA Profesional não está disponível neste momento. Tente novamente dentro de alguns minutos.",
    retry: "Tentar novamente",
    goHome: "Ir para o início",
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
      shipper: "Carregador contratual",
      carrier: "Transportador efetivo",
      shipperShort: "Carregador",
      carrierShort: "Transportador",
    },
  },
  legalNotice: {
    notTranslated:
      "Este documento só tem validade legal na sua versão em espanhol. Ainda não existe tradução disponível neste idioma.",
  },
  emails: {
    verifySubject: (brand: string) => `Confirme o seu e-mail em ${brand}`,
    verifyTextInitial: (brand: string, link: string) =>
      `Já está quase. Confirme o seu e-mail para ativar a sua conta ${brand}.\n\nAbra este link (expira em 24 horas):\n${link}\n\nSe não foi você, ignore esta mensagem.`,
    verifyTextResend: (brand: string, link: string) =>
      `Confirme o seu e-mail para ativar a sua conta ${brand}.\n\nAbra este link (expira em 24 horas):\n${link}\n\nSe não foi você, ignore esta mensagem.`,
    verifyTextChangeEmail: (brand: string, link: string) =>
      `Confirme o seu novo e-mail para ativar a sua conta ${brand}.\n\nAbra este link (expira em 24 horas):\n${link}\n\nSe não foi você, ignore esta mensagem.`,
    passwordResetSubject: (brand: string) => `Recupere o acesso a ${brand}`,
    passwordResetText: (brand: string, link: string) =>
      `Pediu para redefinir a sua palavra-passe ${brand}.\n\nAbra este link (expira em 1 hora):\n${link}\n\nSe não foi você, ignore esta mensagem.`,
  },
} satisfies Messages;
