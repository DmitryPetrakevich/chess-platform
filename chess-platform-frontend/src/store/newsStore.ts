import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNewsStore = defineStore('news', () => {
  const news = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchNews = async (force = false) => {
    const cached = localStorage.getItem('newsCache')
    if (cached && !force) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < 1800000) { // пол часа кэша
        news.value = data
        loading.value = false
        return
      }
    }

    loading.value = true
    error.value = null

    const sources = [
      { name: 'ФШР', url: 'https://ruchess.ru/news/feed/' },
      { name: 'Lichess Blog', url: 'https://lichess.org/blog.atom' }
    ]

    for (const source of sources) {
      try {
        console.log(`Пробуем: ${source.name} (${source.url})`)

        const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url='
        const response = await fetch(proxyUrl + encodeURIComponent(source.url), {
          signal: AbortSignal.timeout(8000)
        })

        if (!response.ok) continue

        const data = await response.json()

        if (data.status !== 'ok' || !data.items?.length) continue

        news.value = data.items
          .map((item: any) => {
            let thumbnail = ''
            const html = item.description || item.content || ''
            const imgMatch = html.match(/<img[^>]+src=["'](.*?)["']/i)
            if (imgMatch && imgMatch[1]) {
              thumbnail = imgMatch[1].replace(/&amp;/g, '&')
            }

            const cleanContent = html
              .replace(/<[^>]*>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .trim()

            return {
              title: item.title || 'Без заголовка',
              link: item.link || '#',
              pubDate: item.pubDate || item.published || '',
              content: cleanContent.substring(0, 120) +
              (cleanContent.length > 120 ? '...' : ''),
              thumbnail,
              source: source.name
            }
          })
          .filter(item => item.title && item.link)
          .slice(0, 6)

        if (news.value.length > 0) {
          localStorage.setItem('newsCache', JSON.stringify({
            data: news.value,
            timestamp: Date.now()
          }))

          break
        }
      } catch (err) {
        console.warn(`Источник ${source.name} ошибка:`, err)
        continue
      }
    }

    if (news.value.length === 0) {
      error.value = 'Не удалось загрузить новости'
    }

    loading.value = false
  }

  return {
    news,
    loading,
    error,
    fetchNews
  }
})