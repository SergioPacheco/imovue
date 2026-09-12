export const SITE_NAME = 'Imovue'
export const SITE_URL = 'https://imovue.com.br'
export const DEFAULT_IMAGE = `${SITE_URL}/og-logo.png`
export const SOCIAL_IMAGE = `${SITE_URL}/og-social.png`

export const UF_NOMES = Object.freeze({
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul', MT: 'Mato Grosso',
  PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco', PI: 'Piauí', PR: 'Paraná',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RO: 'Rondônia', RR: 'Roraima',
  RS: 'Rio Grande do Sul', SC: 'Santa Catarina', SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins',
})

const INSTITUTIONAL_SEO = {
  '/sobre': {
    title: 'Sobre o Imovue',
    description: 'Conheça o Imovue: plataforma independente de pesquisa e análise de imóveis da Caixa com desconto. Saiba como funciona e como podemos ajudar.',
    jsonLd: 'organization',
  },
  '/contato': {
    title: 'Contato',
    description: 'Entre em contato com o Imovue para reportar erros, sugerir melhorias ou esclarecer dúvidas sobre a plataforma.',
  },
  '/metodologia': {
    title: 'Metodologia — Como funciona o Score e o Radar Imovue',
    description: 'Entenda como o Imovue calcula o score de oportunidade, quais critérios são usados no radar e as limitações da análise automatizada.',
    jsonLd: 'faq',
  },
  '/fontes-dos-dados': {
    title: 'Fontes dos Dados',
    description: 'Saiba de onde vêm os dados do Imovue, como são atualizados, quais informações são calculadas e quais limitações existem.',
  },
  '/politica-editorial': {
    title: 'Política Editorial',
    description: 'Como o Imovue produz conteúdo, revisa dados, corrige erros e mantém independência editorial.',
  },
  '/termos': {
    title: 'Termos de Uso',
    description: 'Termos de uso do Imovue: natureza do serviço, limitações, responsabilidades e uso aceitável.',
    robots: 'noindex,follow',
  },
  '/privacidade': {
    title: 'Política de Privacidade',
    description: 'Política de privacidade do Imovue: dados coletados, cookies, Google Analytics, AdSense, seus direitos pela LGPD e como gerenciar preferências.',
    robots: 'noindex,follow',
  },
  '/aviso-legal': {
    title: 'Aviso Legal',
    description: 'Aviso legal do Imovue sobre a origem dos dados, análises automatizadas, responsabilidades e ausência de vínculo oficial com a CAIXA.',
  },
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Os dados da CAIXA costumam chegar em CAIXA ALTA. O texto continua sendo
// semanticamente o mesmo, mas a versão legível melhora title, snippet e H1
// do HTML prerenderizado.
export function displayName(value) {
  const text = String(value || '').trim().replace(/\s+/g, ' ')
  if (!text) return ''
  const lowercase = new Set(['a', 'as', 'ao', 'aos', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'na', 'nas', 'no', 'nos'])
  return text.split(' ').map((word, index) => {
    const clean = word.toLocaleLowerCase('pt-BR')
    if (index > 0 && lowercase.has(clean)) return clean
    return clean.charAt(0).toLocaleUpperCase('pt-BR') + clean.slice(1)
  }).join(' ')
}

export function canonicalPath(pathname) {
  const path = String(pathname || '/').split('?')[0] || '/'
  const normalized = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`
  return `${SITE_URL}${normalized}`
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('pt-BR')
}

export function formatCurrency(value, options = {}) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return ''
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
  })
}

export function formatPercent(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return ''
  return `${Math.round(Number(value))}%`
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_IMAGE,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contato@imovue.com.br',
      contactType: 'customer service',
    },
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Plataforma de pesquisa e análise de imóveis da CAIXA com desconto.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/imoveis?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : canonicalPath(item.url),
    })),
  }
}

export function webPageJsonLd({ name, description, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: url.startsWith('http') ? url : canonicalPath(url),
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  }
}

export function articleJsonLd({ title, description, url, datePublished, dateModified, author }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: url.startsWith('http') ? url : canonicalPath(url),
    datePublished,
    dateModified,
    author: { '@type': 'Organization', name: author || SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: DEFAULT_IMAGE } },
  }
}

export function faqJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

function seo({ title, description, path, robots = 'index,follow', ogType = 'website', ogImage = SOCIAL_IMAGE, ogTitle = '', ogDescription = '', ogImageAlt = 'Imovue — imóveis da CAIXA com desconto', jsonLd = [] }) {
  return { title, description, canonical: canonicalPath(path), robots, ogType, ogImage, ogTitle, ogDescription, ogImageAlt, jsonLd }
}

export function getHomeSeo() {
  return seo({
    title: 'Imóveis da CAIXA com Desconto',
    description: 'Encontre imóveis da CAIXA com desconto em todo o Brasil. Compare preços, cidades, descontos e oportunidades usando filtros, mapa e análise do Imovue.',
    path: '/',
    jsonLd: [organizationJsonLd(), websiteJsonLd()],
  })
}

export function getListagemSeo({ hasFilters = false } = {}) {
  return seo({
    title: 'Pesquisar imóveis da CAIXA com Desconto',
    description: 'Encontre imóveis da CAIXA com desconto. Filtre por estado, cidade, preço, desconto e modalidade.',
    path: '/imoveis',
    robots: hasFilters ? 'noindex,follow' : 'index,follow',
  })
}

export function getEstadoSeo({ uf, name, stats, cityCount }) {
  const discount = stats?.maxDiscount > 0 ? ` com descontos de até ${formatPercent(stats.maxDiscount)}` : ''
  const description = [
    `Encontre ${formatNumber(stats?.total)} imóveis da CAIXA em ${name}${discount}.`,
    cityCount ? `Veja preços, cidades e modalidades disponíveis no estado.` : 'Consulte os dados públicos disponíveis no estado.',
  ].join(' ')
  const path = `/estado/${String(uf).toLowerCase()}`
  const title = `Imóveis da CAIXA em ${name}${discount ? ` com Desconto` : ''}`
  return seo({
    title,
    description,
    path,
    jsonLd: [
      breadcrumbJsonLd([{ name: 'Início', url: '/' }, { name, url: path }]),
      webPageJsonLd({ name: title, description, url: path }),
    ],
  })
}

export function getCidadeSeo({ uf, stateName, city, count, minPrice, maxDiscount }) {
  const cityName = displayName(city)
  const path = `/estado/${String(uf).toLowerCase()}/${slugify(city)}`
  const discount = maxDiscount > 0 ? ` com descontos de até ${formatPercent(maxDiscount)}` : ''
  const details = [
    `${formatNumber(count)} imóveis da CAIXA em ${cityName}, ${String(uf).toUpperCase()}${discount}.`,
    minPrice > 0 ? `Preços a partir de ${formatCurrency(minPrice)}.` : '',
    'Consulte imóveis, modalidades e condições no Imovue.',
  ].filter(Boolean).join(' ')
  const title = `Imóveis da CAIXA em ${cityName}, ${String(uf).toUpperCase()}`
  return seo({
    title,
    description: details,
    path,
    robots: count >= 3 ? 'index,follow' : 'noindex,follow',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Início', url: '/' },
        { name: stateName, url: `/estado/${String(uf).toLowerCase()}` },
        { name: cityName, url: path },
      ]),
      webPageJsonLd({ name: title, description: details, url: path }),
    ],
  })
}

export function getImovelSeo(imovel) {
  const uf = String(imovel.uf || '').toUpperCase()
  const city = displayName(imovel.cidade || 'Brasil')
  const type = displayName(imovel.tipoImovel || 'Imóvel')
  const neighborhood = displayName(imovel.bairro)
  const discount = Number(imovel.percentualDesconto) > 0 && Number(imovel.percentualDesconto) <= 100
    ? formatPercent(imovel.percentualDesconto)
    : ''
  const valueSignal = discount ? ` — ${discount} de desconto` : imovel.precoVenda ? ` — ${formatCurrency(imovel.precoVenda)}` : ''
  // O número oficial faz parte do título para manter cada anúncio distinto,
  // inclusive quando vários imóveis compartilham endereço, preço e desconto.
  // O bairro permanece na descrição e no conteúdo da página, evitando titles
  // excessivamente longos para resultados de busca.
  const title = `${type} da CAIXA em ${city}, ${uf}${valueSignal} · ${imovel.numeroImovel}`
  const descriptionParts = [
    `${type} da CAIXA em ${city}/${uf}${neighborhood ? `, no bairro ${neighborhood}` : ''}. Imóvel nº ${imovel.numeroImovel}.`,
    imovel.precoVenda ? `Preço de ${formatCurrency(imovel.precoVenda)}.` : '',
    discount ? `${discount} de desconto.` : '',
    imovel.modalidadeVenda ? `Modalidade: ${imovel.modalidadeVenda}.` : '',
    imovel.financiamento === 'Sim' ? 'Aceita financiamento.' : '',
  ]
  const description = descriptionParts.filter(Boolean).join(' ')
  const socialTitle = `${type} da CAIXA em ${city}/${uf}${discount ? ` — ${discount} de desconto` : imovel.precoVenda ? ` — ${formatCurrency(imovel.precoVenda)}` : ''}`
  const socialDescription = [
    `Confira este ${type.toLocaleLowerCase('pt-BR')} da CAIXA em ${city}/${uf}${neighborhood ? `, no bairro ${neighborhood}` : ''}.`,
    imovel.precoVenda ? `Preço: ${formatCurrency(imovel.precoVenda)}.` : '',
    discount ? `${discount} de desconto.` : '',
    imovel.modalidadeVenda ? `${imovel.modalidadeVenda}.` : '',
    `Imóvel nº ${imovel.numeroImovel}. Veja detalhes e condições no Imovue.`,
  ].filter(Boolean).join(' ')
  const path = `/imovel/${imovel.numeroImovel}`
  const cityPath = `/estado/${uf.toLowerCase()}/${slugify(city)}`
  return seo({
    title,
    description,
    ogTitle: socialTitle,
    ogDescription: socialDescription,
    ogImageAlt: `${type} da CAIXA em ${city}, ${uf} — Imovue`,
    path,
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Início', url: '/' },
        { name: UF_NOMES[uf] || uf, url: `/estado/${uf.toLowerCase()}` },
        { name: city, url: cityPath },
        { name: `${type}${neighborhood ? ` — ${neighborhood}` : ''}`, url: path },
      ]),
      webPageJsonLd({ name: title, description, url: path }),
    ],
  })
}

export function getGuideSeo(article) {
  const path = `/guias/${article.slug}`
  const jsonLd = [
    articleJsonLd({
      title: article.title,
      description: article.description,
      url: path,
      datePublished: article.datePublished,
      dateModified: article.dateModified,
      author: article.author,
    }),
    breadcrumbJsonLd([
      { name: 'Início', url: '/' },
      { name: 'Guias', url: '/guias' },
      { name: article.title, url: path },
    ]),
  ]
  if (article.faq?.length) jsonLd.push(faqJsonLd(article.faq))
  return seo({ title: article.title, description: article.description, path, ogType: 'article', jsonLd })
}

export function getGuidesIndexSeo() {
  const title = 'Guias sobre imóveis da CAIXA: compra, riscos, documentação e descontos'
  const description = 'Central de aprendizado sobre imóveis da CAIXA com desconto. Guias completos sobre compra, venda direta, financiamento, FGTS, custos, documentação, riscos e análise de oportunidades.'
  return seo({
    title,
    description,
    path: '/guias',
    jsonLd: [
      breadcrumbJsonLd([{ name: 'Início', url: '/' }, { name: 'Guias', url: '/guias' }]),
      websiteJsonLd(),
    ],
  })
}

export function getInstitutionalSeo(path) {
  const config = INSTITUTIONAL_SEO[path]
  if (!config) return getNotFoundSeo(path)
  const jsonLd = []
  if (config.jsonLd === 'organization') jsonLd.push(organizationJsonLd())
  if (config.jsonLd === 'faq') {
    jsonLd.push(faqJsonLd([
      { question: 'Como funciona o Score Imovue?', answer: 'O Score é um indicador de 0 a 100 baseado em desconto, financiamento, modalidade, preço e características do imóvel. Não é recomendação de compra.' },
      { question: 'De onde vêm os dados?', answer: 'Dados extraídos semanalmente das listas públicas de venda de imóveis da Caixa Econômica Federal.' },
      { question: 'Com que frequência os dados são atualizados?', answer: 'Coleta semanal automatizada. Pode haver defasagem de até 7 dias.' },
    ]))
  }
  return seo({ ...config, path, jsonLd })
}

export function getNotFoundSeo(path = '/404') {
  return seo({
    title: 'Página não encontrada',
    description: 'A página que você procura não existe.',
    path,
    robots: 'noindex,follow',
  })
}
