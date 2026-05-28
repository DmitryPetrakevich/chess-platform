<template>
  <div class="play">
    <div class="play-content">
      <div class="engine-panel">
        <div class="eval">
          {{ formattedEvaluation }}
        </div>

        <div class="depth">
          Depth: {{ engine.depth }}
        </div>

        <div class="best-move">
          Best move: {{ engine.bestMove }}
        </div>
      </div>
      
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
import { ref, onMounted, onBeforeUnmount, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useGameStore } from '@/store/gameStore'
import { useEngineAnalysis } from '@/composables/useEngineAnalysis'

import ChessgroundReviewBoard from '@/components/game/ChessgroundReviewBoard.vue'
import ChessClock from '@/components/game/ChessClock.vue'

const route = useRoute()
const game = useGameStore()
const engine = useEngineAnalysis();

const gameId = computed(() => route.params.id as string)
// const currentFen = computed(() => game.chess.fen());
let analyzeTimeout: number;

const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

const formattedEvaluation = computed(() => {
  if (engine.evaluation.value == null) {
    return "0.0";
  }

  const value = engine.evaluation.value;

  return value > 0
    ? `+${value.toFixed(1)}`
    : value.toFixed(1);
});

onMounted(async () => {
  checkMobile()
  window.addEventListener("resize", checkMobile)

  if (gameId.value) {
    await game.loadFinishedGame(gameId.value)
  }
})

onMounted(async () => {
  engine.init();

  await new Promise<void>((resolve) => {
    const check = setInterval(() => {
      if (engine.isReady.value) {
        clearInterval(check);
        resolve();
      }
    }, 50);
  });

  engine.analyzePosition(game.chess.fen());
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobile)
})

watch(
  () => game.currentReplayIndex,
  async () => {
    clearTimeout(analyzeTimeout);

    analyzeTimeout = window.setTimeout(
      async () => {
        await nextTick();

        const fen = game.chess.fen();

        engine.analyzePosition(fen);
      },
      150
    );
  },
  { immediate: true }
);
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

.engine-panel {
  display: flex;
  align-items: center;
  position: absolute;
  right: 0;
  top: 100px;
  gap: 16px;

  padding: 20px 24px;

  background: #1e1e1e;
  border-radius: 12px;

  color: white;
}

.eval {
  font-size: 28px;
  font-weight: bold;
}

.depth,
.best-move {
  opacity: 0.8;
}
</style>