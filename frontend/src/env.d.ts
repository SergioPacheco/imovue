declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.css' {}

declare module '*.png' {
  const src: string
  export default src
}

declare module '@/seo/seo.js' {
  export const DEFAULT_IMAGE: string
  export const SITE_NAME: string
  export const SITE_URL: string
  export const UF_NOMES: Record<string, string>
  export const articleJsonLd: (...args: any[]) => any
  export const breadcrumbJsonLd: (...args: any[]) => any
  export const faqJsonLd: (...args: any[]) => any
  export const getCidadeSeo: (...args: any[]) => any
  export const getEstadoSeo: (...args: any[]) => any
  export const getGuideSeo: (...args: any[]) => any
  export const getGuidesIndexSeo: (...args: any[]) => any
  export const getHomeSeo: (...args: any[]) => any
  export const getImovelSeo: (...args: any[]) => any
  export const getInstitutionalSeo: (...args: any[]) => any
  export const getListagemSeo: (...args: any[]) => any
  export const getNotFoundSeo: (...args: any[]) => any
  export const organizationJsonLd: (...args: any[]) => any
  export const webPageJsonLd: (...args: any[]) => any
  export const websiteJsonLd: (...args: any[]) => any
}
