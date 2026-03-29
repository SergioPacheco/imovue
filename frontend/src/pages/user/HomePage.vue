<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Encontre imóveis de leilão<br class="hidden sm:block" /> com até <span class="text-blue-300">70% de desconto</span>
        </h1>
        <p class="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">
          Catálogo atualizado de imóveis da CAIXA. Selecione um estado para explorar oportunidades.
        </p>
      </div>
    </section>

    <!-- Seletor de Estado -->
    <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 class="text-xl font-bold text-gray-900">Selecione o estado</h2>
          <div class="relative w-full sm:w-64">
            <input v-model="busca" type="text" placeholder="Buscar estado..." class="input-field pl-9" />
            <svg class="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>

        <div v-if="loading" class="grid grid-cols-4 sm:grid-cols-7 gap-3">
          <div v-for="i in 27" :key="i" class="skeleton h-14 rounded-xl"></div>
        </div>

        <div v-else class="grid grid-cols-4 sm:grid-cols-7 gap-3">
          <button v-for="uf in ufsFiltradas" :key="uf" @click="selecionar(uf)"
            :disabled="carregando"
            class="group relative h-14 rounded-xl border-2 border-gray-200 bg-white font-bold text-gray-700
                   hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600
                   active:scale-95 transition-all duration-150 text-sm
                   disabled:opacity-50 disabled:cursor-wait">
            {{ uf }}
            <span class="absolute -top-1 -right-1 w-2 h-2 bg-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>
        </div>

        <p v-if="!loading && ufsFiltradas.length === 0" class="text-center text-gray-400 py-8">
          Nenhum estado encontrado para "{{ busca }}"
        </p>

        <p v-if="carregando" class="text-center text-brand-500 font-medium mt-6 animate-pulse">
          Carregando imóveis de {{ ufSelecionada }}...
        </p>
      </div>
    </section>

    <!-- Info -->
    <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid sm:grid-cols-3 gap-8 text-center">
        <div>
          <div class="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">🏠</span>
          </div>
          <h3 class="font-semibold text-gray-900">Dados públicos</h3>
          <p class="text-sm text-gray-500 mt-1">Informações extraídas das listas oficiais da CAIXA</p>
        </div>
        <div>
          <div class="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">💰</span>
          </div>
          <h3 class="font-semibold text-gray-900">Descontos reais</h3>
          <p class="text-sm text-gray-500 mt-1">Imóveis com até 70% abaixo do valor de avaliação</p>
        </div>
        <div>
          <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">🔍</span>
          </div>
          <h3 class="font-semibold text-gray-900">Filtros avançados</h3>
          <p class="text-sm text-gray-500 mt-1">Busque por cidade, tipo, preço, desconto e mais</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { catalogoApi } from '@/services/api'

const NOMES_UF: Record<string, string> = {
  AC:'Acre',AL:'Alagoas',AM:'Amazonas',AP:'Amapá',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',
  ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',MG:'Minas Gerais',MS:'Mato Grosso do Sul',
  MT:'Mato Grosso',PA:'Pará',PB:'Paraíba',PE:'Pernambuco',PI:'Piauí',PR:'Paraná',
  RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RO:'Rondônia',RR:'Roraima',RS:'Rio Grande do Sul',
  SC:'Santa Catarina',SE:'Sergipe',SP:'São Paulo',TO:'Tocantins'
}

const router = useRouter()
const ufs = ref<string[]>([])
const loading = ref(true)
const carregando = ref(false)
const ufSelecionada = ref('')
const busca = ref('')

const ufsFiltradas = computed(() => {
  if (!busca.value) return ufs.value
  const q = busca.value.toUpperCase()
  return ufs.value.filter(uf => uf.includes(q) || (NOMES_UF[uf] || '').toUpperCase().includes(q))
})

async function selecionar(uf: string) {
  carregando.value = true
  ufSelecionada.value = uf
  await catalogoApi.carregar(uf)
  router.push('/imoveis')
}

onMounted(async () => {
  ufs.value = await catalogoApi.ufsDisponiveis()
  loading.value = false
})
</script>
