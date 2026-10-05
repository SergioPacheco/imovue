<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-3">
      <h1 class="text-xl font-bold text-gray-900">{{ UF_NOMES[estado.uf] || estado.uf }} - {{ estado.uf }}</h1>
      <span class="badge badge-type">{{ resultado?.totalElements || 0 }} encontrados</span>
    </div>

    <fieldset :disabled="!initialized" class="mb-4 min-w-0">
      <SmartSearchBar :cidades="cidadesBusca" :uf-atual="estado.uf"
        placeholder="Ex: apartamento até 300 mil com dois quartos" @search="aplicarBusca" />
    </fieldset>

    <div v-if="chips.length" class="flex flex-wrap gap-2 mb-3" aria-label="Filtros aplicados">
      <button v-for="chip in chips" :key="chip.key" @click="removerFiltro(chip.key)" :disabled="!initialized"
        class="inline-flex items-center gap-2 rounded-full bg-brand-50 text-brand-700 border border-brand-100 px-3 py-2 text-xs"
        :aria-label="`Remover filtro: ${chip.label}`">{{ chip.label }} <span aria-hidden="true">×</span></button>
    </div>
    <p v-if="typeof filtros.ocupado === 'boolean'" class="text-sm text-amber-800 mb-3" role="status">
      A ocupação pode não estar informada. Este filtro inclui apenas situações confirmadas nos dados.
    </p>
    <p v-if="erro" class="text-sm text-red-700 mb-3" role="alert">{{ erro }} <button class="underline" @click="buscar()">Tentar novamente</button></p>

    <!-- Filtros -->
    <fieldset :disabled="!initialized" class="min-w-0 bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-4">
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
            <option v-for="c in cidades" :key="c" :value="semContagem(c)">{{ c }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Bairro</label>
          <select v-model="filtros.bairro" class="input-field">
            <option value="">Todos</option>
            <option v-for="b in bairros" :key="b" :value="semContagem(b)">{{ b }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Ordenar</label>
          <select v-model="filtros.sort" class="input-field">
            <option value="">Ordem do catálogo</option>
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
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Quartos máx</label>
            <input v-model.number="filtros.quartosMax" type="number" min="0" placeholder="Máx" class="input-field" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Financiamento</label>
            <select v-model="filtros.financiamento" class="input-field">
              <option value="">Todos</option><option value="Sim">Aceita</option><option value="Não">Não aceita</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Ocupação confirmada</label>
            <select v-model="filtros.ocupado" class="input-field">
              <option :value="undefined">Todas / não informada</option>
              <option :value="false">Desocupado</option><option :value="true">Ocupado</option>
            </select>
          </div>
      </div>
      <div class="mt-3 border-t border-gray-100 pt-3 flex justify-end">
        <button @click="showAdvanced = !showAdvanced" class="text-xs font-medium text-gray-500 hover:text-brand-500 flex items-center gap-1">
          <svg class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-180': showAdvanced }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          Mais filtros
        </button>
      </div>
    </fieldset>

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
      <p class="text-gray-500 mt-1">Tente ajustar os filtros para ampliar a busca.</p>
      <p v-for="suggestion in alternativas" :key="suggestion" class="text-sm text-gray-600 mt-2">{{ suggestion }}</p>
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
    <div v-if="resultado && resultado.content.length > 0" class="mt-10">
      <AffiliateCourseCard variant="afterList" />
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
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSeoHead, getListagemSeo } from '@/composables/useSeoHead'
import { dataService } from '@/services/dataService'
import { useCatalogoStore } from '@/stores/catalogo'
import { describeSearch, searchFromQuery, searchToQuery, type SmartSearchResult } from '@/composables/useSmartSearch'
import { normalizeSearchText } from '@/services/propertySearch'
import type { Imovel, FiltrosImovel } from '@/types'
import { UF_NOMES } from '@/constants/uf'
import PropertyCard from '@/components/PropertyCard.vue'
import SmartSearchBar from '@/components/SmartSearchBar.vue'
import AffiliateCourseCard from '@/components/AffiliateCourseCard.vue'
import { AFFILIATE_CONFIG } from '@/config/affiliate'
import { trackEvent } from '@/services/analytics'

const route = useRoute()
useSeoHead(() => getListagemSeo({ hasFilters: Object.keys(route.query).length > 0 }))
const router = useRouter()
const store = useCatalogoStore()
const estado = ref({ uf: store.ufSelecionada, total: 0 })
const ufsDisponiveis = ref<string[]>([])
const cidades = ref<string[]>([])
const cidadesBusca = ref<string[]>([])
const tipos = ref<string[]>([])
const bairros = ref<string[]>([])
const modalidades = ref<string[]>([])
const showAdvanced = ref(false)
const resultado = ref<{ content: Imovel[]; totalElements: number; totalPages: number } | null>(null)
const loading = ref(true)
const erro = ref('')
const alternativas = ref<string[]>([])
const analises = ref<Map<string, { classificacao: 'sub' | 'normal' | 'sobre'; ratio: number }>>(new Map())
const filtros = reactive<FiltrosImovel>({ sort: 'percentualDesconto,desc', page: 0, size: 21 })
const initialized = ref(false)
let syncing = false
let updatingRoute = false
let requestVersion = 0
let debounceTimer: ReturnType<typeof setTimeout> | undefined

const semContagem = (value: string) => value.replace(/ \(\d+\)$/, '')
const chipKeys: (keyof FiltrosImovel)[] = ['cidade', 'bairro', 'tipoImovel', 'modalidade', 'financiamento',
  'precoMin', 'precoMax', 'descontoMin', 'quartosMin', 'quartosMax', 'vagasMin', 'ocupado', 'sort']
const chips = computed(() => chipKeys.filter(key => filtros[key] != null && filtros[key] !== '')
  .map(key => ({ key, label: describeSearch({ [key]: filtros[key] }, null) })))

async function syncUrl() {
  updatingRoute = true
  try {
    await router.replace({ path: '/imoveis', query: searchToQuery(filtros, estado.value.uf) })
    await nextTick()
  } finally { updatingRoute = false }
}

async function buscar(resetPage = true) {
  if (!estado.value.uf) return
  const version = ++requestVersion
  loading.value = true
  erro.value = ''
  if (resetPage) filtros.page = 0
  const snapshot = { ...filtros }
  const uf = estado.value.uf
  try {
    const [found, options, allCities] = await Promise.all([
      dataService.listar(uf, snapshot, { strict: true }), dataService.opcoesFiltros(uf, snapshot), dataService.cidades(uf),
    ])
    if (version !== requestVersion) return
    resultado.value = found
    cidades.value = options.cidades
    cidadesBusca.value = allCities
    tipos.value = options.tipos
    bairros.value = options.bairros
    modalidades.value = options.modalidades
    loading.value = false
    alternativas.value = []
    if (!found.totalElements) {
      if (snapshot.precoMax != null || snapshot.precoMin != null) {
        const expanded = await dataService.listar(uf, { ...snapshot, precoMax: undefined, precoMin: undefined })
        if (expanded.totalElements && version === requestVersion) alternativas.value.push(`Sem os limites de preço, há ${expanded.totalElements} imóveis. Remova os chips de preço para tentar.`)
      }
      if (snapshot.descontoMin != null) {
        const expanded = await dataService.listar(uf, { ...snapshot, descontoMin: undefined })
        if (expanded.totalElements && version === requestVersion) alternativas.value.push(`Sem desconto mínimo, há ${expanded.totalElements} imóveis. Remova esse chip para tentar.`)
      }
    }
    const map = new Map<string, { classificacao: 'sub' | 'normal' | 'sobre'; ratio: number }>()
    await Promise.all(found.content.map(async im => {
      const analysis = await dataService.getAnalisePreco(im)
      if (analysis) map.set(im.numeroImovel, { classificacao: analysis.classificacao, ratio: analysis.ratio })
    }))
    if (version === requestVersion) analises.value = map
  } catch {
    if (version === requestVersion) {
      resultado.value = null
      erro.value = 'Não foi possível carregar os imóveis. Tente novamente.'
    }
  } finally {
    if (version === requestVersion) loading.value = false
  }
}

function currentFilterParams() {
  return {
    filter_uf: estado.value.uf, filter_city: filtros.cidade || undefined,
    filter_neighborhood: filtros.bairro || undefined, filter_property_type: filtros.tipoImovel || undefined,
    filter_sale_type: filtros.modalidade || undefined, filter_financing: filtros.financiamento || undefined,
    filter_price_min: filtros.precoMin, filter_price_max: filtros.precoMax,
    filter_discount_min: filtros.descontoMin, filter_bedrooms_min: filtros.quartosMin,
    filter_parking_min: filtros.vagasMin, filter_sort: filtros.sort,
  }
}

watch(() => chipKeys.map(key => filtros[key]), () => {
  if (!initialized.value || syncing) return
  clearTimeout(debounceTimer)
  ++requestVersion
  debounceTimer = setTimeout(async () => {
    trackEvent('imovue_filter', currentFilterParams())
    await syncUrl()
    await buscar()
  }, 300)
})
watch(() => filtros.cidade, () => {
  if (!syncing && initialized.value) filtros.bairro = undefined
})
watch(() => estado.value.uf, async novaUf => {
  if (!initialized.value || syncing) return
  syncing = true
  clearTimeout(debounceTimer)
  filtros.cidade = undefined; filtros.bairro = undefined
  store.ufSelecionada = novaUf
  await nextTick()
  syncing = false
  trackEvent('imovue_state_change', { filter_uf: novaUf })
  await syncUrl()
  await buscar()
})

async function applyFiltersFromQuery() {
  syncing = true
  clearTimeout(debounceTimer)
  ++requestVersion
  try {
    const parsed = searchFromQuery(route.query)
    const uf = parsed.uf && ufsDisponiveis.value.includes(parsed.uf) ? parsed.uf
      : ufsDisponiveis.value.includes(store.ufSelecionada) ? store.ufSelecionada : ufsDisponiveis.value[0]
    if (!uf) { await router.push('/'); return }
    estado.value.uf = uf
    store.ufSelecionada = uf
    for (const key of chipKeys) delete filtros[key]
    Object.assign(filtros, { sort: 'percentualDesconto,desc' }, parsed.filtros)
    cidadesBusca.value = await dataService.cidades(uf)
    if (filtros.cidade) filtros.cidade = cidadesBusca.value.find(c => normalizeSearchText(c) === normalizeSearchText(semContagem(filtros.cidade!))) || filtros.cidade
    await nextTick()
  } finally { syncing = false }
  await buscar()
}
watch(() => route.query, async () => {
  if (initialized.value && !updatingRoute) await applyFiltersFromQuery()
})

async function aplicarBusca(result: SmartSearchResult, query: string) {
  syncing = true
  clearTimeout(debounceTimer)
  ++requestVersion
  try {
    if (result.intent === 'RESET_SEARCH') for (const key of chipKeys) delete filtros[key]
    const uf = result.uf || estado.value.uf
    if (uf !== estado.value.uf) { filtros.cidade = undefined; filtros.bairro = undefined }
    if (result.filtros.cidade) filtros.bairro = undefined
    estado.value.uf = uf
    store.ufSelecionada = uf
    for (const key of result.removerFiltros) delete filtros[key]
    Object.assign(filtros, result.filtros)
    cidadesBusca.value = await dataService.cidades(uf)
    if (filtros.cidade) filtros.cidade = cidadesBusca.value.find(c => normalizeSearchText(c) === normalizeSearchText(filtros.cidade!)) || filtros.cidade
    await nextTick()
  } catch {
    erro.value = 'Não foi possível carregar os imóveis. Tente novamente.'
  } finally { syncing = false }
  trackEvent('imovue_search', { search_term: query, search_description: describeSearch(filtros, estado.value.uf), search_uf: estado.value.uf })
  await syncUrl()
  await buscar()
}
function removerFiltro(key: keyof FiltrosImovel) {
  if (key === 'sort') filtros.sort = ''
  else filtros[key] = undefined
}
function limpar() {
  for (const key of chipKeys) delete filtros[key]
  trackEvent('imovue_filter_reset', { filter_uf: estado.value.uf })
}
async function paginar(dir: number) {
  filtros.page = (filtros.page || 0) + dir
  trackEvent('imovue_pagination', { page: filtros.page, direction: dir > 0 ? 'next' : 'previous', filter_uf: estado.value.uf })
  await buscar(false)
}
onMounted(async () => {
  try {
    ufsDisponiveis.value = await dataService.ufsDisponiveis()
    await applyFiltersFromQuery()
  } catch {
    erro.value = 'Não foi possível carregar os imóveis. Tente novamente.'
    loading.value = false
  } finally { initialized.value = true }
})
onUnmounted(() => { clearTimeout(debounceTimer); ++requestVersion })
</script>
