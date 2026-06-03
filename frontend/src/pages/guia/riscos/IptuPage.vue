<template>
  <article>
    <div class="bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <router-link to="/aprenda-leilao-imoveis" class="text-xs text-brand-500 hover:text-brand-600">← Guia de riscos</router-link>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">Débitos de IPTU</h1>
        <p class="text-gray-500 mt-2">Imposto atrasado que a Prefeitura pode cobrar do novo dono</p>
      </div>
    </div>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 prose prose-gray">
      <h2>O que significa?</h2>
      <p>Assim como o condomínio, o IPTU é uma obrigação que acompanha o imóvel. Débitos não pagos pelo proprietário anterior são transferidos ao novo comprador.</p>

      <h2>Por que é um risco?</h2>
      <ul>
        <li>A Prefeitura pode <strong>inscrever o débito em dívida ativa</strong> e executar o novo proprietário</li>
        <li>Juros e multa municipal podem dobrar o valor original em poucos anos</li>
        <li>Imóvel com IPTU em atraso pode ter <strong>restrição para registro</strong> no cartório</li>
        <li>Em casos extremos, a Prefeitura pode leiloar o imóvel por dívida de IPTU</li>
      </ul>

      <h2>Base legal</h2>
      <p><strong>CTN (Código Tributário Nacional), art. 130:</strong> "Os créditos tributários relativos a impostos cujo fato gerador seja a propriedade sub-rogam-se na pessoa dos respectivos adquirentes."</p>
      <p>Exceção: em arrematação judicial, o art. 130, parágrafo único, prevê que o imóvel é adquirido livre de ônus. Mas isso <strong>não se aplica</strong> a leilões extrajudiciais (Caixa).</p>

      <h2>Como se proteger</h2>
      <ul>
        <li>Consulte o site da Prefeitura (com inscrição imobiliária) para verificar débitos</li>
        <li>Alguns editais da Caixa informam que <strong>IPTU será quitado até a data da venda</strong> — leia atentamente</li>
        <li>Some eventuais débitos de IPTU ao custo total de aquisição</li>
        <li>Após a compra, negocie parcelamento com a Prefeitura (muitas oferecem REFIS com desconto em juros)</li>
      </ul>

      <div class="bg-blue-50 border border-blue-100 rounded-xl p-5 not-prose mt-8">
        <p class="text-sm text-blue-800"><strong>Resumo:</strong> Verifique IPTU no site da Prefeitura antes do lance. Em leilão extrajudicial, você herda a dívida. Some ao custo real.</p>
      </div>
    </div>
      <div class="max-w-3xl mx-auto px-4 sm:px-6 pb-10"><router-link to="/aprenda/prazo-pagamento" class="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600">Próximo: Prazo de Pagamento →</router-link></div>
  </article>
</template>
