export interface Article {
  slug: string
  title: string
  description: string
  category: string
  datePublished: string
  dateModified: string
  author: string
}

export const articles: Article[] = [
  {
    slug: 'como-comprar-imoveis-caixa',
    title: 'Como comprar imóveis da CAIXA com desconto',
    description: 'Guia completo sobre o processo de compra de imóveis da Caixa Econômica Federal: modalidades, passo a passo, documentos e cuidados.',
    category: 'Guia Básico',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'diferenca-leilao-licitacao-venda-online',
    title: 'Diferença entre leilão, licitação aberta e venda online',
    description: 'Entenda as três modalidades de venda de imóveis da Caixa, suas diferenças, vantagens e riscos de cada uma.',
    category: 'Guia Básico',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'riscos-imovel-ocupado',
    title: 'Riscos de comprar um imóvel ocupado',
    description: 'O que significa imóvel ocupado, quanto custa a desocupação, prazos judiciais e como avaliar se o desconto compensa o risco.',
    category: 'Riscos',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'como-analisar-edital',
    title: 'Como analisar o edital de venda',
    description: 'O que verificar no edital antes de dar um lance: cláusulas obrigatórias, prazos, condições e armadilhas comuns.',
    category: 'Documentação',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'como-consultar-matricula',
    title: 'Como consultar a matrícula do imóvel',
    description: 'Para que serve a matrícula, como obtê-la, o que verificar e quais problemas ela pode revelar.',
    category: 'Documentação',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'debitos-condominio-iptu',
    title: 'Quem paga IPTU e condomínio atrasados',
    description: 'Regras sobre responsabilidade por débitos de IPTU e condomínio em imóveis arrematados em leilão ou venda direta da Caixa.',
    category: 'Custos',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'como-funciona-financiamento',
    title: 'Como funciona o financiamento de imóveis da Caixa',
    description: 'Quais imóveis aceitam financiamento, condições, taxas, prazos e como obter pré-aprovação de crédito.',
    category: 'Financeiro',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'como-utilizar-fgts',
    title: 'Como utilizar o FGTS na compra',
    description: 'Regras para uso do FGTS em imóveis da Caixa: quem pode, requisitos, valor máximo e procedimentos.',
    category: 'Financeiro',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'como-calcular-itbi-escritura-registro',
    title: 'Como calcular ITBI, escritura e registro',
    description: 'Custos cartorários obrigatórios na compra de imóveis: alíquotas de ITBI por cidade, valores de escritura e registro.',
    category: 'Custos',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'custo-total-compra',
    title: 'Como calcular o custo total da compra',
    description: 'Planilha completa de custos: preço + ITBI + cartório + eventuais débitos + desocupação + reformas.',
    category: 'Custos',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'preco-por-metro-quadrado',
    title: 'Como avaliar o preço por metro quadrado',
    description: 'Como calcular e comparar o preço/m² com a região, identificar oportunidades reais e evitar avaliações infladas.',
    category: 'Análise',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'rentabilidade-aluguel',
    title: 'Como estimar a rentabilidade de aluguel',
    description: 'Cálculo de yield bruto e líquido, comparação com renda fixa e critérios para avaliar imóvel como investimento.',
    category: 'Análise',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'documentos-necessarios',
    title: 'Documentos necessários para participar',
    description: 'Lista completa de documentos exigidos para cada modalidade de compra: pessoa física e jurídica.',
    category: 'Documentação',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'erros-comuns-iniciantes',
    title: 'Erros comuns de iniciantes',
    description: 'Os 10 erros mais frequentes de quem compra o primeiro imóvel em leilão ou venda direta e como evitá-los.',
    category: 'Guia Básico',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
  {
    slug: 'checklist-antes-de-comprar',
    title: 'Checklist antes de comprar um imóvel',
    description: 'Lista de verificação completa com todos os itens a conferir antes de dar um lance ou enviar proposta.',
    category: 'Guia Básico',
    datePublished: '2026-06-01',
    dateModified: '2026-06-17',
    author: 'Equipe Imovue',
  },
]

export function getArticle(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug)
}

export function getCategories(): string[] {
  return [...new Set(articles.map(a => a.category))]
}
