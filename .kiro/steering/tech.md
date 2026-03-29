---
description: Tech stack — language, frameworks, database, build, deployment
inclusion: always
---

# Tech Steering

## Language and runtime
- Backend: Java 11
- Frontend: TypeScript 5.x

## Frameworks
### Backend
- Spring Boot
- Spring Data JPA com Specification para filtros dinâmicos
- Spring Scheduler (`@Scheduled`) para agendamento

### Frontend
- Vue 3
- Vite
- Vue Router
- Pinia
- Axios
- Tailwind CSS ou Vuetify

## Database
- PostgreSQL 13+
- Migrations: Flyway ou Liquibase
- All DDL changes go through migration scripts, never manual ALTER in production

## Libraries
### Backend
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `spring-boot-starter-actuator`
- `postgresql`
- `flyway-core` ou `liquibase-core`
- `commons-csv` ou `opencsv` para parsing CSV
- `springdoc-openapi-ui` para documentação

### Frontend
- `@vueuse/core`
- `vitest`
- `@testing-library/vue`

## Build and packaging
- Backend: Maven
- Frontend: npm/pnpm com Vite
- Pin all dependency versions explicitly
- CI builds must be reproducible

## Deployment
- CI/CD pipeline with environments: dev → staging → production
- Profiles: `dev`, `test`, `prod`
- Rollback strategy documented for every release
- Health check endpoint available via Actuator

## Monitoring
- Structured logging with correlation IDs
- Health check endpoint (`/actuator/health`)
- Métricas básicas por execução de importação
- Alerting on error rate spikes and latency degradation
