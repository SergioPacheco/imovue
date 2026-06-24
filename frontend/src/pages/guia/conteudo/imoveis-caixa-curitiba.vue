<template>
  <div>
    <div v-if="loading" class="text-center py-4 text-gray-400">Carregando dados...</div>
    <template v-else-if="stats">
      <h2>Panorama: Paraná</h2>
      <p>O Paraná oferece <strong>{{ stats.total.toLocaleString('pt-BR') }} imóveis</strong> com desconto médio de <strong>{{ stats.descontoMedio }}%</strong>. Curitiba capital tem relativamente poucos imóveis, o que torna a competição maior quando aparecem boas oportunidades.</p>

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
      <li><strong>Campo Largo e região metropolitana</strong> — preços acessíveis com acesso a Curitiba</li>
      <li><strong>Londrina</strong> — segunda maior cidade do estado, boa liquidez, mercado de aluguel ativo</li>
      <li><strong>Maringá</strong> — crescimento constante, alto IDH, demanda por 2-3 quartos</li>
    </ul>

    <h2>Pontos de atenção</h2>
    <ul>
      <li><strong>Curitiba capital: oferta escassa</strong> — monitore diariamente</li>
      <li><strong>Clima e manutenção</strong> — invernos rigorosos exigem bom estado de conservação</li>
      <li><strong>Condomínios em Curitiba</strong> — valores altos em prédios mais antigos</li>
    </ul>

    <h2>Dicas</h2>
    <ol>
      <li>Se quer morar em Curitiba: considere Campo Largo e região metropolitana</li>
      <li>Para investimento: Londrina e Maringá são apostas sólidas</li>
      <li>No interior: imóveis em cidades abaixo de 30 mil habitantes têm liquidez muito baixa</li>
    </ol>
  </div>
</template>

<script setup>
import { useUfStats } from '@/composables/useUfStats'
const { stats, loading } = useUfStats('PR')
</script>
