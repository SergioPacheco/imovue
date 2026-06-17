<template>
  <article class="max-w-3xl mx-auto px-4 py-8 prose prose-sm prose-gray">
    <h1>Contato</h1>

    <p>O Imovue é mantido de forma independente. Utilize os canais abaixo para entrar em contato:</p>

    <h2>Email</h2>
    <p><strong>contato@imovue.com.br</strong></p>

    <h2>Quando entrar em contato</h2>
    <ul>
      <li><strong>Erros nos dados</strong> — informe o número do imóvel e o dado incorreto</li>
      <li><strong>Sugestões de melhoria</strong> — novas funcionalidades, filtros, conteúdo</li>
      <li><strong>Parcerias editoriais</strong> — colaboração para produção de conteúdo educativo</li>
      <li><strong>Questões de privacidade</strong> — solicitações relacionadas à LGPD</li>
    </ul>

    <h2>O que NÃO podemos fazer</h2>
    <ul>
      <li>Intermediar compras ou vendas de imóveis</li>
      <li>Fornecer consultoria jurídica ou financeira</li>
      <li>Alterar dados do site oficial da Caixa</li>
      <li>Garantir disponibilidade de imóveis específicos</li>
    </ul>

    <h2>Prazo de resposta</h2>
    <p>Respondemos em até 5 dias úteis. Para correções urgentes de dados, priorizamos o atendimento.</p>
  </article>
</template>

<script setup lang="ts">
import { useSeoHead } from '@/composables/useSeoHead'
useSeoHead({
  title: 'Contato',
  description: 'Entre em contato com o Imovue para reportar erros, sugerir melhorias ou esclarecer dúvidas sobre a plataforma.',
})
</script>
