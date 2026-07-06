<template>
  <!-- Loading -->
  <div v-if="loading" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="skeleton h-6 w-48 mb-4"></div>
    <div class="skeleton h-10 w-96 mb-6"></div>
    <div class="grid sm:grid-cols-2 gap-4">
      <div v-for="i in 6" :key="i" class="skeleton h-6"></div>
    </div>
  </div>

  <!-- Not found -->
  <div v-else-if="!imovel" class="text-center py-20">
    <div class="text-5xl mb-4">🔍</div>
    <h3 class="text-lg font-semibold text-gray-700">Imóvel não encontrado</h3>
    <router-link to="/imoveis" class="btn-primary mt-4 inline-block">Voltar à listagem</router-link>
  </div>

  <!-- Detalhe -->
  <div v-else>
    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <router-link to="/imoveis" class="hover:text-brand-500">Imóveis</router-link>
          <span>/</span>
          <span class="text-gray-600">{{ imovel.cidade }}</span>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Coluna principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Imagem -->
          <PropertyImage :tipo="imovel.tipoImovel" :numero="imovel.numeroImovel" size="lg">
            <div class="absolute top-4 left-4 flex gap-2">
              <span v-if="imovel.tipoImovel" class="badge badge-type text-sm">{{ imovel.tipoImovel }}</span>
              <span v-if="imovel.percentualDesconto && imovel.percentualDesconto > 40" class="badge badge-hot text-sm">🔥 Oportunidade</span>
            </div>
          </PropertyImage>

          <!-- Título -->
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ imovel.cidade }} — {{ imovel.bairro }}</h1>
            <p class="text-gray-500 mt-1 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {{ imovel.endereco }}
            </p>
          </div>

          <!-- Atributos -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div v-if="imovel.areaPrivativa" class="bg-gray-50 rounded-xl p-4 text-center">
              <div class="text-lg font-bold text-gray-900">{{ imovel.areaPrivativa }}m²</div>
              <div class="text-xs text-gray-500">Área privativa</div>
            </div>
            <div v-if="imovel.areaTerreno" class="bg-gray-50 rounded-xl p-4 text-center">
              <div class="text-lg font-bold text-gray-900">{{ imovel.areaTerreno }}m²</div>
              <div class="text-xs text-gray-500">Terreno</div>
            </div>
            <div v-if="imovel.quartos" class="bg-gray-50 rounded-xl p-4 text-center">
              <div class="text-lg font-bold text-gray-900">{{ imovel.quartos }}</div>
              <div class="text-xs text-gray-500">Quarto(s)</div>
            </div>
            <div v-if="imovel.vagas" class="bg-gray-50 rounded-xl p-4 text-center">
              <div class="text-lg font-bold text-gray-900">{{ imovel.vagas }}</div>
              <div class="text-xs text-gray-500">Vaga(s)</div>
            </div>
          </div>

          <!-- Análise Comparativa -->
          <div v-if="analise" class="rounded-xl border p-5" :class="analise.classificacao === 'sub' ? 'border-emerald-200 bg-emerald-50' : analise.classificacao === 'sobre' ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'">
            <h2 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📊 Análise Comparativa do Bairro
            </h2>
            <div class="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Valor/m² deste imóvel</span>
                <div class="text-lg font-bold text-gray-900">R$ {{ analise.valorM2.toLocaleString('pt-BR') }}</div>
              </div>
              <div>
                <span class="text-gray-500">Mediana do bairro ({{ imovel.bairro }})</span>
                <div class="text-lg font-bold text-gray-900">R$ {{ analise.medianaM2.toLocaleString('pt-BR') }}</div>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t" :class="analise.classificacao === 'sub' ? 'border-emerald-200' : analise.classificacao === 'sobre' ? 'border-amber-200' : 'border-gray-200'">
              <p v-if="analise.classificacao === 'sub'" class="text-sm font-medium text-emerald-800">
                ✅ Este imóvel está {{ Math.round((1 - analise.ratio) * 100) }}% abaixo da mediana do bairro — possível oportunidade real.
              </p>
              <p v-else-if="analise.classificacao === 'sobre'" class="text-sm font-medium text-amber-800">
                ⚠️ Este imóvel está {{ Math.round((analise.ratio - 1) * 100) }}% acima da mediana do bairro — o desconto da Caixa pode estar sobre uma avaliação inflada.
              </p>
              <p v-else class="text-sm font-medium text-gray-700">
                Preço alinhado com a mediana do bairro.
              </p>
            </div>
          </div>

          <!-- Análise Imovue -->
          <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">🔎 Análise Imovue</h2>

            <!-- Desconto e economia -->
            <div v-if="imovel.percentualDesconto && imovel.valorAvaliacao && imovel.precoVenda" class="grid sm:grid-cols-3 gap-3">
              <div class="bg-green-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-green-700">{{ imovel.percentualDesconto.toFixed(1) }}%</div>
                <div class="text-xs text-gray-500">Desconto sobre avaliação</div>
              </div>
              <div class="bg-green-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-green-700">R$ {{ fmt(imovel.valorAvaliacao - imovel.precoVenda) }}</div>
                <div class="text-xs text-gray-500">Economia vs. avaliação</div>
              </div>
              <div v-if="precoM2" class="bg-gray-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-gray-900">R$ {{ precoM2.toLocaleString('pt-BR') }}</div>
                <div class="text-xs text-gray-500">Preço por m²</div>
              </div>
            </div>

            <!-- Custo estimado de aquisição -->
            <div v-if="custoAquisicao" class="border border-gray-100 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-2">Custo estimado da aquisição</h3>
              <dl class="space-y-1 text-sm">
                <div class="flex justify-between"><dt class="text-gray-500">Valor do imóvel</dt><dd class="font-medium">R$ {{ fmt(imovel.precoVenda) }}</dd></div>
                <div class="flex justify-between"><dt class="text-gray-500">ITBI estimado (3%)</dt><dd class="font-medium">R$ {{ fmt(custoAquisicao.itbi) }}</dd></div>
                <div class="flex justify-between"><dt class="text-gray-500">Escritura e registro (~2%)</dt><dd class="font-medium">R$ {{ fmt(custoAquisicao.escritura) }}</dd></div>
                <div class="flex justify-between border-t border-gray-100 pt-1 mt-1"><dt class="text-gray-700 font-semibold">Total estimado</dt><dd class="font-bold text-gray-900">R$ {{ fmt(custoAquisicao.total) }}</dd></div>
              </dl>
            </div>

            <!-- Indicações -->
            <div class="grid sm:grid-cols-2 gap-3 text-sm">
              <div class="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                <span>🏦</span>
                <div>
                  <div class="font-medium text-gray-900">Financiamento</div>
                  <div class="text-gray-500">{{ imovel.financiamento === 'Sim' ? 'Aceita financiamento habitacional' : 'Não aceita financiamento — pagamento à vista ou conforme edital' }}</div>
                </div>
              </div>
              <div class="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                <span>💰</span>
                <div>
                  <div class="font-medium text-gray-900">Uso de FGTS</div>
                  <div class="text-gray-500">{{ imovel.financiamento === 'Sim' ? 'Possível (consultar edital para condições)' : 'Não permitido nesta modalidade' }}</div>
                </div>
              </div>
              <div class="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                <span>📋</span>
                <div>
                  <div class="font-medium text-gray-900">Modalidade</div>
                  <div class="text-gray-500">{{ modalidadeExplicacao }}</div>
                </div>
              </div>
              <div class="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                <span>🏠</span>
                <div>
                  <div class="font-medium text-gray-900">Ocupação</div>
                  <div class="text-gray-500">{{ ocupacaoExplicacao }}</div>
                </div>
              </div>
            </div>

            <!-- Score -->
            <div v-if="score > 0" class="border border-gray-100 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-2">Score Imovue: {{ score }}/100</h3>
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="h-2 rounded-full" :class="score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-yellow-500' : 'bg-gray-400'" :style="{ width: score + '%' }"></div>
              </div>
              <p class="text-xs text-gray-500">O score considera desconto, financiamento, modalidade e características do imóvel. <router-link to="/metodologia" class="text-brand-500 hover:underline">Entenda a metodologia →</router-link></p>
            </div>

            <!-- Checklist -->
            <div class="border border-gray-100 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-2">✅ Checklist antes da compra</h3>
              <ul class="text-xs text-gray-600 space-y-1">
                <li>☐ Ler o edital completo no site da Caixa</li>
                <li>☐ Verificar matrícula atualizada no cartório</li>
                <li>☐ Confirmar situação de ocupação</li>
                <li>☐ Calcular custos totais (ITBI + cartório + eventuais débitos)</li>
                <li>☐ Consultar débitos de IPTU e condomínio</li>
                <li v-if="imovel.financiamento === 'Sim'">☐ Obter pré-aprovação de crédito</li>
                <li>☐ Visitar o imóvel externamente</li>
                <li>☐ Consultar profissional jurídico</li>
              </ul>
            </div>

            <!-- Disclaimer -->
            <p class="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-3">
              ⚠️ As estimativas acima são calculadas automaticamente com base nos dados disponíveis e não constituem recomendação jurídica, financeira ou de investimento. Valores de ITBI, escritura e registro variam por município e cartório. Consulte sempre o edital oficial e profissionais especializados antes de tomar qualquer decisão.
            </p>
          </div>

          <!-- Descrição -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 class="font-semibold text-gray-900 mb-2">Descrição</h2>
            <p class="text-gray-600 text-sm leading-relaxed">{{ imovel.descricao }}</p>
          </div>

          <!-- Informações -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 class="font-semibold text-gray-900 mb-3">Informações</h2>
            <dl class="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div class="flex justify-between py-2 border-b border-gray-100">
                <dt class="text-gray-500">Nº do imóvel</dt>
                <dd class="font-medium text-gray-900">{{ imovel.numeroImovel }}</dd>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-100">
                <dt class="text-gray-500">Modalidade</dt>
                <dd class="font-medium text-gray-900">{{ imovel.modalidadeVenda }}</dd>
              </div>
              <div v-if="imovel.financiamento" class="flex justify-between py-2 border-b border-gray-100">
                <dt class="text-gray-500">Financiamento</dt>
                <dd class="font-medium text-gray-900">{{ imovel.financiamento }}</dd>
              </div>
              <div v-if="imovel.areaTotal" class="flex justify-between py-2 border-b border-gray-100">
                <dt class="text-gray-500">Área total</dt>
                <dd class="font-medium text-gray-900">{{ imovel.areaTotal }}m²</dd>
              </div>
            </dl>
          </div>

          <!-- Mapa -->
          <div v-if="imovel.lat && imovel.lng" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div ref="mapEl" class="h-64 w-full"></div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-4">
            <!-- Preço -->
            <div class="bg-white rounded-xl border border-gray-200 p-5">
              <div v-if="imovel.percentualDesconto" class="mb-3">
                <span class="badge badge-discount text-base px-3 py-1">-{{ imovel.percentualDesconto }}% de desconto</span>
              </div>
              <div class="text-3xl font-bold text-gray-900">R$ {{ fmt(imovel.precoVenda) }}</div>
              <div v-if="imovel.valorAvaliacao" class="mt-1">
                <span class="text-sm text-gray-400 line-through">Avaliação: R$ {{ fmt(imovel.valorAvaliacao) }}</span>
              </div>
              <div v-if="imovel.valorAvaliacao && imovel.precoVenda" class="mt-2 text-sm text-success-600 font-medium">
                Economia de R$ {{ fmt(imovel.valorAvaliacao - imovel.precoVenda) }}
              </div>
            </div>

            <!-- Ações -->
            <a :href="imovel.urlOficial" target="_blank" rel="noopener"
              class="btn-primary w-full text-center block">
              Ver no site oficial ↗
            </a>
            <a :href="matriculaUrl" target="_blank" rel="noopener"
              class="btn-secondary w-full text-center block">
              📄 Ver Matrícula (PDF)
            </a>
            <div class="flex gap-2">
              <button @click="fav.toggle(imovel)" class="flex-1 text-center block transition-all"
                :class="fav.isFav(imovel.numeroImovel) ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100 font-semibold px-5 py-2.5 rounded-lg border' : 'btn-secondary'">
                {{ fav.isFav(imovel.numeroImovel) ? '❤️ Favoritado' : '🤍 Favoritar' }}
              </button>
              <div class="relative">
                <button @click="showShare = !showShare" class="btn-secondary px-3 py-2.5">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                </button>
                <div v-show="showShare" class="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1">
                  <a :href="shareWhatsApp" target="_blank" rel="noopener" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <span class="text-lg">💬</span> WhatsApp
                  </a>
                  <a :href="shareTelegram" target="_blank" rel="noopener" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <span class="text-lg">✈️</span> Telegram
                  </a>
                  <a :href="shareFacebook" target="_blank" rel="noopener" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <span class="text-lg">📘</span> Facebook
                  </a>
                  <a :href="shareX" target="_blank" rel="noopener" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <span class="text-lg">𝕏</span> X (Twitter)
                  </a>
                  <button @click="copyLink" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                    <span class="text-lg">🔗</span> {{ linkCopiado ? 'Copiado!' : 'Copiar link' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Aviso -->
            <div class="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 leading-relaxed">
              <strong>Aviso legal:</strong> As informações são extraídas de listas públicas da CAIXA.
              Os documentos oficiais (edital e matrícula) são disponibilizados pela Caixa Econômica Federal e podem conter dados pessoais de terceiros.
              O Imovue não armazena, republica ou edita esses documentos; apenas direciona o usuário para a fonte oficial.
              Confirme os dados diretamente no site oficial antes de tomar qualquer decisão.
            </div>

            <!-- Afiliado -->
            <AffiliateCourseCard variant="compact" />
          </div>
        </div>
      </div>
    </div>

    <!-- Barra fixa mobile -->
    <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-2 z-50 shadow-lg">
      <button @click="fav.toggle(imovel)"
        class="px-4 py-2.5 rounded-lg border font-semibold text-sm transition-all"
        :class="fav.isFav(imovel.numeroImovel) ? 'bg-red-50 border-red-300 text-red-600' : 'border-gray-300 text-gray-600'">
        {{ fav.isFav(imovel.numeroImovel) ? '❤️' : '🤍' }}
      </button>
      <a :href="imovel.urlOficial" target="_blank" rel="noopener" class="btn-primary flex-1 text-center text-sm">
        Ver no site oficial ↗
      </a>
    </div>
    <div class="lg:hidden h-16"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import PropertyImage from '@/components/PropertyImage.vue'
import AffiliateCourseCard from '@/components/AffiliateCourseCard.vue'
import { useFavoritos } from '@/composables/useFavoritos'
import { useSeoHead, breadcrumbJsonLd } from '@/composables/useSeoHead'
import { useCatalogoStore } from '@/stores/catalogo'
import { dataService } from '@/services/dataService'
import type { Imovel } from '@/types'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon (broken with bundlers)
let leafletReady = false
async function initLeaflet() {
  if (leafletReady) return
  const markerIcon2x = (await import('leaflet/dist/images/marker-icon-2x.png')).default
  const markerIcon = (await import('leaflet/dist/images/marker-icon.png')).default
  const markerShadow = (await import('leaflet/dist/images/marker-shadow.png')).default
  L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })
  leafletReady = true
}

const props = defineProps<{ numero: string }>()
const store = useCatalogoStore()
const imovel = ref<Imovel | null>(null)
const loading = ref(true)
const mapEl = ref<HTMLElement>()
const fav = useFavoritos()
const analise = ref<{ valorM2: number; medianaM2: number; ratio: number; classificacao: 'sub' | 'normal' | 'sobre' } | null>(null)

const fmt = (v: number | null) => v ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'

const showShare = ref(false)
const linkCopiado = ref(false)

const shareText = computed(() => {
  if (!imovel.value) return ''
  const im = imovel.value
  return `${im.tipoImovel || 'Imóvel'} em ${im.cidade}/${im.uf} — R$ ${fmt(im.precoVenda)} (${(im.percentualDesconto ?? 0).toFixed(0)}% desconto)`
})
const shareUrl = computed(() => window.location.href)
const shareWhatsApp = computed(() => `https://wa.me/?text=${encodeURIComponent(shareText.value + '\n' + shareUrl.value)}`)
const shareTelegram = computed(() => `https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareText.value)}`)
const shareFacebook = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`)
const shareX = computed(() => `https://x.com/intent/tweet?text=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(shareUrl.value)}`)
const copyLink = async () => {
  await navigator.clipboard.writeText(shareUrl.value)
  linkCopiado.value = true
  setTimeout(() => { linkCopiado.value = false; showShare.value = false }, 1500)
}

const matriculaUrl = computed(() => {
  if (!imovel.value) return ''
  return `https://venda-imoveis.caixa.gov.br/editais/matricula/${imovel.value.uf}/${imovel.value.numeroImovel}.pdf`
})

// Análise Imovue computed
const precoM2 = computed(() => {
  if (!imovel.value?.precoVenda) return null
  const area = imovel.value.areaPrivativa || imovel.value.areaTerreno || imovel.value.areaTotal
  if (!area || area <= 0) return null
  return Math.round(imovel.value.precoVenda / area)
})

const custoAquisicao = computed(() => {
  if (!imovel.value?.precoVenda) return null
  const preco = imovel.value.precoVenda
  const itbi = preco * 0.03
  const escritura = preco * 0.02
  return { itbi, escritura, total: preco + itbi + escritura }
})

const score = ref(0)

const modalidadeExplicacao = computed(() => {
  const m = imovel.value?.modalidadeVenda || ''
  if (m.includes('Direta')) return 'Venda Direta — proposta direta à Caixa, sem disputa de lances'
  if (m.includes('Online')) return 'Venda Online — lances pela internet com prazo definido'
  if (m.includes('Licitação')) return 'Licitação Aberta — concorrência pública com envelopes de proposta'
  if (m.includes('Leilão')) return 'Leilão — arrematação pelo maior lance'
  return m || 'Consultar edital para detalhes da modalidade'
})

const ocupacaoExplicacao = computed(() => {
  const desc = imovel.value?.descricao?.toLowerCase() || ''
  if (desc.includes('desocupad')) return 'Imóvel desocupado — posse imediata após registro'
  if (desc.includes('ocupad')) return 'Imóvel ocupado — desocupação é responsabilidade do comprador (pode exigir ação judicial)'
  return 'Situação não informada — verificar no edital oficial'
})

onMounted(async () => {
  try {
    const uf = store.ufSelecionada
    if (uf) {
      imovel.value = (await dataService.detalhe(uf, props.numero)) ?? null
    }
    if (!imovel.value) {
      // Busca em todas as UFs se não achou na selecionada
      const ufs = await dataService.ufsDisponiveis()
      for (const u of ufs) {
        if (u === uf) continue
        const found = await dataService.detalhe(u, props.numero)
        if (found) { imovel.value = found; store.ufSelecionada = u; break }
      }
    }
  } finally { loading.value = false }
  if (imovel.value) {
    analise.value = await dataService.getAnalisePreco(imovel.value)
    const stats = await dataService.estatisticas(imovel.value.uf)
    score.value = dataService.calcScore(imovel.value, stats.precoMedio)
  }
})

watch(imovel, async (im) => {
  if (!im?.lat || !im?.lng) return
  await nextTick()
  if (!mapEl.value) return
  await initLeaflet()
  const map = L.map(mapEl.value).setView([im.lat, im.lng], 15)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
  L.marker([im.lat, im.lng]).addTo(map)
})
</script>
