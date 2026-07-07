/**
 * Gerador de sitemap dinâmico para ImoVue
 * Lê os JSONs de dados e gera sitemap-index com divisões:
 * - sitemap-static.xml (páginas institucionais + guias)
 * - sitemap-estados.xml (27 estados)
 * - sitemap-cidades.xml (todas as cidades com imóveis)
 * - sitemap-imoveis-{n}.xml (imóveis em lotes de 5000)
 *
 * Executar: node scripts/generate-sitemap.js
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, '../public/data')
const OUTPUT_DIR = resolve(__dirname, '../dist')
const SITE_URL = 'https://imovue.com.br'
const TODAY = new Date().toISOString().split('T')[0]
const MAX_URLS_PER_SITEMAP = 5000

// --- Helpers ---

function xmlEscape(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function wrapUrlset(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`
}

function urlEntry(loc, opts = {}) {
  const parts = [`  <url>\n    <loc>${xmlEscape(loc)}</loc>`]
  if (opts.lastmod) parts.push(`    <lastmod>${opts.lastmod}</lastmod>`)
  if (opts.changefreq) parts.push(`    <changefreq>${opts.changefreq}</changefreq>`)
  if (opts.priority) parts.push(`    <priority>${opts.priority}</priority>`)
  parts.push(`  </url>`)
  return parts.join('\n')
}

function wrapSitemapIndex(sitemaps) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(s => `  <sitemap>\n    <loc>${SITE_URL}/${s.file}</loc>\n    <lastmod>${s.lastmod}</lastmod>\n  </sitemap>`).join('\n')}
</sitemapindex>`
}

// --- Load data ---

const manifest = JSON.parse(readFileSync(resolve(DATA_DIR, 'manifest.json'), 'utf-8'))

// Collect all cities and imoveis
const allCidades = new Map() // key: "uf/cidade-slug" -> { uf, cidade, count }
const allImoveis = [] // { uf, cidade, numero }

for (const entry of manifest) {
  const filePath = resolve(DATA_DIR, `${entry.uf}.json`)
  try {
    const imoveis = JSON.parse(readFileSync(filePath, 'utf-8'))
    const cidadesMap = new Map()

    for (const im of imoveis) {
      const cidadeSlug = slugify(im.cidade)
      const key = `${im.uf.toLowerCase()}/${cidadeSlug}`

      if (!cidadesMap.has(key)) {
        cidadesMap.set(key, { uf: im.uf, cidade: im.cidade, slug: cidadeSlug, count: 0 })
      }
      cidadesMap.get(key).count++

      allImoveis.push({ uf: im.uf, cidade: im.cidade, numero: im.numeroImovel })
    }

    for (const [key, val] of cidadesMap) {
      allCidades.set(key, val)
    }
  } catch (e) {
    console.warn(`Skipping ${entry.uf}: ${e.message}`)
  }
}

console.log(`📊 ${manifest.length} estados, ${allCidades.size} cidades, ${allImoveis.length} imóveis`)

// --- 1. sitemap-static.xml ---

const staticUrls = [
  urlEntry(`${SITE_URL}/`, { lastmod: TODAY, changefreq: 'daily', priority: '1.0' }),
  urlEntry(`${SITE_URL}/imoveis`, { lastmod: TODAY, changefreq: 'daily', priority: '0.9' }),
  urlEntry(`${SITE_URL}/sobre`, { changefreq: 'monthly', priority: '0.6' }),
  urlEntry(`${SITE_URL}/contato`, { changefreq: 'monthly', priority: '0.4' }),
  urlEntry(`${SITE_URL}/metodologia`, { changefreq: 'monthly', priority: '0.6' }),
  urlEntry(`${SITE_URL}/fontes-dos-dados`, { changefreq: 'monthly', priority: '0.5' }),
  urlEntry(`${SITE_URL}/politica-editorial`, { changefreq: 'monthly', priority: '0.4' }),
  urlEntry(`${SITE_URL}/guias`, { lastmod: TODAY, changefreq: 'weekly', priority: '0.9' }),
  urlEntry(`${SITE_URL}/termos`, { changefreq: 'monthly', priority: '0.3' }),
  urlEntry(`${SITE_URL}/privacidade`, { changefreq: 'monthly', priority: '0.3' }),
  urlEntry(`${SITE_URL}/aviso-legal`, { changefreq: 'monthly', priority: '0.3' }),
]

// Add guia pages from filesystem
const guiasDir = resolve(__dirname, '../src/pages/guia/conteudo')
try {
  const guiaFiles = readdirSync(guiasDir).filter(f => f.endsWith('.vue'))
  for (const file of guiaFiles) {
    const slug = file.replace('.vue', '').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
    // Use slug from router instead - just add known guia slugs
  }
} catch (e) { /* ignore */ }

// Known guia slugs from sitemap
const guiaSlugs = [
  'como-comprar-imoveis-caixa', 'diferenca-leilao-licitacao-venda-online',
  'riscos-imovel-ocupado', 'como-analisar-edital', 'como-consultar-matricula',
  'debitos-condominio-iptu', 'como-funciona-financiamento', 'como-utilizar-fgts',
  'como-calcular-itbi-escritura-registro', 'custo-total-compra',
  'preco-por-metro-quadrado', 'rentabilidade-aluguel', 'documentos-necessarios',
  'erros-comuns-iniciantes', 'checklist-antes-de-comprar',
  'vale-a-pena-comprar-imovel-caixa', 'quando-desconto-50-nao-compensa',
  'como-avaliar-liquidez-imovel', 'score-oportunidade-como-interpretamos',
  'imoveis-caixa-sao-paulo', 'imoveis-caixa-rio-de-janeiro',
  'imoveis-caixa-belo-horizonte', 'imoveis-caixa-curitiba',
  'imoveis-caixa-salvador', 'imoveis-caixa-goiania',
  'imoveis-caixa-recife', 'imoveis-caixa-fortaleza',
  'imoveis-caixa-porto-alegre', 'imoveis-caixa-florianopolis', 'imoveis-caixa-brasilia',
]
for (const slug of guiaSlugs) {
  staticUrls.push(urlEntry(`${SITE_URL}/guias/${slug}`, { changefreq: 'monthly', priority: '0.7' }))
}

writeFileSync(resolve(OUTPUT_DIR, 'sitemap-static.xml'), wrapUrlset(staticUrls))
console.log(`✅ sitemap-static.xml (${staticUrls.length} URLs)`)

// --- 2. sitemap-estados.xml ---

const estadoUrls = manifest.map(entry =>
  urlEntry(`${SITE_URL}/estado/${entry.uf.toLowerCase()}`, {
    lastmod: TODAY,
    changefreq: 'daily',
    priority: '0.8'
  })
)
writeFileSync(resolve(OUTPUT_DIR, 'sitemap-estados.xml'), wrapUrlset(estadoUrls))
console.log(`✅ sitemap-estados.xml (${estadoUrls.length} URLs)`)

// --- 3. sitemap-cidades.xml ---

const cidadeUrls = [...allCidades.values()]
  .filter(c => c.count >= 3) // Only cities with 3+ properties
  .map(c => urlEntry(`${SITE_URL}/estado/${c.uf.toLowerCase()}/${c.slug}`, {
    lastmod: TODAY,
    changefreq: 'daily',
    priority: '0.7'
  }))

writeFileSync(resolve(OUTPUT_DIR, 'sitemap-cidades.xml'), wrapUrlset(cidadeUrls))
console.log(`✅ sitemap-cidades.xml (${cidadeUrls.length} URLs)`)

// --- 4. sitemap-imoveis-{n}.xml ---

const imoveisFiles = []
for (let i = 0; i < allImoveis.length; i += MAX_URLS_PER_SITEMAP) {
  const batch = allImoveis.slice(i, i + MAX_URLS_PER_SITEMAP)
  const fileNum = Math.floor(i / MAX_URLS_PER_SITEMAP) + 1
  const fileName = `sitemap-imoveis-${fileNum}.xml`

  const urls = batch.map(im =>
    urlEntry(`${SITE_URL}/imovel/${im.numero}`, {
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '0.5'
    })
  )

  writeFileSync(resolve(OUTPUT_DIR, fileName), wrapUrlset(urls))
  imoveisFiles.push({ file: fileName, lastmod: TODAY })
  console.log(`✅ ${fileName} (${urls.length} URLs)`)
}

// --- 5. sitemap.xml (index) ---

const sitemapIndex = wrapSitemapIndex([
  { file: 'sitemap-static.xml', lastmod: TODAY },
  { file: 'sitemap-estados.xml', lastmod: TODAY },
  { file: 'sitemap-cidades.xml', lastmod: TODAY },
  ...imoveisFiles,
])

writeFileSync(resolve(OUTPUT_DIR, 'sitemap.xml'), sitemapIndex)
console.log(`\n🗺️  sitemap.xml (index) gerado com ${3 + imoveisFiles.length} sub-sitemaps`)
console.log(`📍 Total de URLs: ${staticUrls.length + estadoUrls.length + cidadeUrls.length + allImoveis.length}`)
