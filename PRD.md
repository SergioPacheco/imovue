# PRD — Imovue

## 1. Visão geral

### Nome do produto
**Imovue**

### Objetivo
Construir uma aplicação web para **coletar, normalizar, armazenar e listar imóveis à venda da CAIXA**, com foco inicial em uma experiência de consulta rápida por **estado, cidade, faixa de valor, tipo do imóvel e desconto**.

O sistema deve consumir periodicamente as listas públicas por estado, persistir os dados em base própria e expor uma API para consulta eficiente, sem depender de scraping em tempo real para cada requisição do usuário.

### Stack obrigatória
#### Backend
- **Java 11**
- **Spring Boot**
- **PostgreSQL**

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
2. Armazenar os dados em banco próprio.
3. Expor uma API REST para consulta paginada.
4. Disponibilizar uma interface web em Vue para busca e navegação.
5. Permitir filtros por critérios principais.
6. Exibir detalhes básicos de cada imóvel.
7. Registrar histórico de coletas para auditoria e futura comparação.

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
- baixar a lista por UF a partir da fonte pública;
- processar um ou mais estados por execução;
- mapear o CSV para modelo interno;
- realizar upsert por identificador do imóvel;
- registrar data/hora da coleta;
- marcar imóveis não encontrados em coletas futuras como potencialmente inativos/removidos.

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
O sistema deve importar uma lista pública de imóveis para uma UF específica.

### RF-02 — Importação em lote
O sistema deve permitir importar múltiplas UFs em uma única execução.

### RF-03 — Agendamento automático
O sistema deve permitir execução agendada diária.

### RF-04 — Upsert idempotente
O mesmo imóvel não deve ser duplicado se a coleta for executada novamente.

### RF-05 — Versionamento de coleta
O sistema deve registrar metadados da coleta para auditoria.

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

### RF-12 — Status de disponibilidade
O sistema deve manter um campo lógico para indicar se o imóvel está ativo na última coleta.

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
- Backend em Java 11.
- Compatível com PostgreSQL 13+.
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
- agendamento;
- download do CSV;
- parsing;
- normalização;
- persistência;
- API REST.

### Frontend Vue
Responsável por:
- renderização da interface;
- gerenciamento de filtros e paginação;
- navegação entre listagem e detalhe;
- integração com API REST;
- estados de loading, erro e vazio.

### PostgreSQL
Responsável por:
- catálogo principal;
- histórico de coletas;
- logs resumidos de execução.

### Scheduler
Pode usar:
- `@Scheduled` no MVP;
- evoluir para Quartz se necessário.

### Cliente HTTP
Usar `WebClient` ou `RestTemplate` no MVP.

### Parsing CSV
Sugestões:
- Apache Commons CSV;
- OpenCSV.

---

## 10. Fluxo de importação

1. Scheduler dispara a rotina.
2. Sistema define a lista de UFs a processar.
3. Para cada UF:
   1. monta a URL da lista pública;
   2. baixa o CSV;
   3. valida cabeçalho mínimo;
   4. transforma cada linha em DTO bruto;
   5. normaliza tipos, números e flags;
   6. executa upsert por número do imóvel;
   7. atualiza `last_seen_at`;
   8. registra métricas da coleta.
4. Ao final, imóveis não vistos na execução podem ser marcados como `ativo = false` com cautela.
5. Grava resumo da execução.

### Regras importantes
- Não falhar a execução inteira por erro em 1 linha.
- Linhas inválidas devem ser enviadas para log de rejeição.
- Campos monetários devem ser normalizados para `BigDecimal`.
- Comparações devem considerar eventual variação textual pequena no CSV.

---

## 11. Modelo de dados

## 11.1 Entidade principal: `imovel`

Campos sugeridos:
- `id` (UUID ou BIGSERIAL)
- `numero_imovel` (String, único)
- `uf` (String 2)
- `cidade` (String)
- `bairro` (String)
- `endereco` (String)
- `cep` (String, opcional)
- `tipo_imovel` (String)
- `descricao` (Text)
- `preco_venda` (BigDecimal)
- `valor_avaliacao` (BigDecimal)
- `percentual_desconto` (BigDecimal)
- `aceita_financiamento` (Boolean)
- `aceita_fgts` (Boolean)
- `quartos` (Integer)
- `vagas` (Integer)
- `area_util` (BigDecimal)
- `area_total` (BigDecimal)
- `url_oficial` (String)
- `ativo` (Boolean)
- `first_seen_at` (Timestamp)
- `last_seen_at` (Timestamp)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 11.2 Entidade: `coleta_execucao`
- `id`
- `iniciada_em`
- `finalizada_em`
- `status` (SUCESSO, PARCIAL, FALHA)
- `ufs_processadas`
- `total_linhas`
- `total_importadas`
- `total_atualizadas`
- `total_rejeitadas`
- `mensagem_resumo`

## 11.3 Entidade: `coleta_item_erro`
- `id`
- `coleta_execucao_id`
- `uf`
- `linha_original`
- `motivo`

## 11.4 Entidade futura: `imovel_historico`
Para fase 2, guardar snapshots de preço e disponibilidade.

---

## 12. Índices sugeridos

Criar índices para:
- `numero_imovel` único;
- `uf`;
- `cidade`;
- `tipo_imovel`;
- `preco_venda`;
- `percentual_desconto`;
- `ativo`;
- índice composto `uf, cidade, ativo`.

---

## 13. API REST do MVP

## 13.1 Listar imóveis
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

## 13.2 Detalhe do imóvel
`GET /api/imoveis/{numeroImovel}`

## 13.3 Filtros auxiliares
- `GET /api/filtros/ufs`
- `GET /api/filtros/cidades?uf=SP`
- `GET /api/filtros/tipos-imovel`

## 13.4 Administração
- `POST /api/admin/importacoes`
- `GET /api/admin/importacoes/ultima`
- `GET /api/admin/importacoes/{id}`
- `GET /api/admin/estatisticas/resumo`

---

## 14. Frontend do MVP

### 14.1 Stack sugerida
- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Axios
- Tailwind CSS ou Vuetify (escolher 1)

### 14.2 Páginas
- `/` — Home com busca rápida e resumo do produto
- `/imoveis` — Listagem com filtros e paginação
- `/imoveis/:numeroImovel` — Detalhe do imóvel
- `/admin/importacoes` — tela técnica opcional para operação interna

### 14.3 Componentes principais
- `SearchBar`
- `FiltersPanel`
- `PropertyCard`
- `PropertyList`
- `PaginationControls`
- `PropertyDetails`
- `EmptyState`
- `LoadingState`
- `ErrorState`

### 14.4 Estado global sugerido
Usar **Pinia** para:
- filtros atuais;
- paginação;
- cache da busca atual;
- estado de carregamento;
- favoritos futuros.

### 14.5 Regras de UX
- filtros devem atualizar a URL;
- paginação deve preservar filtros atuais;
- cards devem destacar preço, avaliação e desconto;
- link para página oficial deve ficar visível no detalhe;
- layout responsivo desde o MVP.

---

## 15. Regras de negócio

### RB-01
`numero_imovel` é a chave funcional principal de deduplicação.

### RB-02
Se `valor_avaliacao > 0` e `preco_venda > 0`, calcular desconto:

`((valor_avaliacao - preco_venda) / valor_avaliacao) * 100`

### RB-03
Se um imóvel estava ativo e deixa de aparecer em coletas consecutivas, marcar como inativo conforme política configurável.

### RB-04
Campos numéricos ausentes no CSV não devem causar falha geral; devem virar `null`.

### RB-05
Strings devem ser normalizadas com trim e espaços duplicados removidos.

### RB-06
Se a cidade vier vazia ou inválida, o registro pode ser rejeitado conforme regra configurável.

---

## 16. Estratégia de implementação sugerida para a IA

## 16.1 Ordem recomendada de entrega

### Etapa 1 — Base do projeto
- criar backend Spring Boot com Maven;
- configurar PostgreSQL;
- configurar Flyway ou Liquibase;
- criar estrutura de pacotes;
- configurar profiles (`dev`, `test`, `prod`);
- criar frontend Vue com Vite e TypeScript.

### Etapa 2 — Persistência
- criar entidades JPA;
- criar migrations iniciais;
- criar repositories.

### Etapa 3 — Importador
- criar client HTTP;
- criar parser CSV;
- criar normalizador;
- criar serviço de upsert;
- criar agendamento;
- criar registro de execução.

### Etapa 4 — API de catálogo
- criar endpoints REST;
- implementar paginação;
- implementar filtros dinâmicos.

### Etapa 5 — Frontend
- criar rotas principais;
- criar store global;
- criar tela de listagem;
- integrar filtros com a API;
- criar tela de detalhe;
- criar estados de loading e erro.

### Etapa 6 — Observabilidade
- logs estruturados;
- actuator;
- métricas básicas.

### Etapa 7 — Testes
- testes unitários do parser;
- testes unitários do cálculo de desconto;
- testes de integração de repository;
- testes de API;
- testes de componentes principais do frontend.

---

## 17. Estrutura de pacotes e pastas sugerida

```text
imovue/
├── backend/
│   ├── src/main/java/br/com/imovue
│   │   ├── ImovueApplication.java
│   │   ├── config
│   │   ├── shared
│   │   │   ├── exception
│   │   │   ├── util
│   │   │   └── dto
│   │   ├── importer
│   │   │   ├── api
│   │   │   ├── service
│   │   │   ├── parser
│   │   │   ├── client
│   │   │   ├── domain
│   │   │   └── repository
│   │   ├── catalog
│   │   │   ├── api
│   │   │   ├── service
│   │   │   ├── domain
│   │   │   ├── repository
│   │   │   └── specification
│   │   └── admin
│   │       ├── api
│   │       ├── service
│   │       └── dto
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

## 18. Dependências sugeridas

### Backend obrigatórias
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `spring-boot-starter-actuator`
- `postgresql`
- `flyway-core` ou `liquibase-core`

### Backend úteis
- `spring-boot-starter-test`
- `commons-csv` ou `opencsv`
- `lombok` (opcional)
- `springdoc-openapi-ui` (se compatível com stack escolhida)

### Frontend obrigatórias
- `vue`
- `typescript`
- `vite`
- `vue-router`
- `pinia`
- `axios`

### Frontend úteis
- `@vueuse/core`
- `tailwindcss` ou `vuetify`
- `vitest`
- `@testing-library/vue`

---

## 19. Estratégia de filtro dinâmico

### Backend
Usar uma das abordagens:
1. `JpaSpecificationExecutor`
2. QueryDSL
3. Criteria API customizada

### Recomendação
Para o MVP, usar **Spring Data JPA + Specification**.

Motivo:
- flexível para múltiplos filtros opcionais;
- simples para a IA implementar incrementalmente;
- evita explosão de métodos no repository.

### Frontend
Serializar filtros na query string da rota `/imoveis`.

Exemplo:
`/imoveis?uf=SP&cidade=Campinas&precoMax=250000&descontoMin=20&page=1`

---

## 20. Critérios de aceite do MVP

### CA-01
Ao executar a importação de uma UF válida, os imóveis devem ser persistidos com sucesso no banco.

### CA-02
Executar a mesma importação duas vezes não pode gerar duplicidade.

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
O sistema deve expor o status da última importação.

### CA-09
A interface Vue deve listar imóveis usando a API do backend.

### CA-10
A interface Vue deve aplicar filtros e refletir a busca na URL.

### CA-11
A tela de detalhe deve exibir os principais dados do imóvel e link oficial.

---

## 21. Critérios de pronto (Definition of Done)

Uma entrega só será considerada pronta quando:
- código backend compilar sem erro em Java 11;
- frontend buildar sem erro;
- migrations executarem do zero;
- testes principais passarem;
- endpoints documentados;
- logs mínimos implementados;
- tratamento básico de erro implementado;
- README com instruções de execução incluído.

---

## 22. Backlog inicial

## Épico 1 — Fundamentos
- [ ] Criar projeto backend Spring Boot Java 11
- [ ] Configurar PostgreSQL
- [ ] Configurar migrations
- [ ] Criar entidades base
- [ ] Criar projeto frontend Vue 3 com TypeScript e Vite
- [ ] Configurar Vue Router e Pinia

## Épico 2 — Importação
- [ ] Criar downloader de CSV por UF
- [ ] Criar parser CSV
- [ ] Criar normalização de dados
- [ ] Criar upsert idempotente
- [ ] Criar scheduler diário
- [ ] Criar log de execução

## Épico 3 — Catálogo backend
- [ ] Criar endpoint de listagem
- [ ] Criar endpoint de detalhe
- [ ] Criar endpoint de filtros
- [ ] Criar ordenação por desconto

## Épico 4 — Catálogo frontend
- [ ] Criar página Home
- [ ] Criar página de listagem
- [ ] Criar filtros com query string
- [ ] Criar cards de imóvel
- [ ] Criar página de detalhe

## Épico 5 — Administração
- [ ] Criar endpoint de importação manual
- [ ] Criar endpoint da última execução
- [ ] Criar endpoint de resumo por UF
- [ ] Criar tela técnica opcional

## Épico 6 — Qualidade
- [ ] Testes unitários backend
- [ ] Testes de integração backend
- [ ] Testes do frontend
- [ ] Documentação OpenAPI
- [ ] README técnico

---

## 23. Riscos e mitigação

### Risco 1 — Mudança no formato do CSV
**Mitigação:** validar cabeçalho, isolar parser e criar testes com fixture.

### Risco 2 — Instabilidade de download
**Mitigação:** retry com backoff e timeout configurável.

### Risco 3 — Dados inconsistentes
**Mitigação:** camada de normalização e rejeição por linha.

### Risco 4 — Crescimento da consulta
**Mitigação:** índices, paginação obrigatória e filtros bem definidos.

### Risco 5 — Regras de disponibilidade mudarem
**Mitigação:** tornar políticas configuráveis por propriedades.

### Risco 6 — Acoplamento ruim entre frontend e backend
**Mitigação:** contratos REST claros, DTOs estáveis e documentação OpenAPI.

---

## 24. Configurações externas sugeridas

Expor no `application.yml`:
- lista de UFs habilitadas;
- cron da importação;
- timeout de download;
- quantidade de retries;
- política para marcar imóvel inativo;
- tamanho padrão de página;
- URL base da fonte pública.

Exemplo conceitual:

```yaml
app:
  importacao:
    cron: "0 0 2 * * *"
    ufs-habilitadas: ["SP", "RJ", "MG"]
    timeout-segundos: 30
    retries: 3
    marcar-inativo-apos-execucoes-ausentes: 2
  catalogo:
    page-size-default: 20
    page-size-max: 100
  fonte:
    base-url: "https://venda-imoveis.caixa.gov.br/listaweb"
```

No frontend, expor em `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 25. Exemplos de histórias de usuário

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

## 26. Prompt de orientação para a IA desenvolvedora

Use o texto abaixo como instrução operacional para o agente de desenvolvimento:

```text
Implemente o Imovue como uma solução com backend em Java 11 + Spring Boot + PostgreSQL e frontend em Vue 3 + TypeScript + Vite.
Priorize código limpo, baixo acoplamento e testes.
Implemente primeiro a infraestrutura do backend, depois persistência, depois importação CSV idempotente, depois API REST paginada com filtros dinâmicos, e então a interface Vue consumindo a API.
Use Spring Data JPA com Specification para filtros.
Use migrations versionadas.
No frontend, use Vue Router, Pinia e uma camada de services para integração com a API.
Garanta compatibilidade com Java 11 no backend.
Não automatize fluxos transacionais no site oficial; o sistema é apenas catálogo e consulta.
Sempre entregue código compilável, com tratamento de erro básico, logs e testes essenciais.
```

---

## 27. Fora do MVP, mas já deixar preparado

Projetar o código para futura inclusão de:
- favoritos por usuário;
- autenticação;
- notificações;
- histórico de preço;
- tela web mais rica;
- enriquecimento do imóvel com página de detalhe;
- mapa com geolocalização.

---

## 28. Decisões iniciais recomendadas

1. **Persistir primeiro, enriquecer depois.**
   Começar pela lista CSV por UF antes de tentar capturar detalhes página a página.

2. **Idempotência é obrigatória.**
   O importador deve ser seguro para reexecução.

3. **Consulta desacoplada da coleta.**
   O usuário consulta o banco próprio, nunca o portal ao vivo.

4. **MVP full-stack com backend-first.**
   Primeiro garantir importação e API; depois conectar a interface Vue.

5. **Logs e auditoria desde o início.**
   Sem isso, o crawler/importador fica difícil de manter.

6. **Frontend orientado por URL.**
   Filtros e paginação devem refletir a navegação e permitir compartilhamento.

---

## 29. Entregável esperado da primeira versão

A primeira versão será considerada útil quando permitir:
- importar pelo menos 1 UF com sucesso;
- listar imóveis via API com paginação;
- filtrar por UF, cidade e preço;
- ver detalhe de um imóvel;
- ver a última execução de importação;
- navegar em uma interface Vue funcional conectada ao backend.

---

## 30. Sugestão de roadmap técnico

### Sprint 1
- bootstrap do backend
- banco e migrations
- entidade `imovel`
- parser CSV de fixture local
- bootstrap do frontend Vue

### Sprint 2
- downloader real
- upsert
- registro de execução
- importação manual
- serviço HTTP no frontend

### Sprint 3
- listagem REST paginada
- filtros por UF/cidade/preço
- ordenação
- página de listagem Vue

### Sprint 4
- detalhe do imóvel
- filtros auxiliares
- testes e documentação
- tela de detalhe Vue

---

## 31. Resumo executivo

O Imovue deve nascer como uma **plataforma de catálogo e busca de imóveis da CAIXA**, baseada em **ingestão de listas públicas por estado**, com **backend em Java 11 + Spring Boot + PostgreSQL** e **frontend em Vue 3**.

A prioridade do MVP é **confiabilidade da importação**, **idempotência**, **consulta rápida**, **boa experiência de busca** e **base limpa para futuras funcionalidades**, evitando scraping síncrono e evitando qualquer automação indevida do fluxo oficial da CAIXA.
