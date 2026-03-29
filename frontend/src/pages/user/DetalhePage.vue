<template>
  <!-- Loading -->
  <div v-if="loading" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="skeleton h-6 w-48 mb-4"></div>
    <div class="skeleton h-10 w-96 mb-6"></div>
    <div class="grid sm:grid-cols-2 gap-4">
      <div v-for="i in 6" :key="i" class="skeleton h-6"></div>
    </div>
  </div>

  <!-- Not found -->
  <div v-else-if="!imovel" class="text-center py-20">
    <div class="text-5xl mb-4">🔍</div>
    <h3 class="text-lg font-semibold text-gray-700">Imóvel não encontrado</h3>
    <router-link to="/imoveis" class="btn-primary mt-4 inline-block">Voltar à listagem</router-link>
  </div>

  <!-- Detalhe -->
  <div v-else>
    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <router-link to="/imoveis" class="hover:text-brand-500">Imóveis</router-link>
          <span>/</span>
          <span class="text-gray-600">{{ imovel.cidade }}</span>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Coluna principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Imagem -->
          <PropertyImage :tipo="imovel.tipoImovel" :numero="imovel.numeroImovel" size="lg">
            <div class="absolute top-4 left-4 flex gap-2">
              <span v-if="imovel.tipoImovel" class="badge badge-type text-sm">{{ imovel.tipoImovel }}</span>
              <span v-if="imovel.percentualDesconto && imovel.percentualDesconto > 40" class="badge badge-hot text-sm">🔥 Oportunidade</span>
            </div>
          </PropertyImage>

          <!-- Título -->
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ imovel.cidade }} — {{ imovel.bairro }}</h1>
            <p class="text-gray-500 mt-1 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {{ imovel.endereco }}
            </p>
          </div>

          <!-- Atributos -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div v-if="imovel.areaPrivativa" class="bg-gray-50 rounded-xl p-4 text-center">
              <div class="text-lg font-bold text-gray-900">{{ imovel.areaPrivativa }}m²</div>
              <div class="text-xs text-gray-500">Área privativa</div>
            </div>
            <div v-if="imovel.areaTerreno" class="bg-gray-50 rounded-xl p-4 text-center">
              <div class="text-lg font-bold text-gray-900">{{ imovel.areaTerreno }}m²</div>
              <div class="text-xs text-gray-500">Terreno</div>
            </div>
            <div v-if="imovel.quartos" class="bg-gray-50 rounded-xl p-4 text-center">
              <div class="text-lg font-bold text-gray-900">{{ imovel.quartos }}</div>
              <div class="text-xs text-gray-500">Quarto(s)</div>
            </div>
            <div v-if="imovel.vagas" class="bg-gray-50 rounded-xl p-4 text-center">
              <div class="text-lg font-bold text-gray-900">{{ imovel.vagas }}</div>
              <div class="text-xs text-gray-500">Vaga(s)</div>
            </div>
          </div>

          <!-- Descrição -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 class="font-semibold text-gray-900 mb-2">Descrição</h2>
            <p class="text-gray-600 text-sm leading-relaxed">{{ imovel.descricao }}</p>
          </div>

          <!-- Informações -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 class="font-semibold text-gray-900 mb-3">Informações</h2>
            <dl class="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div class="flex justify-between py-2 border-b border-gray-100">
                <dt class="text-gray-500">Nº do imóvel</dt>
                <dd class="font-medium text-gray-900">{{ imovel.numeroImovel }}</dd>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-100">
                <dt class="text-gray-500">Modalidade</dt>
                <dd class="font-medium text-gray-900">{{ imovel.modalidadeVenda }}</dd>
              </div>
              <div v-if="imovel.financiamento" class="flex justify-between py-2 border-b border-gray-100">
                <dt class="text-gray-500">Financiamento</dt>
                <dd class="font-medium text-gray-900">{{ imovel.financiamento }}</dd>
              </div>
              <div v-if="imovel.areaTotal" class="flex justify-between py-2 border-b border-gray-100">
                <dt class="text-gray-500">Área total</dt>
                <dd class="font-medium text-gray-900">{{ imovel.areaTotal }}m²</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-4">
            <!-- Preço -->
            <div class="bg-white rounded-xl border border-gray-200 p-5">
              <div v-if="imovel.percentualDesconto" class="mb-3">
                <span class="badge badge-discount text-base px-3 py-1">-{{ imovel.percentualDesconto }}% de desconto</span>
              </div>
              <div class="text-3xl font-bold text-gray-900">R$ {{ fmt(imovel.precoVenda) }}</div>
              <div v-if="imovel.valorAvaliacao" class="mt-1">
                <span class="text-sm text-gray-400 line-through">Avaliação: R$ {{ fmt(imovel.valorAvaliacao) }}</span>
              </div>
              <div v-if="imovel.valorAvaliacao && imovel.precoVenda" class="mt-2 text-sm text-success-600 font-medium">
                Economia de R$ {{ fmt(imovel.valorAvaliacao - imovel.precoVenda) }}
              </div>
            </div>

            <!-- Ações -->
            <a :href="imovel.urlOficial" target="_blank" rel="noopener"
              class="btn-primary w-full text-center block">
              Ver no site oficial ↗
            </a>
            <a :href="mapsUrl" target="_blank" rel="noopener"
              class="btn-secondary w-full text-center block">
              📍 Ver no Google Maps
            </a>
            <a :href="matriculaUrl" target="_blank" rel="noopener"
              class="btn-secondary w-full text-center block">
              📄 Ver Matrícula (PDF)
            </a>
            <button @click="fav.toggle(imovel)" class="w-full text-center block transition-all"
              :class="fav.isFav(imovel.numeroImovel) ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100 font-semibold px-5 py-2.5 rounded-lg border' : 'btn-secondary'">
              {{ fav.isFav(imovel.numeroImovel) ? '❤️ Favoritado' : '🤍 Favoritar' }}
            </button>
            <button @click="compartilhar" class="btn-secondary w-full">📋 Copiar link</button>

            <!-- Aviso -->
            <div class="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 leading-relaxed">
              <strong>Atenção:</strong> As informações são extraídas de listas públicas da CAIXA.
              Confirme os dados diretamente no site oficial antes de tomar qualquer decisão.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra fixa mobile -->
    <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-2 z-50 shadow-lg">
      <button @click="fav.toggle(imovel)"
        class="px-4 py-2.5 rounded-lg border font-semibold text-sm transition-all"
        :class="fav.isFav(imovel.numeroImovel) ? 'bg-red-50 border-red-300 text-red-600' : 'border-gray-300 text-gray-600'">
        {{ fav.isFav(imovel.numeroImovel) ? '❤️' : '🤍' }}
      </button>
      <a :href="imovel.urlOficial" target="_blank" rel="noopener" class="btn-primary flex-1 text-center text-sm">
        Ver no site oficial ↗
      </a>
    </div>
    <div class="lg:hidden h-16"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PropertyImage from '@/components/PropertyImage.vue'
import { useFavoritos } from '@/composables/useFavoritos'
import { catalogoApi } from '@/services/api'
import type { Imovel } from '@/types'

const props = defineProps<{ numero: string }>()
const imovel = ref<Imovel | null>(null)
const loading = ref(true)
const fav = useFavoritos()

const fmt = (v: number | null) => v ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'
const compartilhar = () => { navigator.clipboard.writeText(window.location.href); alert('Link copiado!') }

function limparEndereco(im: Imovel) {
  // Remove termos cadastrais que confundem o Maps
  let e = im.endereco
    .replace(/,?\s*(LT|QD|SL|COND\.|BLOCO|BL|APTO|APT|ED\.|EDIF\.?)\s*[^,]*/gi, '')
    .replace(/\bN\.\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*$/, '')
    .trim()
  return `${e}, ${im.bairro}, ${im.cidade} - ${im.uf}, Brasil`
}

const mapsUrl = computed(() => {
  if (!imovel.value) return ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(limparEndereco(imovel.value))}`
})

const matriculaUrl = computed(() => {
  if (!imovel.value) return ''
  return `https://venda-imoveis.caixa.gov.br/editais/matricula/${imovel.value.uf}/${imovel.value.numeroImovel}.pdf`
})

onMounted(async () => {
  try { imovel.value = await catalogoApi.detalhe(props.numero) }
  finally { loading.value = false }
})
</script>
