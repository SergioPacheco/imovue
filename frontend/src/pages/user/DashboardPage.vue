<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">📊 Dashboard — {{ d.uf }}</h1>
        <router-link to="/" class="text-sm text-brand-500">← Trocar estado</router-link>
      </div>
      <router-link to="/imoveis" class="btn-primary">Ver imóveis →</router-link>
    </div>

    <div v-if="loading" class="grid sm:grid-cols-4 gap-5">
      <div v-for="i in 4" :key="i" class="skeleton h-28 rounded-xl"></div>
    </div>

    <template v-else-if="d.total">
      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div class="card p-5 text-center">
          <div class="text-3xl font-extrabold text-brand-500">{{ d.total }}</div>
          <div class="text-sm text-gray-500 mt-1">Imóveis disponíveis</div>
        </div>
        <div class="card p-5 text-center">
          <div class="text-3xl font-extrabold text-success-600">{{ d.descontoMedio }}%</div>
          <div class="text-sm text-gray-500 mt-1">Desconto médio</div>
        </div>
        <div class="card p-5 text-center">
          <div class="text-3xl font-extrabold text-orange-500">{{ d.descontoMax }}%</div>
          <div class="text-sm text-gray-500 mt-1">Maior desconto</div>
        </div>
        <div class="card p-5 text-center">
          <div class="text-3xl font-extrabold text-gray-700">R$ {{ fmtK(d.precoMedio) }}</div>
          <div class="text-sm text-gray-500 mt-1">Preço médio</div>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-8 mb-8">
        <!-- Distribuição de desconto -->
        <div class="card p-6">
          <h2 class="font-bold text-gray-900 mb-4">Distribuição de Desconto</h2>
          <div class="space-y-3">
            <div v-for="(item, i) in faixas" :key="i">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">{{ item.label }}</span>
                <span class="font-semibold">{{ item.count }} <span class="text-gray-400 font-normal">({{ item.pct }}%)</span></span>
              </div>
              <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" :class="item.color" :style="{ width: item.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Por tipo -->
        <div class="card p-6">
          <h2 class="font-bold text-gray-900 mb-4">Por Tipo de Imóvel</h2>
          <div class="space-y-3">
            <div v-for="t in d.porTipo" :key="t.tipo" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="badge badge-type">{{ t.tipo }}</span>
                <span class="text-xs text-gray-400">{{ t.quantidade }} imóveis</span>
              </div>
              <div class="text-right">
                <span class="font-bold text-success-600">{{ t.descontoMedio }}%</span>
                <span class="text-xs text-gray-400 ml-2">R$ {{ fmtK(t.precoMedio) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top cidades -->
      <div class="card p-6 mb-8">
        <h2 class="font-bold text-gray-900 mb-4">🏆 Top Cidades por Desconto Médio</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div v-for="(c, i) in d.porCidade" :key="c.cidade"
            class="bg-gray-50 rounded-xl p-4 text-center hover:bg-brand-50 transition-colors">
            <div class="text-xs text-gray-400 mb-1">#{{ i + 1 }}</div>
            <div class="font-semibold text-gray-900 text-sm truncate">{{ c.cidade }}</div>
            <div class="text-xl font-bold text-success-600 mt-1">{{ c.descontoMedio }}%</div>
            <div class="text-xs text-gray-400">{{ c.quantidade }} imóveis</div>
          </div>
        </div>
      </div>

      <!-- Top 10 oportunidades -->
      <div class="card p-6">
        <h2 class="font-bold text-gray-900 mb-4">🔥 Top 10 Maiores Descontos</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b-2 border-gray-200 text-left text-gray-500">
                <th class="pb-3 font-medium">#</th>
                <th class="pb-3 font-medium">Cidade</th>
                <th class="pb-3 font-medium">Tipo</th>
                <th class="pb-3 font-medium text-right">Preço</th>
                <th class="pb-3 font-medium text-right">Avaliação</th>
                <th class="pb-3 font-medium text-right">Desconto</th>
                <th class="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(im, i) in d.topDescontos" :key="im.numeroImovel" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 font-bold text-gray-400">{{ i + 1 }}</td>
                <td class="py-3">
                  <div class="font-medium text-gray-900">{{ im.cidade }}</div>
                  <div class="text-xs text-gray-400">{{ im.bairro }}</div>
                </td>
                <td class="py-3"><span class="badge badge-type">{{ im.tipoImovel }}</span></td>
                <td class="py-3 text-right font-semibold">R$ {{ fmt(im.precoVenda) }}</td>
                <td class="py-3 text-right text-gray-400 line-through">R$ {{ fmt(im.valorAvaliacao) }}</td>
                <td class="py-3 text-right"><span class="badge badge-discount text-sm font-bold">-{{ im.percentualDesconto }}%</span></td>
                <td class="py-3 text-right">
                  <router-link :to="`/imoveis/${im.numeroImovel}`" class="text-brand-500 hover:text-brand-600 font-medium">Ver →</router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-20">
      <div class="text-5xl mb-4">📊</div>
      <h3 class="text-lg font-semibold text-gray-700">Nenhum dado carregado</h3>
      <p class="text-gray-400 mt-1">Selecione um estado primeiro.</p>
      <router-link to="/" class="btn-primary mt-4 inline-block">Selecionar estado</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { catalogoApi } from '@/services/api'

const router = useRouter()
const d = ref<any>({})
const loading = ref(true)

const fmt = (v: number | null) => v ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'
const fmtK = (v: number) => {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K'
  return v.toFixed(0)
}

const faixas = computed(() => {
  const dist = d.value.distribuicaoDesconto
  if (!dist) return []
  const total = dist.ate20 + dist.de20a40 + dist.de40a60 + dist.acima60
  if (total === 0) return []
  const pct = (n: number) => Math.round((n / total) * 100)
  return [
    { label: 'Até 20%', count: dist.ate20, pct: pct(dist.ate20), color: 'bg-gray-400' },
    { label: '20% a 40%', count: dist.de20a40, pct: pct(dist.de20a40), color: 'bg-blue-400' },
    { label: '40% a 60%', count: dist.de40a60, pct: pct(dist.de40a60), color: 'bg-success-500' },
    { label: 'Acima de 60%', count: dist.acima60, pct: pct(dist.acima60), color: 'bg-orange-500' },
  ]
})

onMounted(async () => {
  const estado = await catalogoApi.estado()
  if (!estado.uf) { router.push('/'); return }
  d.value = await catalogoApi.dashboard()
  loading.value = false
})
</script>
