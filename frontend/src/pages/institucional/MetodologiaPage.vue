<template>
  <article class="max-w-3xl mx-auto px-4 py-8 prose prose-sm prose-gray">
    <h1>Metodologia — Como funciona a análise e o Radar Imovue</h1>

    <h2>Origem dos dados</h2>
    <p>Todos os dados de imóveis exibidos no Imovue são extraídos das <strong>listas públicas de venda de imóveis</strong> disponibilizadas pela Caixa Econômica Federal em seu portal oficial. Os arquivos são publicados em formato CSV por estado e atualizados periodicamente pela própria Caixa.</p>

    <h2>Frequência de atualização</h2>
    <p>O Imovue coleta os dados semanalmente de forma automatizada. Pode haver defasagem de até 7 dias entre a atualização no site oficial e a refletida em nossa plataforma. Imóveis vendidos ou removidos pela Caixa podem permanecer no catálogo até a próxima coleta.</p>

    <h2>Como o Imovue organiza os imóveis</h2>
    <p>Os dados brutos são normalizados (padronização de endereços, tipos e modalidades), geocodificados (adição de coordenadas geográficas via tabela de municípios IBGE) e publicados como JSONs estáticos consumidos pelo frontend. Não há banco de dados com informações proprietárias.</p>

    <h2>O Score Imovue</h2>
    <p>O Score é um indicador numérico de 0 a 100 que prioriza imóveis com características mais atrativas para análise. <strong>Não é uma recomendação de compra</strong> — é uma ferramenta de triagem.</p>

    <h3>Composição do Score (máximo 100 pontos)</h3>
    <table>
      <thead><tr><th>Critério</th><th>Pontuação</th><th>Detalhes</th></tr></thead>
      <tbody>
        <tr><td>Percentual de desconto</td><td>até 36 pts</td><td>Desconto × 0.6, limitado a 60% de desconto (máx 36 pts)</td></tr>
        <tr><td>Aceita financiamento</td><td>20 pts</td><td>Se o campo "financiamento" = "Sim"</td></tr>
        <tr><td>Modalidade favorável</td><td>10 pts</td><td>Venda Direta ou Venda Online (menor concorrência)</td></tr>
        <tr><td>Preço abaixo da média</td><td>15 pts</td><td>Se o preço de venda for inferior ao ticket médio do estado</td></tr>
        <tr><td>2+ quartos</td><td>5 pts</td><td>Imóvel com pelo menos 2 quartos</td></tr>
        <tr><td>1+ vagas</td><td>5 pts</td><td>Imóvel com pelo menos 1 vaga de garagem</td></tr>
      </tbody>
    </table>

    <h3>Classificação por faixa</h3>
    <ul>
      <li><strong>80-100 (Excelente)</strong> — alto desconto, financiável, modalidade acessível</li>
      <li><strong>60-79 (Forte)</strong> — boas condições gerais</li>
      <li><strong>40-59 (Moderado)</strong> — oportunidade com ressalvas</li>
      <li><strong>0-39 (Atenção)</strong> — poucos sinais favoráveis, requer análise cuidadosa</li>
    </ul>

    <h2>Influência do desconto</h2>
    <p>O desconto é calculado pela Caixa com base na diferença entre o valor de avaliação e o preço mínimo de venda. Descontos superiores a 100% ou negativos são tratados como inválidos e não pontuam no score.</p>

    <h2>Influência da modalidade de venda</h2>
    <p>Imóveis em Venda Direta ou Online recebem pontuação adicional por serem modalidades com menos concorrência e processo mais simples que leilões tradicionais.</p>

    <h2>Influência da ocupação</h2>
    <p>A ocupação <strong>não é um fator direto no score</strong>, porém é sinalizada na análise individual do imóvel como alerta. Imóveis ocupados exigem processo judicial de desocupação e custos adicionais.</p>

    <h2>Influência do financiamento</h2>
    <p>Imóveis que aceitam financiamento habitacional recebem 20 pontos por ampliarem o acesso a compradores que não possuem valor integral à vista.</p>

    <h2>Análise de preço por m²</h2>
    <p>Quando disponível, comparamos o preço por metro quadrado do imóvel com a mediana dos demais imóveis no mesmo bairro. Isso identifica oportunidades genuínas vs. descontos sobre avaliações infladas.</p>

    <h2>Limitações</h2>
    <ul>
      <li>O score <strong>não considera</strong> estado de conservação, localização exata, vizinhança ou potencial de valorização</li>
      <li>Descontos altos podem indicar problemas (ocupação, débitos, localização ruim) — não apenas oportunidade</li>
      <li>A mediana do bairro é calculada apenas com imóveis disponíveis na Caixa, não reflete o mercado geral</li>
      <li>Dados de área podem estar incompletos, afetando o cálculo de preço/m²</li>
    </ul>

    <h2>Divergências com a fonte oficial</h2>
    <p>Podem ocorrer divergências quando a Caixa atualiza dados entre as coletas semanais. Sempre confirme preço, modalidade e disponibilidade no <a href="https://venda-imoveis.caixa.gov.br" target="_blank" rel="noopener">portal oficial</a>.</p>

    <h2>Disclaimer</h2>
    <p>O Score Imovue e todas as análises apresentadas são ferramentas informativas. <strong>Não garantimos rentabilidade, valorização ou adequação de qualquer imóvel</strong>. Consulte sempre o edital, a matrícula e profissionais especializados antes de participar de qualquer processo de aquisição.</p>
  </article>
</template>

<script setup lang="ts">
import { useSeoHead, faqJsonLd } from '@/composables/useSeoHead'
useSeoHead({
  title: 'Metodologia — Como funciona o Score e o Radar Imovue',
  description: 'Entenda como o Imovue calcula o score de oportunidade, quais critérios são usados no radar e as limitações da análise automatizada.',
  jsonLd: faqJsonLd([
    { question: 'Como funciona o Score Imovue?', answer: 'O Score é um indicador de 0 a 100 baseado em desconto, financiamento, modalidade, preço e características do imóvel. Não é recomendação de compra.' },
    { question: 'De onde vêm os dados?', answer: 'Dados extraídos semanalmente das listas públicas de venda de imóveis da Caixa Econômica Federal.' },
    { question: 'Com que frequência os dados são atualizados?', answer: 'Coleta semanal automatizada. Pode haver defasagem de até 7 dias.' },
  ]),
})
</script>
