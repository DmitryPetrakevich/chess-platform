<template>
  <div class="board-wrapper">
    <div class="board">
      <div v-for="(row, rIndex) in squares" :key="rIndex" class="rank-row">
        <!-- Клетки доски -->
        <div
          v-for="cell in row"
          :key="cell.id"
          class="cell"
          :class="cell.color"
          @click="onSquareClick(cell.id)"
        ></div>
        <!-- Метка ряда справа -->
        <div class="rank-label">{{ row[0].rank }}</div>
      </div>

      <div class="files-row">
        <div v-for="f in files" :key="f" class="file-label">{{ f }}</div>
        <div class="rank-label"></div> <!-- Пустая ячейка для выравнивания -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

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

function onSquareClick(id) {
  console.log("square clicked:", id);
}
</script>

<style>
:root {
  --cell-size: clamp(40px, 8vw, 64px);
}

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
  width: calc(var(--cell-size) * 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  padding-left: 6px; /* ← Важное изменение */
}

.cell {
  width: var(--cell-size);
  height: var(--cell-size);
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
  width: var(--cell-size);
  text-align: center;
  font-weight: 600;
}
</style>
