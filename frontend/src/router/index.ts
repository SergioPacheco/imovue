import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/pages/user/HomePage.vue') },
    { path: '/imoveis', component: () => import('@/pages/user/ListagemPage.vue') },
    { path: '/imoveis/:numero', component: () => import('@/pages/user/DetalhePage.vue'), props: true },
    { path: '/dashboard', component: () => import('@/pages/user/DashboardPage.vue') },
    { path: '/favoritos', component: () => import('@/pages/user/FavoritosPage.vue') },
    { path: '/guia', component: () => import('@/pages/guia/GuiaPage.vue') },
    { path: '/admin', component: () => import('@/pages/admin/ImportacaoPage.vue') },
  ]
})

export default router
