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

Não há trava de frescor: a idade do dataset é apenas informativa no log. As flags `--max-data-age-hours` e `--allow-stale` permanecem por compatibilidade mas não bloqueiam mais a publicação.

## Seleção e ranking

São eliminados imóveis sem preço, desconto, cidade ou número, com desconto abaixo de 25% e imóveis registrados no histórico nos últimos 60 dias. O score de 0 a 100 combina desconto, financiamento, comparação de preço/m² com a mediana do bairro no catálogo, completude dos dados e imagem própria disponível.

A escolha final é um sorteio ponderado pelo score dentro do top-N (`--top-n`, padrão 20; `--top-n 1` reproduz o antigo top-1 determinístico). `--seed` permite sorteio reprodutível. A anti-repetição (`--no-repeat-city-days`, padrão 14, `0` desativa) penaliza candidatos cuja cidade (peso ×0,2) ou UF do imóvel (peso ×0,5) apareceu em publicações recentes, sem excluí-los. Novos registros em `published.json` guardam `cidade` e `uf_imovel` para isso; registros antigos têm a localização resolvida via catálogo quando possível.

O sistema não afirma que um imóvel está abaixo do mercado. A mediana é apenas dos imóveis presentes no catálogo atual do Imovue.

## Configuração Facebook

Edite `social/facebook_pages.json` apenas com nomes, IDs e habilitação. Não coloque tokens nesse arquivo. O token fica no Secret do GitHub:

```text
FB_SYSTEM_USER_TOKEN=TOKEN_DO_SYSTEM_USER
```

É um único token de System User (Meta Business, sem expiração) com acesso a
todas as páginas. Para testes locais, copie `.env.example` para `.env` e
preencha o token. O arquivo `.env` é ignorado pelo Git; variáveis já
exportadas no ambiente têm precedência.

Nenhum outro token é aceito: o código lê exclusivamente `FB_SYSTEM_USER_TOKEN`.
Não crie `META_PAGE_TOKEN_<UF>`, `PAGE_TOKENS` ou similares — em nenhum
ambiente, arquivo, secret ou log. É 1 secret só.

Na nova experiência de Páginas, os endpoints de leitura/publicação exigem o
Page Access Token de cada página. A troca é automática em tempo de execução
(`resolve_page_tokens` em `tools/social/config.py`): o publicador chama
`GET /me/accounts` com o system token e usa o page token de cada página —
tudo só em memória, sem gravar tokens em disco, log ou repositório. Se a
troca voltar vazia, o código usa o token configurado e a UF é ignorada sem
erro. Pré-requisito: as páginas precisam estar nos ativos do System User no
Meta Business.

O token nunca é impresso no log. A versão da Graph API pode ser definida em `META_GRAPH_VERSION`; o código usa `v23.0` como padrão. A publicação usa `/{page_id}/photos`, enviando o card gerado e o texto como legenda.

Antes de ativar uma página, valide manualmente:

```bash
FB_SYSTEM_USER_TOKEN='...' \
python tools/social/post_daily.py --uf SC --dry-run
```

Para a página nacional piloto, o repositório já está configurado com a página `BR` e o ID público informado. Adicione o token no Secret e execute `--uf BR --publish`; a Action diária usa esse modo e publica apenas uma oportunidade nacional por dia. Quando as páginas estaduais forem habilitadas, altere a Action para `--all --publish`.

## Estratégia de publicação (página nacional)

A grade é centralizada em `tools/social/config.py` (`SCHEDULES`); nenhuma lógica de horário fica espalhada no código. Horários sempre locais do Brasil (`IMOVUE_FACEBOOK_TIMEZONE`, padrão `America/Sao_Paulo` — nunca UTC/Spain/server para decisão).

| Posts/dia (`IMOVUE_FACEBOOK_POSTS_PER_DAY`) | Slots (BRT) |
|---|---|
| 2 | 11:30, 19:00 |
| 3 (padrão e fallback) | 10:00, 14:30, 19:30 |
| 4 | 09:30, 12:30, 16:30, 20:00 |

Valor ausente ou fora de {2,3,4} cai para 3. O workflow dispara em todos os slots possíveis (crons em UTC) e o script publica **no máximo 1 post por execução**, somente se "agora" estiver dentro do slot (tolerância de 50 min para atraso do runner). Repetição do mesmo slot no dia é ignorada por idempotência (`scheduled_for` já publicado).

- **Anti-duplicidade:** `IMOVUE_FACEBOOK_REPOST_AFTER_DAYS` (padrão 30) + verificação remota dos posts da página. Falha de API registra `status: error` e **não** marca o imóvel como publicado.
- **Variedade intra-dia:** sorteio ponderado no top-20 penaliza UF/cidade/bairro/tipo/faixa de preço já publicados hoje, além da anti-repetição de 14 dias por cidade/UF.
- **Copy:** abertura rotativa por slot (4 variantes, "alto desconto" só com desconto ≥40%), localização `Bairro – Cidade/UF`, estrutura fixa (venda, avaliação, desconto, área, quartos, modalidade) e 4–6 hashtags (`#ImoveisCaixa #ImoveisComDesconto #OportunidadeImobiliaria #Imovue` + cidade/estado sem acentos).
- **Registros:** cada tentativa grava `property_id, scheduled_for, published_at, timezone, post_id, url, status, error, template` — base pronta para futura análise de desempenho por horário e por tema (alcance, CTR etc., sem ML por ora).
- **Teste seguro:** `--dry-run` e `--generate-only` nunca tocam a API (tokens nem são carregados); `--slot HH:MM` força um slot para teste local.

## Histórico e Action

Após uma publicação bem-sucedida, `social/published.json` guarda UF, imóvel, cidade/UF do imóvel, página, `post_id`, data e URL rastreável. A Action também consulta posts recentes da página pela Graph API, de modo que uma repetição da execução não reutilize um imóvel já publicado.

## Limpeza de posts obsoletos

`tools/social/prune_stale.py` cruza o `published.json` com o catálogo atual e deleta da página (Graph API `DELETE /{post_id}`) os posts cujos imóveis saíram do catálogo. A entrada é mantida com `status: removed`, `removed_at` e `remove_detail` para auditoria. Preveja antes de aplicar:

```bash
python tools/social/prune_stale.py --dry-run   # só lista
python tools/social/prune_stale.py             # deleta de verdade
python tools/social/prune_stale.py --uf BR     # limita ao escopo BR
```

A Action diária (`facebook-daily.yml`) roda a limpeza automaticamente antes de publicar (com `continue-on-error`, sem bloquear a publicação) e persiste o histórico atualizado no mesmo commit.

O agendamento usa `13:30 UTC`, equivalente a 10:30 em Brasília no horário UTC−3. A atualização dos imóveis continua em workflow separado, semanalmente às segundas-feiras às 06:00 em Brasília. O publicador não dispara o downloader nem altera os dados; ele apenas lê o último dataset versionado. Não há bloqueio por idade do dataset — apenas um aviso informativo no log.

## Imagens

Os cards automáticos usam identidade própria e não dependem das fotografias temporárias da CAIXA. Cada UF gera dois arquivos: `UF.png` (feed 1080×1350, proporção 4:5 — é esta a imagem publicada no Facebook) e `UF_story.png` (story 1080×1920, 9:16, para reuso manual no Instagram).

Layout base (fundo `tools/social/assets/imovue-social-background-1080x1350.png`, com fallback em gradiente navy se o asset faltar): wordmark Imovue, pill "OFERTA CAIXA" (contorno âmbar, sem aparência de botão), tipo em caixa alta âmbar, cidade · UF em serifada grande (quebra em até 2 linhas e encolhe para nomes longos), bairro em cinza claro, painel branco com badge de desconto + preço + avaliação riscada, até 3 linhas factuais com ícones lineares (área, quartos, vagas — só quando existem no dataset) e rodapé editorial com filete âmbar (`Acesse imovue.com.br | {modalidade}`). Não há botão nem elemento clicável na arte, e nenhuma frase comercial é inventada — só atributos do dataset. As variantes manuais para Instagram estão descritas em [SOCIAL_IMAGES.md](SOCIAL_IMAGES.md).

## Temas dos anúncios (anti-monotonia)

Três temas com os mesmos componentes (`tools/social/templates.py`); fotos reais de imóveis não são usadas:

| Tema | Visual | Elegibilidade |
|---|---|---|
| `premium` | navy/âmbar atual | sempre |
| `claro` | fundo claro, texto navy | sempre |
| `desconto-hero` | desconto gigante como protagonista | só com desconto ≥ 40% |

A seleção é determinística (`hash(property_id + data)`, pesos 40/35/25) e evita repetir o tema do dia anterior na mesma UF. A legenda também varia o corpo (`detalhado`, `comparativo` com "De X por Y", `compacto` — estável por imóvel, tudo factual). O tema vai para o `published.json`, permitindo comparar performance por tema no futuro.

Pré-visualização antes de ativar (não publica, não grava histórico):

```bash
python tools/social/post_daily.py --uf SP --preview-templates --slot 10:00
```

Gera `{UF}_preview_{tema}.png` por tema elegível em `out/social/YYYY-MM-DD/`.
