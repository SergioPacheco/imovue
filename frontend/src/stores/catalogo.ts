import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Imovel, FiltrosImovel } from '@/types'
import { dataService } from '@/services/dataService'

export const useCatalogoStore = defineStore('catalogo', () => {
  const imoveis = ref<Imovel[]>([])
  const totalPages = ref(0)
  const totalElements = ref(0)
  const loading = ref(false)
  const filtros = ref<FiltrosImovel>({ page: 0, size: 20, sort: 'percentualDesconto,desc' })
  const ufSelecionada = ref(localStorage.getItem('uf') || '')
  const ufs = ref<string[]>([])
  const cidades = ref<string[]>([])
  const favoritos = ref<string[]>(JSON.parse(localStorage.getItem('favoritos') || '[]'))

  watch(ufSelecionada, (v) => localStorage.setItem('uf', v))

  async function buscar() {
    if (!ufSelecionada.value) return
    loading.value = true
    try {
      const data = await dataService.listar(ufSelecionada.value, filtros.value)
      imoveis.value = data.content
      totalPages.value = data.totalPages
      totalElements.value = data.totalElements
    } finally {
      loading.value = false
    }
  }

  async function carregarUfs() {
    ufs.value = await dataService.ufsDisponiveis()
  }

  async function carregarCidades() {
    if (!ufSelecionada.value) return
    cidades.value = await dataService.cidades(ufSelecionada.value)
  }

  function toggleFavorito(numero: string) {
    const idx = favoritos.value.indexOf(numero)
    if (idx >= 0) favoritos.value.splice(idx, 1)
    else favoritos.value.push(numero)
    localStorage.setItem('favoritos', JSON.stringify(favoritos.value))
  }

  function isFavorito(numero: string) {
    return favoritos.value.includes(numero)
  }

  return { imoveis, totalPages, totalElements, loading, filtros, ufSelecionada, ufs, cidades, favoritos, buscar, carregarUfs, carregarCidades, toggleFavorito, isFavorito }
})
