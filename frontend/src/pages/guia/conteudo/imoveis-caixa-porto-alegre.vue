<template>
  <div>
    <div v-if="loading" class="text-center py-4 text-gray-400">Carregando dados...</div>
    <template v-else-if="stats">
      <h2>Panorama: Rio Grande do Sul</h2>
      <p>O RS oferece <strong>{{ stats.total.toLocaleString('pt-BR') }} imóveis</strong> com desconto médio de <strong>{{ stats.descontoMedio }}%</strong>. Destaque: a <strong>melhor taxa de financiáveis do país</strong> — {{ Math.round(stats.financiaveis * 100 / stats.total) }}% aceitam financiamento.</p>

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
      <li><strong>Porto Alegre</strong> — mercado de aluguel ativo, universidades (UFRGS, PUCRS)</li>
      <li><strong>Região metropolitana</strong> — Canoas, Novo Hamburgo: polo industrial, preços menores</li>
      <li><strong>Caxias do Sul</strong> — economia forte, crescimento constante</li>
      <li><strong>Alto percentual financiável</strong> — mais opções para quem precisa de crédito</li>
    </ul>

    <h2>Pontos de atenção</h2>
    <ul>
      <li><strong>Enchentes (2024-2025)</strong> — verificar se o imóvel está em área de inundação</li>
      <li><strong>Preço médio alto</strong> — exige mais capital ou comprometimento de renda</li>
      <li><strong>Umidade e frio</strong> — exigem bom estado de telhado e impermeabilização</li>
    </ul>

    <h2>Dicas</h2>
    <ol>
      <li>Aproveite a taxa de financiáveis — real possibilidade de comprar com entrada + FGTS</li>
      <li>Porto Alegre: verifique cota de inundação (consulte DMAE)</li>
      <li>Serra Gaúcha (Caxias): boa aposta de longo prazo</li>
    </ol>
  </div>
</template>

<script setup>
import { useUfStats } from '@/composables/useUfStats'
const { stats, loading } = useUfStats('RS')
</script>
