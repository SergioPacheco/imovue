import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { runInNewContext } from 'vm'
import { fileURLToPath } from 'url'
import {
  SITE_NAME,
  UF_NOMES,
  displayName,
  formatCurrency,
  formatNumber,
  formatPercent,
  getCidadeSeo,
  getEstadoSeo,
  getGuideSeo,
  getGuidesIndexSeo,
  getHomeSeo,
  getImovelSeo,
  getInstitutionalSeo,
  getListagemSeo,
  getNotFoundSeo,
  slugify,
} from '../src/seo/seo.js'
import { isFullPrerenderMode, propertyPrerenderSummary, selectPrerenderProperties } from './property-prerender-policy.js'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const FRONTEND_DIR = resolve(SCRIPT_DIR, '..')
const DATA_DIR = resolve(FRONTEND_DIR, 'public/data')
const SOURCE_DIR = resolve(FRONTEND_DIR, 'src')
const DIST_DIR = resolve(FRONTEND_DIR, 'dist')
const BASE_HTML = readFileSync(resolve(DIST_DIR, 'index.html'), 'utf8')

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function jsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function formatDate(value) {
  if (!value) return ''
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function loadArticles() {
  const source = readFileSync(resolve(SOURCE_DIR, 'data/articles.ts'), 'utf8')
  const match = source.match(/export const articles:\s*Article\[\]\s*=\s*(\[[\s\S]*?\])\s*\n\n\/\/ Ordem/)
  if (!match) throw new Error('Não foi possível ler os metadados dos guias.')
  return runInNewContext(`(${match[1]})`)
}

function validDiscount(value) {
  return Number(value) > 0 && Number(value) <= 100
}

function statsFor(items) {
  const prices = items.map(item => item.precoVenda).filter(value => Number(value) > 0).map(Number)
  const discounts = items.map(item => item.percentualDesconto).filter(validDiscount).map(Number)
  return {
    total: items.length,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxDiscount: discounts.length ? Math.max(...discounts) : 0,
    averagePrice: prices.length ? prices.reduce((sum, value) => sum + value, 0) / prices.length : 0,
    averageDiscount: discounts.length ? discounts.reduce((sum, value) => sum + value, 0) / discounts.length : 0,
    financed: items.filter(item => item.financiamento === 'Sim').length,
  }
}

function loadCatalog() {
  const manifest = JSON.parse(readFileSync(resolve(DATA_DIR, 'manifest.json'), 'utf8'))
  const byUf = new Map()
  const byCity = new Map()
  const properties = []

  for (const entry of manifest) {
    const file = resolve(DATA_DIR, `${entry.uf}.json`)
    if (!existsSync(file)) continue
    const items = JSON.parse(readFileSync(file, 'utf8'))
    byUf.set(entry.uf, items)
    for (const item of items) {
      const uf = String(item.uf || entry.uf).toUpperCase()
      const city = item.cidade || 'Cidade não informada'
      const citySlug = slugify(city)
      const key = `${uf}/${citySlug}`
      if (!byCity.has(key)) byCity.set(key, { uf, city, slug: citySlug, items: [] })
      byCity.get(key).items.push(item)
      properties.push(item)
    }
  }

  const states = [...byUf.entries()].map(([uf, items]) => ({
    uf,
    name: UF_NOMES[uf] || uf,
    items,
    stats: statsFor(items),
    cities: [...byCity.values()].filter(city => city.uf === uf).sort((a, b) => a.city.localeCompare(b.city, 'pt-BR')),
  }))

  return { states, byUf, byCity, properties, totalStats: statsFor(properties) }
}

function normalizeLinks(html) {
  return html
    .replace(/<router-link\b([^>]*)>/g, (_, attrs) => {
      const normalized = attrs
        .replace(/:to="`([^`]+)`"/g, 'href="$1"')
        .replace(/:to="'([^']+)'"/g, 'href="$1"')
        .replace(/\sto="([^"]+)"/g, ' href="$1"')
        .replace(/\s:[^=]+="[^"]*"/g, '')
      return `<a${normalized}>`
    })
    .replace(/<\/router-link>/g, '</a>')
}

function sourceTemplate(file) {
  const source = readFileSync(file, 'utf8')
  const match = source.match(/<template>([\s\S]*?)<\/template>/)
  if (!match) return ''
  return normalizeLinks(match[1].trim())
}

function staticGuideContent(article, catalog) {
  const file = resolve(SOURCE_DIR, `pages/guia/conteudo/${article.slug}.vue`)
  if (!existsSync(file)) return `<p>${escapeHtml(article.description)}</p>`
  const source = sourceTemplate(file)
  const isDynamic = /\bv-[\w-]+|\{\{|\s:[\w-]+\s*=/.test(source)
  if (!isDynamic) return source

  const regionMap = {
    'imoveis-caixa-sao-paulo': 'SP',
    'imoveis-caixa-rio-de-janeiro': 'RJ',
    'imoveis-caixa-belo-horizonte': 'MG',
    'imoveis-caixa-curitiba': 'PR',
    'imoveis-caixa-salvador': 'BA',
    'imoveis-caixa-goiania': 'GO',
    'imoveis-caixa-recife': 'PE',
    'imoveis-caixa-fortaleza': 'CE',
    'imoveis-caixa-porto-alegre': 'RS',
    'imoveis-caixa-florianopolis': 'SC',
    'imoveis-caixa-brasilia': 'DF',
  }
  const uf = regionMap[article.slug]
  const state = catalog.states.find(item => item.uf === uf)
  if (!state) return `<p>${escapeHtml(article.description)}</p>`
  const topCities = state.cities.filter(city => city.items.length >= 3).slice(0, 8)
  return `<p>${escapeHtml(article.description)}</p>
    <h2>Dados atuais de ${escapeHtml(state.name)}</h2>
    <p>O catálogo reúne ${formatNumber(state.stats.total)} imóveis da CAIXA em ${formatNumber(state.cities.length)} cidades de ${escapeHtml(state.name)}. O preço médio encontrado é ${formatCurrency(state.stats.averagePrice)} e o maior desconto calculado nos dados atuais é ${formatPercent(state.stats.maxDiscount) || 'não informado'}.</p>
    ${topCities.length ? `<h3>Cidades com oferta no estado</h3><ul>${topCities.map(city => `<li><a href="/estado/${uf.toLowerCase()}/${city.slug}">${escapeHtml(city.city)}</a> — ${formatNumber(city.items.length)} imóveis</li>`).join('')}</ul>` : ''}`
}

function renderHomeBody(catalog) {
  const maxDiscount = formatPercent(catalog.totalStats.maxDiscount)
  return `<main class="seo-static-page">
    <h1>Encontre imóveis da CAIXA com grandes descontos</h1>
    <p>O Imovue ajuda você a buscar e analisar imóveis públicos da CAIXA com desconto em todo o Brasil, comparando preços, cidades, modalidades e oportunidades.</p>
    <p>O catálogo atual reúne ${formatNumber(catalog.totalStats.total)} imóveis em ${formatNumber(catalog.states.length)} estados${maxDiscount ? `, com descontos de até ${maxDiscount} encontrados nos dados` : ''}.</p>
    <h2>Escolha um estado para começar</h2>
    <ul>${catalog.states.map(state => `<li><a href="/estado/${state.uf.toLowerCase()}">${escapeHtml(state.name)} (${state.uf})</a> — ${formatNumber(state.stats.total)} imóveis</li>`).join('')}</ul>
    <h2>Como usar o Imovue</h2>
    <p>Explore uma página estadual, compare cidades e abra o detalhe de cada imóvel. Os dados são extraídos de listas públicas da CAIXA e podem ser conferidos na fonte oficial.</p>
    <p><a href="/guias">Leia os guias sobre compra, documentação, custos e riscos.</a></p>
  </main>`
}

function renderListBody(catalog) {
  return `<main class="seo-static-page">
    <h1>Imóveis da CAIXA com desconto</h1>
    <p>Consulte o catálogo de imóveis da CAIXA e filtre por estado, cidade, tipo, preço, desconto e modalidade de venda.</p>
    <h2>Catálogo por estado</h2>
    <ul>${catalog.states.map(state => `<li><a href="/estado/${state.uf.toLowerCase()}">${escapeHtml(state.name)}</a> — ${formatNumber(state.stats.total)} imóveis</li>`).join('')}</ul>
  </main>`
}

function renderStateBody(state) {
  const discount = formatPercent(state.stats.maxDiscount)
  const cities = state.cities.filter(city => city.items.length >= 3)
  return `<main class="seo-static-page">
    <nav aria-label="Breadcrumb"><a href="/">Início</a> / <span>${escapeHtml(state.name)}</span></nav>
    <h1>Imóveis da CAIXA em ${escapeHtml(displayName(state.name))}</h1>
    <p>${formatNumber(state.stats.total)} imóveis estão disponíveis em ${escapeHtml(state.name)}, distribuídos em ${formatNumber(state.cities.length)} cidades${discount ? `, com descontos de até ${discount}` : ''}.</p>
    ${state.stats.minPrice > 0 ? `<p>Os preços encontrados começam em ${formatCurrency(state.stats.minPrice)}. ${state.stats.financed ? `${formatNumber(state.stats.financed)} imóveis indicam financiamento.` : ''}</p>` : ''}
    <h2>Cidades com imóveis da CAIXA em ${escapeHtml(state.name)}</h2>
    <ul>${cities.map(city => `<li><a href="/estado/${state.uf.toLowerCase()}/${city.slug}">${escapeHtml(city.city)}</a> — ${formatNumber(city.items.length)} imóveis</li>`).join('')}</ul>
    <h2>Sobre os dados</h2>
    <p>As informações são organizadas pelo Imovue a partir de listas públicas da CAIXA. Confirme preço, edital e condições diretamente na fonte oficial antes de tomar uma decisão.</p>
    <p><a href="/guias/como-comprar-imoveis-caixa">Veja o guia para comprar imóveis da CAIXA.</a></p>
  </main>`
}

function renderCityBody(city, catalog) {
  const state = catalog.states.find(item => item.uf === city.uf)
  const stats = statsFor(city.items)
  const discount = formatPercent(stats.maxDiscount)
  const properties = [...city.items].sort((a, b) => (b.percentualDesconto || 0) - (a.percentualDesconto || 0)).slice(0, 12)
  const related = (state?.cities || []).filter(item => item.slug !== city.slug && item.items.length >= 3).slice(0, 6)
  return `<main class="seo-static-page">
    <nav aria-label="Breadcrumb"><a href="/">Início</a> / <a href="/estado/${city.uf.toLowerCase()}">${escapeHtml(state?.name || city.uf)}</a> / <span>${escapeHtml(city.city)}</span></nav>
    <h1>Imóveis da CAIXA em ${escapeHtml(displayName(city.city))}, ${city.uf}</h1>
    <p>${formatNumber(stats.total)} imóveis da CAIXA estão disponíveis em ${escapeHtml(displayName(city.city))}.${stats.minPrice > 0 ? ` Preços a partir de ${formatCurrency(stats.minPrice)}.` : ''}${discount ? ` Maior desconto encontrado: ${discount}.` : ''}</p>
    <h2>Imóveis disponíveis em ${escapeHtml(displayName(city.city))}</h2>
    <ul>${properties.map(item => `<li><a href="/imovel/${encodeURIComponent(item.numeroImovel)}">${escapeHtml(displayName(item.tipoImovel || 'Imóvel'))} em ${escapeHtml(displayName(item.bairro || city.city))}</a>${item.precoVenda ? ` — ${formatCurrency(item.precoVenda)}` : ''}${validDiscount(item.percentualDesconto) ? ` — ${formatPercent(item.percentualDesconto)} de desconto` : ''}</li>`).join('')}</ul>
    ${related.length ? `<h2>Outras cidades de ${escapeHtml(displayName(state?.name || city.uf))}</h2><ul>${related.map(item => `<li><a href="/estado/${city.uf.toLowerCase()}/${item.slug}">${escapeHtml(displayName(item.city))}</a> — ${formatNumber(item.items.length)} imóveis</li>`).join('')}</ul>` : ''}
    <p><a href="/estado/${city.uf.toLowerCase()}">Voltar para imóveis da CAIXA em ${escapeHtml(displayName(state?.name || city.uf))}</a> · <a href="/guias/como-comprar-imoveis-caixa">Guia de compra</a></p>
  </main>`
}

function renderPropertyBody(item) {
  const seo = getImovelSeo(item)
  const stateName = UF_NOMES[String(item.uf).toUpperCase()] || item.uf
  const cityPath = `/estado/${String(item.uf).toLowerCase()}/${slugify(item.cidade)}`
  const rows = [
    ['Preço de venda', item.precoVenda ? formatCurrency(item.precoVenda) : 'Não informado'],
    ['Valor de avaliação', item.valorAvaliacao ? formatCurrency(item.valorAvaliacao) : 'Não informado'],
    ['Desconto', validDiscount(item.percentualDesconto) ? formatPercent(item.percentualDesconto) : 'Não informado'],
    ['Modalidade', item.modalidadeVenda || 'Não informado'],
    ['Financiamento', item.financiamento || 'Não informado'],
  ]
  return `<main class="seo-static-page">
    <nav aria-label="Breadcrumb"><a href="/">Brasil</a> / <a href="/estado/${String(item.uf).toLowerCase()}">${escapeHtml(stateName)}</a> / <a href="${cityPath}">${escapeHtml(item.cidade)}</a> / <span>${escapeHtml(item.tipoImovel || 'Imóvel')}</span></nav>
    <h1>${escapeHtml(seo.title)}</h1>
    <p>${escapeHtml(seo.description)}</p>
    <h2>Informações do imóvel</h2>
    <dl>${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
    ${item.descricao ? `<h2>Descrição</h2><p>${escapeHtml(item.descricao)}</p>` : ''}
    <p>Os dados são públicos e devem ser confirmados no edital e no site oficial da CAIXA.</p>
    ${item.urlOficial ? `<p><a href="${escapeHtml(item.urlOficial)}" rel="nofollow noopener">Ver informações no site oficial da CAIXA</a></p>` : ''}
    <p><a href="${cityPath}">Mais imóveis em ${escapeHtml(item.cidade)}</a> · <a href="/estado/${String(item.uf).toLowerCase()}">Imóveis em ${escapeHtml(stateName)}</a></p>
  </main>`
}

function renderGuidesIndexBody(articles) {
  return `<main class="seo-static-page">
    <h1>Guias sobre imóveis da CAIXA: compra, riscos, documentação e descontos</h1>
    <p>Aprenda a analisar imóveis da CAIXA com desconto, entender modalidades de venda, calcular custos, avaliar riscos e tomar decisões mais informadas.</p>
    ${[...new Set(articles.map(article => article.category))].map(category => `<section><h2>${escapeHtml(category)}</h2><ul>${articles.filter(article => article.category === category).map(article => `<li><a href="/guias/${article.slug}">${escapeHtml(article.title)}</a> — ${escapeHtml(article.description)}</li>`).join('')}</ul></section>`).join('')}
  </main>`
}

function renderGuideBody(article, catalog) {
  return `<main class="seo-static-page">
    <nav aria-label="Breadcrumb"><a href="/">Início</a> / <a href="/guias">Guias</a> / <span>${escapeHtml(article.category)}</span></nav>
    <h1>${escapeHtml(article.title)}</h1>
    <p>${escapeHtml(article.description)}</p>
    <p>Por ${escapeHtml(article.author)} · Atualizado em ${formatDate(article.dateModified)}</p>
    <article>${staticGuideContent(article, catalog)}</article>
    ${article.faq?.length ? `<section><h2>Perguntas frequentes</h2><dl>${article.faq.map(item => `<div><dt>${escapeHtml(item.question)}</dt><dd>${escapeHtml(item.answer)}</dd></div>`).join('')}</dl></section>` : ''}
    <p><a href="/guias">Ver todos os guias</a></p>
  </main>`
}

function renderInstitutionalBody(path) {
  const fileMap = {
    '/sobre': 'pages/institucional/SobrePage.vue',
    '/contato': 'pages/institucional/ContatoPage.vue',
    '/metodologia': 'pages/institucional/MetodologiaPage.vue',
    '/fontes-dos-dados': 'pages/institucional/FontesPage.vue',
    '/politica-editorial': 'pages/institucional/PoliticaEditorialPage.vue',
    '/termos': 'pages/legal/TermosPage.vue',
    '/privacidade': 'pages/legal/PrivacidadePage.vue',
    '/aviso-legal': 'pages/legal/AvisoLegalPage.vue',
  }
  return `<main class="seo-static-page">${sourceTemplate(resolve(SOURCE_DIR, fileMap[path]))}</main>`
}

function renderHead(baseHtml, seo) {
  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi, '')
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>\s*/gi, '')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, '')
  const fullTitle = `${seo.title} | ${SITE_NAME}`
  const jsonLd = seo.jsonLd?.length ? `<script type="application/ld+json" data-seo-jsonld>${jsonForHtml(seo.jsonLd)}</script>` : ''
  const head = `
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(seo.description)}" />
  <meta name="robots" content="${escapeHtml(seo.robots || 'index,follow')}" />
  <link rel="canonical" href="${escapeHtml(seo.canonical)}" />
  <meta property="og:type" content="${escapeHtml(seo.ogType || 'website')}" />
  <meta property="og:title" content="${escapeHtml(fullTitle)}" />
  <meta property="og:description" content="${escapeHtml(seo.description)}" />
  <meta property="og:url" content="${escapeHtml(seo.canonical)}" />
  <meta property="og:image" content="${escapeHtml(seo.ogImage)}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(seo.description)}" />
  <meta name="twitter:image" content="${escapeHtml(seo.ogImage)}" />
  ${jsonLd}`
  return html.replace('</head>', `${head}\n</head>`)
}

function renderPage(seo, body) {
  return renderHead(BASE_HTML, seo).replace(/<div id="app"><\/div>/, `<div id="app">${body}</div>`)
}

function writePage(path, seo, body) {
  const target = path === '/' ? resolve(DIST_DIR, 'index.html') : resolve(DIST_DIR, `${path.replace(/^\//, '')}.html`)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, renderPage(seo, body))
}

function main() {
  const catalog = loadCatalog()
  const articles = loadArticles()
  writePage('/', getHomeSeo(), renderHomeBody(catalog))
  writePage('/imoveis', getListagemSeo(), renderListBody(catalog))

  for (const state of catalog.states) {
    writePage(`/estado/${state.uf.toLowerCase()}`, getEstadoSeo({ uf: state.uf, name: state.name, stats: state.stats, cityCount: state.cities.length }), renderStateBody(state))
    for (const city of state.cities) {
      writePage(`/estado/${state.uf.toLowerCase()}/${city.slug}`, getCidadeSeo({
        uf: state.uf,
        stateName: state.name,
        city: city.city,
        count: city.items.length,
        minPrice: statsFor(city.items).minPrice,
        maxDiscount: statsFor(city.items).maxDiscount,
      }), renderCityBody(city, catalog))
    }
  }

  const propertiesToPrerender = selectPrerenderProperties(catalog.properties)
  const generatedProperties = new Set()
  for (const item of propertiesToPrerender) {
    if (!item.numeroImovel || generatedProperties.has(String(item.numeroImovel))) continue
    generatedProperties.add(String(item.numeroImovel))
    writePage(`/imovel/${encodeURIComponent(item.numeroImovel)}`, getImovelSeo(item), renderPropertyBody(item))
  }

  writePage('/guias', getGuidesIndexSeo(), renderGuidesIndexBody(articles))
  for (const article of articles) writePage(`/guias/${article.slug}`, getGuideSeo(article), renderGuideBody(article, catalog))

  for (const path of ['/sobre', '/contato', '/metodologia', '/fontes-dos-dados', '/politica-editorial', '/termos', '/privacidade', '/aviso-legal']) {
    writePage(path, getInstitutionalSeo(path), renderInstitutionalBody(path))
  }

  for (const [path, title, description] of [
    ['/dashboard', 'Radar de Oportunidades', 'Radar de imóveis da CAIXA com score de oportunidade.'],
    ['/mapa', 'Mapa de Imóveis', 'Visualize imóveis da CAIXA no mapa interativo.'],
    ['/favoritos', 'Favoritos', 'Seus imóveis favoritos salvos localmente.'],
  ]) {
    const seo = getNotFoundSeo(path)
    writePage(path, { ...seo, title, description }, `<main class="seo-static-page"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></main>`)
  }

  const notFoundFile = resolve(DIST_DIR, '404.html')
  if (isFullPrerenderMode()) {
    writeFileSync(notFoundFile, renderPage(getNotFoundSeo('/404'), `<main class="seo-static-page"><h1>Página não encontrada</h1><p>A página que você procura não existe.</p><p><a href="/">Voltar para o início</a></p></main>`))
  } else if (existsSync(notFoundFile)) {
    // Sem 404.html, o Cloudflare Pages ativa o fallback SPA para os imóveis
    // que não couberam no limite de páginas estáticas do plano Free.
    unlinkSync(notFoundFile)
  }
  console.log(`✅ prerender: ${propertyPrerenderSummary(catalog.properties, propertiesToPrerender)}, ${catalog.byCity.size} cidades, ${articles.length} guias`)
}

main()
