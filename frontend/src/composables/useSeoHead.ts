import { onMounted, onUnmounted, watchEffect, type WatchStopHandle } from 'vue'
import {
  DEFAULT_IMAGE,
  SOCIAL_IMAGE,
  SITE_NAME,
  SITE_URL,
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  getCidadeSeo,
  getEstadoSeo,
  getGuideSeo,
  getGuidesIndexSeo,
  getHomeSeo,
  getImovelSeo,
  getInstitutionalSeo,
  getListagemSeo,
  getNotFoundSeo,
  organizationJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from '@/seo/seo.js'

export interface SeoHeadOptions {
  title: string
  description: string
  canonical?: string
  robots?: string
  ogType?: string
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
  ogImageAlt?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

type SeoHeadSource = SeoHeadOptions | null | (() => SeoHeadOptions | null)

function setMeta(name: string, content: string, attr = 'name') {
  const selector = `meta[${attr}="${name}"]`
  let el = document.querySelector(selector) as HTMLMetaElement | null
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

function setJsonLd(data: SeoHeadOptions['jsonLd']) {
  document.querySelectorAll('script[data-seo-jsonld]').forEach(script => script.remove())
  if (!data) return
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-seo-jsonld', '')
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

export function useSeoHead(source: SeoHeadSource) {
  let stop: WatchStopHandle | undefined

  onMounted(() => {
    stop = watchEffect(() => {
      const opts = typeof source === 'function' ? source() : source
      if (!opts) return
      const fullTitle = `${opts.title} | ${SITE_NAME}`
      const canonical = opts.canonical || `${SITE_URL}${window.location.pathname}`
      const robots = opts.robots || 'index,follow'
      const image = opts.ogImage || SOCIAL_IMAGE
      const socialTitle = opts.ogTitle ? `${opts.ogTitle} | ${SITE_NAME}` : fullTitle
      const socialDescription = opts.ogDescription || opts.description
      const imageAlt = opts.ogImageAlt || 'Imovue — imóveis da CAIXA com desconto'

      document.title = fullTitle
      setMeta('description', opts.description)
      setMeta('robots', robots)
      setMeta('og:title', socialTitle, 'property')
      setMeta('og:description', socialDescription, 'property')
      setMeta('og:type', opts.ogType || 'website', 'property')
      setMeta('og:url', canonical, 'property')
      setMeta('og:image', image, 'property')
      setMeta('og:image:alt', imageAlt, 'property')
      setMeta('og:site_name', SITE_NAME, 'property')
      setMeta('og:locale', 'pt_BR', 'property')
      setMeta('twitter:card', 'summary_large_image')
      setMeta('twitter:title', socialTitle)
      setMeta('twitter:description', socialDescription)
      setMeta('twitter:image', image)
      setMeta('twitter:image:alt', imageAlt)
      setLink('canonical', canonical)
      setJsonLd(opts.jsonLd)
    })
  })

  onUnmounted(() => {
    stop?.()
    document.querySelectorAll('script[data-seo-jsonld]').forEach(script => script.remove())
  })
}

export {
  DEFAULT_IMAGE,
  SOCIAL_IMAGE,
  SITE_NAME,
  SITE_URL,
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  getCidadeSeo,
  getEstadoSeo,
  getGuideSeo,
  getGuidesIndexSeo,
  getHomeSeo,
  getImovelSeo,
  getInstitutionalSeo,
  getListagemSeo,
  getNotFoundSeo,
  organizationJsonLd,
  webPageJsonLd,
  websiteJsonLd,
}
