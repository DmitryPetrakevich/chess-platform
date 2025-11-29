<template>
  <div class="profile-container">
    <aside class="sidebar">
      <h2 class="sidebar-title">Рейтинги</h2>
      <ul class="ratings-list">
        <li class="rating-item">
          <span class="rating-type">Пуля:</span>
          <span class="rating-value">{{ userStore.bulletRating }}</span>
        </li>
        <li class="rating-item">
          <span class="rating-type">Блиц:</span>
          <span class="rating-value">{{ userStore.blitzRating }}</span>
        </li>
        <li class="rating-item">
          <span class="rating-type">Рапид:</span>
          <span class="rating-value">{{ userStore.rapidRating }}</span>
        </li>
      </ul>
    </aside>

    <main class="main-content">
      <h1 class="title">Профиль игрока {{ userStore.username }}</h1>
    </main>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
</script>

<style scoped>
.profile-container {
  background: #2c2c2c;
  width: 100%;
  min-height: 100vh;
  display: flex;
  padding: 20px;
  color: #fff; 
}

.sidebar {
  width: 250px; 
  padding: 20px;
  background: #3a3a3a; 
  border-right: 1px solid #555;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #e74c3c; 
}

.ratings-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rating-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px;
  background: #4a4a4a; 
  border-radius: 4px;
}

.rating-type {
  font-weight: 500;
}

.rating-value {
  font-weight: 700;
  color: #e74c3c; 
}

.main-content {
  flex: 1; 
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title {
  color: #e74c3c;
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-align: center;
}
</style>