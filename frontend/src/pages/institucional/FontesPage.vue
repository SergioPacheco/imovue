<template>
  <article class="max-w-3xl mx-auto px-4 py-8 prose prose-sm prose-gray">
    <h1>Fontes dos Dados</h1>

    <h2>Dados de imóveis (fonte oficial)</h2>
    <p>As informações sobre imóveis à venda — incluindo número, localização, preço de venda, valor de avaliação, percentual de desconto, modalidade, situação de financiamento, tipo de imóvel e áreas — são extraídas diretamente das <strong>listas públicas de venda de imóveis</strong> publicadas pela Caixa Econômica Federal em:</p>
    <p><a href="https://venda-imoveis.caixa.gov.br" target="_blank" rel="noopener">https://venda-imoveis.caixa.gov.br</a></p>

    <h2>Dados de geolocalização</h2>
    <p>As coordenadas geográficas (latitude/longitude) são obtidas a partir da <strong>tabela de municípios do IBGE</strong>, vinculando cada cidade à sua coordenada central. Não utilizamos geolocalização precisa por endereço.</p>

    <h2>Dados calculados pelo Imovue</h2>
    <p>As seguintes informações são <strong>derivadas ou estimadas</strong> pelo Imovue, e não vêm da fonte oficial:</p>
    <ul>
      <li><strong>Score Imovue</strong> — pontuação baseada em critérios objetivos (veja <router-link to="/metodologia">Metodologia</router-link>)</li>
      <li><strong>Preço por m²</strong> — calculado dividindo preço de venda pela área disponível</li>
      <li><strong>Mediana do bairro</strong> — calculada a partir dos imóveis disponíveis no mesmo bairro</li>
      <li><strong>Custo estimado de aquisição</strong> — estimativas de ITBI (3%) e escritura/registro (2%) sobre o preço de venda</li>
      <li><strong>Classificação de ocupação</strong> — inferida da descrição textual do imóvel</li>
    </ul>

    <h2>Frequência de atualização</h2>
    <table>
      <thead><tr><th>Dado</th><th>Frequência</th><th>Método</th></tr></thead>
      <tbody>
        <tr><td>Lista de imóveis</td><td>Semanal</td><td>Download automatizado dos CSVs por UF</td></tr>
        <tr><td>Geolocalização</td><td>Sob demanda</td><td>Atualizado quando novos municípios aparecem</td></tr>
        <tr><td>Estatísticas de bairro</td><td>Junto com dados de imóveis</td><td>Recalculado a cada coleta</td></tr>
        <tr><td>Conteúdo editorial</td><td>Contínuo</td><td>Revisado e atualizado pela equipe</td></tr>
      </tbody>
    </table>

    <h2>Limitações e atrasos</h2>
    <ul>
      <li>Pode haver defasagem de <strong>até 7 dias</strong> entre a atualização oficial e o Imovue</li>
      <li>Imóveis vendidos ou removidos podem permanecer listados até a próxima coleta</li>
      <li>Dados de área e quartos podem estar incompletos na fonte original</li>
      <li>Endereços e bairros seguem a grafia da fonte oficial (podem ter variações)</li>
      <li>Coordenadas são centróides municipais, não localizações exatas do imóvel</li>
    </ul>

    <h2>Integridade dos dados</h2>
    <p>Não alteramos, editamos ou complementamos os dados da Caixa. Nosso pipeline realiza apenas: download → normalização de formato → geolocalização por município → publicação. Em caso de inconsistência entre o Imovue e o site oficial, <strong>prevalece a informação do portal da Caixa</strong>.</p>
  </article>
</template>

<script setup lang="ts">
import { useSeoHead } from '@/composables/useSeoHead'
useSeoHead({
  title: 'Fontes dos Dados',
  description: 'Saiba de onde vêm os dados do Imovue, como são atualizados, quais informações são calculadas e quais limitações existem.',
})
</script>
