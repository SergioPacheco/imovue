<template>
  <!-- Botão flutuante -->
  <button v-if="!aberto" @click="aberto = true"
    class="fixed bottom-6 right-6 z-50 bg-brand-500 text-white w-14 h-14 rounded-full shadow-lg
           hover:bg-brand-600 hover:scale-110 transition-all flex items-center justify-center">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
    </svg>
  </button>

  <!-- Painel do chat -->
  <div v-if="aberto"
    class="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)]
           bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">

    <!-- Header -->
    <div class="bg-brand-500 text-white px-4 py-3 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">🏠</div>
        <div>
          <div class="font-semibold text-sm">Assistente Imovue</div>
          <div class="text-xs text-blue-100">{{ dados.length > 0 ? `${dados.length.toLocaleString()} imóveis` : 'Selecione um estado' }}</div>
        </div>
      </div>
      <button @click="aberto = false" class="text-white/80 hover:text-white p-1">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Mensagens -->
    <div ref="messagesRef" class="flex-1 overflow-y-auto p-4 space-y-3">
      <div v-for="(msg, i) in mensagens" :key="i"
        :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
        <div :class="msg.role === 'user'
          ? 'bg-brand-500 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]'
          : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%]'">
          <div class="text-sm whitespace-pre-line" v-html="renderMarkdown(msg.text)"></div>
          <!-- Imóveis inline -->
          <div v-if="msg.imoveis && msg.imoveis.length > 0" class="mt-2 space-y-1.5">
            <router-link v-for="im in msg.imoveis" :key="im.numeroImovel"
              :to="`/imoveis/${im.numeroImovel}`"
              @click="aberto = false"
              class="block text-xs bg-white/80 rounded-lg px-2.5 py-1.5 hover:bg-white transition-colors border border-gray-200">
              <span class="font-medium">{{ im.cidade }}</span> · R$ {{ fmt(im.precoVenda) }}
              <span v-if="im.percentualDesconto" class="text-green-600 font-bold ml-1">-{{ im.percentualDesconto }}%</span>
            </router-link>
          </div>
        </div>
      </div>
      <div v-if="digitando" class="flex justify-start">
        <div class="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
          <div class="flex gap-1">
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="border-t border-gray-200 p-3 shrink-0">
      <div class="flex gap-2">
        <input v-model="input" type="text"
          placeholder="Pergunte sobre imóveis..."
          class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-100 outline-none"
          @keydown.enter="enviar" />
        <button @click="enviar" :disabled="!input.trim()"
          class="bg-brand-500 text-white px-4 rounded-xl hover:bg-brand-600 disabled:opacity-40 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useChatBot, type ChatMessage } from '@/composables/useChatBot'
import { useCatalogoStore } from '@/stores/catalogo'
import { dataService } from '@/services/dataService'
import type { Imovel } from '@/types'

const store = useCatalogoStore()
const { gerarResposta } = useChatBot()

const aberto = ref(false)
const input = ref('')
const digitando = ref(false)
const messagesRef = ref<HTMLElement>()
const dados = ref<Imovel[]>([])
const cidades = ref<string[]>([])

const mensagens = ref<ChatMessage[]>([
  { role: 'bot', text: '👋 Olá! Sou o assistente do Imovue.\n\nSelecione um estado na página e me pergunte sobre os imóveis!\n\nEx: "melhores descontos", "apartamentos até 200 mil"' }
])

const fmt = (v: number | null) => v ? v.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) : '-'

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

async function carregarDados() {
  const uf = store.ufSelecionada
  if (!uf) return
  dados.value = await dataService.listar(uf, { size: 99999 }).then(r => r.content)
  cidades.value = await dataService.cidades(uf)
}

async function enviar() {
  const texto = input.value.trim()
  if (!texto) return

  mensagens.value.push({ role: 'user', text: texto })
  input.value = ''
  digitando.value = true
  await scrollBottom()

  // Carrega dados se necessário
  if (dados.value.length === 0 && store.ufSelecionada) {
    await carregarDados()
  }

  if (dados.value.length === 0) {
    await delay(500)
    mensagens.value.push({ role: 'bot', text: '⚠️ Nenhum estado selecionado ainda. Volte à página inicial e selecione um estado primeiro!' })
    digitando.value = false
    await scrollBottom()
    return
  }

  // Simula delay de "pensando"
  await delay(600 + Math.random() * 400)

  const resposta = gerarResposta(texto, dados.value, cidades.value)
  mensagens.value.push(resposta)
  digitando.value = false
  await scrollBottom()
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function scrollBottom() {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

onMounted(() => {
  if (store.ufSelecionada) carregarDados()
})
</script>
