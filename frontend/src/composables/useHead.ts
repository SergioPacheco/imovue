import { onMounted } from 'vue'

export function useHead(title: string, description: string) {
  onMounted(() => {
    document.title = `${title} | Imovue`
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute('content', description)
    } else {
      const tag = document.createElement('meta')
      tag.name = 'description'
      tag.content = description
      document.head.appendChild(tag)
    }
  })
}
