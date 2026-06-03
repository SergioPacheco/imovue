<template>
  <article>
    <div class="bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <router-link to="/aprenda-leilao-imoveis" class="text-xs text-brand-500 hover:text-brand-600">← Guia de riscos</router-link>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">Prazo Curto para Pagamento</h1>
        <p class="text-gray-500 mt-2">Arrematou e não pagou no prazo? Perde o imóvel e leva multa</p>
      </div>
    </div>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 prose prose-gray">
      <h2>O que significa?</h2>
      <p>Em modalidades como leilão (judicial ou extrajudicial), o arrematante geralmente tem entre <strong>24 horas e 5 dias úteis</strong> para efetuar o pagamento integral ou apresentar comprovante de financiamento aprovado.</p>

      <h2>Por que é um risco?</h2>
      <ul>
        <li>Se não pagar no prazo, <strong>perde o imóvel</strong> e pode sofrer penalidades</li>
        <li>Penalidades incluem: perda do sinal (5-10%), multa, e até exclusão de futuros leilões</li>
        <li>Financiamento bancário leva semanas para aprovação — não dá tempo de solicitar depois</li>
        <li>Transferências de alto valor podem travar por compliance bancário</li>
      </ul>

      <h2>Prazos por modalidade (Caixa)</h2>
      <ul>
        <li><strong>Leilão SFI:</strong> pagamento em até 24-48h após homologação</li>
        <li><strong>Venda Online:</strong> 5 dias úteis para pagamento ou comprovação de financiamento</li>
        <li><strong>Venda Direta:</strong> mais flexível, geralmente 30 dias para financiamento</li>
        <li><strong>Licitação Aberta:</strong> conforme edital, geralmente 5-10 dias</li>
      </ul>

      <h2>Como se proteger</h2>
      <ul>
        <li><strong>Tenha o dinheiro disponível</strong> antes de dar lance (conta corrente com liquidez)</li>
        <li>Se pretende financiar: obtenha a <strong>carta de crédito pré-aprovada</strong> antes de participar</li>
        <li>Leia o edital para saber o prazo exato e forma de pagamento aceita</li>
        <li>Para iniciantes: prefira modalidade <strong>"Venda Direta"</strong> que aceita financiamento com prazo maior</li>
      </ul>

      <div class="bg-blue-50 border border-blue-100 rounded-xl p-5 not-prose mt-8">
        <p class="text-sm text-blue-800"><strong>Resumo:</strong> Nunca dê lance sem ter certeza de que pode pagar no prazo. Financiamento precisa ser pré-aprovado. Venda Direta é a mais segura para iniciantes.</p>
      </div>
    </div>
      <div class="max-w-3xl mx-auto px-4 sm:px-6 pb-10"><router-link to="/aprenda/sem-visita-interna" class="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600">Próximo: Sem Visita Interna →</router-link></div>
  </article>
</template>

<script setup lang="ts">
import { useHead } from '@/composables/useHead'
useHead('Prazo de Pagamento em Leilão', 'Conheça os prazos de pagamento por modalidade e como evitar perder o lance.')
</script>
