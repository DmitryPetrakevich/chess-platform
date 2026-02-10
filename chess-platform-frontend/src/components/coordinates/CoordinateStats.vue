<template>
  <div class="stats">
    <div class="color-stat white">
      <div class="color-header">
        <span class="color-icon">⚪</span>
        <span class="color-name">Белые фигуры</span>
      </div>
      <div class="color-details">
        <div class="stat-row">
          <span class="stat-label">Сыграно игр:</span>
          <span class="stat-value">{{ coordinatesStore.whiteGamesCount }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Средний результат:</span>
          <span class="stat-value">{{ coordinatesStore.averageScoreWhite }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Рекорд::</span>
          <span class="stat-value">{{ coordinatesStore.bestScoreWhite }}</span>
        </div>
      </div>
    </div>
    
    <div class="color-stat black">
      <div class="color-header">
        <span class="color-icon">⚫</span>
        <span class="color-name">Чёрные фигуры</span>
      </div>
      <div class="color-details">
        <div class="stat-row">
          <span class="stat-label">Сыграно игр:</span>
          <span class="stat-value">{{ coordinatesStore.blackGamesCount }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Средний результат:</span>
          <span class="stat-value">{{ coordinatesStore.averageScoreBlack }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Рекорд:</span>
          <span class="stat-value">{{ coordinatesStore.bestScoreBlack }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCoordinatesStore } from '@/store/coordinatesStore';

const coordinatesStore = useCoordinatesStore();

</script>

<style scoped>
.stats {
  background: #2a2a2a;
  border-radius: 10px;
  color: white;
  font-family: 'Manrope', sans-serif;
}

.stats-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-align: center;
}

.color-stat {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
background-color: #454545;
}

.color-stat.white {
  border-left: 4px solid #ecf0f1;
}

.color-stat.black {
  border-left: 4px solid #2c3e50;
}

.color-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.color-icon {
  font-size: 24px;
}

.color-name {
  font-weight: 600;
  font-size: 16px;
}

.color-stat.white .color-name {
  color: #ecf0f1;
}

.color-stat.black .color-name {
  color: #ecf0f1;
}

.color-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #aaa;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
}

.color-stat.white .stat-value {
  color: #3498db;
}

.color-stat.black .stat-value {
  color: #e74c3c;
}
</style>