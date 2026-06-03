import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useCatalogoStore = defineStore('catalogo', () => {
  const ufSelecionada = ref(localStorage.getItem('uf') || '')

  watch(ufSelecionada, (v) => localStorage.setItem('uf', v))

  return { ufSelecionada }
})
