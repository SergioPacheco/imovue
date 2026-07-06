<template>
  <div v-if="affiliateUrl" :class="containerClass">
    <div :class="innerClass">
      <div class="flex-1">
        <h3 :class="titleClass">{{ title }}</h3>
        <p :class="descClass">{{ description }}</p>
      </div>
      <div :class="actionsClass">
        <a :href="affiliateUrl" target="_blank" rel="nofollow sponsored noopener" class="affiliate-btn" :class="btnSizeClass">
          <span class="relative z-10 flex items-center gap-2">
            <span>{{ buttonText }}</span>
          </span>
          <span class="affiliate-btn-shimmer"></span>
          <span class="affiliate-btn-glow"></span>
        </a>
        <p class="text-[10px] text-gray-400 mt-2 leading-tight">{{ AFFILIATE_CONFIG.disclosure }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AFFILIATE_CONFIG } from '@/config/affiliate'

const props = withDefaults(defineProps<{
  variant?: 'top' | 'compact' | 'sidebar' | 'afterList'
  title?: string
  description?: string
  buttonText?: string
  affiliateUrl?: string
}>(), {
  variant: 'top',
  title: 'Encontrou um imóvel interessante?',
  description: 'Antes de fazer uma proposta, entenda os principais riscos: edital, ocupação, débitos, financiamento, prazos e custo real da compra.',
  buttonText: 'Aprender antes de dar lance →',
  affiliateUrl: AFFILIATE_CONFIG.courseUrl,
})

const containerClass = computed(() => {
  const base = 'rounded-xl border'
  if (props.variant === 'compact') return `${base} border-blue-100 bg-blue-50/50 p-4`
  if (props.variant === 'afterList') return `${base} border-brand-100 bg-gradient-to-r from-brand-50 to-blue-50 p-6 sm:p-8`
  return `${base} border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 sm:p-6`
})

const innerClass = computed(() => {
  if (props.variant === 'compact') return 'flex flex-col sm:flex-row sm:items-center gap-3'
  return 'flex flex-col sm:flex-row sm:items-center gap-4'
})

const titleClass = computed(() => {
  if (props.variant === 'compact') return 'font-semibold text-gray-800 text-sm'
  return 'font-bold text-gray-900 text-base sm:text-lg'
})

const descClass = computed(() => {
  if (props.variant === 'compact') return 'text-xs text-gray-600 mt-1'
  return 'text-sm text-gray-600 mt-2 leading-relaxed'
})

const actionsClass = computed(() => {
  if (props.variant === 'compact') return 'shrink-0'
  return 'shrink-0 sm:text-right'
})

const btnSizeClass = computed(() => {
  if (props.variant === 'compact') return 'text-xs px-4 py-2.5'
  return 'text-sm px-6 py-3'
})
</script>

<style scoped>
.affiliate-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #1e56a0 0%, #2563eb 50%, #1e56a0 100%);
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 16px -4px rgba(30, 86, 160, 0.5), inset 0 1px 0 rgba(255,255,255,0.15);
}

.affiliate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px -4px rgba(30, 86, 160, 0.65), inset 0 1px 0 rgba(255,255,255,0.2);
}

.affiliate-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px -2px rgba(30, 86, 160, 0.4);
}

/* Shimmer que percorre o botão */
.affiliate-btn-shimmer {
  position: absolute;
  top: 0;
  left: -130%;
  width: 60%;
  height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,0.4), transparent);
  transform: skewX(-18deg);
  animation: affiliateShimmer 3.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes affiliateShimmer {
  0%, 100% { left: -130%; }
  50% { left: 130%; }
}

/* Glow pulse sutil ao redor */
.affiliate-btn-glow {
  position: absolute;
  inset: -2px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(30, 86, 160, 0.3));
  filter: blur(8px);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: -1;
}

.affiliate-btn:hover .affiliate-btn-glow {
  opacity: 1;
}
</style>
