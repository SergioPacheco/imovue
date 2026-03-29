<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="flex items-center gap-2 group">
            <div class="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">iV</span>
            </div>
            <span class="text-xl font-bold text-gray-900 group-hover:text-brand-500 transition-colors">Imovue</span>
          </router-link>
          <nav class="flex items-center gap-1">
            <router-link to="/imoveis" class="btn-ghost text-sm">Imóveis</router-link>
            <router-link to="/dashboard" class="btn-ghost text-sm">Dashboard</router-link>
            <router-link to="/guia" class="btn-ghost text-sm">Guia</router-link>
            <router-link to="/favoritos" class="btn-ghost text-sm relative">
              Favoritos
              <span v-if="fav.count() > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {{ fav.count() }}
              </span>
            </router-link>
            <router-link to="/admin" class="btn-ghost text-sm text-gray-400 hover:text-gray-600">Admin</router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>Imovue — Catálogo de imóveis de leilão da CAIXA</span>
          <span>Dados públicos. Não possui vínculo oficial com a CAIXA.</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useFavoritos } from '@/composables/useFavoritos'
const fav = useFavoritos()
</script>
