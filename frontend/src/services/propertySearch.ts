import type { FiltrosImovel, Imovel } from '@/types'

export function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ')
}

export function getOccupancy(imovel: Imovel): boolean | null {
  const description = normalizeSearchText(imovel.descricao || '')
  if (/\bdesocupad[oa]s?\b/.test(description)) return false
  if (/\bocupad[oa]s?\b/.test(description)) return true
  return null
}

function withoutCount(value: string): string {
  return normalizeSearchText(value.replace(/ \(\d+\)$/, ''))
}

export function filterProperties(properties: Imovel[], filters: FiltrosImovel): Imovel[] {
  return properties.filter(im => {
    if (filters.cidade && withoutCount(im.cidade) !== withoutCount(filters.cidade)) return false
    if (filters.bairro && withoutCount(im.bairro) !== withoutCount(filters.bairro)) return false
    if (filters.tipoImovel && normalizeSearchText(im.tipoImovel || '') !== normalizeSearchText(filters.tipoImovel)) return false
    if (filters.modalidade && normalizeSearchText(im.modalidadeVenda) !== normalizeSearchText(filters.modalidade)) return false
    if (filters.financiamento && normalizeSearchText(im.financiamento || '') !== normalizeSearchText(filters.financiamento)) return false
    for (const [filter, value] of [
      [filters.precoMin, im.precoVenda], [filters.descontoMin, im.percentualDesconto],
      [filters.quartosMin, im.quartos], [filters.vagasMin, im.vagas],
    ]) {
      if (typeof filter === 'number' && (value == null || value < filter)) return false
    }
    if (typeof filters.precoMax === 'number' && (im.precoVenda == null || im.precoVenda > filters.precoMax)) return false
    if (typeof filters.quartosMax === 'number' && (im.quartos == null || im.quartos > filters.quartosMax)) return false
    if (typeof filters.ocupado === 'boolean' && getOccupancy(im) !== filters.ocupado) return false
    return true
  })
}

const SORT_FIELDS = new Set(['precoVenda', 'percentualDesconto'])

export function sortProperties(properties: Imovel[], sort?: string): Imovel[] {
  if (!sort) return properties
  const [field, direction] = sort.split(',')
  if (!SORT_FIELDS.has(field) || !['asc', 'desc'].includes(direction)) return properties
  const key = field as 'precoVenda' | 'percentualDesconto'
  function value(im: Imovel): number | null {
    const v = im[key]
    if (v == null || !Number.isFinite(v)) return null
    if (key === 'percentualDesconto' && (v < 0 || v > 100)) return null
    if (key === 'precoVenda' && v <= 0) return null
    return v
  }
  return [...properties].sort((a, b) => {
    const va = value(a), vb = value(b)
    if (va == null && vb != null) return 1
    if (vb == null && va != null) return -1
    return (va != null && vb != null ? (va - vb) * (direction === 'asc' ? 1 : -1) : 0)
      || a.numeroImovel.localeCompare(b.numeroImovel)
  })
}

export function searchProperties(filters: FiltrosImovel, properties: Imovel[]): Imovel[] {
  return sortProperties(filterProperties(properties, filters), filters.sort)
}
