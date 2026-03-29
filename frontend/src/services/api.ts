import axios from 'axios'
import type { Imovel, PageResponse, FiltrosImovel } from '@/types'

const api = axios.create({ baseURL: '/api' })

function clean(obj: Record<string, any>) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== '' && v !== undefined && v !== null))
}

export const catalogoApi = {
  ufsDisponiveis: () => api.get<string[]>('/ufs').then(r => r.data),
  carregar: (uf: string) => api.post<{ uf: string; total: number }>('/carregar', null, { params: { uf } }).then(r => r.data),
  estado: () => api.get<{ uf: string; total: number }>('/estado').then(r => r.data),
  listar: (filtros: FiltrosImovel) => api.get<PageResponse<Imovel>>('/imoveis', { params: clean(filtros) }).then(r => r.data),
  detalhe: (numero: string) => api.get<Imovel>(`/imoveis/${numero}`).then(r => r.data),
  cidades: () => api.get<string[]>('/filtros/cidades').then(r => r.data),
  tipos: () => api.get<string[]>('/filtros/tipos').then(r => r.data),
  estatisticas: () => api.get<Record<string, any>>('/estatisticas').then(r => r.data),
  dashboard: () => api.get<any>('/dashboard').then(r => r.data),
}

export const adminApi = {
  arquivos: () => api.get<any[]>('/admin/arquivos').then(r => r.data),
  importar: (arquivo: File) => {
    const form = new FormData()
    form.append('arquivo', arquivo)
    return api.post('/admin/importar', form).then(r => r.data)
  },
  carregarArquivo: (nome: string) => api.post('/admin/carregar-arquivo', null, { params: { nome } }).then(r => r.data),
  status: () => api.get('/admin/status').then(r => r.data),
}
