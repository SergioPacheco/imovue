export interface Imovel {
  numeroImovel: string
  uf: string
  cidade: string
  bairro: string
  endereco: string
  precoVenda: number | null
  valorAvaliacao: number | null
  percentualDesconto: number | null
  financiamento: string | null
  descricao: string
  modalidadeVenda: string
  urlOficial: string
  tipoImovel: string | null
  areaTotal: number | null
  areaPrivativa: number | null
  areaTerreno: number | null
  quartos: number | null
  vagas: number | null
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface FiltrosImovel {
  cidade?: string
  bairro?: string
  tipoImovel?: string
  precoMin?: number
  precoMax?: number
  descontoMin?: number
  modalidade?: string
  quartosMin?: number
  vagasMin?: number
  page?: number
  size?: number
  sort?: string
}

export interface ColetaExecucao {
  id: number
  status: string
  totalImportadas: number
  totalGeral: number
}
