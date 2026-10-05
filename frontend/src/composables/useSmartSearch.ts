import type { FiltrosImovel } from '@/types'
import { normalizeSearchText } from '@/services/propertySearch'

const UF_MAP: Record<string, string> = {
  'acre': 'AC', 'alagoas': 'AL', 'amazonas': 'AM', 'amapá': 'AP', 'amapa': 'AP',
  'bahia': 'BA', 'ceará': 'CE', 'ceara': 'CE', 'distrito federal': 'DF', 'brasília': 'DF', 'brasilia': 'DF',
  'espírito santo': 'ES', 'espirito santo': 'ES', 'goiás': 'GO', 'goias': 'GO',
  'maranhão': 'MA', 'maranhao': 'MA', 'minas gerais': 'MG', 'minas': 'MG',
  'mato grosso do sul': 'MS', 'mato grosso': 'MT', 'pará': 'PA', 'para': 'PA',
  'paraíba': 'PB', 'paraiba': 'PB', 'pernambuco': 'PE', 'piauí': 'PI', 'piaui': 'PI',
  'paraná': 'PR', 'parana': 'PR', 'rio de janeiro': 'RJ', 'rio': 'RJ',
  'rio grande do norte': 'RN', 'rondônia': 'RO', 'rondonia': 'RO', 'roraima': 'RR',
  'rio grande do sul': 'RS', 'santa catarina': 'SC', 'sergipe': 'SE',
  'são paulo': 'SP', 'sao paulo': 'SP', 'tocantins': 'TO',
  'ac': 'AC', 'al': 'AL', 'am': 'AM', 'ap': 'AP', 'ba': 'BA', 'ce': 'CE',
  'df': 'DF', 'es': 'ES', 'go': 'GO', 'ma': 'MA', 'mg': 'MG', 'ms': 'MS',
  'mt': 'MT', 'pa': 'PA', 'pb': 'PB', 'pe': 'PE', 'pi': 'PI', 'pr': 'PR',
  'rj': 'RJ', 'rn': 'RN', 'ro': 'RO', 'rr': 'RR', 'rs': 'RS', 'sc': 'SC',
  'se': 'SE', 'sp': 'SP', 'to': 'TO',
}

// Mapa de cidades principais → UF (para detectar estado a partir de cidade na busca)
const CIDADE_UF_MAP: Record<string, string> = {
  'goiania': 'GO', 'anapolis': 'GO', 'aparecida de goiania': 'GO',
  'curitiba': 'PR', 'londrina': 'PR', 'maringa': 'PR', 'cascavel': 'PR', 'foz do iguacu': 'PR',
  'belo horizonte': 'MG', 'uberlandia': 'MG', 'contagem': 'MG', 'juiz de fora': 'MG', 'betim': 'MG',
  'salvador': 'BA', 'feira de santana': 'BA', 'vitoria da conquista': 'BA',
  'fortaleza': 'CE', 'caucaia': 'CE', 'juazeiro do norte': 'CE',
  'recife': 'PE', 'jaboatao dos guararapes': 'PE', 'olinda': 'PE', 'caruaru': 'PE',
  'porto alegre': 'RS', 'caxias do sul': 'RS', 'pelotas': 'RS', 'canoas': 'RS',
  'manaus': 'AM', 'belem': 'PA', 'macapa': 'AP',
  'sao luis': 'MA', 'natal': 'RN', 'joao pessoa': 'PB', 'maceio': 'AL', 'aracaju': 'SE',
  'teresina': 'PI', 'campo grande': 'MS', 'cuiaba': 'MT', 'porto velho': 'RO',
  'rio branco': 'AC', 'boa vista': 'RR', 'palmas': 'TO', 'macae': 'RJ',
  'florianopolis': 'SC', 'joinville': 'SC', 'blumenau': 'SC', 'chapeco': 'SC',
  'vitoria': 'ES', 'vila velha': 'ES', 'serra': 'ES', 'cariacica': 'ES',
  'niteroi': 'RJ', 'duque de caxias': 'RJ', 'nova iguacu': 'RJ', 'sao goncalo': 'RJ', 'campos dos goytacazes': 'RJ',
  'campinas': 'SP', 'guarulhos': 'SP', 'osasco': 'SP', 'santos': 'SP', 'santo andre': 'SP',
  'sao bernardo do campo': 'SP', 'ribeirao preto': 'SP', 'sorocaba': 'SP', 'bauru': 'SP',
  'sao jose dos campos': 'SP', 'piracicaba': 'SP', 'jundiai': 'SP', 'mogi das cruzes': 'SP',
}

const TIPO_MAP: Record<string, string> = {
  'apartamento': 'Apartamento', 'apto': 'Apartamento', 'ap': 'Apartamento',
  'casa': 'Casa', 'sobrado': 'Sobrado',
  'terreno': 'Terreno', 'lote': 'Terreno',
  'comercial': 'Comercial', 'loja': 'Loja', 'sala': 'Sala',
  'galpão': 'Galpão', 'galpao': 'Galpão',
  'prédio': 'Prédio', 'predio': 'Prédio',
  'rural': 'Imóvel rural', 'fazenda': 'Imóvel rural', 'sítio': 'Imóvel rural', 'sitio': 'Imóvel rural',
}

const MODALIDADE_MAP: Record<string, string> = {
  'leilão': 'Leilão SFI - Edital Único', 'leilao': 'Leilão SFI - Edital Único',
  'venda direta': 'Venda Direta Online', 'direta': 'Venda Direta Online',
  'venda online': 'Venda Online', 'online': 'Venda Online',
  'licitação': 'Licitação Aberta', 'licitacao': 'Licitação Aberta',
}

export interface SmartSearchResult {
  filtros: FiltrosImovel
  uf: string | null
  descricao: string
  intent: 'SEARCH_PROPERTY' | 'REFINE_SEARCH' | 'RESET_SEARCH' | 'UNKNOWN'
  removerFiltros: (keyof FiltrosImovel)[]
  perguntas: string[]
  avisos: string[]
}

// Regexes operate on normalized text; names supplied by the catalog are escaped.
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function containsWord(text: string, word: string): boolean {
  return new RegExp(`(?:^|[^a-z0-9])${escapeRegex(normalizeSearchText(word))}(?=$|[^a-z0-9])`).test(text)
}

function title(value: string): string {
  return value.split(' ').map(w => ['de', 'do', 'da', 'dos', 'das'].includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const AMOUNTS = '(\\d+(?:[.,]\\d+)*)\\s*(milhoes|milhao|mil|mi|k|m)?\\b'
const COUNTS = '(\\d+|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)'
const NUMBER_WORDS: Record<string, number> = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10 }

function money(raw: string, unit?: string): number {
  // A dot before three digits is a thousands separator; 1.5 million is decimal.
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.')
    : /^\d{1,3}(?:\.\d{3})+$/.test(raw) ? raw.replace(/\./g, '') : raw
  const multiplier = ['mil', 'k'].includes(unit || '') ? 1000
    : ['milhao', 'milhoes', 'mi', 'm'].includes(unit || '') ? 1000000 : 1
  return Math.round(Number(normalized) * multiplier * 100) / 100
}

export function describeSearch(filters: FiltrosImovel, uf: string | null): string {
  const parts: string[] = []
  if (uf) parts.push(`UF: ${uf}`)
  if (filters.cidade) parts.push(`Cidade: ${filters.cidade}`)
  if (filters.bairro) parts.push(`Bairro: ${filters.bairro}`)
  if (filters.tipoImovel) parts.push(`Tipo: ${filters.tipoImovel}`)
  if (filters.precoMin != null) parts.push(`Preço mín: R$ ${filters.precoMin.toLocaleString('pt-BR')}`)
  if (filters.precoMax != null) parts.push(`Preço máx: R$ ${filters.precoMax.toLocaleString('pt-BR')}`)
  if (filters.descontoMin != null) parts.push(`Desconto mín: ${filters.descontoMin}%`)
  if (filters.quartosMin != null) parts.push(`Quartos: ${filters.quartosMin}+`)
  if (filters.quartosMax != null) parts.push(`Até ${filters.quartosMax} quartos`)
  if (filters.vagasMin != null) parts.push(`Vagas: ${filters.vagasMin}+`)
  if (filters.modalidade) parts.push(`Modalidade: ${filters.modalidade}`)
  if (filters.financiamento) parts.push(`Financiamento: ${filters.financiamento}`)
  if (typeof filters.ocupado === 'boolean') parts.push(filters.ocupado ? 'Somente ocupados confirmados' : 'Somente desocupados confirmados')
  if (filters.sort) parts.push(filters.sort === 'precoVenda,asc' ? 'Menor preço primeiro' : filters.sort === 'precoVenda,desc' ? 'Maior preço primeiro' : 'Maior desconto primeiro')
  return parts.length ? parts.join(' · ') : 'Nenhum filtro identificado'
}

/** Pure deterministic interpretation. Missing keys preserve prior search criteria. */
export function parseSmartSearch(text: string, cidadesDisponiveis: string[] = [], options: { ufAtual?: string } = {}): SmartSearchResult {
  const original = text.trim().slice(0, 1000)
  const t = normalizeSearchText(original)
  const filtros: FiltrosImovel = {}
  const perguntas: string[] = [], avisos: string[] = []
  const removerFiltros: (keyof FiltrosImovel)[] = []
  let uf: string | null = null

  // Longest names take precedence. Common Portuguese words are never bare UF aliases.
  const stateNames = Object.entries(UF_MAP).filter(([name]) => name.length > 2 && name !== 'rio')
    .sort(([a], [b]) => b.length - a.length)
  let stateText = t
  const states = new Set<string>()
  for (const [name, value] of stateNames) {
    if (!containsWord(stateText, name)) continue
    if (normalizeSearchText(name) === 'para' && !/\bpará(?=$|[^\p{L}])/iu.test(original)
      && !/\b(?:no|do|estado (?:de|do)) para\b/.test(t)) continue
    states.add(value)
    stateText = stateText.replace(new RegExp(`\\b${escapeRegex(normalizeSearchText(name))}\\b`, 'g'), ' ')
  }
  uf = states.values().next().value || null
  if (states.size > 1) perguntas.push('Você mencionou mais de um estado. Qual UF deseja pesquisar?')
  const abbreviations = Object.keys(UF_MAP).filter(name => name.length === 2)
  for (const code of abbreviations) {
    const location = new RegExp(`\\b(?:em|no|na|de|do|da|uf|estado(?: de| do| da)?)\\s+${code}\\b`)
    const uppercase = new RegExp(`\\b${code.toUpperCase()}\\b`)
    if (location.test(t) || (uppercase.test(original) && code !== 'ap')
      || (!['se', 'to', 'am', 'ap'].includes(code) && containsWord(t, code))) {
      if (uf && uf !== code.toUpperCase()) perguntas.push('Você mencionou mais de um estado. Qual UF deseja pesquisar?')
      uf = code.toUpperCase()
    }
  }

  const knownCities = Object.entries(CIDADE_UF_MAP).sort(([a], [b]) => b.length - a.length)
  let city = knownCities.find(([name]) => containsWord(t, name))
  if (city && !uf && options.ufAtual && cidadesDisponiveis.some(c => normalizeSearchText(c.replace(/ \(\d+\)$/, '')) === normalizeSearchText(city![0]))) {
    city = [city[0], options.ufAtual]
  }
  if (city && uf && city[1] !== uf) {
    const confirmedCatalog = options.ufAtual === uf && cidadesDisponiveis.length > 0
    const exists = cidadesDisponiveis.some(c => normalizeSearchText(c.replace(/ \(\d+\)$/, '')) === normalizeSearchText(city![0]))
    if (confirmedCatalog && !exists) {
      perguntas.push(`${title(city[0])} não consta no catálogo de ${uf}. Qual localização deseja usar?`)
      city = undefined
    } else {
      // City names can occur in several states. An explicit UF takes precedence;
      // interfaces resolve its catalog before executing the search.
      city = [city[0], uf]
    }
  }
  for (const name of ['sao paulo', 'rio de janeiro']) {
    if (!containsWord(t, name)) continue
    const state = name === 'sao paulo' ? 'SP' : 'RJ'
    if (new RegExp(`\\b(?:cidade (?:de|do)|capital(?: de| do)?) ${name}\\b`).test(t)) city = [name, state]
    else if (!new RegExp(`\\bestado (?:de|do) ${name}\\b`).test(t)
      && !containsWord(t, state.toLowerCase()) && !city) {
      perguntas.push(`Você procura imóveis no estado ou na cidade de ${title(name)}? Escreva “estado de ${title(name)}” ou “cidade de ${title(name)}”.`)
      uf = null
    }
  }
  if (city) {
    filtros.cidade = title(city[0])
    uf = city[1]
  }
  // The dynamic list belongs to the loaded UF, so do not reuse it for another state.
  if (!options.ufAtual || !uf || options.ufAtual === uf) {
    const dynamicCity = [...cidadesDisponiveis].map(c => c.replace(/ \(\d+\)$/, ''))
      .sort((a, b) => b.length - a.length).find(c => containsWord(t, c))
    if (dynamicCity && !/\bestado (?:de|do)\b/.test(t)
      && !perguntas.some(p => p.includes('estado ou na cidade'))) filtros.cidade = dynamicCity
  }

  for (const [name, type] of Object.entries(TIPO_MAP).sort(([a], [b]) => b.length - a.length)) {
    if (name === 'ap' && uf === 'AP') continue
    if (containsWord(t, name) || containsWord(t, name + 's')) { filtros.tipoImovel = type; break }
  }
  for (const [name, modality] of Object.entries(MODALIDADE_MAP).sort(([a], [b]) => b.length - a.length)) {
    if (containsWord(t, name)) { filtros.modalidade = modality; break }
  }

  const nonMoney = /^\s*(?:%|por cento|quartos?|qtos?|dorm|vagas?|garagem|m2|m²)/
  const ranges = t.matchAll(new RegExp(`\\bentre\\s+(?:r\\$\\s*)?${AMOUNTS}\\s+e\\s+(?:r\\$\\s*)?${AMOUNTS}`, 'g'))
  const range = [...ranges].find(match => !nonMoney.test(t.slice((match.index || 0) + match[0].length)))
  if (range) {
    filtros.precoMin = money(range[1], range[2] || range[4])
    filtros.precoMax = money(range[3], range[4] || range[2])
  } else {
    for (const [key, prefix] of [
      ['precoMax', 'ate|max(?:imo)?|menos de|abaixo de|no maximo|orcamento(?: de)?'],
      ['precoMin', 'a partir de|acima de|min(?:imo)?|mais de'],
    ] as const) {
      for (const match of t.matchAll(new RegExp(`\\b(?:${prefix})\\s*(?:r\\$\\s*)?${AMOUNTS}`, 'g'))) {
        const after = t.slice((match.index || 0) + match[0].length)
        if (nonMoney.test(after)) continue
        const price = money(match[1], match[2])
        if (Number.isFinite(price) && price > 0) filtros[key] = price
        else perguntas.push('Qual valor de investimento deseja definir?')
        break
      }
    }
    const budget = t.match(new RegExp(`^(?:r\\$\\s*)?${AMOUNTS}[.!]?$`))
    if (budget && (budget[2] || t.startsWith('r$'))) filtros.precoMax = money(budget[1], budget[2])
  }
  if (filtros.precoMin != null && filtros.precoMax != null && filtros.precoMin > filtros.precoMax) {
    delete filtros.precoMin; delete filtros.precoMax
    perguntas.push('O preço mínimo está acima do máximo. Qual faixa de preço deseja usar?')
  }
  const discount = t.match(/(\d+(?:[.,]\d+)?)\s*(?:%|por cento)/)
  if (discount && /\b(?:desconto|desc|off)\b/.test(t)) {
    const value = Number(discount[1].replace(',', '.'))
    if (value >= 0 && value <= 100) filtros.descontoMin = value
    else perguntas.push('O desconto deve estar entre 0% e 100%. Qual desconto mínimo deseja?')
  }
  const bedrooms = t.match(new RegExp(`\\b(?:(ate|no maximo)\\s+)?${COUNTS}\\s*(?:quartos?|qtos?(?:\\(s\\))?|dormitorios?|dorm)\\b`))
  if (bedrooms) filtros[bedrooms[1] ? 'quartosMax' : 'quartosMin'] = NUMBER_WORDS[bedrooms[2]] ?? Number(bedrooms[2])
  const bedroomRange = t.match(new RegExp(`\\bentre\\s+${COUNTS}\\s+e\\s+${COUNTS}\\s+quartos?\\b`))
  if (bedroomRange) {
    filtros.quartosMin = NUMBER_WORDS[bedroomRange[1]] ?? Number(bedroomRange[1])
    filtros.quartosMax = NUMBER_WORDS[bedroomRange[2]] ?? Number(bedroomRange[2])
  }
  const parking = t.match(new RegExp(`\\b${COUNTS}\\s*(?:vagas?|garagem)\\b`))
  if (parking) filtros.vagasMin = NUMBER_WORDS[parking[1]] ?? Number(parking[1])

  const clauses = t.split(/[,;!?]|\s+(?:e|mas)\s+/)
  if (clauses.some(c => /\bnao (?:me )?importo\b.{0,30}\bocupad[oa]s?\b/.test(c))) removerFiltros.push('ocupado')
  else if (clauses.some(c => /\b(?:nao(?: (?:quero|aceito|pode|aceita))?|sem)\b.{0,30}\b(?:ocupad[oa]s?|ocupacao)\b|\bdesocupad[oa]s?\b/.test(c))) filtros.ocupado = false
  else if (/\b(?:pode (?:estar|ser)|nao (?:me )?importo|tanto faz|aceito)\b.{0,30}\bocupad[oa]s?\b/.test(t)) removerFiltros.push('ocupado')
  else if (/\bocupad[oa]s?\b/.test(t)) filtros.ocupado = true
  if (typeof filtros.ocupado === 'boolean') avisos.push('A ocupação não está informada em muitos imóveis. Este filtro inclui apenas situações confirmadas nos dados.')

  if (clauses.some(c => /\b(?:nao (?:aceita|quero|aceito))\b.{0,35}\b(?:financiamento|financiav(?:el|eis))\b|\b(?:nao financiav(?:el|eis)|sem financiamento)\b/.test(c))) filtros.financiamento = 'Não'
  else if (/\b(?:financiav(?:el|eis)|aceita financiamento|com financiamento)\b/.test(t)) filtros.financiamento = 'Sim'

  if (/\b(?:mais barat[oa]s?|menor(?:es)? precos?|mais em conta)\b/.test(t)) filtros.sort = 'precoVenda,asc'
  else if (/\b(?:maior(?:es)? precos?|mais car[oa]s?)\b/.test(t)) filtros.sort = 'precoVenda,desc'
  else if (/\b(?:maior(?:es)? descontos?|melhor(?:es)? descontos?|bom desconto|bastante desconto|desconto alto|prioriz\w* descontos?|oportunidades?|melhores oportunidades)\b/.test(t)) filtros.sort = 'percentualDesconto,desc'
  else if (/\bbarat[oa]s?\b/.test(t) && filtros.precoMax == null) perguntas.push('Quando você diz “barato”, até quanto pretende investir? Exemplo: até 200 mil.')
  if (/\b(?:praia|litoral)\b/.test(t)) perguntas.push('Qual cidade litorânea deseja pesquisar? Os dados atuais não permitem confirmar distância até a praia.')

  if (/\b(?:remova|remover|retire|tirar|sem)\b.{0,25}\b(?:limite de preco|limite de valor|limite de investimento)\b/.test(t)) removerFiltros.push('precoMin', 'precoMax')
  if (/\b(?:remova|remover|retire|tirar|sem)\b.{0,20}\bdesconto minimo\b/.test(t)) removerFiltros.push('descontoMin')
  const reset = /\b(?:limpar (?:a )?busca|limpar filtros|reiniciar|comecar de novo|zerar filtros)\b/.test(t)
  const recognized = !!uf || Object.keys(filtros).length > 0 || removerFiltros.length > 0 || perguntas.length > 0
  const intent = reset ? 'RESET_SEARCH' : removerFiltros.length || /\b(?:agora|somente|mostre|volte)\b/.test(t) ? 'REFINE_SEARCH' : recognized ? 'SEARCH_PROPERTY' : 'UNKNOWN'
  return { filtros, uf, descricao: describeSearch(filtros, uf), intent, removerFiltros, perguntas, avisos }
}

const TEXT_FILTERS = ['cidade', 'bairro', 'tipoImovel', 'modalidade', 'financiamento'] as const
const NUMBER_FILTERS = ['precoMin', 'precoMax', 'descontoMin', 'quartosMin', 'quartosMax', 'vagasMin'] as const
const SORTS = ['', 'precoVenda,asc', 'precoVenda,desc', 'percentualDesconto,desc']

/** Shared URL contract for the home, listing and chat result links. */
export function searchFromQuery(query: Record<string, unknown>): { uf: string | null; filtros: FiltrosImovel } {
  const filtros: FiltrosImovel = {}
  for (const key of TEXT_FILTERS) {
    if (typeof query[key] === 'string' && query[key].trim()) filtros[key] = query[key].trim().slice(0, 160)
  }
  for (const key of NUMBER_FILTERS) {
    const raw = query[key]
    if (typeof raw !== 'string' || !raw.trim()) continue
    const value = Number(raw)
    if (Number.isFinite(value) && value >= 0 && (key !== 'descontoMin' || value <= 100)
      && (!['quartosMin', 'quartosMax', 'vagasMin'].includes(key) || Number.isInteger(value))) filtros[key] = value
  }
  if (query.ocupado === 'true' || query.ocupado === 'false') filtros.ocupado = query.ocupado === 'true'
  if (typeof query.sort === 'string' && SORTS.includes(query.sort)) filtros.sort = query.sort
  const uf = typeof query.uf === 'string' && Object.values(UF_MAP).includes(query.uf.toUpperCase()) ? query.uf.toUpperCase() : null
  return { uf, filtros }
}

export function searchToQuery(filters: FiltrosImovel, uf: string): Record<string, string> {
  const query: Record<string, string> = { uf }
  for (const key of [...TEXT_FILTERS, ...NUMBER_FILTERS, 'ocupado', 'sort'] as const) {
    const value = filters[key]
    if (value != null && (value !== '' || key === 'sort')) query[key] = String(value)
  }
  const clean = searchFromQuery(query)
  return Object.fromEntries(Object.entries({ ...clean.filtros, uf: clean.uf }).filter(([, value]) => value != null).map(([key, value]) => [key, String(value)]))
}
