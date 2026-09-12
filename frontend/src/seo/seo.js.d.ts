export const SITE_NAME: string
export const SITE_URL: string
export const DEFAULT_IMAGE: string
export const UF_NOMES: Record<string, string>

export interface SeoData {
  title: string
  description: string
  canonical: string
  robots: string
  ogType: string
  ogImage: string
  ogTitle: string
  ogDescription: string
  ogImageAlt: string
  jsonLd: Record<string, unknown>[]
}

export function slugify(text: string): string
export function displayName(value: string): string
export function canonicalPath(pathname: string): string
export function formatNumber(value: number): string
export function formatCurrency(value: number, options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }): string
export function formatPercent(value: number): string
export function organizationJsonLd(): Record<string, unknown>
export function websiteJsonLd(): Record<string, unknown>
export function breadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown>
export function webPageJsonLd(options: { name: string; description: string; url: string }): Record<string, unknown>
export function articleJsonLd(options: Record<string, string>): Record<string, unknown>
export function faqJsonLd(items: { question: string; answer: string }[]): Record<string, unknown>
export function getHomeSeo(): SeoData
export function getListagemSeo(options?: { hasFilters?: boolean }): SeoData
export function getEstadoSeo(options: Record<string, unknown>): SeoData
export function getCidadeSeo(options: Record<string, unknown>): SeoData
export function getImovelSeo(imovel: any): SeoData
export function getGuideSeo(article: any): SeoData
export function getGuidesIndexSeo(): SeoData
export function getInstitutionalSeo(path: string): SeoData
export function getNotFoundSeo(path?: string): SeoData
