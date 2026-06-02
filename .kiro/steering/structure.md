---
description: Project structure — directory layout, module boundaries, naming conventions
inclusion: always
---

# Structure Steering

## Project layout
```
imovue/
├── .github/
│   └── workflows/
│       └── update-data.yml       ← GitHub Actions: atualiza CSVs periodicamente
├── tools/
│   ├── download_caixa.py        ← baixa CSVs do site da Caixa
│   └── csv_to_json.py           ← converte CSVs → JSONs estáticos
├── data/
│   └── listas/                   ← CSVs baixados
│       ├── Lista_imoveis_RJ.csv
│       ├── Lista_imoveis_SP.csv
│       └── ...
└── frontend/
    ├── public/
    │   └── data/                 ← JSONs gerados (um por UF + manifest.json)
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
- `tools/` — scripts Python para download e conversão de dados (offline/CI)
- `frontend/` — SPA Vue 3 que consome JSONs estáticos
- `frontend/public/data/` — JSONs gerados, servidos como arquivos estáticos

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
- Frontend consome exclusivamente JSONs estáticos de `public/data/`
- Toda lógica de filtros, paginação e sort é client-side
- Dados atualizados via CI (GitHub Actions) — sem servidor backend
- Scripts Python (`tools/`) são a ponte entre CSVs da Caixa e JSONs do frontend

## Naming conventions
- Classes/types: `PascalCase`
- Functions/methods/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- REST endpoints: `kebab-case`

## File placement rules
- New CSV parsing logic → `tools/csv_to_json.py`
- New download logic → `tools/download_caixa.py`
- New frontend page → `pages/{user|guia}/`

## Key domain model
- `Imovel` — Java record com 18 campos (numero, uf, cidade, preço, desconto, etc.)
- Dados voláteis: perdem-se ao reiniciar o servidor, recarregáveis dos CSVs
