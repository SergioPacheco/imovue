# Imovue

Plataforma independente para buscar e analisar imóveis públicos da CAIXA. O catálogo inclui imóveis em modalidades como Venda Online, Venda Direta, Licitação e Leilão. O frontend é 100% estático (Vue 3 + JSONs pré-gerados), sem backend.

🔗 **https://imovue.com.br**

## Arquitetura

```
tools/download_caixa.py  →  tools/csv_to_json.py  →  tools/geocode.py  →  frontend/public/data/
     (Playwright)              (normaliza)            (lat/lng IBGE)       (JSONs estáticos)
```

O publicador social usa os JSONs atuais para selecionar oportunidades e gerar cards por UF. Consulte [`docs/SOCIAL_PUBLISHER.md`](docs/SOCIAL_PUBLISHER.md) para os modos manual, dry-run, configuração de páginas e publicação no Facebook.

O frontend consome JSONs estáticos. Toda lógica de filtros, paginação e sort é client-side.

## Setup local

```bash
# Frontend
cd frontend
npm install
npm run dev

# Atualizar dados — execute os comandos abaixo na raiz do projeto
cd ..
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
python tools/download_caixa.py
python tools/csv_to_json.py
python tools/geocode.py
python tools/validate_data.py
```

**Nota:** Em sistemas com Python gerenciado pelo SO (externally-managed-environment), use o virtual environment acima. Não use `sudo pip install`.

## Scripts (tools/)

| Script | Função |
|--------|--------|
| `download_caixa.py` | Baixa CSVs do site da CAIXA via Playwright |
| `csv_to_json.py` | Converte CSVs → JSONs (normaliza endereços, calcula desconto) |
| `geocode.py` | Adiciona lat/lng usando tabela de municípios IBGE |
| `validate_data.py` | Valida JSONs antes de commit (evita dados corrompidos) |
| `social/post_daily.py` | Seleciona imóveis, gera posts/cards e publica páginas configuradas |

## Workflows automáticos

### Atualização dos dados

O workflow `.github/workflows/update-data.yml` executa semanalmente às **09:00 UTC (06:00 em Brasília)** e também pode ser iniciado manualmente pelo GitHub Actions.

Ele:

1. baixa as listas públicas da CAIXA;
2. converte os CSVs em JSONs por UF;
3. adiciona geolocalização;
4. valida os dados;
5. faz commit e push dos JSONs atualizados para o branch `main`.

Os CSVs brutos permanecem ignorados. O frontend e o publicador social leem os JSONs versionados em `frontend/public/data/`.

### Publicações sociais diárias

Atualmente, a publicação automática é feita somente no Facebook. O workflow `.github/workflows/facebook-daily.yml` executa diariamente às **13:30 UTC (10:30 em Brasília)** e também pode ser iniciado manualmente. Os cards gerados podem ser reutilizados manualmente em outras redes; não há publicação automática no Instagram, LinkedIn ou X neste momento.

Atualmente ele publica na página nacional **Imovue Brasil**, usando:

```bash
python tools/social/post_daily.py --uf BR --publish
```

Quando as páginas estaduais estiverem configuradas, o comando poderá ser alterado para:

```bash
python tools/social/post_daily.py --all --publish
```

O `--all` processa todas as UFs, mas só publica nas páginas que estiverem com `enabled: true`, `pageId` preenchido e token disponível em `social/facebook_pages.json`.

#### O que cada post diário contém

Para cada UF com candidato elegível, o sistema:

- seleciona uma oportunidade com preço, cidade, número do imóvel e desconto mínimo de 25%;
- evita imóveis publicados nos últimos 60 dias;
- calcula um score usando desconto, financiamento, preço por m², completude dos dados e imagem disponível;
- gera um card PNG de 1200×630 pixels;
- cria uma legenda com estado, tipo do imóvel, cidade, bairro, preço, avaliação, desconto, financiamento, área e modalidade;
- inclui um link rastreável para a página interna do imóvel no Imovue;
- inclui o aviso para consultar edital e condições diretamente na CAIXA;
- adiciona hashtags como `#ImoveisCaixa`, `#SP`, `#ImoveisComDesconto` e `#Imovue`.

O link publicado tem este formato:

```text
https://imovue.com.br/imovel/NUMERO?utm_source=facebook&utm_medium=social&utm_campaign=uf_daily&utm_content=NUMERO
```

Essa página interna apresenta os dados analisados e contém o link `urlOficial` para a página correspondente da CAIXA. O Facebook pode exibir o endereço abreviado com `...`; essa abreviação visual não faz parte da URL.

Após uma publicação bem-sucedida, a Action grava o imóvel, a UF, a página, o `post_id`, a data e a URL em `social/published.json`, e faz commit desse histórico no GitHub. O token nunca é gravado no repositório.

O publicador bloqueia datasets com mais de 72 horas, mas não baixa os dados nem dispara o deploy do frontend. A sequência recomendada é: atualizar dados, aguardar o deploy do Cloudflare Pages, verificar a URL do imóvel em produção e só então publicar nas redes sociais.

### Configuração das páginas estaduais

Cada estado deve ter uma página do Facebook com o padrão `Imovue Nome do Estado`. O cadastro técnico é feito em `social/facebook_pages.json`:

```json
"SP": {
  "enabled": true,
  "pageId": "ID_NUMERICO_DA_PAGINA",
  "name": "Imovue São Paulo"
}
```

Cada página precisa de um Page Access Token próprio no GitHub Actions, por exemplo:

```text
META_PAGE_TOKEN_SP
META_PAGE_TOKEN_RJ
META_PAGE_TOKEN_SC
```

Não coloque tokens, App Secret ou User Access Tokens no código. Um único app Meta pode administrar várias páginas, desde que a conta tenha acesso às páginas e as permissões necessárias para publicação.

Antes de ativar uma nova UF:

1. crie a página e obtenha o ID numérico;
2. configure o `pageId` e mantenha `enabled: false`;
3. salve o token como secret no GitHub;
4. gere o post com `--generate-only` e confira o texto e o card;
5. confirme que o imóvel escolhido já existe no site publicado;
6. faça um teste isolado com `--uf UF --publish`;
7. somente depois altere o workflow para `--all --publish`.

Nem toda UF publica todos os dias: se não houver candidato elegível, o sistema registra a UF como não publicada.

## Deploy

- **Hosting**: Cloudflare Pages (root: `frontend`, build: `npm run build`, output: `dist`)
- **Deploy**: acionado pelo push no branch `main` conforme a configuração do Cloudflare Pages
- **Atualização de dados**: GitHub Actions semanal (`update-data.yml`)
- **Publicação social**: GitHub Actions diária (`facebook-daily.yml`)

## Stack

- **Frontend**: Vue 3, Vite, Tailwind CSS, Pinia, Leaflet
- **Tools**: Python 3.10+, Playwright
- **CI/CD**: GitHub Actions
- **Hosting**: Cloudflare Pages

## Licença

MIT
