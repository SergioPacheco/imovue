<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="skeleton h-8 w-64 mb-4"></div>
      <div class="skeleton h-4 w-96 mb-8"></div>
      <div class="grid sm:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="skeleton h-24 rounded-xl"></div>
      </div>
    </div>

    <div v-else>
      <!-- Breadcrumb -->
      <nav class="bg-white border-b border-gray-200" aria-label="Breadcrumb">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol class="flex items-center gap-2 text-sm text-gray-400">
            <li><a href="/" class="hover:text-brand-500">Início</a></li>
            <li><span>/</span></li>
            <li class="text-gray-700 font-medium">{{ nomeEstado }}</li>
          </ol>
        </div>
      </nav>

      <!-- Header -->
      <section class="bg-gradient-to-br from-brand-50 to-blue-50 py-12">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Imóveis de Leilão da CAIXA em {{ nomeEstado }}
          </h1>
          <p class="mt-3 text-lg text-gray-600 max-w-3xl">
            {{ stats.total.toLocaleString('pt-BR') }} imóveis disponíveis no estado de {{ nomeEstado }} ({{ ufUpper }})
            com descontos de até {{ stats.maiorDesconto }}%. Preço médio de R$ {{ stats.precoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) }}.
          </p>
        </div>
      </section>

      <!-- Stats Cards -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-8">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <div class="text-2xl font-bold text-brand-600">{{ stats.total.toLocaleString('pt-BR') }}</div>
            <div class="text-xs text-gray-500">imóveis</div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <div class="text-2xl font-bold text-green-600">{{ stats.maiorDesconto }}%</div>
            <div class="text-xs text-gray-500">maior desconto</div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <div class="text-2xl font-bold text-gray-900">{{ stats.financiaveis }}</div>
            <div class="text-xs text-gray-500">financiáveis</div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <div class="text-2xl font-bold text-orange-600">{{ stats.descontoMedio }}%</div>
            <div class="text-xs text-gray-500">desconto médio</div>
          </div>
        </div>
      </section>

      <!-- Cidades -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 class="text-xl font-bold text-gray-900 mb-6">
          Cidades com imóveis da CAIXA em {{ nomeEstado }}
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <a v-for="c in cidadesComContagem" :key="c.nome"
             :href="`/estado/${uf}/${c.slug}`"
             class="bg-white border border-gray-200 rounded-lg p-3 hover:border-brand-300 hover:shadow-sm transition-all group">
            <div class="font-medium text-gray-900 group-hover:text-brand-600 text-sm">{{ c.nome }}</div>
            <div class="text-xs text-gray-400">{{ c.count }} imóveis</div>
          </a>
        </div>
      </section>

      <!-- Tipos disponíveis -->
      <section v-if="tiposDisponiveis.length" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Tipos de imóveis em {{ nomeEstado }}</h2>
        <div class="flex flex-wrap gap-2">
          <a v-for="tipo in tiposDisponiveis" :key="tipo.nome"
             :href="`/imoveis?uf=${ufUpper}&tipoImovel=${encodeURIComponent(tipo.nome)}`"
             class="px-3 py-1.5 bg-gray-100 hover:bg-brand-50 text-sm rounded-full text-gray-700 hover:text-brand-600 transition-colors">
            {{ tipo.nome }} ({{ tipo.count }})
          </a>
        </div>
      </section>

      <!-- CTA -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100">
        <div class="bg-brand-50 rounded-xl p-6 text-center">
          <h2 class="text-lg font-bold text-brand-900">Explorar todos os imóveis</h2>
          <p class="text-sm text-brand-700 mt-1">Use os filtros avançados para encontrar a oportunidade ideal.</p>
          <a :href="`/imoveis?uf=${ufUpper}`" class="btn-primary mt-4 inline-block">
            Ver {{ stats.total.toLocaleString('pt-BR') }} imóveis em {{ ufUpper }} →
          </a>
        </div>
      </section>

      <!-- Conteúdo informativo -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Sobre imóveis de leilão da CAIXA em {{ nomeEstado }}</h2>
        <div class="prose prose-sm text-gray-600 max-w-none">
          <p>
            O estado de {{ nomeEstado }} possui atualmente {{ stats.total.toLocaleString('pt-BR') }} imóveis
            disponíveis para compra através da Caixa Econômica Federal, distribuídos em {{ cidadesComContagem.length }} cidades.
            Os descontos variam de acordo com o tipo de venda e localização, chegando a {{ stats.maiorDesconto }}% de desconto
            sobre o valor de avaliação.
          </p>
          <p>
            Entre as modalidades disponíveis estão Venda Direta Online, Venda Online (Licitação) e Licitação Aberta.
            <span v-if="stats.financiaveis > 0">{{ stats.financiaveis }} imóveis aceitam financiamento pela CAIXA, incluindo uso de FGTS quando aplicável.</span>
          </p>
          <p>
            Os dados são atualizados semanalmente a partir das listas oficiais da CAIXA. Para mais informações sobre como funciona
            a compra de imóveis de leilão, consulte nossos <a href="/guias" class="text-brand-500 hover:underline">guias educativos</a>.
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

const route = useRoute()
const router = useRouter()
const uf = computed(() => (route.params.uf as string).toLowerCase())
const ufUpper = computed(() => uf.value.toUpperCase())
const nomeEstado = computed(() => UF_NOMES[ufUpper.value] || ufUpper.value)

const loading = ref(true)
const imoveis = ref<any[]>([])
const stats = ref({ total: 0, maiorDesconto: 0, precoMedio: 0, descontoMedio: 0, financiaveis: 0 })

interface CidadeContagem { nome: string; slug: string; count: number }
const cidadesComContagem = ref<CidadeContagem[]>([])
const tiposDisponiveis = ref<{ nome: string; count: number }[]>([])

function slugify(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

onMounted(async () => {
  const ufs = await dataService.ufsDisponiveis()
  if (!ufs.includes(ufUpper.value)) {
    router.replace('/404')
    return
  }

  const manifest = await dataService.getManifest()
  const entry = manifest.find((e: any) => e.uf === ufUpper.value)

  // Load stats from manifest
  stats.value = {
    total: entry?.total || 0,
    maiorDesconto: Math.round(entry?.maiorDesconto || 0),
    precoMedio: Math.round(entry?.precoMedio || 0),
    descontoMedio: Math.round((entry?.descontoMedio || 0) * 10) / 10,
    financiaveis: entry?.financiaveis || 0,
  }

  // Load cities
  const cidades = await dataService.cidades(ufUpper.value)
  const allData = await dataService.listar(ufUpper.value, { size: 99999 })
  const cidadeCount = new Map<string, number>()
  const tipoCount = new Map<string, number>()

  for (const im of allData.content) {
    cidadeCount.set(im.cidade, (cidadeCount.get(im.cidade) || 0) + 1)
    if (im.tipoImovel) tipoCount.set(im.tipoImovel, (tipoCount.get(im.tipoImovel) || 0) + 1)
  }

  cidadesComContagem.value = [...cidadeCount.entries()]
    .map(([nome, count]) => ({ nome, slug: slugify(nome), count }))
    .sort((a, b) => b.count - a.count)

  tiposDisponiveis.value = [...tipoCount.entries()]
    .map(([nome, count]) => ({ nome, count }))
    .sort((a, b) => b.count - a.count)

  loading.value = false
})

// SEO
useSeoHead({
  title: `Imóveis de Leilão da CAIXA em ${nomeEstado.value} (${ufUpper.value})`,
  description: `Encontre ${stats.value.total || ''} imóveis da CAIXA com desconto em ${nomeEstado.value}. Descontos de até ${stats.value.maiorDesconto || 90}%. Apartamentos, casas e terrenos disponíveis.`,
  canonical: `https://imovue.com.br/estado/${uf.value}`,
  jsonLd: [
    breadcrumbJsonLd([
      { name: 'Início', url: '/' },
      { name: nomeEstado.value, url: `/estado/${uf.value}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Imóveis de Leilão da CAIXA em ${nomeEstado.value}`,
      description: `Catálogo de imóveis retomados pela CAIXA disponíveis para compra em ${nomeEstado.value}.`,
      url: `https://imovue.com.br/estado/${uf.value}`,
    }
  ],
})
</script>
