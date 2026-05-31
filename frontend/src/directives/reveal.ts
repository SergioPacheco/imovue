import type { Directive } from 'vue'

export const vReveal: Directive = {
  mounted(el: HTMLElement, binding) {
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    el.style.transition = `opacity 0.6s ease, transform 0.6s ease`
    el.style.transitionDelay = (binding.value ?? 0) + 'ms'

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        observer.disconnect()
      }
    }, { threshold: 0.1 })

    observer.observe(el)
  }
}
