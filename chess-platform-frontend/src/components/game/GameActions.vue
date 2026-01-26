<template>
  <div class="game-actions">
    <div class="game-actions__container">
      <div
        @click="onUndoClick()"
        class="action action-return"
        :class="{ active: clickCountUndo === 1 }"
      >
        <img :src="undoMoveIcon" class="action-img" />
      </div>

      <div
        @click="onDrawClick(gameStore.playerColor)"
        class="action action-draw"
        :class="{ active: clickCountDraw === 1 }"
      >
        <img :src="drawIcon" class="action-img" />
      </div>

      <div
        @click="onResignClick(gameStore.playerColor)"
        class="action action-resign"
        :class="{ active: clickCountResign === 1 }"
      >
        <img :src="resignIcon" class="action-img" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from "@/store/gameStore";
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

import undoMoveIcon from "@/assets/gameActions/undoMove.svg";
import drawIcon from "@/assets/gameActions/draw.svg";
import resignIcon from "@/assets/gameActions/resign.svg";

const gameStore = useGameStore();

const clickCountResign = ref(0);
const clickCountDraw = ref(0);
const clickCountUndo = ref(0);

function onDrawClick(playerColor) {
  if (gameStore.result.type) return;

  clickCountDraw.value += 1;

  if (!gameStore.result.type && clickCountDraw.value === 2) {
    gameStore.sendToServer("offer-draw", gameStore.playerColor);
    clickCountDraw.value = 0;
  }
}

function onResignClick(playerColor) {
  if (gameStore.result.type) return;

  clickCountResign.value += 1;

  if (!gameStore.result.type && clickCountResign.value === 2) {
    gameStore.endGame("give-up", playerColor === "w" ? "b" : "w");
    clickCountResign.value = 0;
  }
}

function onUndoClick() {
  if (gameStore.result?.type) return;

  if (!gameStore.moveHistory || gameStore.moveHistory.length === 0) {
    console.warn("moveHistory пустой — игнорируем клик");
    clickCountUndo.value = 0;
    return;
  }

  clickCountUndo.value += 1;

  if (!gameStore.result.type && clickCountUndo.value === 2) {
    gameStore.sendToServer("offer-undo");
    clickCountUndo.value = 0;
  }
}

function resetCounts() {
  clickCountResign.value = 0;
  clickCountDraw.value = 0;
  clickCountUndo.value = 0;
}

function onGlobalClick(event) {
  if (
    !event.target.closest(".action-draw") &&
    !event.target.closest(".action-resign") &&
    !event.target.closest(".action-return")
  ) {
    resetCounts();
  }
}

onMounted(() => {
  window.addEventListener("click", onGlobalClick);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", onGlobalClick);
});

watch(
  () => gameStore.result.type,
  () => {
    clickCountResign.value = 0;
    clickCountDraw.value = 0;
    clickCountUndo.value = 0;
  }
);
</script>

<style scoped lang="less">
.game-actions {
  display: flex;
  justify-content: center;
  align-self: center;
  border: 1px solid @gray-200;
  background-color: @gray-50;
  width: 100%;
}

.game-actions__container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  max-width: 300px;
  min-width: 250px;
  width: 100%;
  transition: background-color 0.9s;
}

.action {
  display: block;
  padding: 5px 30px;
  border-radius: 5px;

  &:hover {
    background-color: @gray-200;
  }
}

.action-img {
  width: 20px;
  height: 20px;
}

.action-resign.active,
.action-draw.active,
.action-return.active {
  background-color: @red-200;
}

@media (max-width: 480px) {
  .action {
    padding: 2px 30px;
  }

  .action-img {
    width: 15px;
    height: 15px;
  }
}
</style>
