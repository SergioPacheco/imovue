<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-brand-800 to-brand-900 text-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
        <h1 class="text-3xl sm:text-4xl font-extrabold">Guia do Comprador</h1>
        <p class="mt-3 text-blue-200 max-w-2xl mx-auto">Tudo o que você precisa saber para comprar um imóvel de leilão da CAIXA com segurança.</p>
      </div>
    </section>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Cards de navegação -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <router-link v-for="s in secoes" :key="s.id" :to="`/guia#${s.id}`" class="card p-6 group" @click="scrollTo(s.id)">
          <div class="text-3xl mb-3">{{ s.icon }}</div>
          <h3 class="font-bold text-gray-900 group-hover:text-brand-500 transition-colors">{{ s.title }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ s.desc }}</p>
        </router-link>
      </div>

      <!-- Conteúdo -->
      <div class="space-y-16">

        <!-- Modalidades -->
        <section id="modalidades">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">🏷️ Modalidades de Venda</h2>
          <div class="grid sm:grid-cols-3 gap-5">
            <div class="card p-5">
              <h3 class="font-bold text-brand-600 mb-2">Venda Direta Online</h3>
              <p class="text-sm text-gray-600">O imóvel tem preço fixo definido pela CAIXA. O primeiro interessado que formalizar a proposta e atender às condições leva o imóvel. Processo mais rápido e simples.</p>
            </div>
            <div class="card p-5">
              <h3 class="font-bold text-brand-600 mb-2">Venda Online (Licitação)</h3>
              <p class="text-sm text-gray-600">Funciona como um leilão online. Os interessados enviam propostas em envelope fechado (digital) e vence a maior oferta acima do valor mínimo.</p>
            </div>
            <div class="card p-5">
              <h3 class="font-bold text-brand-600 mb-2">Licitação Aberta</h3>
              <p class="text-sm text-gray-600">Processo presencial ou híbrido com edital público. Geralmente para imóveis de maior valor ou lotes comerciais. Exige caução prévia.</p>
            </div>
          </div>
        </section>

        <!-- Como comprar -->
        <section id="como-comprar">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">📋 Como Comprar — Passo a Passo</h2>
          <div class="space-y-4">
            <div v-for="(step, i) in passos" :key="i" class="flex gap-4 items-start">
              <div class="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">{{ i + 1 }}</div>
              <div class="card p-4 flex-1">
                <h3 class="font-semibold text-gray-900">{{ step.title }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Pagamento -->
        <section id="pagamento">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">💳 Condições de Pagamento</h2>
          <div class="grid sm:grid-cols-3 gap-5">
            <div class="card p-5 border-l-4 border-l-brand-500">
              <h3 class="font-bold text-gray-900 mb-2">À Vista</h3>
              <p class="text-sm text-gray-600">Pagamento integral do valor. Geralmente oferece os maiores descontos. Prazo de pagamento após homologação varia conforme edital.</p>
            </div>
            <div class="card p-5 border-l-4 border-l-success-500">
              <h3 class="font-bold text-gray-900 mb-2">Financiamento CAIXA</h3>
              <p class="text-sm text-gray-600">Disponível para imóveis que aceitam financiamento (indicado no anúncio). Sujeito a análise de crédito e avaliação do imóvel. Taxas e prazos do SFH/SFI.</p>
            </div>
            <div class="card p-5 border-l-4 border-l-orange-500">
              <h3 class="font-bold text-gray-900 mb-2">FGTS</h3>
              <p class="text-sm text-gray-600">Pode ser usado como entrada ou para amortizar, desde que o imóvel atenda às regras do FGTS: residencial, até o teto do SFH, e o comprador não tenha outro imóvel na mesma cidade.</p>
            </div>
          </div>
        </section>

        <!-- Documentos -->
        <section id="documentos">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">📄 Documentos Necessários</h2>
          <div class="grid sm:grid-cols-2 gap-6">
            <div class="card p-5">
              <h3 class="font-bold text-gray-900 mb-3">Pessoa Física</h3>
              <ul class="space-y-2 text-sm text-gray-600">
                <li class="flex items-start gap-2"><span class="text-brand-500 mt-0.5">✓</span> RG e CPF (ou CNH)</li>
                <li class="flex items-start gap-2"><span class="text-brand-500 mt-0.5">✓</span> Comprovante de estado civil</li>
                <li class="flex items-start gap-2"><span class="text-brand-500 mt-0.5">✓</span> Comprovante de renda (se financiamento)</li>
                <li class="flex items-start gap-2"><span class="text-brand-500 mt-0.5">✓</span> Comprovante de residência</li>
                <li class="flex items-start gap-2"><span class="text-brand-500 mt-0.5">✓</span> Declaração de IR (se financiamento)</li>
                <li class="flex items-start gap-2"><span class="text-brand-500 mt-0.5">✓</span> Extrato do FGTS (se usar FGTS)</li>
              </ul>
            </div>
            <div class="card p-5">
              <h3 class="font-bold text-gray-900 mb-3">Pessoa Jurídica</h3>
              <ul class="space-y-2 text-sm text-gray-600">
                <li class="flex items-start gap-2"><span class="text-brand-500 mt-0.5">✓</span> Contrato social e alterações</li>
                <li class="flex items-start gap-2"><span class="text-brand-500 mt-0.5">✓</span> CNPJ</li>
                <li class="flex items-start gap-2"><span class="text-brand-500 mt-0.5">✓</span> Documentos dos sócios</li>
                <li class="flex items-start gap-2"><span class="text-brand-500 mt-0.5">✓</span> Balanço patrimonial</li>
                <li class="flex items-start gap-2"><span class="text-brand-500 mt-0.5">✓</span> Certidões negativas</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Cuidados -->
        <section id="cuidados">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">⚠️ Cuidados Antes de Comprar</h2>
          <div class="grid sm:grid-cols-2 gap-4">
            <div v-for="c in cuidados" :key="c.title" class="card p-5">
              <h3 class="font-semibold text-gray-900 mb-1">{{ c.title }}</h3>
              <p class="text-sm text-gray-600">{{ c.desc }}</p>
            </div>
          </div>
        </section>

        <!-- FAQ -->
        <section id="faq">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">❓ Perguntas Frequentes</h2>
          <div class="space-y-3">
            <details v-for="f in faq" :key="f.q" class="card group">
              <summary class="p-5 cursor-pointer font-semibold text-gray-900 hover:text-brand-500 transition-colors list-none flex justify-between items-center">
                {{ f.q }}
                <span class="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p class="px-5 pb-5 text-sm text-gray-600 -mt-2">{{ f.a }}</p>
            </details>
          </div>
        </section>

        <!-- CTA -->
        <div class="text-center py-8">
          <p class="text-gray-500 mb-4">Pronto para encontrar seu imóvel?</p>
          <router-link to="/" class="btn-primary text-lg px-8 py-3">Explorar imóveis →</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const secoes = [
  { id: 'modalidades', icon: '🏷️', title: 'Modalidades de Venda', desc: 'Venda Direta, Venda Online e Licitação' },
  { id: 'como-comprar', icon: '📋', title: 'Como Comprar', desc: 'Passo a passo do processo de compra' },
  { id: 'pagamento', icon: '💳', title: 'Condições de Pagamento', desc: 'À vista, financiamento e FGTS' },
  { id: 'documentos', icon: '📄', title: 'Documentos', desc: 'O que você precisa apresentar' },
  { id: 'cuidados', icon: '⚠️', title: 'Cuidados', desc: 'O que verificar antes de comprar' },
  { id: 'faq', icon: '❓', title: 'Perguntas Frequentes', desc: 'Dúvidas comuns respondidas' },
]

const passos = [
  { title: 'Pesquise o imóvel', desc: 'Use o Imovue para filtrar por estado, cidade, tipo, preço e desconto. Analise as fotos, localização e condições.' },
  { title: 'Visite o imóvel (se possível)', desc: 'Verifique o estado de conservação, vizinhança e acessos. Alguns imóveis podem estar ocupados — informe-se antes.' },
  { title: 'Leia o edital ou condições', desc: 'Cada imóvel tem condições específicas. Acesse o site oficial da CAIXA pelo link do imóvel e leia todas as regras.' },
  { title: 'Faça sua proposta', desc: 'Na Venda Direta, basta formalizar a compra. Na Venda Online, envie sua proposta dentro do prazo. Na Licitação, siga o edital.' },
  { title: 'Aguarde a homologação', desc: 'A CAIXA analisa as propostas e homologa o vencedor. Você será notificado sobre o resultado.' },
  { title: 'Providencie a documentação', desc: 'Apresente os documentos necessários e, se for financiar, passe pela análise de crédito.' },
  { title: 'Assine o contrato e pague', desc: 'Após aprovação, assine o contrato de compra e venda e efetue o pagamento conforme as condições acordadas.' },
  { title: 'Registre o imóvel', desc: 'Leve o contrato ao Cartório de Registro de Imóveis para transferir a propriedade para seu nome.' },
]

const cuidados = [
  { title: 'Verifique a ocupação', desc: 'Muitos imóveis estão ocupados. A desocupação pode ser demorada e gerar custos judiciais. Informe-se sobre a situação antes de comprar.' },
  { title: 'Consulte débitos do imóvel', desc: 'Verifique IPTU atrasado, condomínio em atraso e outras dívidas. Em alguns casos, o comprador assume esses débitos.' },
  { title: 'Analise a matrícula', desc: 'Solicite a matrícula atualizada no cartório para verificar se há ônus, penhoras ou restrições sobre o imóvel.' },
  { title: 'Calcule todos os custos', desc: 'Além do preço, considere: ITBI (imposto de transmissão), escritura, registro, eventuais reformas e débitos pendentes.' },
  { title: 'Visite a região', desc: 'Conheça o bairro, infraestrutura, transporte, comércio e segurança. Use o Google Maps para ter uma visão prévia.' },
  { title: 'Não confie apenas no desconto', desc: 'Um desconto alto pode indicar problemas: ocupação, localização ruim ou estado precário. Investigue antes de se empolgar.' },
]

const faq = [
  { q: 'Posso visitar o imóvel antes de comprar?', a: 'Depende da modalidade e da situação do imóvel. Imóveis desocupados geralmente permitem visita agendada. Imóveis ocupados podem não permitir acesso interno.' },
  { q: 'Posso usar FGTS para comprar?', a: 'Sim, desde que o imóvel aceite FGTS (indicado no anúncio), seja residencial, esteja dentro do teto do SFH e você atenda às regras do fundo.' },
  { q: 'O que acontece se o imóvel estiver ocupado?', a: 'A responsabilidade pela desocupação geralmente é do comprador. Pode ser necessário entrar com ação judicial, o que leva tempo e gera custos.' },
  { q: 'Quem paga o IPTU atrasado?', a: 'Varia conforme as condições do edital. Em muitos casos, débitos de IPTU e condomínio anteriores à venda são de responsabilidade do comprador.' },
  { q: 'Posso financiar o imóvel pela própria CAIXA?', a: 'Sim, para imóveis que aceitam financiamento. Você passa pela análise de crédito normal da CAIXA, com taxas e prazos do mercado.' },
  { q: 'Qual o prazo para pagamento após ganhar?', a: 'Varia conforme a modalidade. Geralmente entre 5 e 30 dias úteis após a homologação. Consulte as condições específicas do imóvel.' },
  { q: 'Posso desistir após a proposta?', a: 'Depende da fase. Após homologação e assinatura, a desistência pode gerar perda de caução ou multa contratual.' },
  { q: 'O desconto mostrado é real?', a: 'Sim. O desconto é calculado sobre o valor de avaliação feito pela CAIXA. O preço de venda é o valor efetivo que você pagará.' },
]

function scrollTo(id: string) {
  setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100)
}
</script>
