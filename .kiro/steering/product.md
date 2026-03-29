---
description: Product context — what this project is, who uses it, business rules
inclusion: always
---

# Product Steering

## Product name
Imovue

## Description
Aplicação web para listar e filtrar imóveis de leilão da CAIXA. O sistema importa CSVs baixados manualmente, persiste em banco próprio e expõe interface de consulta. **Não há interação automática com o site da CAIXA** — os CSVs são obtidos externamente e importados via dashboard administrativo.

## Key users
- **Usuário final**: busca e filtra imóveis por UF, cidade, preço, desconto, tipo
- **Administrador**: importa CSVs, acompanha status de importação, visualiza erros e estatísticas

## Dashboards
### Dashboard Usuário

#### Busca e Listagem
- Busca rápida por filtros
- Listagem paginada de imóveis
- Ordenação por desconto/preço
- Busca por endereço/CEP com autocomplete

#### Filtros Avançados
- UF, cidade, bairro
- Preço mínimo/máximo
- Desconto mínimo
- Área mínima/máxima
- Tipo (apartamento, casa, terreno, comercial)
- Aceita financiamento / FGTS
- Ocupado / Desocupado
- Quartos, vagas

#### Detalhe do Imóvel
- Dados completos com link oficial
- Botão compartilhar (gera link direto)
- Adicionar/remover dos favoritos

#### Favoritos (localStorage, sem login)
- Salvar imóveis para comparar depois
- Lista "Meus Favoritos"
- Exportar favoritos como PDF/CSV

#### Comparador
- Selecionar 2-4 imóveis
- Tabela lado a lado: preço, desconto, área, localização

#### Indicadores de Oportunidade
- Badge "🔥 Alto desconto" (>40%)
- Badge "📍 Região valorizada" (acima da média da cidade)
- Ranking: "Top 10 descontos"

#### Estatísticas Públicas
- Total de imóveis disponíveis
- Desconto médio geral
- Cidade com mais oportunidades

#### Mapa (Fase 2)
- Visualizar imóveis por cidade/bairro
- Clique no pin → card resumido

#### Histórico de Preço (Fase 2)
- Gráfico de variação entre importações
- Indicador "Preço caiu X% desde última atualização"

#### Alertas por Email (Fase 2)
- Cadastrar filtro para notificação
- Receber email quando surgir imóvel compatível

### Dashboard Admin
- Upload de CSVs por UF
- Importação manual para o banco
- Status da última importação
- Log de erros de parsing
- Estatísticas por UF (total de imóveis)

## Core constraints
- Zero tolerance for data loss — all operations must be transactional
- Importação idempotente — reexecução não gera duplicidade
- Nenhuma conexão automática com site da CAIXA
- CSVs são fonte externa, importados manualmente pelo admin

## Business rules
- `numero_imovel` é a chave funcional principal de deduplicação
- Campos monetários armazenados como `BigDecimal`, nunca floating point
- Cálculo de desconto: `((valor_avaliacao - preco_venda) / valor_avaliacao) * 100`
- Campos numéricos ausentes no CSV viram `null`, não causam falha geral
- Strings normalizadas com trim e espaços duplicados removidos
- Business logic lives in the service layer, never in controllers or repositories

## Out of scope
- Download automático de CSVs do site da CAIXA
- Qualquer interação com o portal oficial
- Autenticação de usuário final no MVP
- App mobile

## Roadmap

### MVP
- Filtros básicos e avançados
- Favoritos (localStorage)
- Compartilhamento com link
- Badges de oportunidade
- Estatísticas públicas
- Comparador de imóveis
- Busca por endereço/CEP

### Fase 2
- Mapa com pins
- Histórico de preço
- Alertas por email
