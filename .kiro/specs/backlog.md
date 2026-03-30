# Backlog — Imovue

## Épico 1 — Fundamentos
- [x] REQ-001: Criar projeto backend Spring Boot Java 17 com Maven
- [x] REQ-002: Criar estrutura de pacotes (config, shared, importer, catalog, admin)
- [x] REQ-003: Criar Imovel record (domain model in-memory)
- [x] REQ-004: Criar projeto frontend Vue 3 + TypeScript + Vite

## Épico 2 — Importação
- [x] REQ-005: Criar parser CSV (encoding latin1, separador ;)
- [x] REQ-006: Criar InMemoryStore (serviço central de dados voláteis)
- [x] REQ-007: Criar endpoints admin (upload, carregar arquivo, status)

## Épico 3 — API Catálogo (Dashboard Usuário)
- [x] REQ-008: GET /api/imoveis — listagem paginada
- [x] REQ-009: GET /api/imoveis — filtros dinâmicos (cidade, preço, desconto, tipo)
- [x] REQ-010: GET /api/imoveis/{numero} — detalhe
- [x] REQ-011: GET /api/filtros — cidades, tipos disponíveis
- [x] REQ-012: GET /api/dashboard — estatísticas completas

## Épico 4 — Frontend Usuário
- [x] REQ-013: Página Home com seletor de UF
- [x] REQ-014: Página listagem com filtros avançados e paginação
- [x] REQ-015: Página detalhe do imóvel
- [x] REQ-016: Favoritos (localStorage)
- [x] REQ-017: Dashboard de estatísticas
- [ ] REQ-018: Comparador de imóveis
- [x] REQ-019: Badges de oportunidade (>40% desconto)
- [x] REQ-020: Compartilhamento com link (copiar link)

## Épico 5 — Frontend Admin
- [x] REQ-021: Página upload e importação de CSVs

## Épico 6 — Qualidade
- [ ] REQ-022: Testes unitários backend (parser, InMemoryStore)
- [ ] REQ-023: Testes de API (endpoints REST)
- [ ] REQ-024: Testes do frontend (componentes, pages)

## Fase 2
- [ ] REQ-025: Mapa com pins
- [ ] REQ-026: Histórico de preço
- [ ] REQ-027: Alertas por email
