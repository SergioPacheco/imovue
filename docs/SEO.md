# SEO técnico do Imovue

## Arquitetura

O Imovue continua sendo uma SPA Vue 3 com Vue Router. O build do Vite é seguido por `frontend/scripts/prerender.js`, que lê os JSONs locais e cria HTML determinístico nas rotas públicas. Não há detecção de Googlebot, navegador automatizado ou requisições externas durante o prerender.

Como o hosting é Cloudflare Pages e as canonicals não usam barra final, uma rota como `/estado/sp` é gravada como `dist/estado/sp.html`; o Pages serve arquivos `.html` sem extensão no caminho da URL. Isso evita que o fallback da SPA devolva o `index.html` da home para uma URL SEO.

As regras de title, description, canonical, robots, Open Graph, Twitter Cards e JSON-LD ficam em `frontend/src/seo/seo.js`. O Vue usa essas funções por meio de `useSeoHead.ts`, e o prerender usa as mesmas funções antes de escrever o HTML.

## Rotas geradas

O build gera HTML para `/`, `/imoveis`, estados, todas as cidades atuais, todos os imóveis presentes nos JSONs, `/guias` e seus artigos, além das páginas institucionais e legais. `/dashboard`, `/mapa` e `/favoritos` recebem `noindex,follow`; `404.html` também recebe `noindex,follow`.

Cidades com menos de três imóveis continuam acessíveis, mas recebem `noindex,follow` e não entram no sitemap. Imóveis removidos deixam de ser gerados; no Cloudflare Pages, `404.html` deve resultar em status 404 para uma URL inexistente.

## SEO e conteúdo

Cada HTML gerado contém um único `<title>`, description, robots, canonical, Open Graph, Twitter Card, H1 e conteúdo textual inicial. Estados, cidades e imóveis usam somente estatísticas e campos dos JSONs.

- Home: `Organization` e `WebSite`.
- Guias: `Article`, `BreadcrumbList` e FAQ somente quando já existe FAQ visível.
- Estado/cidade: `WebPage` e `BreadcrumbList`.
- Imóvel: `WebPage` e `BreadcrumbList`; não usa `Product`, `Offer`, rating ou disponibilidade inventada.

## Canonical, filtros e sitemap

O canonical remove query parameters. `/imoveis` é a única versão indexável da listagem; filtros e paginação recebem `noindex,follow` quando o Vue assume a página, apontam canonical para `/imoveis` e são desincentivados em `frontend/public/robots.txt`.

`frontend/scripts/generate-sitemap.js` inclui somente URLs indexáveis e atuais: não inclui legais `noindex`, cidades com menos de três imóveis, rotas antigas ou imóveis ausentes. Os sitemaps têm no máximo 5.000 URLs por arquivo. `lastmod` só é escrito quando há data de conteúdo confiável, atualmente nos artigos.

## Robots e redirects

`frontend/public/robots.txt` mantém abertas folhas de estilo, JavaScript e imagens, e bloqueia dados JSON, funcionalidades internas e combinações conhecidas de filtros. `frontend/public/_redirects` mantém redirects de rotas antigas de guias e `/imoveis/:numero`.

## Comandos

Na pasta `frontend`:

```bash
npm install
npm run build
npm run seo:check
npm run preview
```

`npm run build` executa Vite, prerender e sitemap. `npm run seo:check` percorre todos os HTMLs em `dist` e verifica title, description, canonical único, robots, H1, JSON-LD, Open Graph, Twitter Cards, conteúdo mínimo e duplicidades críticas.

Exemplo de inspeção sem JavaScript:

```bash
grep '<title>' dist/estado/sp.html
grep 'canonical' dist/estado/sp.html
grep '<h1' dist/estado/sp.html
```

## Como incluir uma nova página SEO

1. Adicione uma função pura em `frontend/src/seo/seo.js` retornando o formato compartilhado.
2. Use a função no componente Vue com `useSeoHead`.
3. Adicione a rota ao `frontend/scripts/prerender.js`, com conteúdo inicial e links rastreáveis.
4. Inclua a URL no `frontend/scripts/generate-sitemap.js` somente se ela for indexável.
5. Adicione a página ao `seo:check` se for uma amostra importante.

Para um novo JSON-LD, confirme que a propriedade existe no conteúdo visível e nos dados. Adicione o gerador ao módulo compartilhado; não coloque schema diretamente no prerender ou em um componente isolado.

## Escala e hospedagem

O dataset atual gera 25.023 páginas de imóveis, 1.280 páginas de cidades e 30 guias em poucos segundos, sem abrir Chromium. A saída observada é aproximadamente 228 MB no disco (cerca de 170 MB de conteúdo bruto) e 26.375 HTMLs porque cada clean URL precisa de um arquivo HTML no Cloudflare Pages.

Isso ultrapassa o limite de 20.000 arquivos do plano Free do Cloudflare Pages. Para manter a cobertura completa, o projeto precisa ser publicado em um plano pago com `PAGES_WRANGLER_MAJOR_VERSION=4` configurado nas variáveis de ambiente do projeto (o limite passa a 100.000 arquivos). O `seo:check` emite um alerta desse cenário e falha se `PAGES_FREE_PLAN=1` for definido no ambiente de CI.

Se não for possível usar o plano pago, a alternativa é manter estados, cidades, guias e imóveis prioritários no prerender e mover os demais detalhes para uma Pages Function/Worker que devolva HTML determinístico, ou reduzir a lista indexável por critérios editoriais. Essa troca depende da infraestrutura e não é ativada automaticamente para não retirar o SEO inicial das URLs atuais.

## Pós-deploy

Depois de publicar esta refatoração:

1. Confirme que `https://imovue.com.br/` entrega o novo title, description e o H1 prerenderizado (o domínio público ainda pode permanecer em cache até o novo deploy).
2. Confirme que uma URL inexistente retorna HTTP 404, e que uma rota antiga como `/imoveis/123` retorna 301 para `/imovel/123`.
3. No Google Search Console, envie `https://imovue.com.br/sitemap.xml`, inspecione a home, uma página de estado, uma cidade e um imóvel, e solicite nova indexação.
4. Acompanhe por 2 a 4 semanas as categorias “Descoberta”, “Rastreamento” e “Indexação”. O comando `site:imovue.com.br` é apenas uma verificação pública aproximada e não substitui os dados do Search Console.
