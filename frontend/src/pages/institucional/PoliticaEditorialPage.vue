<template>
  <article class="max-w-3xl mx-auto px-4 py-8 prose prose-sm prose-gray">
    <h1>Política Editorial</h1>

    <h2>Como produzimos conteúdo</h2>
    <p>O conteúdo editorial do Imovue (guias, artigos, análises) é produzido internamente com base em:</p>
    <ul>
      <li>Legislação brasileira vigente (Código Civil, Lei 9.514/97, CPC, Lei de Registros Públicos)</li>
      <li>Regulamentação da Caixa Econômica Federal para venda de imóveis</li>
      <li>Dados reais extraídos do catálogo de imóveis</li>
      <li>Experiência prática do mercado de imóveis de leilão e venda direta</li>
    </ul>

    <h2>Princípios editoriais</h2>
    <ul>
      <li><strong>Precisão</strong> — não publicamos afirmações sem base em legislação ou dados verificáveis</li>
      <li><strong>Transparência</strong> — diferenciamos claramente dados oficiais de estimativas e opiniões</li>
      <li><strong>Utilidade</strong> — conteúdo voltado para a tomada de decisão informada pelo leitor</li>
      <li><strong>Atualização</strong> — artigos são revisados quando há mudança na legislação ou nos processos</li>
      <li><strong>Independência</strong> — não promovemos imóveis específicos e não recebemos comissão da Caixa</li>
    </ul>

    <h2>Revisão de dados</h2>
    <p>Os dados de imóveis passam por validação automatizada antes da publicação:</p>
    <ul>
      <li>Verificação de campos obrigatórios (número, preço, UF, cidade)</li>
      <li>Detecção de valores anômalos (descontos negativos ou superiores a 100%)</li>
      <li>Validação de coordenadas geográficas</li>
      <li>Remoção de registros duplicados</li>
    </ul>

    <h2>Erros e correções</h2>
    <p>Identificou um erro no conteúdo editorial ou nos dados? Envie para <strong>contato@imovue.com.br</strong> com:</p>
    <ul>
      <li>URL da página com o erro</li>
      <li>Descrição do problema</li>
      <li>Fonte correta (quando disponível)</li>
    </ul>
    <p>Correções em dados são aplicadas na próxima coleta semanal. Correções editoriais são avaliadas e publicadas em até 48 horas.</p>

    <h2>Conteúdo de terceiros</h2>
    <p>O Imovue pode exibir links para cursos, ferramentas ou serviços de terceiros. Quando isso ocorrer, será claramente identificado. Conteúdo patrocinado ou links de afiliados são sinalizados de forma visível.</p>

    <h2>Atualizações desta política</h2>
    <p>Esta política pode ser atualizada periodicamente. A data da última revisão consta no topo da página.</p>
    <p><em>Última atualização: junho de 2026</em></p>
  </article>
</template>

<script setup lang="ts">
import { useSeoHead } from '@/composables/useSeoHead'
useSeoHead({
  title: 'Política Editorial',
  description: 'Como o Imovue produz conteúdo, revisa dados, corrige erros e mantém independência editorial.',
})
</script>
