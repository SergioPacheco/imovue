<template>
  <div :class="['relative overflow-hidden', sizeClass]" :style="{ background: bg }">
    <img v-if="imgOk" :src="imgUrl" :alt="tipo || 'Imóvel'" class="w-full h-full object-cover" @error="imgOk = false" />
    <svg v-else class="absolute inset-0 m-auto w-16 h-16 opacity-20 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path v-if="icon === 'casa'" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/>
      <path v-else-if="icon === 'apto'" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      <path v-else-if="icon === 'terreno'" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      <path v-else d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
    </svg>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{ tipo?: string | null; numero?: string; size?: 'sm' | 'lg' }>(), { size: 'sm' })

const imgOk = ref(true)
const imgUrl = computed(() => {
  if (!props.numero) return ''
  return `https://venda-imoveis.caixa.gov.br/fotos/F${props.numero.padStart(13, '0')}21.jpg`
})

const CORES: Record<string, string> = {
  Apartamento: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)',
  Casa: 'linear-gradient(135deg, #1a4731 0%, #2d7a54 100%)',
  Terreno: 'linear-gradient(135deg, #713f12 0%, #a16207 100%)',
  Comercial: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
  Sobrado: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)',
  Loja: 'linear-gradient(135deg, #831843 0%, #be185d 100%)',
  Sala: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
}
const bg = computed(() => imgOk.value ? '#e5e7eb' : (CORES[props.tipo || ''] || 'linear-gradient(135deg, #1e3a5f 0%, #334155 100%)'))
const icon = computed(() => {
  const t = (props.tipo || '').toLowerCase()
  if (t.includes('casa') || t.includes('sobrado')) return 'casa'
  if (t.includes('apart')) return 'apto'
  if (t.includes('terreno') || t.includes('lote') || t.includes('gleba')) return 'terreno'
  return 'comercial'
})
const sizeClass = computed(() => props.size === 'lg' ? 'h-64 sm:h-80 rounded-2xl' : 'h-40 rounded-t-xl')
</script>
