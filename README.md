# Imovue

Plataforma para buscar e filtrar imóveis de leilão da CAIXA. Frontend 100% estático (Vue 3 + JSONs pré-gerados), sem backend.

🔗 **https://imovue.com.br**

## Arquitetura

```
tools/download_caixa.py  →  tools/csv_to_json.py  →  tools/geocode.py  →  frontend/public/data/
     (Playwright)              (normaliza)              (lat/lng IBGE)        (JSONs estáticos)
```

O frontend consome JSONs estáticos. Toda lógica de filtros, paginação e sort é client-side.

## Setup local

```bash
# Frontend
cd frontend
npm install
npm run dev

# Atualizar dados (requer CSVs em data/listas/)
pip install -r requirements.txt
playwright install chromium
python tools/download_caixa.py
python tools/csv_to_json.py
python tools/geocode.py
```

## Scripts (tools/)

| Script | Função |
|--------|--------|
| `download_caixa.py` | Baixa CSVs do site da CAIXA via Playwright |
| `csv_to_json.py` | Converte CSVs → JSONs (normaliza endereços, calcula desconto) |
| `geocode.py` | Adiciona lat/lng usando tabela de municípios IBGE |
| `validate_data.py` | Valida JSONs antes de commit (evita dados corrompidos) |

## Deploy

- **Hosting**: Cloudflare Pages (root: `frontend`, build: `npm run build`, output: `dist`)
- **Atualização de dados**: GitHub Actions semanal (`update-data.yml`)

## Stack

- **Frontend**: Vue 3, Vite, Tailwind CSS, Pinia, Leaflet
- **Tools**: Python 3.10+, Playwright
- **CI/CD**: GitHub Actions
- **Hosting**: Cloudflare Pages

## Licença

MIT
