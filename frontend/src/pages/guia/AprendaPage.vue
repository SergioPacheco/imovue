<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-brand-900 via-brand-800 to-blue-900 text-white py-16 sm:py-24">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight">Aprenda antes de dar lance</h1>
        <p class="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">
          Imóveis com desconto chamam atenção, mas o comprador precisa saber analisar edital, ocupação, débitos, financiamento, comissão, prazos e documentação.
        </p>
        <a :href="AFFILIATE_CONFIG.courseUrl" target="_blank" rel="nofollow sponsored noopener"
          class="mt-8 inline-block bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
          Ver curso recomendado
        </a>
      </div>
    </section>

    <!-- Por que estudar -->
    <section v-reveal class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Por que estudar antes de comprar?</h2>
      <p class="text-gray-600 leading-relaxed">
        Comprar um imóvel de leilão ou venda direta pode ser uma boa oportunidade, mas também pode gerar prejuízo quando o comprador não entende as regras. O desconto anunciado não deve ser analisado sozinho.
      </p>
    </section>

    <!-- Principais riscos -->
    <section v-reveal="100" class="bg-gray-50 py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">Principais riscos</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="risco in riscos" :key="risco" class="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <span class="text-2xl">⚠️</span>
            <p class="text-sm font-medium text-gray-700 mt-2">{{ risco }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- O que aprender -->
    <section v-reveal="200" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">O que você precisa aprender</h2>
      <ul class="space-y-3">
        <li v-for="item in aprendizados" :key="item" class="flex items-start gap-3">
          <span class="text-brand-500 mt-0.5">✓</span>
          <span class="text-gray-700">{{ item }}</span>
        </li>
      </ul>
    </section>

    <!-- CTA final -->
    <section v-reveal="300" class="bg-gradient-to-r from-brand-50 to-blue-50 py-16">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Quer aprender o passo a passo?</h2>
        <p class="mt-4 text-gray-600 max-w-xl mx-auto">
          Veja um treinamento recomendado para iniciantes que querem entender como funcionam imóveis da Caixa, leilões, editais e riscos antes de fazer uma proposta.
        </p>
        <a :href="AFFILIATE_CONFIG.courseUrl" target="_blank" rel="nofollow sponsored noopener"
          class="mt-8 inline-block bg-brand-500 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-brand-600 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          Ver treinamento recomendado
        </a>
      </div>
    </section>

    <!-- Avisos legais -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-xs text-gray-400 space-y-3">
        <p>O IMOVUE é uma plataforma independente de organização e visualização de informações. Não somos a Caixa, não representamos leiloeiros e não garantimos resultado financeiro. As compras devem ser feitas nos canais oficiais indicados no edital ou na página responsável pela venda.</p>
        <p>{{ AFFILIATE_CONFIG.disclosure }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { AFFILIATE_CONFIG } from '@/config/affiliate'

const riscos = [
  'Imóvel ocupado',
  'Débitos de condomínio',
  'Débitos de IPTU',
  'Prazo curto para pagamento',
  'Imóvel sem visita interna',
  'Edital com regras específicas',
  'Custos de cartório, ITBI e registro',
  'Financiamento não disponível',
]

const aprendizados = [
  'Como ler o edital',
  'Como verificar a situação de ocupação',
  'Como calcular o custo real',
  'Como comparar com o valor de mercado',
  'Como verificar se aceita financiamento',
  'Como identificar riscos jurídicos',
  'Como montar um checklist antes da proposta',
]
</script>
