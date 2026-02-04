<template>
  <div class="board-wrapper">
    <div class="board-container">
      <div 
        v-if="coordinatesStore.showCoordinatesOnBoard && coordinatesStore.targetSquare"
        class="coordinates-overlay"
      >
        <transition name="slide" mode="out-in">
          <div 
            :key="coordinatesStore.targetSquare"
            class="current-coordinate"
          >
            {{ coordinatesStore.targetSquare }}
          </div>
        </transition>

        <div 
          v-if="coordinatesStore.nextSquare"
          class="next-coordinate"
        >
          {{ coordinatesStore.nextSquare }}
        </div>
      </div>

      <div class="board">
        <div v-for="(row, rIndex) in squares" :key="rIndex" class="rank-row">
          <div 
            v-for="cell in row" 
            :key="cell.id" 
            class="cell"
            :class="cell.color"
            @click="handleCellClick(cell.id)"
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

function handleCellClick(squareId) {
  console.log('=== КЛИК ПО КЛЕТКЕ ===')
  console.log('Кликнули:', squareId)
  console.log('Текущая цель:', coordinatesStore.targetSquare)
  console.log('isActive:', coordinatesStore.isActive)
  
  if (coordinatesStore.isActive) {
    const isCorrect = coordinatesStore.checkClick(squareId)
    console.log('Правильно?', isCorrect)
    
    if (isCorrect) {
      console.log('Новая цель:', coordinatesStore.targetSquare)
      console.log('Счет:', coordinatesStore.score)
    }
  } else {
    console.log('Тренировка не активна')
  }
}
</script>

<style lang="less" scoped>
.board-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
}

.board-container {
  display: flex;
  box-sizing: border-box;
  position: relative;
  // width: 100%;
}

.board {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: min(85vh, 85vw, 800px);
  min-height: min(85vh, 85vw, 800px);
  box-sizing: border-box;

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
  position: relative;
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

.test {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

@media (max-width: 768px) {
  .coordinate-text {
    font-size: clamp(48px, 8vw, 100px); 
  }

  .next-coordinate {
    left: 50%;
    top: 70%; 
    transform: translateX(-50%);
  }
}

@media (max-width: 1100px) {
  .board-wrapper {
    align-self: center;
  }
}
 
.coordinates-overlay {
  position: absolute; 
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; 
  pointer-events: none;
}

.current-coordinate {
  font-size: clamp(64px, 10vw, 140px); 
  font-weight: 900; 
  color: #006400; 
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.7);
  font-family: 'Manrope', sans-serif;
  user-select: none;
  position: absolute;
  left: 40%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  pointer-events: none;
}

.next-coordinate {
  font-size: clamp(45px, 8vw, 68px); 
  font-weight: 600; 
  color: #006400; 
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.7);
  font-family: 'Manrope', sans-serif;
  user-select: none;
  position: absolute;
  left: 60%;
  top: 55%;
  transform: translateY(-50%);
  z-index: 1000;
  opacity: 0.8;
  pointer-events: none;
}

.slide-enter-active {
  animation: slideFromRight 0.1s ease-out;
}

@keyframes slideFromRight {
  0% {
    transform: translate(30%, -50%) scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}
</style>