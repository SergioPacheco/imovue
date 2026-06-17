<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Guias — Aprenda sobre imóveis da Caixa</h1>
    <p class="text-gray-500 mb-8">Conteúdo original e educativo para quem quer comprar imóveis com desconto de forma segura e informada.</p>

    <div v-for="cat in categories" :key="cat" class="mb-8">
      <h2 class="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">{{ cat }}</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <router-link v-for="a in byCategory(cat)" :key="a.slug" :to="`/guias/${a.slug}`"
          class="block p-4 rounded-xl border border-gray-200 hover:border-brand-200 hover:shadow-sm transition-all">
          <h3 class="text-sm font-semibold text-gray-900 mb-1">{{ a.title }}</h3>
          <p class="text-xs text-gray-500 line-clamp-2">{{ a.description }}</p>
          <span class="text-xs text-brand-500 mt-2 inline-block">Ler artigo →</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { articles, getCategories } from '@/data/articles'
import { useSeoHead, breadcrumbJsonLd } from '@/composables/useSeoHead'

const categories = getCategories()
const byCategory = (cat: string) => articles.filter(a => a.category === cat)

useSeoHead({
  title: 'Guias — Aprenda sobre imóveis da Caixa',
  description: 'Guias completos sobre como comprar imóveis da Caixa com desconto: leilão, venda direta, financiamento, FGTS, custos, documentação e riscos.',
  jsonLd: breadcrumbJsonLd([
    { name: 'Início', url: '/' },
    { name: 'Guias', url: '/guias' },
  ]),
})
</script>
