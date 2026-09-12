import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { runInNewContext } from 'vm'
import { fileURLToPath } from 'url'
import { slugify } from '../src/seo/seo.js'
import { selectPrerenderProperties } from './property-prerender-policy.js'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const FRONTEND_DIR = resolve(SCRIPT_DIR, '..')
const DATA_DIR = resolve(FRONTEND_DIR, 'public/data')
const OUTPUT_DIR = resolve(FRONTEND_DIR, 'dist')
const SITE_URL = 'https://imovue.com.br'
const MAX_URLS_PER_SITEMAP = 5000
// A coleta de dados altera as páginas de estados, cidades e imóveis. O valor
// pode ser fixado pelo ambiente do deploy; no build normal, a data do build é
// uma aproximação válida porque o conteúdo estático foi regenerado junto.
const DATA_LASTMOD = process.env.SEO_LASTMOD || new Date().toISOString().slice(0, 10)

mkdirSync(OUTPUT_DIR, { recursive: true })

function xmlEscape(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function urlEntry(loc, { lastmod, priority } = {}) {
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}${priority ? `\n    <priority>${priority}</priority>` : ''}\n  </url>`
}

function urlset(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
}

function sitemapIndex(files) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files.map(file => `  <sitemap>\n    <loc>${SITE_URL}/${file}</loc>\n  </sitemap>`).join('\n')}\n</sitemapindex>\n`
}

function loadArticles() {
  const source = readFileSync(resolve(FRONTEND_DIR, 'src/data/articles.ts'), 'utf8')
  const match = source.match(/export const articles:\s*Article\[\]\s*=\s*(\[[\s\S]*?\])\s*\n\n\/\/ Ordem/)
  if (!match) throw new Error('Não foi possível ler os metadados dos guias.')
  return runInNewContext(`(${match[1]})`)
}

function loadCatalog() {
  const manifest = JSON.parse(readFileSync(resolve(DATA_DIR, 'manifest.json'), 'utf8'))
  const states = []
  const cities = new Map()
  const properties = new Map()

  for (const entry of manifest) {
    const file = resolve(DATA_DIR, `${entry.uf}.json`)
    if (!existsSync(file)) continue
    const items = JSON.parse(readFileSync(file, 'utf8'))
    states.push(entry.uf)
    for (const item of items) {
      const uf = String(item.uf || entry.uf).toLowerCase()
      const city = item.cidade || ''
      const key = `${uf}/${slugify(city)}`
      if (!cities.has(key)) cities.set(key, { uf, city, count: 0 })
      cities.get(key).count++
      if (item.numeroImovel) properties.set(String(item.numeroImovel), item)
    }
  }
  return { states, cities, properties }
}

function main() {
  const catalog = loadCatalog()
  const articles = loadArticles()
  const staticEntries = [
    urlEntry(`${SITE_URL}/`, { lastmod: DATA_LASTMOD, priority: '1.0' }),
    urlEntry(`${SITE_URL}/imoveis`, { lastmod: DATA_LASTMOD, priority: '0.9' }),
    urlEntry(`${SITE_URL}/sobre`, { priority: '0.6' }),
    urlEntry(`${SITE_URL}/contato`, { priority: '0.4' }),
    urlEntry(`${SITE_URL}/metodologia`, { priority: '0.6' }),
    urlEntry(`${SITE_URL}/fontes-dos-dados`, { priority: '0.5' }),
    urlEntry(`${SITE_URL}/politica-editorial`, { priority: '0.4' }),
    urlEntry(`${SITE_URL}/aviso-legal`, { priority: '0.3' }),
    urlEntry(`${SITE_URL}/guias`, { priority: '0.9' }),
    ...articles.map(article => urlEntry(`${SITE_URL}/guias/${article.slug}`, { lastmod: article.dateModified, priority: '0.7' })),
  ]
  writeFileSync(resolve(OUTPUT_DIR, 'sitemap-static.xml'), urlset(staticEntries))

  const stateEntries = catalog.states.map(uf => urlEntry(`${SITE_URL}/estado/${uf.toLowerCase()}`, { lastmod: DATA_LASTMOD, priority: '0.8' }))
  writeFileSync(resolve(OUTPUT_DIR, 'sitemap-estados.xml'), urlset(stateEntries))

  const cityEntries = [...catalog.cities.values()]
    .filter(city => city.count >= 3)
    .map(city => urlEntry(`${SITE_URL}/estado/${city.uf}/${slugify(city.city)}`, { lastmod: DATA_LASTMOD, priority: '0.7' }))
  writeFileSync(resolve(OUTPUT_DIR, 'sitemap-cidades.xml'), urlset(cityEntries))

  const propertyFiles = []
  const properties = selectPrerenderProperties([...catalog.properties.values()])
  for (let start = 0; start < properties.length; start += MAX_URLS_PER_SITEMAP) {
    const fileName = `sitemap-imoveis-${propertyFiles.length + 1}.xml`
    const entries = properties.slice(start, start + MAX_URLS_PER_SITEMAP).map(item => urlEntry(`${SITE_URL}/imovel/${encodeURIComponent(item.numeroImovel)}`, { lastmod: DATA_LASTMOD, priority: '0.5' }))
    writeFileSync(resolve(OUTPUT_DIR, fileName), urlset(entries))
    propertyFiles.push(fileName)
  }

  const files = ['sitemap-static.xml', 'sitemap-estados.xml', 'sitemap-cidades.xml', ...propertyFiles]
  writeFileSync(resolve(OUTPUT_DIR, 'sitemap.xml'), sitemapIndex(files))
  console.log(`✅ sitemap: ${staticEntries.length + stateEntries.length + cityEntries.length + properties.length} URLs em ${files.length} arquivos`)
}

main()
