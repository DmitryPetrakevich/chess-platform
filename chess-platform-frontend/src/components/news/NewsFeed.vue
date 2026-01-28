<template>
  <div class="news-section" id="news-section">
    <h2>Новости</h2>

    <!-- Добавил классы для стилизации состояний -->
    <div v-if="newsStore.loading" class="loading">Загрузка...</div>
    <div v-else-if="newsStore.error" class="error">
      {{ newsStore.error }}
      <button @click="newsStore.fetchNews">Повторить</button>
    </div>
    <div v-else-if="newsStore.news.length === 0" class="empty">Нет новостей</div>

    <!-- ИЗМЕНЕНО: news-list → news-grid для сетки -->
    <div v-else class="news-grid">
      <!-- ИЗМЕНЕНО: news-item → news-card для вертикальной карточки -->
      <a
        v-for="item in newsStore.news"
        :key="item.link"
        :href="item.link"
        target="_blank"
        rel="noopener noreferrer"
        class="news-card"
      >
        <!-- ИЗМЕНЕНО: news-preview → news-image-container для лучшего нейминга -->
        <div class="news-image-container">
          <img
            v-if="item.thumbnail"
            :src="item.thumbnail"
            alt="Новость"
            class="news-image"
            loading="lazy"
            @error="onImageError"
          />
          <div v-else class="no-image">Нет фото</div>
        </div>

        <!-- ИЗМЕНЕНО: news-text → news-content для вертикальной структуры -->
        <div class="news-content">
          <!-- ИЗМЕНЕНО: h3 → .news-title с классом -->
          <h3 class="news-title">{{ item.title }}</h3>
          <!-- ИЗМЕНЕНО: .date → .news-date -->
          <p class="news-date">{{ formatDate(item.pubDate) }}</p>
          <!-- ИЗМЕНЕНО: .snippet → .news-snippet -->
          <p class="news-snippet">{{ item.content.substring(0, 120) }}...</p>
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
  padding: 2rem; 
  max-width: 100%;
  background: #2a2a2a;
  border-radius: 16px; 
  border: 1px solid #444;
}

.news-section h2 {
  color: #ecf0f1;
  font-size: 36px; 
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 2rem; 
  font-weight: 600; 
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); 
  gap: 2rem; 
}

@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr; 
  }
}

.news-card {
  display: flex;
  flex-direction: column; 
  background: #333;
  border-radius: 12px; 
  overflow: hidden; 
  text-decoration: none;
  color: #ecf0f1;
  transition: all 0.3s ease; 
  height: 100%; 
  border: 1px solid #444; 
}

.news-card:hover {
  background: #3a3a3a;
  transform: translateY(-5px); 
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4); 
  border-color: #555; 
}

.news-image-container {
  width: 100%;
  height: 220px; 
  overflow: hidden;
  position: relative;
  background: #222;
}

.news-image {
  width: 100%;
  height: 100%;
  object-fit: cover; 
  transition: transform 0.5s ease; 
}

.news-card:hover .news-image {
  transform: scale(1.05); 
}

.no-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #444 0%, #2a2a2a 100%); 
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 1rem; 
  text-align: center;
  padding: 1rem; 
}


.news-content {
  padding: 1.5rem; 
  flex-grow: 1; 
  display: flex;
  flex-direction: column; 
}

.news-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.3rem; 
  font-weight: 600; 
  line-height: 1.4;
  color: #fff; 
  display: -webkit-box;
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-date {
  font-size: 0.9rem;
  color: #bdc3c7;
  margin-bottom: 1rem; 
  font-weight: 500; 
}

.news-snippet {
  font-size: 1rem; 
  color: #aaa;
  line-height: 1.5; 
  flex-grow: 1; 
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3; 
  -webkit-box-orient: vertical;
  overflow: hidden;
}


.loading, .error, .empty {
  text-align: center;
  padding: 3rem 2rem; 
  color: #bdc3c7;
  font-size: 1.1rem; 
}

.error {
  background: rgba(231, 76, 60, 0.1); 
  border-radius: 8px;
  border: 1px solid rgba(231, 76, 60, 0.3);
  padding: 2rem;
}

.error button {
  margin-top: 1.5rem; 
  padding: 0.8rem 1.5rem; 
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px; 
  cursor: pointer;
  font-size: 1rem; 
  font-weight: 500; 
  transition: background 0.2s; 
}

.error button:hover {
  background: #2980b9; 
}
</style>