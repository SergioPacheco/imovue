import { ref } from 'vue'
import type { Imovel } from '@/types'

const STORAGE_KEY = 'imovue_favoritos'

function load(): Record<string, Imovel> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

const favMap = ref<Record<string, Imovel>>(load())

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favMap.value))
}

export function useFavoritos() {
  function toggle(imovel: Imovel | string, data?: Imovel) {
    const numero = typeof imovel === 'string' ? imovel : imovel.numeroImovel
    if (favMap.value[numero]) {
      delete favMap.value[numero]
    } else {
      const obj = typeof imovel === 'string' ? data : imovel
      if (obj) favMap.value[numero] = obj
    }
    favMap.value = { ...favMap.value }
    save()
  }

  function isFav(numero: string) {
    return !!favMap.value[numero]
  }

  function count() {
    return Object.keys(favMap.value).length
  }

  function lista(): Imovel[] {
    return Object.values(favMap.value)
  }

  function limparTodos() {
    favMap.value = {}
    save()
  }

  return { favoritos: favMap, toggle, isFav, count, lista, limparTodos }
}
