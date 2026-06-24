<template>
  <div>
    <div v-if="loading" class="text-center py-4 text-gray-400">Carregando dados...</div>
    <template v-else-if="stats">
      <h2>Panorama: Distrito Federal</h2>
      <p>O DF tem apenas <strong>{{ stats.total }} imóveis</strong> da Caixa, com o <strong>maior preço médio do país</strong>: R$ {{ Math.round(stats.precoMedio / 1000) }} mil. Oferta escassa, desconto médio de {{ stats.descontoMedio }}% e pouquíssimos financiáveis. Mercado para quem tem capital e age rápido.</p>

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

    <h2>Características do mercado</h2>
    <ul>
      <li><strong>Renda média mais alta do Brasil</strong> — sustenta preços e baixa inadimplência</li>
      <li><strong>Funcionalismo público</strong> — demanda estável de moradia e aluguel</li>
      <li><strong>Liquidez excelente</strong> — qualquer imóvel bem localizado vende ou aluga rápido</li>
    </ul>

    <h2>Oportunidades</h2>
    <ul>
      <li><strong>Financiável no Plano Piloto ou Águas Claras</strong> — raridade; analise no mesmo dia</li>
      <li><strong>Taguatinga e Samambaia</strong> — cidades-satélite consolidadas com metrô e comércio</li>
      <li><strong>Aluguel garantido</strong> — taxa de vacância baixíssima</li>
    </ul>

    <h2>Pontos de atenção</h2>
    <ul>
      <li><strong>Capital necessário alto</strong> — maioria exige à vista</li>
      <li><strong>Desconto menor que outros estados</strong> — avaliações mais realistas</li>
      <li><strong>Concorrência alta</strong> — poucos imóveis e muitos compradores com capital</li>
    </ul>

    <h2>Dicas</h2>
    <ol>
      <li>Monitore semanalmente — qualquer mudança importa com apenas dezenas de imóveis</li>
      <li>Considere o entorno (GO) para investimento — Luziânia e Valparaíso a preços 3-5× menores</li>
      <li>Se tiver capital: DF é um dos mercados mais seguros do Brasil</li>
      <li>Ceilândia e Samambaia: boa relação custo-benefício para moradia própria</li>
    </ol>
  </div>
</template>

<script setup>
import { useUfStats } from '@/composables/useUfStats'
const { stats, loading } = useUfStats('DF')
</script>
