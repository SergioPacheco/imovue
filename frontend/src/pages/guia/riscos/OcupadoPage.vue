<template>
  <article>
    <!-- Hero -->
    <div class="bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <router-link to="/aprenda-leilao-imoveis" class="text-xs text-brand-500 hover:text-brand-600">← Guia de riscos</router-link>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">Imóvel Ocupado</h1>
        <p class="text-gray-500 mt-2">Entenda o risco, a legislação e como se proteger antes de arrematar</p>
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 prose prose-gray">
      <h2>O que significa?</h2>
      <p>Um imóvel ocupado é aquele onde ainda há pessoas morando — pode ser o antigo proprietário, inquilinos, ou até terceiros sem relação com o contrato original. Nos editais da Caixa, essa informação aparece como <strong>"Ocupado"</strong> ou <strong>"Desocupado"</strong>.</p>

      <h2>Por que é um risco?</h2>
      <ul>
        <li>A <strong>desocupação é responsabilidade do comprador</strong>, não da Caixa ou do leiloeiro</li>
        <li>Não é possível simplesmente "trocar a fechadura" — isso é crime (exercício arbitrário das próprias razões, art. 345 do Código Penal)</li>
        <li>O processo judicial de <strong>imissão na posse</strong> pode levar de 6 meses a 3 anos</li>
        <li>Custos advocatícios variam de R$ 3.000 a R$ 10.000+</li>
        <li>O ocupante pode danificar o imóvel durante o processo</li>
      </ul>

      <h2>Base legal</h2>
      <p>Para imóveis da Caixa (alienação fiduciária), a <strong>Lei 9.514/97, art. 30</strong> prevê que, consolidada a propriedade, o devedor deve desocupar em 60 dias após notificação. Na prática, muitos não saem voluntariamente.</p>
      <p>Para leilões judiciais, o comprador deve requerer a <strong>imissão na posse</strong> ao juiz (art. 625 do CPC).</p>

      <h2>Como se proteger</h2>
      <ul>
        <li>Prefira imóveis marcados como <strong>"Desocupado"</strong> no edital</li>
        <li>Se for ocupado, calcule no custo total: honorários advocatícios + tempo sem usar o imóvel</li>
        <li>Tente negociação amigável ("cash for keys") — oferecer valor para o ocupante sair voluntariamente costuma ser mais rápido e barato que a via judicial</li>
        <li>Consulte um advogado especialista <strong>antes</strong> de dar o lance</li>
      </ul>

      <h2>O desconto compensa?</h2>
      <p>Imóveis ocupados geralmente têm descontos maiores (40-60%) justamente pelo risco. Para investidores experientes pode compensar; para compradores de primeiro imóvel, é mais seguro evitar.</p>

      <div class="bg-blue-50 border border-blue-100 rounded-xl p-5 not-prose mt-8">
        <p class="text-sm text-blue-800"><strong>Resumo:</strong> Imóvel ocupado = desconto maior + risco judicial + custo extra de desocupação. Some tudo antes de decidir.</p>
      </div>
    </div>
      <div class="max-w-3xl mx-auto px-4 sm:px-6 pb-10"><router-link to="/aprenda/debitos-condominio" class="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600">Próximo: Débitos de Condomínio →</router-link></div>
  </article>
</template>

<script setup lang="ts">
import { useHead } from '@/composables/useHead'
useHead('Imóvel Ocupado em Leilão', 'Entenda os riscos de comprar imóvel ocupado em leilão da Caixa e como se proteger juridicamente.')
</script>
