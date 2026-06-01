<template>
  <div :class="containerClass">
    <div :class="innerClass">
      <div class="flex-1">
        <h3 :class="titleClass">{{ title }}</h3>
        <p :class="descClass">{{ description }}</p>
      </div>
      <div :class="actionsClass">
        <a :href="affiliateUrl" target="_blank" rel="nofollow sponsored noopener" :class="btnClass">
          {{ buttonText }}
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
  title: 'Antes de dar seu primeiro lance, aprenda a analisar os riscos',
  description: 'Imóveis da Caixa podem ter desconto, mas também podem envolver edital, ocupação, débitos, financiamento, comissão e prazos. Veja um treinamento recomendado para entender o processo antes de fazer proposta.',
  buttonText: 'Aprender antes de dar lance',
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

const btnClass = computed(() => {
  const base = 'inline-block font-semibold rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5'
  if (props.variant === 'compact') return `${base} bg-brand-500 text-white text-xs px-4 py-2`
  return `${base} bg-brand-500 text-white text-sm px-5 py-2.5`
})
</script>
