<template>
  <article>
    <div class="bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <router-link to="/aprenda-leilao-imoveis" class="text-xs text-brand-500 hover:text-brand-600">← Guia de riscos</router-link>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">Financiamento Não Disponível</h1>
        <p class="text-gray-500 mt-2">Nem todo imóvel da Caixa aceita financiamento — saiba quais aceitam</p>
      </div>
    </div>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 prose prose-gray">
      <h2>O que significa?</h2>
      <p>Nem todos os imóveis da Caixa aceitam financiamento habitacional. A modalidade de venda e as condições do edital determinam se é possível ou não financiar.</p>

      <h2>Modalidades e financiamento</h2>
      <table>
        <thead><tr><th>Modalidade</th><th>Financiamento</th></tr></thead>
        <tbody>
          <tr><td>Venda Direta Online</td><td>✅ Geralmente aceita (até 95%)</td></tr>
          <tr><td>Leilão SFI (Edital Único)</td><td>❌ Geralmente não aceita</td></tr>
          <tr><td>Licitação Aberta</td><td>⚠️ Depende do edital</td></tr>
          <tr><td>Venda Online</td><td>⚠️ Varia por edital</td></tr>
        </tbody>
      </table>

      <h2>Por que é um risco?</h2>
      <ul>
        <li>Comprador dá lance achando que vai financiar, mas o edital não permite</li>
        <li>Não ter o valor à vista no prazo = perda do lance + penalidade</li>
        <li>Mesmo quando aceita, o banco pode <strong>negar o crédito</strong> após a arrematação</li>
      </ul>

      <h2>FGTS — quando pode usar</h2>
      <ul>
        <li>Imóvel deve ser residencial e urbano</li>
        <li>Comprador não pode ter outro imóvel na mesma cidade</li>
        <li>Imóvel deve estar dentro do limite de valor do SFH</li>
        <li>O edital deve autorizar expressamente</li>
      </ul>

      <h2>Como se proteger</h2>
      <ul>
        <li><strong>Verifique no edital</strong> se aceita financiamento antes de dar lance</li>
        <li>No Imovue, use o filtro <strong>"Financiamento: Sim"</strong></li>
        <li>Obtenha a carta de crédito <strong>pré-aprovada</strong> antes de participar</li>
        <li>Para leilões à vista: tenha o valor disponível em conta</li>
      </ul>

      <div class="bg-blue-50 border border-blue-100 rounded-xl p-5 not-prose mt-8">
        <p class="text-sm text-blue-800"><strong>Resumo:</strong> Venda Direta = aceita financiamento. Leilão SFI = geralmente à vista. Sempre verifique no edital e tenha crédito pré-aprovado.</p>
      </div>
    </div>
  </article>
</template>
