# 🏠 Imovue

Catálogo de imóveis de leilão da CAIXA com filtros avançados, fotos reais e dashboard de oportunidades.

![Java](https://img.shields.io/badge/Java-17-blue) ![Vue](https://img.shields.io/badge/Vue-3-green) ![Tailwind](https://img.shields.io/badge/Tailwind-3-blue) ![Docker](https://img.shields.io/badge/Docker-ready-blue)

## O que é

O Imovue é um visualizador de imóveis disponíveis para venda pela CAIXA Econômica Federal. Ele importa as listas públicas em CSV, extrai os dados e apresenta em uma interface moderna com filtros, fotos, mapa e estatísticas.

**Não possui vínculo oficial com a CAIXA.** Os dados são extraídos de listas públicas.

## Funcionalidades

- 🔍 **Filtros avançados** — tipo, cidade, preço, desconto, quartos, vagas
- 📸 **Fotos reais** dos imóveis (extraídas do site da CAIXA)
- 📊 **Dashboard** — top descontos, distribuição, ranking por cidade e tipo
- 📍 **Google Maps** — link direto para localização do imóvel
- 📄 **Matrícula PDF** — acesso ao documento quando disponível
- ❤️ **Favoritos** — salvos no navegador (localStorage)
- 📋 **Guia do Comprador** — modalidades, documentos, cuidados e FAQ
- ⚙️ **Painel Admin** — listagem de CSVs, upload e importação

## Stack

| Camada | Tecnologia |
|--------|------------|
| Backend | Java 17 + Spring Boot 3.2 (in-memory, sem banco) |
| Frontend | Vue 3 + TypeScript + Vite + Tailwind CSS |
| Infra | Docker Compose |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/SergioPacheco/imovue.git
cd imovue

# 2. Baixe os CSVs manualmente do site da CAIXA e coloque em:
mkdir -p data/listas
# Exemplo: data/listas/Lista_imoveis_SP.csv

# 3. Suba com Docker
docker compose up -d --build

# 4. Acesse
# Frontend: http://localhost:3000
# API:      http://localhost:8080/api
```

## Estrutura

```
imovue/
├── backend/                  Spring Boot (Java 17)
│   └── src/main/java/br/com/imovue/
│       ├── catalog/          API de listagem e filtros
│       ├── importer/         Parser CSV
│       ├── admin/            Upload e gerenciamento
│       ├── config/           CORS
│       └── shared/           Exception handler
├── frontend/                 Vue 3 + Tailwind
│   └── src/
│       ├── pages/            Home, Listagem, Detalhe, Dashboard, Guia, Admin
│       ├── components/       PropertyImage
│       ├── composables/      useFavoritos
│       └── services/         API client
├── data/listas/              CSVs (não versionados)
├── docker-compose.yml
└── .kiro/                    KiroRails steering docs
```

## Screenshots

| Home | Listagem | Detalhe | Dashboard |
|------|----------|---------|-----------|
| Seleção de estado | Cards com fotos e filtros | Layout premium com sidebar | Estatísticas e top descontos |

## Como funciona

1. O admin baixa os CSVs do [site da CAIXA](https://venda-imoveis.caixa.gov.br) manualmente
2. Os CSVs ficam em `data/listas/`
3. O backend carrega o CSV do estado selecionado em memória
4. O frontend consome a API REST com filtros dinâmicos
5. Fotos são carregadas diretamente do CDN da CAIXA

## API

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/ufs` | Estados com CSV disponível |
| `POST /api/carregar?uf=SP` | Carrega estado |
| `GET /api/imoveis?tipoImovel=Casa&descontoMin=40` | Listagem com filtros |
| `GET /api/imoveis/{numero}` | Detalhe do imóvel |
| `GET /api/dashboard` | Estatísticas completas |
| `GET /api/filtros/cidades` | Cidades disponíveis |
| `GET /api/filtros/tipos` | Tipos de imóvel |

## Licença

MIT
