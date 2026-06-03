<template>
  <article>
    <div class="bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <router-link to="/aprenda-leilao-imoveis" class="text-xs text-brand-500 hover:text-brand-600">← Guia de riscos</router-link>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">Débitos de Condomínio</h1>
        <p class="text-gray-500 mt-2">A dívida que vem junto com o imóvel — e pode ser maior que o desconto</p>
      </div>
    </div>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 prose prose-gray">
      <h2>O que significa?</h2>
      <p>Dívidas de condomínio são <strong>obrigações "propter rem"</strong> (por causa da coisa) — elas acompanham o imóvel, não a pessoa. Quem compra, herda toda a dívida anterior, independente de quem gerou.</p>

      <h2>Por que é um risco?</h2>
      <ul>
        <li>Dívidas podem acumular <strong>anos de inadimplência</strong> com juros e multa</li>
        <li>Em condomínios com taxa alta (R$ 800-2.000/mês), a dívida pode chegar a R$ 50.000+</li>
        <li>O STJ (decisão de outubro/2025) confirmou que o comprador é responsável pelas cotas a partir do registro na matrícula</li>
        <li>O condomínio pode executar judicialmente o novo proprietário</li>
      </ul>

      <h2>Base legal</h2>
      <p><strong>Código Civil, art. 1.345:</strong> "O adquirente de unidade responde pelos débitos do alienante, em relação ao condomínio, inclusive multas e juros moratórios."</p>

      <h2>Como se proteger</h2>
      <ul>
        <li><strong>Antes de dar lance:</strong> entre em contato com a administradora do condomínio e peça certidão de débitos</li>
        <li>Some a dívida de condomínio ao preço de compra para calcular o custo real</li>
        <li>Em alguns editais da Caixa, há cláusula de que débitos condominiais são de responsabilidade do vendedor — leia o edital!</li>
        <li>Negocie com o condomínio após a compra: muitos aceitam acordo com desconto de 30-50% para pagamento à vista</li>
      </ul>

      <h2>Exemplo prático</h2>
      <p>Imóvel com preço de R$ 150.000 e desconto de 40%. Parece ótimo. Mas se há R$ 40.000 em dívida de condomínio, o desconto real cai para ~13%. Faça sempre a conta completa.</p>

      <div class="bg-blue-50 border border-blue-100 rounded-xl p-5 not-prose mt-8">
        <p class="text-sm text-blue-800"><strong>Resumo:</strong> Sempre consulte a administradora para saber o débito exato. Some ao preço de compra. Se o desconto não compensar, passe para o próximo.</p>
      </div>
    </div>
      <div class="max-w-3xl mx-auto px-4 sm:px-6 pb-10"><router-link to="/aprenda/debitos-iptu" class="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600">Próximo: Débitos de IPTU →</router-link></div>
  </article>
</template>

<script setup lang="ts">
import { useHead } from '@/composables/useHead'
useHead('Débitos de Condomínio em Leilão', 'Saiba como dívidas de condomínio funcionam em imóveis de leilão e como calcular o custo real.')
</script>
