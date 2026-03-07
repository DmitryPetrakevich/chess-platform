<template>
  <div class="review">
    <div class="review-content">
      <div class="board-section">
        <!-- <h1>Просмотр партии {{ id }}</h1> -->
        <pre v-if="currentGame" style="text-align: center;">{{currentGame }}</pre>
        <ReviewClock
          v-if="isMobile"
          class="mobile-clock mobile-clock-top"
          mode="top"
          :managePrestart="false"
          :id="id"
          :currentGame="currentGame"

        />

        <ReviewBoard 
          :fen="currentFen"
          :flipped="flipped"
        />

        <ReviewClock
          v-if="isMobile"
          class="mobile-clock mobile-clock-bottom"
          mode="bottom"
          :managePrestart="false"
          :id="id"
          :currentGame="currentGame"

        />
      </div>

      <ReviewClock 
        v-if="!isMobile"
        class="desktop-clock"
        mode="both"
        :managePrestart="false"
        :id="id"
        :currentGame="currentGame"

      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onUnmounted, defineProps, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";
import { useGames } from "@/composables/utils/useGames";
import { Chess } from "chess.js";

import ChessBoard from "@/components/game/ChessBoard.vue";
import ChessClock from "@/components/game/ChessClock.vue";
import GameReplayer from "@/components/game/GameReplayer.vue"; 
import ReviewClock from "@/components/review/ReviewClock.vue";
import ReviewBoard from "@/components/review/ReviewBoard.vue";

const props = defineProps({
  id: String
})

const game = useGameStore();
const user = useUserStore();
const route = useRoute();

const isMobile = ref(false)
const currentMoveIndex = ref(0);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const { 
  currentGame, 
  loadingGame, 
  gameError, 
  fetchGameById,
  clearCurrentGame 
} = useGames()

const currentFen = computed(() => {
  if (!currentGame.value) return undefined;
  
  if (currentMoveIndex.value === 0) {
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }
  
  const chess = new Chess();
  const movesToPlay = currentGame.value.moves.slice(0, currentMoveIndex.value);
  
  try {
    for (const move of movesToPlay) {
      chess.move(move);
    }
  } catch (e) {
    console.error('Ошибка при воспроизведении хода:', e);
  }
  
  return chess.fen();
});

const flipped = computed(() => {
  if(!currentGame.value || !user.userId) return false;

  return currentGame.value.blackUserId  === user.userId
})

watch(currentGame, (newGame) => {
  if (newGame && newGame.moves) {
    currentMoveIndex.value = newGame.moves.length;  // ← последний ход
    console.log('🏁 Установлен индекс на последний ход:', newGame.moves.length);
  }
});

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  if (props.id) {
    fetchGameById(props.id)
    
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

onUnmounted(() => {
  clearCurrentGame()
})
</script>

<style lang="less" scoped>
.review {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 20px;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
  background-color: @gray-200;

  &-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 1200px;
    gap: 24px;
  }

  &__replayer {
    width: 100%;
    max-width: 800px;
    margin-top: 24px;
  }
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
  .review {
    padding: 10px;

    &-content {
      flex-direction: column;
      gap: 0;
    }

    &__replayer {
      margin-top: 16px;
    }
  }

  .desktop-clock {
    display: none;
  }

  .board-section {
    max-width: 100%;
    width: 100%;
    padding: 0;
    gap: 0;
  }

  .mobile-clock {
    display: block;
    width: 100%;
    max-width: 430px;

    &-top {
      margin-bottom: 4px;
    }
    
    &-bottom {
      margin-top: 4px;
    }
  }
}
</style>