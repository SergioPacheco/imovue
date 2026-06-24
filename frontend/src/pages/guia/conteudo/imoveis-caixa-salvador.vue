<template>
  <div>
    <div v-if="loading" class="text-center py-4 text-gray-400">Carregando dados...</div>
    <template v-else-if="stats">
      <h2>Panorama: Bahia</h2>
      <p>A Bahia tem <strong>{{ stats.total.toLocaleString('pt-BR') }} imóveis</strong> com desconto médio de <strong>{{ stats.descontoMedio }}%</strong> e preço médio de R$ {{ Math.round(stats.precoMedio / 1000) }} mil — um dos mais acessíveis entre os grandes estados.</p>

      <table>
        <thead><tr><th>Indicador</th><th>Valor</th></tr></thead>
        <tbody>
          <tr><td>Total de imóveis</td><td>{{ stats.total.toLocaleString('pt-BR') }}</td></tr>
          <tr><td>Preço médio</td><td>R$ {{ Math.round(stats.precoMedio / 1000) }} mil</td></tr>
          <tr><td>Desconto médio</td><td>{{ stats.descontoMedio }}%</td></tr>
          <tr><td>Financiáveis</td><td>~{{ stats.financiaveis }} ({{ Math.round(stats.financiaveis * 100 / stats.total) }}%)</td></tr>
        </tbody>
      </table>

      <h2>Onde estão os imóveis</h2>
      <ol>
        <li v-for="c in stats.topCidades" :key="c.cidade"><strong>{{ c.cidade }}</strong> — {{ c.count }} imóveis</li>
      </ol>
    </template>

    <h2>Oportunidades</h2>
    <ul>
      <li><strong>Salvador (bairros populares)</strong> — Cajazeiras, Pau da Lima: alta demanda de aluguel, preços baixos</li>
      <li><strong>Lauro de Freitas</strong> — classe média em expansão, condomínios horizontais</li>
      <li><strong>Camaçari</strong> — polo industrial gera demanda por moradia</li>
      <li><strong>Feira de Santana</strong> — segunda cidade do estado, polo comercial</li>
    </ul>

    <h2>Pontos de atenção</h2>
    <ul>
      <li><strong>Muitos imóveis ocupados</strong> — desocupação pode ser lenta</li>
      <li><strong>Interior profundo tem liquidez quase zero</strong></li>
      <li><strong>Salinidade e maresia</strong> — imóveis litorâneos exigem manutenção constante</li>
    </ul>

    <h2>Dicas</h2>
    <ol>
      <li>Salvador é o foco: volume bom, demanda de aluguel, liquidez razoável</li>
      <li>Para moradia: priorize financiáveis em Lauro de Freitas ou bairros com acesso a metrô/BRT</li>
      <li>Para investimento: apartamentos 2 quartos em bairros populares de Salvador</li>
      <li>Evite imóveis no interior profundo a menos que conheça muito bem a região</li>
    </ol>
  </div>
</template>

<script setup>
import { useUfStats } from '@/composables/useUfStats'
const { stats, loading } = useUfStats('BA')
</script>
