<template>
  <div class="ratings-card">
    <div class="card-header">
      <h3 class="card-title">Рейтинги</h3>
    </div>
    
    <div class="ratings-list">
      <div 
        v-for="rating in ratings" 
        :key="rating.type" 
        class="rating-item"
        :class="{ active: rating.active }"
      >
        <div class="rating-icon">
          <img :src="rating.icon" :alt="rating.type" />
        </div>
        
        <div class="rating-info">
          <div class="rating-header">
            <span class="rating-type">{{ rating.name }}</span>
            <span class="rating-time">{{ rating.time }}</span>
          </div>
          <div class="rating-value">{{ rating.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useUserStore } from "@/store/userStore";
import bulletIcon from "@/assets/profile/bullet.svg";
import blitzIcon from "@/assets/profile/blitz.svg";
import rapidIcon from "@/assets/profile/rapid.svg";

const userStore = useUserStore();

const ratings = computed(() => [
  {
    type: "bullet",
    name: "Пуля",
    icon: bulletIcon,
    time: "1 мин",
    value: userStore.bulletRating,
    change: +12,
    active: true
  },
  {
    type: "blitz",
    name: "Блиц",
    icon: blitzIcon,
    time: "5 мин",
    value: userStore.blitzRating,
    change: -5,
    active: false
  },
  {
    type: "rapid",
    name: "Рапид",
    icon: rapidIcon,
    time: "10 мин",
    value: userStore.rapidRating,
    change: +24,
    active: false
  }
]);
</script>

<style scoped lang="less">
.ratings-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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

.ratings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rating-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: #f9fafb;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: #f3f4f6;
    transform: translateY(-1px);
  }
}

.rating-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  img {
    width: 28px;
    height: 28px;
    filter: invert(36%) sepia(79%) saturate(2000%) hue-rotate(202deg) brightness(95%) contrast(90%);
  }
}

.rating-info {
  flex: 1;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.rating-type {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.rating-time {
  font-size: 14px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
}

.rating-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.rating-change {
  font-size: 14px;
  font-weight: 600;
  
  &.positive {
    color: #10b981;
  }
  
  &.negative {
    color: #ef4444;
  }
}

@media (max-width: 768px) {
  .ratings-card {
    padding: 20px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>