import type { FiltrosImovel } from '@/types'
import { dataService } from '@/services/dataService'

const UF_MAP: Record<string, string> = {
  'acre': 'AC', 'alagoas': 'AL', 'amazonas': 'AM', 'amapá': 'AP', 'amapa': 'AP',
  'bahia': 'BA', 'ceará': 'CE', 'ceara': 'CE', 'distrito federal': 'DF', 'brasília': 'DF', 'brasilia': 'DF',
  'espírito santo': 'ES', 'espirito santo': 'ES', 'goiás': 'GO', 'goias': 'GO',
  'maranhão': 'MA', 'maranhao': 'MA', 'minas gerais': 'MG', 'minas': 'MG',
  'mato grosso do sul': 'MS', 'mato grosso': 'MT', 'pará': 'PA', 'para': 'PA',
  'paraíba': 'PB', 'paraiba': 'PB', 'pernambuco': 'PE', 'piauí': 'PI', 'piaui': 'PI',
  'paraná': 'PR', 'parana': 'PR', 'rio de janeiro': 'RJ', 'rio': 'RJ',
  'rio grande do norte': 'RN', 'rondônia': 'RO', 'rondonia': 'RO', 'roraima': 'RR',
  'rio grande do sul': 'RS', 'santa catarina': 'SC', 'sergipe': 'SE',
  'são paulo': 'SP', 'sao paulo': 'SP', 'tocantins': 'TO',
  'ac': 'AC', 'al': 'AL', 'am': 'AM', 'ap': 'AP', 'ba': 'BA', 'ce': 'CE',
  'df': 'DF', 'es': 'ES', 'go': 'GO', 'ma': 'MA', 'mg': 'MG', 'ms': 'MS',
  'mt': 'MT', 'pa': 'PA', 'pb': 'PB', 'pe': 'PE', 'pi': 'PI', 'pr': 'PR',
  'rj': 'RJ', 'rn': 'RN', 'ro': 'RO', 'rr': 'RR', 'rs': 'RS', 'sc': 'SC',
  'se': 'SE', 'sp': 'SP', 'to': 'TO',
}

// Mapa de cidades principais → UF (para detectar estado a partir de cidade na busca)
const CIDADE_UF_MAP: Record<string, string> = {
  'goiania': 'GO', 'anapolis': 'GO', 'aparecida de goiania': 'GO',
  'curitiba': 'PR', 'londrina': 'PR', 'maringa': 'PR', 'cascavel': 'PR', 'foz do iguacu': 'PR',
  'belo horizonte': 'MG', 'uberlandia': 'MG', 'contagem': 'MG', 'juiz de fora': 'MG', 'betim': 'MG',
  'salvador': 'BA', 'feira de santana': 'BA', 'vitoria da conquista': 'BA',
  'fortaleza': 'CE', 'caucaia': 'CE', 'juazeiro do norte': 'CE',
  'recife': 'PE', 'jaboatao dos guararapes': 'PE', 'olinda': 'PE', 'caruaru': 'PE',
  'porto alegre': 'RS', 'caxias do sul': 'RS', 'pelotas': 'RS', 'canoas': 'RS',
  'manaus': 'AM', 'belem': 'PA', 'macapa': 'AP',
  'sao luis': 'MA', 'natal': 'RN', 'joao pessoa': 'PB', 'maceio': 'AL', 'aracaju': 'SE',
  'teresina': 'PI', 'campo grande': 'MS', 'cuiaba': 'MT', 'porto velho': 'RO',
  'rio branco': 'AC', 'boa vista': 'RR', 'palmas': 'TO', 'macae': 'RJ',
  'florianopolis': 'SC', 'joinville': 'SC', 'blumenau': 'SC', 'chapeco': 'SC',
  'vitoria': 'ES', 'vila velha': 'ES', 'serra': 'ES', 'cariacica': 'ES',
  'niteroi': 'RJ', 'duque de caxias': 'RJ', 'nova iguacu': 'RJ', 'sao goncalo': 'RJ', 'campos dos goytacazes': 'RJ',
  'campinas': 'SP', 'guarulhos': 'SP', 'osasco': 'SP', 'santos': 'SP', 'santo andre': 'SP',
  'sao bernardo do campo': 'SP', 'ribeirao preto': 'SP', 'sorocaba': 'SP', 'bauru': 'SP',
  'sao jose dos campos': 'SP', 'piracicaba': 'SP', 'jundiai': 'SP', 'mogi das cruzes': 'SP',
}

const TIPO_MAP: Record<string, string> = {
  'apartamento': 'Apartamento', 'apto': 'Apartamento', 'ap': 'Apartamento',
  'casa': 'Casa', 'sobrado': 'Sobrado',
  'terreno': 'Terreno', 'lote': 'Terreno',
  'comercial': 'Comercial', 'loja': 'Loja', 'sala': 'Sala',
  'galpão': 'Galpão', 'galpao': 'Galpão',
  'prédio': 'Prédio', 'predio': 'Prédio',
  'rural': 'Imóvel rural', 'fazenda': 'Imóvel rural', 'sítio': 'Imóvel rural', 'sitio': 'Imóvel rural',
}

const MODALIDADE_MAP: Record<string, string> = {
  'leilão': 'Leilão SFI - Edital Único', 'leilao': 'Leilão SFI - Edital Único',
  'venda direta': 'Venda Direta Online', 'direta': 'Venda Direta Online',
  'venda online': 'Venda Online', 'online': 'Venda Online',
  'licitação': 'Licitação Aberta', 'licitacao': 'Licitação Aberta',
}

export interface SmartSearchResult {
  filtros: FiltrosImovel
  uf: string | null
  descricao: string
}

export function parseSmartSearch(text: string, cidadesDisponiveis: string[]): SmartSearchResult {
  const t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const original = text.toLowerCase()
  const filtros: FiltrosImovel = {}
  const partes: string[] = []
  let uf: string | null = null

  // --- UF ---
  for (const [key, val] of Object.entries(UF_MAP)) {
    const regex = new RegExp(`\\b${key.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}\\b`, 'i')
    if (regex.test(t)) {
      uf = val
      partes.push(`UF: ${val}`)
      break
    }
  }

  // --- UF por cidade (fallback se não achou estado direto) ---
  if (!uf) {
    for (const [cidade, val] of Object.entries(CIDADE_UF_MAP)) {
      if (t.includes(cidade)) {
        uf = val
        // Capitalizar nome da cidade para usar como filtro
        const cidadeCapitalizada = cidade.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        filtros.cidade = cidadeCapitalizada
        partes.push(`Cidade: ${cidadeCapitalizada}`)
        partes.push(`UF: ${val}`)
        break
      }
    }
  }

  // --- Tipo de imóvel ---
  for (const [key, val] of Object.entries(TIPO_MAP)) {
    if (t.includes(key.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
      filtros.tipoImovel = val
      partes.push(`Tipo: ${val}`)
      break
    }
  }

  // --- Preço máximo ---
  const precoMax = original.match(/(?:até|ate|max|menos de|abaixo de|no máximo|no maximo)\s*(?:r\$?\s*)?([\d.,]+)\s*(mil|k|milhão|milhao|mi|m)?/i)
  if (precoMax) {
    let val = parseFloat(precoMax[1].replace(/\./g, '').replace(',', '.'))
    const mult = precoMax[2]?.toLowerCase()
    if (mult === 'mil' || mult === 'k') val *= 1000
    else if (mult === 'milhão' || mult === 'milhao' || mult === 'mi' || mult === 'm') val *= 1000000
    filtros.precoMax = val
    partes.push(`Preço máx: R$ ${val.toLocaleString('pt-BR')}`)
  }

  // --- Preço mínimo ---
  const precoMin = original.match(/(?:a partir de|acima de|mínimo|minimo|mais de)\s*(?:r\$?\s*)?([\d.,]+)\s*(mil|k|milhão|milhao|mi|m)?/i)
  if (precoMin) {
    let val = parseFloat(precoMin[1].replace(/\./g, '').replace(',', '.'))
    const mult = precoMin[2]?.toLowerCase()
    if (mult === 'mil' || mult === 'k') val *= 1000
    else if (mult === 'milhão' || mult === 'milhao' || mult === 'mi' || mult === 'm') val *= 1000000
    filtros.precoMin = val
    partes.push(`Preço mín: R$ ${val.toLocaleString('pt-BR')}`)
  }

  // --- Desconto ---
  const desconto = original.match(/(?:desconto|desc)?\s*(?:de\s+)?(?:mais de\s+|acima de\s+|mínimo\s+)?(\d+)\s*%/i)
    || original.match(/(\d+)\s*%\s*(?:de\s+)?desconto/i)
  if (desconto) {
    filtros.descontoMin = parseInt(desconto[1])
    partes.push(`Desconto mín: ${desconto[1]}%`)
  }

  // --- Quartos ---
  const quartos = original.match(/(\d+)\s*(?:quarto|qto|dormitório|dormitorio|dorm)/i)
  if (quartos) {
    filtros.quartosMin = parseInt(quartos[1])
    partes.push(`Quartos: ${quartos[1]}+`)
  }

  // --- Vagas ---
  const vagas = original.match(/(\d+)\s*(?:vaga|garagem)/i)
  if (vagas) {
    filtros.vagasMin = parseInt(vagas[1])
    partes.push(`Vagas: ${vagas[1]}+`)
  }

  // --- Cidade (match dinâmico contra dados carregados) ---
  if (!filtros.cidade && cidadesDisponiveis.length > 0) {
    const tNorm = t.replace(/[^a-z\s]/g, '')
    for (const cidade of cidadesDisponiveis) {
      const cidadeNorm = cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (cidadeNorm.length > 3 && tNorm.includes(cidadeNorm)) {
        filtros.cidade = cidade
        partes.push(`Cidade: ${cidade}`)
        break
      }
    }
  }

  // --- Modalidade ---
  for (const [key, val] of Object.entries(MODALIDADE_MAP)) {
    if (t.includes(key.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
      filtros.modalidade = val
      partes.push(`Modalidade: ${val}`)
      break
    }
  }

  return {
    filtros,
    uf,
    descricao: partes.length > 0 ? partes.join(' · ') : 'Nenhum filtro identificado',
  }
}
