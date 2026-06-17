<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-3">
      <h1 class="text-xl font-bold text-gray-900">{{ UF_NOMES[estado.uf] || estado.uf }} - {{ estado.uf }}</h1>
      <span class="badge badge-type">{{ resultado?.totalElements || 0 }} encontrados</span>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select v-model="estado.uf" class="input-field">
            <option v-for="uf in ufsDisponiveis" :key="uf" :value="uf">{{ UF_NOMES[uf] || uf }}</option>
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
          <label class="block text-xs font-medium text-gray-500 mb-1">Bairro</label>
          <select v-model="filtros.bairro" class="input-field">
            <option value="">Todos</option>
            <option v-for="b in bairros" :key="b">{{ b }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Ordenar</label>
          <select v-model="filtros.sort" class="input-field">
            <option value="percentualDesconto,desc">Maior desconto</option>
            <option value="precoVenda,asc">Menor preço</option>
            <option value="precoVenda,desc">Maior preço</option>
          </select>
        </div>
      </div>

      <!-- 2ª linha -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select v-model="filtros.tipoImovel" class="input-field">
            <option value="">Todos</option>
            <option v-for="t in tipos" :key="t">{{ t }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Quartos</label>
          <input v-model.number="filtros.quartosMin" type="number" placeholder="Mín" class="input-field" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Preço mín</label>
          <input v-model.number="filtros.precoMin" type="number" placeholder="R$" class="input-field" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Preço máx</label>
          <input v-model.number="filtros.precoMax" type="number" placeholder="R$" class="input-field" />
        </div>
      </div>

      <!-- Avançado -->
      <div v-show="showAdvanced" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Desconto mín</label>
            <input v-model.number="filtros.descontoMin" type="number" placeholder="%" class="input-field" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Vagas</label>
            <input v-model.number="filtros.vagasMin" type="number" placeholder="Mín" class="input-field" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Modalidade</label>
            <select v-model="filtros.modalidade" class="input-field">
              <option value="">Todas</option>
              <option v-for="m in modalidades" :key="m">{{ m }}</option>
            </select>
          </div>
      </div>
      <div class="mt-3 border-t border-gray-100 pt-3 flex justify-end">
        <button @click="showAdvanced = !showAdvanced" class="text-xs font-medium text-gray-500 hover:text-brand-500 flex items-center gap-1">
          <svg class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-180': showAdvanced }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          Mais filtros
        </button>
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

    <!-- Dica discreta topo -->
    <div v-if="AFFILIATE_CONFIG.courseUrl && resultado && resultado.content.length > 0" class="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 mb-4">
      <span class="text-sm">💡</span>
      <p class="text-xs sm:text-sm text-gray-500 flex-1">Novo em leilão de imóveis? Aprenda a analisar edital, ocupação e custos antes de dar lance.</p>
      <a v-if="AFFILIATE_CONFIG.courseUrl" :href="AFFILIATE_CONFIG.courseUrl" target="_blank" rel="nofollow sponsored noopener"
        class="text-xs font-medium text-brand-500 hover:text-brand-600 whitespace-nowrap">Ver guia recomendado →</a>
    </div>

    <!-- Cards -->
    <div v-if="!loading && resultado && resultado.content.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <PropertyCard v-for="im in resultado.content" :key="im.numeroImovel"
        :imovel="im" :analise="analises.get(im.numeroImovel)" />
    </div>

    <!-- Bloco educativo final -->
    <div v-if="resultado && resultado.content.length > 0" class="mt-10 rounded-xl border border-gray-200 bg-white p-6 sm:p-8 text-center">
      <h3 class="text-lg font-bold text-gray-900">Encontrou um imóvel interessante?</h3>
      <p class="mt-2 text-sm text-gray-500 max-w-lg mx-auto">
        Antes de fazer uma proposta, entenda os principais riscos: edital, ocupação, débitos, financiamento, prazos e custo real da compra.
      </p>
      <a v-if="AFFILIATE_CONFIG.courseUrl" :href="AFFILIATE_CONFIG.courseUrl" target="_blank" rel="nofollow sponsored noopener"
        class="mt-4 inline-block text-sm font-medium text-brand-500 border border-brand-200 px-5 py-2 rounded-lg hover:bg-brand-50 transition-colors">
        Aprender antes de dar lance
      </a>
      <p class="mt-3 text-[10px] text-gray-400">{{ AFFILIATE_CONFIG.disclosure }}</p>
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
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSeoHead } from '@/composables/useSeoHead'
import { dataService } from '@/services/dataService'
import { useCatalogoStore } from '@/stores/catalogo'
import type { Imovel } from '@/types'
import { UF_NOMES } from '@/constants/uf'
import PropertyCard from '@/components/PropertyCard.vue'
import { AFFILIATE_CONFIG } from '@/config/affiliate'

const route = useRoute()
const hasFilters = Object.keys(route.query).length > 0
useSeoHead({
  title: 'Imóveis da Caixa com Desconto',
  description: 'Encontre imóveis da Caixa Econômica Federal com desconto. Filtre por estado, cidade, preço, desconto e modalidade.',
  robots: hasFilters ? 'noindex,follow' : 'index,follow',
})

const router = useRouter()
const store = useCatalogoStore()
const estado = ref({ uf: store.ufSelecionada, total: 0 })
const ufsDisponiveis = ref<string[]>([])
const cidades = ref<string[]>([])
const tipos = ref<string[]>([])
const bairros = ref<string[]>([])
const modalidades = ref<string[]>([])
const showAdvanced = ref(false)
const resultado = ref<{ content: Imovel[]; totalElements: number; totalPages: number } | null>(null)
const loading = ref(true)
const analises = ref<Map<string, { classificacao: 'sub' | 'normal' | 'sobre'; ratio: number }>>(new Map())
let skipNextFilterWatch = false

const filtros = reactive({
  cidade: '', bairro: '', tipoImovel: '', modalidade: '',
  precoMin: undefined as number | undefined, precoMax: undefined as number | undefined,
  descontoMin: undefined as number | undefined, quartosMin: undefined as number | undefined,
  vagasMin: undefined as number | undefined, sort: 'percentualDesconto,desc', page: 0, size: 21
})

async function buscar() {
  loading.value = true
  filtros.page = 0
  resultado.value = await dataService.listar(estado.value.uf, filtros as any)
  const opcoes = await dataService.opcoesFiltros(estado.value.uf, filtros as any)
  cidades.value = opcoes.cidades
  tipos.value = opcoes.tipos
  bairros.value = opcoes.bairros
  modalidades.value = opcoes.modalidades
  loading.value = false
  // Analisa preço vs bairro em background
  if (resultado.value) {
    const map = new Map<string, { classificacao: 'sub' | 'normal' | 'sobre'; ratio: number }>()
    await Promise.all(resultado.value.content.map(async (im) => {
      const a = await dataService.getAnalisePreco(im)
      if (a) map.set(im.numeroImovel, { classificacao: a.classificacao, ratio: a.ratio })
    }))
    analises.value = map
  }
}

let debounceTimer: ReturnType<typeof setTimeout>
watch(() => [filtros.cidade, filtros.bairro, filtros.tipoImovel, filtros.modalidade,
  filtros.precoMin, filtros.precoMax, filtros.descontoMin, filtros.quartosMin,
  filtros.vagasMin, filtros.sort], () => {
  if (skipNextFilterWatch) { skipNextFilterWatch = false; return }
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(buscar, 300)
})

watch(() => filtros.cidade, () => { filtros.bairro = '' })

watch(() => estado.value.uf, (novaUf) => {
  store.ufSelecionada = novaUf
  skipNextFilterWatch = true
  filtros.cidade = ''
  filtros.bairro = ''
  buscar()
})

function limpar() {
  filtros.cidade = ''; filtros.bairro = ''; filtros.tipoImovel = ''; filtros.modalidade = ''
  filtros.precoMin = undefined; filtros.precoMax = undefined
  filtros.descontoMin = undefined; filtros.quartosMin = undefined; filtros.vagasMin = undefined
}

function paginar(dir: number) {
  filtros.page += dir
  loading.value = true
  dataService.listar(estado.value.uf, filtros as any).then(r => { resultado.value = r; loading.value = false })
}

onMounted(async () => {
  ufsDisponiveis.value = await dataService.ufsDisponiveis()
  if (!estado.value.uf) {
    if (ufsDisponiveis.value.length > 0) {
      estado.value.uf = ufsDisponiveis.value[0]
      store.ufSelecionada = estado.value.uf
    } else { router.push('/'); return }
  }
  const q = router.currentRoute.value.query
  if (q.cidade) filtros.cidade = q.cidade as string
  if (q.tipoImovel) filtros.tipoImovel = q.tipoImovel as string
  if (q.precoMax) filtros.precoMax = Number(q.precoMax)
  if (q.precoMin) filtros.precoMin = Number(q.precoMin)
  if (q.descontoMin) filtros.descontoMin = Number(q.descontoMin)
  if (q.sort) filtros.sort = q.sort as string
  if (q.financiamento) (filtros as any).financiamento = q.financiamento as string
  await buscar()
})
</script>
