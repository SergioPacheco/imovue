<template>
  <div class="relative w-full">
    <!-- Input -->
    <div class="relative">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
      </svg>
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900
               focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all
               placeholder:text-gray-400 text-sm sm:text-base"
        @keydown.enter="executar"
        @input="onInput"
      />
      <button v-if="query" @click="limpar"
        class="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <button @click="executar"
        class="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-500 text-white p-2 rounded-lg hover:bg-brand-600 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </button>
    </div>

    <!-- Preview dos filtros detectados -->
    <div v-if="preview && query.length > 2" class="absolute z-20 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg p-4">
      <div class="text-xs text-gray-400 mb-2">Filtros detectados:</div>
      <div class="text-sm text-gray-700 font-medium">{{ preview.descricao }}</div>
      <div v-if="preview.uf" class="mt-1 text-xs text-brand-500">Estado: {{ preview.uf }}</div>
      <div class="mt-3 flex gap-2">
        <button @click="executar" class="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-lg hover:bg-brand-600">
          Buscar ↵
        </button>
        <div class="text-xs text-gray-400 self-center">ou pressione Enter</div>
      </div>
    </div>

    <!-- Sugestões de exemplo -->
    <div v-if="showSugestoes && !query" class="absolute z-20 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg p-4">
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

const props = defineProps<{
  cidades?: string[]
  placeholder?: string
}>()

const emit = defineEmits<{
  search: [result: SmartSearchResult]
}>()

const query = ref('')
const inputRef = ref<HTMLInputElement>()
const showSugestoes = ref(false)

const sugestoes = [
  'apartamento até 200 mil com 2 quartos',
  'casa com mais de 40% de desconto',
  'terreno em Goiânia abaixo de 100 mil',
  'imóvel venda direta até 150 mil',
  'sobrado com 3 quartos e 2 vagas',
]

const preview = computed(() => {
  if (query.value.length < 3) return null
  return parseSmartSearch(query.value, props.cidades ?? [])
})

function executar() {
  if (!query.value.trim()) return
  const result = parseSmartSearch(query.value, props.cidades ?? [])
  emit('search', result)
  showSugestoes.value = false
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
  showSugestoes.value = false
}

// Mostra sugestões ao focar com input vazio
watch(query, (v) => {
  if (!v) showSugestoes.value = true
})
</script>
