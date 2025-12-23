<template>
    <div class="game-replayer">
        <div class="replay-controls" v-if="gameStore.moveHistory.length > 0">
          <button 
          class="replayer-btn"
          @click="gameStore.goToMove(0)" 
          :disabled="gameStore.currentReplayIndex <= 0"
          >
            <img :src="goToStartIcon" class="replayer-img rev" />
          </button>
          <button 
          class="replayer-btn"
          @click="gameStore.goToMove(gameStore.currentReplayIndex - 1)" 
          :disabled="gameStore.currentReplayIndex <= 0"
          >
            <img :src="backMoveIcon" class="replayer-img rev" />
          </button>
          <button 
          class="replayer-btn"
          @click="gameStore.goToMove(gameStore.currentReplayIndex + 1)" 
          :disabled="gameStore.currentReplayIndex >= gameStore.moveHistory.length"
          >
            <img :src="nextMoveIcon" class="replayer-img" />
          </button>
          <button 
          class="replayer-btn"
          @click="gameStore.goToMove(gameStore.moveHistory.length)">
            <img :src="goToEndIcon" class="replayer-img" />
          </button>
        </div>
    </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useGameStore } from '@/store/gameStore';

import nextMoveIcon from '@/assets/forward.svg'
import goToEndIcon  from '@/assets/fast-forward.svg'
import backMoveIcon from '@/assets/forward.svg'
import goToStartIcon  from '@/assets/fast-forward.svg'

const gameStore = useGameStore();

function handleKeyDown(event) {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  const key = event.key.toLowerCase();

  const isPrev = key === 'a' || key === 'arrowleft' || key === 'ф';
  const isNext = key === 'd' || key === 'arrowright' || key === 'в';

  if (isPrev || isNext) {
    event.preventDefault(); 
    if (isPrev) {
      gameStore.goToMove(gameStore.currentReplayIndex - 1);
    } else {
      gameStore.goToMove(gameStore.currentReplayIndex + 1);
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});


</script>

<style scoped lang="less">
.replay-controls {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 20px;
    padding: 5px 0;
    background: @gray-50;
    border: 1px solid @gray-200;
}

.replayer-btn {
    display: block;
    box-sizing: border-box;
    border-radius: 5px;
    padding: 0 15px;
    border: none;
    background: none;
    transition: all 0.3s ease;

    &:hover {
        background-color: @gray-200;
    }
}

.replayer-img {
    height: 20px;
    width: 20px;

    &.rev {
        transform: rotate(180deg);
    }
}
</style>