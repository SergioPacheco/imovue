<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          <router-link to="/" class="flex items-center gap-2 group">
            <img src="/logo.svg" alt="Imovue" class="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span class="text-lg font-bold text-gray-900 group-hover:text-brand-500 transition-colors">Imovue</span>
          </router-link>

          <!-- Desktop nav -->
          <nav class="hidden sm:flex items-center gap-1">
            <router-link to="/imoveis" class="btn-ghost text-sm">Imóveis</router-link>
            <router-link to="/dashboard" class="btn-ghost text-sm">Radar</router-link>
            <router-link to="/mapa" class="btn-ghost text-sm">Mapa</router-link>
            <router-link to="/guias" class="btn-ghost text-sm">Guia</router-link>
            <router-link to="/favoritos" class="btn-ghost text-sm relative p-2">
              <svg class="w-5 h-5" :fill="fav.count() > 0 ? '#ef4444' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <span v-if="fav.count() > 0" class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {{ fav.count() }}
              </span>
            </router-link>
          </nav>

          <!-- Mobile hamburger -->
          <button @click="menuOpen = !menuOpen" class="sm:hidden p-2 text-gray-600">
            <svg v-if="!menuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <nav v-show="menuOpen" class="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
        <router-link to="/imoveis" class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" @click="menuOpen = false">Imóveis</router-link>
        <router-link to="/dashboard" class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" @click="menuOpen = false">Radar</router-link>
        <router-link to="/mapa" class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" @click="menuOpen = false">Mapa</router-link>
        <router-link to="/guias" class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" @click="menuOpen = false">Guia</router-link>
        <router-link to="/favoritos" class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" @click="menuOpen = false">
          Favoritos <span v-if="fav.count() > 0" class="text-red-500 font-bold">({{ fav.count() }})</span>
        </router-link>
      </nav>
    </header>

    <!-- Content -->
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm mb-6">
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Imovue</h3>
            <ul class="space-y-1.5 text-gray-500">
              <li><router-link to="/sobre" class="hover:text-gray-700">Sobre</router-link></li>
              <li><router-link to="/contato" class="hover:text-gray-700">Contato</router-link></li>
              <li><router-link to="/metodologia" class="hover:text-gray-700">Metodologia</router-link></li>
              <li><router-link to="/fontes-dos-dados" class="hover:text-gray-700">Fontes dos dados</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Conteúdo</h3>
            <ul class="space-y-1.5 text-gray-500">
              <li><router-link to="/guias" class="hover:text-gray-700">Guias</router-link></li>
              <li><router-link to="/imoveis" class="hover:text-gray-700">Imóveis</router-link></li>
              <li><router-link to="/dashboard" class="hover:text-gray-700">Radar</router-link></li>
              <li><router-link to="/politica-editorial" class="hover:text-gray-700">Política editorial</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Legal</h3>
            <ul class="space-y-1.5 text-gray-500">
              <li><router-link to="/termos" class="hover:text-gray-700">Termos de Uso</router-link></li>
              <li><router-link to="/privacidade" class="hover:text-gray-700">Privacidade</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Contato</h3>
            <p class="text-gray-500 text-xs">contato@imovue.com.br</p>
          </div>
        </div>
        <div class="border-t border-gray-100 pt-4 text-center">
          <p class="text-xs text-gray-400">Imovue — Plataforma de pesquisa e análise de imóveis da Caixa. Dados públicos. Não possui vínculo oficial com a CAIXA.</p>
        </div>
      </div>
    </footer>

    <!-- ChatBot -->
    <ChatBot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFavoritos } from '@/composables/useFavoritos'
import ChatBot from '@/components/ChatBot.vue'
const fav = useFavoritos()
const menuOpen = ref(false)
</script>
