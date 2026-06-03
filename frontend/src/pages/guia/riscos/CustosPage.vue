<template>
  <article>
    <div class="bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <router-link to="/aprenda-leilao-imoveis" class="text-xs text-brand-500 hover:text-brand-600">← Guia de riscos</router-link>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">Custos de Cartório, ITBI e Registro</h1>
        <p class="text-gray-500 mt-2">Os 10-15% extras que ninguém te conta no anúncio</p>
      </div>
    </div>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 prose prose-gray">
      <h2>O que são?</h2>
      <p>Além do valor de compra do imóvel, existem custos obrigatórios para oficializar a transferência. Muitos compradores se surpreendem ao descobrir que esses custos somam <strong>10-15% do valor do imóvel</strong>.</p>

      <h2>ITBI — Imposto de Transmissão</h2>
      <ul>
        <li>Imposto <strong>municipal</strong>, obrigatório em toda compra de imóvel</li>
        <li>Alíquota varia por cidade: São Paulo 3%, Curitiba 2,4%, Fortaleza 2,5%, Brasília 3%</li>
        <li>Base de cálculo: valor de transação ou valor venal (o maior)</li>
        <li>Sem pagamento do ITBI, o cartório <strong>não registra</strong> a transferência</li>
      </ul>

      <h2>Custas de cartório</h2>
      <ul>
        <li>Escritura pública: obrigatória para imóveis acima de 30 salários mínimos</li>
        <li>Registro no CRI: oficializa a transferência de propriedade</li>
        <li>Valores tabelados por estado — variam de R$ 1.000 a R$ 5.000+</li>
      </ul>

      <h2>Comissão do leiloeiro</h2>
      <ul>
        <li>Geralmente <strong>5% sobre o valor de arrematação</strong></li>
        <li>Paga pelo comprador, separadamente</li>
        <li>Não se aplica em "Venda Direta" — apenas em leilões</li>
      </ul>

      <h2>Exemplo prático</h2>
      <p>Imóvel arrematado por <strong>R$ 200.000</strong>:</p>
      <table>
        <thead><tr><th>Item</th><th>Valor</th></tr></thead>
        <tbody>
          <tr><td>ITBI (3%)</td><td>R$ 6.000</td></tr>
          <tr><td>Cartório (escritura + registro)</td><td>R$ 3.000</td></tr>
          <tr><td>Comissão leiloeiro (5%)</td><td>R$ 10.000</td></tr>
          <tr><td><strong>Custo real total</strong></td><td><strong>R$ 219.000</strong></td></tr>
        </tbody>
      </table>

      <h2>Como se proteger</h2>
      <ul>
        <li>Some <strong>sempre</strong> 10-15% ao valor do lance para ter o custo real</li>
        <li>Verifique a alíquota de ITBI no site da Prefeitura</li>
        <li>Em "Venda Direta", não há comissão de leiloeiro — economia de 5%</li>
      </ul>

      <div class="bg-blue-50 border border-blue-100 rounded-xl p-5 not-prose mt-8">
        <p class="text-sm text-blue-800"><strong>Resumo:</strong> O preço do imóvel não é o custo final. Some ITBI + cartório + comissão + débitos = custo real. Se o desconto não cobrir esses extras, repense.</p>
      </div>
    </div>
      <div class="max-w-3xl mx-auto px-4 sm:px-6 pb-10"><router-link to="/aprenda/financiamento" class="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600">Próximo: Financiamento →</router-link></div>
  </article>
</template>
