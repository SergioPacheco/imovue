<template>
  <div>
    <div v-if="loading" class="text-center py-4 text-gray-400">Carregando dados...</div>
    <template v-else-if="stats">
      <h2>Panorama: Goiás</h2>
      <p>Goiás surpreende como um dos estados com <strong>mais imóveis da Caixa</strong>: são <strong>{{ stats.total.toLocaleString('pt-BR') }} imóveis</strong> com desconto médio de {{ stats.descontoMedio }}%. Detalhe crucial: a maioria está no <strong>entorno de Brasília</strong>, não em Goiânia.</p>

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
      <p>As cidades do topo são <strong>cidades-dormitório de Brasília</strong>. A população mora ali e trabalha no DF.</p>
    </template>

    <h2>Por que tantos imóveis?</h2>
    <ul>
      <li><strong>Boom do Minha Casa Minha Vida</strong> — milhares de unidades entregues em 2012-2016 no entorno de Brasília</li>
      <li><strong>Alta inadimplência</strong> — renda instável e distância dos postos de trabalho</li>
    </ul>

    <h2>Riscos específicos</h2>
    <ul>
      <li><strong>Liquidez de revenda muito baixa no entorno</strong> — mais oferta que demanda</li>
      <li><strong>Condomínios com inadimplência alta</strong> — rateios crescentes</li>
      <li><strong>Infraestrutura precária em alguns conjuntos</strong></li>
    </ul>

    <h2>Dicas</h2>
    <ol>
      <li>Se busca investimento para aluguel: foque em imóveis próximos a linhas de ônibus para o DF</li>
      <li>Verifique o valor real de aluguel na região antes de comprar</li>
      <li>Para moradia própria: Goiânia tem menos oferta mas muito mais qualidade de vida</li>
    </ol>
  </div>
</template>

<script setup>
import { useUfStats } from '@/composables/useUfStats'
const { stats, loading } = useUfStats('GO')
</script>
