<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <nav class="text-sm text-gray-400 mb-4" aria-label="Breadcrumb">
      <router-link to="/" class="hover:text-brand-500">Início</router-link>
      <span> / </span>
      <span class="text-gray-700 font-medium">Baixar planilha</span>
    </nav>

    <h1 class="text-3xl font-extrabold text-gray-900">Baixar planilha de imóveis da CAIXA</h1>
    <p class="mt-3 text-gray-600">
      Escolha o estado, informe seu e-mail e baixe grátis a planilha completa com
      todos os imóveis do estado: tipo, cidade, bairro, preço, avaliação, desconto,
      financiamento, modalidade e links para o Imovue e o edital da CAIXA.
    </p>

    <div v-if="!liberado" class="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <label for="lead-uf" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
      <select id="lead-uf" v-model="uf" class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4">
        <option v-for="opt in ufs" :key="opt.sigla" :value="opt.sigla">
          {{ opt.nome }} ({{ opt.total.toLocaleString('pt-BR') }} imóveis)
        </option>
      </select>

      <label for="lead-email" class="block text-sm font-medium text-gray-700 mb-1">Seu melhor e-mail</label>
      <input id="lead-email" v-model="email" type="email" autocomplete="email" placeholder="voce@email.com"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4" />

      <!-- Honeypot anti-bot (invisível para humanos) -->
      <input v-model="hp" type="text" tabindex="-1" autocomplete="off"
        class="absolute opacity-0 h-0 w-0 pointer-events-none" aria-hidden="true" />

      <label class="flex items-start gap-2 text-sm text-gray-600 mb-4 cursor-pointer">
        <input v-model="consent" type="checkbox" class="mt-1" />
        <span>
          Concordo em receber a planilha e, ocasionalmente, oportunidades de imóveis por e-mail.
          <router-link to="/politica-de-privacidade" class="text-brand-600 hover:underline">Política de Privacidade</router-link>.
        </span>
      </label>

      <p v-if="erro" class="text-sm text-red-600 mb-3">{{ erro }}</p>

      <button @click="enviar" :disabled="enviando"
        class="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
        {{ enviando ? 'Enviando…' : 'Liberar download grátis' }}
      </button>
    </div>

    <div v-else class="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
      <h2 class="text-lg font-bold text-green-900">Download liberado! 🎉</h2>
      <p class="text-sm text-green-800 mt-1">
        {{ total }} imóveis de {{ nomeEstado }} prontos para baixar em CSV (abre no Excel e Google Planilhas).
      </p>
      <button @click="baixar" :disabled="baixando"
        class="mt-4 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
        {{ baixando ? 'Gerando…' : `Baixar planilha de ${nomeEstado}` }}
      </button>
      <p class="text-xs text-gray-500 mt-3">Não gostou? Cada e-mail nosso tem link de descadastro em 1 clique.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSeoHead } from '@/composables/useSeoHead'
import { SITE_URL } from '@/seo/seo.js'
import { dataService } from '@/services/dataService'
import { UF_NOMES } from '@/constants/uf'
import { baixarCsv } from '@/utils/planilha'

useSeoHead(() => ({
  title: 'Baixar planilha de imóveis da CAIXA por estado',
  description: 'Informe seu e-mail e baixe grátis a planilha completa com todos os imóveis da CAIXA do estado escolhido: preços, descontos, cidades e links.',
  canonical: `${SITE_URL}/baixar-planilha`,
  robots: 'noindex,follow',
}))

const route = useRoute()
const ufs = ref<{ sigla: string; nome: string; total: number }[]>([])
const uf = ref('SP')
const email = ref('')
const hp = ref('')
const consent = ref(false)
const enviando = ref(false)
const baixando = ref(false)
const liberado = ref(false)
const total = ref(0)
const erro = ref('')

const nomeEstado = computed(() => UF_NOMES[uf.value] || uf.value)

const ERROS: Record<string, string> = {
  'email-invalido': 'Confira seu e-mail e tente novamente.',
  'uf-invalida': 'Escolha um estado válido.',
  'consentimento-obrigatorio': 'Marque a caixinha de consentimento para continuar.',
  'indisponivel': 'Sistema de cadastro em manutenção — tente novamente em alguns minutos.',
  'payload-invalido': 'Algo saiu errado. Recarregue a página e tente de novo.',
  'rede': 'Falha de conexão. Verifique sua internet e tente novamente.',
}

onMounted(async () => {
  const queryUf = String(route.query.uf || '').toUpperCase()
  const manifest = await dataService.getManifest()
  ufs.value = manifest
    .filter((e: any) => e.uf !== 'BR')
    .map((e: any) => ({ sigla: e.uf, nome: UF_NOMES[e.uf] || e.uf, total: e.total || 0 }))
    .sort((a: any, b: any) => a.nome.localeCompare(b.nome, 'pt-BR'))
  if (queryUf && ufs.value.some((u) => u.sigla === queryUf)) uf.value = queryUf
})

async function enviar() {
  erro.value = ''
  if (!consent.value) {
    erro.value = ERROS['consentimento-obrigatorio']
    return
  }
  enviando.value = true
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), uf: uf.value, consent: true, hp: hp.value }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.ok) {
      if (res.status === 503 || data?.error === 'indisponivel') {
        erro.value = ERROS['indisponivel']
      } else if (data?.error && ERROS[data.error]) {
        erro.value = ERROS[data.error]
      } else if (!res.ok) {
        erro.value = 'Serviço de cadastro indisponível no momento — tente novamente em alguns minutos.'
      } else {
        erro.value = ERROS['rede']
      }
      return
    }
    const lista = await dataService.listar(uf.value, { size: 99999 } as any)
    total.value = lista.content.length
    if (!total.value) {
      erro.value = 'Nenhum imóvel neste estado no momento. Tente outro estado.'
      return
    }
    liberado.value = true
  } catch {
    erro.value = ERROS['rede']
  } finally {
    enviando.value = false
  }
}

async function baixar() {
  baixando.value = true
  try {
    const lista = await dataService.listar(uf.value, { size: 99999 } as any)
    baixarCsv(lista.content, uf.value)
  } finally {
    baixando.value = false
  }
}
</script>
