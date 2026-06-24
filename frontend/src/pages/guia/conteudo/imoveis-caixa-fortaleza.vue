<template>
  <div>
    <div v-if="loading" class="text-center py-4 text-gray-400">Carregando dados...</div>
    <template v-else-if="stats">
      <h2>Panorama: Ceará</h2>
      <p>O Ceará tem <strong>{{ stats.total.toLocaleString('pt-BR') }} imóveis</strong> com desconto médio de <strong>{{ stats.descontoMedio }}%</strong> — um dos mais altos do país. A presença de {{ stats.financiaveis }} imóveis financiáveis ({{ Math.round(stats.financiaveis * 100 / stats.total) }}%) o torna atrativo para quem busca entrada baixa.</p>

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
      <li><strong>Fortaleza capital</strong> — boa liquidez, mercado de aluguel forte (turismo + universidades)</li>
      <li><strong>Melhor taxa de financiáveis do Nordeste</strong></li>
      <li><strong>Maracanaú e Caucaia</strong> — polo industrial, demanda por moradia</li>
    </ul>

    <h2>Pontos de atenção</h2>
    <ul>
      <li><strong>Horizonte: volume excessivo</strong> — indica excesso de oferta e liquidez frágil</li>
      <li><strong>Conjuntos MCMV com problemas estruturais</strong> — verifique laudos</li>
      <li><strong>Interior: mercado limitado</strong></li>
    </ul>

    <h2>Dicas</h2>
    <ol>
      <li>Fortaleza capital é a aposta segura — turismo e universidades sustentam demanda</li>
      <li>Horizonte: só para aluguel de longo prazo a preço muito baixo</li>
      <li>Filtre por financiamento + desocupado para menor risco</li>
    </ol>
  </div>
</template>

<script setup>
import { useUfStats } from '@/composables/useUfStats'
const { stats, loading } = useUfStats('CE')
</script>
