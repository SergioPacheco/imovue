---
description: Tech stack — language, frameworks, build, deployment
inclusion: always
---

# Tech Steering

## Language and runtime
- Tools: Python 3.10+
- Frontend: TypeScript 5.x

## Frameworks
### Frontend
- Vue 3
- Vite
- Vue Router
- Pinia
- Tailwind CSS

### Tools (CI/offline)
- Python stdlib (csv, json, re)
- requests (para download dos CSVs)

## Libraries
### Frontend
- `@vueuse/core`
- `vitest`
- `@testing-library/vue`

## Build and packaging
- Frontend: npm com Vite
- Pin all dependency versions explicitly
- CI builds must be reproducible

## Deployment
- Frontend: site estático (Vercel / Netlify / GitHub Pages)
- Dados: JSONs estáticos em `frontend/public/data/`
- Atualização: GitHub Actions (schedule cron)

## CI/CD
- GitHub Actions workflow `update-data.yml`:
  - Schedule: cron (ex: diário às 6h)
  - Roda `tools/download_caixa.py` para baixar CSVs
  - Roda `tools/csv_to_json.py` para gerar JSONs
  - Commit automático se houver mudanças
  - Deploy disparado pelo push
