<template>
  <div class="games-section">
    <div class="section-header">
      <h2 class="section-title">Последние партии</h2>
      <div class="section-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
    
    <div class="games-list">
      <!-- Плейсхолдер для будущих партий -->
      <div class="games-empty">
        <div class="empty-icon">♔</div>
        <h3 class="empty-title">Партии скоро появятся</h3>
        <p class="empty-description">
          Здесь будут отображаться ваши последние партии.<br>
          Начните играть, чтобы увидеть их здесь.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const activeTab = ref("all");

const tabs = [
  { id: "all", label: "Все" },
  { id: "blitz", label: "Блиц" },
  { id: "bullet", label: "Пуля" },
  { id: "rapid", label: "Рапид" }
];

const startGame = () => {
  router.push("/play");
};
</script>

<style scoped lang="less">
.games-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2f5;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.section-tabs {
  display: flex;
  gap: 8px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 12px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
  
  &.active {
    background: white;
    color: #1a1a1a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    font-weight: 600;
  }
}

.games-list {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.games-empty {
  text-align: center;
  max-width: 400px;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.empty-description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.play-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
}

/* Стили для будущих партий */
.game-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    transform: translateY(-1px);
  }
}

.game-result {
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  width: 80px;
  text-align: center;
  
  &.win {
    background: #d1fae5;
    color: #065f46;
  }
  
  &.loss {
    background: #fee2e2;
    color: #991b1b;
  }
  
  &.draw {
    background: #fef3c7;
    color: #92400e;
  }
}

.game-opponent {
  flex: 1;
  margin-left: 20px;
}

.opponent-name {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.opponent-rating {
  font-size: 14px;
  color: #6b7280;
}

.game-time,
.game-moves,
.game-date {
  font-size: 14px;
  color: #6b7280;
  width: 100px;
  text-align: center;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .section-tabs {
    width: 100%;
    justify-content: space-between;
  }
  
  .tab-btn {
    flex: 1;
    text-align: center;
  }
}
</style>