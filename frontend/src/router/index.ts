import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() { return { top: 0 } },
  routes: [
    // Main pages
    { path: '/', component: () => import('@/pages/user/HomePage.vue') },
    { path: '/imoveis', component: () => import('@/pages/user/ListagemPage.vue') },
    { path: '/imovel/:numero', component: () => import('@/pages/user/DetalhePage.vue'), props: true },
    { path: '/mapa', component: () => import('@/pages/user/MapaPage.vue'), meta: { noindex: true, noAds: true } },
    { path: '/dashboard', component: () => import('@/pages/user/DashboardPage.vue'), meta: { noindex: true } },
    { path: '/favoritos', component: () => import('@/pages/user/FavoritosPage.vue'), meta: { noindex: true, noAds: true } },

    // SEO: Estado e Cidade
    { path: '/estado/:uf', component: () => import('@/pages/user/EstadoPage.vue'), props: true },
    { path: '/estado/:uf/:cidade', component: () => import('@/pages/user/CidadePage.vue'), props: true },

    // Redirect antiga rota de detalhe
    { path: '/imoveis/:numero', redirect: to => `/imovel/${to.params.numero}` },

    // Guias (editorial)
    { path: '/guias', component: () => import('@/pages/guia/GuiasIndexPage.vue') },
    { path: '/guias/:slug', component: () => import('@/pages/guia/GuiaPage.vue'), props: true },
    { path: '/guia', redirect: '/guias' },
    { path: '/aprenda-leilao-imoveis', redirect: '/guias' },
    { path: '/aprenda/imovel-ocupado', redirect: '/guias/riscos-imovel-ocupado' },
    { path: '/aprenda/debitos-condominio', redirect: '/guias/debitos-condominio-iptu' },
    { path: '/aprenda/debitos-iptu', redirect: '/guias/debitos-condominio-iptu' },
    { path: '/aprenda/prazo-pagamento', redirect: '/guias/como-comprar-imoveis-caixa' },
    { path: '/aprenda/sem-visita-interna', redirect: '/guias/como-analisar-edital' },
    { path: '/aprenda/edital-regras', redirect: '/guias/como-analisar-edital' },
    { path: '/aprenda/custos-cartorio-itbi', redirect: '/guias/como-calcular-itbi-escritura-registro' },
    { path: '/aprenda/financiamento', redirect: '/guias/como-funciona-financiamento' },

    // Institutional
    { path: '/sobre', component: () => import('@/pages/institucional/SobrePage.vue') },
    { path: '/contato', component: () => import('@/pages/institucional/ContatoPage.vue') },
    { path: '/metodologia', component: () => import('@/pages/institucional/MetodologiaPage.vue') },
    { path: '/fontes-dos-dados', component: () => import('@/pages/institucional/FontesPage.vue') },
    { path: '/politica-editorial', component: () => import('@/pages/institucional/PoliticaEditorialPage.vue') },

    // Legal
    { path: '/termos', component: () => import('@/pages/legal/TermosPage.vue') },
    { path: '/privacidade', component: () => import('@/pages/legal/PrivacidadePage.vue') },
    { path: '/aviso-legal', component: () => import('@/pages/legal/AvisoLegalPage.vue') },

    // 404
    { path: '/:pathMatch(.*)*', component: () => import('@/pages/NotFoundPage.vue'), meta: { noindex: true, noAds: true } },
  ]
})

export default router
