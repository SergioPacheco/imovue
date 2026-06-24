export interface Article {
  slug: string
  title: string
  description: string
  category: string
  datePublished: string
  dateModified: string
  author: string
  related?: string[]  // slugs de artigos relacionados
  faq?: { question: string; answer: string }[]
}

export const articles: Article[] = [
  // === Comece por aqui ===
  {
    slug: 'como-comprar-imoveis-caixa',
    title: 'Como comprar imóvel da Caixa com desconto: guia passo a passo',
    description: 'Guia completo sobre o processo de compra de imóveis da Caixa Econômica Federal: modalidades, passo a passo, documentos e cuidados.',
    category: 'Comece por aqui',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['diferenca-leilao-licitacao-venda-online', 'erros-comuns-iniciantes', 'checklist-antes-de-comprar'],
    faq: [
      { question: 'Qualquer pessoa pode comprar imóvel da Caixa?', answer: 'Sim. Pessoas físicas maiores de 18 anos e pessoas jurídicas podem participar, desde que cumpram os requisitos do edital de cada imóvel.' },
      { question: 'Preciso de corretor para comprar imóvel da Caixa?', answer: 'Não é obrigatório, mas é recomendado ter assessoria jurídica. O processo é direto entre comprador e Caixa, sem intermediação de corretor.' },
      { question: 'Quanto tempo demora todo o processo de compra?', answer: 'Do lance/proposta até a escritura, geralmente entre 30 e 90 dias, dependendo da modalidade e se o imóvel está desocupado.' },
    ],
  },
  {
    slug: 'diferenca-leilao-licitacao-venda-online',
    title: 'Leilão, licitação aberta ou venda online da Caixa: qual a diferença?',
    description: 'Entenda as três modalidades de venda de imóveis da Caixa, suas diferenças, vantagens e riscos de cada uma.',
    category: 'Comece por aqui',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['como-comprar-imoveis-caixa', 'como-analisar-edital', 'documentos-necessarios'],
    faq: [
      { question: 'Qual modalidade tem imóveis mais baratos?', answer: 'A venda direta online costuma ter os menores preços, mas com menos opções. Leilões podem ter descontos maiores em imóveis com ocupação ou débitos.' },
      { question: 'Posso financiar em todas as modalidades?', answer: 'Não. Financiamento está disponível apenas em imóveis marcados como "aceita financiamento" — independente da modalidade.' },
    ],
  },
  {
    slug: 'erros-comuns-iniciantes',
    title: '10 erros comuns ao comprar imóvel da Caixa com desconto',
    description: 'Os 10 erros mais frequentes de quem compra o primeiro imóvel em leilão ou venda direta e como evitá-los.',
    category: 'Comece por aqui',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['checklist-antes-de-comprar', 'riscos-imovel-ocupado', 'como-analisar-edital'],
  },
  {
    slug: 'checklist-antes-de-comprar',
    title: 'Checklist completo antes de comprar imóvel da Caixa',
    description: 'Lista de verificação completa com todos os itens a conferir antes de dar um lance ou enviar proposta.',
    category: 'Comece por aqui',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['como-analisar-edital', 'como-consultar-matricula', 'custo-total-compra'],
  },
  {
    slug: 'vale-a-pena-comprar-imovel-caixa',
    title: 'Vale a pena comprar imóvel da Caixa? Análise honesta',
    description: 'Análise honesta sobre quando comprar imóvel retomado vale a pena e quando não compensa, com critérios objetivos e exemplos.',
    category: 'Comece por aqui',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['quando-desconto-50-nao-compensa', 'como-avaliar-liquidez-imovel', 'custo-total-compra'],
    faq: [
      { question: 'Imóvel da Caixa sempre é mais barato que o mercado?', answer: 'Nem sempre. O desconto é sobre a avaliação da Caixa, que pode estar desatualizada. Compare sempre com o preço real de mercado na região.' },
      { question: 'Preciso ter todo o dinheiro à vista?', answer: 'Não necessariamente. Alguns imóveis aceitam financiamento e FGTS. Mas a maioria exige pagamento à vista ou parcelamento direto com a Caixa.' },
    ],
  },

  // === Documentação ===
  {
    slug: 'como-analisar-edital',
    title: 'Como analisar edital de imóvel da Caixa antes de comprar',
    description: 'O que verificar no edital antes de dar um lance: cláusulas obrigatórias, prazos, condições e armadilhas comuns.',
    category: 'Documentação',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['como-consultar-matricula', 'documentos-necessarios', 'erros-comuns-iniciantes'],
    faq: [
      { question: 'O edital da Caixa é obrigatório?', answer: 'Sim. O edital define as regras da venda, prazos, pagamento, comissão, débitos e responsabilidades do comprador.' },
      { question: 'O que acontece se eu desistir depois de arrematar?', answer: 'Depende das regras do edital. Pode haver perda de caução, multa ou outras penalidades.' },
    ],
  },
  {
    slug: 'como-consultar-matricula',
    title: 'Como consultar a matrícula do imóvel no cartório',
    description: 'Para que serve a matrícula, como obtê-la, o que verificar e quais problemas ela pode revelar.',
    category: 'Documentação',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['como-analisar-edital', 'checklist-antes-de-comprar', 'riscos-imovel-ocupado'],
  },
  {
    slug: 'documentos-necessarios',
    title: 'Documentos necessários para comprar imóvel da Caixa',
    description: 'Lista completa de documentos exigidos para cada modalidade de compra: pessoa física e jurídica.',
    category: 'Documentação',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['como-comprar-imoveis-caixa', 'diferenca-leilao-licitacao-venda-online'],
  },

  // === Custos e Financiamento ===
  {
    slug: 'como-funciona-financiamento',
    title: 'Como funciona o financiamento de imóveis da Caixa',
    description: 'Quais imóveis aceitam financiamento, condições, taxas, prazos e como obter pré-aprovação de crédito.',
    category: 'Custos e Financiamento',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['como-utilizar-fgts', 'custo-total-compra', 'como-comprar-imoveis-caixa'],
  },
  {
    slug: 'como-utilizar-fgts',
    title: 'Como usar FGTS para comprar imóvel da Caixa',
    description: 'Regras para uso do FGTS em imóveis da Caixa: quem pode, requisitos, valor máximo e procedimentos.',
    category: 'Custos e Financiamento',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['como-funciona-financiamento', 'custo-total-compra'],
  },
  {
    slug: 'como-calcular-itbi-escritura-registro',
    title: 'ITBI, escritura e registro: como calcular os custos cartorários',
    description: 'Custos cartorários obrigatórios na compra de imóveis: alíquotas de ITBI por cidade, valores de escritura e registro.',
    category: 'Custos e Financiamento',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['custo-total-compra', 'debitos-condominio-iptu'],
  },
  {
    slug: 'custo-total-compra',
    title: 'Como calcular o custo total de um imóvel da Caixa',
    description: 'Planilha completa de custos: preço + ITBI + cartório + eventuais débitos + desocupação + reformas.',
    category: 'Custos e Financiamento',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['como-calcular-itbi-escritura-registro', 'debitos-condominio-iptu', 'quando-desconto-50-nao-compensa'],
  },
  {
    slug: 'debitos-condominio-iptu',
    title: 'Quem paga IPTU e condomínio atrasados do imóvel da Caixa?',
    description: 'Regras sobre responsabilidade por débitos de IPTU e condomínio em imóveis arrematados em leilão ou venda direta da Caixa.',
    category: 'Custos e Financiamento',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['custo-total-compra', 'riscos-imovel-ocupado', 'como-analisar-edital'],
    faq: [
      { question: 'O comprador herda todas as dívidas do imóvel?', answer: 'Depende. IPTU é responsabilidade do novo proprietário (dívida acompanha o imóvel). Condomínio também, mas em alguns editais a Caixa quita débitos anteriores.' },
      { question: 'Como saber quanto o imóvel deve de condomínio?', answer: 'Solicite uma certidão de débitos condominiais junto ao síndico ou administradora antes de fechar a compra.' },
    ],
  },

  // === Riscos ===
  {
    slug: 'riscos-imovel-ocupado',
    title: 'Riscos de comprar imóvel ocupado da Caixa: vale a pena?',
    description: 'O que significa imóvel ocupado, quanto custa a desocupação, prazos judiciais e como avaliar se o desconto compensa o risco.',
    category: 'Riscos',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['quando-desconto-50-nao-compensa', 'como-analisar-edital', 'erros-comuns-iniciantes'],
    faq: [
      { question: 'O que significa "imóvel ocupado"?', answer: 'Significa que há alguém morando no imóvel — pode ser o antigo proprietário, inquilino ou invasor. A desocupação é responsabilidade do comprador.' },
      { question: 'Quanto custa desocupar um imóvel judicialmente?', answer: 'Varia de R$ 5.000 a R$ 50.000 entre honorários advocatícios, custas judiciais e tempo. O prazo pode ser de 6 a 24 meses.' },
    ],
  },
  {
    slug: 'quando-desconto-50-nao-compensa',
    title: 'Quando o desconto de 50% da Caixa não é uma boa oportunidade',
    description: 'Por que descontos altos podem ser ilusão: avaliações infladas, custos ocultos e como calcular o desconto real.',
    category: 'Riscos',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['vale-a-pena-comprar-imovel-caixa', 'custo-total-compra', 'preco-por-metro-quadrado'],
    faq: [
      { question: 'O desconto da Caixa é real?', answer: 'O desconto é sobre o valor de avaliação da própria Caixa, que pode estar desatualizado ou inflado. Compare sempre com preços reais de mercado na região.' },
      { question: 'Como saber se o desconto compensa?', answer: 'Some o preço de venda + ITBI + cartório + débitos + reforma. Se o total ficar abaixo de 80% do preço de mercado de imóveis similares, provavelmente compensa.' },
    ],
  },

  // === Análise de Oportunidade ===
  {
    slug: 'preco-por-metro-quadrado',
    title: 'Como avaliar o preço por metro quadrado de imóvel da Caixa',
    description: 'Como calcular e comparar o preço/m² com a região, identificar oportunidades reais e evitar avaliações infladas.',
    category: 'Análise',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['quando-desconto-50-nao-compensa', 'como-avaliar-liquidez-imovel', 'rentabilidade-aluguel'],
  },
  {
    slug: 'rentabilidade-aluguel',
    title: 'Como estimar a rentabilidade de aluguel de imóvel da Caixa',
    description: 'Cálculo de yield bruto e líquido, comparação com renda fixa e critérios para avaliar imóvel como investimento.',
    category: 'Análise',
    datePublished: '2026-06-01',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['como-avaliar-liquidez-imovel', 'preco-por-metro-quadrado', 'vale-a-pena-comprar-imovel-caixa'],
  },
  {
    slug: 'como-avaliar-liquidez-imovel',
    title: 'Como avaliar a liquidez de um imóvel antes de comprar',
    description: 'Fatores que determinam se você vai conseguir vender ou alugar o imóvel depois: localização, perfil, demanda e preço.',
    category: 'Análise',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['rentabilidade-aluguel', 'preco-por-metro-quadrado', 'quando-desconto-50-nao-compensa'],
  },
  {
    slug: 'score-oportunidade-como-interpretamos',
    title: 'Score de Oportunidade Imovue: como calculamos e interpretamos',
    description: 'Como o Score Imovue é calculado, o que cada faixa significa, limitações e como usar corretamente na sua análise.',
    category: 'Análise',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['como-avaliar-liquidez-imovel', 'vale-a-pena-comprar-imovel-caixa', 'preco-por-metro-quadrado'],
  },

  // === Guia por Cidade ===
  {
    slug: 'imoveis-caixa-sao-paulo',
    title: 'Imóveis da Caixa em São Paulo: panorama e oportunidades',
    description: 'Panorama completo dos imóveis disponíveis em SP: onde estão, faixas de preço, oportunidades e riscos por região.',
    category: 'Guia por Cidade',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['imoveis-caixa-rio-de-janeiro', 'como-avaliar-liquidez-imovel', 'vale-a-pena-comprar-imovel-caixa'],
  },
  {
    slug: 'imoveis-caixa-rio-de-janeiro',
    title: 'Imóveis da Caixa no Rio de Janeiro: análise e riscos',
    description: 'Análise dos milhares de imóveis no RJ: por que tantos, onde estão as oportunidades reais e os riscos da Baixada Fluminense.',
    category: 'Guia por Cidade',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['imoveis-caixa-sao-paulo', 'quando-desconto-50-nao-compensa', 'riscos-imovel-ocupado'],
  },
  {
    slug: 'imoveis-caixa-belo-horizonte',
    title: 'Imóveis da Caixa em Minas Gerais: BH e Triângulo Mineiro',
    description: 'Panorama de MG: Triângulo Mineiro, BH e cidades universitárias — onde estão as melhores oportunidades.',
    category: 'Guia por Cidade',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['imoveis-caixa-sao-paulo', 'rentabilidade-aluguel'],
  },
  {
    slug: 'imoveis-caixa-curitiba',
    title: 'Imóveis da Caixa no Paraná: Curitiba, Londrina e Maringá',
    description: 'Oferta no PR: Campo Largo, Londrina, Maringá e a escassez na capital.',
    category: 'Guia por Cidade',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['imoveis-caixa-porto-alegre', 'imoveis-caixa-florianopolis'],
  },
  {
    slug: 'imoveis-caixa-salvador',
    title: 'Imóveis da Caixa em Salvador e Bahia: oportunidades e riscos',
    description: 'Análise dos imóveis na Bahia: Salvador, região metropolitana, oportunidades de aluguel e riscos do interior.',
    category: 'Guia por Cidade',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['imoveis-caixa-recife', 'imoveis-caixa-fortaleza'],
  },
  {
    slug: 'imoveis-caixa-goiania',
    title: 'Imóveis da Caixa em Goiás: entorno de Brasília e Goiânia',
    description: 'Os milhares de imóveis de GO: por que tantos, os riscos do entorno de Brasília e onde estão as oportunidades reais.',
    category: 'Guia por Cidade',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['imoveis-caixa-brasilia', 'quando-desconto-50-nao-compensa'],
  },
  {
    slug: 'imoveis-caixa-recife',
    title: 'Imóveis da Caixa em Recife e Pernambuco: panorama e dicas',
    description: 'Panorama dos imóveis em PE: Jaboatão, Paulista, litoral e oportunidades na RMR.',
    category: 'Guia por Cidade',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['imoveis-caixa-salvador', 'imoveis-caixa-fortaleza'],
  },
  {
    slug: 'imoveis-caixa-fortaleza',
    title: 'Imóveis da Caixa em Fortaleza e Ceará: onde investir',
    description: 'Análise dos imóveis no CE: a concentração em Horizonte, oportunidades em Fortaleza e a melhor taxa de financiáveis do Nordeste.',
    category: 'Guia por Cidade',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['imoveis-caixa-recife', 'imoveis-caixa-salvador'],
  },
  {
    slug: 'imoveis-caixa-porto-alegre',
    title: 'Imóveis da Caixa em Porto Alegre e RS: a melhor taxa de financiáveis',
    description: 'O RS com a melhor taxa de financiáveis do país, oportunidades em POA e os cuidados pós-enchentes.',
    category: 'Guia por Cidade',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['imoveis-caixa-florianopolis', 'imoveis-caixa-curitiba'],
  },
  {
    slug: 'imoveis-caixa-florianopolis',
    title: 'Imóveis da Caixa em Santa Catarina: oferta escassa e alta liquidez',
    description: 'Por que SC tem tão poucos imóveis, como monitorar a oferta escassa e onde agir rápido.',
    category: 'Guia por Cidade',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['imoveis-caixa-curitiba', 'imoveis-caixa-porto-alegre'],
  },
  {
    slug: 'imoveis-caixa-brasilia',
    title: 'Imóveis da Caixa em Brasília: mercado caro e oferta escassa',
    description: 'O mercado mais caro e mais escasso do país: poucos imóveis, preço alto e liquidez excelente.',
    category: 'Guia por Cidade',
    datePublished: '2026-06-23',
    dateModified: '2026-06-23',
    author: 'Equipe Imovue',
    related: ['imoveis-caixa-goiania', 'como-avaliar-liquidez-imovel'],
  },
]

// Ordem das categorias na index
export const categoryOrder = [
  'Comece por aqui',
  'Documentação',
  'Custos e Financiamento',
  'Riscos',
  'Análise',
  'Guia por Cidade',
]

export function getArticle(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug)
}

export function getCategories(): string[] {
  return categoryOrder.filter(c => articles.some(a => a.category === c))
}

export function getRelated(slug: string): Article[] {
  const article = getArticle(slug)
  if (!article?.related) return articles.filter(a => a.slug !== slug && a.category === article?.category).slice(0, 4)
  return article.related.map(s => getArticle(s)).filter(Boolean) as Article[]
}
