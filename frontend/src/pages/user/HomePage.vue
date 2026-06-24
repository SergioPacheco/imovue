<template>
  <div>
    <!-- Hero -->
    <section class="relative bg-brand-900 text-white">
      <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80"
           alt="" class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-br from-brand-900/85 via-brand-800/75 to-brand-700/70"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Encontre imóveis da CAIXA<br class="hidden sm:block" /> com <span class="text-blue-300">grandes descontos</span>
        </h1>
        <p class="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">
          Catálogo atualizado de imóveis da CAIXA. Selecione um estado para explorar oportunidades.
        </p>

        <!-- Smart Search -->
        <div class="mt-8 max-w-2xl mx-auto relative z-30">
          <SmartSearchBar
            placeholder="Ex: apartamento em SP até 200 mil com 2 quartos..."
            @search="onSmartSearch"
          />
        </div>
      </div>
    </section>

    <!-- Indicadores -->
    <section v-if="!loading" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 mb-8">
      <div class="flex justify-center gap-6 sm:gap-10 text-center text-white">
        <div class="bg-brand-700/90 backdrop-blur rounded-xl px-5 py-3 shadow-lg">
          <div class="text-2xl font-extrabold">{{ totalImoveis.toLocaleString('pt-BR') }}</div>
          <div class="text-xs text-blue-200">imóveis monitorados</div>
        </div>
        <div class="bg-brand-700/90 backdrop-blur rounded-xl px-5 py-3 shadow-lg">
          <div class="text-2xl font-extrabold">{{ ufs.length }}</div>
          <div class="text-xs text-blue-200">estados cobertos</div>
        </div>
        <div class="bg-brand-700/90 backdrop-blur rounded-xl px-5 py-3 shadow-lg">
          <div class="text-2xl font-extrabold">{{ maiorDesconto }}%</div>
          <div class="text-xs text-blue-200">maior desconto encontrado</div>
        </div>
      </div>
    </section>

    <!-- Seletor de Estado -->
    <section v-reveal class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Escolha onde procurar</h2>
            <p class="text-sm text-gray-500 mt-0.5">Escolha um estado e descubra onde estão as melhores oportunidades da CAIXA.</p>
          </div>
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
            class="group relative h-16 rounded-xl border-2 border-gray-200 bg-white
                   hover:border-brand-500 hover:bg-brand-50
                   active:scale-95 transition-all duration-150
                   disabled:opacity-50 disabled:cursor-wait flex flex-col items-center justify-center">
            <span class="font-bold text-gray-700 group-hover:text-brand-600 text-sm">{{ uf }}</span>
            <span class="text-[10px] text-gray-400 group-hover:text-brand-500">{{ manifestMap[uf]?.toLocaleString('pt-BR') || '' }}</span>
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
    <section v-reveal="200" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

    <!-- Guia do Comprador -->
    <section v-reveal="300" class="bg-gray-50 py-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Como comprar imóvel de leilão da CAIXA</h2>
          <p class="mt-2 text-gray-500">Guia rápido para você entender o processo do início ao fim.</p>
        </div>

        <!-- Modalidades -->
        <div class="grid sm:grid-cols-3 gap-5 mb-12">
          <div class="bg-white rounded-xl p-5 border border-gray-200">
            <h3 class="font-bold text-brand-600 mb-2">🏷️ Venda Direta Online</h3>
            <p class="text-sm text-gray-600">Preço fixo pela CAIXA. O primeiro que formalizar leva. Processo mais rápido.</p>
          </div>
          <div class="bg-white rounded-xl p-5 border border-gray-200">
            <h3 class="font-bold text-brand-600 mb-2">🏷️ Venda Online (Licitação)</h3>
            <p class="text-sm text-gray-600">Leilão online. Propostas em envelope fechado, vence a maior acima do mínimo.</p>
          </div>
          <div class="bg-white rounded-xl p-5 border border-gray-200">
            <h3 class="font-bold text-brand-600 mb-2">🏷️ Licitação Aberta</h3>
            <p class="text-sm text-gray-600">Processo presencial/híbrido com edital público. Exige caução prévia.</p>
          </div>
        </div>

        <!-- Passo a passo -->
        <h3 class="text-xl font-bold text-gray-900 mb-6">📋 Passo a Passo</h3>
        <div class="grid sm:grid-cols-2 gap-4 mb-12">
          <div v-for="(step, i) in passos" :key="i" class="flex gap-3 items-start bg-white rounded-lg p-4 border border-gray-200">
            <div class="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm shrink-0">{{ i + 1 }}</div>
            <div>
              <h4 class="font-semibold text-gray-900 text-sm">{{ step.title }}</h4>
              <p class="text-xs text-gray-600 mt-0.5">{{ step.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Pagamento -->
        <h3 class="text-xl font-bold text-gray-900 mb-6">💳 Condições de Pagamento</h3>
        <div class="grid sm:grid-cols-3 gap-5 mb-12">
          <div class="bg-white rounded-xl p-5 border-l-4 border-l-brand-500 border border-gray-200">
            <h4 class="font-bold text-gray-900 mb-1">À Vista</h4>
            <p class="text-xs text-gray-600">Maiores descontos. Prazo após homologação varia no edital.</p>
          </div>
          <div class="bg-white rounded-xl p-5 border-l-4 border-l-green-500 border border-gray-200">
            <h4 class="font-bold text-gray-900 mb-1">Financiamento CAIXA</h4>
            <p class="text-xs text-gray-600">Sujeito a análise de crédito. Taxas e prazos do SFH/SFI.</p>
          </div>
          <div class="bg-white rounded-xl p-5 border-l-4 border-l-orange-500 border border-gray-200">
            <h4 class="font-bold text-gray-900 mb-1">FGTS</h4>
            <p class="text-xs text-gray-600">Imóvel residencial, até teto SFH, sem outro imóvel na cidade.</p>
          </div>
        </div>

        <!-- FAQ resumido -->
        <h3 class="text-xl font-bold text-gray-900 mb-6">❓ Perguntas Frequentes</h3>
        <div class="space-y-3 mb-8">
          <details v-for="f in faq" :key="f.q" class="bg-white rounded-lg border border-gray-200 group">
            <summary class="p-4 cursor-pointer font-medium text-sm text-gray-900 hover:text-brand-500 list-none flex justify-between items-center">
              {{ f.q }}
              <span class="text-gray-400 group-open:rotate-180 transition-transform text-xs">▼</span>
            </summary>
            <p class="px-4 pb-4 text-xs text-gray-600 -mt-1">{{ f.a }}</p>
          </details>
        </div>

        <!-- Link para guia de riscos -->
        <div class="text-center">
          <router-link to="/guia" class="inline-flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 border border-brand-200 px-5 py-2.5 rounded-lg hover:bg-brand-50 transition-colors">
            ⚠️ Ver guia completo de riscos em leilão →
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSeoHead, websiteJsonLd } from '@/composables/useSeoHead'
import { dataService } from '@/services/dataService'
import { useCatalogoStore } from '@/stores/catalogo'
import SmartSearchBar from '@/components/SmartSearchBar.vue'
import { UF_NOMES } from '@/constants/uf'
import type { SmartSearchResult } from '@/composables/useSmartSearch'

useSeoHead({
  title: 'Imóveis da Caixa com Desconto',
  description: 'Encontre e analise imóveis da Caixa Econômica Federal com desconto de até 90%. Filtros avançados, score de oportunidade e guias educativos.',
  canonical: 'https://imovue.com.br/',
  jsonLd: websiteJsonLd(),
})

const router = useRouter()
const store = useCatalogoStore()
const ufs = ref<string[]>([])
const loading = ref(true)
const carregando = ref(false)
const ufSelecionada = ref('')
const busca = ref('')
const manifestMap = ref<Record<string, number>>({})
const totalImoveis = ref(0)
const maiorDesconto = ref(0)

const ufsFiltradas = computed(() => {
  if (!busca.value) return ufs.value
  const q = busca.value.toUpperCase()
  return ufs.value.filter(uf => uf.includes(q) || (UF_NOMES[uf] || '').toUpperCase().includes(q))
})

async function selecionar(uf: string) {
  carregando.value = true
  ufSelecionada.value = uf
  store.ufSelecionada = uf
  router.push('/imoveis')
}

function onSmartSearch(result: SmartSearchResult) {
  const uf = result.uf || 'SP'
  store.ufSelecionada = uf
  router.push({ path: '/imoveis', query: result.filtros as any })
}

onMounted(async () => {
  const m = await dataService.getManifest()
  ufs.value = m.map(e => e.uf)
  manifestMap.value = Object.fromEntries(m.map(e => [e.uf, e.total]))
  totalImoveis.value = m.reduce((sum, e) => sum + e.total, 0)
  maiorDesconto.value = Math.round(Math.max(...m.map((e: any) => e.maiorDesconto || 0)))
  loading.value = false
})

const passos = [
  { title: 'Pesquise o imóvel', desc: 'Filtre por estado, cidade, tipo, preço e desconto.' },
  { title: 'Visite (se possível)', desc: 'Verifique conservação e vizinhança.' },
  { title: 'Leia o edital', desc: 'Cada imóvel tem condições específicas.' },
  { title: 'Faça sua proposta', desc: 'Venda Direta: formalize. Venda Online: envie no prazo.' },
  { title: 'Aguarde homologação', desc: 'A CAIXA analisa e notifica o vencedor.' },
  { title: 'Documentação e pagamento', desc: 'Apresente documentos e efetue o pagamento.' },
  { title: 'Assine e registre', desc: 'Contrato + registro no Cartório de Imóveis.' },
]

const faq = [
  { q: 'Posso visitar o imóvel antes?', a: 'Desocupados geralmente permitem visita agendada. Ocupados podem não permitir acesso interno.' },
  { q: 'Posso usar FGTS?', a: 'Sim, se o imóvel aceitar, for residencial, até o teto SFH e você não tiver outro na mesma cidade.' },
  { q: 'E se estiver ocupado?', a: 'A desocupação geralmente é responsabilidade do comprador. Pode exigir ação judicial.' },
  { q: 'Quem paga IPTU atrasado?', a: 'Varia conforme edital. Em muitos casos, débitos anteriores são do comprador.' },
  { q: 'Posso financiar pela CAIXA?', a: 'Sim, para imóveis que aceitam. Passa por análise de crédito normal.' },
  { q: 'O desconto é real?', a: 'Sim. É calculado sobre o valor de avaliação da CAIXA. O preço de venda é o que você paga.' },
]
</script>
