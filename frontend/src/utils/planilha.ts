import type { Imovel } from '@/types'

const SEP = ';'

function cell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value)
  text = text.replace(/\r?\n/g, ' ').trim()
  if (text.includes(SEP) || text.includes('"')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function brl(value: unknown): string {
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) return ''
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function pct(value: unknown): string {
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) return ''
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function areaFmt(value: unknown): string {
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) return ''
  return num.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

export const PLANILHA_HEADERS = [
  'Numero',
  'Tipo',
  'Cidade',
  'Bairro',
  'Endereco',
  'UF',
  'Preco (R$)',
  'Avaliacao (R$)',
  'Desconto (%)',
  'Financiamento',
  'Modalidade',
  'Area privativa (m2)',
  'Quartos',
  'Vagas',
  'Link Imovue',
  'Edital CAIXA',
]

export function imovelToRow(im: Imovel): string[] {
  return [
    cell(im.numeroImovel),
    cell(im.tipoImovel),
    cell(im.cidade),
    cell(im.bairro),
    cell(im.endereco),
    cell(im.uf),
    cell(brl(im.precoVenda)),
    cell(brl(im.valorAvaliacao)),
    cell(pct(im.percentualDesconto)),
    cell(im.financiamento),
    cell(im.modalidadeVenda),
    cell(areaFmt(im.areaPrivativa)),
    cell(im.quartos ?? ''),
    cell(im.vagas ?? ''),
    cell(`https://imovue.com.br/imovel/${im.numeroImovel}`),
    cell(im.urlOficial),
  ]
}

export function gerarCsv(imoveis: Imovel[]): string {
  const lines = [PLANILHA_HEADERS.join(SEP)]
  for (const im of imoveis) lines.push(imovelToRow(im).join(SEP))
  // BOM para o Excel abrir em UTF-8 direto.
  return '﻿' + lines.join('\r\n')
}

export function baixarCsv(imoveis: Imovel[], uf: string): void {
  const blob = new Blob([gerarCsv(imoveis)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `imovue-imoveis-${uf.toLowerCase()}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
