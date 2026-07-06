<template>
  <div v-if="affiliateUrl" class="affiliate-banner" :class="variantClass">
    <!-- Decoração de fundo -->
    <div class="banner-bg-pattern"></div>
    <div class="banner-glow"></div>

    <!-- Conteúdo -->
    <div class="relative z-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
      <!-- Ícone/badge lateral -->
      <div class="banner-icon-box">
        <span class="text-3xl">🎓</span>
        <div class="icon-ring"></div>
      </div>

      <!-- Texto -->
      <div class="flex-1 text-center sm:text-left">
        <h3 class="banner-title">{{ title }}</h3>
        <p class="banner-desc">{{ description }}</p>
      </div>

      <!-- CTA -->
      <div class="shrink-0 flex flex-col items-center sm:items-end">
        <a :href="affiliateUrl" target="_blank" rel="nofollow sponsored noopener" class="banner-cta">
          <span class="relative z-10">{{ buttonText }}</span>
          <span class="cta-shimmer"></span>
        </a>
        <p class="text-[10px] text-white/40 mt-2 max-w-[220px] text-center sm:text-right leading-tight">{{ AFFILIATE_CONFIG.disclosure }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AFFILIATE_CONFIG } from '@/config/affiliate'

const props = withDefaults(defineProps<{
  variant?: 'top' | 'compact' | 'sidebar' | 'afterList'
  title?: string
  description?: string
  buttonText?: string
  affiliateUrl?: string
}>(), {
  variant: 'afterList',
  title: 'Novo em leilão da Caixa?',
  description: 'Aprenda a analisar editais, calcular custos ocultos e evitar armadilhas antes de dar seu primeiro lance.',
  buttonText: 'Quero aprender →',
  affiliateUrl: AFFILIATE_CONFIG.courseUrl,
})

const variantClass = computed(() => {
  if (props.variant === 'compact') return 'banner-compact'
  return ''
})
</script>

<style scoped>
.affiliate-banner {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  padding: 28px 32px;
  background: linear-gradient(135deg, #0a2040 0%, #1e3a5f 40%, #1e56a0 100%);
  box-shadow:
    0 12px 40px -10px rgba(10, 32, 64, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.affiliate-banner.banner-compact {
  padding: 20px 24px;
}

/* Padrão de fundo sutil */
.banner-bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.06;
  background-image:
    radial-gradient(circle at 20% 80%, white 1px, transparent 1px),
    radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
    radial-gradient(circle at 50% 50%, white 1px, transparent 1px);
  background-size: 60px 60px, 80px 80px, 40px 40px;
  pointer-events: none;
}

/* Glow decorativo */
.banner-glow {
  position: absolute;
  top: -30%;
  right: -10%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.3), transparent 65%);
  pointer-events: none;
  filter: blur(40px);
}

/* Ícone box */
.banner-icon-box {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-compact .banner-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.icon-ring {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  border: 1px solid rgba(96, 165, 250, 0.2);
  animation: ringPulse 3s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.06); }
}

/* Texto */
.banner-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.01em;
}

.banner-compact .banner-title {
  font-size: 0.95rem;
}

.banner-desc {
  margin-top: 6px;
  font-size: 0.85rem;
  color: rgba(191, 219, 254, 0.8);
  line-height: 1.5;
  max-width: 380px;
}

.banner-compact .banner-desc {
  font-size: 0.78rem;
  max-width: 320px;
}

/* Botão CTA */
.banner-cta {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  color: #0a2040;
  background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%);
  box-shadow:
    0 6px 20px -4px rgba(96, 165, 250, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  border: none;
}

.banner-compact .banner-cta {
  padding: 10px 20px;
  font-size: 13px;
}

.banner-cta:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 30px -4px rgba(96, 165, 250, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.banner-cta:active {
  transform: translateY(0);
}

/* Shimmer no CTA */
.cta-shimmer {
  position: absolute;
  top: 0;
  left: -130%;
  width: 60%;
  height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  transform: skewX(-18deg);
  animation: ctaShimmer 3.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes ctaShimmer {
  0%, 100% { left: -130%; }
  50% { left: 130%; }
}

/* Responsivo */
@media (max-width: 640px) {
  .affiliate-banner {
    padding: 24px 20px;
  }
  .banner-glow {
    width: 200px;
    height: 200px;
    top: -20%;
    right: -15%;
  }
}
</style>
