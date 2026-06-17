<template>
  <div class="max-w-3xl mx-auto px-4 py-20 text-center">
    <div class="text-6xl mb-4">🏚️</div>
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
    <p class="text-gray-500 mb-6">O endereço que você acessou não existe ou o imóvel foi removido do catálogo.</p>
    <div class="flex justify-center gap-3">
      <router-link to="/" class="btn-primary">Página inicial</router-link>
      <router-link to="/imoveis" class="btn-secondary">Ver imóveis</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeoHead } from '@/composables/useSeoHead'
useSeoHead({ title: 'Página não encontrada', description: 'A página que você procura não existe.', robots: 'noindex,follow' })
</script>
