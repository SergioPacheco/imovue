import type { FiltrosImovel, Imovel } from '@/types'
import { searchProperties, normalizeSearchText } from '@/services/propertySearch'
import { describeSearch, parseSmartSearch, type SmartSearchResult } from './useSmartSearch'

export interface ChatMessage {
  role: 'user' | 'bot'
  text: string
  imoveis?: Imovel[]
  filtrosAplicados?: SmartSearchResult
}

const fmt = (value: number | null) => value == null ? 'Não informado'
  : value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })

export function isStatisticsQuery(query: string): boolean {
  return /\b(?:quantos|total|estatisticas?|resumo|desconto medio)\b/.test(normalizeSearchText(query))
}

export function useChatBot() {
  const contexto = { uf: null as string | null, filters: {} as FiltrosImovel, lastResults: [] as Imovel[] }

  function gerarResposta(query: string, dados: Imovel[], cidades: string[], interpreted?: SmartSearchResult): ChatMessage {
    const q = normalizeSearchText(query)
    if (/^(oi|ola|hey|bom dia|boa tarde|boa noite|hello|hi)[!. ]*$/.test(q)
      || /^(ajuda|help|como funciona|comandos)[?!. ]*$/.test(q)) {
      return { role: 'bot', text: 'Posso buscar imóveis reais do catálogo e refinar sua busca. Experimente “apartamento em SP até 200 mil com dois quartos”. Depois diga “maior desconto”, “até 150 mil” ou “remova o limite de preço”.' }
    }

    const result = interpreted ?? parseSmartSearch(query, cidades, { ufAtual: dados[0]?.uf })
    if (result.intent === 'RESET_SEARCH') {
      contexto.filters = {}; contexto.lastResults = []; contexto.uf = dados[0]?.uf ?? null
      return { role: 'bot', text: 'Limpei os filtros. Qual imóvel você procura?' }
    }
    if (result.intent === 'UNKNOWN' && !isStatisticsQuery(query)) {
      return { role: 'bot', text: 'Não consegui identificar critérios de busca. Diga um tipo, uma cidade ou um orçamento, por exemplo “casa em Recife até 200 mil”.' }
    }

    const nextUf = result.uf || contexto.uf || dados[0]?.uf || null
    if (contexto.uf && nextUf !== contexto.uf) {
      delete contexto.filters.cidade; delete contexto.filters.bairro
    }
    contexto.uf = nextUf
    for (const key of result.removerFiltros) delete contexto.filters[key]
    Object.assign(contexto.filters, result.filtros)
    const applied: SmartSearchResult = {
      ...result, uf: nextUf, filtros: { ...contexto.filters },
      descricao: describeSearch(contexto.filters, nextUf),
    }
    if (result.perguntas.length) {
      return { role: 'bot', text: result.perguntas.join('\n\n'), filtrosAplicados: applied }
    }
    if (nextUf && dados.some(im => im.uf !== nextUf)) {
      return { role: 'bot', text: `É necessário carregar os imóveis de ${nextUf} para aplicar esta busca.`, filtrosAplicados: applied }
    }
    const found = searchProperties({ ...contexto.filters, sort: contexto.filters.sort || 'percentualDesconto,desc' }, dados)
    contexto.lastResults = found
    const occupancyWarning = typeof contexto.filters.ocupado === 'boolean'
      ? '\n\nOcupação: imóveis sem situação informada não são considerados confirmados.' : ''

    if (isStatisticsQuery(query)) {
      const discounts = found.map(im => im.percentualDesconto).filter((v): v is number => v != null && v >= 0 && v <= 100)
      const average = discounts.length ? (discounts.reduce((sum, v) => sum + v, 0) / discounts.length).toFixed(1) + '%' : 'Não informado'
      return { role: 'bot', text: `Encontrei ${found.length} imóveis.\n\n${applied.descricao}\n\nDesconto médio: ${average}.${occupancyWarning}`, filtrosAplicados: applied }
    }
    if (!found.length) {
      const alternatives: string[] = []
      if (contexto.filters.precoMax != null || contexto.filters.precoMin != null) {
        const expanded = searchProperties({ ...contexto.filters, precoMax: undefined, precoMin: undefined }, dados)
        if (expanded.length) alternatives.push(`Remover o limite de preço: ${expanded.length} imóveis. Diga “remova o limite de preço”.`)
      }
      if (contexto.filters.descontoMin != null) {
        const expanded = searchProperties({ ...contexto.filters, descontoMin: undefined }, dados)
        if (expanded.length) alternatives.push(`Sem desconto mínimo: ${expanded.length} imóveis. Diga “remova o desconto mínimo”.`)
      }
      return { role: 'bot', text: `Não encontrei imóveis com todos os critérios.\n\n${applied.descricao}${occupancyWarning}\n\n${alternatives.join('\n') || 'Você pode informar outro orçamento, tipo ou cidade para refinar a busca.'}`, filtrosAplicados: applied }
    }
    return {
      role: 'bot', imoveis: found.slice(0, 5), filtrosAplicados: applied,
      text: `Encontrei ${found.length} imóveis.\n\n${applied.descricao}${occupancyWarning}\n\n${found.slice(0, 5).map((im, index) => `${index + 1}. ${im.tipoImovel || 'Imóvel'} em ${im.cidade} — R$ ${fmt(im.precoVenda)} (${im.percentualDesconto == null ? 'desconto não informado' : im.percentualDesconto + '% de desconto'})`).join('\n')}\n\nVocê pode ajustar o orçamento ou dizer “maior desconto” e “mais baratos”.`,
    }
  }
  return { gerarResposta, contexto }
}
