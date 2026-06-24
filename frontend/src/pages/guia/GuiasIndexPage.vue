<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Guias sobre imóveis da Caixa: compra, riscos, documentação e descontos</h1>
    <p class="text-gray-600 mb-8 text-sm leading-relaxed">Aprenda como analisar imóveis da Caixa com desconto, entender modalidades de venda, calcular custos, avaliar riscos e tomar uma decisão mais segura antes de comprar. Conteúdo original da equipe Imovue, atualizado semanalmente.</p>

    <!-- Trilhas -->
    <div class="bg-blue-50 rounded-xl p-5 mb-8 border border-blue-100">
      <h2 class="text-sm font-bold text-blue-900 mb-3">📚 Trilhas de aprendizado</h2>
      <div class="grid sm:grid-cols-3 gap-4 text-xs">
        <div>
          <h3 class="font-semibold text-gray-800 mb-1">Iniciante</h3>
          <ol class="space-y-0.5 text-gray-600 list-decimal list-inside">
            <li><router-link to="/guias/como-comprar-imoveis-caixa" class="hover:text-brand-600">Como comprar</router-link></li>
            <li><router-link to="/guias/diferenca-leilao-licitacao-venda-online" class="hover:text-brand-600">Modalidades</router-link></li>
            <li><router-link to="/guias/como-analisar-edital" class="hover:text-brand-600">Edital</router-link></li>
            <li><router-link to="/guias/erros-comuns-iniciantes" class="hover:text-brand-600">Erros comuns</router-link></li>
            <li><router-link to="/guias/checklist-antes-de-comprar" class="hover:text-brand-600">Checklist</router-link></li>
          </ol>
        </div>
        <div>
          <h3 class="font-semibold text-gray-800 mb-1">Riscos</h3>
          <ol class="space-y-0.5 text-gray-600 list-decimal list-inside">
            <li><router-link to="/guias/riscos-imovel-ocupado" class="hover:text-brand-600">Imóvel ocupado</router-link></li>
            <li><router-link to="/guias/debitos-condominio-iptu" class="hover:text-brand-600">Dívidas</router-link></li>
            <li><router-link to="/guias/quando-desconto-50-nao-compensa" class="hover:text-brand-600">Desconto falso</router-link></li>
            <li><router-link to="/guias/custo-total-compra" class="hover:text-brand-600">Custo total</router-link></li>
          </ol>
        </div>
        <div>
          <h3 class="font-semibold text-gray-800 mb-1">Análise financeira</h3>
          <ol class="space-y-0.5 text-gray-600 list-decimal list-inside">
            <li><router-link to="/guias/custo-total-compra" class="hover:text-brand-600">Custo total</router-link></li>
            <li><router-link to="/guias/preco-por-metro-quadrado" class="hover:text-brand-600">Preço/m²</router-link></li>
            <li><router-link to="/guias/como-avaliar-liquidez-imovel" class="hover:text-brand-600">Liquidez</router-link></li>
            <li><router-link to="/guias/rentabilidade-aluguel" class="hover:text-brand-600">Rentabilidade</router-link></li>
            <li><router-link to="/guias/vale-a-pena-comprar-imovel-caixa" class="hover:text-brand-600">Vale a pena?</router-link></li>
          </ol>
        </div>
      </div>
    </div>

    <!-- Artigos por categoria -->
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
import { useSeoHead, breadcrumbJsonLd, websiteJsonLd } from '@/composables/useSeoHead'

const categories = getCategories()
const byCategory = (cat: string) => articles.filter(a => a.category === cat)

useSeoHead({
  title: 'Guias sobre imóveis da Caixa: compra, riscos, documentação e descontos',
  description: 'Central de aprendizado sobre imóveis da Caixa com desconto. Guias completos sobre leilão, venda direta, financiamento, FGTS, custos, documentação, riscos e análise de oportunidades.',
  jsonLd: [
    breadcrumbJsonLd([
      { name: 'Início', url: '/' },
      { name: 'Guias', url: '/guias' },
    ]),
    websiteJsonLd(),
  ],
})
</script>
