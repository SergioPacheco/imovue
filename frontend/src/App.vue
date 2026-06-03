<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="flex items-center gap-2 group">
            <img src="/logo.svg" alt="Imovue" class="w-9 h-9 group-hover:scale-110 transition-transform" />
            <span class="text-xl font-bold text-gray-900 group-hover:text-brand-500 transition-colors">Imovue</span>
          </router-link>
          <nav class="flex items-center gap-1">
            <router-link to="/imoveis" class="btn-ghost text-sm">Imóveis</router-link>
            <router-link to="/dashboard" class="btn-ghost text-sm">Radar</router-link>
            <router-link to="/mapa" class="btn-ghost text-sm">Mapa</router-link>
            <router-link to="/guia" class="btn-ghost text-sm">Guia</router-link>
            <router-link to="/favoritos" class="btn-ghost text-sm relative p-2">
              <svg class="w-5 h-5" :fill="fav.count() > 0 ? '#ef4444' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <span v-if="fav.count() > 0" class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {{ fav.count() }}
              </span>
            </router-link>
          </nav>
        </div>
      </div>
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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>Imovue — Catálogo de imóveis de leilão da CAIXA</span>
          <div class="flex items-center gap-4">
            <router-link to="/termos" class="hover:text-gray-600">Termos de Uso</router-link>
            <router-link to="/privacidade" class="hover:text-gray-600">Privacidade</router-link>
          </div>
        </div>
        <p class="text-xs text-gray-300 text-center mt-3">Dados públicos. Não possui vínculo oficial com a CAIXA.</p>
      </div>
    </footer>

    <!-- ChatBot -->
    <ChatBot />
  </div>
</template>

<script setup lang="ts">
import { useFavoritos } from '@/composables/useFavoritos'
import ChatBot from '@/components/ChatBot.vue'
const fav = useFavoritos()
</script>
