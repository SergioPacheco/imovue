---
description: Project structure — directory layout, module boundaries, naming conventions
inclusion: always
---

# Structure Steering

## Project layout
```
imovue/
├── tools/
│   └── download_caixa.py            ← utilitário para baixar CSVs
├── data/
│   └── listas/                       ← CSVs baixados (upload via admin)
│       ├── Lista_imoveis_RJ.csv
│       ├── Lista_imoveis_SP.csv
│       └── ...
├── backend/
│   ├── src/main/java/br/com/imovue/
│   │   ├── ImovueApplication.java
│   │   ├── config/
│   │   ├── shared/
│   │   │   └── exception/
│   │   ├── importer/
│   │   │   └── parser/          ← parser CSV (Latin-1, separador ;)
│   │   ├── catalog/
│   │   │   ├── api/             ← endpoints usuário: listar, filtrar, detalhe
│   │   │   ├── service/         ← InMemoryStore (dados voláteis)
│   │   │   └── domain/          ← Imovel record
│   │   └── admin/
│   │       └── api/             ← endpoints admin: upload, carregar, status
│   ├── src/main/resources/
│   │   └── application.yml
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
    │   │   │   ├── DashboardPage.vue
    │   │   │   └── MapaPage.vue        ← Fase 2
    │   │   ├── admin/          ← dashboard admin
    │   │   │   └── ImportacaoPage.vue
    │   │   └── guia/
    │   │       └── GuiaPage.vue
    │   ├── router/
    │   ├── stores/
    │   ├── services/
    │   ├── composables/
    │   ├── types/
    │   └── App.vue
    ├── package.json
    └── vite.config.ts
```

## Module boundaries
- `importer/` — parser CSV, normalização de dados
- `catalog/` — API REST de consulta, listagem, filtros, detalhe, dashboard (InMemoryStore)
- `admin/` — endpoints administrativos: upload CSV, carregar arquivo, status
- `shared/` — exceções globais, utilitários comuns

## Frontend routes
### Dashboard Usuário
- `/` — Home com seletor de UF
- `/imoveis` — Listagem com filtros avançados
- `/imoveis/:numero` — Detalhe do imóvel
- `/dashboard` — Estatísticas e top descontos
- `/favoritos` — Lista de favoritos (localStorage)
- `/guia` — Guia do comprador
- `/mapa` — Mapa com pins (Fase 2)

### Dashboard Admin
- `/admin` — Upload e importação de CSVs

## Architecture rules
- Controllers depend on services. Never on other controllers.
- Services contain business logic. InMemoryStore is the central service.
- No database, no JPA, no migrations. Dados 100% in-memory.
- CSVs são a fonte de verdade, carregados sob demanda.

## Naming conventions
- Classes/types: `PascalCase`
- Functions/methods/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- REST endpoints: `kebab-case`

## File placement rules
- New endpoint → controller method
- New business rule → service layer (InMemoryStore ou novo service)
- New CSV parsing logic → `importer/parser/`
- New frontend page → `pages/{user|admin|guia}/`

## Key domain model
- `Imovel` — Java record com 18 campos (numero, uf, cidade, preço, desconto, etc.)
- Dados voláteis: perdem-se ao reiniciar o servidor, recarregáveis dos CSVs
