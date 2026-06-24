import { ref, onMounted } from 'vue'
import { dataService } from '@/services/dataService'
import type { Imovel } from '@/types'

interface UfStats {
  total: number
  precoMedio: number
  descontoMedio: number
  maiorDesconto: number
  financiaveis: number
  topCidades: { cidade: string; count: number }[]
}

export function useUfStats(uf: string) {
  const stats = ref<UfStats | null>(null)
  const loading = ref(true)

  onMounted(async () => {
    const [manifest, imoveis] = await Promise.all([
      dataService.getManifest(),
      dataService.listar(uf, { size: 99999 }),
    ])
    const all = imoveis.content as Imovel[]
    const entry = (manifest as any[]).find(e => e.uf === uf)

    const cidadeCount = new Map<string, number>()
    let financCount = 0
    let maxDesc = 0

    for (const im of all) {
      cidadeCount.set(im.cidade, (cidadeCount.get(im.cidade) || 0) + 1)
      if (im.financiamento === 'Sim') financCount++
      if ((im.percentualDesconto ?? 0) > maxDesc) maxDesc = im.percentualDesconto ?? 0
    }

    const topCidades = [...cidadeCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([cidade, count]) => ({ cidade, count }))

    stats.value = {
      total: entry?.total ?? all.length,
      precoMedio: entry?.precoMedio ?? 0,
      descontoMedio: entry?.descontoMedio ?? 0,
      maiorDesconto: Math.round(maxDesc),
      financiaveis: financCount,
      topCidades,
    }
    loading.value = false
  })

  return { stats, loading }
}
