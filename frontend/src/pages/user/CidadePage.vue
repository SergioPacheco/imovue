<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="skeleton h-8 w-64 mb-4"></div>
      <div class="skeleton h-4 w-96 mb-8"></div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="skeleton h-32 rounded-xl"></div>
      </div>
    </div>

    <div v-else-if="!cidadeNome">
      <div class="text-center py-20">
        <div class="text-5xl mb-4">🔍</div>
        <h3 class="text-lg font-semibold text-gray-700">Cidade não encontrada</h3>
        <router-link :to="`/estado/${uf}`" class="btn-primary mt-4 inline-block">Voltar para {{ nomeEstado }}</router-link>
      </div>
    </div>

    <div v-else>
      <!-- Breadcrumb -->
      <nav class="bg-white border-b border-gray-200" aria-label="Breadcrumb">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol class="flex items-center gap-2 text-sm text-gray-400">
            <li><router-link to="/" class="hover:text-brand-500">Início</router-link></li>
            <li><span>/</span></li>
            <li><router-link :to="`/estado/${uf}`" class="hover:text-brand-500">{{ nomeEstado }}</router-link></li>
            <li><span>/</span></li>
            <li class="text-gray-700 font-medium">{{ cidadeNome }}</li>
          </ol>
        </div>
      </nav>

      <!-- Header -->
      <section class="bg-gradient-to-br from-brand-50 to-green-50 py-12">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Imóveis de Leilão da CAIXA em {{ cidadeNome }}/{{ ufUpper }}
          </h1>
          <p class="mt-3 text-lg text-gray-600 max-w-3xl">
            {{ imoveisCidade.length.toLocaleString('pt-BR') }} imóveis disponíveis em {{ cidadeNome }}
            com descontos de até {{ maiorDesconto }}%.
            <span v-if="precoMinimo > 0">A partir de R$ {{ precoMinimo.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) }}.</span>
          </p>
        </div>
      </section>

      <!-- Stats Cards -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-8">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <div class="text-2xl font-bold text-brand-600">{{ imoveisCidade.length }}</div>
            <div class="text-xs text-gray-500">imóveis</div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <div class="text-2xl font-bold text-green-600">{{ maiorDesconto }}%</div>
            <div class="text-xs text-gray-500">maior desconto</div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <div class="text-2xl font-bold text-gray-900">{{ bairros.length }}</div>
            <div class="text-xs text-gray-500">bairros</div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <div class="text-2xl font-bold text-orange-600">{{ financiaveis }}</div>
            <div class="text-xs text-gray-500">financiáveis</div>
          </div>
        </div>
      </section>

      <!-- Bairros -->
      <section v-if="bairros.length > 1" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Bairros em {{ cidadeNome }}</h2>
        <div class="flex flex-wrap gap-2">
          <span v-for="b in bairros" :key="b.nome"
                class="px-3 py-1.5 bg-gray-100 text-sm rounded-full text-gray-700">
            {{ b.nome }} ({{ b.count }})
          </span>
        </div>
      </section>

      <!-- Imóveis em destaque -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100">
        <h2 class="text-xl font-bold text-gray-900 mb-6">
          Melhores oportunidades em {{ cidadeNome }}
        </h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <router-link v-for="im in topImoveis" :key="im.numeroImovel"
             :to="`/imovel/${im.numeroImovel}`"
             class="bg-white border border-gray-200 rounded-xl p-4 hover:border-brand-300 hover:shadow-md transition-all group">
            <div class="flex justify-between items-start mb-2">
              <span class="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{{ im.tipoImovel || 'Imóvel' }}</span>
              <span v-if="im.percentualDesconto" class="text-xs font-bold text-green-600">-{{ Math.round(im.percentualDesconto) }}%</span>
            </div>
            <div class="text-sm font-semibold text-gray-900 group-hover:text-brand-600">{{ im.bairro }}</div>
            <div class="text-xs text-gray-500 mt-1 truncate">{{ im.endereco }}</div>
            <div v-if="im.precoVenda" class="mt-2 text-lg font-bold text-gray-900">
              R$ {{ im.precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) }}
            </div>
            <div class="flex gap-3 mt-2 text-xs text-gray-400">
              <span v-if="im.areaPrivativa">{{ im.areaPrivativa }}m²</span>
              <span v-if="im.quartos">{{ im.quartos }} qto{{ im.quartos > 1 ? 's' : '' }}</span>
              <span v-if="im.vagas">{{ im.vagas }} vaga{{ im.vagas > 1 ? 's' : '' }}</span>
            </div>
          </router-link>
        </div>
      </section>

      <!-- CTA -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100">
        <div class="bg-brand-50 rounded-xl p-6 text-center">
          <h2 class="text-lg font-bold text-brand-900">Ver todos os imóveis em {{ cidadeNome }}</h2>
          <p class="text-sm text-brand-700 mt-1">Use filtros avançados de preço, desconto, tipo e mais.</p>
          <router-link :to="`/imoveis?uf=${ufUpper}&cidade=${encodeURIComponent(cidadeNome)}`" class="btn-primary mt-4 inline-block">
            Ver {{ imoveisCidade.length }} imóveis →
          </router-link>
        </div>
      </section>

      <!-- Texto SEO -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Imóveis retomados pela CAIXA em {{ cidadeNome }}</h2>
        <div class="prose prose-sm text-gray-600 max-w-none">
          <p>
            {{ cidadeNome }}, no estado de {{ nomeEstado }}, possui {{ imoveisCidade.length }} imóveis disponíveis
            para compra através da Caixa Econômica Federal. Os imóveis estão distribuídos em {{ bairros.length }} bairros,
            com preços a partir de R$ {{ precoMinimo.toLocaleString('pt-BR') }} e descontos que chegam a {{ maiorDesconto }}%
            sobre o valor de avaliação.
          </p>
          <p v-if="tiposCidade.length">
            Os tipos disponíveis incluem: {{ tiposCidade.join(', ') }}.
            <span v-if="financiaveis > 0">{{ financiaveis }} imóveis aceitam financiamento pela CAIXA.</span>
          </p>
          <p>
            Para mais informações sobre como comprar imóveis de leilão da CAIXA, consulte nosso
            <a href="/guias/como-comprar-imoveis-caixa" class="text-brand-500 hover:underline">guia completo de compra</a>.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeoHead, breadcrumbJsonLd } from '@/composables/useSeoHead'
import { dataService } from '@/services/dataService'
import { UF_NOMES } from '@/constants/uf'
import type { Imovel } from '@/types'

const route = useRoute()
const router = useRouter()
const uf = computed(() => (route.params.uf as string).toLowerCase())
const ufUpper = computed(() => uf.value.toUpperCase())
const nomeEstado = computed(() => UF_NOMES[ufUpper.value] || ufUpper.value)
const cidadeSlug = computed(() => route.params.cidade as string)

const loading = ref(true)
const cidadeNome = ref('')
const imoveisCidade = ref<Imovel[]>([])

function slugify(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const maiorDesconto = computed(() => {
  const descontos = imoveisCidade.value.map(i => i.percentualDesconto ?? 0).filter(d => d > 0 && d <= 100)
  return descontos.length ? Math.round(Math.max(...descontos)) : 0
})

const precoMinimo = computed(() => {
  const precos = imoveisCidade.value.map(i => i.precoVenda).filter(Boolean) as number[]
  return precos.length ? Math.min(...precos) : 0
})

const financiaveis = computed(() => imoveisCidade.value.filter(i => i.financiamento === 'Sim').length)

const bairros = computed(() => {
  const count = new Map<string, number>()
  imoveisCidade.value.forEach(i => count.set(i.bairro, (count.get(i.bairro) || 0) + 1))
  return [...count.entries()].map(([nome, count]) => ({ nome, count })).sort((a, b) => b.count - a.count)
})

const tiposCidade = computed(() => [...new Set(imoveisCidade.value.map(i => i.tipoImovel).filter(Boolean))])

const topImoveis = computed(() =>
  [...imoveisCidade.value]
    .filter(i => (i.percentualDesconto ?? 0) > 0 && (i.percentualDesconto ?? 0) <= 100)
    .sort((a, b) => (b.percentualDesconto ?? 0) - (a.percentualDesconto ?? 0))
    .slice(0, 6)
)

onMounted(async () => {
  const ufs = await dataService.ufsDisponiveis()
  if (!ufs.includes(ufUpper.value)) {
    router.replace('/404')
    return
  }

  // Load all imoveis for the UF and find the city by slug
  const all = await dataService.listar(ufUpper.value, { size: 99999 })
  const cidadesMap = new Map<string, string>() // slug -> nome real

  for (const im of all.content) {
    cidadesMap.set(slugify(im.cidade), im.cidade)
  }

  const realName = cidadesMap.get(cidadeSlug.value)
  if (!realName) {
    loading.value = false
    return
  }

  cidadeNome.value = realName
  imoveisCidade.value = all.content.filter(i => i.cidade === realName)
  loading.value = false
})

// SEO
useSeoHead({
  title: `Imóveis de Leilão da CAIXA em ${cidadeNome.value || 'Cidade'}/${ufUpper.value}`,
  description: `${imoveisCidade.value.length || ''} imóveis da CAIXA com desconto em ${cidadeNome.value || 'cidade'}/${ufUpper.value}. Apartamentos, casas e terrenos com até ${maiorDesconto.value || 90}% de desconto.`,
  canonical: `https://imovue.com.br/estado/${uf.value}/${cidadeSlug.value}`,
  jsonLd: [
    breadcrumbJsonLd([
      { name: 'Início', url: '/' },
      { name: nomeEstado.value, url: `/estado/${uf.value}` },
      { name: cidadeNome.value || '', url: `/estado/${uf.value}/${cidadeSlug.value}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Imóveis de Leilão da CAIXA em ${cidadeNome.value}/${ufUpper.value}`,
      description: `Catálogo de imóveis retomados pela CAIXA disponíveis em ${cidadeNome.value}, ${nomeEstado.value}.`,
      url: `https://imovue.com.br/estado/${uf.value}/${cidadeSlug.value}`,
    }
  ],
})
</script>
