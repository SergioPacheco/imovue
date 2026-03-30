---
description: Tech stack — language, frameworks, build, deployment
inclusion: always
---

# Tech Steering

## Language and runtime
- Backend: Java 17
- Frontend: TypeScript 5.x

## Frameworks
### Backend
- Spring Boot 3.2
- Armazenamento 100% in-memory (sem banco de dados)
- Dados carregados de CSVs para lista volátil em memória

### Frontend
- Vue 3
- Vite
- Vue Router
- Pinia
- Axios
- Tailwind CSS

## Libraries
### Backend
- `spring-boot-starter-web`
- `spring-boot-starter-actuator`
- `commons-csv` para parsing CSV
- `spring-boot-starter-test`

### Frontend
- `@vueuse/core`
- `vitest`
- `@testing-library/vue`

## Build and packaging
- Backend: Maven
- Frontend: npm com Vite
- Pin all dependency versions explicitly
- CI builds must be reproducible

## Deployment
- Docker Compose (backend + frontend)
- Backend: porta 8080
- Frontend: porta 3000 (nginx em prod, Vite em dev)
- Health check endpoint available via Actuator

## Monitoring
- Structured logging
- Health check endpoint (`/actuator/health`)
