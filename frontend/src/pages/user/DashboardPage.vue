<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-20">
      <div class="text-4xl mb-3 animate-pulse">📊</div>
      <p class="text-gray-500">Carregando radar...</p>
    </div>

    <template v-if="data && !loading">
      <!-- Hero -->
      <!-- Hero + Filtros -->
      <div class="text-center mb-4">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900">Radar — {{ uf }}</h1>
        <p class="text-gray-500 mt-1 max-w-2xl mx-auto text-sm">Pare de procurar imóvel por imóvel. Comece pelos que têm maior potencial.</p>
      </div>
      <div class="flex items-center justify-center gap-3 mb-6">
        <router-link to="/" class="text-xs text-brand-500 hover:text-brand-600">← Trocar estado</router-link>
        <select v-model="filtroCidade" class="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
          <option value="">Todas as cidades</option>
          <option v-for="c in cidades" :key="c">{{ c }}</option>
        </select>
        <span class="text-xs text-gray-400">{{ data.resumo.total.toLocaleString() }} imóveis</span>
      </div>

      <!-- Cards principais (clicáveis) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <router-link to="/imoveis" class="card-stat">
          <div class="text-lg font-bold text-gray-900">{{ data.resumo.total.toLocaleString() }}</div>
          <div class="text-xs text-gray-500">Imóveis</div>
        </router-link>
        <router-link to="/imoveis?descontoMin=30" class="card-stat">
          <div class="text-lg font-bold text-orange-500">{{ data.resumo.altosDescontos.toLocaleString() }}</div>
          <div class="text-xs text-gray-500">>30% desconto</div>
        </router-link>
        <router-link to="/imoveis?scoreMin=80" class="card-stat border-brand-200 bg-brand-50">
          <div class="text-lg font-bold text-brand-600">{{ data.alertas.scoreAlto }}</div>
          <div class="text-xs text-gray-500">Score acima de 80</div>
        </router-link>
        <router-link to="/imoveis?financiamento=Sim" class="card-stat">
          <div class="text-lg font-bold text-blue-600">{{ data.resumo.financiaveis.toLocaleString() }}</div>
          <div class="text-xs text-gray-500">Financiáveis</div>
        </router-link>
        <router-link to="/imoveis?precoMax=131000" class="card-stat">
          <div class="text-lg font-bold text-gray-900">R$ {{ (data.resumo.precoMedio / 1000).toFixed(0) }}k</div>
          <div class="text-xs text-gray-500">Ticket médio</div>
        </router-link>
        <router-link to="/imoveis?sort=percentualDesconto,desc" class="card-stat">
          <div class="text-lg font-bold text-green-600">{{ data.resumo.maiorDesconto.toFixed(0) }}%</div>
          <div class="text-xs text-gray-500">Maior desconto</div>
        </router-link>
      </div>

      <!-- Top Oportunidades -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-bold text-gray-900">🔥 Melhores oportunidades agora</h2>
          <router-link to="/imoveis?sort=percentualDesconto,desc" class="text-xs font-medium text-brand-500 hover:text-brand-600">Ver ranking completo →</router-link>
        </div>
        <div class="space-y-1">
          <router-link v-for="(im, i) in data.topOportunidades" :key="im.numeroImovel"
            :to="`/imoveis/${im.numeroImovel}?uf=${im.uf}`"
            class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <span class="text-xs font-bold text-gray-400 w-5">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-medium text-gray-900 truncate block">{{ im.tipoImovel || 'Imóvel' }} em {{ im.cidade }}</span>
              <span class="text-xs text-gray-400">{{ im.bairro }} — {{ im.uf }}</span>
            </div>
            <span class="text-sm font-bold text-brand-600">{{ im.score }}</span>
            <span class="text-sm font-bold text-green-600 w-12 text-right">-{{ (im.percentualDesconto ?? 0).toFixed(0) }}%</span>
            <span class="text-xs font-medium text-gray-700 w-16 text-right">R$ {{ ((im.precoVenda ?? 0) / 1000).toFixed(0) }}k</span>
            <span v-if="im.financiamento === 'Sim'" class="text-xs">🏦</span>
          </router-link>
        </div>
      </div>

      <!-- Radar + Ranking lado a lado -->
      <div class="grid sm:grid-cols-2 gap-4 mb-6">
        <!-- Alertas do Radar -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <h2 class="text-sm font-bold text-gray-900 mb-3">⚡ Alertas do radar</h2>
          <div class="space-y-3">
            <router-link to="/imoveis?descontoMin=30" class="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div class="flex items-start gap-2">
                <span class="text-lg">🔥</span>
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ data.alertas.scoreAlto }} imóveis com score acima de 80</div>
                  <p class="text-xs text-gray-500">Oportunidades fortes para análise imediata</p>
                </div>
              </div>
            </router-link>
            <router-link to="/imoveis?descontoMin=30" class="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <div class="flex items-start gap-2">
                <span class="text-lg">⚠️</span>
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ data.alertas.altosDescontosOcupados.toLocaleString() }} com alto desconto, mas ocupados</div>
                  <p class="text-xs text-gray-500">Desconto atrativo porém com risco de ocupação</p>
                </div>
              </div>
            </router-link>
            <router-link to="/imoveis?financiamento=Sim" class="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div class="flex items-start gap-2">
                <span class="text-lg">🏦</span>
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ data.resumo.financiaveis.toLocaleString() }} aceitam financiamento</div>
                  <p class="text-xs text-gray-500">Ideal para quem precisa de crédito</p>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Ranking por estado -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <h2 class="text-sm font-bold text-gray-900 mb-3">📍 Estados com melhor potencial</h2>
          <div class="space-y-1">
            <div v-for="e in data.rankingEstados" :key="e.uf"
              class="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-default">
              <span class="text-sm font-medium text-gray-700">{{ e.uf }}</span>
              <div class="flex items-center gap-3">
                <span class="text-xs text-gray-400">{{ e.total }} imóveis</span>
                <span class="text-sm font-bold text-brand-600">{{ e.scoreMedio }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Explorar por objetivo -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <h2 class="text-sm font-bold text-gray-900 mb-3">🔎 Explorar por objetivo</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <router-link to="/imoveis?sort=percentualDesconto,desc" class="card-explore">
            <span class="text-xl">💰</span>
            <div>
              <div class="text-sm font-medium text-gray-900">Maiores descontos</div>
              <p class="text-xs text-gray-500">Imóveis ordenados pelo maior desconto</p>
            </div>
          </router-link>
          <router-link to="/imoveis?financiamento=Sim" class="card-explore">
            <span class="text-xl">🏦</span>
            <div>
              <div class="text-sm font-medium text-gray-900">Financiáveis</div>
              <p class="text-xs text-gray-500">Imóveis que aceitam financiamento</p>
            </div>
          </router-link>
          <router-link to="/imoveis?precoMax=100000" class="card-explore">
            <span class="text-xl">🎯</span>
            <div>
              <div class="text-sm font-medium text-gray-900">Até R$ 100 mil</div>
              <p class="text-xs text-gray-500">Oportunidades mais acessíveis</p>
            </div>
          </router-link>
          <router-link to="/imoveis?descontoMin=40" class="card-explore">
            <span class="text-xl">🔥</span>
            <div>
              <div class="text-sm font-medium text-gray-900">Desconto acima de 40%</div>
              <p class="text-xs text-gray-500">Imóveis com desconto agressivo</p>
            </div>
          </router-link>
          <router-link to="/imoveis?tipoImovel=Casa" class="card-explore">
            <span class="text-xl">🏠</span>
            <div>
              <div class="text-sm font-medium text-gray-900">Casas</div>
              <p class="text-xs text-gray-500">Filtrar apenas casas</p>
            </div>
          </router-link>
          <router-link to="/imoveis?tipoImovel=Apartamento" class="card-explore">
            <span class="text-xl">🏢</span>
            <div>
              <div class="text-sm font-medium text-gray-900">Apartamentos</div>
              <p class="text-xs text-gray-500">Filtrar apenas apartamentos</p>
            </div>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { dataService } from '@/services/dataService'
import { useCatalogoStore } from '@/stores/catalogo'
import type { Imovel } from '@/types'

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
const cidades = ref<string[]>([])
const uf = ref(store.ufSelecionada)

async function load() {
  loading.value = true
  data.value = await dataService.dashboardGlobal(uf.value || undefined, filtroCidade.value || undefined) as DashboardData
  loading.value = false
}

onMounted(async () => {
  if (!uf.value) { router.push('/'); return }
  cidades.value = await dataService.cidades(uf.value)
  await load()
})

watch(filtroCidade, () => load())
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
  transition: all 0.15s;
}
.card-stat:hover {
  border-color: #bfdbfe;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.card-explore {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #f3f4f6;
  transition: all 0.15s;
}
.card-explore:hover {
  border-color: #bfdbfe;
  background: #eff6ff;
}
</style>
