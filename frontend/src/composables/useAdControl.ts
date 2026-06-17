import { computed } from 'vue'
import { useRoute } from 'vue-router'

// Pages where ads should NOT appear
const NO_ADS_PATHS = [
  '/favoritos',
  '/privacidade',
  '/termos',
  '/contato',
]

const NO_ADS_PREFIXES = [
  '/mapa', // functional page
]

export function useAdControl() {
  const route = useRoute()

  const shouldShowAds = computed(() => {
    const path = route.path
    if (NO_ADS_PATHS.includes(path)) return false
    if (NO_ADS_PREFIXES.some(p => path.startsWith(p))) return false
    if (route.meta?.noAds) return false
    if (route.meta?.noindex) return false
    return true
  })

  return { shouldShowAds }
}
