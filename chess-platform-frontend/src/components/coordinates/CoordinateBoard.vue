<template>
  <div class="board-wrapper">
    <div class="board-container">
      <div class="board">
        <div v-for="(row, rIndex) in squares" :key="rIndex" class="rank-row">
          <div 
            v-for="cell in row" 
            :key="cell.id" 
            class="cell"
            :class="cell.color"
          >
            <img 
              v-if="pieceImage(cell.id)" 
              :src="pieceImage(cell.id)" 
              class="piece" 
              :class="{ hidden: !coordinatesStore.showPieces }"
            />
          </div>
        </div>
        
        <div 
          class="files-bottom"
          :class="{ hidden: !coordinatesStore.showCoordinates }"
        >
          <div v-for="f in files" :key="f" class="file-label">{{ f }}</div>
        </div>
      </div>
      
      <div 
        class="ranks-side"
        :class="{ hidden: !coordinatesStore.showCoordinates }"
      >
        <div v-for="r in ranks" :key="r" class="rank-label">{{ r }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue" 
import { useCoordinatesStore } from "@/store/coordinatesStore"

const coordinatesStore = useCoordinatesStore()

const files = computed(() =>
  coordinatesStore.flipped ? ["h","g","f","e","d","c","b","a"] : ["a","b","c","d","e","f","g","h"]
)

const ranks = computed(() =>
  coordinatesStore.flipped ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1]
)

const squares = computed(() =>
  ranks.value.map((rank, rIdx) =>
    files.value.map((file, fIdx) => {
      const color = (rIdx + fIdx) % 2 === 0 ? "light" : "dark"
      return { id: `${file}${rank}`, file, rank, color }
    })
  )
)

function pieceImage(squareId) {
  const code = coordinatesStore.pieces[squareId] 
  if (!code) return null
  return new URL(`../../assets/chess-pieces/${code}.svg`, import.meta.url).href
}
</script>

<style lang="less" scoped>
.board-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  box-sizing: border-box;
}

.board-container {
  display: flex;
  width: 100%;
  max-width: min(85vh, 1500px);
  aspect-ratio: 1 / 1;
}

.board {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.rank-row {
  display: flex;
  flex: 1;
}

.cell {
  flex: 1;
  aspect-ratio: 1 / 1;
  position: relative;
  box-sizing: border-box;
}

.ranks-side {
  width: clamp(20px, 3vw, 30px);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  
  &.hidden {
    visibility: hidden;
    opacity: 0;
  }
}

.ranks-side .rank-label {
  text-align: center;
  font-family: 'Manrope', sans-serif;
  color: @gray-300;
  font-weight: 600;
  font-size: clamp(12px, 2vw, 16px);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.files-bottom {
  height: clamp(20px, 3vw, 30px);
  display: flex;
  
  &.hidden {
    visibility: hidden;
    opacity: 0;
  }
}

.files-bottom .file-label {
  flex: 1;
  text-align: center;
  font-family: 'Manrope', sans-serif;
  color: @gray-300;
  font-weight: 600;
  font-size: clamp(12px, 2vw, 16px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2px; 
  pointer-events: none;
  -webkit-touch-callout: none; 
  transition: visibility 0.2s, opacity 0.2s;

  &.hidden {
    visibility: hidden;
    opacity: 0;
  }
}

.cell.light {
  background: #f0d9b5;
}

.cell.dark {
  background: #b58863;
}

@media (max-width: 768px) {
  .board-wrapper {
    padding: 0;
  }
  
  .board-container {
    max-width: min(60vh, 600px);
  }
}
</style>