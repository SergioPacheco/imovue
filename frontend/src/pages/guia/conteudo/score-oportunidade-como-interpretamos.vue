<template>
  <div>
    <h2>O que é o Score de Oportunidade</h2>
    <p>O Score Imovue é uma nota de 0 a 100 que atribuímos a cada imóvel para ajudar na priorização. Ele <strong>não é uma recomendação de compra</strong> — é uma ferramenta para filtrar rapidamente milhares de imóveis e focar nos que merecem análise mais profunda.</p>

    <h2>Como calculamos</h2>
    <p>O score combina 5 fatores objetivos, cada um com peso proporcional à sua relevância para a maioria dos compradores:</p>

    <table>
      <thead><tr><th>Fator</th><th>Peso</th><th>O que mede</th></tr></thead>
      <tbody>
        <tr><td><strong>Desconto real</strong></td><td>30%</td><td>Percentual de desconto sobre avaliação — quanto maior, melhor o ponto de partida</td></tr>
        <tr><td><strong>Financiabilidade</strong></td><td>25%</td><td>Se aceita financiamento e FGTS — amplia acessibilidade e liquidez futura</td></tr>
        <tr><td><strong>Situação do imóvel</strong></td><td>20%</td><td>Desocupado pontua mais (menor risco), ocupado pontua menos</td></tr>
        <tr><td><strong>Localização</strong></td><td>15%</td><td>Capital ou cidade com mais de 100 mil habitantes — indica demanda e liquidez</td></tr>
        <tr><td><strong>Preço acessível</strong></td><td>10%</td><td>Imóveis dentro da faixa de maior demanda (até R$ 300 mil) têm mais compradores</td></tr>
      </tbody>
    </table>

    <h2>O que cada faixa significa</h2>
    <table>
      <thead><tr><th>Score</th><th>Interpretação</th></tr></thead>
      <tbody>
        <tr><td><strong>80–100</strong></td><td>Oportunidade forte — desconto relevante, baixo risco, alta liquidez potencial. Analise com prioridade.</td></tr>
        <tr><td><strong>60–79</strong></td><td>Boa oportunidade — tem pontos positivos mas algum fator de atenção (ocupado, sem financiamento ou cidade menor)</td></tr>
        <tr><td><strong>40–59</strong></td><td>Oportunidade moderada — pode valer para perfis específicos (investidor experiente, conhece a região)</td></tr>
        <tr><td><strong>0–39</strong></td><td>Baixa prioridade — desconto insuficiente ou muitos fatores de risco combinados</td></tr>
      </tbody>
    </table>

    <h2>Limitações do Score</h2>
    <p>O score <strong>não considera</strong>:</p>
    <ul>
      <li><strong>Estado de conservação</strong> — não temos fotos nem laudos do interior dos imóveis</li>
      <li><strong>Débitos reais</strong> — condomínio e IPTU atrasados não constam nas listas públicas da Caixa</li>
      <li><strong>Preço de mercado real</strong> — usamos a avaliação da Caixa como referência, que pode estar desatualizada</li>
      <li><strong>Situação jurídica</strong> — ações judiciais, penhoras ou problemas na matrícula</li>
      <li><strong>Potencial de valorização</strong> — obras públicas, novos empreendimentos na região</li>
    </ul>

    <h2>Como usar o Score corretamente</h2>
    <ol>
      <li><strong>Filtrar</strong> — use score ≥ 60 para reduzir a lista de milhares para dezenas de imóveis</li>
      <li><strong>Não comprar pelo score</strong> — depois de filtrar, analise cada imóvel individualmente (edital, matrícula, visita)</li>
      <li><strong>Comparar dentro da mesma cidade</strong> — score 70 em SP e score 70 em cidade pequena são oportunidades diferentes</li>
      <li><strong>Cruzar com sua realidade</strong> — se você precisa de financiamento, um imóvel score 90 que só aceita à vista não serve</li>
    </ol>

    <h2>Transparência</h2>
    <p>O cálculo do score é determinístico e aplicado igualmente a todos os imóveis. Não existe priorização paga, destaque patrocinado ou manipulação de ranking. Se os dados de entrada (preço, desconto, modalidade) mudam na lista da Caixa, o score atualiza automaticamente na próxima coleta semanal.</p>
  </div>
</template>
