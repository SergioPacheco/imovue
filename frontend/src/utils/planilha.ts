import * as ExcelJS from 'exceljs'
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

export const DESTAQUE_MINIMO = 40;

export function isDestaque(im: Imovel): boolean {
  const d = Number(im.percentualDesconto);
  return Number.isFinite(d) && d >= DESTAQUE_MINIMO;
}

export const PLANILHA_HEADERS = [
  'Destaque',
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
    cell(isDestaque(im) ? '★' : ''),
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

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function baixarCsv(imoveis: Imovel[], uf: string): void {
  downloadBlob(
    new Blob([gerarCsv(imoveis)], { type: 'text/csv;charset=utf-8' }),
    `imovue-imoveis-${uf.toLowerCase()}.csv`
  )
}

function numOrNull(value: unknown): number | null {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
}

export interface XlsxOpts {
  /** Bytes PNG do logo (ex.: /logo-128.png). Omitido = sem logo. */
  logo?: ArrayBuffer;
  estado?: string;
  geradoEm?: string;
}

const NAVY = 'FF0F365B';
const AMBER = 'FFB45309';
const ZEBRA = 'FFF1F5F9';

export async function gerarXlsx(imoveis: Imovel[], uf: string, opts: XlsxOpts = {}): Promise<Blob> {
  const estado = opts.estado || uf.toUpperCase();
  const geradoEm = opts.geradoEm || new Date().toLocaleDateString('pt-BR');
  const estadoPath = `https://imovue.com.br/estado/${uf.toLowerCase()}`;

  const precos = imoveis.map((im) => Number(im.precoVenda)).filter((v) => Number.isFinite(v) && v > 0);
  const descontos = imoveis.map((im) => Number(im.percentualDesconto)).filter((v) => Number.isFinite(v) && v > 0);
  const kpis = {
    total: imoveis.length,
    maxDesconto: descontos.length ? Math.max(...descontos) : 0,
    precoMedio: precos.length ? precos.reduce((a, b) => a + b, 0) / precos.length : 0,
    financiaveis: imoveis.filter((im) => im.financiamento === 'Sim').length,
  };

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Imovue';
  const ws = wb.addWorksheet('Imoveis');

  ws.columns = [
    { key: 'destaque', width: 10 },
    { key: 'numero', width: 16 },
    { key: 'tipo', width: 14 },
    { key: 'cidade', width: 24 },
    { key: 'bairro', width: 24 },
    { key: 'endereco', width: 34 },
    { key: 'uf', width: 6 },
    { key: 'preco', width: 16, style: { numFmt: '"R$" #,##0.00' } },
    { key: 'avaliacao', width: 16, style: { numFmt: '"R$" #,##0.00' } },
    { key: 'desconto', width: 13, style: { numFmt: '0.00' } },
    { key: 'financiamento', width: 12 },
    { key: 'modalidade', width: 16 },
    { key: 'area', width: 13, style: { numFmt: '#,##0.00' } },
    { key: 'quartos', width: 9 },
    { key: 'vagas', width: 8 },
    { key: 'link', width: 22 },
    { key: 'edital', width: 22 },
  ];

  // Capa comercial.
  if (opts.logo) {
    const logoId = wb.addImage({ buffer: opts.logo, extension: 'png' });
    ws.addImage(logoId, { tl: { col: 0, row: 0 }, ext: { width: 128, height: 72 }, editAs: 'absolute' });
  }
  ws.mergeCells('C1:Q1');
  ws.getCell('C1').value = 'IMOVUE';
  ws.getCell('C1').font = { bold: true, size: 20, color: { argb: NAVY } };
  ws.getRow(1).height = 40;
  ws.mergeCells('C2:Q2');
  ws.getCell('C2').value = `Imóveis da CAIXA em ${estado} com desconto`;
  ws.getCell('C2').font = { bold: true, size: 13, color: { argb: NAVY } };
  ws.mergeCells('C3:Q3');
  ws.getCell('C3').value = {
    text: `Gerado em ${geradoEm} · ${kpis.total.toLocaleString('pt-BR')} imóveis · ver análise completa em imovue.com.br`,
    hyperlink: estadoPath,
  } as unknown as string;
  ws.getCell('C3').font = { color: { argb: 'FF1A4D8F' } };

  // Bloco de KPIs do estado.
  const kpiLabels = ['TOTAL DE IMÓVEIS', 'MAIOR DESCONTO', 'PREÇO MÉDIO', 'FINANCIÁVEIS'];
  const kpiValues: (number | string)[] = [
    kpis.total,
    kpis.maxDesconto ? `${kpis.maxDesconto.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%` : '—',
    kpis.precoMedio,
    kpis.financiaveis,
  ];
  kpiLabels.forEach((label, i) => {
    const cell = ws.getCell(5, i + 1);
    cell.value = label;
    cell.font = { bold: true, size: 9, color: { argb: 'FF64748B' } };
  });
  const kpiRow = ws.getRow(6);
  kpiValues.forEach((value, i) => {
    const cell = kpiRow.getCell(i + 1);
    cell.value = value;
    cell.font = { bold: true, size: 14, color: { argb: NAVY } };
    if (i === 2 && typeof value === 'number') cell.numFmt = '"R$" #,##0';
  });

  // Cabeçalho da tabela.
  const headerRow = 8;
  PLANILHA_HEADERS.forEach((title, i) => {
    ws.getCell(headerRow, i + 1).value = title;
  });
  const header = ws.getRow(headerRow);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };

  // Dados.
  let rowIdx = headerRow;
  for (const im of imoveis) {
    rowIdx++;
    const destaque = isDestaque(im);
    const row = ws.getRow(rowIdx);
    const values: (string | number | null | object)[] = [
      destaque ? '★' : '',
      String(im.numeroImovel ?? ''),
      im.tipoImovel ?? '',
      im.cidade ?? '',
      im.bairro ?? '',
      im.endereco ?? '',
      im.uf ?? '',
      numOrNull(im.precoVenda),
      numOrNull(im.valorAvaliacao),
      numOrNull(im.percentualDesconto),
      im.financiamento ?? '',
      im.modalidadeVenda ?? '',
      numOrNull(im.areaPrivativa),
      numOrNull(im.quartos),
      numOrNull(im.vagas),
      im.numeroImovel
        ? { text: 'ver no Imovue', hyperlink: `https://imovue.com.br/imovel/${im.numeroImovel}` }
        : '',
      im.urlOficial ? { text: 'ver edital', hyperlink: String(im.urlOficial) } : '',
    ];
    values.forEach((value, i) => {
      row.getCell(i + 1).value = value as never;
    });
    if (destaque) {
      row.getCell(1).font = { bold: true, size: 14, color: { argb: AMBER } };
    }
    if (rowIdx % 2 === 0) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } };
    }
  }

  // Rodapé institucional.
  const foot = rowIdx + 2;
  ws.mergeCells(`A${foot}:Q${foot}`);
  ws.getCell(`A${foot}`).value =
    'Dados públicos extraídos das listas da CAIXA. Confirme preço, edital e condições no site oficial antes de decidir. Dúvidas? contato@imovue.com.br';
  ws.getCell(`A${foot}`).font = { italic: true, size: 9, color: { argb: 'FF64748B' } };

  ws.autoFilter = { from: `A${headerRow}`, to: `Q${rowIdx}` };
  ws.views = [{ state: 'frozen', ySplit: headerRow }];

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer as unknown as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export async function baixarXlsx(imoveis: Imovel[], uf: string, estado?: string): Promise<void> {
  let logo: ArrayBuffer | undefined;
  try {
    const res = await fetch('/logo-128.png');
    if (res.ok) logo = await res.arrayBuffer();
  } catch {
    logo = undefined;
  }
  downloadBlob(await gerarXlsx(imoveis, uf, { logo, estado }), `imovue-imoveis-${uf.toLowerCase()}.xlsx`);
}
