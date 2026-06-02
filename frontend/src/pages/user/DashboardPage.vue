<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <h1 class="text-xl font-bold text-gray-900 mb-4">Dashboard</h1>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-20">
      <div class="text-4xl mb-3 animate-pulse">📊</div>
      <p class="text-gray-500">Carregando panorama...</p>
    </div>

    <template v-if="data && !loading">
      <!-- Área 1 — Resumo geral -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        <div class="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div class="text-lg font-bold text-gray-900">{{ data.resumo.total.toLocaleString() }}</div>
          <div class="text-xs text-gray-500">Imóveis</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div class="text-lg font-bold text-green-600">{{ data.resumo.maiorDesconto.toFixed(1) }}%</div>
          <div class="text-xs text-gray-500">Maior desconto</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div class="text-lg font-bold text-gray-900">{{ data.resumo.descontoMedio }}%</div>
          <div class="text-xs text-gray-500">Desconto médio</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div class="text-lg font-bold text-blue-600">{{ data.resumo.financiaveis.toLocaleString() }}</div>
          <div class="text-xs text-gray-500">Financiáveis</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div class="text-lg font-bold text-orange-500">{{ data.resumo.altosDescontos.toLocaleString() }}</div>
          <div class="text-xs text-gray-500">>30% desconto</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div class="text-lg font-bold text-gray-900">R$ {{ (data.resumo.precoMedio / 1000).toFixed(0) }}k</div>
          <div class="text-xs text-gray-500">Ticket médio</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div class="text-lg font-bold text-brand-600">{{ data.resumo.scoreMedio }}</div>
          <div class="text-xs text-gray-500">Score médio</div>
        </div>
      </div>

      <!-- Área 2 — Top Oportunidades -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <h2 class="text-sm font-bold text-gray-900 mb-3">🔥 Top Oportunidades</h2>
        <div class="space-y-2">
          <router-link v-for="(im, i) in data.topOportunidades" :key="im.numeroImovel"
            :to="`/imoveis/${im.numeroImovel}?uf=${im.uf}`"
            class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <span class="text-xs font-bold text-gray-400 w-5">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900 truncate">{{ im.tipoImovel || 'Imóvel' }} em {{ im.cidade }}</span>
                <span v-if="im.financiamento === 'Sim'" class="text-xs text-blue-500">🏦</span>
              </div>
              <p class="text-xs text-gray-400 truncate">{{ im.bairro }} — {{ im.uf }}</p>
            </div>
            <div class="text-right shrink-0">
              <div class="text-sm font-bold text-brand-600">{{ im.score }}</div>
              <div class="text-xs text-gray-400">score</div>
            </div>
            <div class="text-right shrink-0 w-16">
              <div class="text-sm font-bold text-green-600">-{{ (im.percentualDesconto ?? 0).toFixed(0) }}%</div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-xs font-medium text-gray-700">R$ {{ ((im.precoVenda ?? 0) / 1000).toFixed(0) }}k</div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Área 3 — Ranking por Estado -->
      <div class="grid sm:grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <h2 class="text-sm font-bold text-gray-900 mb-3">📍 Ranking por Estado (Score médio)</h2>
          <div class="space-y-1.5">
            <router-link v-for="e in data.rankingEstados" :key="e.uf" :to="`/imoveis?uf=${e.uf}`"
              class="flex items-center justify-between p-1.5 rounded hover:bg-gray-50">
              <span class="text-sm font-medium text-gray-700">{{ e.uf }}</span>
              <div class="flex items-center gap-3">
                <span class="text-xs text-gray-400">{{ e.total }} imóveis</span>
                <span class="text-sm font-bold text-brand-600">{{ e.scoreMedio }}</span>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Área 4 — Alertas -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <h2 class="text-sm font-bold text-gray-900 mb-3">⚡ Radar Imovue</h2>
          <div class="space-y-3">
            <div class="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <span class="text-lg">🔥</span>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ data.alertas.scoreAlto }} imóveis com score acima de 80</div>
                <p class="text-xs text-gray-500">Oportunidades fortes para análise imediata</p>
              </div>
            </div>
            <div class="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
              <span class="text-lg">⚠️</span>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ data.alertas.altosDescontosOcupados }} com alto desconto, mas ocupados</div>
                <p class="text-xs text-gray-500">Desconto atrativo porém com risco de ocupação</p>
              </div>
            </div>
            <div class="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
              <span class="text-lg">🏦</span>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ data.resumo.financiaveis }} aceitam financiamento</div>
                <p class="text-xs text-gray-500">Ideal para quem precisa de crédito</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Área 5 — Chamadas para listas -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <h2 class="text-sm font-bold text-gray-900 mb-3">🔎 Explorar oportunidades</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <router-link to="/imoveis?sort=percentualDesconto,desc" class="btn-outline text-center">💰 Maiores descontos</router-link>
          <router-link to="/imoveis?financiamento=Sim" class="btn-outline text-center">🏦 Financiáveis</router-link>
          <router-link to="/imoveis?precoMax=100000" class="btn-outline text-center">🎯 Até R$100 mil</router-link>
          <router-link to="/imoveis?descontoMin=40" class="btn-outline text-center">🔥 Desconto >40%</router-link>
          <router-link to="/imoveis?tipoImovel=Casa" class="btn-outline text-center">🏠 Casas</router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dataService } from '@/services/dataService'
import type { Imovel } from '@/types'

interface DashboardData {
  resumo: { total: number; maiorDesconto: number; descontoMedio: number; financiaveis: number; altosDescontos: number; precoMedio: number; scoreMedio: number }
  topOportunidades: (Imovel & { score: number })[]
  rankingEstados: { uf: string; total: number; scoreMedio: number }[]
  alertas: { altosDescontosOcupados: number; naoFinanciaveis: number; scoreAlto: number }
}

const data = ref<DashboardData | null>(null)
const loading = ref(true)

onMounted(async () => {
  data.value = await dataService.dashboardGlobal() as DashboardData
  loading.value = false
})
</script>

<style scoped>
.btn-outline {
  @apply text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-colors;
}
</style>
