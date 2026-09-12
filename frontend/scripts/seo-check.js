import { existsSync, readdirSync, readFileSync } from 'fs'
import { join, relative, resolve } from 'path'
import { fileURLToPath } from 'url'

const SCRIPT_DIR = resolve(fileURLToPath(new URL('.', import.meta.url)))
const DIST_DIR = resolve(SCRIPT_DIR, '..', 'dist')

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesIn(path) : entry.name.endsWith('.html') ? [path] : []
  })
}

function allFilesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? allFilesIn(path) : [path]
  })
}

function matches(html, expression) {
  return html.match(expression) || []
}

function contentOf(html, tag, attributes) {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*${attributes}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return match?.[1]?.trim() || ''
}

function attributeContent(html, expression) {
  return html.match(expression)?.[1]?.trim() || ''
}

function visibleText(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function main() {
  if (!existsSync(DIST_DIR)) throw new Error('dist não existe. Execute npm run build antes de npm run seo:check.')
  const htmlFiles = filesIn(DIST_DIR)
  const totalFiles = allFilesIn(DIST_DIR).length
  const errors = []
  const warnings = []
  const indexable = []
  const seen = { title: new Map(), description: new Map(), canonical: new Map() }

  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    const route = relative(DIST_DIR, file)
    const robots = attributeContent(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']*)/i) || attributeContent(html, /<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']robots["']/i)
    const isIndexable = !/noindex/i.test(robots)
    const titleTags = matches(html, /<title\b[^>]*>[\s\S]*?<\/title>/gi)
    const description = attributeContent(html, /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)/i) || attributeContent(html, /<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i)
    const canonicalTags = matches(html, /<link\b[^>]*rel=["']canonical["'][^>]*>/gi)
    const canonical = attributeContent(canonicalTags[0] || '', /href=["']([^"']*)/i)
    const h1Tags = matches(html, /<h1\b[^>]*>[\s\S]*?<\/h1>/gi)
    const jsonLdTags = matches(html, /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi)
    const requiredOg = ['og:title', 'og:description', 'og:url', 'og:type', 'og:image', 'og:site_name']
    const requiredTwitter = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']

    if (titleTags.length !== 1) errors.push(`${route}: esperado exatamente 1 <title>, encontrado ${titleTags.length}`)
    if (!description) errors.push(`${route}: meta description ausente`)
    if (canonicalTags.length !== 1 || !canonical) errors.push(`${route}: esperado exatamente 1 canonical`)
    if (!attributeContent(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']*)/i)) errors.push(`${route}: meta robots ausente`)
    if (h1Tags.length !== 1) errors.push(`${route}: esperado exatamente 1 H1, encontrado ${h1Tags.length}`)
    if (!visibleText(h1Tags[0] || '').trim()) errors.push(`${route}: H1 vazio`)
    for (const property of requiredOg) {
      if (!new RegExp(`<meta\\b[^>]*property=["']${property}["'][^>]*content=["'][^"']+`, 'i').test(html)) errors.push(`${route}: ${property} ausente`)
    }
    for (const name of requiredTwitter) {
      if (!new RegExp(`<meta\\b[^>]*name=["']${name}["'][^>]*content=["'][^"']+`, 'i').test(html)) errors.push(`${route}: ${name} ausente`)
    }
    for (const tag of jsonLdTags) {
      const content = tag.replace(/^<[\s\S]*?>/, '').replace(/<\/script>\s*$/i, '').trim()
      try { JSON.parse(content) } catch { errors.push(`${route}: JSON-LD inválido`) }
    }
    if (isIndexable) {
      if (visibleText(html).length < 80) errors.push(`${route}: página indexável sem conteúdo textual suficiente`)
      indexable.push(route)
      const title = contentOf(html, 'title', '')
      for (const [key, value] of [['title', title], ['description', description], ['canonical', canonical]]) {
        const prior = seen[key].get(value)
        if (prior) errors.push(`${route}: ${key} duplicado com ${prior}`)
        else seen[key].set(value, route)
      }
    }
  }

  for (const sample of ['index.html', 'estado/sp.html', 'estado/sc/florianopolis.html', 'guias/como-comprar-imoveis-caixa.html']) {
    if (!htmlFiles.some(file => relative(DIST_DIR, file) === sample)) errors.push(`amostra ausente: ${sample}`)
  }

  if (totalFiles > 20000) {
    const message = `dist tem ${totalFiles} arquivos; o limite do Cloudflare Pages Free é 20.000. Configure o plano pago (até 100.000 com PAGES_WRANGLER_MAJOR_VERSION=4) ou reduza a cobertura prerenderizada.`
    if (process.env.PAGES_FREE_PLAN === '1') errors.push(message)
    else warnings.push(message)
  }

  if (errors.length) {
    console.error(`SEO check falhou com ${errors.length} problema(s):`)
    for (const error of errors.slice(0, 80)) console.error(`- ${error}`)
    if (errors.length > 80) console.error(`- ... e mais ${errors.length - 80}`)
    process.exitCode = 1
    return
  }
  if (warnings.length) console.warn(`⚠️ SEO check: ${warnings.join(' | ')}`)
  console.log(`✅ SEO check: ${htmlFiles.length} HTMLs verificados, ${indexable.length} indexáveis, ${totalFiles} arquivos no total, sem duplicidades críticas.`)
}

main()
