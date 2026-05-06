<template>
  <div ref="boardEl" class="chessground-board"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Chessground } from 'chessground'
import { useGameStore } from '@/store/gameStore'

const game = useGameStore()

const boardEl = ref<HTMLElement | null>(null)
let chessground: any = null

function getOrientation() {
  return game.playerColor === 'b' ? 'black' : 'white'
}

function getLastMove() {
  if (game.lastMove?.from && game.lastMove?.to) {
    return [game.lastMove.from, game.lastMove.to]
  }
  return undefined
}

function syncBoard() {
  if (!chessground) return

  chessground.set({
    fen: game.fen,
    orientation: getOrientation(),
    turnColor: game.currentTurn === 'w' ? 'white' : 'black',
    lastMove: getLastMove(),
    check: isCheck() ? getTurnColor() : undefined,
    movable: { color: undefined },   
    draggable: { enabled: false }
  })
}

async function initBoard() {
  if (chessground || !boardEl.value) return

  await nextTick()

  chessground = Chessground(boardEl.value, {
    fen: game.fen,
    orientation: getOrientation(),
    movable: { color: undefined },
    draggable: { enabled: false },
    highlight: { lastMove: true, check: true },
    animation: { enabled: true, duration: 200 }
  })

  syncBoard()
}

function getTurnColor() {
  return game.currentTurn === "w" ? "white" : "black";
}

function isCheck() {
  return game.chess.inCheck();
}

onMounted(initBoard)

watch(
  () => [game.fen, game.lastMove, game.currentReplayIndex],
  syncBoard,
  { flush: 'post' }
)

onBeforeUnmount(() => {
  if (chessground) {
    chessground.destroy()
    chessground = null
  }
})
</script>

<style scoped>
.chessground-board {
  width: 100%;
  max-width: 650px;
  aspect-ratio: 1 / 1;
}
</style>