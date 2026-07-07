<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="header-glass sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          <router-link to="/" class="flex items-center group">
            <svg class="h-14 w-auto" viewBox="0 0 155 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Telhado da casa grande -->
              <path d="M8 24L24 10L40 24" stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              <!-- Parede direita da casa -->
              <path d="M35 21V36H24" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              <!-- Lupa: círculo -->
              <circle cx="22" cy="30" r="9" stroke="#2563eb" stroke-width="3" fill="none"/>
              <!-- Lupa: preenchimento dourado -->
              <circle cx="22" cy="30" r="6.5" fill="#f59e0b" opacity="0.85"/>
              <!-- Casinha dentro da lupa -->
              <path d="M18.5 32V34H25.5V32L22 29Z" fill="white" stroke="white" stroke-width="0.5"/>
              <rect x="19.5" y="32" width="1.8" height="1.8" fill="white" opacity="0.9"/>
              <rect x="22.5" y="32" width="1.8" height="1.8" fill="white" opacity="0.9"/>
              <!-- Lupa: cabo -->
              <line x1="15" y1="37" x2="9" y2="43" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round"/>
              <!-- Texto: Imovue -->
              <text x="46" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800">
                <tspan fill="#1e3a5f">Imo</tspan><tspan fill="#f59e0b">vue</tspan>
              </text>
            </svg>
          </router-link>

          <!-- Desktop nav -->
          <nav class="hidden sm:flex items-center gap-1">
            <router-link to="/imoveis" class="nav-link">Imóveis</router-link>
            <router-link to="/dashboard" class="nav-link">Radar</router-link>
            <router-link to="/mapa" class="nav-link">Mapa</router-link>
            <router-link to="/guias" class="nav-link">Guia</router-link>
            <router-link to="/favoritos" class="nav-link relative p-2">
              <svg class="w-5 h-5" :fill="fav.count() > 0 ? '#ef4444' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <span v-if="fav.count() > 0" class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {{ fav.count() }}
              </span>
            </router-link>
          </nav>

          <!-- Mobile hamburger -->
          <button @click="menuOpen = !menuOpen" class="sm:hidden p-2 text-gray-600">
            <svg v-if="!menuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <nav v-show="menuOpen" class="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
        <router-link to="/imoveis" class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" @click="menuOpen = false">Imóveis</router-link>
        <router-link to="/dashboard" class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" @click="menuOpen = false">Radar</router-link>
        <router-link to="/mapa" class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" @click="menuOpen = false">Mapa</router-link>
        <router-link to="/guias" class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" @click="menuOpen = false">Guia</router-link>
        <router-link to="/favoritos" class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" @click="menuOpen = false">
          Favoritos <span v-if="fav.count() > 0" class="text-red-500 font-bold">({{ fav.count() }})</span>
        </router-link>
      </nav>
    </header>

    <!-- Content -->
    <main class="flex-1 relative z-0">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="footer-gradient mt-auto relative z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm mb-6">
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Imovue</h3>
            <ul class="space-y-1.5 text-gray-500">
              <li><router-link to="/sobre" class="footer-link">Sobre</router-link></li>
              <li><router-link to="/contato" class="footer-link">Contato</router-link></li>
              <li><router-link to="/metodologia" class="footer-link">Metodologia</router-link></li>
              <li><router-link to="/fontes-dos-dados" class="footer-link">Fontes dos dados</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Conteúdo</h3>
            <ul class="space-y-1.5 text-gray-500">
              <li><router-link to="/guias" class="footer-link">Guias</router-link></li>
              <li><router-link to="/imoveis" class="footer-link">Imóveis</router-link></li>
              <li><router-link to="/dashboard" class="footer-link">Radar</router-link></li>
              <li><router-link to="/politica-editorial" class="footer-link">Política editorial</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Legal</h3>
            <ul class="space-y-1.5 text-gray-500">
              <li><router-link to="/termos" class="footer-link">Termos de Uso</router-link></li>
              <li><router-link to="/privacidade" class="footer-link">Privacidade</router-link></li>
              <li><router-link to="/aviso-legal" class="footer-link">Aviso Legal</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Contato</h3>
            <p class="text-gray-500 text-xs">contato@imovue.com.br</p>
          </div>
        </div>
        <div class="border-t border-gray-200/60 pt-4 text-center">
          <p class="text-xs text-gray-400">Imovue — Plataforma de pesquisa e análise de imóveis da Caixa. Dados públicos. Não possui vínculo oficial com a CAIXA.</p>
        </div>
      </div>
    </footer>

    <!-- ChatBot -->
    <ChatBot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFavoritos } from '@/composables/useFavoritos'
import ChatBot from '@/components/ChatBot.vue'
const fav = useFavoritos()
const menuOpen = ref(false)
</script>
