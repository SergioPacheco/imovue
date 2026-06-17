<template>
  <article class="max-w-3xl mx-auto px-4 py-8 prose prose-sm prose-gray">
    <h1>Política de Privacidade</h1>
    <p><em>Última atualização: 17 de junho de 2026</em></p>

    <h2>1. Dados que coletamos</h2>
    <p>O Imovue coleta informações limitadas para garantir o funcionamento do site e a exibição de publicidade:</p>

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

    <h2>2. Serviços de terceiros</h2>

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

    <h2>3. Cookies</h2>
    <p>O site utiliza os seguintes tipos de cookies:</p>
    <table>
      <thead><tr><th>Tipo</th><th>Finalidade</th><th>Duração</th></tr></thead>
      <tbody>
        <tr><td>Estritamente necessários</td><td>Funcionamento do site (preferências locais)</td><td>Persistente (localStorage)</td></tr>
        <tr><td>Analíticos</td><td>Google Analytics — métricas de uso</td><td>Até 2 anos</td></tr>
        <tr><td>Publicidade</td><td>Google AdSense — personalização de anúncios</td><td>Variável</td></tr>
      </tbody>
    </table>

    <h2>4. Publicidade personalizada e não personalizada</h2>
    <p>O Google AdSense pode exibir anúncios personalizados (baseados no histórico de navegação) ou não personalizados (baseados apenas no conteúdo da página). A escolha está disponível no painel de consentimento.</p>

    <h2>5. Consentimento (EEE, Reino Unido e Suíça)</h2>
    <p>Para visitantes do Espaço Econômico Europeu, Reino Unido e Suíça, o site apresentará um mecanismo de consentimento (CMP) compatível com o TCF 2.0 do IAB antes de ativar cookies de publicidade ou analytics. Você pode alterar suas preferências a qualquer momento.</p>

    <h2>6. Dados de imóveis</h2>
    <p>Exibimos apenas dados comerciais de imóveis extraídos de listas públicas. Não coletamos, armazenamos ou processamos dados pessoais de proprietários, devedores ou terceiros.</p>

    <h2>7. Seus direitos (LGPD)</h2>
    <p>Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
    <ul>
      <li>Saber quais dados são coletados (esta página)</li>
      <li>Solicitar exclusão de dados pessoais eventualmente coletados</li>
      <li>Revogar consentimento para cookies não essenciais</li>
      <li>Solicitar portabilidade ou correção de dados</li>
    </ul>

    <h2>8. Segurança</h2>
    <p>O site é servido exclusivamente via HTTPS. Não armazenamos dados pessoais em banco de dados próprio. Dados de navegação são processados por serviços de terceiros com suas próprias medidas de segurança.</p>

    <h2>9. Menores de idade</h2>
    <p>O site não é direcionado a menores de 18 anos. Não coletamos intencionalmente dados de crianças ou adolescentes.</p>

    <h2>10. Alterações</h2>
    <p>Esta política pode ser atualizada. Alterações significativas serão comunicadas via aviso no site.</p>

    <h2>11. Contato</h2>
    <p>Para questões sobre privacidade: <strong>contato@imovue.com.br</strong></p>
  </article>
</template>

<script setup lang="ts">
import { useSeoHead } from '@/composables/useSeoHead'
useSeoHead({
  title: 'Política de Privacidade',
  description: 'Política de privacidade do Imovue: dados coletados, cookies, Google Analytics, AdSense, seus direitos pela LGPD e como gerenciar preferências.',
  robots: 'noindex,follow',
})
</script>
