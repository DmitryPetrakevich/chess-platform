<template>
  <div class="board-wrapper">
    <div class="board">
      <div v-for="(row, rIndex) in squares" :key="rIndex" class="rank-row">
        <div
          v-for="cell in row"
          :key="cell.id"
          class="cell"
          :class="[cell.color, { selected: selectedSquare === cell.id }]"
          @click="onSquareClick(cell.id)"
        >
        <img v-if="pieceImage(cell.id)" :src="pieceImage(cell.id)" class="piece" />

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
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

const squares = computed(() =>
  ranks.map((rank, rIdx) =>
    files.map((file, fIdx) => {
      const color = (rIdx + fIdx) % 2 === 0 ? "light" : "dark";
      return { id: `${file}${rank}`, file, rank, color };
    })
  )
);

const pieces = ref({});

function setInitialPosition() {
  pieces.value = {
    a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR',
    a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
    a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
    a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR'
  };
}

setInitialPosition();

console.log('initial pieces:', pieces.value);

function pieceImage(squareId) {
  const code = pieces.value[squareId] // например "wP" или "bK"
  if (!code) return null;

  return new URL(`../assets/chess-pieces/${code}.svg`, import.meta.url).href;
}

const selectedSquare = ref(null) // хранит id выбранной клетки, например "e2"

function onSquareClick(id) {
  if(!selectedSquare.value && pieces.value[id]) {
    selectedSquare.value = id
    console.log("Фигура выбрана", id)
    return
  }

  if (selectedSquare.value && id === selectedSquare.value) {
    selectedSquare.value = null;
    console.log("Выбор отменён:", id);
    return;
  }

  if(selectedSquare.value) {
    const piece = pieces.value[selectedSquare.value] // например wN
    pieces.value[id] = piece

    delete pieces.value[selectedSquare.value];

    console.log(`Фигура ${piece} перемещена из ${selectedSquare.value} в ${id}`);

    selectedSquare.value = null;
  }
}
</script>

<style>
.board-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.board {
  display: inline-block;
  user-select: none;
}

.rank-row {
  display: flex;
  align-items: stretch;
}

.rank-label {
  width: clamp(20px, 4vw, 32px); /* цифры тоже адаптивные */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-left: 2px;
}

.cell {
  width: clamp(40px, 8vw, 64px);   /* клетка адаптивная */
  height: clamp(40px, 8vw, 64px);
  box-sizing: border-box;
  cursor: pointer;
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
  margin-top: 6px;
}

.file-label {
  width: clamp(40px, 8vw, 64px); /* ширина равна клетке */
  text-align: center;
  font-weight: 600;
}

.piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none; /* фигура не мешает клику */
}

</style>
