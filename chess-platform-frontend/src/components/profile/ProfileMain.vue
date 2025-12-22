<template>
  <div class="profile-header">
    <div class="profile-info">
      <div class="avatar-section">
        <div class="avatar">
          <span class="avatar-initial">{{ userInitial }}</span>
        </div>
      </div>
      
      <div class="user-details">
        <h1 class="username">{{ userStore.username }}</h1>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ totalGames }}</div>
            <div class="stat-label">Партий</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ winRate }}%</div>
            <div class="stat-label">Побед</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ streak }}</div>
            <div class="stat-label">Серия</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();

const userInitial = computed(() => {
  return userStore.username?.charAt(0).toUpperCase() || "U";
});

const totalGames = computed(() => 156); // Временно
const winRate = computed(() => 62); // Временно
const streak = computed(() => 3); // Временно
</script>

<style scoped lang="less">
.profile-header {
  margin-bottom: 10px;
}

.profile-info {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f2f5;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.avatar-initial {
  font-size: 48px;
  font-weight: 700;
  color: white;
}

.level-badge {
  background: #4ade80;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.user-title {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 25px 0;
}

.stats-grid {
  display: flex;
  gap: 40px;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .profile-info {
    // flex-direction: column;
    // align-items: center;
    // text-align: center;
  }
  
  .username {
    // font-size: 28px;
  }
  
  .stats-grid {
    // justify-content: center;
    // gap: 30px;
  }
}
</style>