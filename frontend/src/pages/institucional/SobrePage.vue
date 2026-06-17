<template>
  <article class="max-w-3xl mx-auto px-4 py-8 prose prose-sm prose-gray">
    <h1>Sobre o Imovue</h1>

    <h2>O que é o Imovue?</h2>
    <p>O Imovue é uma plataforma independente de pesquisa e análise de imóveis disponíveis para venda pela Caixa Econômica Federal. Nosso objetivo é facilitar a busca, comparação e avaliação de oportunidades imobiliárias com transparência e dados reais.</p>

    <h2>Por que criamos esta plataforma?</h2>
    <p>As listas de imóveis da Caixa estão dispersas em arquivos CSV e no portal oficial, sem ferramentas de filtro, comparação de preço por m² ou análise de oportunidade. O Imovue nasceu para resolver esse problema — reunindo todos os imóveis disponíveis em um catálogo organizado, com filtros avançados, radar de oportunidades e conteúdo educativo para quem deseja comprar imóveis com desconto.</p>

    <h2>Como o Imovue ajuda você?</h2>
    <ul>
      <li><strong>Busca inteligente</strong> — filtros por estado, cidade, bairro, tipo, preço, desconto, modalidade e financiamento</li>
      <li><strong>Análise automatizada</strong> — preço por m², comparação com a mediana do bairro, custo estimado de aquisição</li>
      <li><strong>Radar de oportunidades</strong> — score baseado em critérios objetivos para priorizar sua análise</li>
      <li><strong>Guias educativos</strong> — conteúdo original sobre como comprar, riscos, custos e documentação</li>
      <li><strong>Mapa interativo</strong> — visualização geográfica dos imóveis disponíveis</li>
    </ul>

    <h2>Importante: não somos a Caixa</h2>
    <p>O Imovue <strong>não possui vínculo, parceria ou representação</strong> da Caixa Econômica Federal. Não intermediamos vendas, não participamos de leilões e não temos acesso a informações privilegiadas.</p>
    <p>Todas as informações exibidas são extraídas de fontes públicas e devem ser <strong>confirmadas nos documentos oficiais</strong> (edital e matrícula) antes de qualquer decisão.</p>

    <h2>Limitações</h2>
    <ul>
      <li>Os dados podem apresentar atraso em relação à fonte oficial</li>
      <li>Imóveis podem ter sido vendidos ou removidos antes da próxima atualização</li>
      <li>O Score Imovue é uma ferramenta de priorização, não uma recomendação de compra</li>
      <li>Estimativas de custos (ITBI, cartório) são aproximadas e variam por município</li>
    </ul>

    <h2>Contato</h2>
    <p>Dúvidas, sugestões ou correções: <strong>contato@imovue.com.br</strong></p>
    <p>Para reportar erros nos dados, utilize o mesmo email informando o número do imóvel afetado.</p>
  </article>
</template>

<script setup lang="ts">
import { useSeoHead, organizationJsonLd } from '@/composables/useSeoHead'
useSeoHead({
  title: 'Sobre o Imovue',
  description: 'Conheça o Imovue: plataforma independente de pesquisa e análise de imóveis da Caixa com desconto. Saiba como funciona e como podemos ajudar.',
  jsonLd: organizationJsonLd(),
})
</script>
