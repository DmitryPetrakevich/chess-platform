<template>
  <div class="news-section" id="news-section">
    <h2>Новости</h2>

    <div v-if="newsStore.loading">Загрузка...</div>
    <div v-else-if="newsStore.error">
      {{ newsStore.error }}
      <button @click="newsStore.fetchNews">Повторить</button>
    </div>
    <div v-else-if="newsStore.news.length === 0">Нет новостей</div>

    <div v-else class="news-list">
      <a
        v-for="item in newsStore.news"
        :key="item.link"
        :href="item.link"
        target="_blank"
        rel="noopener noreferrer"
        class="news-item"
      >
        <div class="news-preview">
          <img
            v-if="item.thumbnail"
            :src="item.thumbnail"
            alt="Новость"
            class="news-thumbnail"
            loading="lazy"
            @error="onImageError"
          />
          <div v-else class="no-image">Нет фото</div>
        </div>

        <div class="news-text">
          <h3>{{ item.title }}</h3>
          <p class="date">{{ formatDate(item.pubDate) }}</p>
          <p class="snippet">{{ item.content.substring(0, 120) }}...</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { useNewsStore } from '@/store/newsStore'
import { onMounted } from 'vue'

const newsStore = useNewsStore()

onMounted(() => {
  newsStore.fetchNews()
})

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.news-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #444;
}

.news-section h2 {
  color: #ecf0f1;
  font-size: 32px;
  text-align: center;
}

.news-list {
  display: grid;
  gap: 1.2rem;
}

.news-item {
  display: flex;
  gap: 1.2rem;
  padding: 1rem;
  background: #333;
  border-radius: 8px;
  text-decoration: none;
  color: #ecf0f1;
  transition: all 0.2s;
}

.news-item:hover {
  background: #3a3a3a;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.3);
}

.news-preview {
  flex: 0 0 120px;
  height: 80px;
  overflow: hidden;
  border-radius: 6px;
  background: #222;
}

.news-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.no-image {
  width: 100%;
  height: 100%;
  background: #444;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 0.8rem;
  text-align: center;
}

.news-text {
  flex: 1;
}

.news-text h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
}

.date {
  font-size: 0.85rem;
  color: #bdc3c7;
  margin-bottom: 0.5rem;
}

.snippet {
  font-size: 0.9rem;
  color: #aaa;
  line-height: 1.4;
}

.loading, .error, .empty {
  text-align: center;
  padding: 2rem;
  color: #bdc3c7;
}

.error button {
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>