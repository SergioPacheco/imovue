<template>
  <div class="h-[calc(100vh-64px)] flex flex-col">
    <!-- Header com filtros -->
    <div class="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0 flex-wrap">
      <router-link to="/imoveis" class="text-xs text-brand-500 hover:text-brand-600">← Listagem</router-link>
      <h1 class="text-sm font-bold text-gray-900">Mapa</h1>
      <select v-model="ufSelecionada" class="text-xs border border-gray-200 rounded px-2 py-1 font-medium">
        <option value="" disabled>UF</option>
        <option v-for="u in ufsDisponiveis" :key="u">{{ u }}</option>
      </select>
      <select v-model="filtroTipo" class="text-xs border border-gray-200 rounded px-2 py-1">
        <option value="">Todos os tipos</option>
        <option v-for="t in tipos" :key="t">{{ t }}</option>
      </select>
      <select v-model="filtroCidade" class="text-xs border border-gray-200 rounded px-2 py-1">
        <option value="">Todas as cidades</option>
        <option v-for="c in cidades" :key="c">{{ c }}</option>
      </select>
      <input v-model.number="filtroPrecoMax" type="number" placeholder="Preço máx" class="text-xs border border-gray-200 rounded px-2 py-1 w-24" />
      <input v-model.number="filtroDescontoMin" type="number" placeholder="Desc. mín %" class="text-xs border border-gray-200 rounded px-2 py-1 w-24" />
      <span class="text-xs text-gray-400 ml-auto">{{ filtrados.length }} imóveis</span>
    </div>

    <!-- Mapa -->
    <div class="flex-1 relative" ref="mapContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCatalogoStore } from '@/stores/catalogo'
import { dataService } from '@/services/dataService'
import type { Imovel } from '@/types'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

const store = useCatalogoStore()
const ufSelecionada = ref(store.ufSelecionada || '')
const ufsDisponiveis = ref<string[]>([])
const imoveis = ref<Imovel[]>([])
const mapContainer = ref<HTMLElement>()
const tipos = ref<string[]>([])
const cidades = ref<string[]>([])

const filtroTipo = ref('')
const filtroCidade = ref('')
const filtroPrecoMax = ref<number | undefined>()
const filtroDescontoMin = ref<number | undefined>()

const filtrados = computed(() => {
  return imoveis.value.filter(i => {
    if (!i.lat || !i.lng) return false
    if (filtroTipo.value && i.tipoImovel !== filtroTipo.value) return false
    if (filtroCidade.value && i.cidade !== filtroCidade.value) return false
    if (filtroPrecoMax.value && (i.precoVenda ?? Infinity) > filtroPrecoMax.value) return false
    if (filtroDescontoMin.value && (i.percentualDesconto ?? 0) < filtroDescontoMin.value) return false
    return true
  })
})

let map: L.Map | null = null
let cluster: any = null

function formatPrice(v: number | null): string {
  if (!v) return '-'
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  return `${(v / 1000).toFixed(0)}k`
}

function renderMarkers() {
  if (!map) return
  if (cluster) map.removeLayer(cluster)

  const items = filtrados.value
  if (!items.length) return

  cluster = (L as any).markerClusterGroup({ maxClusterRadius: 40 })

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
  const bounds = L.latLngBounds(items.map(i => [i.lat!, i.lng!]))
  map.fitBounds(bounds, { padding: [30, 30] })
}

function initMap() {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value).setView([-15.78, -47.93], 5)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)
  renderMarkers()
}

watch(filtrados, () => { if (map) renderMarkers() })

async function loadUfData(uf: string) {
  if (!uf) return
  const all = await dataService.listar(uf, { size: 99999 })
  imoveis.value = all.content
  tipos.value = [...new Set(all.content.map(i => i.tipoImovel).filter(Boolean) as string[])].sort()
  cidades.value = [...new Set(all.content.map(i => i.cidade))].sort()
  filtroTipo.value = ''
  filtroCidade.value = ''
  filtroPrecoMax.value = undefined
  filtroDescontoMin.value = undefined
  renderMarkers()
}

watch(ufSelecionada, (uf) => {
  store.ufSelecionada = uf
  loadUfData(uf)
})

onMounted(async () => {
  ufsDisponiveis.value = (await dataService.ufsDisponiveis()).sort()
  if (!ufSelecionada.value && ufsDisponiveis.value.length) {
    ufSelecionada.value = ufsDisponiveis.value[0]
  }
  initMap()
  await loadUfData(ufSelecionada.value)
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
