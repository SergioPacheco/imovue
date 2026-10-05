<template>
  <div class="relative w-full">
    <!-- Input com glow -->
    <div class="search-input-wrapper">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
      </svg>
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        maxlength="1000"
        :disabled="loading"
        aria-label="Descreva o imóvel que procura"
        :placeholder="placeholder"
        class="search-input"
        @keydown.enter="executar"
        @input="onInput"
        @focus="showSugestoes = !query; showPreview = !!query"
      />
      <button v-if="query" @click="limpar" aria-label="Limpar texto da busca"
        class="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <button @click="executar" :disabled="loading" class="search-btn" aria-label="Pesquisar imóveis">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </button>
    </div>
    <p v-if="erro" class="mt-2 text-sm text-red-700" role="alert">{{ erro }}</p>

    <!-- Preview dos filtros detectados -->
    <div v-if="preview && showPreview && query.length > 2" class="absolute z-20 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl p-4 animate-slide-up max-h-[60dvh] overflow-y-auto" aria-live="polite">
      <div class="text-xs text-gray-400 mb-2">Filtros detectados:</div>
      <div class="text-sm text-gray-700 font-medium">{{ preview.descricao }}</div>
      <div v-if="preview.uf" class="mt-1 text-xs text-brand-500">Estado: {{ preview.uf }}</div>
      <p v-for="question in preview.perguntas" :key="question" class="mt-2 text-sm text-amber-800">{{ question }}</p>
      <p v-for="warning in preview.avisos" :key="warning" class="mt-2 text-xs text-gray-600">{{ warning }}</p>
      <div class="mt-3 flex gap-2">
        <button @click="executar" :disabled="loading || preview.perguntas.length > 0 || preview.intent === 'UNKNOWN'" class="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-40">
          Buscar ↵
        </button>
        <div class="text-xs text-gray-400 self-center">ou pressione Enter</div>
      </div>
    </div>

    <!-- Sugestões de exemplo -->
    <div v-if="showSugestoes && !query" class="absolute z-20 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl p-4 animate-slide-up">
      <div class="text-xs text-gray-400 mb-2">Experimente:</div>
      <div class="space-y-1.5">
        <button v-for="s in sugestoes" :key="s" @click="usarSugestao(s)"
          class="block w-full text-left text-sm text-gray-600 hover:text-brand-500 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">
          "{{ s }}"
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { parseSmartSearch, type SmartSearchResult } from '@/composables/useSmartSearch'
import { dataService } from '@/services/dataService'

const props = defineProps<{
  cidades?: string[]
  ufAtual?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  search: [result: SmartSearchResult, query: string]
}>()

const query = ref('')
const inputRef = ref<HTMLInputElement>()
const showSugestoes = ref(false)
const showPreview = ref(false)
const loading = ref(false)
const erro = ref('')
const catalogCities = ref<{ uf: string; cities: string[] } | null>(null)

const sugestoes = [
  'apartamento até 200 mil com 2 quartos',
  'casa com mais de 40% de desconto',
  'terreno em Goiânia abaixo de 100 mil',
  'imóvel venda direta até 150 mil',
  'sobrado com 3 quartos e 2 vagas',
]

const preview = computed(() => {
  if (query.value.length < 3) return null
  const initial = parseSmartSearch(query.value, props.cidades ?? [], { ufAtual: props.ufAtual })
  const uf = initial.uf || props.ufAtual
  if (catalogCities.value && catalogCities.value.uf === uf) {
    return parseSmartSearch(query.value, catalogCities.value.cities, { ufAtual: uf })
  }
  return initial
})

async function executar() {
  if (!query.value.trim() || loading.value) return
  let result = preview.value
  if (!result || result.perguntas.length || result.intent === 'UNKNOWN') { showPreview.value = true; return }
  erro.value = ''
  const uf = result.uf || props.ufAtual
  loading.value = true
  try {
    // Resolve cities from the real target catalog only when the user submits.
    if (uf && catalogCities.value?.uf !== uf && (props.ufAtual !== uf || !props.cidades?.length)) {
      await dataService.listar(uf, { size: 1 }, { strict: true })
      catalogCities.value = { uf, cities: await dataService.cidades(uf) }
      result = preview.value!
    }
    if (result.perguntas.length) { showPreview.value = true; return }
    emit('search', result, query.value.trim())
    showSugestoes.value = false
    showPreview.value = false
  } catch {
    erro.value = 'Não foi possível carregar os imóveis. Tente pesquisar novamente.'
  } finally { loading.value = false }
}

function usarSugestao(s: string) {
  query.value = s
  executar()
}

function limpar() {
  query.value = ''
  inputRef.value?.focus()
}

function onInput() {
  erro.value = ''
  showSugestoes.value = false
  showPreview.value = true
}

watch(query, (v) => {
  if (!v) showSugestoes.value = true
})
</script>

<style scoped>
.search-input-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 16px 56px 16px 48px;
  border-radius: 14px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  color: #1f2937;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow:
    0 8px 32px -8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-input:focus {
  border-color: rgba(96, 165, 250, 0.6);
  box-shadow:
    0 8px 32px -8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(96, 165, 250, 0.3),
    0 0 20px rgba(96, 165, 250, 0.15);
}

.search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #1e56a0, #2563eb);
  color: white;
  padding: 10px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px -2px rgba(30, 86, 160, 0.4);
}

.search-btn:hover {
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 6px 16px -2px rgba(30, 86, 160, 0.6);
}

.search-btn:active {
  transform: translateY(-50%) scale(0.95);
}

@media (max-width: 640px) {
  .search-input {
    font-size: 14px;
    padding: 14px 50px 14px 44px;
  }
}
</style>
