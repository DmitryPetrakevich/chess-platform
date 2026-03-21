import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchNewsFromRSS } from '@/api/news'

export const useNewsStore = defineStore('news', () => {
  const news = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchNews = async (force = false) => {
    // Проверяем кэш
    const cached = localStorage.getItem('newsCache')
    if (cached && !force) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < 1800000) { // 30 минут
        news.value = data
        loading.value = false
        return
      }
    }

    loading.value = true
    error.value = null

    try {
      const items = await fetchNewsFromRSS()
      
      if (items.length > 0) {
        news.value = items
        localStorage.setItem('newsCache', JSON.stringify({
          data: items,
          timestamp: Date.now()
        }))
      } else {
        error.value = 'Не удалось загрузить новости'
      }
    } catch (err) {
      console.error('Ошибка загрузки новостей:', err)
      error.value = 'Не удалось загрузить новости'
    } finally {
      loading.value = false
    }
  }

  return {
    news,
    loading,
    error,
    fetchNews
  }
})