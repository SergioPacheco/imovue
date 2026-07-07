<template>
  <!-- Botão flutuante com avatar -->
  <div v-if="!aberto" class="fixed bottom-6 right-6 z-50">
    <div class="chat-pulse-ring"></div>
    <button @click="aberto = true" class="chat-fab">
      <img src="/avatar-ana.webp" alt="Ana" class="w-full h-full rounded-full object-cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
      <span class="w-full h-full rounded-full bg-gradient-to-br from-brand-500 to-brand-700 items-center justify-center text-white text-lg font-bold hidden">A</span>
      <span class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></span>
    </button>
  </div>

  <!-- Painel do chat -->
  <transition name="chat-panel">
    <div v-if="aberto"
      class="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)]
             chat-panel flex flex-col overflow-hidden">

      <!-- Header -->
      <div class="chat-header shrink-0">
        <div class="flex items-center gap-3">
          <div class="relative">
            <img src="/avatar-ana.webp" alt="Ana" class="w-9 h-9 rounded-full object-cover border-2 border-white/30" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
            <div class="w-9 h-9 rounded-full bg-white/20 items-center justify-center text-sm hidden">🏠</div>
            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-brand-800"></span>
          </div>
          <div>
            <div class="font-semibold text-sm">Ana · Imovue</div>
            <div class="text-xs text-blue-200 flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              Online · {{ dados.length > 0 ? `${dados.length.toLocaleString()} imóveis` : 'Pronta para ajudar' }}
            </div>
          </div>
        </div>
        <button @click="aberto = false" class="text-white/80 hover:text-white p-1 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Mensagens -->
      <div ref="messagesRef" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        <div v-for="(msg, i) in mensagens" :key="i"
          :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start gap-2'">
          <!-- Avatar do bot -->
          <img v-if="msg.role === 'bot'" src="/avatar-ana.webp" alt="Ana" class="w-7 h-7 rounded-full object-cover shrink-0 mt-1 border border-gray-200" onerror="this.style.display='none'" />
          <div :class="msg.role === 'user'
            ? 'bg-brand-500 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]'
            : 'bg-white text-gray-800 rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%] shadow-sm border border-gray-100'">
            <div class="text-sm whitespace-pre-line" v-html="renderMarkdown(msg.text)"></div>
            <!-- Imóveis inline -->
            <div v-if="msg.imoveis && msg.imoveis.length > 0" class="mt-2 space-y-1.5">
              <router-link v-for="im in msg.imoveis" :key="im.numeroImovel"
                :to="`/imoveis/${im.numeroImovel}?uf=${im.uf}`"
                @click="aberto = false"
                class="block text-xs bg-gray-50 rounded-lg px-2.5 py-1.5 hover:bg-brand-50 transition-colors border border-gray-200">
                <span class="font-medium">{{ im.cidade }}</span> · R$ {{ fmt(im.precoVenda) }}
                <span v-if="im.percentualDesconto" class="text-green-600 font-bold ml-1">-{{ im.percentualDesconto }}%</span>
              </router-link>
            </div>
          </div>
        </div>
        <div v-if="digitando" class="flex justify-start">
          <div class="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="border-t border-gray-200 p-3 shrink-0 bg-white">
        <div class="flex gap-2">
          <input v-model="input" type="text"
            placeholder="Pergunte sobre imóveis..."
            class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
            @keydown.enter="enviar" />
          <button @click="enviar" :disabled="!input.trim()"
            class="bg-brand-500 text-white px-4 rounded-xl hover:bg-brand-600 disabled:opacity-40 transition-all hover:shadow-md">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>
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
  { role: 'bot', text: 'Oi! 😊 Sou a Ana, sua consultora virtual de imóveis.\n\nPosso te ajudar a encontrar oportunidades, comparar preços e tirar dúvidas sobre leilão da Caixa.\n\nSelecione um estado na página e me pergunte, por exemplo:\n• "apartamentos até 200 mil"\n• "melhores descontos em Goiânia"\n• "imóveis financiáveis"' }
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

<style scoped>
/* Botão flutuante */
.chat-fab {
  position: relative;
  z-index: 2;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: linear-gradient(135deg, #1e56a0, #2563eb);
  box-shadow: 0 6px 20px -4px rgba(30, 86, 160, 0.5);
  transition: all 0.2s ease;
}

.chat-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 28px -4px rgba(30, 86, 160, 0.65);
}

/* Pulse ring */
.chat-pulse-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(30, 86, 160, 0.4);
  animation: chatPulse 2.5s ease-out infinite;
  z-index: 1;
}

@keyframes chatPulse {
  0% { transform: scale(1); opacity: 0.6; }
  70% { transform: scale(1.35); opacity: 0; }
  100% { transform: scale(1.35); opacity: 0; }
}

/* Painel */
.chat-panel {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow:
    0 20px 60px -15px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(0, 0, 0, 0.05);
}

.chat-header {
  background: linear-gradient(135deg, #1e56a0, #15407a);
  color: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Transição do painel */
.chat-panel-enter-active {
  animation: chatOpen 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.chat-panel-leave-active {
  animation: chatClose 0.2s ease-in;
}

@keyframes chatOpen {
  0% { opacity: 0; transform: scale(0.9) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes chatClose {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.9) translateY(10px); }
}
</style>
