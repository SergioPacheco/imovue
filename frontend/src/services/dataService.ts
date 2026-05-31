import type { Imovel, FiltrosImovel, PageResponse } from '@/types'

interface ManifestEntry { uf: string; total: number }

let manifest: ManifestEntry[] | null = null
const cache = new Map<string, Imovel[]>()

async function loadManifest(): Promise<ManifestEntry[]> {
  if (manifest) return manifest
  const res = await fetch('/data/manifest.json')
  manifest = await res.json()
  return manifest!
}

async function loadUf(uf: string): Promise<Imovel[]> {
  if (cache.has(uf)) return cache.get(uf)!
  const res = await fetch(`/data/${uf}.json`)
  const data: Imovel[] = await res.json()
  cache.set(uf, data)
  return data
}

function applyFilters(imoveis: Imovel[], filtros: FiltrosImovel): Imovel[] {
  return imoveis.filter(i => {
    if (filtros.cidade && i.cidade !== filtros.cidade) return false
    if (filtros.bairro && i.bairro !== filtros.bairro) return false
    if (filtros.tipoImovel && i.tipoImovel !== filtros.tipoImovel) return false
    if (filtros.precoMin && (i.precoVenda ?? 0) < filtros.precoMin) return false
    if (filtros.precoMax && (i.precoVenda ?? Infinity) > filtros.precoMax) return false
    if (filtros.descontoMin && (i.percentualDesconto ?? 0) < filtros.descontoMin) return false
    if (filtros.modalidade && i.modalidadeVenda !== filtros.modalidade) return false
    if (filtros.quartosMin && (i.quartos ?? 0) < filtros.quartosMin) return false
    if (filtros.vagasMin && (i.vagas ?? 0) < filtros.vagasMin) return false
    return true
  })
}

function applySort(imoveis: Imovel[], sort?: string): Imovel[] {
  if (!sort) return imoveis
  const [field, dir] = sort.split(',')
  const mult = dir === 'asc' ? 1 : -1
  return [...imoveis].sort((a, b) => {
    let va = (a as any)[field] ?? 0
    let vb = (b as any)[field] ?? 0
    // Descontos inválidos (>100 ou <0) vão pro final
    if (field === 'percentualDesconto') {
      if (va <= 0 || va > 100) va = 0
      if (vb <= 0 || vb > 100) vb = 0
    }
    return (va - vb) * mult
  })
}

export const dataService = {
  async ufsDisponiveis(): Promise<string[]> {
    const m = await loadManifest()
    return m.map(e => e.uf)
  },

  async listar(uf: string, filtros: FiltrosImovel): Promise<PageResponse<Imovel>> {
    const all = await loadUf(uf)
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

  async tipos(uf: string): Promise<string[]> {
    const all = await loadUf(uf)
    return [...new Set(all.map(i => i.tipoImovel).filter(Boolean) as string[])].sort()
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
}
