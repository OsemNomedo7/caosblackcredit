export const DEFAULT_SITE_CONFIG = {
  brand: { name: 'CreditoFácil', tagline: 'Cartão para negativados' },

  cores: {
    // Identidade
    primaria:       '#820AD1',
    segundaria:     '#4b047d',
    // Globais
    background:     '#ffffff',
    textoTitulo:    '#111827',
    textoCorpo:     '#6b7280',
    textoDestaque:  '#820AD1',
    // Navbar
    navbarBg:       '#820AD1',
    navbarTexto:    '#ffffff',
    navbarBorda:    'rgba(130,10,209,0.8)',
    // Hero
    heroBg:         'transparent',
    // Benefícios
    beneficiosBg:   'transparent',
    cardBg:         'rgba(255,255,255,0.85)',
    cardBorda:      'rgba(130,10,209,0.12)',
    // Passos
    passosBg:       'transparent',
    // Depoimentos
    depoimentosBg:  'transparent',
    // Segurança
    segurancaBg:    'rgba(248,240,255,0.7)',
    // FAQ
    faqBg:          'transparent',
    // CTA final
    ctaBg:          'rgba(130,10,209,0.06)',
    ctaBorda:       'rgba(130,10,209,0.2)',
    // Footer
    footerBg:       '#ffffff',
    footerBorda:    '#e5e7eb',
    footerTexto:    '#6b7280',
    // Cartão de crédito
    cartaoCorInicio: '#820AD1',
    cartaoCorMeio:   '#4b047d',
    cartaoCorFim:    '#23023c',
  },

  banners: {
    hero:           '',   // URL da imagem de fundo do hero
    heroBgOpacity:  '0.15',
    navbar:         '',   // logo extra / banner navbar
    beneficios:     '',
    beneficiosBgOpacity: '0.12',
    passos:         '',
    passosBgOpacity: '0.12',
    depoimentos:    '',
    depoimentosBgOpacity: '0.12',
    seguranca:      '',
    segurancaBgOpacity: '0.12',
    faq:            '',
    faqBgOpacity:   '0.12',
    cta:            '',
    ctaBgOpacity:   '0.12',
    footer:         '',
    footerBgOpacity: '0.1',
  },

  hero: {
    titulo1:        'Cartão de crédito',
    titulo2:        'aprovado mesmo',
    titulo3:        'negativado',
    subtitulo:      'Limite de até ',
    limiteDestaque: 'R$ 2.000',
    subtituloFim:   ' sem consulta ao SPC/Serasa. Aprovação em minutos.',
    ctaPrincipal:   'Quero meu cartão agora',
    ctaSecundario:  'Ver como funciona',
    badgeAprovados: 'aprovados hoje',
    badgeSemConsulta: 'Sem consulta SPC',
    badgeAprovacao: 'Aprovação imediata',
  },

  beneficios: [
    { icon: '💳', titulo: 'Cartão físico Mastercard', desc: 'Aceito em todo o Brasil e no exterior' },
    { icon: '🚀', titulo: 'Aprovação em minutos', desc: 'Análise automatizada, sem burocracia' },
    { icon: '🔒', titulo: 'Sem consulta SPC/Serasa', desc: 'Negativados são bem-vindos aqui' },
    { icon: '💰', titulo: 'Até R$2.000 de limite', desc: 'Limite real para suas compras do dia a dia' },
    { icon: '📱', titulo: 'Controle pelo app', desc: 'Gerencie tudo pelo celular, 24h por dia' },
    { icon: '✨', titulo: 'Sem anuidade no 1º ano', desc: 'Sem surpresas na fatura do cartão' },
  ],

  passos: [
    { numero: '01', titulo: 'Escolha seu perfil', desc: 'Selecione se já é cliente ou se está negativado' },
    { numero: '02', titulo: 'Informe seus dados', desc: 'Apenas nome e CPF. Rápido e seguro.' },
    { numero: '03', titulo: 'Análise imediata', desc: 'Seu score é calculado em segundos' },
    { numero: '04', titulo: 'Receba seu cartão', desc: 'Pague a taxa e receba em casa em até 7 dias' },
  ],

  depoimentos: [
    { nome: 'Maria S.', texto: 'Estava negativada há 3 anos e consegui meu cartão em 10 minutos. Incrível!', nota: 5, cidade: 'São Paulo, SP' },
    { nome: 'João P.', texto: 'Tentei em vários lugares e fui recusado. Aqui foi aprovado na hora!', nota: 5, cidade: 'Rio de Janeiro, RJ' },
    { nome: 'Ana Lima', texto: 'Atendimento excelente e cartão chegou antes do prazo. Super recomendo!', nota: 5, cidade: 'Belo Horizonte, MG' },
  ],

  faq: [
    { pergunta: 'Posso solicitar mesmo com nome sujo?', resposta: 'Sim! Nossa análise é diferenciada e aprovamos mesmo com restrições no SPC/Serasa.' },
    { pergunta: 'Quanto tempo leva para receber o cartão?', resposta: 'Após a confirmação do pagamento da taxa de emissão, seu cartão chega em até 7 dias úteis.' },
    { pergunta: 'Qual é o limite do cartão?', resposta: 'O limite inicial é de até R$2.000, podendo ser aumentado conforme seu uso.' },
    { pergunta: 'Existe alguma taxa mensal?', resposta: 'Não cobramos anuidade no primeiro ano. Apenas a taxa de emissão e frete para envio do cartão.' },
    { pergunta: 'Como funciona a taxa de emissão?', resposta: 'A taxa cobre os custos de personalização, emissão e entrega do cartão físico em sua residência.' },
  ],

  rodape: {
    texto:    '© 2024 CreditoFácil. Todos os direitos reservados.',
    descricao: 'Serviço de intermediação financeira. Não somos uma instituição financeira.',
  },

  funil: {
    perfilTitulo:          'Qual é o seu perfil?',
    perfilSubtitulo:       'Selecione para personalizarmos a melhor oferta para você',
    formularioTitulo:      'Seus dados',
    formularioSubtitulo:   'Precisamos apenas do seu nome e CPF para a consulta',
    analiseTitulo:         'Analisando seu perfil',
    resultadoTitulo:       'Parabéns! Pré-aprovado!',
    emissaoTitulo:         'Emitir seu cartão',
    emissaoSubtitulo:      'Pague a taxa de emissão via PIX e receba em casa',
    confirmacaoTitulo:     'Pedido confirmado!',
    confirmacaoSubtitulo:  'Seu cartão está sendo preparado',
  },

  suporte: {
    whatsapp: '(11) 99999-9999',
    email:    'suporte@creditofacil.com',
    horario:  'Seg a Sex, 8h às 18h',
  },

  chat: {
    bemVindo:       'Olá! Sou a assistente virtual do CreditoFácil. Como posso te ajudar?',
    respostaPadrao: 'Entendo sua dúvida! Para mais informações, clique em "Quero meu cartão agora" e inicie sua análise.',
  },
};
