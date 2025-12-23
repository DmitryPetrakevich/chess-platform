<template>
  <div class="activity-card">
    <div class="card-header">
      <h3 class="card-title">Статистика</h3>
    </div>

    <div class="activity-stats" v-if="!loading && totalGames > 0">
      <!-- Общая статистика -->
      <div class="stats-overview">
        <div class="stat-item total-games">
          <div class="stat-value">{{ totalGames }}</div>
          <div class="stat-label">Всего игр</div>
        </div>
        
        <div class="stat-item win-rate">
          <div class="stat-value">{{ winRate }}%</div>
          <div class="stat-label">Побед</div>
        </div>
        
        <div class="stat-item current-streak">
          <div class="stat-value">{{ currentStreak }}</div>
          <div class="stat-label">Серия побед</div>
        </div>
      </div>

      <!-- Детальная статистика -->
      <div class="stats-details">
        <div class="stats-row">
          <div class="stat-type">
            <span class="stat-dot win"></span>
            <span>Победы</span>
          </div>
          <div class="stat-numbers">
            <span class="stat-count">{{ wins }}</span>
            <span class="stat-percentage">({{ winPercentage }}%)</span>
          </div>
        </div>
        
        <div class="stats-row">
          <div class="stat-type">
            <span class="stat-dot loss"></span>
            <span>Поражения</span>
          </div>
          <div class="stat-numbers">
            <span class="stat-count">{{ losses }}</span>
            <span class="stat-percentage">({{ lossPercentage }}%)</span>
          </div>
        </div>
        
        <div class="stats-row">
          <div class="stat-type">
            <span class="stat-dot draw"></span>
            <span>Ничьи</span>
          </div>
          <div class="stat-numbers">
            <span class="stat-count">{{ draws }}</span>
            <span class="stat-percentage">({{ drawPercentage }}%)</span>
          </div>
        </div>
      </div>

      <!-- График распределения -->
      <div class="stats-distribution">
        <div class="distribution-bar">
          <div 
            class="distribution-segment win" 
            :style="{ width: winPercentage + '%' }"
            :title="`Победы: ${winPercentage}%`"
          ></div>
          <div 
            class="distribution-segment draw" 
            :style="{ width: drawPercentage + '%' }"
            :title="`Ничьи: ${drawPercentage}%`"
          ></div>
          <div 
            class="distribution-segment loss" 
            :style="{ width: lossPercentage + '%' }"
            :title="`Поражения: ${lossPercentage}%`"
          ></div>
        </div>
        <div class="distribution-labels">
          <span>Победы {{ winPercentage }}%</span>
          <span>Ничьи {{ drawPercentage }}%</span>
          <span>Поражения {{ lossPercentage }}%</span>
        </div>
      </div>
    </div>

    <!-- Состояние загрузки -->
    <div v-else-if="loading" class="activity-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Загружаем статистику...</div>
    </div>

    <!-- Если нет игр -->
    <div v-else class="activity-empty">
      <div class="empty-icon">📊</div>
      <h4 class="empty-title">Нет статистики</h4>
      <p class="empty-description">
        Сыграйте несколько партий, чтобы увидеть свою статистику.
      </p>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const games = ref([]);
const loading = ref(true);

// Загружаем игры при монтировании
onMounted(() => {
  if (userStore.userId) {
    fetchGames();
  }
});

const fetchGames = async () => {
  loading.value = true;
  try {
    const response = await fetch(
      `http://localhost:3000/api/games?userId=${userStore.userId}`
    );
    if (response.ok) {
      games.value = await response.json();
    }
  } catch (err) {
    console.error("Ошибка загрузки статистики:", err);
  } finally {
    loading.value = false;
  }
};

// Вычисляемые свойства для статистики
const totalGames = computed(() => games.value.length);

const wins = computed(() => {
  return games.value.filter(game => {
    if (!game.result) return false;
    
    const result = game.result.toLowerCase();
    const isWhiteWin = result.includes('whitewin') || result.includes('1-0');
    const isBlackWin = result.includes('blackwin') || result.includes('0-1');
    
    if (isWhiteWin) return game.playerColor === 'white';
    if (isBlackWin) return game.playerColor === 'black';
    return false;
  }).length;
});

const losses = computed(() => {
  return games.value.filter(game => {
    if (!game.result) return false;
    
    const result = game.result.toLowerCase();
    const isWhiteWin = result.includes('whitewin') || result.includes('1-0');
    const isBlackWin = result.includes('blackwin') || result.includes('0-1');
    
    if (isWhiteWin) return game.playerColor === 'black';
    if (isBlackWin) return game.playerColor === 'white';
    return false;
  }).length;
});

const draws = computed(() => {
  return games.value.filter(game => {
    if (!game.result) return false;
    const result = game.result.toLowerCase();
    return result.includes('draw') || result.includes('1/2');
  }).length;
});

const winRate = computed(() => {
  if (totalGames.value === 0) return 0;
  return Math.round((wins.value / totalGames.value) * 100);
});

const winPercentage = computed(() => winRate.value);

const lossPercentage = computed(() => {
  if (totalGames.value === 0) return 0;
  return Math.round((losses.value / totalGames.value) * 100);
});

const drawPercentage = computed(() => {
  if (totalGames.value === 0) return 0;
  return Math.round((draws.value / totalGames.value) * 100);
});

// Текущая серия побед
const currentStreak = computed(() => {
  let streak = 0;
  
  // Сортируем игры по дате (последние первыми)
  const sortedGames = [...games.value].sort((a, b) => 
    new Date(b.date || 0) - new Date(a.date || 0)
  );
  
  for (const game of sortedGames) {
    if (!game.result) continue;
    
    const result = game.result.toLowerCase();
    const isWhiteWin = result.includes('whitewin') || result.includes('1-0');
    const isBlackWin = result.includes('blackwin') || result.includes('0-1');
    
    if (result.includes('draw') || result.includes('1/2')) {
      // Ничья прерывает серию
      break;
    }
    
    const isWin = (isWhiteWin && game.playerColor === 'white') ||
                  (isBlackWin && game.playerColor === 'black');
    
    if (isWin) {
      streak++;
    } else {
      break; // Поражение прерывает серию
    }
  }
  
  return streak;
});

// Функция для обновления статистики
const refreshStats = async () => {
  await fetchGames();
};

// Экспортируем метод для обновления извне
defineExpose({
  refreshStats
});
</script>

<style scoped lang="less">
.activity-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

/* Основная статистика */
.stats-overview {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f2f5;
}

.stat-item {
  text-align: center;
  flex: 1;
  
  .stat-value {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 4px;
    
    .total-games & {
      color: #3b82f6;
    }
    
    .win-rate & {
      color: #10b981;
    }
    
    .current-streak & {
      color: #f59e0b;
    }
  }
  
  .stat-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
  }
}

/* Детальная статистика */
.stats-details {
  margin-bottom: 24px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.stat-type {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #374151;
}

.stat-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  
  &.win {
    background: #10b981;
    border: 2px solid #a7f3d0;
  }
  
  &.loss {
    background: #ef4444;
    border: 2px solid #fecaca;
  }
  
  &.draw {
    background: #f59e0b;
    border: 2px solid #fde68a;
  }
}

.stat-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-count {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.stat-percentage {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* График распределения */
.stats-distribution {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f2f5;
}

.distribution-bar {
  height: 24px;
  border-radius: 12px;
  background: #f3f4f6;
  overflow: hidden;
  display: flex;
  margin-bottom: 12px;
}

.distribution-segment {
  height: 100%;
  transition: width 0.3s ease;
  
  &.win {
    background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  }
  
  &.loss {
    background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
  }
  
  &.draw {
    background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
  }
}

.distribution-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* Дополнительная информация */
.stats-extra {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.extra-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #f0f2f5;
}

.extra-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
  flex-shrink: 0;
}

.extra-content {
  flex: 1;
}

.extra-value {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.extra-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

/* Состояние загрузки */
.activity-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #6b7280;
  font-size: 14px;
}

/* Пустое состояние */
.activity-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .stats-overview {
    flex-direction: column;
    gap: 20px;
  }
  
  .stat-item {
    .stat-value {
      font-size: 28px;
    }
  }
  
  .stats-extra {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .activity-card {
    padding: 20px;
  }
  
  .stats-overview {
    margin-bottom: 20px;
    padding-bottom: 16px;
  }
  
  .stat-item {
    .stat-value {
      font-size: 24px;
    }
  }
  
  .stat-count {
    font-size: 16px;
  }
  
  .extra-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .activity-card {
    padding: 16px;
  }
  
  .card-title {
    font-size: 18px;
  }
  
  .stats-overview {
    flex-direction: column;
    gap: 16px;
  }
  
  .distribution-labels {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
}
</style>