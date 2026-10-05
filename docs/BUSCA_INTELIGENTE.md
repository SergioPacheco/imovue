# Busca inteligente: parser determinístico

Esta etapa corrige e integra o parser existente, mantendo o catálogo estático. Não adiciona Laya, LLM, API de interpretação, banco de dados ou dependências de produção.

## Dados e arquitetura

Os arquivos `frontend/public/data/{UF}.json` continuam sendo a fonte oficial. Cada arquivo contém uma lista de imóveis com `numeroImovel`, `uf`, `cidade`, `bairro`, `endereco`, `tipoImovel`, `precoVenda`, `valorAvaliacao`, `percentualDesconto`, `quartos`, `vagas`, `financiamento`, `modalidadeVenda`, `descricao`, áreas, coordenadas e URL oficial. Campos desconhecidos podem ser `null`. O parser não escreve nos JSONs.

O `dataService` carrega o arquivo da UF e conserva a lista em memória. Requisições concorrentes compartilham a mesma promessa, incluindo o manifest e as estatísticas de bairro. Falhas não ficam no cache e podem ser repetidas. Busca e chat usam `listar(..., { strict: true })` para diferenciar erro de carregamento de ausência de resultados; consumidores antigos conservam seu tratamento anterior.

```text
Texto → parseSmartSearch → FiltrosImovel → propertySearch → JSON da UF → resultados reais
```

`propertySearch.ts` centraliza filtragem e ordenação, utilizadas por `dataService` e chatbot. Preços e descontos não informados ficam depois dos valores válidos na ordenação; empates usam o número do imóvel. A busca não usa geração de imóveis nem pontuação subjetiva. O score de oportunidades já existente no projeto permanece separado.

## Contrato do parser

`parseSmartSearch(text, cidadesDisponiveis?, { ufAtual? })` é uma função independente da interface. Retorna:

```ts
{
  uf: string | null,
  filtros: FiltrosImovel,
  intent: 'SEARCH_PROPERTY' | 'REFINE_SEARCH' | 'RESET_SEARCH' | 'UNKNOWN',
  removerFiltros: (keyof FiltrosImovel)[],
  descricao: string,
  perguntas: string[],
  avisos: string[]
}
```

Os filtros seguem o contrato existente: `cidade`, `bairro`, `tipoImovel`, `precoMin`, `precoMax`, `descontoMin`, `quartosMin`, `quartosMax`, `vagasMin`, `modalidade`, `financiamento`, `ocupado` e `sort`. Paginação pertence ao motor, sem ser interpretada do texto. Campos ausentes preservam critérios anteriores; `removerFiltros` sinaliza remoção explícita.

O parser reconhece siglas e nomes de estados, tipos, modalidades, valores monetários, números de quartos/vagas, descontos e ordenação. Usa limites de palavras, normalização de acentos, prioridade para nomes mais longos e regras para distinguir valores de preços de percentuais e quantidades. Exemplos:

| Texto | Critérios |
| --- | --- |
| apartamento em SP até 300 mil | SP, Apartamento, preço máximo 300000 |
| casa em Recife | PE, Recife, Casa |
| entre 200 e 300 mil | preço mínimo 200000, máximo 300000 |
| até dois quartos, até 300 mil | máximo 2 quartos, preço máximo 300000 |
| não quero imóvel ocupado | somente desocupados confirmados |
| pode estar ocupado | remove restrição de ocupação |
| não me importo se estiver ocupado | remove restrição de ocupação |
| maior desconto primeiro | `percentualDesconto,desc` |
| remova o limite de preço | remove mínimo e máximo |

O dicionário inicial reconhece cidades principais. Ao executar uma busca com UF definida, a barra e o chat consultam também as cidades do JSON daquela UF e repetem a interpretação, reaproveitando o cache. Assim, uma cidade como São José/SC não é descartada por estar fora do dicionário inicial. Para cidades fora do dicionário sem UF informada, informe o estado ou selecione-o pelos filtros tradicionais. Não foi criado um índice nacional adicional.

“São Paulo” e “Rio de Janeiro” exigem esclarecer estado ou cidade quando o contexto não resolve. Cidades homônimas são conferidas no catálogo da UF explícita ou já carregada, antes de considerar o dicionário; inconsistências confirmadas pedem esclarecimento. “Barato” pede orçamento; “perto da praia” pede cidade e informa a falta de dados para confirmar distância. Não há estimativa arbitrária de preço, proximidade ou rentabilidade.

## Integração

A página inicial, a listagem e o chat compartilham o parser. A listagem combina linguagem natural com filtros tradicionais, mostra chips removíveis e preserva critérios em links usando `searchToQuery`/`searchFromQuery`. Limpar o chip de ordenação seleciona a ordem do catálogo, inclusive após recarregar a página. Trocar UF elimina cidade e bairro anteriores, preservando outros critérios. Durante a inicialização, os controles aguardam a aplicação dos filtros da URL.

O chatbot conserva `{ uf, filters, lastResults }` durante a sessão do componente. Mensagens sucessivas complementam a busca; perguntas conservam critérios já reconhecidos. Saudações e pedidos de ajuda não exigem baixar um catálogo. A primeira busca carrega somente a UF necessária. Links de resultados levam à listagem com os critérios acumulados e aos detalhes com `/imovel/{numeroImovel}?uf={UF}`. A UF no link evita procurar o detalhe em todos os estados.

Mensagens são renderizadas como texto pelo Vue, sem `v-html`, `eval` ou interpretação de código. O tamanho de entrada é limitado a 1000 caracteres. A listagem usa debounce e versões de requisição para impedir respostas antigas de substituírem uma busca nova.

Quando não há resultados, as alternativas de remover preço ou desconto são contadas no próprio catálogo; a alteração depende de ação explícita do usuário.

## Limitações dos dados e desta etapa

O catálogo analisado não informa ocupação de forma confirmada nem coordenadas utilizáveis. Ausência de ocupação não significa desocupado. O filtro de ocupação considera somente menções explícitas a ocupado/desocupado na descrição, e a interface alerta sobre dados ausentes; isso não substitui a verificação do edital. Não há cálculo de distância até praia ou cidades próximas.

Comparação conversacional, explicações de modalidade, inferência subjetiva de investimento, ranking com preferências e classificador externo ficam para etapas posteriores. As modalidades atuais seguem os nomes e regras existentes do catálogo. Esta mudança não instala Laya nem exige modelo no navegador ou memória de inferência em Cloudflare Workers; Cloudflare Pages continua servindo os arquivos estáticos.

## Verificação

Dentro de `frontend`:

```sh
npm test
npx vue-tsc --noEmit
npm run build
npm run seo:check
```

Os testes Node exercitam o parser, filtros e resultados, estado do chat, contrato de URL, concorrência e recuperação de erros. O carregador TypeScript dos testes usa a dependência já existente, sem alterar o bundle de produção.

Há também uma regressão de navegador em `frontend/tests/browser-search.py`, com Playwright para Python e Chrome disponíveis no ambiente de desenvolvimento. Não são dependências exigidas do visitante ou adicionadas ao site. Execute um servidor local e, em outro terminal:

```sh
# Terminal 1, dentro de frontend
npm run dev -- --host 127.0.0.1 --port 4323
# Terminal 2, na raiz do projeto
python3 frontend/tests/browser-search.py
```

O teste usa os JSONs locais reais, exige uma casa em Recife para o cenário conversacional e calcula seu orçamento e a contagem de SP a partir desses dados. Verifica a tela de 390 × 844, cidades fora do dicionário e homônimas, refinamentos, chips, recarga de URL, mudança de UF, texto seguro e repetição após erro de carregamento. Recursos externos são bloqueados durante o teste. `IMOVUE_TEST_URL`, `IMOVUE_TEST_CHROME` e `IMOVUE_TEST_SCREENSHOT` permitem configurar servidor, executável e captura.
