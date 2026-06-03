import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/pages/user/HomePage.vue') },
    { path: '/imoveis', component: () => import('@/pages/user/ListagemPage.vue') },
    { path: '/imoveis/:numero', component: () => import('@/pages/user/DetalhePage.vue'), props: true },
    { path: '/mapa', component: () => import('@/pages/user/MapaPage.vue') },
    { path: '/dashboard', component: () => import('@/pages/user/DashboardPage.vue') },
    { path: '/favoritos', component: () => import('@/pages/user/FavoritosPage.vue') },
    { path: '/guia', component: () => import('@/pages/guia/GuiaPage.vue') },
    { path: '/aprenda-leilao-imoveis', component: () => import('@/pages/guia/AprendaPage.vue') },
    { path: '/aprenda/imovel-ocupado', component: () => import('@/pages/guia/riscos/OcupadoPage.vue') },
    { path: '/aprenda/debitos-condominio', component: () => import('@/pages/guia/riscos/CondominioPage.vue') },
    { path: '/aprenda/debitos-iptu', component: () => import('@/pages/guia/riscos/IptuPage.vue') },
    { path: '/aprenda/prazo-pagamento', component: () => import('@/pages/guia/riscos/PrazoPage.vue') },
    { path: '/aprenda/sem-visita-interna', component: () => import('@/pages/guia/riscos/VisitaPage.vue') },
    { path: '/aprenda/edital-regras', component: () => import('@/pages/guia/riscos/EditalPage.vue') },
    { path: '/aprenda/custos-cartorio-itbi', component: () => import('@/pages/guia/riscos/CustosPage.vue') },
    { path: '/aprenda/financiamento', component: () => import('@/pages/guia/riscos/FinanciamentoPage.vue') },
    { path: '/termos', component: () => import('@/pages/legal/TermosPage.vue') },
    { path: '/privacidade', component: () => import('@/pages/legal/PrivacidadePage.vue') },
    { path: '/admin', component: () => import('@/pages/admin/ImportacaoPage.vue') },
  ]
})

export default router
