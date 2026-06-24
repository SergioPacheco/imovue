<template>
  <div>
    <div v-if="loading" class="text-center py-4 text-gray-400">Carregando dados...</div>
    <template v-else-if="stats">
      <h2>Panorama: Santa Catarina</h2>
      <p>Santa Catarina tem <strong>apenas {{ stats.total }} imóveis</strong> da Caixa — oferta escassa que reflete um mercado aquecido com pouca inadimplência. Preço médio de R$ {{ Math.round(stats.precoMedio / 1000) }} mil e desconto médio de {{ stats.descontoMedio }}%.</p>

      <table>
        <thead><tr><th>Indicador</th><th>Valor</th></tr></thead>
        <tbody>
          <tr><td>Total de imóveis</td><td>{{ stats.total }}</td></tr>
          <tr><td>Preço médio</td><td>R$ {{ Math.round(stats.precoMedio / 1000) }} mil</td></tr>
          <tr><td>Desconto médio</td><td>{{ stats.descontoMedio }}%</td></tr>
          <tr><td>Financiáveis</td><td>~{{ stats.financiaveis }}</td></tr>
        </tbody>
      </table>

      <h2>Onde estão os imóveis</h2>
      <ol>
        <li v-for="c in stats.topCidades" :key="c.cidade"><strong>{{ c.cidade }}</strong> — {{ c.count }} imóveis</li>
      </ol>
    </template>

    <h2>Por que tão poucos?</h2>
    <ul>
      <li><strong>Menor inadimplência do Brasil</strong> — economia forte e diversificada</li>
      <li><strong>Mercado aquecido</strong> — retomados são vendidos rapidamente</li>
      <li><strong>Renda média alta</strong> — menos MCMV que se tornam inadimplentes</li>
    </ul>

    <h2>Oportunidades</h2>
    <ul>
      <li><strong>Qualquer imóvel que apareça é raro</strong> — monitorar semanalmente</li>
      <li><strong>Grande Florianópolis (São José, Palhoça)</strong> — acesso à ilha, demanda de aluguel alta</li>
      <li><strong>Joinville</strong> — maior cidade do estado, polo industrial</li>
      <li><strong>Blumenau</strong> — turismo + indústria têxtil</li>
    </ul>

    <h2>Pontos de atenção</h2>
    <ul>
      <li><strong>Pouquíssimos financiáveis</strong> — maioria exige pagamento à vista</li>
      <li><strong>Blumenau: risco de enchente</strong> — verificar cota de inundação</li>
      <li><strong>Florianópolis: quase não aparece</strong></li>
    </ul>

    <h2>Dicas</h2>
    <ol>
      <li>SC não é para garimpar volume — é para monitorar e agir rápido</li>
      <li>Configure alertas; boa oportunidade some em dias</li>
      <li>Grande Florianópolis: liquidez excelente para qualquer imóvel bem localizado</li>
    </ol>
  </div>
</template>

<script setup>
import { useUfStats } from '@/composables/useUfStats'
const { stats, loading } = useUfStats('SC')
</script>
