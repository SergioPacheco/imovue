# PRD — Imovue

## 1. Visão geral

### Nome do produto
**Imovue**

### Objetivo
Construir uma aplicação web para **coletar, normalizar, armazenar e listar imóveis à venda da CAIXA**, com foco inicial em uma experiência de consulta rápida por **estado, cidade, faixa de valor, tipo do imóvel e desconto**.

O sistema deve consumir periodicamente as listas públicas por estado, carregar os dados em memória e expor uma API para consulta eficiente, sem depender de scraping em tempo real para cada requisição do usuário.

### Stack obrigatória
#### Backend
- **Java 17**
- **Spring Boot**
- **Armazenamento in-memory** (dados carregados de CSVs, sem banco de dados)

#### Frontend
- **Vue 3**
- **TypeScript**
- **Vite**
- **Vue Router**
- **Pinia**
- **Axios**

### Princípio do produto
O Imovue será um **catálogo e buscador**. Ele **não** deve automatizar ações transacionais no portal oficial da CAIXA, como envio de proposta, preenchimento de dados pessoais ou qualquer fluxo que exija consentimento do usuário no site oficial.

---

## 2. Problema

O portal oficial possui grande volume de imóveis, mas a experiência de descoberta pode ser trabalhosa para usuários que desejam:
- comparar imóveis entre estados e cidades;
- localizar oportunidades com maior desconto;
- filtrar rapidamente por características relevantes;
- acompanhar novos imóveis ou alterações de preço;
- consultar dados de forma mais rápida do que no fluxo oficial.

Além disso, consultar o portal diretamente a cada busca do usuário gera risco de lentidão, fragilidade e dependência de mudanças de layout.

---

## 3. Objetivos do produto

### Objetivos do MVP
1. Importar a lista pública de imóveis por estado.
2. Carregar os dados em memória a partir dos CSVs.
3. Expor uma API REST para consulta paginada.
4. Disponibilizar uma interface web em Vue para busca e navegação.
5. Permitir filtros por critérios principais.
6. Exibir detalhes básicos de cada imóvel.
7. Registrar log de importações para auditoria.

### Objetivos da fase 2
1. Detectar novos imóveis e imóveis removidos.
2. Detectar alteração de preço/desconto.
3. Criar favoritos.
4. Criar alertas por filtro.
5. Exibir ranking de oportunidades.

### Objetivos da fase 3
1. Tela de mapa.
2. Dashboard estatístico.
3. Busca semântica por descrição/endereço.
4. Notificações por e-mail/webhook.

---

## 4. Não objetivos

Fora do escopo do MVP:
- automatizar login, proposta, envio de CPF ou qualquer dado pessoal no site oficial;
- garantir sincronização em tempo real com o portal da CAIXA;
- fazer avaliação jurídica do imóvel;
- fazer automação de leilão, lance ou compra;
- integrar com pagamento, financiamento ou assinatura;
- app mobile nativo no MVP.

---

## 5. Usuários-alvo

### 5.1 Comprador pessoa física
Quer encontrar imóveis com desconto, especialmente por cidade e valor.

### 5.2 Investidor
Quer ranquear imóveis por potencial de oportunidade, desconto e região.

### 5.3 Operador/administrador
Quer acompanhar importações, falhas, volume de registros e consistência dos dados.

---

## 6. Escopo funcional do MVP

### 6.1 Importação de dados
O sistema deve:
- ler CSVs por UF a partir do diretório `data/listas/`;
- processar um ou mais estados por execução;
- mapear o CSV para modelo interno em memória;
- permitir upload de novos CSVs via dashboard admin;
- registrar log da importação.

### 6.2 Consulta de imóveis
O sistema deve permitir:
- listar imóveis com paginação;
- ordenar por preço, desconto, cidade e data de atualização;
- filtrar por:
  - UF;
  - cidade;
  - bairro;
  - tipo do imóvel;
  - valor mínimo e máximo;
  - desconto mínimo;
  - aceita financiamento;
  - aceita FGTS;
  - quartos;
  - vagas;
  - área mínima.

### 6.3 Detalhe do imóvel
O sistema deve retornar:
- número do imóvel;
- UF, cidade, bairro e endereço;
- tipo do imóvel;
- preço de venda;
- valor de avaliação;
- desconto calculado;
- financiamento;
- FGTS;
- descrição textual disponível;
- URL oficial do imóvel;
- data da última coleta.

### 6.4 Interface web
A aplicação Vue deve fornecer:
- página inicial com busca rápida;
- página de listagem com filtros laterais ou superiores;
- cards de imóveis com preço, cidade, desconto e tipo;
- paginação;
- tela de detalhe do imóvel;
- feedback visual para carregamento, erro e estado vazio.

### 6.5 Administração técnica
O sistema deve fornecer endpoints ou telas administrativas para:
- iniciar importação manual;
- consultar status da última importação;
- visualizar erros de processamento;
- verificar quantos imóveis existem por UF.

---

## 7. Requisitos funcionais

### RF-01 — Importar lista por UF
O sistema deve carregar em memória uma lista de imóveis a partir do CSV de uma UF.

### RF-02 — Importação em lote
O sistema deve permitir carregar múltiplas UFs em uma única execução.

### RF-03 — Upload de CSV
O sistema deve permitir upload de novos CSVs via dashboard admin.

### RF-04 — Deduplicação em memória
O mesmo imóvel não deve aparecer duplicado na lista em memória.

### RF-05 — Log de importação
O sistema deve registrar resumo da importação (total, rejeitadas, UF).

### RF-06 — Busca paginada
O sistema deve listar imóveis com paginação e ordenação.

### RF-07 — Busca filtrada
O sistema deve suportar múltiplos filtros combináveis.

### RF-08 — Cálculo de desconto
O sistema deve calcular o percentual de desconto quando houver valor de avaliação e preço de venda.

### RF-09 — Endpoint de detalhe
O sistema deve expor detalhe de um imóvel pelo número do imóvel ou ID interno.

### RF-10 — Endpoint de filtros auxiliares
O sistema deve expor listas de UFs, cidades e tipos disponíveis.

### RF-11 — Logs operacionais
O sistema deve registrar falhas de download, parse e persistência.

### RF-12 — Dados voláteis
Os dados ficam em memória enquanto o servidor estiver rodando. Ao reiniciar, os CSVs devem ser recarregados.

### RF-13 — Frontend de catálogo
O sistema deve disponibilizar uma interface Vue consumindo a API REST.

### RF-14 — Estado de filtros compartilhável
A URL da listagem deve refletir filtros principais para permitir compartilhamento e navegação.

### RF-15 — Navegação para detalhe
O usuário deve conseguir abrir o detalhe de um imóvel a partir da listagem.

---

## 8. Requisitos não funcionais

### RNF-01 — Performance
- Consulta paginada deve responder idealmente em até **500 ms** nos filtros comuns.
- Importação completa deve ser desacoplada das consultas do usuário.
- A interface web deve apresentar resposta visual de carregamento em até **200 ms**.

### RNF-02 — Confiabilidade
- O processo de importação deve ser idempotente.
- Falha de uma UF não deve derrubar a execução das demais.

### RNF-03 — Observabilidade
- Logs estruturados.
- Métricas básicas por execução.
- Health checks.

### RNF-04 — Manutenibilidade
- Código organizado por camadas.
- Separação clara entre importação, domínio, API e frontend.
- Testes unitários e de integração.

### RNF-05 — Segurança
- Endpoints administrativos protegidos.
- Sem armazenamento de dados pessoais de terceiros.
- Sem automação de fluxos protegidos do portal oficial.

### RNF-06 — Compatibilidade
- Backend em Java 17.
- Frontend compatível com navegadores modernos.

---

## 9. Arquitetura proposta

## 9.1 Estilo arquitetural
Arquitetura desacoplada em dois blocos principais:
- **Backend API** em Spring Boot
- **Frontend SPA** em Vue 3

## 9.2 Componentes

### Backend Spring Boot
Responsável por:
- leitura de CSVs do diretório `data/listas/`;
- parsing e normalização;
- armazenamento in-memory (lista volátil);
- filtragem, paginação e ordenação em memória;
- API REST.

### Frontend Vue
Responsável por:
- renderização da interface;
- gerenciamento de filtros e paginação;
- navegação entre listagem e detalhe;
- integração com API REST;
- estados de loading, erro e vazio.

### Parsing CSV
Usa Apache Commons CSV para parsing de CSVs Latin-1 com separador `;`.

---

## 10. Fluxo de importação

1. Admin seleciona UF no dashboard ou faz upload de CSV.
2. Sistema lê o CSV do diretório `data/listas/`.
3. Para cada CSV:
   1. valida cabeçalho mínimo;
   2. transforma cada linha em modelo interno;
   3. normaliza tipos, números e flags;
   4. adiciona à lista em memória;
   5. registra linhas rejeitadas no log.
4. Dados ficam disponíveis para consulta via API.

### Regras importantes
- Não falhar a execução inteira por erro em 1 linha.
- Linhas inválidas devem ser registradas no log de rejeição.
- Campos monetários devem ser normalizados para `BigDecimal`.
- Comparações devem considerar eventual variação textual pequena no CSV.

---

## 11. Modelo de dados (in-memory)

## 11.1 Modelo principal: `Imovel` (Java record)

Campos:
- `numeroImovel` (String, chave funcional)
- `uf` (String 2)
- `cidade` (String)
- `bairro` (String)
- `endereco` (String)
- `tipoImovel` (String)
- `descricao` (String)
- `precoVenda` (BigDecimal)
- `valorAvaliacao` (BigDecimal)
- `percentualDesconto` (BigDecimal)
- `financiamento` (String)
- `modalidadeVenda` (String)
- `urlOficial` (String)
- `areaTotal` (String)
- `areaPrivativa` (String)
- `areaTerreno` (String)
- `quartos` (Integer)
- `vagas` (Integer)

## 11.2 Dados de importação
Registrados em log (não persistidos):
- UF processada
- Total de linhas
- Total importadas
- Total rejeitadas (com motivo)

---

## 12. API REST do MVP

## 12.1 Listar imóveis
`GET /api/imoveis`

### Query params
- `uf`
- `cidade`
- `bairro`
- `tipoImovel`
- `precoMin`
- `precoMax`
- `descontoMin`
- `quartosMin`
- `vagasMin`
- `areaMin`
- `aceitaFinanciamento`
- `aceitaFgts`
- `ativo`
- `page`
- `size`
- `sort`

### Exemplo
`GET /api/imoveis?uf=SP&cidade=Campinas&precoMax=250000&descontoMin=20&page=0&size=20&sort=percentualDesconto,desc`

## 12.2 Detalhe do imóvel
`GET /api/imoveis/{numeroImovel}`

## 12.3 Filtros auxiliares
- `GET /api/filtros/ufs`
- `GET /api/filtros/cidades?uf=SP`
- `GET /api/filtros/tipos-imovel`

## 12.4 Administração
- `GET /api/admin/arquivos`
- `POST /api/admin/importar`
- `POST /api/admin/carregar-arquivo`
- `GET /api/admin/status`

---

## 13. Frontend do MVP

### 13.1 Stack
- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Axios
- Tailwind CSS ou Vuetify (escolher 1)

### 13.2 Páginas
- `/` — Home com busca rápida e resumo do produto
- `/imoveis` — Listagem com filtros e paginação
- `/imoveis/:numeroImovel` — Detalhe do imóvel
- `/admin/importacoes` — tela técnica opcional para operação interna

### 13.3 Componentes principais
- `SearchBar`
- `FiltersPanel`
- `PropertyCard`
- `PropertyList`
- `PaginationControls`
- `PropertyDetails`
- `EmptyState`
- `LoadingState`
- `ErrorState`

### 13.4 Estado global sugerido
Usar **Pinia** para:
- filtros atuais;
- paginação;
- cache da busca atual;
- estado de carregamento;
- favoritos futuros.

### 13.5 Regras de UX
- filtros devem atualizar a URL;
- paginação deve preservar filtros atuais;
- cards devem destacar preço, avaliação e desconto;
- link para página oficial deve ficar visível no detalhe;
- layout responsivo desde o MVP.

---

## 14. Regras de negócio

### RB-01
`numero_imovel` é a chave funcional principal de deduplicação.

### RB-02
Se `valor_avaliacao > 0` e `preco_venda > 0`, calcular desconto:

`((valor_avaliacao - preco_venda) / valor_avaliacao) * 100`

### RB-03
Campos numéricos ausentes no CSV não devem causar falha geral; devem virar `null`.

### RB-04
Strings devem ser normalizadas com trim e espaços duplicados removidos.

### RB-05
Se a cidade vier vazia ou inválida, o registro pode ser rejeitado conforme regra configurável.

---

## 15. Estratégia de implementação sugerida para a IA

## 15.1 Ordem recomendada de entrega

### Etapa 1 — Base do projeto
- criar backend Spring Boot com Maven;
- criar estrutura de pacotes;
- criar frontend Vue com Vite e TypeScript.

### Etapa 2 — Importador
- criar parser CSV;
- criar normalizador;
- criar serviço in-memory (InMemoryStore);
- criar endpoints admin (upload, carregar).

### Etapa 3 — API de catálogo
- criar endpoints REST;
- implementar paginação em memória;
- implementar filtros dinâmicos.

### Etapa 4 — Frontend
- criar rotas principais;
- criar store global;
- criar tela de listagem;
- integrar filtros com a API;
- criar tela de detalhe;
- criar estados de loading e erro.

### Etapa 5 — Observabilidade
- logs estruturados;
- actuator;
- métricas básicas.

### Etapa 6 — Testes
- testes unitários do parser;
- testes unitários do cálculo de desconto;
- testes de API;
- testes de componentes principais do frontend.

---

## 16. Estrutura de pacotes e pastas

```text
imovue/
├── tools/
│   └── download_caixa.py         ← utilitário para baixar CSVs
├── data/
│   └── listas/                    ← CSVs baixados (upload via admin)
├── backend/
│   ├── src/main/java/br/com/imovue
│   │   ├── ImovueApplication.java
│   │   ├── config/
│   │   ├── shared/
│   │   │   └── exception/
│   │   ├── importer/
│   │   │   └── parser/
│   │   ├── catalog/
│   │   │   ├── api/
│   │   │   ├── service/
│   │   │   └── domain/
│   │   └── admin/
│   │       └── api/
│   └── pom.xml
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── pages/
    │   ├── router/
    │   ├── stores/
    │   ├── services/
    │   ├── types/
    │   ├── composables/
    │   └── App.vue
    ├── package.json
    └── vite.config.ts
```

---

## 17. Dependências

### Backend
- `spring-boot-starter-web`
- `spring-boot-starter-actuator`
- `spring-boot-starter-test`
- `commons-csv` (parsing CSV)

### Frontend
- `vue`, `typescript`, `vite`
- `vue-router`, `pinia`, `axios`
- `tailwindcss`
- `vitest`, `@testing-library/vue`

---

## 18. Estratégia de filtro dinâmico

### Backend
Filtragem feita em memória com streams Java sobre a lista de imóveis carregada. Suporta múltiplos filtros opcionais combinados.

### Frontend
Serializar filtros na query string da rota `/imoveis`.

Exemplo:
`/imoveis?uf=SP&cidade=Campinas&precoMax=250000&descontoMin=20&page=1`

---

## 19. Critérios de aceite do MVP

### CA-01
Ao carregar um CSV de UF válida, os imóveis devem ficar disponíveis na API.

### CA-02
Carregar o mesmo CSV duas vezes não pode gerar duplicidade.

### CA-03
A API deve retornar lista paginada de imóveis.

### CA-04
A API deve filtrar corretamente por UF, cidade e faixa de valor.

### CA-05
A API deve ordenar corretamente por desconto decrescente.

### CA-06
A API de detalhe deve retornar um imóvel existente pelo número do imóvel.

### CA-07
Falhas em linhas inválidas devem ser registradas sem interromper toda a importação.

### CA-08
O sistema deve expor o status atual (total de imóveis, UF carregada).

### CA-09
A interface Vue deve listar imóveis usando a API do backend.

### CA-10
A interface Vue deve aplicar filtros e refletir a busca na URL.

### CA-11
A tela de detalhe deve exibir os principais dados do imóvel e link oficial.

---

## 20. Critérios de pronto (Definition of Done)

Uma entrega só será considerada pronta quando:
- código backend compilar sem erro em Java 17;
- frontend buildar sem erro;
- testes principais passarem;
- endpoints documentados;
- logs mínimos implementados;
- tratamento básico de erro implementado;
- README com instruções de execução incluído.

---

## 21. Backlog inicial

## Épico 1 — Fundamentos
- [x] Criar projeto backend Spring Boot Java 17
- [x] Criar estrutura de pacotes
- [x] Criar projeto frontend Vue 3 + TypeScript + Vite
- [x] Configurar Vue Router e Pinia

## Épico 2 — Importação
- [x] Criar parser CSV (encoding latin1, separador ;)
- [x] Criar serviço in-memory (InMemoryStore)
- [x] Criar endpoints admin (upload, carregar)

## Épico 3 — Catálogo backend
- [x] Criar endpoint de listagem paginada
- [x] Criar endpoint de detalhe
- [x] Criar endpoint de filtros
- [x] Criar endpoint de dashboard/estatísticas

## Épico 4 — Catálogo frontend
- [x] Criar página Home
- [x] Criar página de listagem com filtros
- [x] Criar cards de imóvel com fotos
- [x] Criar página de detalhe
- [x] Criar página de dashboard
- [x] Criar favoritos (localStorage)

## Épico 5 — Administração
- [x] Criar endpoint de upload de CSV
- [x] Criar endpoint de carregar arquivo
- [x] Criar tela admin de importação

## Épico 6 — Qualidade
- [ ] Testes unitários backend
- [ ] Testes de API
- [ ] Testes do frontend
- [ ] README técnico

---

## 22. Riscos e mitigação

### Risco 1 — Mudança no formato do CSV
**Mitigação:** validar cabeçalho, isolar parser e criar testes com fixture.

### Risco 2 — Dados inconsistentes
**Mitigação:** camada de normalização e rejeição por linha.

### Risco 3 — Crescimento do volume de dados em memória
**Mitigação:** paginação obrigatória, filtros bem definidos, carregar uma UF por vez.

### Risco 4 — Perda de dados ao reiniciar
**Mitigação:** CSVs ficam no disco; dados são recarregáveis a qualquer momento.

### Risco 5 — Acoplamento ruim entre frontend e backend
**Mitigação:** contratos REST claros e documentação.

---

## 23. Configurações externas

No `application.yml`:

```yaml
spring:
  application:
    name: imovue
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 50MB
server:
  port: 8080
app:
  data-dir: data/listas
```

No frontend, expor em `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 24. Exemplos de histórias de usuário

### HU-01
Como comprador, quero filtrar imóveis por cidade e faixa de valor para encontrar opções compatíveis com meu orçamento.

### HU-02
Como investidor, quero ordenar os imóveis por desconto para localizar oportunidades mais atrativas.

### HU-03
Como operador, quero iniciar uma importação manual para atualizar o catálogo sob demanda.

### HU-04
Como operador, quero ver o resumo da última importação para saber se houve falhas.

### HU-05
Como usuário, quero abrir o detalhe de um imóvel para entender melhor a oportunidade.

---

## 25. Prompt de orientação para a IA desenvolvedora

Use o texto abaixo como instrução operacional para o agente de desenvolvimento:

```text
Implemente o Imovue como uma solução com backend em Java 17 + Spring Boot (in-memory, sem banco) e frontend em Vue 3 + TypeScript + Vite.
Priorize código limpo, baixo acoplamento e testes.
Os dados são carregados de CSVs para memória via InMemoryStore.
Filtragem e paginação são feitas em memória com streams Java.
No frontend, use Vue Router, Pinia e uma camada de services para integração com a API.
Não automatize fluxos transacionais no site oficial; o sistema é apenas catálogo e consulta.
Sempre entregue código compilável, com tratamento de erro básico, logs e testes essenciais.
```

---

## 26. Fora do MVP, mas já deixar preparado

Projetar o código para futura inclusão de:
- favoritos por usuário;
- autenticação;
- notificações;
- histórico de preço;
- tela web mais rica;
- enriquecimento do imóvel com página de detalhe;
- mapa com geolocalização.

---

## 27. Decisões iniciais

1. **CSV primeiro, enriquecer depois.**
   Começar pela lista CSV por UF antes de tentar capturar detalhes página a página.

2. **In-memory é suficiente para o MVP.**
   Sem banco de dados. CSVs são a fonte de verdade, dados carregados em memória.

3. **Consulta desacoplada da coleta.**
   O usuário consulta dados em memória, nunca o portal ao vivo.

4. **MVP full-stack com backend-first.**
   Primeiro garantir importação e API; depois conectar a interface Vue.

5. **Frontend orientado por URL.**
   Filtros e paginação devem refletir a navegação e permitir compartilhamento.

---

## 28. Entregável esperado da primeira versão

A primeira versão será considerada útil quando permitir:
- carregar pelo menos 1 UF com sucesso;
- listar imóveis via API com paginação;
- filtrar por UF, cidade e preço;
- ver detalhe de um imóvel;
- ver status atual (total, UF carregada);
- navegar em uma interface Vue funcional conectada ao backend.

---

## 29. Roadmap técnico

### Sprint 1
- bootstrap do backend
- parser CSV
- InMemoryStore
- bootstrap do frontend Vue

### Sprint 2
- endpoints REST (listagem, detalhe, filtros)
- endpoints admin (upload, carregar)
- serviço HTTP no frontend

### Sprint 3
- página de listagem Vue com filtros
- página de detalhe Vue
- dashboard de estatísticas

### Sprint 4
- favoritos
- guia do comprador
- testes e documentação

---

## 30. Resumo executivo

O Imovue é uma **plataforma de catálogo e busca de imóveis da CAIXA**, baseada em **ingestão de CSVs públicos por estado**, com **backend em Java 17 + Spring Boot (in-memory)** e **frontend em Vue 3**.

A prioridade do MVP é **importação confiável de CSVs**, **consulta rápida com filtros**, **boa experiência de busca** e **interface moderna**, sem necessidade de banco de dados — os CSVs são a fonte de verdade e os dados ficam em memória enquanto o servidor roda.
