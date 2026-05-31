import type { Imovel } from '@/types'
import { parseSmartSearch, type SmartSearchResult } from './useSmartSearch'

export interface ChatMessage {
  role: 'user' | 'bot'
  text: string
  imoveis?: Imovel[]
  filtrosAplicados?: SmartSearchResult
}

const SAUDACOES = ['oi', 'olá', 'ola', 'hey', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'hi']
const AJUDA = ['ajuda', 'help', 'como funciona', 'o que você faz', 'comandos']

function fmt(v: number | null): string {
  if (!v) return '-'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function gerarResposta(query: string, dados: Imovel[], cidades: string[]): ChatMessage {
  const q = query.toLowerCase().trim()

  // Saudação
  if (SAUDACOES.some(s => q === s || q.startsWith(s + ' '))) {
    return {
      role: 'bot',
      text: `👋 Olá! Sou o assistente do Imovue. Tenho **${fmt(dados.length)} imóveis** carregados.\n\nMe pergunte algo como:\n- "apartamentos até 200 mil"\n- "melhores descontos"\n- "casas com 3 quartos"\n- "quantos imóveis tem em Goiânia?"`,
    }
  }

  // Ajuda
  if (AJUDA.some(s => q.includes(s))) {
    return {
      role: 'bot',
      text: `🤖 Posso te ajudar a encontrar imóveis! Experimente:\n\n• **Filtrar:** "apartamento até 150 mil com 2 quartos"\n• **Estatísticas:** "qual o desconto médio?" ou "quantos imóveis tem?"\n• **Top descontos:** "melhores oportunidades" ou "maiores descontos"\n• **Por cidade:** "imóveis em Campinas" ou "casas em Curitiba"\n• **Por modalidade:** "venda direta" ou "leilão"`,
    }
  }

  // Quantos imóveis / estatísticas
  if (q.match(/quantos|total|estatístic|estatistic|resumo|overview/)) {
    const precos = dados.map(i => i.precoVenda).filter(Boolean) as number[]
    const descontos = dados.map(i => i.percentualDesconto).filter(Boolean) as number[]
    const avgPreco = precos.length ? precos.reduce((a, b) => a + b, 0) / precos.length : 0
    const avgDesc = descontos.length ? descontos.reduce((a, b) => a + b, 0) / descontos.length : 0
    const tipos = [...new Set(dados.map(i => i.tipoImovel).filter(Boolean))]

    return {
      role: 'bot',
      text: `📊 **Resumo dos dados carregados:**\n\n• Total: **${fmt(dados.length)}** imóveis\n• Preço médio: **R$ ${fmt(avgPreco)}**\n• Desconto médio: **${avgDesc.toFixed(1)}%**\n• Tipos: ${tipos.join(', ')}\n• Cidades: ${cidades.length}\n\nQuer filtrar por algo específico?`,
    }
  }

  // Melhores descontos / oportunidades
  if (q.match(/melhor|top|maior desconto|oportunidade|barato/)) {
    const top = [...dados]
      .filter(i => i.percentualDesconto && i.percentualDesconto > 0)
      .sort((a, b) => (b.percentualDesconto ?? 0) - (a.percentualDesconto ?? 0))
      .slice(0, 5)

    if (top.length === 0) {
      return { role: 'bot', text: '😕 Não encontrei imóveis com desconto nos dados carregados.' }
    }

    const lista = top.map((im, i) =>
      `${i + 1}. **${im.tipoImovel || 'Imóvel'}** em ${im.cidade} — **${im.percentualDesconto}% off** (R$ ${fmt(im.precoVenda)})`
    ).join('\n')

    return {
      role: 'bot',
      text: `🔥 **Top 5 maiores descontos:**\n\n${lista}\n\nQuer ver detalhes de algum? Ou filtrar por tipo/cidade?`,
      imoveis: top,
    }
  }

  // Mais barato
  if (q.match(/mais barato|menor preço|menor preco|cheapest/)) {
    const top = [...dados]
      .filter(i => i.precoVenda && i.precoVenda > 0)
      .sort((a, b) => (a.precoVenda ?? Infinity) - (b.precoVenda ?? Infinity))
      .slice(0, 5)

    const lista = top.map((im, i) =>
      `${i + 1}. **R$ ${fmt(im.precoVenda)}** — ${im.tipoImovel || 'Imóvel'} em ${im.cidade} (${im.percentualDesconto ?? 0}% off)`
    ).join('\n')

    return {
      role: 'bot',
      text: `💰 **5 mais baratos:**\n\n${lista}`,
      imoveis: top,
    }
  }

  // Busca com filtros (fallback principal)
  const result = parseSmartSearch(query, cidades)
  const filtros = result.filtros

  // Aplica filtros nos dados
  let filtrados = [...dados]
  if (filtros.tipoImovel) filtrados = filtrados.filter(i => i.tipoImovel === filtros.tipoImovel)
  if (filtros.cidade) filtrados = filtrados.filter(i => i.cidade === filtros.cidade)
  if (filtros.precoMax) filtrados = filtrados.filter(i => (i.precoVenda ?? Infinity) <= filtros.precoMax!)
  if (filtros.precoMin) filtrados = filtrados.filter(i => (i.precoVenda ?? 0) >= filtros.precoMin!)
  if (filtros.descontoMin) filtrados = filtrados.filter(i => (i.percentualDesconto ?? 0) >= filtros.descontoMin!)
  if (filtros.quartosMin) filtrados = filtrados.filter(i => (i.quartos ?? 0) >= filtros.quartosMin!)
  if (filtros.vagasMin) filtrados = filtrados.filter(i => (i.vagas ?? 0) >= filtros.vagasMin!)

  if (filtrados.length === 0) {
    return {
      role: 'bot',
      text: `😕 Não encontrei imóveis com esses critérios.\n\n_Filtros aplicados: ${result.descricao}_\n\nTente ampliar a busca (ex: aumente o preço máximo ou remova algum filtro).`,
      filtrosAplicados: result,
    }
  }

  // Ordena por desconto
  filtrados.sort((a, b) => (b.percentualDesconto ?? 0) - (a.percentualDesconto ?? 0))
  const top = filtrados.slice(0, 5)
  const avgDesc = filtrados.reduce((s, i) => s + (i.percentualDesconto ?? 0), 0) / filtrados.length

  const lista = top.map((im, i) =>
    `${i + 1}. ${im.tipoImovel || 'Imóvel'} em **${im.cidade}** — R$ ${fmt(im.precoVenda)} (${im.percentualDesconto ?? 0}% off)`
  ).join('\n')

  return {
    role: 'bot',
    text: `✅ Encontrei **${filtrados.length} imóveis**!\n\n_${result.descricao}_\n\nDesconto médio: **${avgDesc.toFixed(1)}%**\n\n**Destaques:**\n${lista}${filtrados.length > 5 ? `\n\n...e mais ${filtrados.length - 5} resultados.` : ''}`,
    imoveis: top,
    filtrosAplicados: result,
  }
}

export function useChatBot() {
  return { gerarResposta }
}
