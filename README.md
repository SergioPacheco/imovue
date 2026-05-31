# Imovue

Catálogo de imóveis de leilão da CAIXA. Site 100% estático hospedado no Cloudflare Pages.

## Arquitetura

```
tools/download_caixa.py  → baixa CSVs da Caixa (Playwright)
tools/csv_to_json.py     → converte CSVs → JSON por UF
frontend/public/data/    → JSONs estáticos servidos pelo site
frontend/               → Vue 3 + Vite + Tailwind (SPA)
```

## Stack

- **Frontend:** Vue 3, Vite, Tailwind CSS, Pinia, Vue Router
- **Dados:** JSON estático (sem backend, sem banco)
- **Pipeline:** Python + Playwright (download CSVs) → JSON
- **Hospedagem:** Cloudflare Pages (grátis)
- **CI:** GitHub Actions (atualização semanal automática)

## Desenvolvimento local

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

## Atualizar dados manualmente

```bash
# 1. Baixar CSVs (requer Playwright)
pip install playwright && playwright install chromium
python tools/download_caixa.py

# 2. Converter para JSON
python tools/csv_to_json.py

# 3. Commit e push (Cloudflare faz redeploy automático)
git add frontend/public/data/
git commit -m "chore: atualiza dados"
git push
```

## Deploy no Cloudflare Pages

1. Conecte o repositório GitHub ao Cloudflare Pages
2. Configure:
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Build output directory:** `frontend/dist`
3. Cada push na `main` faz deploy automático

## Atualização automática (GitHub Actions)

O workflow `.github/workflows/update-data.yml` roda toda segunda-feira:
1. Baixa CSVs de todos os 27 estados
2. Converte para JSON
3. Faz commit + push → Cloudflare redeploy

## Estrutura dos dados

Cada UF tem um arquivo `frontend/public/data/{UF}.json` com array de imóveis:

```json
[
  {
    "numeroImovel": "123456",
    "uf": "SP",
    "cidade": "SÃO PAULO",
    "bairro": "CENTRO",
    "endereco": "RUA X, 100",
    "precoVenda": 200000.00,
    "valorAvaliacao": 400000.00,
    "percentualDesconto": 50.0,
    "tipoImovel": "Apartamento",
    "quartos": 2,
    "vagas": 1
  }
]
```

O `manifest.json` lista todas as UFs com contagem de imóveis.
