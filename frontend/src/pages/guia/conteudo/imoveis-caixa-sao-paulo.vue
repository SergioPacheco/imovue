<template>
  <div>
    <div v-if="loading" class="text-center py-4 text-gray-400">Carregando dados...</div>
    <template v-else-if="stats">
      <h2>Panorama: São Paulo</h2>
      <p>São Paulo concentra <strong>{{ stats.total.toLocaleString('pt-BR') }} imóveis</strong> da Caixa disponíveis para compra, com desconto médio de <strong>{{ stats.descontoMedio }}%</strong> e preços a partir dos mais acessíveis do estado. É um dos líderes em volume e oferece boa diversidade: desde kitnets na capital até casas no interior.</p>

      <table>
        <thead><tr><th>Indicador</th><th>Valor</th></tr></thead>
        <tbody>
          <tr><td>Total de imóveis</td><td>{{ stats.total.toLocaleString('pt-BR') }}</td></tr>
          <tr><td>Preço médio</td><td>R$ {{ Math.round(stats.precoMedio / 1000) }} mil</td></tr>
          <tr><td>Desconto médio</td><td>{{ stats.descontoMedio }}%</td></tr>
          <tr><td>Maior desconto</td><td>{{ stats.maiorDesconto }}%</td></tr>
          <tr><td>Financiáveis</td><td>~{{ stats.financiaveis }} ({{ Math.round(stats.financiaveis * 100 / stats.total) }}%)</td></tr>
        </tbody>
      </table>

      <h2>Onde estão os imóveis</h2>
      <p>A oferta não se concentra na capital. As cidades com mais imóveis são:</p>
      <ol>
        <li v-for="c in stats.topCidades" :key="c.cidade"><strong>{{ c.cidade }}</strong> — {{ c.count }} imóveis</li>
      </ol>
    </template>

    <h2>Oportunidades e riscos em SP</h2>
    <h3>Vantagens</h3>
    <ul>
      <li><strong>Alta liquidez na capital e interior forte</strong> — Ribeirão, Campinas, Sorocaba têm mercado ativo</li>
      <li><strong>Demanda de aluguel consistente</strong> — cidades universitárias e polos industriais</li>
      <li><strong>Boa infraestrutura de cartórios e documentação</strong> — processos mais ágeis</li>
    </ul>

    <h3>Pontos de atenção</h3>
    <ul>
      <li><strong>ITBI alto na capital</strong> — alíquota de 3% em São Paulo (vs 2% em muitas cidades)</li>
      <li><strong>Condomínios caros em prédios antigos</strong> — verifique o valor mensal antes de comprar</li>
      <li><strong>Poucos financiáveis</strong> — a maioria exige pagamento à vista ou parcelamento direto</li>
    </ul>

    <h2>Dicas para quem busca em SP</h2>
    <ol>
      <li>Se busca moradia: foque em <strong>imóveis financiáveis e desocupados</strong> nas cidades do interior forte (Ribeirão, São José, Bauru)</li>
      <li>Se busca investimento: procure apartamentos 2 quartos na capital com desconto real acima de 25% e condomínio controlado</li>
      <li>Evite imóveis na capital sem vaga de garagem — dificulta muito a revenda</li>
      <li>No litoral (Praia Grande, Santos): verifique sazonalidade — aluguel por temporada pode ser interessante</li>
    </ol>
  </div>
</template>

<script setup>
import { useUfStats } from '@/composables/useUfStats'
const { stats, loading } = useUfStats('SP')
</script>
