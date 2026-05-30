<template>
  <div class="profile-page">
    <div class="profile-container">
      <aside class="sidebar">
        <ProfileRatings />
      </aside>

      <main class="main-content">
        <ProfileMain />
        
        <div class="header">
          <button 
          class="header-btn"
          :class="{active: btn.id === activeBtn}"
          v-for="btn in btns"
          :key="btn.id"
          @click="activeBtn = btn.id"
          >
          {{ btn.label }}
        </button>
        </div>

        <div v-if="activeBtn == 1" class="games-stats">
          <button 
          class="games-stats-btn"
          :class="{active: activeStats === stat.value}"
          v-for="stat in gameStats"
          :key="stat.value"
          @click="activeStats = stat.value"
          >
          {{ stat.label }}

          </button>
        </div>

        <ProfileActivity :style="{marginTop: '10px'}" v-if="activeBtn === 0" />
        <ProfileGames 
        v-if="activeBtn === 1"
        :filter="activeStats" 
        @resetFilter="activeStats = 'all'"
         />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/store/userStore";

import ProfileRatings from "@/components/profile/ProfileRatings.vue";
import ProfileMain from "@/components/profile/ProfileMain.vue";
import ProfileGames from "@/components/profile/ProfileGames.vue";
import Button from "@/UI/Button.vue";
import ProfileActivity from "@/components/profile/ProfileActivity.vue";

const userStore = useUserStore();
const activeBtn = ref(1)
const activeStats = ref('all')

const btns = ref([
  {id: 0, label: "Активнгсть"},
  {id: 1, label: "Партиии"},
])

const gameStats = ref([
  {id: 0, label: "Все игры", value: 'all'},
  {id: 1, label: "Победы", value: 'wins'},
  {id: 2, label: "Поражения", value: 'loses'},
  {id: 3, label: "Ничьии", value: 'draws'},
])
</script>

<style scoped lang="less">
.profile-page {
  padding: 20px;
  min-height: 100vh;
  background-color: @black-900;
}

.profile-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 10px;
  min-height: calc(100vh - 60px);
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-section {
  flex: 1;
  min-height: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  // gap: 20px;
  background: @black-800;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  flex-direction: row;
  width: 100%;

  &-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 20px;
    width: 100%;
    font-size: 20px;
    background-color: @black-700;
    border: none;
    color: @text-light;
    transition: 0.2s all ease;

    &:hover {
      background-color: rgb(98, 98, 123);
    }

    &.active {
      background-color: @black-600;
    }
  }
}

.games-stats {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 20px;

  &-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    width: 100%;
    font-size: 16px;
    background-color: @black-700;
    border: none;
    color: @text-light;
    transition: 0.2s all ease;

    &:hover {
      background-color: rgb(98, 98, 123);
    }

    &.active {
      background-color: @black-600;
    }
  }

}

@media (max-width: 1100px) {
  .profile-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 0 10px;
  }
  
  .main-content {
    padding: 20px;
  }
}
</style>