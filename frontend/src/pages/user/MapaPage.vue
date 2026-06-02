<template>
  <div class="h-[calc(100vh-64px)] flex flex-col">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2">
        <router-link to="/imoveis" class="text-xs text-brand-500 hover:text-brand-600">← Listagem</router-link>
        <h1 class="text-sm font-bold text-gray-900">Mapa — {{ uf }}</h1>
        <span class="text-xs text-gray-400">{{ imoveisNoMapa.length }} imóveis no mapa</span>
      </div>
    </div>

    <!-- Mapa -->
    <div class="flex-1 relative">
      <l-map ref="map" :zoom="7" :center="center" :use-global-leaflet="false" class="h-full w-full z-0">
        <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap"/>
        <l-marker v-for="im in imoveisNoMapa" :key="im.numeroImovel" :lat-lng="[im.lat!, im.lng!]">
          <l-popup>
            <div class="min-w-[200px]">
              <p class="text-xs text-gray-500">{{ im.cidade }} / {{ im.bairro }}</p>
              <p class="font-bold text-sm">{{ im.tipoImovel || 'Imóvel' }}</p>
              <p class="text-sm font-bold text-green-700">R$ {{ (im.precoVenda ?? 0).toLocaleString('pt-BR') }}</p>
              <p v-if="im.percentualDesconto" class="text-xs text-orange-600">-{{ im.percentualDesconto.toFixed(0) }}% desconto</p>
              <router-link :to="`/imoveis/${im.numeroImovel}`" class="text-xs text-brand-500 hover:underline mt-1 block">Ver detalhes →</router-link>
            </div>
          </l-popup>
        </l-marker>
      </l-map>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCatalogoStore } from '@/stores/catalogo'
import { dataService } from '@/services/dataService'
import type { Imovel } from '@/types'
import "leaflet/dist/leaflet.css"
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet"

const router = useRouter()
const store = useCatalogoStore()
const uf = store.ufSelecionada
const imoveis = ref<Imovel[]>([])

const imoveisNoMapa = computed(() => imoveis.value.filter(i => i.lat && i.lng))

const center = computed<[number, number]>(() => {
  const items = imoveisNoMapa.value
  if (!items.length) return [-27.5, -50.5]
  const avgLat = items.reduce((s, i) => s + i.lat!, 0) / items.length
  const avgLng = items.reduce((s, i) => s + i.lng!, 0) / items.length
  return [avgLat, avgLng]
})

onMounted(async () => {
  if (!uf) { router.push('/'); return }
  const all = await dataService.listar(uf, { size: 99999 })
  imoveis.value = all.content
})
</script>
