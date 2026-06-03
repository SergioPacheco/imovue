<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-brand-900 via-brand-800 to-blue-900 text-white py-16 sm:py-24">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight">Aprenda antes de dar lance</h1>
        <p class="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">
          Imóveis com desconto chamam atenção, mas o comprador precisa saber analisar edital, ocupação, débitos, financiamento, comissão, prazos e documentação.
        </p>
        <a :href="AFFILIATE_CONFIG.courseUrl" target="_blank" rel="nofollow sponsored noopener"
          class="mt-8 inline-block bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
          Ver curso recomendado
        </a>
      </div>
    </section>

    <!-- Por que estudar -->
    <section v-reveal class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Por que estudar antes de comprar?</h2>
      <p class="text-gray-600 leading-relaxed">
        Comprar um imóvel de leilão ou venda direta pode ser uma boa oportunidade, mas também pode gerar prejuízo quando o comprador não entende as regras. O desconto anunciado não deve ser analisado sozinho.
      </p>
    </section>

    <!-- Principais riscos -->
    <section v-reveal="100" class="bg-gray-50 py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">Principais riscos</h2>
        <div class="space-y-6">
          <router-link v-for="risco in riscos" :key="risco.titulo" :to="risco.link"
            class="block bg-white rounded-xl p-5 border border-gray-200 hover:border-brand-200 hover:shadow-sm transition-all no-underline">
            <div class="flex items-start gap-3">
              <span class="text-2xl shrink-0">⚠️</span>
              <div>
                <h3 class="font-bold text-gray-900">{{ risco.titulo }}</h3>
                <p class="text-sm text-gray-600 mt-1 leading-relaxed">{{ risco.descricao }}</p>
                <p class="text-xs text-brand-600 mt-2 font-medium">💡 {{ risco.dica }}</p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- O que aprender -->
    <section v-reveal="200" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">O que você precisa aprender</h2>
      <ul class="space-y-3">
        <li v-for="item in aprendizados" :key="item" class="flex items-start gap-3">
          <span class="text-brand-500 mt-0.5">✓</span>
          <span class="text-gray-700">{{ item }}</span>
        </li>
      </ul>
    </section>

    <!-- CTA final -->
    <section v-reveal="300" class="bg-gradient-to-r from-brand-50 to-blue-50 py-16">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Quer aprender o passo a passo?</h2>
        <p class="mt-4 text-gray-600 max-w-xl mx-auto">
          Veja um treinamento recomendado para iniciantes que querem entender como funcionam imóveis da Caixa, leilões, editais e riscos antes de fazer uma proposta.
        </p>
        <a :href="AFFILIATE_CONFIG.courseUrl" target="_blank" rel="nofollow sponsored noopener"
          class="mt-8 inline-block bg-brand-500 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-brand-600 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          Ver treinamento recomendado
        </a>
      </div>
    </section>

    <!-- Avisos legais -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-xs text-gray-400 space-y-3">
        <p>O IMOVUE é uma plataforma independente de organização e visualização de informações. Não somos a Caixa, não representamos leiloeiros e não garantimos resultado financeiro. As compras devem ser feitas nos canais oficiais indicados no edital ou na página responsável pela venda.</p>
        <p>{{ AFFILIATE_CONFIG.disclosure }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { AFFILIATE_CONFIG } from '@/config/affiliate'

const riscos = [
  {
    titulo: 'Imóvel ocupado',
    descricao: 'O imóvel pode estar ocupado pelo antigo proprietário, inquilino ou terceiros. A desocupação é responsabilidade do comprador e pode levar meses ou até anos na Justiça, com custos advocatícios e risco de danos ao imóvel.',
    dica: 'Verifique no edital se o imóvel está "ocupado" ou "desocupado". Imóveis desocupados têm menos risco e geralmente permitem vistoria.',
    link: '/aprenda/imovel-ocupado',
  },
  {
    titulo: 'Débitos de condomínio',
    descricao: 'Dívidas de condomínio acompanham o imóvel (são obrigações "propter rem"), ou seja, o novo comprador herda todos os débitos anteriores. Em prédios, essa dívida pode ser de dezenas de milhares de reais.',
    dica: 'Antes de dar lance, consulte a administradora do condomínio para saber o valor total da dívida. Some ao custo real de aquisição.',
    link: '/aprenda/debitos-condominio',
  },
  {
    titulo: 'Débitos de IPTU',
    descricao: 'Assim como o condomínio, dívidas de IPTU acompanham o imóvel. A Prefeitura pode cobrar do novo proprietário os valores em aberto, inclusive com juros e multa.',
    dica: 'Consulte o site da Prefeitura com o número de inscrição do imóvel para verificar débitos. Alguns editais informam que a Caixa quita o IPTU — leia com atenção.',
    link: '/aprenda/debitos-iptu',
  },
  {
    titulo: 'Prazo curto para pagamento',
    descricao: 'Em modalidades como leilão, o pagamento do lance vencedor geralmente deve ser feito em 24 a 48 horas. Se você não tiver o valor aprovado previamente (financiamento ou à vista), perde o imóvel e pode sofrer penalidades.',
    dica: 'Se pretende financiar, tenha a carta de crédito pré-aprovada antes de participar. Para pagamento à vista, garanta liquidez imediata.',
    link: '/aprenda/prazo-pagamento',
  },
  {
    titulo: 'Imóvel sem visita interna',
    descricao: 'Na maioria dos casos, não é possível visitar o interior do imóvel antes da compra. Você compra "no estado em que se encontra", sem garantia de conservação, instalações ou acabamentos.',
    dica: 'Visite o exterior e a vizinhança. Converse com porteiros e vizinhos. Pesquise o valor de mercado da região para ter margem de segurança.',
    link: '/aprenda/sem-visita-interna',
  },
  {
    titulo: 'Edital com regras específicas',
    descricao: 'Cada imóvel tem um edital próprio com regras de pagamento, prazos, comissão do leiloeiro (geralmente 5%), condições de financiamento e penalidades. Ignorar o edital pode causar perda do lance e multas.',
    dica: 'Leia o edital COMPLETO antes de dar qualquer lance. Preste atenção em: forma de pagamento, prazo, comissão, ITBI e responsabilidade por débitos.',
    link: '/aprenda/edital-regras',
  },
  {
    titulo: 'Custos de cartório, ITBI e registro',
    descricao: 'Além do valor do imóvel, o comprador paga ITBI (2-3% do valor), custas de cartório para escritura e registro (variam por estado), e eventualmente comissão do leiloeiro (5%). Esses custos podem somar 10-15% do valor de compra.',
    dica: 'Some ao preço: ITBI (~3%) + cartório (~2%) + comissão leiloeiro (5%) + eventuais débitos. Esse é o custo real de aquisição.',
    link: '/aprenda/custos-cartorio-itbi',
  },
  {
    titulo: 'Financiamento não disponível',
    descricao: 'Nem todos os imóveis aceitam financiamento. Imóveis em leilão SFI geralmente exigem pagamento à vista ou em parcelas curtas. Apenas modalidades como "Venda Direta" costumam aceitar financiamento habitacional.',
    dica: 'Filtre por "Aceita financiamento: Sim" se precisar de crédito. No Imovue, esse filtro já está disponível.',
    link: '/aprenda/financiamento',
  },
]

const aprendizados = [
  'Como ler o edital',
  'Como verificar a situação de ocupação',
  'Como calcular o custo real',
  'Como comparar com o valor de mercado',
  'Como verificar se aceita financiamento',
  'Como identificar riscos jurídicos',
  'Como montar um checklist antes da proposta',
]
</script>
