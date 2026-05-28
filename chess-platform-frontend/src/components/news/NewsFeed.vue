<template>
  <div class="news-section" id="news-section">
    <h2 class="news-section__title">Новости</h2>

    <Loader 
      v-if="newsStore.loading" 
      text="Загружаем новости..."
      size="middle"
    />
    <div v-else-if="newsStore.error" class="error">
      {{ newsStore.error }}
      <button 
      class="error-btn"
      @click="newsStore.fetchNews"
      >
      Повторить
    </button>
    </div>
    <div v-else-if="newsStore.news.length === 0" class="empty">Нет новостей</div>

    <div v-else class="news-carousel">
      <swiper
        :modules="modules"
        :slides-per-view="1"
        :space-between="20"
        :breakpoints="{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 30 }
        }"
        :navigation="true"
        :pagination="{ clickable: true }"
        :loop="false"
      >
        <swiper-slide v-for="item in newsStore.news" :key="item.link">
          <a
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            class="news-card"
          >
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

            <div class="news-content">
              <h3 class="news-title">{{ item.title }}</h3>
              <p class="news-date">{{ formatDate(item.pubDate) }}</p>
              <p class="news-snippet">{{ item.content.substring(0, 120) }}...</p>
            </div>
          </a>
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>

<script setup>
import { useNewsStore } from '@/store/newsStore'
import { onMounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'

import Loader from '@/UI/Loader.vue'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const newsStore = useNewsStore()
const modules = [Navigation, Pagination]

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

<style scoped lang="less">
.news-section {
  background: @black-800;
  border-radius: 16px; 
  border: 1px solid #444;
  box-sizing: border-box;
  width: 100%;
  padding: 10px;
  min-height: 250px;
}

.news-section__title {
  color: @text-light;
  font-size: 36px; 
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 10px; 
  font-weight: 600; 
  font-family: @font-heading;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: @green-600;
  background: rgba(0, 0, 0, 0.5);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  
  &::after {
    font-size: 20px;
  }
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
}

:deep(.swiper-pagination-bullet) {
  background: #888;
  
  &-active {
    background: @green-600;
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
  border: 1px solid #444; 
  height: 100%;
}

.news-card:hover {
  background: #3a3a3a;
  transform: translateY(-5px); 
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4); 
  border-color: #555; 
}

.news-image-container {
  width: 100%;
  height: 150px; 
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
  padding: 1rem; 
  flex-grow: 1; 
  display: flex;
  flex-direction: column; 
}

.swiper-slide {
  height: auto;
}

.news-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem; 
  font-weight: 600; 
  line-height: 1.4;
  color: #fff; 
  display: -webkit-box;
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-date {
  font-size: 0.8rem;
  color: #bdc3c7;
  margin-bottom: 0.5rem; 
  font-weight: 500; 
}

.news-snippet {
  font-size: 0.9rem; 
  color: #aaa;
  line-height: 1.4; 
  flex-grow: 1; 
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3; 
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.error {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background: rgba(231, 76, 60, 0.1); 
  border-radius: 8px;
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: @text-light;
  font-family: @font-main;
  padding: 20px;
}

.error-btn {
  padding: 15px 30px; 
  background-color: @blue-500;
  border: none;
  border-radius: 5px; 
  cursor: pointer;
  font-size: 1rem; 
  color: @text-light;
  font-family: @font-main;
  font-weight: 500; 
  transition: all 0.2s ease; 

  &:hover {
    background-color: @blue-600;
  }
}

@media (max-width: 768px) {
  .news-section__title {
    font-size: 30px; 
  }
  
  .news-carousel {
    padding: 10px 30px;
  }
}
</style>