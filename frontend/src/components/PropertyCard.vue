<template>
  <div class="card overflow-hidden group relative">
    <router-link :to="`/imoveis/${imovel.numeroImovel}`" class="block">
      <PropertyImage :tipo="imovel.tipoImovel" :numero="imovel.numeroImovel">
        <div class="absolute top-3 left-3 flex gap-1.5">
          <span v-if="imovel.tipoImovel" class="badge badge-type">{{ imovel.tipoImovel }}</span>
          <span v-if="descontoValido && imovel.percentualDesconto! > 40" class="badge badge-hot">🔥 Oportunidade</span>
        </div>
        <div v-if="descontoValido" class="absolute top-3 right-3">
          <span class="badge badge-discount text-sm font-bold">-{{ imovel.percentualDesconto!.toFixed(1) }}%</span>
        </div>
      </PropertyImage>

      <div class="p-4">
        <p class="text-xs font-medium text-gray-500 mb-0.5">{{ imovel.cidade }}</p>
        <h3 class="font-semibold text-gray-900 group-hover:text-brand-500 transition-colors truncate">{{ imovel.bairro }}</h3>
        <p class="text-xs text-gray-400 truncate mt-0.5">
          <a :href="mapsLink" target="_blank" rel="noopener" @click.stop class="hover:text-brand-500 hover:underline inline-flex items-center gap-0.5">
            <svg class="w-3.5 h-3.5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
            {{ imovel.endereco }}
          </a>
        </p>

        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-xl font-bold text-gray-900">R$ {{ formatCurrency(imovel.precoVenda) }}</span>
        </div>
        <p v-if="imovel.valorAvaliacao" class="text-xs text-gray-400 line-through">
          Avaliação: R$ {{ formatCurrency(imovel.valorAvaliacao) }}
        </p>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-gray-500">
          <span v-if="imovel.areaPrivativa" class="inline-flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>
            {{ imovel.areaPrivativa }}m²
          </span>
          <span v-if="imovel.areaTerreno" class="inline-flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75"/></svg>
            {{ imovel.areaTerreno }}m²
          </span>
          <span v-if="imovel.quartos" class="inline-flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"/></svg>
            {{ imovel.quartos }} qto{{ imovel.quartos > 1 ? 's' : '' }}
          </span>
          <span v-if="imovel.vagas" class="inline-flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-2.735a2.056 2.056 0 00-1.58.86A17.902 17.902 0 004.477 17.626"/></svg>
            {{ imovel.vagas }} vaga{{ imovel.vagas > 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Termômetro de preço -->
        <div v-if="analise" class="mt-2">
          <span v-if="analise.classificacao === 'sub'"
            class="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            ✅ Abaixo da média local
          </span>
          <span v-else-if="analise.classificacao === 'sobre'"
            class="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            ⚠️ Acima da média local
          </span>
        </div>
      </div>
    </router-link>

    <!-- Rodapé -->
    <div class="px-4 pb-4 pt-0">
      <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
        <button @click="fav.toggle(imovel)"
          class="flex items-center gap-1 text-xs font-medium transition-colors"
          :class="fav.isFav(imovel.numeroImovel) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'">
          <svg class="w-4 h-4" :fill="fav.isFav(imovel.numeroImovel) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          {{ fav.isFav(imovel.numeroImovel) ? 'Favoritado' : 'Favoritar' }}
        </button>
        <span class="text-xs text-gray-400">{{ imovel.modalidadeVenda }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Imovel } from '@/types'
import { formatCurrency } from '@/utils/format'
import { useFavoritos } from '@/composables/useFavoritos'
import PropertyImage from '@/components/PropertyImage.vue'

const props = defineProps<{
  imovel: Imovel
  analise?: { classificacao: 'sub' | 'normal' | 'sobre'; ratio: number } | null
}>()

const fav = useFavoritos()

const descontoValido = computed(() =>
  !!props.imovel.percentualDesconto && props.imovel.percentualDesconto > 0 && props.imovel.percentualDesconto <= 100
)

const mapsLink = computed(() =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${props.imovel.endereco}, ${props.imovel.bairro}, ${props.imovel.cidade} - ${props.imovel.uf}`)}`
)
</script>
