import type { Imovel, FiltrosImovel, PageResponse } from '@/types'
import { filterProperties as applyFilters, sortProperties as applySort } from './propertySearch'

interface ManifestEntry { uf: string; total: number; precoMedio: number; descontoMedio: number; maiorDesconto: number; financiaveis: number; altosDescontos: number }

interface BairroStats { medianaM2: number; total: number }
type EstatisticasBairros = Record<string, Record<string, Record<string, BairroStats>>>

let manifest: ManifestEntry[] | null = null
let bairroStats: EstatisticasBairros | null = null
let manifestRequest: Promise<ManifestEntry[]> | null = null
let bairroStatsRequest: Promise<EstatisticasBairros> | null = null
const cache = new Map<string, Imovel[]>()
const pendingUfs = new Map<string, Promise<Imovel[]>>()

async function loadManifest(): Promise<ManifestEntry[]> {
  if (manifest) return manifest
  if (manifestRequest) return manifestRequest
  manifestRequest = (async () => {
    try {
      const res = await fetch('/data/manifest.json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      manifest = await res.json()
      return manifest!
    } catch (e) {
      console.error('Erro ao carregar manifest:', e)
      return []
    } finally { manifestRequest = null }
  })()
  return manifestRequest
}

async function loadBairroStats(): Promise<EstatisticasBairros> {
  if (bairroStats) return bairroStats
  if (bairroStatsRequest) return bairroStatsRequest
  bairroStatsRequest = (async () => {
    try {
      const res = await fetch('/data/estatisticas_bairros.json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      bairroStats = await res.json()
      return bairroStats!
    } catch (e) {
      console.error('Erro ao carregar stats de bairro:', e)
      return {}
    } finally { bairroStatsRequest = null }
  })()
  return bairroStatsRequest
}

async function requestUf(uf: string): Promise<Imovel[]> {
  if (cache.has(uf)) return cache.get(uf)!
  const pending = pendingUfs.get(uf)
  if (pending) return pending
  const request = (async () => {
    try {
      const res = await fetch(`/data/${uf}.json`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Imovel[] = await res.json()
      cache.set(uf, data)
      return data
    } catch (e) {
      console.error(`Erro ao carregar ${uf}:`, e)
      throw e
    } finally {
      pendingUfs.delete(uf)
    }
  })()
  pendingUfs.set(uf, request)
  return request
}

async function loadUf(uf: string, strict = false): Promise<Imovel[]> {
  try { return await requestUf(uf) }
  catch (error) {
    if (strict) throw error
    return []
  }
}

export const dataService = {
  async getManifest() {
    return loadManifest()
  },

  async ufsDisponiveis(): Promise<string[]> {
    const m = await loadManifest()
    return m.map(e => e.uf)
  },

  async listar(uf: string, filtros: FiltrosImovel, options: { strict?: boolean } = {}): Promise<PageResponse<Imovel>> {
    const all = await loadUf(uf, options.strict)
    const filtered = applyFilters(all, filtros)
    const sorted = applySort(filtered, filtros.sort)
    const page = filtros.page ?? 0
    const size = filtros.size ?? 20
    const start = page * size
    const content = sorted.slice(start, start + size)
    return {
      content,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      number: page,
      size,
    }
  },

  async detalhe(uf: string, numero: string): Promise<Imovel | undefined> {
    const all = await loadUf(uf)
    return all.find(i => i.numeroImovel === numero)
  },

  async cidades(uf: string): Promise<string[]> {
    const all = await loadUf(uf)
    return [...new Set(all.map(i => i.cidade))].sort()
  },

  async opcoesFiltros(uf: string, filtros: FiltrosImovel) {
    const all = await loadUf(uf)

    function filtered(exclude: keyof FiltrosImovel) {
      const f = { ...filtros, [exclude]: undefined }
      return applyFilters(all, f)
    }

    function counted(items: Imovel[], key: (i: Imovel) => string | null): string[] {
      const count = new Map<string, number>()
      items.forEach(i => { const v = key(i); if (v) count.set(v, (count.get(v) || 0) + 1) })
      return [...count.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, n]) => `${k} (${n})`)
    }

    return {
      cidades: counted(filtered('cidade'), i => i.cidade),
      bairros: counted(filtered('bairro'), i => i.bairro),
      tipos: [...new Set(filtered('tipoImovel').map(i => i.tipoImovel).filter(Boolean) as string[])].sort(),
      modalidades: [...new Set(filtered('modalidade').map(i => i.modalidadeVenda).filter(Boolean))].sort(),
    }
  },

  async estatisticas(uf: string) {
    const all = await loadUf(uf)
    const precos = all.map(i => i.precoVenda).filter(Boolean) as number[]
    const descontos = all.map(i => i.percentualDesconto).filter(Boolean) as number[]
    return {
      total: all.length,
      precoMedio: precos.length ? precos.reduce((a, b) => a + b, 0) / precos.length : 0,
      descontoMedio: descontos.length ? descontos.reduce((a, b) => a + b, 0) / descontos.length : 0,
      topDescontos: [...all].sort((a, b) => (b.percentualDesconto ?? 0) - (a.percentualDesconto ?? 0)).slice(0, 10),
    }
  },

  calcScore(im: Imovel, precoMedio: number): number {
    let score = 0
    const desc = im.percentualDesconto ?? 0
    if (desc > 0 && desc <= 100) score += Math.min(desc, 60) * 0.6  // max 36pts
    if (im.financiamento === 'Sim') score += 20
    if (im.modalidadeVenda?.includes('Direta') || im.modalidadeVenda?.includes('Online')) score += 10
    if (im.precoVenda && im.precoVenda < precoMedio) score += 15
    if (im.quartos && im.quartos >= 2) score += 5
    if (im.vagas && im.vagas >= 1) score += 5
    return Math.min(Math.round(score), 100)
  },

  async getAnalisePreco(im: Imovel): Promise<{ valorM2: number; medianaM2: number; ratio: number; classificacao: 'sub' | 'normal' | 'sobre' } | null> {
    const area = im.areaPrivativa || im.areaTerreno || im.areaTotal
    if (!im.precoVenda || !area || area <= 0) return null
    const stats = await loadBairroStats()
    const bairro = stats[im.uf]?.[im.cidade]?.[im.bairro]
    if (!bairro) return null
    const valorM2 = im.precoVenda / area
    const ratio = valorM2 / bairro.medianaM2
    const classificacao = ratio < 0.8 ? 'sub' : ratio > 1.2 ? 'sobre' : 'normal'
    return { valorM2: Math.round(valorM2), medianaM2: bairro.medianaM2, ratio, classificacao }
  },

  async dashboardGlobal(ufFilter?: string, cidadeFilter?: string, tipoFilter?: string) {
    const m = await loadManifest()
    let todos: Imovel[] = []
    const ufsToLoad = ufFilter ? [ufFilter] : m.map(e => e.uf)
    for (const uf of ufsToLoad) {
      const data = await loadUf(uf)
      todos = todos.concat(data)
    }
    if (cidadeFilter) {
      todos = todos.filter(i => i.cidade === cidadeFilter)
    }
    if (tipoFilter) {
      todos = todos.filter(i => i.tipoImovel === tipoFilter)
    }

    const precos = todos.map(i => i.precoVenda).filter(Boolean) as number[]
    const precoMedio = precos.length ? precos.reduce((a, b) => a + b, 0) / precos.length : 0
    const descontos = todos.filter(i => (i.percentualDesconto ?? 0) > 0 && (i.percentualDesconto ?? 0) <= 100)
    const descontoMedio = descontos.length ? descontos.reduce((a, b) => a + (b.percentualDesconto ?? 0), 0) / descontos.length : 0
    const financiaveis = todos.filter(i => i.financiamento === 'Sim')
    const altosDescontos = descontos.filter(i => (i.percentualDesconto ?? 0) >= 30)

    // Score para todos
    const scored = todos.map(i => ({ ...i, score: this.calcScore(i, precoMedio) }))
    const topOportunidades = [...scored].sort((a, b) => b.score - a.score).slice(0, 10)

    // Ranking por estado
    const porEstado = new Map<string, { total: number; somaScore: number }>()
    scored.forEach(i => {
      const e = porEstado.get(i.uf) || { total: 0, somaScore: 0 }
      e.total++; e.somaScore += i.score
      porEstado.set(i.uf, e)
    })
    const rankingEstados = [...porEstado.entries()]
      .map(([uf, v]) => ({ uf, total: v.total, scoreMedio: Math.round(v.somaScore / v.total) }))
      .sort((a, b) => b.scoreMedio - a.scoreMedio)
      .slice(0, 10)

    // Alertas
    const altosDescontosOcupados = todos.filter(i => (i.percentualDesconto ?? 0) >= 30 && !i.descricao?.toLowerCase().includes('desocupad'))
    const scoreAlto = scored.filter(i => i.score >= 80)

    return {
      resumo: {
        total: todos.length,
        maiorDesconto: Math.max(...descontos.map(i => i.percentualDesconto ?? 0)),
        descontoMedio: Math.round(descontoMedio * 10) / 10,
        financiaveis: financiaveis.length,
        altosDescontos: altosDescontos.length,
        precoMedio: Math.round(precoMedio),
        scoreMedio: Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length),
      },
      topOportunidades,
      rankingEstados,
      alertas: {
        altosDescontosOcupados: altosDescontosOcupados.length,
        naoFinanciaveis: todos.length - financiaveis.length,
        scoreAlto: scoreAlto.length,
      },
    }
  },
}
