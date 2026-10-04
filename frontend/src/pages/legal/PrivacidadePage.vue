<template>
  <article class="max-w-3xl mx-auto px-4 py-8 prose prose-sm prose-gray">
    <h1>Política de Privacidade</h1>
    <p><em>Última atualização: 4 de outubro de 2026</em></p>
    <p>
      Esta Política de Privacidade explica como o <strong>Imovue</strong>
      (<a href="https://imovue.com.br">https://imovue.com.br</a>) trata dados de
      visitantes do site e quais dados são acessados pelo nosso aplicativo junto
      à Plataforma da Meta (Facebook) para publicação automática de oportunidades
      nas Páginas que administramos. Ela atende à Lei Geral de Proteção de Dados
      (Lei nº 13.709/2018 – LGPD) e aos requisitos da Plataforma Meta para
      aplicativos que utilizam a Graph API.
    </p>

    <h2>1. Quem somos (controlador)</h2>
    <ul>
      <li><strong>Responsável:</strong> Imovue — plataforma independente de pesquisa e análise de imóveis públicos da CAIXA</li>
      <li><strong>Site:</strong> <a href="https://imovue.com.br">https://imovue.com.br</a></li>
      <li><strong>Contato de privacidade:</strong> <strong>contato@imovue.com.br</strong></li>
      <li><strong>URL desta política:</strong> <a href="https://imovue.com.br/politica-de-privacidade">https://imovue.com.br/politica-de-privacidade</a></li>
    </ul>
    <p>O Imovue não é a Caixa Econômica Federal, não intermedia vendas e não possui vínculo oficial com a CAIXA.</p>

    <h2>2. O que o nosso app da Meta faz</h2>
    <p>
      Utilizamos um aplicativo próprio da Meta, de uso exclusivamente interno, para
      publicar automaticamente oportunidades do catálogo Imovue nas Páginas do
      Facebook que nós mesmos administramos, como a página nacional
      <strong>Imovue Brasil</strong> e páginas estaduais (por exemplo, Imovue São Paulo,
      Imovue Santa Catarina, Imovue Rio Grande do Sul, Imovue Paraná e Imovue Piauí).
    </p>
    <p>Cada publicação contém apenas conteúdo editorial próprio:</p>
    <ul>
      <li>card gerado pelo Imovue com dados públicos do imóvel (tipo, cidade, preço, desconto, modalidade);</li>
      <li>legenda com resumo da oportunidade e link rastreável para a página interna do imóvel no Imovue, no formato <code>https://imovue.com.br/imovel/NUMERO</code>;</li>
      <li>aviso para consultar edital e condições diretamente na CAIXA.</li>
    </ul>

    <h2>3. Quais dados do Facebook o app acessa e como usa</h2>
    <p><strong>O app não coleta, não armazena e não compartilha dados pessoais de usuários do Facebook.</strong> Especificamente:</p>
    <ul>
      <li><strong>Sem Facebook Login no site:</strong> o site Imovue não oferece “Entrar com Facebook” e não recebe perfil, e-mail, lista de amigos ou qualquer dado de quem visita as Páginas;</li>
      <li><strong>Sem leitura de audiência:</strong> não lemos curtidas, comentários, mensagens, dados demográficos ou comportamento de seguidores para perfilamento;</li>
      <li><strong>Acesso limitado às nossas próprias Páginas,</strong> apenas via Graph API, para 3 operações:
        <ul>
          <li><code>GET /{{'{'}}page-id{{'}'}}/posts</code> (campos <code>message,created_time</code>) — ler os posts publicados pela própria Página para evitar republicar o mesmo imóvel (anti-duplicidade);</li>
          <li><code>POST /{{'{'}}page-id{{'}'}}/photos</code> — publicar o card gerado com a legenda;</li>
          <li><code>DELETE /{{'{'}}post-id{{'}'}}</code> — remover posts de imóveis que saíram do catálogo (limpeza de ofertas obsoletas).</li>
        </ul>
      </li>
    </ul>
    <p>Permissões utilizadas pelo app, restritas às Páginas que administramos:</p>
    <ul>
      <li><code>pages_manage_posts</code> — publicar e gerenciar posts das nossas Páginas;</li>
      <li><code>pages_read_engagement</code> e <code>pages_show_list</code> — listar e ler posts das nossas Páginas para controle de duplicidade.</li>
    </ul>
    <p>
      Tokens de acesso às Páginas (Page Access Tokens) ficam armazenados exclusivamente como
      <em>secrets</em> no GitHub Actions, nunca no código-fonte. O histórico interno de
      publicação (<code>published.json</code>) guarda apenas dados operacionais próprios:
      número do imóvel, UF, página, <code>post_id</code>, data e URL publicada — nenhum dado
      pessoal de terceiros.
    </p>

    <h2>4. Dados que coletamos de visitantes do site</h2>
    <h3>Dados de navegação (automáticos)</h3>
    <ul>
      <li>Endereço IP (anonimizado quando possível)</li>
      <li>Tipo de navegador e sistema operacional</li>
      <li>Páginas visitadas e tempo de permanência</li>
      <li>URL de referência (de onde você veio)</li>
      <li>Dados de interação com o site (cliques, scroll)</li>
    </ul>

    <h3>Dados armazenados no navegador</h3>
    <ul>
      <li><strong>localStorage</strong> — salva imóveis favoritos e UF selecionada (apenas no seu dispositivo)</li>
      <li><strong>Cookies de terceiros</strong> — utilizados por serviços de analytics e publicidade (detalhados abaixo)</li>
    </ul>
    <p>Não operamos cadastro, não solicitamos CPF, e-mail ou telefone para navegar. Exibimos apenas dados comerciais de imóveis extraídos de listas públicas. Não coletamos, armazenamos ou processamos dados pessoais de proprietários, devedores ou terceiros.</p>

    <h2>5. Serviços de terceiros</h2>

    <h3>Meta Platforms (Facebook)</h3>
    <p>Além do app interno descrito na seção 3, as Páginas Imovue no Facebook são regidas pela <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener">Política de Privacidade da Meta</a>. Interações que você faz diretamente no Facebook (curtir, comentar, seguir) são tratadas pela Meta.</p>

    <h3>Google Tag Manager e Google Analytics</h3>
    <p>Utilizamos o Google Tag Manager (GTM-KCM8NP97) para gerenciar tags de analytics. O Google Analytics coleta dados anônimos de navegação para entender como o site é utilizado. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Política do Google</a>.</p>

    <h3>Google AdSense</h3>
    <p>O site utiliza o Google AdSense para exibir anúncios. O AdSense pode utilizar cookies e identificadores para personalizar anúncios com base nos seus interesses. Você pode:</p>
    <ul>
      <li>Optar por anúncios não personalizados através das <a href="https://adssettings.google.com" target="_blank" rel="noopener">configurações de anúncios do Google</a></li>
      <li>Gerenciar preferências via o painel de consentimento exibido no site</li>
      <li>Consultar como o Google usa dados em <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">políticas de parceiros</a></li>
    </ul>

    <h3>Cloudflare</h3>
    <p>O site é hospedado e protegido pela Cloudflare, que pode registrar logs de acesso conforme sua <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">política de privacidade</a>.</p>

    <h3>OpenStreetMap</h3>
    <p>O mapa interativo carrega tiles diretamente dos servidores do OpenStreetMap. Ao utilizar o mapa, seu navegador faz requisições a esses servidores.</p>

    <h2>6. Cookies</h2>
    <table>
      <thead><tr><th>Tipo</th><th>Finalidade</th><th>Duração</th></tr></thead>
      <tbody>
        <tr><td>Estritamente necessários</td><td>Funcionamento do site (preferências locais)</td><td>Persistente (localStorage)</td></tr>
        <tr><td>Analíticos</td><td>Google Analytics — métricas de uso</td><td>Até 2 anos</td></tr>
        <tr><td>Publicidade</td><td>Google AdSense — personalização de anúncios</td><td>Variável</td></tr>
      </tbody>
    </table>

    <h2>7. Publicidade personalizada e consentimento</h2>
    <p>O Google AdSense pode exibir anúncios personalizados (baseados no histórico de navegação) ou não personalizados (baseados apenas no conteúdo da página). Para visitantes do Espaço Econômico Europeu, Reino Unido e Suíça, o site apresenta mecanismo de consentimento (CMP) compatível com o TCF 2.0 do IAB antes de ativar cookies de publicidade ou analytics. Você pode alterar suas preferências a qualquer momento.</p>

    <h2>8. Base legal (LGPD)</h2>
    <ul>
      <li><strong>Dados de navegação agregados e segurança:</strong> legítimo interesse em operar um site seguro e funcional (art. 7º, IX);</li>
      <li><strong>Analytics e publicidade personalizada:</strong> consentimento via painel/CMP (art. 7º, I), revogável a qualquer momento;</li>
      <li><strong>Publicação nas nossas Páginas do Facebook:</strong> legítimo interesse em divulgar conteúdo editorial próprio, sem tratamento de dados pessoais de terceiros.</li>
    </ul>
    <p>Não vendemos dados pessoais e não compartilhamos dados com corretores, anunciantes ou terceiros além dos processadores listados na seção 5.</p>

    <h2>9. Retenção e segurança</h2>
    <ul>
      <li>Site servido exclusivamente via HTTPS; não mantemos banco de dados próprio com dados pessoais de visitantes;</li>
      <li>Logs de acesso e métricas seguem as políticas de retenção da Cloudflare e do Google;</li>
      <li>Tokens da Meta ficam em cofre de segredos (GitHub Secrets), com acesso restrito, e nunca são publicados no repositório;</li>
      <li>Histórico de publicações contém apenas identificadores operacionais (<code>post_id</code>, número do imóvel, data, URL).</li>
    </ul>

    <h2>10. Seus direitos (LGPD)</h2>
    <p>Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação e revogação de consentimento. Para exercer qualquer direito, escreva para <strong>contato@imovue.com.br</strong> informando o pedido. Respondemos em até 15 dias.</p>

    <h2>11. Exclusão de dados (incluindo exigência da Meta)</h2>
    <p>Como nosso app não armazena dados pessoais de usuários do Facebook, em regra não há nada a excluir. Se, por qualquer motivo, você entende que algum dado seu foi tratado por nós (por exemplo, via contato por e-mail), solicite a exclusão assim:</p>
    <ol>
      <li>Envie um e-mail para <strong>contato@imovue.com.br</strong> com o assunto “Exclusão de dados”;</li>
      <li>Informe no corpo: (a) qual dado ou mensagem deseja excluir e (b) onde ele está (ex.: e-mail enviado em tal data);</li>
      <li>Apagaremos o dado aplicável e confirmaremos por e-mail, salvo hipótese legal de retenção, que será justificada.</li>
    </ol>
    <p>Dados tratados diretamente pela Meta (curtidas, comentários e mensagens no Facebook) devem ser gerenciados na sua conta do Facebook, conforme a <a href="https://www.facebook.com/help/224562897555674" target="_blank" rel="noopener">central de ajuda da Meta</a>.</p>

    <h2>12. Menores de idade</h2>
    <p>O site não é direcionado a menores de 18 anos. Não coletamos intencionalmente dados de crianças ou adolescentes.</p>

    <h2>13. Alterações desta política</h2>
    <p>Esta política pode ser atualizada para refletir mudanças no site ou no app da Meta. A versão vigente estará sempre disponível em <a href="https://imovue.com.br/politica-de-privacidade">https://imovue.com.br/politica-de-privacidade</a>, com a data de atualização no topo. Alterações significativas serão comunicadas via aviso no site.</p>

    <h2>14. Contato</h2>
    <p>Para questões sobre privacidade ou sobre o app da Meta: <strong>contato@imovue.com.br</strong>.</p>
  </article>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useSeoHead, getInstitutionalSeo } from '@/composables/useSeoHead'
const route = useRoute()
useSeoHead(() => getInstitutionalSeo(route.path === '/privacidade' ? '/privacidade' : '/politica-de-privacidade'))
</script>
