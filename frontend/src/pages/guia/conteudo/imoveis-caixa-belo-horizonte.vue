<template>
  <div>
    <div v-if="loading" class="text-center py-4 text-gray-400">Carregando dados...</div>
    <template v-else-if="stats">
      <h2>Panorama: Minas Gerais</h2>
      <p>Minas Gerais tem <strong>{{ stats.total.toLocaleString('pt-BR') }} imóveis</strong> da Caixa, com desconto médio de <strong>{{ stats.descontoMedio }}%</strong>. A oferta é bem distribuída entre cidades de médio porte — BH capital tem relativamente poucos imóveis.</p>

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
      <p>O Triângulo Mineiro (Uberlândia e Uberaba) concentra a maior parte da oferta, seguido da Zona da Mata (Juiz de Fora).</p>
    </template>

    <h2>Oportunidades em MG</h2>
    <ul>
      <li><strong>Uberlândia</strong> — economia forte (agronegócio + logística), crescimento populacional constante</li>
      <li><strong>BH e Contagem</strong> — menos oferta = menos concorrência; oportunidades somem rápido</li>
      <li><strong>Juiz de Fora</strong> — cidade universitária, demanda de aluguel para estudantes</li>
    </ul>

    <h2>Pontos de atenção</h2>
    <ul>
      <li><strong>Pouquíssimos financiáveis</strong> — maioria exige pagamento à vista</li>
      <li><strong>Cidades menores têm liquidez limitada</strong> — verifique demanda real</li>
      <li><strong>ITBI em BH</strong> — alíquota de 3%</li>
    </ul>

    <h2>Dicas</h2>
    <ol>
      <li>Triângulo Mineiro é o filão: economia forte, preços acessíveis, demanda de aluguel</li>
      <li>Para moradia em BH: monitore semanalmente — oportunidades aparecem e somem rápido</li>
      <li>Para investimento: foque em 2 quartos em cidades universitárias</li>
      <li>Verifique débitos de IPTU — prefeituras mineiras inscrevem em dívida ativa rapidamente</li>
    </ol>
  </div>
</template>

<script setup>
import { useUfStats } from '@/composables/useUfStats'
const { stats, loading } = useUfStats('MG')
</script>
