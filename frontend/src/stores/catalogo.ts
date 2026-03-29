import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Imovel, FiltrosImovel, PageResponse } from '@/types'
import { catalogoApi } from '@/services/api'

export const useCatalogoStore = defineStore('catalogo', () => {
  const imoveis = ref<Imovel[]>([])
  const totalPages = ref(0)
  const totalElements = ref(0)
  const loading = ref(false)
  const filtros = ref<FiltrosImovel>({ page: 0, size: 20, sort: 'percentualDesconto,desc' })
  const ufs = ref<string[]>([])
  const cidades = ref<string[]>([])
  const favoritos = ref<string[]>(JSON.parse(localStorage.getItem('favoritos') || '[]'))

  async function buscar() {
    loading.value = true
    try {
      const data = await catalogoApi.listar(filtros.value)
      imoveis.value = data.content
      totalPages.value = data.totalPages
      totalElements.value = data.totalElements
    } finally {
      loading.value = false
    }
  }

  async function carregarUfs() {
    ufs.value = await catalogoApi.ufs()
  }

  async function carregarCidades(uf: string) {
    cidades.value = await catalogoApi.cidades(uf)
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

  return { imoveis, totalPages, totalElements, loading, filtros, ufs, cidades, favoritos, buscar, carregarUfs, carregarCidades, toggleFavorito, isFavorito }
})
