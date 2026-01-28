<template>
  <div class="board-wrapper">
    <div class="board">
      <div v-for="(row, rIndex) in squares" :key="rIndex" class="rank-row">
        <div 
          v-for="cell in row" 
          :key="cell.id" 
          class="cell"
          :class="[
            cell.color, 
            { selected: isSquareSelected(cell.id) },
            { highlighted: isSquareHighlighted(cell.id) },
            { 'last-move': game.lastMove.from === cell.id || game.lastMove.to === cell.id }
          ]"
          @click="squareClick.handleSquareClick(cell.id)"
          @dragover.prevent
          @drop="dragDrop.handleDrop(cell.id, $event)" 
        >
          <img v-if="pieceImage(cell.id)" 
            :src="pieceImage(cell.id)" 
            class="piece" 
            draggable="true"
            @dragstart="dragDrop.handleDragStart(cell.id, $event)" 
            @dragend="dragDrop.handleDragEnd"
          />
        </div>
        <div class="rank-label">
          {{ row[0].rank }}
        </div>
      </div>

      <div class="files-row">
        <div v-for="f in files" :key="f" class="file-label">{{ f }}</div>
        <div class="rank-label"></div>
      </div>
    </div>

    <PromotionModal 
      v-if="game.showPromotionModal && game.promotionMove"
      :color="game.promotionMove.piece[0]"
      @select="squareClick.handlePromotionSelect"
      @cancel="squareClick.handlePromotionCancel"
    />
  </div>
</template>

<script setup>
import { useGameStore } from "@/store/gameStore"
import { computed, ref, watch } from "vue" 
import { useSquareClick } from "@/composables/useSquareClick"
import { useDragAndDrop } from "@/composables/useDragAndDrop"
import PromotionModal from "./PromotionModal.vue"

const game = useGameStore()

const squareClick = useSquareClick()
const dragDrop = useDragAndDrop(squareClick)

const isSquareSelected = (id) => squareClick.selectedSquare.value === id
const isSquareHighlighted = (id) => squareClick.highlightedSquares.value.has(id)

const flipped = computed(() => game.playerColor === "b")

const files = computed(() =>
  flipped.value ? ["h","g","f","e","d","c","b","a"] : ["a","b","c","d","e","f","g","h"]
)

const ranks = computed(() =>
  flipped.value ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1]
)

const squares = computed(() =>
  ranks.value.map((rank, rIdx) =>
    files.value.map((file, fIdx) => {
      const color = (rIdx + fIdx) % 2 === 0 ? "light" : "dark"
      return { id: `${file}${rank}`, file, rank, color }
    })
  )
)

game.setInitialPosition()

function pieceImage(squareId) {
  const code = game.pieces[squareId] 
  if (!code) return null

  return new URL(`../../assets/chess-pieces/${code}.svg`, import.meta.url).href
}

watch(() => game.result.type, (newResult) => {
  if (newResult) {
    squareClick.resetSelection()
    dragDrop.resetDrag()
  }
})
</script>

<style>
.board-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.board {
  display: inline-block;
  user-select: none;
  max-width: min(80vh, 1500px);
  max-height: min(80vh, 1500px);
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1; 
}

.rank-row {
  display: flex;
  align-items: stretch;
  height: calc(100% / 8); 
}

.cell {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  cursor: pointer;
  flex: 1;
  aspect-ratio: 1 / 1;
}

.rank-label {
  width: clamp(20px, 3vw, 30px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-left: 2px;
  font-size: clamp(12px, 2vw, 16px);
}

.file-label {
  width: 100%;
  text-align: center;
  font-weight: 600;
  font-size: clamp(12px, 2vw, 16px);
  height: clamp(20px, 3vw, 30px);
}

.piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2px; 
}

.cell.light {
  background: #f0d9b5;
}

.cell.dark {
  background: #b58863;
}

.files-row {
  display: flex;
  align-items: center;
  height: clamp(20px, 3vw, 30px);
}

.cell.highlighted {
  position: relative; 
}

.cell.highlighted::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30%;          
  height: 30%;
  background: rgba(136, 168, 136, 0.4); 
  border-radius: 50%;  
  transform: translate(-50%, -50%); 
  pointer-events: none; 
  z-index: 1;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
}

.cell.dark.highlighted::after {
  background: rgba(180, 200, 180, 0.45); 
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.549);
}

.cell.selected {
  box-sizing: border-box;
  background-color: rgba(67, 94, 67, 0.4);
}

.cell.selected.highlighted {
  background: inherit !important;
}

.cell.last-move {
  background: rgba(255, 255, 0, 0.435) !important; 
}

.board.flipped {
  transform: rotate(180deg);
}

.board.flipped .piece,
.board.flipped .file-label,
.board.flipped .rank-label {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .board-wrapper {
    padding: 0;
  }

  .board {
    max-width: min(60vh, 600px);
    max-height: min(60vh, 600px);
}
}
</style>