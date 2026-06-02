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
    <div class="flex-1 relative" ref="mapContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCatalogoStore } from '@/stores/catalogo'
import { dataService } from '@/services/dataService'
import type { Imovel } from '@/types'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

const router = useRouter()
const store = useCatalogoStore()
const uf = store.ufSelecionada
const imoveis = ref<Imovel[]>([])
const mapContainer = ref<HTMLElement>()

const imoveisNoMapa = computed(() => imoveis.value.filter(i => i.lat && i.lng))

function formatPrice(v: number | null): string {
  if (!v) return '-'
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  return `${(v / 1000).toFixed(0)}k`
}

function createMap() {
  if (!mapContainer.value || !imoveisNoMapa.value.length) return

  const items = imoveisNoMapa.value
  const avgLat = items.reduce((s, i) => s + i.lat!, 0) / items.length
  const avgLng = items.reduce((s, i) => s + i.lng!, 0) / items.length

  const map = L.map(mapContainer.value).setView([avgLat, avgLng], 7)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  const cluster = (L as any).markerClusterGroup({ maxClusterRadius: 40 })

  for (const im of items) {
    const isHot = (im.percentualDesconto ?? 0) > 40
    const icon = L.divIcon({
      className: '',
      html: `<div class="price-tag ${isHot ? 'hot' : ''}">R$ ${formatPrice(im.precoVenda)}</div>`,
      iconSize: [70, 24],
      iconAnchor: [35, 24],
    })

    const marker = L.marker([im.lat!, im.lng!], { icon })
    marker.bindPopup(`
      <div style="min-width:180px">
        <p style="margin:0;font-size:11px;color:#888">${im.cidade} / ${im.bairro}</p>
        <p style="margin:2px 0;font-weight:bold;font-size:13px">${im.tipoImovel || 'Imóvel'}</p>
        <p style="margin:2px 0;font-weight:bold;color:#16a34a">R$ ${(im.precoVenda ?? 0).toLocaleString('pt-BR')}</p>
        ${im.percentualDesconto ? `<p style="margin:2px 0;font-size:11px;color:#ea580c">-${im.percentualDesconto.toFixed(0)}% desconto</p>` : ''}
        <p style="margin:2px 0;font-size:11px;color:#888">${im.endereco}</p>
        <a href="/imoveis/${im.numeroImovel}" style="font-size:11px;color:#2563eb">Ver detalhes →</a>
      </div>
    `)
    cluster.addLayer(marker)
  }

  map.addLayer(cluster)

  // Fit bounds
  const bounds = L.latLngBounds(items.map(i => [i.lat!, i.lng!]))
  map.fitBounds(bounds, { padding: [30, 30] })
}

onMounted(async () => {
  if (!uf) { router.push('/'); return }
  const all = await dataService.listar(uf, { size: 99999 })
  imoveis.value = all.content
})

watch(imoveisNoMapa, (items) => {
  if (items.length) createMap()
})
</script>

<style>
.price-tag {
  background: white;
  border: 2px solid #2563eb;
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 700;
  color: #1e40af;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  text-align: center;
}
.price-tag.hot {
  background: #dc2626;
  border-color: #991b1b;
  color: white;
}
</style>
