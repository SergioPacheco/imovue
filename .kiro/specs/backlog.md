# Backlog — Imovue

## Épico 1 — Fundamentos
- [ ] REQ-001: Criar projeto backend Spring Boot Java 11 com Maven
- [ ] REQ-002: Configurar PostgreSQL + Flyway
- [ ] REQ-003: Criar entidades JPA (imovel, coleta_execucao, coleta_item_erro)
- [ ] REQ-004: Criar migrations iniciais
- [ ] REQ-005: Criar projeto frontend Vue 3 + TypeScript + Vite

## Épico 2 — Importação
- [ ] REQ-006: Criar parser CSV (encoding latin1, separador ;)
- [ ] REQ-007: Criar serviço de importação com upsert idempotente
- [ ] REQ-008: Criar registro de execução e log de erros

## Épico 3 — API Catálogo (Dashboard Usuário)
- [ ] REQ-009: GET /api/imoveis — listagem paginada
- [ ] REQ-010: GET /api/imoveis — filtros dinâmicos (uf, cidade, preço, desconto, tipo)
- [ ] REQ-011: GET /api/imoveis/{numero} — detalhe
- [ ] REQ-012: GET /api/filtros — UFs, cidades, tipos disponíveis
- [ ] REQ-013: GET /api/estatisticas — total, desconto médio, top cidade

## Épico 4 — API Admin (Dashboard Admin)
- [ ] REQ-014: POST /api/admin/upload — upload de CSV
- [ ] REQ-015: POST /api/admin/importar — importar CSV para banco
- [ ] REQ-016: GET /api/admin/importacoes — histórico de importações
- [ ] REQ-017: GET /api/admin/importacoes/{id} — detalhe com erros

## Épico 5 — Frontend Usuário
- [ ] REQ-018: Página Home com busca rápida e estatísticas
- [ ] REQ-019: Página listagem com filtros avançados e paginação
- [ ] REQ-020: Página detalhe do imóvel
- [ ] REQ-021: Favoritos (localStorage)
- [ ] REQ-022: Comparador de imóveis
- [ ] REQ-023: Badges de oportunidade
- [ ] REQ-024: Compartilhamento com link

## Épico 6 — Frontend Admin
- [ ] REQ-025: Página upload e importação de CSVs
- [ ] REQ-026: Página estatísticas e histórico

## Fase 2
- [ ] REQ-027: Mapa com pins
- [ ] REQ-028: Histórico de preço
- [ ] REQ-029: Alertas por email
