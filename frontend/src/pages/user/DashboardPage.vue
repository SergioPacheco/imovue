<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-20">
      <div class="text-4xl mb-3 animate-pulse">📊</div>
      <p class="text-gray-500">Carregando radar...</p>
    </div>

    <template v-if="data && !loading">
      <!-- Hero -->
      <div class="mb-5">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900">Radar — {{ uf }}</h1>
        <p class="text-gray-500 mt-1 text-sm">Imóveis organizados por score, desconto e sinais de oportunidade. Comece pelos que têm maior potencial.</p>
        <div class="flex items-center gap-3 mt-3 flex-wrap">
          <select v-model="uf" class="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
            <option v-for="u in ufsDisponiveis" :key="u" :value="u">{{ UF_NOMES[u] || u }}</option>
          </select>
          <select v-model="filtroCidade" class="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
            <option value="">Todas as cidades</option>
            <option v-for="c in cidades" :key="c">{{ c }}</option>
          </select>
          <select v-model="filtroTipo" class="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
            <option value="">Todos os tipos</option>
            <option v-for="t in tipos" :key="t">{{ t }}</option>
          </select>
        </div>
      </div>

      <!-- Cards principais -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <router-link to="/imoveis" class="card-stat group">
          <div class="text-lg font-bold text-gray-900">{{ data.resumo.total.toLocaleString() }}</div>
          <div class="text-xs text-gray-500">Imóveis</div>
          <span class="card-stat-link">Ver →</span>
        </router-link>
        <router-link to="/imoveis?descontoMin=30" class="card-stat group">
          <div class="text-lg font-bold text-orange-500">{{ data.resumo.altosDescontos.toLocaleString() }}</div>
          <div class="text-xs text-gray-500">>30% desconto</div>
          <span class="card-stat-link">Ver →</span>
        </router-link>
        <router-link to="/imoveis?descontoMin=40" class="card-stat group border-brand-200 bg-brand-50">
          <div class="text-lg font-bold text-brand-600">{{ data.alertas.scoreAlto }}</div>
          <div class="text-xs text-gray-500">Score acima de 80</div>
          <span class="card-stat-link">Ver →</span>
        </router-link>
        <router-link to="/imoveis?financiamento=Sim" class="card-stat group">
          <div class="text-lg font-bold text-blue-600">{{ data.resumo.financiaveis.toLocaleString() }}</div>
          <div class="text-xs text-gray-500">Financiáveis</div>
          <span class="card-stat-link">Ver →</span>
        </router-link>
        <router-link to="/imoveis?precoMax=131000" class="card-stat group">
          <div class="text-lg font-bold text-gray-900">R$ {{ (data.resumo.precoMedio / 1000).toFixed(0) }}k</div>
          <div class="text-xs text-gray-500">Ticket médio</div>
          <span class="card-stat-link">Ver →</span>
        </router-link>
        <router-link to="/imoveis?sort=percentualDesconto,desc" class="card-stat group">
          <div class="text-lg font-bold text-green-600">{{ data.resumo.maiorDesconto.toFixed(0) }}%</div>
          <div class="text-xs text-gray-500">Maior desconto</div>
          <span class="card-stat-link">Ver →</span>
        </router-link>
      </div>

      <!-- Top Oportunidades (2 colunas) -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-gray-900">🔥 Comece por estas oportunidades</h2>
          <router-link to="/imoveis?sort=percentualDesconto,desc" class="text-xs font-medium text-brand-500 hover:text-brand-600">Ver ranking completo →</router-link>
        </div>
        <div class="grid sm:grid-cols-2 gap-3">
          <router-link v-for="(im, i) in data.topOportunidades" :key="im.numeroImovel"
            :to="`/imoveis/${im.numeroImovel}?uf=${im.uf}`"
            class="block p-3 rounded-lg border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all">
            <div class="flex items-start gap-3">
              <span class="text-sm font-bold text-gray-300 mt-0.5">{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm font-semibold text-gray-900">{{ im.tipoImovel || 'Imóvel' }} em {{ im.cidade }}</span>
                  <span v-if="im.financiamento === 'Sim'" class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Financiável</span>
                </div>
                <p class="text-xs text-gray-400 mt-0.5">{{ im.bairro }} — {{ im.uf }}</p>
                <div class="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span class="text-xs font-bold px-2 py-0.5 rounded" :class="scoreClass(im.score)">{{ im.score }}/100 · {{ scoreLabel(im.score) }}</span>
                  <span class="text-xs font-medium text-green-700">{{ (im.percentualDesconto ?? 0).toFixed(0) }}% desconto</span>
                  <span class="text-xs font-medium text-gray-700">R$ {{ ((im.precoVenda ?? 0) / 1000).toFixed(0) }}k</span>
                </div>
                <p class="text-xs text-gray-400 mt-1">{{ scoreMotivo(im) }}</p>
              </div>
              <span class="text-xs text-brand-500 font-medium shrink-0 mt-1">Ver →</span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Alertas do Radar -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h2 class="text-sm font-bold text-gray-900 mb-3">⚡ Alertas do radar</h2>
          <div class="grid sm:grid-cols-3 gap-3">
            <router-link to="/imoveis?descontoMin=30" class="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div class="text-sm font-medium text-gray-900">🔥 {{ data.alertas.scoreAlto }} com score acima de 80</div>
              <p class="text-xs text-gray-500 mt-0.5">Oportunidades fortes para análise imediata</p>
            </router-link>
            <router-link to="/imoveis?descontoMin=30" class="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <div class="text-sm font-medium text-gray-900">⚠️ {{ data.alertas.altosDescontosOcupados.toLocaleString() }} com desconto alto, mas ocupados</div>
              <p class="text-xs text-gray-500 mt-0.5">Desconto atrativo porém com risco de ocupação</p>
            </router-link>
            <router-link to="/imoveis?financiamento=Sim" class="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div class="text-sm font-medium text-gray-900">🏦 {{ data.resumo.financiaveis.toLocaleString() }} aceitam financiamento</div>
              <p class="text-xs text-gray-500 mt-0.5">Ideal para quem precisa de crédito</p>
            </router-link>
          </div>
      </div>

      <!-- Explorar por objetivo -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <h2 class="text-sm font-bold text-gray-900 mb-3">🔎 Explorar por objetivo</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <router-link to="/imoveis?sort=percentualDesconto,desc" class="card-explore">
            <span class="text-xl">💰</span>
            <div><div class="text-sm font-medium text-gray-900">Maiores descontos</div><p class="text-xs text-gray-500">Ordenados pelo maior desconto</p></div>
          </router-link>
          <router-link to="/imoveis?financiamento=Sim" class="card-explore">
            <span class="text-xl">🏦</span>
            <div><div class="text-sm font-medium text-gray-900">Financiáveis</div><p class="text-xs text-gray-500">Aceitam financiamento habitacional</p></div>
          </router-link>
          <router-link to="/imoveis?precoMax=100000" class="card-explore">
            <span class="text-xl">🎯</span>
            <div><div class="text-sm font-medium text-gray-900">Até R$ 100 mil</div><p class="text-xs text-gray-500">Oportunidades mais acessíveis</p></div>
          </router-link>
          <router-link to="/imoveis?descontoMin=40" class="card-explore">
            <span class="text-xl">🔥</span>
            <div><div class="text-sm font-medium text-gray-900">Desconto acima de 40%</div><p class="text-xs text-gray-500">Desconto agressivo</p></div>
          </router-link>
          <router-link to="/imoveis?tipoImovel=Casa" class="card-explore">
            <span class="text-xl">🏠</span>
            <div><div class="text-sm font-medium text-gray-900">Casas</div><p class="text-xs text-gray-500">Apenas casas</p></div>
          </router-link>
          <router-link to="/imoveis?tipoImovel=Apartamento" class="card-explore">
            <span class="text-xl">🏢</span>
            <div><div class="text-sm font-medium text-gray-900">Apartamentos</div><p class="text-xs text-gray-500">Apenas apartamentos</p></div>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSeoHead } from '@/composables/useSeoHead'
import { dataService } from '@/services/dataService'
import { useCatalogoStore } from '@/stores/catalogo'
import { UF_NOMES } from '@/constants/uf'
import type { Imovel } from '@/types'

useSeoHead({ title: 'Radar de Oportunidades', description: 'Radar de imóveis da Caixa com score de oportunidade.', robots: 'noindex,follow' })

interface DashboardData {
  resumo: { total: number; maiorDesconto: number; descontoMedio: number; financiaveis: number; altosDescontos: number; precoMedio: number; scoreMedio: number }
  topOportunidades: (Imovel & { score: number })[]
  rankingEstados: { uf: string; total: number; scoreMedio: number }[]
  alertas: { altosDescontosOcupados: number; naoFinanciaveis: number; scoreAlto: number }
}

const router = useRouter()
const store = useCatalogoStore()
const data = ref<DashboardData | null>(null)
const loading = ref(true)
const filtroCidade = ref('')
const filtroTipo = ref('')
const cidades = ref<string[]>([])
const tipos = ref<string[]>([])
const ufsDisponiveis = ref<string[]>([])
const uf = ref(store.ufSelecionada)

function scoreLabel(s: number): string {
  if (s >= 80) return 'Excelente'
  if (s >= 60) return 'Forte'
  if (s >= 40) return 'Moderado'
  return 'Atenção'
}

function scoreClass(s: number): string {
  if (s >= 80) return 'bg-green-100 text-green-800'
  if (s >= 60) return 'bg-blue-100 text-blue-800'
  if (s >= 40) return 'bg-yellow-100 text-yellow-800'
  return 'bg-gray-100 text-gray-700'
}

function scoreMotivo(im: Imovel & { score: number }): string {
  const motivos: string[] = []
  if ((im.percentualDesconto ?? 0) >= 40) motivos.push('desconto alto')
  else if ((im.percentualDesconto ?? 0) >= 30) motivos.push('bom desconto')
  if (im.financiamento === 'Sim') motivos.push('aceita financiamento')
  if (im.precoVenda && data.value && im.precoVenda < data.value.resumo.precoMedio) motivos.push('abaixo do ticket médio')
  if ((im.quartos ?? 0) >= 2) motivos.push(`${im.quartos} quartos`)
  return motivos.length ? `Destaque por: ${motivos.join(', ')}` : ''
}

async function load() {
  loading.value = true
  data.value = await dataService.dashboardGlobal(uf.value || undefined, filtroCidade.value || undefined, filtroTipo.value || undefined) as DashboardData
  loading.value = false
}

async function loadOpcoes() {
  const opcoes = await dataService.opcoesFiltros(uf.value, {})
  cidades.value = opcoes.cidades.map(c => c.replace(/ \(\d+\)$/, ''))
  tipos.value = opcoes.tipos
}

onMounted(async () => {
  ufsDisponiveis.value = await dataService.ufsDisponiveis()
  if (!uf.value) {
    if (ufsDisponiveis.value.length > 0) {
      uf.value = ufsDisponiveis.value[0]
      store.ufSelecionada = uf.value
    } else { router.push('/'); return }
  }
  await loadOpcoes()
  await load()
})

watch(uf, async (novaUf) => {
  store.ufSelecionada = novaUf
  filtroCidade.value = ''
  filtroTipo.value = ''
  await loadOpcoes()
  await load()
})

watch(filtroCidade, () => load())
watch(filtroTipo, () => load())
</script>

<style scoped>
.card-stat {
  display: block;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.card-stat:hover {
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.12);
}
.card-stat-link {
  display: none;
  font-size: 0.7rem;
  color: #2563eb;
  margin-top: 0.25rem;
}
.card-stat:hover .card-stat-link {
  display: block;
}
.card-explore {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #f3f4f6;
  transition: all 0.2s;
}
.card-explore:hover {
  border-color: #bfdbfe;
  background: #eff6ff;
  transform: translateY(-1px);
}
</style>
