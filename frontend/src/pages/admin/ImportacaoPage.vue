<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">⚙️ Administração</h1>
        <p class="text-gray-500 text-sm mt-1">Gerencie os arquivos CSV e importações</p>
      </div>
      <div v-if="statusData" class="text-right">
        <div class="text-2xl font-bold text-brand-500">{{ statusData.totalImoveis }}</div>
        <div class="text-xs text-gray-400">imóveis carregados</div>
      </div>
    </div>

    <!-- Arquivos disponíveis -->
    <section class="mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">📁 Arquivos CSV disponíveis</h2>
      <div v-if="loadingArquivos" class="space-y-3">
        <div v-for="i in 5" :key="i" class="skeleton h-14 rounded-xl"></div>
      </div>
      <div v-else-if="arquivos.length === 0" class="card p-8 text-center text-gray-400">
        Nenhum arquivo CSV encontrado em <code class="bg-gray-100 px-2 py-0.5 rounded">data/listas/</code>
      </div>
      <div v-else class="space-y-2">
        <div v-for="arq in arquivos" :key="arq.nome"
          class="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
              <span class="text-brand-600 font-bold text-sm">{{ arq.uf }}</span>
            </div>
            <div class="min-w-0">
              <div class="font-medium text-gray-900 text-sm truncate">{{ arq.nome }}</div>
              <div class="text-xs text-gray-400 flex gap-3">
                <span>~{{ arq.linhas }} linhas</span>
                <span>{{ formatSize(arq.tamanho) }}</span>
              </div>
            </div>
          </div>
          <button @click="carregarArquivo(arq.nome)"
            :disabled="carregandoArquivo === arq.nome"
            class="btn-secondary text-sm whitespace-nowrap">
            {{ carregandoArquivo === arq.nome ? 'Carregando...' : 'Carregar' }}
          </button>
        </div>
      </div>
    </section>

    <!-- Upload -->
    <section class="mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">📤 Upload de novo CSV</h2>
      <div class="card p-6">
        <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand-400 transition-colors"
          @dragover.prevent @drop.prevent="onDrop">
          <div class="text-3xl mb-2 opacity-50">📄</div>
          <p class="text-gray-500 text-sm mb-3">Arraste um arquivo CSV aqui ou</p>
          <label class="btn-secondary cursor-pointer inline-block">
            Selecionar arquivo
            <input type="file" accept=".csv" @change="onFile" class="hidden" />
          </label>
          <p v-if="arquivo" class="mt-3 text-sm text-brand-600 font-medium">{{ arquivo.name }} ({{ formatSize(arquivo.size) }})</p>
        </div>
        <div class="flex items-center gap-3 mt-4">
          <button @click="importar" :disabled="!arquivo || uploading" class="btn-primary disabled:opacity-40">
            {{ uploading ? 'Importando...' : 'Importar CSV' }}
          </button>
          <button v-if="arquivo" @click="arquivo = null" class="btn-ghost text-sm text-gray-400">Cancelar</button>
        </div>
      </div>
    </section>

    <!-- Resultado -->
    <div v-if="resultado" class="card p-5 mb-8 border-l-4"
      :class="resultado.status === 'SUCESSO' ? 'border-l-success-500 bg-success-50' : 'border-l-red-500 bg-red-50'">
      <div class="flex items-center gap-2">
        <span class="text-lg">{{ resultado.status === 'SUCESSO' ? '✅' : '❌' }}</span>
        <div>
          <div class="font-semibold text-gray-900">{{ resultado.status }}</div>
          <div class="text-sm text-gray-600">{{ resultado.totalImportadas }} imóveis importados · Total: {{ resultado.totalGeral }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/services/api'

const arquivos = ref<any[]>([])
const loadingArquivos = ref(true)
const carregandoArquivo = ref('')
const arquivo = ref<File | null>(null)
const uploading = ref(false)
const resultado = ref<any>(null)
const statusData = ref<any>(null)

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

function onFile(e: Event) {
  arquivo.value = (e.target as HTMLInputElement).files?.[0] || null
}

function onDrop(e: DragEvent) {
  const f = e.dataTransfer?.files?.[0]
  if (f && f.name.endsWith('.csv')) arquivo.value = f
}

async function importar() {
  if (!arquivo.value) return
  uploading.value = true
  try {
    resultado.value = await adminApi.importar(arquivo.value)
    arquivo.value = null
    await refresh()
  } finally { uploading.value = false }
}

async function carregarArquivo(nome: string) {
  carregandoArquivo.value = nome
  try {
    resultado.value = await adminApi.carregarArquivo(nome)
    await refresh()
  } finally { carregandoArquivo.value = '' }
}

async function refresh() {
  statusData.value = await adminApi.status()
}

onMounted(async () => {
  ;[arquivos.value, statusData.value] = await Promise.all([adminApi.arquivos(), adminApi.status()])
  loadingArquivos.value = false
})
</script>
