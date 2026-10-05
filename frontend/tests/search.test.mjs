import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseSmartSearch } from '../src/composables/useSmartSearch.ts'
import { dataService } from '../src/services/dataService.ts'
import { useChatBot } from '../src/composables/useChatBot.ts'
import * as parser from '../src/composables/useSmartSearch.ts'

const cases = [
  ['apartamento em SP até 300 mil', 'SP', { tipoImovel: 'Apartamento', precoMax: 300000 }],
  ['casa em Recife', 'PE', { cidade: 'Recife', tipoImovel: 'Casa' }],
  ['apartamento até 250 mil com 2 quartos', null, { tipoImovel: 'Apartamento', precoMax: 250000, quartosMin: 2 }],
  ['imóveis com mais de 40% de desconto', null, { descontoMin: 40 }],
  ['não quero imóvel ocupado', null, { ocupado: false }],
  ['pode estar ocupado', null, {}],
  ['maior desconto primeiro', null, { sort: 'percentualDesconto,desc' }],
  ['venda direta em Minas Gerais', 'MG', { modalidade: 'Venda Direta Online' }],
  ['imóveis em Belo Horizonte', 'MG', { cidade: 'Belo Horizonte' }],
  ['quero investir até 200 mil', null, { precoMax: 200000 }],
  ['agora somente apartamentos', null, { tipoImovel: 'Apartamento' }],
  ['mostre os mais baratos', null, { sort: 'precoVenda,asc' }],
  ['apartamento para investir em SC', 'SC', { tipoImovel: 'Apartamento' }],
  ['apartamentos em Aparecida de Goiânia', 'GO', { cidade: 'Aparecida de Goiania', tipoImovel: 'Apartamento' }],
  ['casa no estado do Pará', 'PA', { tipoImovel: 'Casa' }],
  ['casa em Mato Grosso do Sul', 'MS', { tipoImovel: 'Casa' }],
  ['até R$ 250.000,50', null, { precoMax: 250000.5 }],
  ['até 1,5 milhão', null, { precoMax: 1500000 }],
  ['até 1.5 milhão', null, { precoMax: 1500000 }],
  ['entre 200 e 300 mil', null, { precoMin: 200000, precoMax: 300000 }],
  ['com pelo menos dois quartos e uma vaga', null, { quartosMin: 2, vagasMin: 1 }],
  ['até 2 quartos', null, { quartosMax: 2 }],
  ['casas com 30,5% de desconto', null, { tipoImovel: 'Casa', descontoMin: 30.5 }],
  ['imóveis financiáveis', null, { financiamento: 'Sim' }],
  ['não aceita financiamento', null, { financiamento: 'Não' }],
]
for (const [query, uf, filters] of cases) {
  test(`interpreta: ${query}`, () => {
    const result = parseSmartSearch(query, [])
    assert.equal(result.uf, uf)
    assert.deepEqual(result.filtros, filters)
  })
}

test('barato pede orçamento sem inventar um preço máximo', () => {
  const result = parseSmartSearch('quero algo barato em SC', [])
  assert.equal(result.uf, 'SC')
  assert.equal(result.filtros.precoMax, undefined)
  assert.ok(result.perguntas?.length)
})
test('praia pede cidade sem inventar proximidade geográfica', () => {
  assert.ok(parseSmartSearch('algo perto da praia', []).perguntas?.length)
})
test('São Paulo sem contexto exige distinguir cidade e estado', () => {
  assert.ok(parseSmartSearch('apartamento em São Paulo', []).perguntas?.length)
  assert.equal(parseSmartSearch('no estado de São Paulo', []).uf, 'SP')
  assert.equal(parseSmartSearch('na cidade de São Paulo', []).filtros.cidade, 'Sao Paulo')
})
test('remover preço sinaliza remoção dos dois limites', () => {
  assert.deepEqual(parseSmartSearch('remova o limite de preço', []).removerFiltros, ['precoMin', 'precoMax'])
})
test('permitir ocupado remove a restrição anterior', () => {
  assert.deepEqual(parseSmartSearch('pode estar ocupado', []).removerFiltros, ['ocupado'])
})
test('nomes de cidades são comparados por palavras completas e nome mais longo', () => {
  const result = parseSmartSearch('casa em Santa Rita do Passa Quatro', ['SANTA RITA', 'SANTA RITA DO PASSA QUATRO'])
  assert.equal(result.filtros.cidade, 'SANTA RITA DO PASSA QUATRO')
  assert.equal(parseSmartSearch('preciso de salários melhores', []).filtros.tipoImovel, undefined)
  assert.equal(parseSmartSearch('se tiver desconto, quero investir', []).uf, null)
})
test('limites inválidos não são aplicados', () => {
  for (const text of ['mais de 150% de desconto', 'entre 300 mil e 200 mil']) {
    const result = parseSmartSearch(text, [])
    assert.ok(result.perguntas?.length)
  }
})

const base = {
  uf: 'PE', cidade: 'RECIFE', bairro: 'CENTRO', endereco: 'RUA TESTE, 1',
  valorAvaliacao: 300000, financiamento: 'Não', descricao: 'Casa, 2 qto(s).',
  modalidadeVenda: 'Venda Online', urlOficial: 'https://venda-imoveis.caixa.gov.br/',
  tipoImovel: 'Casa', areaTotal: null, areaPrivativa: null, areaTerreno: null,
  quartos: 2, vagas: 1, lat: null, lng: null,
}
const properties = [
  { ...base, numeroImovel: '1', precoVenda: 150000, percentualDesconto: 50 },
  { ...base, numeroImovel: '2', precoVenda: 90000, percentualDesconto: 30, modalidadeVenda: 'Venda Direta Online' },
  { ...base, numeroImovel: '3', precoVenda: 190000, percentualDesconto: 60, tipoImovel: 'Apartamento', quartos: 3 },
  { ...base, numeroImovel: '4', precoVenda: 120000, percentualDesconto: 20, tipoImovel: 'Apartamento', quartos: 1, descricao: 'Apartamento desocupado.' },
  { ...base, numeroImovel: '5', precoVenda: 180000, percentualDesconto: 40, descricao: 'Casa ocupada.' },
]
globalThis.fetch = async url => {
  assert.equal(url, '/data/PE.json')
  return { ok: true, json: async () => properties }
}

test('parser e catálogo encontram Recife sem depender da capitalização', async () => {
  const result = parseSmartSearch('casa em Recife até 160 mil', [])
  const found = await dataService.listar(result.uf, result.filtros)
  assert.deepEqual(found.content.map(i => i.numeroImovel), ['1', '2'])
})
test('ocupação desconhecida não equivale a imóvel desocupado', async () => {
  const result = await dataService.listar('PE', { ocupado: false })
  assert.deepEqual(result.content.map(i => i.numeroImovel), ['4'])
})
test('quartos máximos são aplicados sobre o catálogo', async () => {
  const result = await dataService.listar('PE', { quartosMax: 1 })
  assert.deepEqual(result.content.map(i => i.numeroImovel), ['4'])
})
test('chat aplica tipo e preço antes de ordenar pelos mais baratos', () => {
  const chat = useChatBot()
  const result = chat.gerarResposta('casas em Recife até 160 mil, mostre os mais baratos', properties, ['RECIFE'])
  assert.deepEqual(result.imoveis?.map(i => i.numeroImovel), ['2', '1'])
})
test('chat aplica modalidade interpretada', () => {
  const result = useChatBot().gerarResposta('venda direta em Recife', properties, ['RECIFE'])
  assert.deepEqual(result.imoveis?.map(i => i.numeroImovel), ['2'])
})
test('chat acumula preço e quartos e permite remover o limite de preço', () => {
  const chat = useChatBot()
  chat.gerarResposta('apartamentos em Recife', properties, ['RECIFE'])
  chat.gerarResposta('até 130 mil', properties, ['RECIFE'])
  const result = chat.gerarResposta('com pelo menos dois quartos', properties, ['RECIFE'])
  assert.deepEqual(result.imoveis, undefined)
  const expanded = chat.gerarResposta('remova o limite de preço', properties, ['RECIFE'])
  assert.deepEqual(expanded.imoveis?.map(i => i.numeroImovel), ['3'])
})
test('chat não busca na UF errada quando o parser pede outro estado', () => {
  const result = useChatBot().gerarResposta('casas em SC', properties, ['RECIFE'])
  assert.equal(result.imoveis, undefined)
})
test('mensagem desconhecida não retorna todo o catálogo', () => {
  assert.equal(useChatBot().gerarResposta('xyzabc', properties, ['RECIFE']).imoveis, undefined)
})

test('URL preserva todos os critérios interpretados, inclusive booleano false', () => {
  const filters = { cidade: 'Recife', modalidade: 'Venda Direta Online', quartosMin: 2,
    quartosMax: 3, vagasMin: 1, financiamento: 'Sim', ocupado: false, precoMax: 200000, sort: 'precoVenda,asc' }
  const query = parser.searchToQuery(filters, 'PE')
  assert.deepEqual(parser.searchFromQuery(query), { uf: 'PE', filtros: filters })
})
test('URL rejeita preços inválidos, ordenação arbitrária e múltiplos valores', () => {
  assert.deepEqual(parser.searchFromQuery({ uf: '../SP', precoMax: '-5', precoMin: 'NaN', sort: 'descricao,desc', cidade: ['Recife', 'Olinda'] }), { uf: null, filtros: {} })
})
test('remover desconto é um refinamento executável', () => {
  const chat = useChatBot()
  chat.gerarResposta('casas com mais de 80% de desconto', properties, ['RECIFE'])
  const result = chat.gerarResposta('remova o desconto mínimo', properties, ['RECIFE'])
  assert.deepEqual(result.imoveis?.map(i => i.numeroImovel), ['1', '5', '2'])
})
test('negação de financiamento não é invertida', () => {
  assert.equal(parseSmartSearch('não quero financiamento', []).filtros.financiamento, 'Não')
})

test('carregamentos concorrentes compartilham o mesmo JSON por UF', async () => {
  const original = globalThis.fetch
  let requests = 0
  globalThis.fetch = async url => {
    assert.equal(url, '/data/SC.json')
    requests++
    await new Promise(resolve => setTimeout(resolve, 10))
    return { ok: true, json: async () => properties.map(im => ({ ...im, uf: 'SC' })) }
  }
  try {
    const results = await Promise.all([dataService.listar('SC', {}), dataService.listar('SC', {})])
    assert.equal(requests, 1)
    assert.equal(results[0].totalElements, 5)
    assert.equal(results[1].totalElements, 5)
  } finally { globalThis.fetch = original }
})

for (const [text, filters] of [
  ['apartamento até 2 quartos até 300 mil', { tipoImovel: 'Apartamento', quartosMax: 2, precoMax: 300000 }],
  ['casa com mais de 40% de desconto acima de 100 mil', { tipoImovel: 'Casa', descontoMin: 40, precoMin: 100000 }],
  ['entre 2 e 3 quartos', { quartosMin: 2, quartosMax: 3 }],
  ['não quero imóveis financiáveis', { financiamento: 'Não' }],
  ['não aceito imóveis financiáveis', { financiamento: 'Não' }],
  ['não quero casas com financiamento', { tipoImovel: 'Casa', financiamento: 'Não' }],
  ['casa não ocupada', { tipoImovel: 'Casa', ocupado: false }],
]) {
  test(`preserva significado de: ${text}`, () => assert.deepEqual(parseSmartSearch(text, []).filtros, filters))
}
test('Pará com acento não é confundido com preposição', () => {
  assert.equal(parseSmartSearch('apartamento em Pará até 200 mil', []).uf, 'PA')
})
test('estados conflitantes por nome completo exigem esclarecimento', () => {
  assert.ok(parseSmartSearch('casa em Pernambuco e Bahia', []).perguntas.length)
})
test('cidade incompatível com a UF exige esclarecimento', () => {
  assert.ok(parseSmartSearch('casa em Recife SP', ['SAO PAULO'], { ufAtual: 'SP' }).perguntas.length)
})
test('escolha explícita da ordem do catálogo sobrevive à URL', () => {
  assert.deepEqual(parser.searchFromQuery(parser.searchToQuery({ sort: '' }, 'PE')), { uf: 'PE', filtros: { sort: '' } })
})
test('falha de dados mantém fallback legado e pode ser tratada explicitamente pela busca', async t => {
  t.mock.method(console, 'error', () => {})
  const original = globalThis.fetch
  globalThis.fetch = async () => ({ ok: false, status: 503 })
  try {
    const fallback = await dataService.listar('AP', {})
    assert.equal(fallback.totalElements, 0)
    await assert.rejects(dataService.listar('AP', {}, { strict: true }), /503/)
    globalThis.fetch = async () => ({ ok: true, json: async () => properties.map(im => ({ ...im, uf: 'AP' })) })
    assert.equal((await dataService.listar('AP', {}, { strict: true })).totalElements, 5)
  } finally { globalThis.fetch = original }
})

test('análises paralelas não baixam as estatísticas de bairro repetidamente', async () => {
  const original = globalThis.fetch
  let requests = 0
  globalThis.fetch = async url => {
    assert.equal(url, '/data/estatisticas_bairros.json')
    requests++
    await new Promise(resolve => setTimeout(resolve, 10))
    return { ok: true, json: async () => ({ PE: { RECIFE: { CENTRO: { medianaM2: 1000, total: 10 } } } }) }
  }
  try {
    const sample = { ...properties[0], areaPrivativa: 100 }
    const results = await Promise.all([dataService.getAnalisePreco(sample), dataService.getAnalisePreco(sample)])
    assert.equal(requests, 1)
    assert.deepEqual(results, [
      { valorM2: 1500, medianaM2: 1000, ratio: 1.5, classificacao: 'sobre' },
      { valorM2: 1500, medianaM2: 1000, ratio: 1.5, classificacao: 'sobre' },
    ])
  } finally { globalThis.fetch = original }
})

test('não se importar com ocupação remove a restrição em vez de exigir desocupado', () => {
  const result = parseSmartSearch('não me importo se estiver ocupado', [])
  assert.deepEqual(result.filtros, {})
  assert.deepEqual(result.removerFiltros, ['ocupado'])
})
test('AP em contexto de estado não cria filtro de apartamento', () => {
  const result = parseSmartSearch('imóveis em AP', [])
  assert.equal(result.uf, 'AP')
  assert.deepEqual(result.filtros, {})
})

for (const [text, filters] of [
  ['casa não financiável e ocupada', { tipoImovel: 'Casa', financiamento: 'Não', ocupado: true }],
  ['não quero imóvel ocupado, com financiamento', { ocupado: false, financiamento: 'Sim' }],
  ['casa entre 2 e 3 quartos e entre 100 e 200 mil', { tipoImovel: 'Casa', quartosMin: 2, quartosMax: 3, precoMin: 100000, precoMax: 200000 }],
]) {
  test(`critérios independentes: ${text}`, () => assert.deepEqual(parseSmartSearch(text).filtros, filters))
}
test('cidade homônima no catálogo prevalece sobre o dicionário de cidades', () => {
  for (const [city, uf] of [['CASCAVEL', 'CE'], ['PALMAS', 'PR']]) {
    const result = parseSmartSearch(`casa em ${city} ${uf}`, [city], { ufAtual: uf })
    assert.equal(result.uf, uf)
    assert.equal(result.filtros.cidade, city)
    assert.deepEqual(result.perguntas, [])
  }
})
test('cidade e UF explícitas aguardam catálogo antes de concluir incompatibilidade', () => {
  const result = parseSmartSearch('casa em Cascavel CE')
  assert.equal(result.uf, 'CE')
  assert.equal(result.filtros.cidade, 'Cascavel')
  assert.deepEqual(result.perguntas, [])
})
test('cidade homônima preserva a UF do catálogo já selecionado', () => {
  const result = parseSmartSearch('casa em Cascavel', ['CASCAVEL'], { ufAtual: 'CE' })
  assert.equal(result.uf, 'CE')
  assert.equal(result.filtros.cidade, 'CASCAVEL')
})
