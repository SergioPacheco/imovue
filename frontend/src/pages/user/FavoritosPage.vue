<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">❤️ Meus Favoritos</h1>
    <div class="flex items-center justify-between mb-6">
      <p class="text-gray-500">{{ fav.count() }} imóvel(is) salvo(s) neste navegador.</p>
      <button v-if="fav.count() > 0" @click="limpar" class="text-sm text-red-500 hover:text-red-700 font-medium">
        🗑️ Limpar todos
      </button>
    </div>

    <!-- Vazio -->
    <div v-if="fav.count() === 0" class="text-center py-20">
      <div class="text-5xl mb-4">💔</div>
      <h3 class="text-lg font-semibold text-gray-700">Nenhum imóvel favoritado</h3>
      <p class="text-gray-400 mt-1 max-w-md mx-auto">
        Clique no ❤️ nos cards de imóveis para salvar aqui. Os favoritos ficam salvos no seu navegador.
      </p>
      <router-link to="/" class="btn-primary mt-6 inline-block">Explorar imóveis</router-link>
    </div>

    <!-- Cards -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="im in fav.lista()" :key="im.numeroImovel" class="card overflow-hidden group relative">
        <!-- Remover -->
        <button @click="fav.toggle(im)"
          class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-red-500 text-white shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
          title="Remover dos favoritos">
          <svg class="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>

        <router-link :to="`/imoveis/${im.numeroImovel}`" class="block">
          <PropertyImage :tipo="im.tipoImovel" :numero="im.numeroImovel">
            <div class="absolute top-3 left-3 flex gap-1.5">
              <span v-if="im.tipoImovel" class="badge badge-type">{{ im.tipoImovel }}</span>
              <span v-if="im.percentualDesconto" class="badge badge-discount">-{{ im.percentualDesconto }}%</span>
            </div>
          </PropertyImage>

          <div class="p-4">
            <h3 class="font-semibold text-gray-900 group-hover:text-brand-500 transition-colors truncate">
              {{ im.cidade }}/{{ im.uf }} — {{ im.bairro }}
            </h3>
            <p class="text-xs text-gray-400 truncate mt-0.5">{{ im.endereco }}</p>
            <div class="mt-3 flex items-baseline gap-2">
              <span class="text-xl font-bold text-gray-900">R$ {{ fmt(im.precoVenda) }}</span>
            </div>
            <div class="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-gray-500">
              <span v-if="im.areaPrivativa">📐 {{ im.areaPrivativa }}m²</span>
              <span v-if="im.quartos">🛏️ {{ im.quartos }} qto</span>
              <span v-if="im.vagas">🚗 {{ im.vagas }} vaga</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Info -->
    <div v-if="fav.count() > 0" class="mt-8 bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
      💡 Os favoritos são salvos localmente no seu navegador. Se limpar os dados do navegador, eles serão perdidos.
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFavoritos } from '@/composables/useFavoritos'
import PropertyImage from '@/components/PropertyImage.vue'

const fav = useFavoritos()
const fmt = (v: number | null) => v ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'

function limpar() {
  if (confirm('Remover todos os favoritos?')) fav.limparTodos()
}
</script>
