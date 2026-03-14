<template>
  <div class="moves-history" aria-label="Moves history">
    <div class="moves-title">История ходов</div>
    <div class="moves-placeholder">
      <div class="moves-row" v-for="(row, index) in formattedMoves" :key="index">
        <div class="move-number">{{ index + 1 + "." }}</div>

        <div  class="move white"
          :class="{ active: isActive(row.whiteIndex) }"
          @click="selectMove(row.whiteIndex)"
          >
          {{ row.white }}
        </div>

        <div v-if="row.black"
          class="move black"
          :class="{ active: isActive(row.blackIndex) }"
          @click="selectMove(row.blackIndex)"
          >
          {{ row.black }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useGameStore } from "@/store/gameStore";
import { useReviewStore } from "@/store/reviewStore";

const gameStore = useGameStore();
const review = useReviewStore()

function selectMove(moveIndex) {
  if(moveIndex >= 0) {
    review.goToMove(moveIndex + 1);
  } else {
    review.goToStart();
  }
}

function isActive(moveIndex) {
  return review.currentMoveIndex > 0 && moveIndex === review.currentMoveIndex - 1;
}
/**
 * История ходов
 */
const formattedMoves = computed(() => {
  const moves = [];
  const list = review.currentGame?.moves || [];

  for(let i = 0; i < list.length; i += 2) {
    moves.push({
      white: list[i] || "",
      black: list[i + 1] || "",
      whiteIndex: i,
      blackIndex: i + 1,
    })
  }
  return moves;
})

function formatMove(m) {
  return m?.san || "";
}
</script>

<style scoped lang="less">
.moves-history {
  background: @gray-50;
  max-height: 70px;
  padding: 5px;
  border: 1px solid @gray-200;
  font-size: 13px;
  overflow-y: auto;
}

.moves-title {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 6px;
}
.moves-placeholder {
  color: @gray-700;
  font-size: 14px;
}

.moves-row {
  display: grid;
  grid-template-columns: 24px 1fr 1fr;
  gap: 6px;
  padding: 3px 4px;
  align-items: center;
  font-family: "Roboto Mono", monospace;
  cursor: default;
}

.move-number {
  color: @gray-700;
  text-align: left;
  font-weight: 700;
  padding-right: 4px;
  user-select: none;
}

.move {
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
}

.move:hover {
  background: @blue-100;
}

.move.active {
  background: @blue-300;
  font-weight: 700;
  color: white;
}

.move.empty {
  opacity: 0.3;
  pointer-events: none;
}
</style>