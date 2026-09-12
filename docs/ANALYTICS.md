# Medição do Imovue

O container `GTM-KCM8NP97` já está instalado no site. O app publica eventos no `dataLayer`; as tags que enviam esses eventos para o GA4 ficam no Google Tag Manager.

## Eventos publicados pelo app

| Evento no dataLayer | Evento GA4 recomendado | Quando ocorre |
| --- | --- | --- |
| `imovue_virtual_page_view` | `page_view` | Navegação entre rotas da SPA |
| `imovue_search` | `search` | Busca inteligente enviada |
| `imovue_filter` | `filter_properties` | Filtro aplicado na listagem |
| `imovue_filter_reset` | `reset_filters` | Filtros limpos |
| `imovue_state_change` | `select_state` | Estado trocado na listagem |
| `imovue_pagination` | `paginate_listings` | Página seguinte/anterior |
| `imovue_property_view` | `view_property` | Detalhe de imóvel carregado |
| `imovue_official_click` | `click_caixa_official` | Clique no link oficial da CAIXA |

Os parâmetros enviados são dados de navegação e catálogo, como estado, cidade, tipo, preço, desconto e número do imóvel. Não são enviados nome, e-mail ou outros dados pessoais.

## Configuração no GTM

Para cada evento que deve aparecer no GA4:

1. Crie um acionador **Custom Event** com o nome do evento no dataLayer.
2. Crie uma tag **Google Analytics: GA4 Event** (ou o tipo equivalente disponível no container).
3. Informe o ID de medição do fluxo Web do Imovue.
4. Informe o nome GA4 da tabela acima.
5. Vincule a tag ao acionador correspondente.
6. Use **Preview** para testar e depois publique a versão.

Para `imovue_virtual_page_view`, envie também os parâmetros `page_path`, `page_location`, `page_title` e `page_referrer` usando variáveis de camada de dados com os mesmos nomes. O Google tag já envia o `page_view` inicial; essa tag adicional cobre apenas as mudanças de rota da SPA.

Teste em **Preview** uma busca, um filtro, a abertura de um imóvel e o clique em “Ver no site oficial”. Depois confirme os eventos em **GA4 → Realtime** e, quando disponíveis, em **Administração → Eventos**.
