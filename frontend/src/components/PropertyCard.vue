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
          <a :href="mapsLink" target="_blank" rel="noopener" @click.stop class="hover:text-brand-500 hover:underline">
            📍 {{ imovel.endereco }}
          </a>
        </p>

        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-xl font-bold text-gray-900">R$ {{ formatCurrency(imovel.precoVenda) }}</span>
        </div>
        <p v-if="imovel.valorAvaliacao" class="text-xs text-gray-400 line-through">
          Avaliação: R$ {{ formatCurrency(imovel.valorAvaliacao) }}
        </p>

        <div class="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-gray-500">
          <span v-if="imovel.areaPrivativa">📐 {{ imovel.areaPrivativa }}m²</span>
          <span v-if="imovel.areaTerreno">🏞️ {{ imovel.areaTerreno }}m²</span>
          <span v-if="imovel.quartos">🛏️ {{ imovel.quartos }} qto</span>
          <span v-if="imovel.vagas">🚗 {{ imovel.vagas }} vaga</span>
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
