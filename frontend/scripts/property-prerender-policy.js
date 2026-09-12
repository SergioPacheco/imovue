const DEFAULT_FREE_PROPERTY_LIMIT = 18000

export function isFullPrerenderMode() {
  return process.env.SEO_PRERENDER_MODE === 'full'
}

function discountOf(item) {
  const value = Number(item.percentualDesconto)
  return value > 0 && value <= 100 ? value : 0
}

function cityKey(item) {
  return `${String(item.uf || '').toUpperCase()}|${String(item.cidade || '').trim().toLocaleLowerCase('pt-BR')}`
}

function comparePriority(a, b) {
  return discountOf(b) - discountOf(a)
    || Number(b.financiamento === 'Sim') - Number(a.financiamento === 'Sim')
    || Number(a.precoVenda || Number.MAX_SAFE_INTEGER) - Number(b.precoVenda || Number.MAX_SAFE_INTEGER)
    || String(a.numeroImovel).localeCompare(String(b.numeroImovel), 'pt-BR')
}

function uniqueProperties(properties) {
  return [...new Map(
    properties
      .filter(item => item?.numeroImovel)
      .map(item => [String(item.numeroImovel), item]),
  ).values()]
}

export function selectPrerenderProperties(properties) {
  const unique = uniqueProperties(properties)
  if (isFullPrerenderMode()) return unique

  const configuredLimit = Number(process.env.SEO_MAX_PROPERTY_PAGES)
  const limit = Math.min(
    DEFAULT_FREE_PROPERTY_LIMIT,
    Math.max(0, Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : DEFAULT_FREE_PROPERTY_LIMIT),
  )
  const ranked = [...unique].sort(comparePriority)
  const selected = []
  const selectedNumbers = new Set()
  const selectedCities = new Set()

  // Garante pelo menos um imóvel por cidade antes de preencher o restante
  // com as melhores oportunidades nacionais.
  for (const item of ranked) {
    const key = cityKey(item)
    if (selectedCities.has(key)) continue
    selected.push(item)
    selectedNumbers.add(String(item.numeroImovel))
    selectedCities.add(key)
    if (selected.length >= limit) return selected
  }

  for (const item of ranked) {
    if (selectedNumbers.has(String(item.numeroImovel))) continue
    selected.push(item)
    if (selected.length >= limit) break
  }

  return selected
}

export function propertyPrerenderSummary(properties, selected) {
  if (isFullPrerenderMode()) return `${selected.length} imóveis`
  return `${selected.length} de ${uniqueProperties(properties).length} imóveis (modo Free)`
}
