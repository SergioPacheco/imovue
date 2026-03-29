<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold text-gray-900">Imóveis — {{ estado.uf }}</h1>
          <span class="badge badge-type">{{ resultado?.totalElements || 0 }} encontrados</span>
        </div>
        <router-link to="/" class="text-sm text-brand-500 hover:text-brand-600 mt-1 inline-block">← Trocar estado</router-link>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 mb-6">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select v-model="filtros.tipoImovel" class="input-field">
            <option value="">Todos</option>
            <option v-for="t in tipos" :key="t">{{ t }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Cidade</label>
          <select v-model="filtros.cidade" class="input-field">
            <option value="">Todas</option>
            <option v-for="c in cidades" :key="c">{{ c }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Preço máx</label>
          <input v-model.number="filtros.precoMax" type="number" placeholder="R$" class="input-field" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Desconto mín</label>
          <input v-model.number="filtros.descontoMin" type="number" placeholder="%" class="input-field" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Quartos</label>
          <input v-model.number="filtros.quartosMin" type="number" placeholder="Mín" class="input-field" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Ordenar</label>
          <select v-model="filtros.sort" class="input-field">
            <option value="desconto,desc">Maior desconto</option>
            <option value="preco,asc">Menor preço</option>
            <option value="preco,desc">Maior preço</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="buscar" class="btn-primary w-full">Buscar</button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="i in 6" :key="i" class="card p-5">
        <div class="skeleton h-4 w-20 mb-3"></div>
        <div class="skeleton h-5 w-3/4 mb-2"></div>
        <div class="skeleton h-4 w-1/2 mb-4"></div>
        <div class="skeleton h-8 w-32 mb-3"></div>
        <div class="flex gap-3"><div class="skeleton h-4 w-16"></div><div class="skeleton h-4 w-16"></div></div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="resultado && resultado.content.length === 0" class="text-center py-20">
      <div class="text-5xl mb-4">🏚️</div>
      <h3 class="text-lg font-semibold text-gray-700">Nenhum imóvel encontrado</h3>
      <p class="text-gray-400 mt-1">Tente ajustar os filtros para ampliar a busca.</p>
      <button @click="limpar" class="btn-secondary mt-4">Limpar filtros</button>
    </div>

    <!-- Cards -->
    <div v-else-if="resultado" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="im in resultado.content" :key="im.numeroImovel" class="card overflow-hidden group relative">

        <router-link :to="`/imoveis/${im.numeroImovel}`" class="block">
        <!-- Imagem -->
        <PropertyImage :tipo="im.tipoImovel" :numero="im.numeroImovel">
          <div class="absolute top-3 left-3 flex gap-1.5">
            <span v-if="im.tipoImovel" class="badge badge-type">{{ im.tipoImovel }}</span>
            <span v-if="im.percentualDesconto && im.percentualDesconto > 40" class="badge badge-hot">🔥 Oportunidade</span>
          </div>
          <div v-if="im.percentualDesconto" class="absolute top-3 right-3">
            <span class="badge badge-discount text-sm font-bold">-{{ im.percentualDesconto }}%</span>
          </div>
        </PropertyImage>

        <div class="p-4">
          <h3 class="font-semibold text-gray-900 group-hover:text-brand-500 transition-colors truncate">
            {{ im.cidade }} — {{ im.bairro }}
          </h3>
          <p class="text-xs text-gray-400 truncate mt-0.5">
            <a :href="mapsLink(im)"
              target="_blank" rel="noopener" @click.stop class="hover:text-brand-500 hover:underline">
              📍 {{ im.endereco }}
            </a>
          </p>

          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-xl font-bold text-gray-900">R$ {{ fmt(im.precoVenda) }}</span>
          </div>
          <p v-if="im.valorAvaliacao" class="text-xs text-gray-400 line-through">
            Avaliação: R$ {{ fmt(im.valorAvaliacao) }}
          </p>

          <div class="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-gray-500">
            <span v-if="im.areaPrivativa">📐 {{ im.areaPrivativa }}m²</span>
            <span v-if="im.areaTerreno">🏞️ {{ im.areaTerreno }}m²</span>
            <span v-if="im.quartos">🛏️ {{ im.quartos }} qto</span>
            <span v-if="im.vagas">🚗 {{ im.vagas }} vaga</span>
          </div>
        </div>
        </router-link>

        <!-- Rodapé com favoritar -->
        <div class="px-4 pb-4 pt-0">
          <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
            <button @click="fav.toggle(im)"
              class="flex items-center gap-1 text-xs font-medium transition-colors"
              :class="fav.isFav(im.numeroImovel) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'">
              <svg class="w-4 h-4" :fill="fav.isFav(im.numeroImovel) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              {{ fav.isFav(im.numeroImovel) ? 'Favoritado' : 'Favoritar' }}
            </button>
            <span class="text-xs text-gray-400">{{ im.modalidadeVenda }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginação -->
    <div v-if="resultado && resultado.totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
      <button :disabled="filtros.page === 0" @click="paginar(-1)"
        class="btn-secondary text-sm disabled:opacity-40">← Anterior</button>
      <span class="text-sm text-gray-500 px-4">
        Página <strong>{{ (filtros.page || 0) + 1 }}</strong> de <strong>{{ resultado.totalPages }}</strong>
      </span>
      <button :disabled="(filtros.page || 0) >= resultado.totalPages - 1" @click="paginar(1)"
        class="btn-secondary text-sm disabled:opacity-40">Próxima →</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { catalogoApi } from '@/services/api'
import type { Imovel } from '@/types'

import { useFavoritos } from '@/composables/useFavoritos'
import PropertyImage from '@/components/PropertyImage.vue'

const router = useRouter()
const fav = useFavoritos()
const estado = ref({ uf: '', total: 0 })
const cidades = ref<string[]>([])
const tipos = ref<string[]>([])
const resultado = ref<{ content: Imovel[]; totalElements: number; totalPages: number } | null>(null)
const loading = ref(true)
const filtros = reactive({
  cidade: '', tipoImovel: '', precoMax: undefined as number | undefined,
  descontoMin: undefined as number | undefined, quartosMin: undefined as number | undefined,
  vagasMin: undefined as number | undefined, sort: 'desconto,desc', page: 0, size: 21
})

const fmt = (v: number | null) => v ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'

function mapsLink(im: Imovel) {
  let e = im.endereco
    .replace(/,?\s*(LT|QD|SL|COND\.|BLOCO|BL|APTO|APT|ED\.|EDIF\.?)\s*[^,]*/gi, '')
    .replace(/\bN\.\s*/gi, '').replace(/\s{2,}/g, ' ').replace(/,\s*,/g, ',').replace(/,\s*$/, '').trim()
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e}, ${im.bairro}, ${im.cidade} - ${im.uf}, Brasil`)}`
}

async function buscar() {
  loading.value = true
  filtros.page = 0
  resultado.value = await catalogoApi.listar(filtros as any)
  loading.value = false
}

function limpar() {
  filtros.cidade = ''; filtros.tipoImovel = ''; filtros.precoMax = undefined
  filtros.descontoMin = undefined; filtros.quartosMin = undefined; filtros.vagasMin = undefined
  buscar()
}

function paginar(dir: number) {
  filtros.page += dir
  loading.value = true
  catalogoApi.listar(filtros as any).then(r => { resultado.value = r; loading.value = false })
}

onMounted(async () => {
  estado.value = await catalogoApi.estado()
  if (!estado.value.uf) { router.push('/'); return }
  ;[cidades.value, tipos.value] = await Promise.all([catalogoApi.cidades(), catalogoApi.tipos()])
  await buscar()
})
</script>
