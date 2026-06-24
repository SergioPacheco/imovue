<template>
  <div>
    <div v-if="loading" class="text-center py-4 text-gray-400">Carregando dados...</div>
    <template v-else-if="stats">
      <h2>Panorama: Rio de Janeiro</h2>
      <p>O Rio de Janeiro é disparado o estado com <strong>mais imóveis da Caixa disponíveis</strong>: são <strong>{{ stats.total.toLocaleString('pt-BR') }} imóveis</strong>, com desconto médio de <strong>{{ stats.descontoMedio }}%</strong>. Mas há razões para tantos — e nem todo desconto alto é oportunidade.</p>

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
      <p>A maioria está na Baixada Fluminense e região metropolitana, não na Zona Sul ou áreas nobres da capital.</p>
    </template>

    <h2>Por que tantos imóveis e descontos altos?</h2>
    <ul>
      <li><strong>Ciclo de supervalorização (2010-2014) seguido de queda abrupta</strong> — muitos financiamentos tornaram-se inadimplentes</li>
      <li><strong>Avaliações feitas no pico do mercado</strong> — infladas em relação ao valor atual</li>
      <li><strong>Descontos nominalmente altos mas sobre valores irreais</strong></li>
    </ul>

    <h2>Riscos específicos do RJ</h2>
    <ul>
      <li><strong>Baixada Fluminense: liquidez baixa</strong> — muitas ofertas, pouca demanda de compra</li>
      <li><strong>Imóveis ocupados em áreas complexas</strong> — desocupação pode ser lenta e custosa</li>
      <li><strong>Condomínio alto + inadimplência</strong> — prédios com muitos inadimplentes repassam custos</li>
      <li><strong>IPTU acumulado</strong> — município do Rio é agressivo na cobrança</li>
    </ul>

    <h2>Onde estão as oportunidades reais</h2>
    <ul>
      <li><strong>Capital (Zona Norte e Oeste)</strong> — Méier, Tijuca, Taquara, Jacarepaguá: liquidez razoável e demanda de aluguel</li>
      <li><strong>Niterói</strong> — menos oferta, mais demanda, preços mais sustentáveis</li>
      <li><strong>Financiáveis e desocupados</strong> — os mais disputados e com melhor perfil</li>
    </ul>

    <h2>Dicas para quem busca no RJ</h2>
    <ol>
      <li>Desconfie de descontos acima de 50% — compare sempre com o preço real de mercado</li>
      <li>Priorize capital (Zona Norte) e Niterói para melhor liquidez</li>
      <li>Evite acumular imóveis na Baixada sem ter certeza da demanda local</li>
      <li>Verifique IPTU e condomínio com atenção redobrada</li>
    </ol>
  </div>
</template>

<script setup>
import { useUfStats } from '@/composables/useUfStats'
const { stats, loading } = useUfStats('RJ')
</script>
