<template>
  <article v-if="article">
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-200">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <router-link to="/guias" class="text-xs text-brand-500 hover:text-brand-600">← Todos os guias</router-link>
        <span class="text-xs text-gray-400 ml-2">{{ article.category }}</span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">{{ article.title }}</h1>
        <p class="text-gray-500 mt-2">{{ article.description }}</p>
        <div class="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span>Por {{ article.author }}</span>
          <span>•</span>
          <span>Atualizado em {{ formatDate(article.dateModified) }}</span>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 prose prose-gray prose-sm">
      <component :is="contentComponent" />
    </div>

    <!-- Related articles -->
    <div v-if="related.length" class="max-w-3xl mx-auto px-4 sm:px-6 pb-10">
      <h2 class="text-sm font-bold text-gray-900 mb-3">Artigos relacionados</h2>
      <div class="grid sm:grid-cols-2 gap-3">
        <router-link v-for="r in related" :key="r.slug" :to="`/guias/${r.slug}`"
          class="block p-3 rounded-lg border border-gray-100 hover:border-brand-200 transition-all">
          <div class="text-sm font-medium text-gray-900">{{ r.title }}</div>
          <div class="text-xs text-gray-500 mt-0.5">{{ r.category }}</div>
        </router-link>
      </div>
    </div>
  </article>

  <div v-else class="text-center py-20">
    <div class="text-5xl mb-4">📝</div>
    <h1 class="text-lg font-semibold text-gray-700">Artigo não encontrado</h1>
    <router-link to="/guias" class="btn-primary mt-4 inline-block">Ver todos os guias</router-link>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { getArticle, articles } from '@/data/articles'
import { useSeoHead, articleJsonLd, breadcrumbJsonLd } from '@/composables/useSeoHead'

const props = defineProps<{ slug: string }>()

const article = computed(() => getArticle(props.slug))

const related = computed(() => {
  if (!article.value) return []
  return articles.filter(a => a.slug !== props.slug && a.category === article.value!.category).slice(0, 4)
})

const contentComponent = computed(() => {
  if (!article.value) return null
  return defineAsyncComponent(() => import(`./conteudo/${props.slug}.vue`))
})

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

if (article.value) {
  useSeoHead({
    title: article.value.title,
    description: article.value.description,
    ogType: 'article',
    jsonLd: [
      articleJsonLd({
        title: article.value.title,
        description: article.value.description,
        url: `/guias/${props.slug}`,
        datePublished: article.value.datePublished,
        dateModified: article.value.dateModified,
      }),
      breadcrumbJsonLd([
        { name: 'Início', url: '/' },
        { name: 'Guias', url: '/guias' },
        { name: article.value.title, url: `/guias/${props.slug}` },
      ]),
    ],
  })
}
</script>
