export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

/** Publica um evento no dataLayer para o Google Tag Manager. */
export function trackEvent(event: string, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ ...params, event })
}
