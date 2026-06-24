<template>
  <div>
    <div v-if="loading" class="text-center py-4 text-gray-400">Carregando dados...</div>
    <template v-else-if="stats">
      <h2>Panorama: Pernambuco</h2>
      <p>Pernambuco oferece <strong>{{ stats.total.toLocaleString('pt-BR') }} imóveis</strong> com desconto médio de <strong>{{ stats.descontoMedio }}%</strong>. A oferta está concentrada na Região Metropolitana do Recife.</p>

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
      <li><strong>Jaboatão (Piedade, Candeias)</strong> — bairros litorâneos com demanda de aluguel</li>
      <li><strong>Paulista</strong> — região em crescimento, próxima a praias</li>
      <li><strong>Recife capital</strong> — pouca oferta, mas alta liquidez quando aparece</li>
    </ul>

    <h2>Pontos de atenção</h2>
    <ul>
      <li><strong>Interior</strong> — liquidez baixa, mercado pequeno</li>
      <li><strong>Morros e áreas de risco</strong> — verificar topografia (histórico de deslizamentos)</li>
      <li><strong>Salinidade</strong> — imóveis litorâneos sofrem com corrosão</li>
    </ul>

    <h2>Dicas</h2>
    <ol>
      <li>Priorize RMR (Jaboatão, Paulista, Olinda) — liquidez superior ao interior</li>
      <li>Para aluguel: apartamentos 2 quartos próximos ao litoral e universidades</li>
      <li>Verifique topografia — evite imóveis em encostas sem contenção</li>
    </ol>
  </div>
</template>

<script setup>
import { useUfStats } from '@/composables/useUfStats'
const { stats, loading } = useUfStats('PE')
</script>
