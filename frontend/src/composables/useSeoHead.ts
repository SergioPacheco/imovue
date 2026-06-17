import { onMounted, onUnmounted } from 'vue'

export interface SeoHeadOptions {
  title: string
  description: string
  canonical?: string
  robots?: string
  ogType?: string
  ogImage?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

const SITE_NAME = 'Imovue'
const SITE_URL = 'https://imovue.com.br'
const DEFAULT_IMAGE = `${SITE_URL}/logo.svg`

function setMeta(name: string, content: string, attr = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!content) { el?.remove(); return }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!href) { el?.remove(); return }
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function setJsonLd(data: Record<string, unknown> | Record<string, unknown>[] | undefined) {
  const existing = document.querySelector('script[data-seo-jsonld]')
  existing?.remove()
  if (!data) return
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-seo-jsonld', '')
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

export function useSeoHead(opts: SeoHeadOptions) {
  const fullTitle = `${opts.title} | ${SITE_NAME}`
  const canonical = opts.canonical || `${SITE_URL}${window.location.pathname}`
  const robots = opts.robots || 'index,follow'
  const ogType = opts.ogType || 'website'
  const image = opts.ogImage || DEFAULT_IMAGE

  onMounted(() => {
    document.title = fullTitle
    setMeta('description', opts.description)
    setMeta('robots', robots)

    // Open Graph
    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', opts.description, 'property')
    setMeta('og:type', ogType, 'property')
    setMeta('og:url', canonical, 'property')
    setMeta('og:image', image, 'property')
    setMeta('og:site_name', SITE_NAME, 'property')
    setMeta('og:locale', 'pt_BR', 'property')

    // Twitter
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', opts.description)
    setMeta('twitter:image', image)

    // Canonical
    setLink('canonical', canonical)

    // JSON-LD
    setJsonLd(opts.jsonLd)
  })

  onUnmounted(() => {
    // Clean up JSON-LD on unmount
    document.querySelector('script[data-seo-jsonld]')?.remove()
  })
}

// Pre-built JSON-LD generators
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Plataforma de pesquisa e análise de imóveis da Caixa Econômica Federal com desconto.',
    publisher: organizationJsonLd(),
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_IMAGE,
    contactPoint: { '@type': 'ContactPoint', email: 'contato@imovue.com.br', contactType: 'customer service' },
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

export function articleJsonLd(opts: { title: string; description: string; url: string; datePublished: string; dateModified: string; author?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url.startsWith('http') ? opts.url : `${SITE_URL}${opts.url}`,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: organizationJsonLd(),
  }
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  }
}
