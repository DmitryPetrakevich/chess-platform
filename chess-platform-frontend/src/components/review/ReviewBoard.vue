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
            {
              'last-move':
                props.lastMove.from === cell.id || props.lastMove.to === cell.id,  
            },
          ]"
        >
            <img
            v-if="pieces[cell.id]"
            :src="getPieceImage(pieces[cell.id])"
            class="piece"
            >

        </div>
        <div class="rank-label">{{ row[0].rank }}</div>
      </div>

      <div class="files-row">
        <div v-for="f in files" :key="f" class="file-label">{{ f }}</div>
        <div class="rank-label"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";

const props = defineProps({
  fen: {
    type: String,
    required: true,
  },
  lastMove: {
    type: Object,
    default: () => ({ from: null, to: null }),
  },
  flipped: {
    type: Boolean,
    default: false,
  },
});

const pieces = computed(() => {
  const result = {};
  if (!props.fen) return result;

  const rows = props.fen.split(" ")[0].split("/");
  let rank = 8;
  for (const row of rows) {
    let file = 0;
    for (const char of row) {
      if (/\d/.test(char)) {
        file += parseInt(char);
      } else {
        const square = String.fromCharCode(97 + file) + rank;
        const color = char === char.toUpperCase() ? "w" : "b";
        result[square] = color + char.toUpperCase();
        file++;
      }
    }
    rank--;
  }
  return result;
});

const files = computed(() => {
  const base = ["a", "b", "c", "d", "e", "f", "g", "h"];
  return props.flipped ? [...base].reverse() : base;
});

const ranks = computed(() => {
  const base = [1, 2, 3, 4, 5, 6, 7, 8];
  return props.flipped ? base : [...base].reverse();
});

const squares = computed(() =>
  ranks.value.map((rank) =>
    files.value.map((file) => ({
      id: `${file}${rank}`,
      color: (file.charCodeAt(0) - 97 + rank) % 2 === 0 ? "light" : "dark",
    })),
  ),
);

const isLastMove = (squareId) =>
  squareId === props.lastMove.from || squareId === props.lastMove.to;

const getPieceImage = (code) => {
  return new URL(`../../assets/icons/chess-pieces/${code}.svg`, import.meta.url)
    .href;
};
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
  max-width: min(85vh, 1500px);
  max-height: min(85vh, 1500px);
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(20px, 3vw, 30px);
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

/* .board.flipped {
  transform: rotate(180deg);
}

.board.flipped .piece,
.board.flipped .file-label,
.board.flipped .rank-label {
  transform: rotate(180deg);
} */

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
