<template>
  <div class="play">
    <div class="play-content">
      
      <div class="board-section">
        <ChessClock
          v-if="isMobile"
          class="mobile-clock mobile-clock-top"
          mode="top"
          :managePrestart="false"
          :reviewMode="true"
        />

        <ChessgroundReviewBoard />

        <ChessClock
          v-if="isMobile"
          class="mobile-clock mobile-clock-bottom"
          mode="bottom"
          :managePrestart="false"
          :reviewMode="true"
        />
      </div>

      <ChessClock 
        v-if="!isMobile"
        class="desktop-clock"
        mode="both"
        :managePrestart="false"
        :reviewMode="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGameStore } from '@/store/gameStore'

import ChessgroundReviewBoard from '@/components/game/ChessgroundReviewBoard.vue'
import ChessClock from '@/components/game/ChessClock.vue'

const route = useRoute()
const game = useGameStore()

const gameId = computed(() => route.params.id as string)

const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(async () => {
  checkMobile()
  window.addEventListener("resize", checkMobile)

  if (gameId.value) {
    await game.loadFinishedGame(gameId.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobile)
})
</script>

<style scoped lang="less">
.play {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0 20px;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
  background-color: @gray-200;
}

.play-content {
  display: flex;
  align-items: center;     
  justify-content: center; 
  width: 100%;
  max-width: 1200px;
}

.board-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

.desktop-clock {
  margin: auto 0;
  width: min(800px, 60%);
  max-width: 430px;
}

.mobile-clock {
  display: none;
}

@media (max-width: 768px) {
  .play {
    padding: 0 10px;
  }

  .play-content {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }

  .desktop-clock {
    display: none;
  }

  .board-section {
    max-width: 100%;
    width: 100%;
    padding: 0 8px;
    gap: 0;
  }

  .mobile-clock {
    display: block;
    width: 100%;
    max-width: 430px;
  }

  .mobile-clock-top {
    margin-bottom: 4px;
  }

  .mobile-clock-bottom {
    margin-top: 4px;
  }
}
</style>