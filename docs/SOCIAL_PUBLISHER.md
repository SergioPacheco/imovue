# Imovue Social Publisher

O publicador seleciona uma oportunidade por UF, gera texto e card PNG e pode publicar em uma página Facebook configurada. A seleção funciona sem Facebook, nos modos manual e dry-run.

## Comandos

Na raiz do repositório:

```bash
python3 -m venv .venv-social
source .venv-social/bin/activate
pip install -r requirements-social.txt

python tools/social/post_daily.py --uf SC --generate-only
python tools/social/post_daily.py --all --dry-run
python tools/social/post_daily.py --all --generate-only
```

Os arquivos são gravados em `out/social/YYYY-MM-DD/UF.txt` e `UF.png`. O diretório `out/` não entra no Git.

O modo `--publish` só publica quando a UF está habilitada, possui `pageId`, token e dataset com no máximo 72 horas. O limite pode ser conferido com `--max-data-age-hours`; `--allow-stale` existe apenas para exceções manuais.

## Seleção e ranking

São eliminados imóveis sem preço, desconto, cidade ou número, com desconto abaixo de 25% e imóveis registrados no histórico nos últimos 60 dias. O score de 0 a 100 combina desconto, financiamento, comparação de preço/m² com a mediana do bairro no catálogo, completude dos dados e imagem própria disponível.

O sistema não afirma que um imóvel está abaixo do mercado. A mediana é apenas dos imóveis presentes no catálogo atual do Imovue.

## Configuração Facebook

Edite `social/facebook_pages.json` apenas com nomes, IDs e habilitação. Não coloque tokens nesse arquivo. Os tokens ficam no Secret do GitHub:

Para a primeira página, use um secret individual:

```text
META_PAGE_TOKEN_BR=PAGE_ACCESS_TOKEN
```

O código também aceita `META_PAGE_TOKENS_JSON` para compatibilidade e para uma futura configuração centralizada, mas secrets individuais são preferíveis para reduzir o risco de exposição acidental em logs.

O token nunca é impresso no log. A versão da Graph API pode ser definida em `META_GRAPH_VERSION`; o código usa `v23.0` como padrão. A publicação usa `/{page_id}/photos`, enviando o card gerado e o texto como legenda.

Antes de ativar uma página, valide manualmente:

```bash
META_PAGE_TOKENS_JSON='{"SC":"..."}' \
python tools/social/post_daily.py --uf SC --dry-run
```

Para a página nacional piloto, o repositório já está configurado com a página `BR` e o ID público informado. Adicione o token no Secret e execute `--uf BR --publish`; a Action diária usa esse modo e publica apenas uma oportunidade nacional por dia. Quando as páginas estaduais forem habilitadas, altere a Action para `--all --publish`.

## Histórico e Action

Após uma publicação bem-sucedida, `social/published.json` guarda UF, imóvel, página, `post_id`, data e URL rastreável. A Action também consulta posts recentes da página pela Graph API, de modo que uma repetição da execução não reutilize um imóvel já publicado.

O agendamento usa `13:30 UTC`, equivalente a 10:30 em Brasília no horário UTC−3. A atualização dos imóveis continua em workflow separado, semanalmente às segundas-feiras às 06:00 em Brasília. O publicador não dispara o downloader nem altera os dados; ele apenas lê o último dataset versionado. A publicação bloqueia datasets mais antigos que 72 horas.

## Imagens

Os cards automáticos têm 1200×630 px, usam identidade própria e não dependem das fotografias temporárias da CAIXA. As variantes manuais para Instagram estão descritas em [SOCIAL_IMAGES.md](SOCIAL_IMAGES.md).
