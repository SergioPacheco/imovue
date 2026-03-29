---
description: Project structure — directory layout, module boundaries, naming conventions
inclusion: always
---

# Structure Steering

## Project layout
```
imovue/
├── tools/
│   └── DownloadListasImoveisCaixa.java  ← utilitário standalone para baixar CSVs
├── data/
│   └── listas/                           ← CSVs baixados (upload via admin)
│       ├── Lista_imoveis_RJ.csv
│       ├── Lista_imoveis_SP.csv
│       └── ...
├── backend/
│   ├── src/main/java/br/com/imovue/
│   │   ├── ImovueApplication.java
│   │   ├── config/
│   │   ├── shared/
│   │   │   ├── exception/
│   │   │   ├── util/
│   │   │   └── dto/
│   │   ├── importer/
│   │   │   ├── api/            ← endpoints admin: upload, importar
│   │   │   ├── service/
│   │   │   ├── parser/
│   │   │   ├── domain/
│   │   │   └── repository/
│   │   ├── catalog/
│   │   │   ├── api/            ← endpoints usuário: listar, filtrar, detalhe
│   │   │   ├── service/
│   │   │   ├── domain/
│   │   │   ├── repository/
│   │   │   └── specification/
│   │   └── admin/
│   │       ├── api/            ← endpoints admin: status, estatísticas
│   │       ├── service/
│   │       └── dto/
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/
│   └── pom.xml
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── pages/
    │   │   ├── user/           ← dashboard usuário
    │   │   │   ├── HomePage.vue
    │   │   │   ├── ListagemPage.vue
    │   │   │   ├── DetalhePage.vue
    │   │   │   ├── FavoritosPage.vue
    │   │   │   ├── CompararPage.vue
    │   │   │   └── MapaPage.vue        ← Fase 2
    │   │   └── admin/          ← dashboard admin
    │   │       ├── ImportacaoPage.vue
    │   │       └── EstatisticasPage.vue
    │   ├── router/
    │   ├── stores/
    │   ├── services/
    │   ├── types/
    │   └── App.vue
    ├── package.json
    └── vite.config.ts
```

## Module boundaries
- `importer/` — upload CSV, parsing, normalização, upsert (sem download automático)
- `catalog/` — API REST de consulta, listagem, filtros, detalhe (dashboard usuário)
- `admin/` — endpoints administrativos, status de importação, estatísticas (dashboard admin)
- `shared/` — exceções, utilitários, DTOs comuns

## Frontend routes
### Dashboard Usuário
- `/` — Home com busca rápida e estatísticas
- `/imoveis` — Listagem com filtros avançados
- `/imoveis/:numero` — Detalhe do imóvel
- `/favoritos` — Lista de favoritos (localStorage)
- `/comparar` — Comparador lado a lado
- `/mapa` — Mapa com pins (Fase 2)

### Dashboard Admin
- `/admin` — Painel principal
- `/admin/importacao` — Upload e importação de CSVs
- `/admin/estatisticas` — Resumo por UF, erros, histórico
- Controllers/routes depend on services. Never on repositories directly.
- Services contain business logic. May call other services.
- Repositories handle data access only.
- DTOs/schemas are separate from domain models.

## Naming conventions
- Classes/types: `PascalCase`
- Functions/methods/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Database tables: `snake_case`
- REST endpoints: `kebab-case`
- Migration files: versioned with description (e.g., `V1__create_imovel_table.sql`)

## File placement rules
- New endpoint → controller + service method
- New business rule → service layer (never in controller or repository)
- New database query → repository
- New external API call → dedicated client with its own error handling
- New table/column → model + migration script

## Key entities
- `imovel` — catálogo principal de imóveis
- `coleta_execucao` — metadados de cada execução de importação
- `coleta_item_erro` — log de linhas rejeitadas
- `imovel_historico` — snapshots de preço (fase 2)
