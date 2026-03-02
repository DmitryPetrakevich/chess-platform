<template>
  <div class="mini-board" :style="{ width: size + 'px', height: size + 'px' }">
    <div v-for="(row, rankIndex) in 8" :key="rankIndex" class="rank">
      <div 
        v-for="(fileIndex) in 8" 
        :key="fileIndex" 
        class="square"
        :class="getSquareClass(fileIndex - 1, 8 - rankIndex)"
      >
        <img 
          v-if="boardPieces[getSquareName(fileIndex - 1, 8 - rankIndex)]"
          :src="getPieceImage(boardPieces[getSquareName(fileIndex - 1, 8 - rankIndex)])"
          class="piece"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  fen: { type: String, required: true },
  size: { type: Number, default: 140 }
});

const boardPieces = computed(() => {
  const pieces = {};
  const [position] = props.fen.split(' '); // берём только позицию
  const rows = position.split('/');

  let rank = 8;
  for (const row of rows) {
    let file = 0;
    for (const char of row) {
      if (/\d/.test(char)) {
        file += Number(char);
      } else {
        const square = `${String.fromCharCode(97 + file)}${rank}`;
        pieces[square] = char;
        file++;
      }
    }
    rank--;
  }
  return pieces;
});

function getSquareName(file, rank) {
  return `${String.fromCharCode(97 + file)}${rank}`;
}

function getSquareClass(file, rank) {
  return (file + rank) % 2 === 0 ? 'light' : 'dark';
}

function getPieceImage(piece) {
  const map = {
    'P': 'wP', 'N': 'wN', 'B': 'wB', 'R': 'wR', 'Q': 'wQ', 'K': 'wK',
    'p': 'bP', 'n': 'bN', 'b': 'bB', 'r': 'bR', 'q': 'bQ', 'k': 'bK'
  };
  
  const pieceCode = map[piece];
  if (!pieceCode) return ''; 

  return new URL(`../../assets/icons/chess-pieces/${pieceCode}.svg`, import.meta.url).href;
}
</script>

<style scoped>
.mini-board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  border: 2px solid #444;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.rank {
  display: contents;
}

.square {
  aspect-ratio: 1;
  background: #f0d9b5;
  position: relative;
}

.square.dark {
  background: #b58863;
}

.piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  inset: 0;
}
</style>